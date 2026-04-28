import { NextRequest, NextResponse } from 'next/server';
import { getUniversalDb, execute } from '@/lib/db/turso';
import { ensureAlchemyMigrations } from '@/lib/db/alchemy-migrations';
import type { TemperatureEvent, TemperatureCategory } from '@/types/alchemy';

export async function GET(request: NextRequest) {
  try {
    await ensureAlchemyMigrations();

    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category') as TemperatureCategory | null;
    const minTemp = searchParams.get('minTemp');
    const maxTemp = searchParams.get('maxTemp');

    const db = getUniversalDb();

    let sql = 'SELECT * FROM alchemy_temperatures WHERE 1=1';
    const args: (string | number)[] = [];

    if (category) {
      sql += ' AND category = ?';
      args.push(category);
    }

    if (minTemp) {
      sql += ' AND temperature_c >= ?';
      args.push(parseFloat(minTemp));
    }

    if (maxTemp) {
      sql += ' AND temperature_c <= ?';
      args.push(parseFloat(maxTemp));
    }

    sql += ' ORDER BY temperature_c ASC';

    const result = await execute(db, sql, args);

    const events: TemperatureEvent[] = result.rows.map((row) => ({
      id: row.id as string,
      temperatureC: row.temperature_c as number,
      temperatureF: row.temperature_f as number,
      eventName: row.event_name as string,
      description: row.description as string,
      category: row.category as TemperatureCategory,
      visualIndicator: row.visual_indicator as string | null,
      reversible: (row.reversible as number) === 1,
      relatedReactions: JSON.parse((row.related_reactions as string) || '[]'),
      foodsAffected: JSON.parse((row.foods_affected as string) || '[]'),
      tips: row.tips as string | null,
      createdAt: row.created_at as string,
    }));

    return NextResponse.json({ events });
  } catch (error) {
    console.error('Error fetching temperature events:', error);
    return NextResponse.json(
      { error: 'Failed to fetch temperature events' },
      { status: 500 }
    );
  }
}
