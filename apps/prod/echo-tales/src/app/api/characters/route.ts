import { NextRequest, NextResponse } from 'next/server';
import { getBooksDb, query, execute, queryOne } from '@/lib/db/turso';
import { withAuth, AuthenticatedRequest } from '@/lib/auth/middleware';
import { Character, CreateCharacterInput } from '@/types';
import { generateId } from '@/lib/utils';

export const dynamic = 'force-dynamic';

// GET /api/characters - List user's characters
export async function GET(request: NextRequest) {
  return withAuth(request, async (req: AuthenticatedRequest) => {
    try {
      const { searchParams } = new URL(req.url);
      const page = parseInt(searchParams.get('page') || '1');
      const pageSize = parseInt(searchParams.get('pageSize') || '50');
      const includeInactive = searchParams.get('includeInactive') === 'true';

      const offset = (page - 1) * pageSize;

      let sql = 'SELECT * FROM characters WHERE user_id = ?';
      const args: (string | number | boolean)[] = [req.user.userId];

      if (!includeInactive) {
        sql += ' AND is_active = ?';
        args.push(true);
      }

      sql += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
      args.push(pageSize, offset);

      const characters = await query<Character>(getBooksDb(), sql, args);

      // Get total count
      let countSql = 'SELECT COUNT(*) as count FROM characters WHERE user_id = ?';
      const countArgs: (string | boolean)[] = [req.user.userId];

      if (!includeInactive) {
        countSql += ' AND is_active = ?';
        countArgs.push(true);
      }

      const countResult = await queryOne<{ count: number }>(getBooksDb(), countSql, countArgs);
      const total = countResult?.count || 0;

      return NextResponse.json({
        success: true,
        data: {
          items: characters,
          total,
          page,
          pageSize,
          hasMore: offset + characters.length < total,
        },
      });
    } catch (error) {
      console.error('Error fetching characters:', error);
      return NextResponse.json(
        { error: 'Failed to fetch characters' },
        { status: 500 }
      );
    }
  });
}

// POST /api/characters - Create a new character (without image)
export async function POST(request: NextRequest) {
  return withAuth(request, async (req: AuthenticatedRequest) => {
    try {
      const body: CreateCharacterInput = await req.json();

      const {
        character_name,
        character_type = 'main',
        age,
        gender,
        personality_traits,
        physical_description,
        birthdate,
        use_fixed_age = false,
      } = body;

      if (!character_name) {
        return NextResponse.json(
          { error: 'Character name is required' },
          { status: 400 }
        );
      }

      const characterId = generateId();
      const now = new Date().toISOString();

      await execute(
        getBooksDb(),
        `INSERT INTO characters (
          id, user_id, character_name, character_type,
          age, gender, personality_traits, physical_description,
          birthdate, use_fixed_age, is_active, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          characterId,
          req.user.userId,
          character_name,
          character_type,
          age ?? null,
          gender ?? null,
          personality_traits ?? null,
          physical_description ?? null,
          birthdate ?? null,
          use_fixed_age,
          true, // is_active
          now,
          now,
        ]
      );

      const character = await queryOne<Character>(
        getBooksDb(),
        'SELECT * FROM characters WHERE id = ?',
        [characterId]
      );

      return NextResponse.json(
        {
          success: true,
          data: character,
        },
        { status: 201 }
      );
    } catch (error) {
      console.error('Error creating character:', error);
      return NextResponse.json(
        { error: 'Failed to create character' },
        { status: 500 }
      );
    }
  });
}
