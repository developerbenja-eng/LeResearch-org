import { NextRequest, NextResponse } from 'next/server';
import { getLens, getStructureById } from '@/lib/db/anatomy';
import type { AnatomyLensType } from '@/types/anatomy';

interface RouteParams {
  params: Promise<{ id: string; lensType: string }>;
}

/**
 * GET /api/anatomy/structures/[id]/lens/[lensType]
 * Get a specific lens for a structure
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id, lensType } = await params;

    // Validate lens type
    const validLensTypes: AnatomyLensType[] = ['anatomical', 'functional', 'clinical', 'connections', 'interactive'];
    if (!validLensTypes.includes(lensType as AnatomyLensType)) {
      return NextResponse.json(
        { error: `Invalid lens type. Valid types: ${validLensTypes.join(', ')}` },
        { status: 400 }
      );
    }

    // Check if structure exists
    const structure = await getStructureById(id);
    if (!structure) {
      return NextResponse.json(
        { error: 'Structure not found' },
        { status: 404 }
      );
    }

    const lens = await getLens(id, lensType as AnatomyLensType);

    if (!lens) {
      return NextResponse.json(
        { error: `Lens '${lensType}' not found for this structure` },
        { status: 404 }
      );
    }

    return NextResponse.json({ lens, structure });
  } catch (error) {
    console.error('Error fetching lens:', error);
    return NextResponse.json(
      { error: 'Failed to fetch lens' },
      { status: 500 }
    );
  }
}
