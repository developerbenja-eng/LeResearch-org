import { NextRequest, NextResponse } from 'next/server';
import { getBooksDb, query, execute, queryOne } from '@/lib/db/turso';
import { withAuth, AuthenticatedRequest } from '@/lib/auth/middleware';
import { BookSeries, Book } from '@/types';

export const dynamic = 'force-dynamic';

interface RouteParams {
  params: Promise<{ id: string }>;
}

interface UpdateSeriesInput {
  name?: string;
  description?: string;
}

// GET /api/series/:id - Get series with its books
export async function GET(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;

  return withAuth(request, async (req: AuthenticatedRequest) => {
    try {
      const series = await queryOne<BookSeries>(
        getBooksDb(),
        'SELECT * FROM book_series WHERE id = ? AND user_id = ?',
        [id, req.user.userId]
      );

      if (!series) {
        return NextResponse.json(
          { error: 'Series not found' },
          { status: 404 }
        );
      }

      // Get books in this series
      const books = await query<Book>(
        getBooksDb(),
        'SELECT * FROM books WHERE series_id = ? ORDER BY created_at DESC',
        [id]
      );

      return NextResponse.json({
        success: true,
        data: {
          ...series,
          books,
          bookCount: books.length,
        },
      });
    } catch (error) {
      console.error('Error fetching series:', error);
      return NextResponse.json(
        { error: 'Failed to fetch series' },
        { status: 500 }
      );
    }
  });
}

// PATCH /api/series/:id - Update a series
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;

  return withAuth(request, async (req: AuthenticatedRequest) => {
    try {
      // Check ownership
      const series = await queryOne<BookSeries>(
        getBooksDb(),
        'SELECT * FROM book_series WHERE id = ? AND user_id = ?',
        [id, req.user.userId]
      );

      if (!series) {
        return NextResponse.json(
          { error: 'Series not found' },
          { status: 404 }
        );
      }

      const body: UpdateSeriesInput = await req.json();
      const { name, description } = body;

      // Check for duplicate name if changing
      if (name && name.trim() !== series.name) {
        const existing = await queryOne<BookSeries>(
          getBooksDb(),
          'SELECT id FROM book_series WHERE user_id = ? AND name = ? AND id != ?',
          [req.user.userId, name.trim(), id]
        );

        if (existing) {
          return NextResponse.json(
            { error: 'A series with this name already exists' },
            { status: 409 }
          );
        }
      }

      // Build update query dynamically
      const updates: string[] = [];
      const values: (string | null)[] = [];

      if (name !== undefined) {
        updates.push('name = ?');
        values.push(name.trim());
      }
      if (description !== undefined) {
        updates.push('description = ?');
        values.push(description?.trim() || null);
      }

      if (updates.length === 0) {
        return NextResponse.json(
          { error: 'No fields to update' },
          { status: 400 }
        );
      }

      values.push(id);

      await execute(
        getBooksDb(),
        `UPDATE book_series SET ${updates.join(', ')} WHERE id = ?`,
        values
      );

      const updatedSeries = await queryOne<BookSeries>(
        getBooksDb(),
        'SELECT * FROM book_series WHERE id = ?',
        [id]
      );

      // Get book count
      const countResult = await queryOne<{ count: number }>(
        getBooksDb(),
        'SELECT COUNT(*) as count FROM books WHERE series_id = ?',
        [id]
      );

      return NextResponse.json({
        success: true,
        data: {
          ...updatedSeries,
          bookCount: countResult?.count || 0,
        },
      });
    } catch (error) {
      console.error('Error updating series:', error);
      return NextResponse.json(
        { error: 'Failed to update series' },
        { status: 500 }
      );
    }
  });
}

// DELETE /api/series/:id - Delete a series (books are unlinked, not deleted)
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;

  return withAuth(request, async (req: AuthenticatedRequest) => {
    try {
      // Check ownership
      const series = await queryOne<BookSeries>(
        getBooksDb(),
        'SELECT * FROM book_series WHERE id = ? AND user_id = ?',
        [id, req.user.userId]
      );

      if (!series) {
        return NextResponse.json(
          { error: 'Series not found' },
          { status: 404 }
        );
      }

      // Unlink books from series (don't delete them)
      await execute(
        getBooksDb(),
        'UPDATE books SET series_id = NULL WHERE series_id = ?',
        [id]
      );

      // Delete the series
      await execute(getBooksDb(), 'DELETE FROM book_series WHERE id = ?', [id]);

      return NextResponse.json({
        success: true,
        message: 'Series deleted successfully',
      });
    } catch (error) {
      console.error('Error deleting series:', error);
      return NextResponse.json(
        { error: 'Failed to delete series' },
        { status: 500 }
      );
    }
  });
}
