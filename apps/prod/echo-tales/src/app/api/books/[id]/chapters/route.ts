/**
 * API Routes for Book Chapters
 * GET /api/books/[id]/chapters - Get all chapters for a book
 */

import { NextRequest, NextResponse } from 'next/server';
import { getChaptersByBookId, getBookById } from '@/lib/books/db';
import { withOptionalAuth, OptionalAuthRequest } from '@/lib/auth/middleware';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withOptionalAuth(request, async (req: OptionalAuthRequest) => {
    try {
      const { id: bookId } = await params;

      // Verify book exists and check access
      const book = await getBookById(bookId);
      if (!book) {
        return NextResponse.json(
          { success: false, error: 'Book not found' },
          { status: 404 }
        );
      }

      const bookRecord = book as unknown as Record<string, unknown>;
      const isOwner = req.user && bookRecord.user_id === req.user.userId;
      const isPublic = bookRecord.is_public === 1 || bookRecord.status === 'published';

      if (!isOwner && !isPublic) {
        return NextResponse.json(
          { success: false, error: 'Book not found' },
          { status: 404 }
        );
      }

      const chapters = await getChaptersByBookId(bookId);

      // Parse JSON fields
      const chaptersWithParsed = chapters.map((chapter) => ({
        ...chapter,
        key_points: chapter.key_points ? JSON.parse(chapter.key_points) : [],
        key_quotes: chapter.key_quotes ? JSON.parse(chapter.key_quotes) : [],
        discussion_questions: chapter.discussion_questions ? JSON.parse(chapter.discussion_questions) : [],
        learning_objectives: chapter.learning_objectives ? JSON.parse(chapter.learning_objectives) : [],
        new_concepts: chapter.new_concepts ? JSON.parse(chapter.new_concepts) : [],
        concepts_reviewed: chapter.concepts_reviewed ? JSON.parse(chapter.concepts_reviewed) : [],
        prerequisite_chapters: chapter.prerequisite_chapters ? JSON.parse(chapter.prerequisite_chapters) : [],
        related_chapters: chapter.related_chapters ? JSON.parse(chapter.related_chapters) : [],
      }));

      return NextResponse.json({
        success: true,
        chapters: chaptersWithParsed,
      });
    } catch (error) {
      console.error('Error fetching chapters:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch chapters' },
        { status: 500 }
      );
    }
  });
}
