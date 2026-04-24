/**
 * Echo-Lin Start Learning Session API
 * POST /api/lingua/learning/session/start - Start a new learning session
 */

import { NextRequest, NextResponse } from 'next/server';
import { getUniversalDb } from '@/lib/db/turso';
import { LinguaLearningTracker } from '@/lib/lingua/learning-tracker';
import { withLinguaAuth } from '@/lib/lingua/middleware';

export async function POST(request: NextRequest) {
  return withLinguaAuth(request, async (req, session) => {
  try {
    const { userId, conversationId, topicId } = await req.json();

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    const db = getUniversalDb();
    const tracker = new LinguaLearningTracker(db);

    const sessionId = await tracker.startSession(userId, conversationId, topicId);

    return NextResponse.json({ sessionId });
  } catch (error) {
    console.error('Start session API error:', error);
    return NextResponse.json(
      { error: 'Failed to start session' },
      { status: 500 }
    );
  }
  });
}
