import { NextRequest, NextResponse } from 'next/server';
import { getJourneyById } from '@/lib/db/anatomy';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/anatomy/journeys/[id]
 * Get a single journey with all its steps
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    const journey = await getJourneyById(id);

    if (!journey) {
      return NextResponse.json(
        { error: 'Journey not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ journey });
  } catch (error) {
    console.error('Error fetching journey:', error);
    return NextResponse.json(
      { error: 'Failed to fetch journey' },
      { status: 500 }
    );
  }
}
