import { NextRequest, NextResponse } from 'next/server';
import { withLinguaAuth } from '@/lib/lingua/middleware';
import { getVocabulary } from '@/lib/lingua/db';
import { generateQuizQuestions, selectQuizVocabulary } from '@/lib/lingua/quiz';
import { QuizType } from '@/types/lingua';

/**
 * POST /api/lingua/quiz/generate
 * Generate a new quiz with questions from user's vocabulary
 *
 * Body:
 * {
 *   questionCount: number (default: 10)
 *   questionTypes?: ('translation' | 'fill_blank' | 'multiple_choice' | 'listening')[]
 *   difficulty?: 'easy' | 'medium' | 'hard' | 'mixed' (default: 'mixed')
 * }
 */
export async function POST(request: NextRequest) {
  return withLinguaAuth(request, async (req, session) => {
    try {
      const body = await req.json();
      const {
        questionCount = 10,
        questionTypes,
        difficulty = 'mixed',
      } = body;

      // Validate question count
      if (questionCount < 1 || questionCount > 50) {
        return NextResponse.json(
          { error: 'Question count must be between 1 and 50' },
          { status: 400 }
        );
      }

      // Get user's vocabulary
      const allVocabulary = await getVocabulary(session.userId);

      // Filter out 'new' words - only quiz words that have been seen
      const eligibleVocab = allVocabulary.filter(
        (v) => v.status !== 'new' && v.times_seen && v.times_seen > 0
      );

      if (eligibleVocab.length === 0) {
        return NextResponse.json(
          {
            error: 'No vocabulary available for quiz',
            message: 'Start practicing conversations to build your vocabulary first!',
          },
          { status: 400 }
        );
      }

      // Check if user has enough vocabulary
      const availableCount = eligibleVocab.length;
      const actualQuestionCount = Math.min(questionCount, availableCount);

      if (actualQuestionCount < questionCount) {
        console.log(
          `Requested ${questionCount} questions but only ${availableCount} words available`
        );
      }

      // Filter by difficulty if specified
      let vocabularyPool = eligibleVocab;
      if (difficulty !== 'mixed') {
        vocabularyPool = eligibleVocab.filter((v) => {
          const accuracy =
            v.times_seen && v.times_seen > 0
              ? (v.times_correct || 0) / v.times_seen
              : 0;

          switch (difficulty) {
            case 'easy':
              return accuracy >= 0.7;
            case 'medium':
              return accuracy >= 0.4 && accuracy < 0.7;
            case 'hard':
              return accuracy < 0.4;
            default:
              return true;
          }
        });

        // If not enough words at this difficulty, fall back to all eligible vocab
        if (vocabularyPool.length < actualQuestionCount) {
          console.log(
            `Not enough ${difficulty} words, falling back to mixed difficulty`
          );
          vocabularyPool = eligibleVocab;
        }
      }

      // Select vocabulary for quiz (prioritizes due words and low accuracy)
      const selectedVocab = selectQuizVocabulary(
        vocabularyPool,
        actualQuestionCount
      );

      // Generate questions
      const questions = await generateQuizQuestions(
        selectedVocab,
        actualQuestionCount,
        session.targetLang,
        session.nativeLang,
        questionTypes as QuizType[] | undefined
      );

      return NextResponse.json({
        success: true,
        quiz: {
          questions,
          totalQuestions: questions.length,
          difficulty,
          questionTypes: questionTypes || ['translation', 'fill_blank', 'multiple_choice'],
        },
        metadata: {
          availableVocabulary: availableCount,
          requestedCount: questionCount,
          generatedCount: questions.length,
        },
      });
    } catch (error) {
      console.error('Error generating quiz:', error);
      return NextResponse.json(
        { error: 'Failed to generate quiz' },
        { status: 500 }
      );
    }
  });
}
