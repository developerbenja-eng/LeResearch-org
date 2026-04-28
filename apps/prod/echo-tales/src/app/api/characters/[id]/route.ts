import { NextRequest, NextResponse } from 'next/server';
import { getBooksDb, execute, queryOne } from '@/lib/db/turso';
import { withAuth, AuthenticatedRequest } from '@/lib/auth/middleware';
import { Character, UpdateCharacterInput } from '@/types';

export const dynamic = 'force-dynamic';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/characters/:id - Get character details
export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  const { id } = await params;

  return withAuth(request, async (req: AuthenticatedRequest) => {
    try {
      const character = await queryOne<Character>(
        getBooksDb(),
        'SELECT * FROM characters WHERE id = ? AND user_id = ?',
        [id, req.user.userId]
      );

      if (!character) {
        return NextResponse.json(
          { error: 'Character not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        data: character,
      });
    } catch (error) {
      console.error('Error fetching character:', error);
      return NextResponse.json(
        { error: 'Failed to fetch character' },
        { status: 500 }
      );
    }
  });
}

// PATCH /api/characters/:id - Update character
export async function PATCH(
  request: NextRequest,
  { params }: RouteParams
) {
  const { id } = await params;

  return withAuth(request, async (req: AuthenticatedRequest) => {
    try {
      const body: UpdateCharacterInput = await req.json();

      // Check character ownership
      const existingCharacter = await queryOne<Character>(
        getBooksDb(),
        'SELECT * FROM characters WHERE id = ? AND user_id = ?',
        [id, req.user.userId]
      );

      if (!existingCharacter) {
        return NextResponse.json(
          { error: 'Character not found' },
          { status: 404 }
        );
      }

      // Validate required fields if provided
      if (body.character_name !== undefined && body.character_name.trim().length < 2) {
        return NextResponse.json(
          { error: 'Character name must be at least 2 characters long' },
          { status: 400 }
        );
      }

      // Check for duplicate name (excluding current character)
      if (body.character_name && body.character_name.toLowerCase() !== existingCharacter.character_name.toLowerCase()) {
        const nameConflict = await queryOne<{ id: string }>(
          getBooksDb(),
          'SELECT id FROM characters WHERE user_id = ? AND LOWER(character_name) = LOWER(?) AND id != ?',
          [req.user.userId, body.character_name, id]
        );

        if (nameConflict) {
          return NextResponse.json(
            { error: 'A character with this name already exists' },
            { status: 409 }
          );
        }
      }

      // Build update query dynamically
      const updates: string[] = [];
      const args: (string | number | boolean | null)[] = [];

      // Updated to use correct field names from the new schema
      const allowedFields: (keyof UpdateCharacterInput)[] = [
        'character_name',
        'character_type',
        'age',
        'gender',
        'personality_traits',
        'physical_description',
        'reference_image_url',
        'original_photo_url',
        'birthdate',
        'use_fixed_age',
        'is_active',
      ];

      for (const field of allowedFields) {
        if (body[field] !== undefined) {
          updates.push(`${field} = ?`);
          args.push(body[field] as string | number | boolean | null);
        }
      }

      if (updates.length === 0) {
        return NextResponse.json(
          { error: 'No valid fields to update' },
          { status: 400 }
        );
      }

      updates.push('updated_at = ?');
      args.push(new Date().toISOString());
      args.push(id);
      args.push(req.user.userId);

      await execute(
        getBooksDb(),
        `UPDATE characters SET ${updates.join(', ')} WHERE id = ? AND user_id = ?`,
        args
      );

      const updatedCharacter = await queryOne<Character>(
        getBooksDb(),
        'SELECT * FROM characters WHERE id = ?',
        [id]
      );

      return NextResponse.json({
        success: true,
        message: 'Character updated successfully',
        data: updatedCharacter,
      });
    } catch (error) {
      console.error('Error updating character:', error);

      if (error instanceof Error && error.message.includes('UNIQUE constraint failed')) {
        return NextResponse.json(
          { error: 'Character with this name already exists' },
          { status: 409 }
        );
      }

      return NextResponse.json(
        { error: 'Failed to update character' },
        { status: 500 }
      );
    }
  });
}

// DELETE /api/characters/:id - Delete character
export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
) {
  const { id } = await params;

  return withAuth(request, async (req: AuthenticatedRequest) => {
    try {
      // Check character ownership
      const existingCharacter = await queryOne<Character>(
        getBooksDb(),
        'SELECT * FROM characters WHERE id = ? AND user_id = ?',
        [id, req.user.userId]
      );

      if (!existingCharacter) {
        return NextResponse.json(
          { error: 'Character not found' },
          { status: 404 }
        );
      }

      // Check if character is used in any books
      const bookUsage = await queryOne<{ count: number }>(
        getBooksDb(),
        'SELECT COUNT(*) as count FROM book_characters WHERE character_id = ?',
        [id]
      );

      const usageCount = bookUsage?.count || 0;

      // Delete character relationships from books first
      if (usageCount > 0) {
        await execute(
          getBooksDb(),
          'DELETE FROM book_characters WHERE character_id = ?',
          [id]
        );
      }

      // Delete the character
      await execute(
        getBooksDb(),
        'DELETE FROM characters WHERE id = ? AND user_id = ?',
        [id, req.user.userId]
      );

      return NextResponse.json({
        success: true,
        message: 'Character deleted successfully',
        data: {
          deletedCharacter: {
            id: id,
            character_name: existingCharacter.character_name,
          },
          booksAffected: usageCount,
        },
      });
    } catch (error) {
      console.error('Error deleting character:', error);
      return NextResponse.json(
        { error: 'Failed to delete character' },
        { status: 500 }
      );
    }
  });
}
