import { NextRequest, NextResponse } from 'next/server';
import { getTimeline, getEventsByTimeline } from '@/lib/db/origins';
import type { TimelineId } from '@/types/origins';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ timelineId: string }> }
) {
  try {
    const { timelineId } = await params;
    const timeline = await getTimeline(timelineId as TimelineId);

    if (!timeline) {
      return NextResponse.json(
        { error: 'Timeline not found' },
        { status: 404 }
      );
    }

    const events = await getEventsByTimeline(timelineId as TimelineId);

    return NextResponse.json({
      timeline,
      events,
    });
  } catch (error) {
    console.error('Error fetching timeline:', error);
    return NextResponse.json(
      { error: 'Failed to fetch timeline' },
      { status: 500 }
    );
  }
}
