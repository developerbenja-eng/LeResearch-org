import { NextRequest, NextResponse } from 'next/server';
import { getBooksDb, query, queryOne } from '@/lib/db/turso';
import { withAuth, AuthenticatedRequest } from '@/lib/auth/middleware';
import { Book, BookPage } from '@/types';

export const dynamic = 'force-dynamic';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/books/:id/pages - Get all pages for a book
export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  const { id } = await params;

  return withAuth(request, async (req: AuthenticatedRequest) => {
    try {
      // Verify book ownership
      const book = await queryOne<Book>(
        getBooksDb(),
        'SELECT id FROM books WHERE id = ? AND user_id = ?',
        [id, req.user.userId]
      );

      if (!book) {
        return NextResponse.json(
          { error: 'Book not found' },
          { status: 404 }
        );
      }

      // Fetch all pages
      const pages = await query<BookPage>(
        getBooksDb(),
        `SELECT * FROM book_pages WHERE book_id = ? ORDER BY page_number`,
        [id]
      );

      // Parse JSON fields
      const parsedPages = pages.map((page) => ({
        ...page,
        featured_characters: page.featured_characters
          ? (typeof page.featured_characters === 'string'
              ? JSON.parse(page.featured_characters)
              : page.featured_characters)
          : [],
        text_overlay_position: page.text_overlay_position
          ? (typeof page.text_overlay_position === 'string'
              ? JSON.parse(page.text_overlay_position)
              : page.text_overlay_position)
          : null,
      }));

      return NextResponse.json({
        success: true,
        data: parsedPages,
      });
    } catch (error) {
      console.error('Error fetching pages:', error);
      return NextResponse.json(
        { error: 'Failed to fetch pages' },
        { status: 500 }
      );
    }
  });
}
