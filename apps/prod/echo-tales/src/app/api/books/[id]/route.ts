/**
 * API Routes for Individual Book Details
 * GET /api/books/[id] - Get book with chapters and concepts
 * DELETE /api/books/[id] - Delete a Play Room book
 * PATCH /api/books/[id] - Update a Play Room book
 */

import { NextRequest, NextResponse } from 'next/server';
import { getBookById, getChaptersByBookId, getConceptsByBookId } from '@/lib/books/db';
import { getBooksDb, execute, queryOne } from '@/lib/db/turso';
import { withAuth, withOptionalAuth, AuthenticatedRequest, OptionalAuthRequest } from '@/lib/auth/middleware';
import { Book } from '@/types/book';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withOptionalAuth(request, async (req: OptionalAuthRequest) => {
    try {
      const { id: bookId } = await params;

      // Fetch book, chapters, and concepts in parallel
      const [book, chapters, concepts] = await Promise.all([
        getBookById(bookId),
        getChaptersByBookId(bookId),
        getConceptsByBookId(bookId),
      ]);

      if (!book) {
        return NextResponse.json(
          { success: false, error: 'Book not found' },
          { status: 404 }
        );
      }

      // Access control: authenticated users can see their own books or public books
      // Unauthenticated users can only see public/published books
      const bookRecord = book as unknown as Record<string, unknown>;
      const isOwner = req.user && bookRecord.user_id === req.user.userId;
      const isPublic = bookRecord.is_public === 1 || bookRecord.status === 'published';

      if (!isOwner && !isPublic) {
        return NextResponse.json(
          { success: false, error: 'Book not found' },
          { status: 404 }
        );
      }

      // Parse JSON fields for book
      const bookWithParsed = {
        ...book,
        key_insights: book.key_insights ? JSON.parse(book.key_insights) : [],
        main_themes: book.main_themes ? JSON.parse(book.main_themes) : [],
        discussion_prompts: book.discussion_prompts ? JSON.parse(book.discussion_prompts) : [],
      };

      // Parse JSON fields for chapters
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

      // Parse JSON fields for concepts
      const conceptsWithParsed = concepts.map((concept) => ({
        ...concept,
        related_concepts: concept.related_concepts ? JSON.parse(concept.related_concepts) : [],
      }));

      return NextResponse.json({
        success: true,
        book: bookWithParsed,
        chapters: chaptersWithParsed,
        concepts: conceptsWithParsed,
      });
    } catch (error) {
      console.error('Error fetching book details:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch book details' },
        { status: 500 }
      );
    }
  });
}

// DELETE /api/books/[id] - Delete a Play Room book
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAuth(request, async (req: AuthenticatedRequest) => {
    try {
      const { id: bookId } = await params;
      const db = getBooksDb();

      // Verify book belongs to user
      const book = await queryOne<Book>(
        db,
        'SELECT id, user_id, vacation_book_id FROM books WHERE id = ? AND user_id = ?',
        [bookId, req.user.userId]
      );

      if (!book) {
        return NextResponse.json(
          { error: 'Book not found' },
          { status: 404 }
        );
      }

      // Delete related records first
      await execute(db, 'DELETE FROM book_pages WHERE book_id = ?', [bookId]);
      await execute(db, 'DELETE FROM book_characters WHERE book_id = ?', [bookId]);

      // If vacation book, delete vacation records too
      if (book.vacation_book_id) {
        await execute(db, 'DELETE FROM vacation_photos WHERE vacation_book_id = ?', [book.vacation_book_id]);
        await execute(db, 'DELETE FROM vacation_characters WHERE vacation_book_id = ?', [book.vacation_book_id]);
        await execute(db, 'DELETE FROM vacation_books WHERE id = ?', [book.vacation_book_id]);
      }

      // Delete the book itself
      await execute(db, 'DELETE FROM books WHERE id = ?', [bookId]);

      return NextResponse.json({ success: true });
    } catch (error) {
      console.error('Error deleting book:', error);
      return NextResponse.json(
        { error: 'Failed to delete book' },
        { status: 500 }
      );
    }
  });
}

// PATCH /api/books/[id] - Update a Play Room book
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAuth(request, async (req: AuthenticatedRequest) => {
    try {
      const { id: bookId } = await params;
      const body = await req.json();
      const db = getBooksDb();

      // Verify book belongs to user
      const book = await queryOne<Book>(
        db,
        'SELECT id FROM books WHERE id = ? AND user_id = ?',
        [bookId, req.user.userId]
      );

      if (!book) {
        return NextResponse.json(
          { error: 'Book not found' },
          { status: 404 }
        );
      }

      const updates: string[] = [];
      const values: (string | number | null)[] = [];

      const allowedFields = ['title', 'description', 'theme', 'language', 'page_count', 'custom_instructions', 'status'];
      for (const field of allowedFields) {
        if (body[field] !== undefined) {
          updates.push(`${field} = ?`);
          values.push(body[field]);
          if (field === 'theme') {
            updates.push('educational_theme = ?');
            values.push(body[field]);
          }
        }
      }

      if (updates.length === 0) {
        return NextResponse.json(
          { error: 'No fields to update' },
          { status: 400 }
        );
      }

      updates.push('updated_at = ?');
      values.push(new Date().toISOString());
      values.push(bookId);

      await execute(
        db,
        `UPDATE books SET ${updates.join(', ')} WHERE id = ?`,
        values
      );

      const updated = await queryOne<Book>(db, 'SELECT * FROM books WHERE id = ?', [bookId]);

      return NextResponse.json({ success: true, data: updated });
    } catch (error) {
      console.error('Error updating book:', error);
      return NextResponse.json(
        { error: 'Failed to update book' },
        { status: 500 }
      );
    }
  });
}
