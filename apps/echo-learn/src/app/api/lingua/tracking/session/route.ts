/**
 * API Route: /api/lingua/tracking/session
 *
 * Manages learning sessions
 * POST - Start or end a session
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  startSession,
  endSession,
  getOrCreateSession,
  calculateEngagementScore,
} from '@/lib/lingua/tracking/tracker';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, action, sessionId, entryPoint, deviceType } = body;

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    if (action === 'start') {
      // Start a new session
      const newSessionId = await startSession(userId, entryPoint, deviceType);

      return NextResponse.json({
        success: true,
        sessionId: newSessionId,
        message: 'Session started',
      });
    } else if (action === 'end') {
      // End an existing session
      if (!sessionId) {
        return NextResponse.json({ error: 'Session ID is required to end session' }, { status: 400 });
      }

      // Calculate engagement score before ending
      const engagementScore = await calculateEngagementScore(sessionId);
      await endSession(sessionId, engagementScore);

      return NextResponse.json({
        success: true,
        engagementScore,
        message: 'Session ended',
      });
    } else if (action === 'get-or-create') {
      // Get active session or create new one
      const activeSessionId = await getOrCreateSession(userId, entryPoint);

      return NextResponse.json({
        success: true,
        sessionId: activeSessionId,
        message: 'Session retrieved or created',
      });
    } else {
      return NextResponse.json({ error: 'Invalid action. Use "start", "end", or "get-or-create"' }, { status: 400 });
    }
  } catch (error) {
    console.error('[API] Session tracking error:', error);
    return NextResponse.json(
      {
        error: 'Failed to manage session',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
