/**
 * Echo-Lin Individual Topic API
 * GET /api/lingua/topics/[id] - Get specific topic details
 */

import { NextRequest, NextResponse } from 'next/server';
import { getUniversalDb } from '@/lib/db/turso';
import { TopicProgressionManager } from '@/lib/lingua/topic-progression';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    const db = getUniversalDb();
    const manager = new TopicProgressionManager(db);

    const topic = await manager.getTopic(id);

    if (!topic) {
      return NextResponse.json(
        { error: 'Topic not found' },
        { status: 404 }
      );
    }

    // If userId provided, include user's progress
    if (userId) {
      const progress = await manager.getTopicProgress(userId, id);
      return NextResponse.json({
        topic,
        userProgress: progress
      });
    }

    return NextResponse.json({ topic });
  } catch (error) {
    console.error('Topic API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch topic' },
      { status: 500 }
    );
  }
}
