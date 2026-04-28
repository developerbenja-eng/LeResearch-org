/**
 * API Routes for Book Concepts
 * GET /api/books/[id]/concepts - Get concept map for a book
 */

import { NextRequest, NextResponse } from 'next/server';
import { getConceptsByBookId, getBookById } from '@/lib/books/db';
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

      const concepts = await getConceptsByBookId(bookId);

      // Parse JSON fields
      const conceptsWithParsed = concepts.map((concept) => ({
        ...concept,
        related_concepts: concept.related_concepts ? JSON.parse(concept.related_concepts) : [],
      }));

      return NextResponse.json({
        success: true,
        concepts: conceptsWithParsed,
      });
    } catch (error) {
      console.error('Error fetching concepts:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch concepts' },
        { status: 500 }
      );
    }
  });
}
