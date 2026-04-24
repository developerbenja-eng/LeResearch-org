import { NextRequest, NextResponse } from 'next/server';
import { getAllJourneys } from '@/lib/db/anatomy';
import type { BodySystem, BodyRegion, AnatomyDifficulty } from '@/types/anatomy';

/**
 * GET /api/anatomy/journeys
 * List all learning journeys with optional filtering
 *
 * Query params:
 * - system: filter by body system
 * - region: filter by body region
 * - difficulty: filter by difficulty level
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const system = searchParams.get('system') as BodySystem | null;
    const region = searchParams.get('region') as BodyRegion | null;
    const difficulty = searchParams.get('difficulty') as AnatomyDifficulty | null;

    const journeys = await getAllJourneys({
      system: system || undefined,
      region: region || undefined,
      difficulty: difficulty || undefined,
    });

    return NextResponse.json({
      journeys,
      total: journeys.length,
    });
  } catch (error) {
    console.error('Error fetching journeys:', error);
    return NextResponse.json(
      { error: 'Failed to fetch journeys' },
      { status: 500 }
    );
  }
}
