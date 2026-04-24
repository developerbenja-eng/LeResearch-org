import { NextRequest, NextResponse } from 'next/server';
import { getEvents } from '@/lib/db/origins';
import type { TimelineId, EraId } from '@/types/origins';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const timeline = searchParams.get('timeline') as TimelineId | null;
    const era = searchParams.get('era') as EraId | null;
    const search = searchParams.get('search');
    const limit = searchParams.get('limit');
    const offset = searchParams.get('offset');

    const events = await getEvents({
      timelineId: timeline || undefined,
      era: era || undefined,
      search: search || undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
      offset: offset ? parseInt(offset, 10) : undefined,
    });

    return NextResponse.json(events);
  } catch (error) {
    console.error('Error fetching events:', error);
    return NextResponse.json(
      { error: 'Failed to fetch events' },
      { status: 500 }
    );
  }
}
