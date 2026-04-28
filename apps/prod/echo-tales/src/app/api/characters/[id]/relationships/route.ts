import { NextRequest, NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from '@/lib/auth/middleware';
import { getCharacterRelationships } from '@/lib/db/relationships';
import { getBooksDb, queryOne } from '@/lib/db/turso';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAuth(request, async (req: AuthenticatedRequest) => {
    try {
      const { id: characterId } = await params;
      const db = getBooksDb();

      // Verify character exists and belongs to the authenticated user
      const character = await queryOne<{ id: string; user_id: string }>(
        db,
        'SELECT id, user_id FROM characters WHERE id = ?',
        [characterId]
      );

      if (!character || character.user_id !== req.user.userId) {
        return NextResponse.json(
          { error: 'Character not found' },
          { status: 404 }
        );
      }

      // Get relationships for this character
      const relationships = await getCharacterRelationships(req.user.userId, characterId);

      return NextResponse.json({
        success: true,
        data: relationships,
      });
    } catch (error) {
      console.error('[Character Relationships API] Error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch relationships' },
        { status: 500 }
      );
    }
  });
}
