import { NextRequest, NextResponse } from 'next/server';
import { getBooksDb, query, execute, queryOne } from '@/lib/db/turso';
import { withAuth, AuthenticatedRequest } from '@/lib/auth/middleware';
import { BookSeries, Book } from '@/types';
import { generateId } from '@/lib/utils';

export const dynamic = 'force-dynamic';

interface CreateSeriesInput {
  name: string;
  description?: string;
}

// GET /api/series - List user's book series
export async function GET(request: NextRequest) {
  return withAuth(request, async (req: AuthenticatedRequest) => {
    try {
      // Fetch all series for the user
      const series = await query<BookSeries>(
        getBooksDb(),
        'SELECT * FROM book_series WHERE user_id = ? ORDER BY created_at DESC',
        [req.user.userId]
      );

      // For each series, get the book count
      const seriesWithCounts = await Promise.all(
        series.map(async (s) => {
          const countResult = await queryOne<{ count: number }>(
            getBooksDb(),
            'SELECT COUNT(*) as count FROM books WHERE series_id = ?',
            [s.id]
          );
          return {
            ...s,
            bookCount: countResult?.count || 0,
          };
        })
      );

      return NextResponse.json({
        success: true,
        data: seriesWithCounts,
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

// POST /api/series - Create a new book series
export async function POST(request: NextRequest) {
  return withAuth(request, async (req: AuthenticatedRequest) => {
    try {
      const body: CreateSeriesInput = await req.json();
      const { name, description } = body;

      if (!name || name.trim().length === 0) {
        return NextResponse.json(
          { error: 'Series name is required' },
          { status: 400 }
        );
      }

      // Check for duplicate name
      const existing = await queryOne<BookSeries>(
        getBooksDb(),
        'SELECT id FROM book_series WHERE user_id = ? AND name = ?',
        [req.user.userId, name.trim()]
      );

      if (existing) {
        return NextResponse.json(
          { error: 'A series with this name already exists' },
          { status: 409 }
        );
      }

      const seriesId = generateId();
      const now = new Date().toISOString();

      await execute(
        getBooksDb(),
        `INSERT INTO book_series (id, user_id, name, description, created_at)
         VALUES (?, ?, ?, ?, ?)`,
        [seriesId, req.user.userId, name.trim(), description?.trim() || null, now]
      );

      const series = await queryOne<BookSeries>(
        getBooksDb(),
        'SELECT * FROM book_series WHERE id = ?',
        [seriesId]
      );

      return NextResponse.json(
        {
          success: true,
          data: { ...series, bookCount: 0 },
        },
        { status: 201 }
      );
    } catch (error) {
      console.error('Error creating series:', error);
      return NextResponse.json(
        { error: 'Failed to create series' },
        { status: 500 }
      );
    }
  });
}
