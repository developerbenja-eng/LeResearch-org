import { NextRequest, NextResponse } from 'next/server';
import { getUniversalDb, execute } from '@/lib/db/turso';
import { ensureAlchemyMigrations } from '@/lib/db/alchemy-migrations';
import type { ChemicalReaction, ReactionType } from '@/types/alchemy';

export async function GET(request: NextRequest) {
  try {
    await ensureAlchemyMigrations();

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') as ReactionType | null;
    const search = searchParams.get('search');

    const db = getUniversalDb();

    let sql = 'SELECT * FROM alchemy_reactions WHERE 1=1';
    const args: (string | number)[] = [];

    if (type) {
      sql += ' AND type = ?';
      args.push(type);
    }

    if (search) {
      sql += ' AND (name LIKE ? OR description LIKE ?)';
      args.push(`%${search}%`, `%${search}%`);
    }

    sql += ' ORDER BY name ASC';

    const result = await execute(db, sql, args);

    const reactions: ChemicalReaction[] = result.rows.map((row) => ({
      id: row.id as string,
      name: row.name as string,
      type: row.type as ReactionType,
      description: row.description as string,
      shortDescription: (row.short_description as string) || '',
      temperatureMinC: row.temperature_min_c as number | null,
      temperatureMaxC: row.temperature_max_c as number | null,
      temperatureMinF: row.temperature_min_f as number | null,
      temperatureMaxF: row.temperature_max_f as number | null,
      reactants: JSON.parse((row.reactants as string) || '[]'),
      products: JSON.parse((row.products as string) || '[]'),
      mechanism: (row.mechanism as string) || '',
      visualCues: JSON.parse((row.visual_cues as string) || '[]'),
      commonFoods: JSON.parse((row.common_foods as string) || '[]'),
      culturalExamples: JSON.parse((row.cultural_examples as string) || '[]'),
      imageUrl: row.image_url as string | null,
      videoUrl: row.video_url as string | null,
      createdAt: row.created_at as string,
    }));

    return NextResponse.json({ reactions });
  } catch (error) {
    console.error('Error fetching reactions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch reactions' },
      { status: 500 }
    );
  }
}
