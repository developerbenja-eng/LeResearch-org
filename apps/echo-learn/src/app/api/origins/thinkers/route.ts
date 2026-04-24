import { NextRequest, NextResponse } from 'next/server';
import { getAllThinkers, getThinker } from '@/lib/db/origins';
import type { ThinkerId } from '@/types/origins';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id') as ThinkerId | null;

    if (id) {
      const thinker = await getThinker(id);
      if (!thinker) {
        return NextResponse.json(
          { error: 'Thinker not found' },
          { status: 404 }
        );
      }
      return NextResponse.json(thinker);
    }

    const thinkers = await getAllThinkers();
    return NextResponse.json(thinkers);
  } catch (error) {
    console.error('Error fetching thinkers:', error);
    return NextResponse.json(
      { error: 'Failed to fetch thinkers' },
      { status: 500 }
    );
  }
}
