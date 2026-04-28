/**
 * Echo-Lin Start Topic API
 * POST /api/lingua/topics/[id]/start - Start learning a topic
 */

import { NextRequest, NextResponse } from 'next/server';
import { getUniversalDb } from '@/lib/db/turso';
import { TopicProgressionManager } from '@/lib/lingua/topic-progression';

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await request.json();
    const { id } = await context.params;

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    const db = getUniversalDb();
    const manager = new TopicProgressionManager(db);

    // Start the topic (will check prerequisites)
    const progress = await manager.startTopic(userId, id);

    return NextResponse.json({ progress });
  } catch (error: any) {
    console.error('Start topic API error:', error);

    if (error.message?.includes('not available') || error.message?.includes('not found')) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to start topic', details: error.message },
      { status: 500 }
    );
  }
}
