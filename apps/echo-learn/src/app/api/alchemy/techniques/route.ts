import { NextRequest, NextResponse } from 'next/server';
import { getUniversalDb, execute } from '@/lib/db/turso';
import { ensureAlchemyMigrations } from '@/lib/db/alchemy-migrations';
import type { CookingTechnique, CultureType } from '@/types/alchemy';

export async function GET(request: NextRequest) {
  try {
    await ensureAlchemyMigrations();

    const { searchParams } = new URL(request.url);
    const culture = searchParams.get('culture') as CultureType | null;
    const search = searchParams.get('search');

    const db = getUniversalDb();

    let sql = 'SELECT * FROM alchemy_techniques WHERE 1=1';
    const args: (string | number)[] = [];

    if (culture) {
      sql += ' AND culture = ?';
      args.push(culture);
    }

    if (search) {
      sql += ' AND (name LIKE ? OR description LIKE ?)';
      args.push(`%${search}%`, `%${search}%`);
    }

    sql += ' ORDER BY name ASC';

    const result = await execute(db, sql, args);

    const techniques: CookingTechnique[] = result.rows.map((row) => ({
      id: row.id as string,
      name: row.name as string,
      nativeName: row.native_name as string | null,
      culture: row.culture as CultureType,
      description: row.description as string,
      shortDescription: (row.short_description as string) || '',
      scienceExplanation: (row.science_explanation as string) || '',
      temperatureRange: (row.temperature_range as string) || '',
      keyReactions: JSON.parse((row.key_reactions as string) || '[]'),
      equipment: JSON.parse((row.equipment as string) || '[]'),
      keyTechniques: JSON.parse((row.key_techniques as string) || '[]'),
      historicalContext: (row.historical_context as string) || '',
      healthBenefits: row.health_benefits as string | null,
      exampleDishes: JSON.parse((row.example_dishes as string) || '[]'),
      imageUrl: row.image_url as string | null,
      videoUrl: row.video_url as string | null,
      createdAt: row.created_at as string,
    }));

    return NextResponse.json({ techniques });
  } catch (error) {
    console.error('Error fetching techniques:', error);
    return NextResponse.json(
      { error: 'Failed to fetch techniques' },
      { status: 500 }
    );
  }
}
