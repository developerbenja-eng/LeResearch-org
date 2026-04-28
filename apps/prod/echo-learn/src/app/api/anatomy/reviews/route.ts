import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth/jwt';
import {
  getDueVocabulary,
  updateVocabSRS,
  recordReview,
  updateUserActivity,
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
 * GET /api/anatomy/reviews
 * Get vocabulary items due for review
 *
 * Query params:
 * - limit: max number of items (default 20)
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
    const limit = parseInt(searchParams.get('limit') || '20', 10);

    // Get anatomy user
    const anatomyUserId = await getAnatomyUserId(payload.userId);

    // Get due vocabulary
    const dueItems = await getDueVocabulary(anatomyUserId, limit);

    return NextResponse.json({
      items: dueItems,
      count: dueItems.length,
    });
  } catch (error) {
    console.error('Error fetching due reviews:', error);
    return NextResponse.json(
      { error: 'Failed to fetch due reviews' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/anatomy/reviews
 * Submit a review for a vocabulary item
 *
 * Body:
 * - vocabularyId: ID of the vocabulary item
 * - quality: quality of recall (0-5, where 0=complete blackout, 5=perfect)
 * - responseTimeMs: time taken to respond in milliseconds
 */
export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const { vocabularyId, quality, responseTimeMs } = body;

    if (!vocabularyId || typeof quality !== 'number' || quality < 0 || quality > 5) {
      return NextResponse.json(
        { error: 'vocabularyId and quality (0-5) are required' },
        { status: 400 }
      );
    }

    // Get anatomy user
    const anatomyUserId = await getAnatomyUserId(payload.userId);

    // Get current vocab state for recording
    const result = await updateVocabSRS(vocabularyId, quality, responseTimeMs || 0);

    // Record the review
    await recordReview({
      id: uuidv4(),
      userId: anatomyUserId,
      vocabularyId,
      structureId: null,
      reviewType: 'vocabulary',
      quality,
      responseTimeMs: responseTimeMs || 0,
      previousEaseFactor: result.easeFactor, // Simplified - would need to track previous
      newEaseFactor: result.easeFactor,
      previousInterval: 0,
      newInterval: result.intervalDays,
    });

    // Update user activity for streak
    await updateUserActivity(anatomyUserId);

    return NextResponse.json({
      success: true,
      nextReviewDate: result.nextReviewDate,
      intervalDays: result.intervalDays,
      easeFactor: result.easeFactor,
      isCorrect: quality >= 3,
    });
  } catch (error) {
    console.error('Error submitting review:', error);
    return NextResponse.json(
      { error: 'Failed to submit review' },
      { status: 500 }
    );
  }
}
