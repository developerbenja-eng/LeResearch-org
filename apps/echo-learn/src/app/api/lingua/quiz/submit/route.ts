import { NextRequest, NextResponse } from 'next/server';
import { withLinguaAuth } from '@/lib/lingua/middleware';
import {
  createQuizSession,
  recordQuizAnswer,
  completeQuizSession,
  updateVocabSRS,
  recordReview,
  getVocabularyById,
} from '@/lib/lingua/db';
import { calculateNextReview, quizAccuracyToQuality } from '@/lib/lingua/srs';
import { checkAnswer, calculateQuizScore } from '@/lib/lingua/quiz';

interface QuizAnswer {
  vocabularyId: string;
  word: string;
  questionType: string;
  userAnswer: string;
  correctAnswer: string;
  responseTimeMs: number;
}

/**
 * POST /api/lingua/quiz/submit
 * Submit completed quiz answers and update SRS
 *
 * Body:
 * {
 *   quizType: string
 *   answers: QuizAnswer[]
 *   totalDurationSeconds: number
 * }
 */
export async function POST(request: NextRequest) {
  return withLinguaAuth(request, async (req, session) => {
    try {
      const body = await req.json();
      const {
        quizType = 'mixed',
        answers,
        totalDurationSeconds,
      } = body as {
        quizType: string;
        answers: QuizAnswer[];
        totalDurationSeconds: number;
      };

      if (!answers || !Array.isArray(answers) || answers.length === 0) {
        return NextResponse.json(
          { error: 'Quiz answers are required' },
          { status: 400 }
        );
      }

      // Create quiz session
      const quizSession = await createQuizSession(
        session.userId,
        quizType,
        answers.length
      );

      let correctAnswers = 0;
      const results: Array<{
        word: string;
        isCorrect: boolean;
        userAnswer: string;
        correctAnswer: string;
      }> = [];

      // Process each answer
      for (const answer of answers) {
        const {
          vocabularyId,
          word,
          questionType,
          userAnswer,
          correctAnswer,
          responseTimeMs,
        } = answer;

        // Check if answer is correct (with typo tolerance)
        const isCorrect = checkAnswer(userAnswer, correctAnswer);
        if (isCorrect) correctAnswers++;

        // Record quiz answer
        await recordQuizAnswer(
          quizSession.id,
          vocabularyId,
          word,
          questionType,
          userAnswer,
          correctAnswer,
          isCorrect,
          responseTimeMs
        );

        results.push({
          word,
          isCorrect,
          userAnswer,
          correctAnswer,
        });

        // Update SRS for this word
        try {
          const vocab = await getVocabularyById(vocabularyId);
          if (vocab) {
            const quality = quizAccuracyToQuality(isCorrect, responseTimeMs);
            const currentEaseFactor = vocab.ease_factor || 2.5;
            const currentInterval = vocab.interval_days || 0;
            const currentReviewCount = vocab.review_count || 0;

            const srsResult = calculateNextReview({
              quality,
              easeFactor: currentEaseFactor,
              intervalDays: currentInterval,
              reviewCount: currentReviewCount,
            });

            // Update vocabulary SRS data
            await updateVocabSRS(
              vocabularyId,
              srsResult.easeFactor,
              srsResult.intervalDays,
              srsResult.nextReviewDate,
              new Date().toISOString()
            );

            // Record this review in history
            await recordReview(
              session.userId,
              vocabularyId,
              word,
              quality,
              responseTimeMs,
              currentEaseFactor,
              srsResult.easeFactor,
              currentInterval,
              srsResult.intervalDays
            );
          }
        } catch (error) {
          console.error(`Error updating SRS for word ${word}:`, error);
          // Continue processing other words even if one fails
        }
      }

      // Complete quiz session
      await completeQuizSession(
        quizSession.id,
        correctAnswers,
        totalDurationSeconds
      );

      // Calculate score and grade
      const scoreData = calculateQuizScore(correctAnswers, answers.length);

      return NextResponse.json({
        success: true,
        sessionId: quizSession.id,
        results: {
          totalQuestions: answers.length,
          correctAnswers,
          ...scoreData,
          answers: results,
        },
      });
    } catch (error) {
      console.error('Error submitting quiz:', error);
      return NextResponse.json(
        { error: 'Failed to submit quiz' },
        { status: 500 }
      );
    }
  });
}
