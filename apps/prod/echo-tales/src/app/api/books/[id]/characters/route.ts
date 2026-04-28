import { NextRequest, NextResponse } from 'next/server';
import { getBooksDb, query, queryOne } from '@/lib/db/turso';
import { withAuth, AuthenticatedRequest } from '@/lib/auth/middleware';
import { Book, Character } from '@/types';

export const dynamic = 'force-dynamic';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/books/:id/characters - Get all characters associated with a book
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

      // Fetch characters associated with this book through book_characters junction table
      const characters = await query<Character>(
        getBooksDb(),
        `SELECT c.*
         FROM characters c
         INNER JOIN book_characters bc ON c.id = bc.character_id
         WHERE bc.book_id = ? AND c.is_active = 1
         ORDER BY c.character_name`,
        [id]
      );

      return NextResponse.json({
        success: true,
        data: characters,
      });
    } catch (error) {
      console.error('Error fetching book characters:', error);
      return NextResponse.json(
        { error: 'Failed to fetch characters' },
        { status: 500 }
      );
    }
  });
}
