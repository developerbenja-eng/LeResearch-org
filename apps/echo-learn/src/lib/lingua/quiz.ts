import { generateJSON } from '@/lib/ai/gemini';
import { LinguaVocabulary, QuizQuestion, QuizType, QuestionDifficulty } from '@/types/lingua';

/**
 * Levenshtein distance for fuzzy answer matching
 * Allows typo tolerance in quiz answers
 */
function levenshteinDistance(a: string, b: string): number {
  const matrix: number[][] = [];

  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }

  return matrix[b.length][a.length];
}

/**
 * Check if user's answer is correct with typo tolerance
 * Allows 1 typo per 5 characters
 */
export function checkAnswer(userAnswer: string, correctAnswer: string): boolean {
  const normalized1 = userAnswer.toLowerCase().trim();
  const normalized2 = correctAnswer.toLowerCase().trim();

  // Exact match
  if (normalized1 === normalized2) return true;

  // Calculate allowed typos based on answer length
  const allowedTypos = Math.floor(correctAnswer.length / 5);

  const distance = levenshteinDistance(normalized1, normalized2);
  return distance <= allowedTypos;
}

/**
 * Generate translation question
 * "What does 'hermosa' mean?"
 */
function generateTranslationQuestion(vocab: LinguaVocabulary): QuizQuestion {
  return {
    id: `trans-${vocab.id}`,
    vocabularyId: vocab.id,
    type: 'translation',
    question: `What does "${vocab.word}" mean?`,
    correctAnswer: vocab.native_translation || '',
    word: vocab.word,
    difficulty: determineDifficulty(vocab),
  };
}

/**
 * Generate fill-in-the-blank question using AI
 */
async function generateFillBlankQuestion(
  vocab: LinguaVocabulary,
  targetLanguage: string,
  nativeLanguage: string
): Promise<QuizQuestion> {
  interface FillBlankResponse {
    sentence: string;
    translation: string;
  }

  const prompt = `Generate a simple sentence in ${targetLanguage} using the word "${vocab.word}".

Requirements:
- The sentence should be at a beginner-intermediate level
- The sentence should clearly demonstrate the word's meaning
- Replace the word with "____" in the sentence
- Provide the translation in ${nativeLanguage}

Return JSON with:
{
  "sentence": "The sentence with ____ for the target word",
  "translation": "Translation in ${nativeLanguage}"
}`;

  try {
    const result = await generateJSON<FillBlankResponse>(prompt, {});

    return {
      id: `fill-${vocab.id}`,
      vocabularyId: vocab.id,
      type: 'fill_blank',
      question: `Fill in the blank:\n${result.sentence}`,
      correctAnswer: vocab.word,
      word: vocab.word,
      difficulty: determineDifficulty(vocab),
      context: result.translation,
    };
  } catch (error) {
    console.error('Error generating fill-blank question:', error);
    // Fallback to simple question
    return {
      id: `fill-${vocab.id}`,
      vocabularyId: vocab.id,
      type: 'fill_blank',
      question: `Complete: ____ means "${vocab.native_translation}"`,
      correctAnswer: vocab.word,
      word: vocab.word,
      difficulty: determineDifficulty(vocab),
    };
  }
}

/**
 * Generate multiple choice question with AI-generated distractors
 */
async function generateMultipleChoiceQuestion(
  vocab: LinguaVocabulary,
  targetLanguage: string,
  nativeLanguage: string
): Promise<QuizQuestion> {
  interface MCResponse {
    distractors: string[];
  }

  const prompt = `Generate 3 plausible but incorrect translations for the ${targetLanguage} word "${vocab.word}".
The correct translation is "${vocab.native_translation}".

Requirements:
- Distractors should be in ${nativeLanguage}
- They should be similar enough to be plausible
- But clearly different from the correct answer
- All should be single words or short phrases

Return JSON with:
{
  "distractors": ["wrong1", "wrong2", "wrong3"]
}`;

  try {
    const result = await generateJSON<MCResponse>(prompt, {});

    // Shuffle options
    const options = [vocab.native_translation || '', ...result.distractors];
    options.sort(() => Math.random() - 0.5);

    return {
      id: `mc-${vocab.id}`,
      vocabularyId: vocab.id,
      type: 'multiple_choice',
      question: `What does "${vocab.word}" mean?`,
      correctAnswer: vocab.native_translation || '',
      options,
      word: vocab.word,
      difficulty: determineDifficulty(vocab),
    };
  } catch (error) {
    console.error('Error generating multiple choice question:', error);
    // Fallback to translation question
    return generateTranslationQuestion(vocab);
  }
}

/**
 * Determine question difficulty based on vocabulary stats
 */
function determineDifficulty(vocab: LinguaVocabulary): QuestionDifficulty {
  const timesCorrect = vocab.times_correct || 0;
  const timesSeen = vocab.times_seen || 1;
  const accuracy = timesCorrect / timesSeen;

  if (accuracy >= 0.8 && timesSeen >= 3) return 'easy';
  if (accuracy >= 0.5) return 'medium';
  return 'hard';
}

/**
 * Generate quiz questions from vocabulary list
 */
export async function generateQuizQuestions(
  vocabulary: LinguaVocabulary[],
  questionCount: number,
  targetLanguage: string,
  nativeLanguage: string,
  questionTypes?: QuizType[]
): Promise<QuizQuestion[]> {
  const selectedVocab = vocabulary.slice(0, questionCount);
  const questions: QuizQuestion[] = [];

  const availableTypes: QuizType[] = questionTypes || [
    'translation',
    'fill_blank',
    'multiple_choice',
  ];

  for (const vocab of selectedVocab) {
    // Randomly select question type
    const typeIndex = Math.floor(Math.random() * availableTypes.length);
    const questionType = availableTypes[typeIndex];

    let question: QuizQuestion;

    switch (questionType) {
      case 'translation':
        question = generateTranslationQuestion(vocab);
        break;

      case 'fill_blank':
        question = await generateFillBlankQuestion(
          vocab,
          targetLanguage,
          nativeLanguage
        );
        break;

      case 'multiple_choice':
        question = await generateMultipleChoiceQuestion(
          vocab,
          targetLanguage,
          nativeLanguage
        );
        break;

      case 'listening':
        // Listening not implemented yet - fallback to translation
        question = generateTranslationQuestion(vocab);
        break;

      default:
        question = generateTranslationQuestion(vocab);
    }

    questions.push(question);
  }

  return questions;
}

/**
 * Get recommended quiz vocabulary
 * Prioritizes words that need review
 */
export function selectQuizVocabulary(
  allVocabulary: LinguaVocabulary[],
  count: number
): LinguaVocabulary[] {
  // Filter out 'new' words - only quiz words user has seen at least once
  const eligibleVocab = allVocabulary.filter(
    (v) => v.status !== 'new' && v.times_seen && v.times_seen > 0
  );

  if (eligibleVocab.length === 0) return [];

  // Sort by priority:
  // 1. Due for review (highest priority)
  // 2. Low accuracy (needs practice)
  // 3. Recently seen (reinforce learning)
  const scored = eligibleVocab.map((vocab) => {
    let score = 0;

    // Check if due for review
    if (vocab.next_review_date) {
      const now = new Date();
      now.setHours(0, 0, 0, 0);
      const reviewDate = new Date(vocab.next_review_date);
      if (reviewDate <= now) {
        score += 100; // High priority for due words
      }
    }

    // Low accuracy = higher priority
    const accuracy =
      vocab.times_seen && vocab.times_seen > 0
        ? (vocab.times_correct || 0) / vocab.times_seen
        : 0;
    score += (1 - accuracy) * 50;

    // Recently seen = medium priority
    if (vocab.last_seen_at) {
      const daysSinceLastSeen = Math.floor(
        (Date.now() - new Date(vocab.last_seen_at).getTime()) / (1000 * 60 * 60 * 24)
      );
      if (daysSinceLastSeen <= 7) {
        score += 20;
      }
    }

    // Add some randomness to avoid always quizzing the same words
    score += Math.random() * 10;

    return { vocab, score };
  });

  // Sort by score descending and take top N
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, count).map((s) => s.vocab);
}

/**
 * Calculate quiz score and grade
 */
export function calculateQuizScore(correctAnswers: number, totalQuestions: number): {
  score: number;
  percentage: number;
  grade: string;
} {
  const percentage = Math.round((correctAnswers / totalQuestions) * 100);

  let grade = 'F';
  if (percentage >= 90) grade = 'A';
  else if (percentage >= 80) grade = 'B';
  else if (percentage >= 70) grade = 'C';
  else if (percentage >= 60) grade = 'D';

  return {
    score: correctAnswers,
    percentage,
    grade,
  };
}
