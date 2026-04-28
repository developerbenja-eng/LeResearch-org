import { NextRequest, NextResponse } from 'next/server';
import {
  getAllStructures,
  searchStructures,
  getStructureStats,
} from '@/lib/db/anatomy';
import type {
  BodySystem,
  BodyRegion,
  AnatomyCategory,
  AnatomyDifficulty,
} from '@/types/anatomy';

/**
 * GET /api/anatomy/structures
 * List all anatomical structures with optional filtering
 *
 * Query params:
 * - system: filter by body system
 * - region: filter by body region
 * - category: filter by structure category
 * - difficulty: filter by difficulty level
 * - search: search query
 * - parentId: filter by parent structure
 * - limit: max results (default 100)
 * - offset: pagination offset
 * - stats: if "true", return statistics instead
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const system = searchParams.get('system') as BodySystem | null;
    const region = searchParams.get('region') as BodyRegion | null;
    const category = searchParams.get('category') as AnatomyCategory | null;
    const difficulty = searchParams.get('difficulty') as AnatomyDifficulty | null;
    const search = searchParams.get('search');
    const parentId = searchParams.get('parentId');
    const limit = parseInt(searchParams.get('limit') || '100', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);
    const includeStats = searchParams.get('stats') === 'true';

    // If stats requested, return statistics
    if (includeStats) {
      const stats = await getStructureStats();
      return NextResponse.json({ stats });
    }

    // Get structures with filters
    const structures = await getAllStructures({
      system: system || undefined,
      region: region || undefined,
      category: category || undefined,
      difficulty: difficulty || undefined,
      search: search || undefined,
      parentId: parentId || undefined,
      limit,
      offset,
    });

    return NextResponse.json({
      structures,
      total: structures.length,
      filters: { system, region, category, difficulty, search },
    });
  } catch (error) {
    console.error('Error fetching structures:', error);
    return NextResponse.json(
      { error: 'Failed to fetch structures' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/anatomy/structures
 * Search structures by query
 *
 * Body:
 * - query: search string (required)
 * - system: optional system filter
 * - region: optional region filter
 * - limit: max results (default 20)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { query, system, region, limit } = body;

    if (!query || typeof query !== 'string') {
      return NextResponse.json(
        { error: 'Search query is required' },
        { status: 400 }
      );
    }

    const structures = await searchStructures(query, {
      system,
      region,
      limit: limit || 20,
    });

    return NextResponse.json({
      structures,
      total: structures.length,
      query,
    });
  } catch (error) {
    console.error('Error searching structures:', error);
    return NextResponse.json(
      { error: 'Failed to search structures' },
      { status: 500 }
    );
  }
}
