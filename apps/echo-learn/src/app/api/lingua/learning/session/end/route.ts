/**
 * Echo-Lin End Learning Session API
 * POST /api/lingua/learning/session/end - End learning session and get analysis
 */

import { NextRequest, NextResponse } from 'next/server';
import { getUniversalDb } from '@/lib/db/turso';
import { LinguaLearningTracker } from '@/lib/lingua/learning-tracker';
import { LinguaAICoach } from '@/lib/lingua/ai-coach';
import { withLinguaAuth } from '@/lib/lingua/middleware';

export async function POST(request: NextRequest) {
  return withLinguaAuth(request, async (req, linguaSession) => {
  try {
    const { generateInsights } = await req.json();

    const db = getUniversalDb();
    const tracker = new LinguaLearningTracker(db);

    // End the current session
    const session = await tracker.endSession();

    if (!session) {
      return NextResponse.json(
        { error: 'No active session found' },
        { status: 404 }
      );
    }

    // Analyze learning pattern
    const pattern = tracker.analyzePattern(session);

    // Optionally generate insights
    let insights = null;
    if (generateInsights) {
      const geminiApiKey = process.env.GEMINI_API_KEY;
      if (geminiApiKey) {
        const coach = new LinguaAICoach(db, geminiApiKey);
        insights = await coach.analyzeSession(session, pattern);
      }
    }

    return NextResponse.json({
      session,
      pattern,
      insights
    });
  } catch (error) {
    console.error('End session API error:', error);
    return NextResponse.json(
      { error: 'Failed to end session' },
      { status: 500 }
    );
  }
  });
}
