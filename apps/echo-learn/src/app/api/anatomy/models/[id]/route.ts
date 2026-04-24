import { NextRequest, NextResponse } from 'next/server';
import { getModelById } from '@/lib/db/anatomy';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/anatomy/models/[id]
 * Get a single model by ID
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    const model = await getModelById(id);

    if (!model) {
      return NextResponse.json(
        { error: 'Model not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ model });
  } catch (error) {
    console.error('Error fetching model:', error);
    return NextResponse.json(
      { error: 'Failed to fetch model' },
      { status: 500 }
    );
  }
}
