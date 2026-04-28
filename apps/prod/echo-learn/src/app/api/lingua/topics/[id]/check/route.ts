/**
 * Echo-Lin Comprehension Check API
 * POST /api/lingua/topics/[id]/check - Evaluate comprehension check
 */

import { NextRequest, NextResponse } from 'next/server';
import { getUniversalDb } from '@/lib/db/turso';
import { TopicProgressionManager } from '@/lib/lingua/topic-progression';

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { userId, checkId, conversationContext } = await request.json();
    const { id } = await context.params;

    if (!userId || !checkId || !conversationContext) {
      return NextResponse.json(
        { error: 'userId, checkId, and conversationContext are required' },
        { status: 400 }
      );
    }

    const geminiApiKey = process.env.GEMINI_API_KEY;
    if (!geminiApiKey) {
      throw new Error('GEMINI_API_KEY not configured');
    }

    const db = getUniversalDb();
    const manager = new TopicProgressionManager(db);

    // Record attempt
    await manager.attemptCheck(userId, id, checkId);

    // Evaluate using AI
    const evaluation = await manager.evaluateCheck(
      id,
      checkId,
      conversationContext,
      geminiApiKey
    );

    // If passed, record it
    if (evaluation.passed) {
      await manager.passCheck(userId, id, checkId);
    }

    // Get updated progress
    const progress = await manager.getTopicProgress(userId, id);

    return NextResponse.json({
      evaluation,
      progress
    });
  } catch (error: any) {
    console.error('Check evaluation API error:', error);

    if (error.message?.includes('not found')) {
      return NextResponse.json(
        { error: error.message },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to evaluate check' },
      { status: 500 }
    );
  }
}
