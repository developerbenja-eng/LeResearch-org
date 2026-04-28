import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth/jwt';
import {
  recordQuizAnswer,
  completeQuizSession,
  updateStructureProgress,
  updateUserActivity,
  getAnatomyUserByMainUserId,
} from '@/lib/db/anatomy';
import { v4 as uuidv4 } from 'uuid';

/**
 * POST /api/anatomy/quiz/submit
 * Submit quiz answers and complete the session
 *
 * Body:
 * - sessionId: quiz session ID
 * - answers: array of { questionId, structureId, userAnswer, correctAnswer, responseTimeMs }
 * - durationSeconds: total quiz duration
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
    const { sessionId, answers, durationSeconds } = body;

    if (!sessionId || !Array.isArray(answers)) {
      return NextResponse.json(
        { error: 'sessionId and answers array are required' },
        { status: 400 }
      );
    }

    // Get anatomy user
    const anatomyUser = await getAnatomyUserByMainUserId(payload.userId);
    if (!anatomyUser) {
      return NextResponse.json(
        { error: 'Anatomy user not found' },
        { status: 404 }
      );
    }

    // Record each answer and update structure progress
    let correctCount = 0;
    const results = [];

    for (const answer of answers) {
      const isCorrect = answer.userAnswer === answer.correctAnswer;
      if (isCorrect) correctCount++;

      // Record the answer
      await recordQuizAnswer({
        id: uuidv4(),
        sessionId,
        structureId: answer.structureId,
        questionType: answer.questionType || 'identification',
        questionText: answer.questionText || '',
        userAnswer: answer.userAnswer,
        correctAnswer: answer.correctAnswer,
        isCorrect,
        responseTimeMs: answer.responseTimeMs || 0,
      });

      // Update structure progress
      await updateStructureProgress(anatomyUser.id, answer.structureId, {
        quizCorrect: isCorrect,
      });

      results.push({
        structureId: answer.structureId,
        isCorrect,
        userAnswer: answer.userAnswer,
        correctAnswer: answer.correctAnswer,
      });
    }

    // Complete the quiz session
    await completeQuizSession(sessionId, durationSeconds || 0);

    // Update user activity for streak
    await updateUserActivity(anatomyUser.id);

    const score = Math.round((correctCount / answers.length) * 100);

    return NextResponse.json({
      success: true,
      sessionId,
      score,
      correctCount,
      totalCount: answers.length,
      results,
    });
  } catch (error) {
    console.error('Error submitting quiz:', error);
    return NextResponse.json(
      { error: 'Failed to submit quiz' },
      { status: 500 }
    );
  }
}
