import { NextRequest, NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from '@/lib/auth/middleware';
import { getBooksDb, queryOne, query, execute } from '@/lib/db/turso';
import { synthesizeWithEdgeTTS } from '@/lib/tts/edge-tts';
import { uploadImage } from '@/lib/storage/gcs';

interface BookRow { id: string; user_id: string; title: string }
interface PageRow { id: string; text: string; page_number: number; audio_url: string | null }

async function handler(
  req: AuthenticatedRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  const { id: bookId } = await params;
  const userId = req.user?.userId;

  if (!userId) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  const db = getBooksDb();

  const book = await queryOne<BookRow>(db, 'SELECT id, user_id, title FROM books WHERE id = ?', [bookId]);
  if (!book || book.user_id !== userId) {
    return NextResponse.json({ error: 'Book not found' }, { status: 404 });
  }

  const pages = await query<PageRow>(
    db,
    "SELECT id, text_content as text, page_number, audio_url FROM book_pages WHERE book_id = ? AND text_content IS NOT NULL AND text_content != '' AND (audio_url IS NULL OR audio_url = '') ORDER BY page_number",
    [bookId]
  );

  if (pages.length === 0) {
    return NextResponse.json({ success: true, message: 'All pages already have audio', generated: 0 });
  }

  const body = await req.json().catch(() => ({}));
  const voice = body.voice || 'en-US-JennyNeural';
  const rate = body.rate || 0.9;

  const results: { pageId: string; pageNumber: number; audioUrl: string; duration: number }[] = [];
  const errors: { pageId: string; error: string }[] = [];

  for (const page of pages) {
    try {
      const { audioData, duration } = await synthesizeWithEdgeTTS(page.text, {
        voice,
        rate,
        format: 'MP3_MEDIUM',
      });

      const audioPath = `books/${bookId}/audio/page-${page.id}.mp3`;
      const { publicUrl } = await uploadImage(audioData, audioPath, { contentType: 'audio/mpeg' });

      await execute(db, 'UPDATE book_pages SET audio_url = ?, audio_duration = ? WHERE id = ?', [
        publicUrl,
        Math.round(duration),
        page.id,
      ]);

      results.push({
        pageId: page.id,
        pageNumber: page.page_number,
        audioUrl: publicUrl,
        duration: Math.round(duration),
      });
    } catch (err) {
      errors.push({
        pageId: page.id,
        error: err instanceof Error ? err.message : 'Unknown error',
      });
    }
  }

  return NextResponse.json({
    success: true,
    generated: results.length,
    failed: errors.length,
    results,
    errors: errors.length > 0 ? errors : undefined,
    voice,
  });
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  return withAuth(request, (req) => handler(req, context));
}
