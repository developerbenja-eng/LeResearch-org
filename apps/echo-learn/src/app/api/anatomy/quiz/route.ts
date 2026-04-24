import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth/jwt';
import {
  getAllStructures,
  createQuizSession,
  getAnatomyUserByMainUserId,
  createAnatomyUser,
} from '@/lib/db/anatomy';
import { v4 as uuidv4 } from 'uuid';
import type { BodySystem, BodyRegion, AnatomyDifficulty, QuizType, QuizQuestion } from '@/types/anatomy';

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

function generateQuestions(
  structures: { id: string; name: string; latinName: string | null; description: string; system: BodySystem; region: BodyRegion; category: string }[],
  quizType: QuizType,
  count: number,
  difficulty: AnatomyDifficulty
): QuizQuestion[] {
  const questions: QuizQuestion[] = [];
  const shuffled = [...structures].sort(() => Math.random() - 0.5);

  for (let i = 0; i < Math.min(count, shuffled.length); i++) {
    const structure = shuffled[i];
    const otherStructures = shuffled.filter((s) => s.id !== structure.id).slice(0, 3);

    let question: QuizQuestion;

    switch (quizType) {
      case 'identification':
        question = {
          id: uuidv4(),
          structureId: structure.id,
          type: 'identification',
          question: `What is the name of this structure?\n\n"${structure.description.slice(0, 100)}..."`,
          correctAnswer: structure.name,
          options: [
            structure.name,
            ...otherStructures.map((s) => s.name),
          ].sort(() => Math.random() - 0.5),
          difficulty,
        };
        break;

      case 'function':
        question = {
          id: uuidv4(),
          structureId: structure.id,
          type: 'function',
          question: `What is the primary function or role of the ${structure.name}?`,
          correctAnswer: structure.description.slice(0, 150),
          options: [
            structure.description.slice(0, 150),
            ...otherStructures.map((s) => s.description.slice(0, 150)),
          ].sort(() => Math.random() - 0.5),
          difficulty,
        };
        break;

      case 'relationships':
        question = {
          id: uuidv4(),
          structureId: structure.id,
          type: 'relationships',
          question: `The ${structure.name} belongs to which body system?`,
          correctAnswer: structure.system,
          options: [...new Set([structure.system, ...otherStructures.map((s) => s.system)])].slice(0, 4).sort(() => Math.random() - 0.5),
          difficulty,
        };
        break;

      case 'labeling':
        question = {
          id: uuidv4(),
          structureId: structure.id,
          type: 'labeling',
          question: `Select the correct Latin name for "${structure.name}":`,
          correctAnswer: structure.latinName || structure.name,
          options: [
            structure.latinName || structure.name,
            ...otherStructures.map((s) => s.latinName || s.name),
          ].sort(() => Math.random() - 0.5),
          difficulty,
        };
        break;

      default:
        question = {
          id: uuidv4(),
          structureId: structure.id,
          type: 'identification',
          question: `What is the name of this structure in the ${structure.system} system?`,
          correctAnswer: structure.name,
          options: [
            structure.name,
            ...otherStructures.map((s) => s.name),
          ].sort(() => Math.random() - 0.5),
          difficulty,
        };
    }

    questions.push(question);
  }

  return questions;
}

/**
 * POST /api/anatomy/quiz
 * Generate a new quiz session
 *
 * Body:
 * - quizType: type of quiz (identification, labeling, function, relationships, clinical, mixed)
 * - focusSystem: optional body system to focus on
 * - focusRegion: optional body region to focus on
 * - difficulty: difficulty level (default: beginner)
 * - questionCount: number of questions (default: 10)
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
    const {
      quizType = 'identification',
      focusSystem,
      focusRegion,
      difficulty = 'beginner',
      questionCount = 10,
    } = body;

    // Get anatomy user
    const anatomyUserId = await getAnatomyUserId(payload.userId);

    // Get structures for quiz
    const structures = await getAllStructures({
      system: focusSystem,
      region: focusRegion,
      difficulty,
      limit: 50,
    });

    if (structures.length < 4) {
      return NextResponse.json(
        { error: 'Not enough structures available for a quiz with these filters' },
        { status: 400 }
      );
    }

    // Generate questions
    const questions = generateQuestions(structures, quizType, questionCount, difficulty);

    // Create quiz session
    const session = await createQuizSession({
      id: uuidv4(),
      userId: anatomyUserId,
      quizType,
      focusSystem: focusSystem || null,
      focusRegion: focusRegion || null,
      difficulty,
      totalQuestions: questions.length,
    });

    return NextResponse.json({
      session,
      questions,
    });
  } catch (error) {
    console.error('Error generating quiz:', error);
    return NextResponse.json(
      { error: 'Failed to generate quiz' },
      { status: 500 }
    );
  }
}
