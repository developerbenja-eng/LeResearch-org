import { NextResponse } from 'next/server';
import { getAllTimelines } from '@/lib/db/origins';

export async function GET() {
  try {
    const timelines = await getAllTimelines();
    return NextResponse.json(timelines);
  } catch (error) {
    console.error('Error fetching timelines:', error);
    return NextResponse.json(
      { error: 'Failed to fetch timelines' },
      { status: 500 }
    );
  }
}
