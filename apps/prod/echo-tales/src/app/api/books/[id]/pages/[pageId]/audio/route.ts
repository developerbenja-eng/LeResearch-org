import { NextRequest, NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from '@/lib/auth/middleware';
import { getBooksDb, queryOne, execute } from '@/lib/db/turso';
import { synthesizeWithEdgeTTS } from '@/lib/tts/edge-tts';
import { uploadImage } from '@/lib/storage/gcs';

interface BookRow { id: string; user_id: string }
interface PageRow { id: string; text: string; page_number: number; audio_url: string | null }

async function handler(
  req: AuthenticatedRequest,
  { params }: { params: Promise<{ id: string; pageId: string }> }
): Promise<NextResponse> {
  const { id: bookId, pageId } = await params;
  const userId = req.user?.userId;

  if (!userId) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  const db = getBooksDb();

  const book = await queryOne<BookRow>(db, 'SELECT id, user_id FROM books WHERE id = ?', [bookId]);
  if (!book || book.user_id !== userId) {
    return NextResponse.json({ error: 'Book not found' }, { status: 404 });
  }

  const page = await queryOne<PageRow>(db, 'SELECT id, text_content as text, page_number, audio_url FROM book_pages WHERE id = ? AND book_id = ?', [pageId, bookId]);
  if (!page) {
    return NextResponse.json({ error: 'Page not found' }, { status: 404 });
  }

  if (!page.text || page.text.trim().length === 0) {
    return NextResponse.json({ error: 'Page has no text to narrate' }, { status: 400 });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const voice = body.voice || 'en-US-JennyNeural';
    const rate = body.rate || 0.9;

    const { audioData, duration } = await synthesizeWithEdgeTTS(page.text, {
      voice,
      rate,
      format: 'MP3_MEDIUM',
    });

    const audioPath = `books/${bookId}/audio/page-${pageId}.mp3`;
    const { publicUrl } = await uploadImage(audioData, audioPath, { contentType: 'audio/mpeg' });

    await execute(db, 'UPDATE book_pages SET audio_url = ?, audio_duration = ? WHERE id = ?', [
      publicUrl,
      Math.round(duration),
      pageId,
    ]);

    return NextResponse.json({
      success: true,
      audio_url: publicUrl,
      audio_duration: Math.round(duration),
      voice,
    });
  } catch (err) {
    console.error('[Book Audio] Generation failed:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Audio generation failed' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string; pageId: string }> }
): Promise<NextResponse> {
  return withAuth(request, (req) => handler(req, context));
}
