import { NextRequest, NextResponse } from 'next/server';
import { getBooksDb, execute, queryOne } from '@/lib/db/turso';
import { withAuth, AuthenticatedRequest } from '@/lib/auth/middleware';
import { Book, BookPage } from '@/types';

export const dynamic = 'force-dynamic';

interface RouteParams {
  params: Promise<{ id: string; pageId: string }>;
}

// GET /api/books/:id/pages/:pageId - Get a single page
export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  const { id, pageId } = await params;

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

      // Fetch the page
      const page = await queryOne<BookPage>(
        getBooksDb(),
        'SELECT * FROM book_pages WHERE id = ? AND book_id = ?',
        [pageId, id]
      );

      if (!page) {
        return NextResponse.json(
          { error: 'Page not found' },
          { status: 404 }
        );
      }

      // Parse JSON fields
      const parsedPage = {
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
      };

      return NextResponse.json({
        success: true,
        data: parsedPage,
      });
    } catch (error) {
      console.error('Error fetching page:', error);
      return NextResponse.json(
        { error: 'Failed to fetch page' },
        { status: 500 }
      );
    }
  });
}

// PATCH /api/books/:id/pages/:pageId - Update page content
export async function PATCH(
  request: NextRequest,
  { params }: RouteParams
) {
  const { id, pageId } = await params;

  return withAuth(request, async (req: AuthenticatedRequest) => {
    try {
      const body = await req.json();

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

      // Verify page exists
      const existingPage = await queryOne<BookPage>(
        getBooksDb(),
        'SELECT id FROM book_pages WHERE id = ? AND book_id = ?',
        [pageId, id]
      );

      if (!existingPage) {
        return NextResponse.json(
          { error: 'Page not found' },
          { status: 404 }
        );
      }

      // Build update query
      const updates: string[] = [];
      const args: (string | number | null)[] = [];

      // Handle text update
      if (body.text !== undefined) {
        updates.push('text_content = ?');
        args.push(body.text);
      }

      // Handle featured_characters update (store as JSON)
      if (body.featured_characters !== undefined) {
        updates.push('featured_characters = ?');
        args.push(JSON.stringify(body.featured_characters));
      }

      // Handle text_overlay_style update (store as JSON)
      if (body.text_overlay_position !== undefined) {
        updates.push('text_overlay_style = ?');
        args.push(JSON.stringify(body.text_overlay_position));
      }

      // Handle layout update
      if (body.layout !== undefined) {
        updates.push('layout_type = ?');
        args.push(body.layout);
      }

      // Handle page_number update (for reordering)
      if (body.page_number !== undefined && typeof body.page_number === 'number') {
        updates.push('page_number = ?');
        args.push(body.page_number);
      }

      if (updates.length === 0) {
        return NextResponse.json(
          { error: 'No valid fields to update' },
          { status: 400 }
        );
      }

      updates.push('updated_at = ?');
      args.push(new Date().toISOString());
      args.push(pageId);

      await execute(
        getBooksDb(),
        `UPDATE book_pages SET ${updates.join(', ')} WHERE id = ?`,
        args
      );

      // Fetch updated page
      const updatedPage = await queryOne<BookPage>(
        getBooksDb(),
        'SELECT * FROM book_pages WHERE id = ?',
        [pageId]
      );

      // Parse JSON fields
      const parsedPage = updatedPage ? {
        ...updatedPage,
        featured_characters: updatedPage.featured_characters
          ? (typeof updatedPage.featured_characters === 'string'
              ? JSON.parse(updatedPage.featured_characters)
              : updatedPage.featured_characters)
          : [],
        text_overlay_position: updatedPage.text_overlay_position
          ? (typeof updatedPage.text_overlay_position === 'string'
              ? JSON.parse(updatedPage.text_overlay_position)
              : updatedPage.text_overlay_position)
          : null,
      } : null;

      return NextResponse.json({
        success: true,
        data: parsedPage,
      });
    } catch (error) {
      console.error('Error updating page:', error);
      return NextResponse.json(
        { error: 'Failed to update page' },
        { status: 500 }
      );
    }
  });
}
