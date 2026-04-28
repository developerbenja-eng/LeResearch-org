import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth/jwt';
import {
  getOverallProgress,
  getAnatomyUser,
  getUserQuizHistory,
  getUserJourneyProgress,
  getAnatomyUserByMainUserId,
  createAnatomyUser,
} from '@/lib/db/anatomy';
import { v4 as uuidv4 } from 'uuid';

async function getAnatomyUserId(mainUserId: string): Promise<string> {
  let anatomyUser = await getAnatomyUserByMainUserId(mainUserId);
  if (!anatomyUser) {
    anatomyUser = await createAnatomyUser({
      id: uuidv4(),
      mainUserId,
      name: 'Anatomy Learner',
      preferredLearningStyle: 'mixed',
      focusSystems: [],
      lastActivityDate: null,
    });
  }
  return anatomyUser.id;
}

/**
 * GET /api/anatomy/progress
 * Get overall learning progress for the current user
 *
 * Query params:
 * - include: comma-separated list of additional data to include
 *   - quizHistory: recent quiz sessions
 *   - journeys: journey progress
 *   - user: user profile
 */
export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;

    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const include = searchParams.get('include')?.split(',') || [];

    // Get anatomy user
    const anatomyUserId = await getAnatomyUserId(payload.userId);

    // Get overall progress
    const progress = await getOverallProgress(anatomyUserId);

    const result: Record<string, unknown> = { progress };

    // Include user profile if requested
    if (include.includes('user')) {
      const user = await getAnatomyUser(anatomyUserId);
      result.user = user;
    }

    // Include quiz history if requested
    if (include.includes('quizHistory')) {
      const quizHistory = await getUserQuizHistory(anatomyUserId, 10);
      result.quizHistory = quizHistory;
    }

    // Include journey progress if requested
    if (include.includes('journeys')) {
      const journeyProgress = await getUserJourneyProgress(anatomyUserId);
      result.journeyProgress = journeyProgress;
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching progress:', error);
    return NextResponse.json(
      { error: 'Failed to fetch progress' },
      { status: 500 }
    );
  }
}
