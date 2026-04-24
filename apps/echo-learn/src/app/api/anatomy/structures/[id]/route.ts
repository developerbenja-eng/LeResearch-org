import { NextRequest, NextResponse } from 'next/server';
import {
  getStructureWithLenses,
  getStructureRelationships,
  getChildStructures,
} from '@/lib/db/anatomy';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/anatomy/structures/[id]
 * Get a single structure with its lenses
 *
 * Query params:
 * - include: comma-separated list of related data to include
 *   - relationships: include structure relationships
 *   - children: include child structures
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const include = searchParams.get('include')?.split(',') || [];

    const structure = await getStructureWithLenses(id);

    if (!structure) {
      return NextResponse.json(
        { error: 'Structure not found' },
        { status: 404 }
      );
    }

    const result: Record<string, unknown> = { structure };

    // Include relationships if requested
    if (include.includes('relationships')) {
      const { relationships, relatedStructures } = await getStructureRelationships(id);
      result.relationships = relationships;
      result.relatedStructures = relatedStructures;
    }

    // Include child structures if requested
    if (include.includes('children')) {
      const children = await getChildStructures(id);
      result.children = children;
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching structure:', error);
    return NextResponse.json(
      { error: 'Failed to fetch structure' },
      { status: 500 }
    );
  }
}
