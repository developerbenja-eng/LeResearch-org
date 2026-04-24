/**
 * SM-2 Spaced Repetition Algorithm Implementation
 *
 * Quality scale: 0-5
 * 0 = complete blackout
 * 1 = incorrect, but familiar
 * 2 = incorrect, but almost correct
 * 3 = correct, with difficulty
 * 4 = correct, with hesitation
 * 5 = perfect recall
 */

export interface SM2Input {
  quality: number; // 0-5
  easeFactor: number; // Current ease factor (default 2.5)
  intervalDays: number; // Current interval
  reviewCount: number; // Number of reviews so far
}

export interface SM2Output {
  easeFactor: number; // New ease factor
  intervalDays: number; // Days until next review
  nextReviewDate: string; // ISO date string
}

/**
 * Calculate next review using SM-2 algorithm
 */
export function calculateNextReview(input: SM2Input): SM2Output {
  const { quality, easeFactor, intervalDays, reviewCount } = input;

  // If quality < 3, restart from beginning
  if (quality < 3) {
    return {
      easeFactor: Math.max(1.3, easeFactor - 0.2), // Decrease ease factor
      intervalDays: 1, // Reset to 1 day
      nextReviewDate: getNextReviewDate(1),
    };
  }

  // Calculate new ease factor
  let newEaseFactor = easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));

  // Ease factor must be at least 1.3
  newEaseFactor = Math.max(1.3, newEaseFactor);

  // Calculate new interval
  let newInterval: number;

  if (reviewCount === 0) {
    newInterval = 1; // First review: 1 day
  } else if (reviewCount === 1) {
    newInterval = 6; // Second review: 6 days
  } else {
    // Subsequent reviews: previous interval * ease factor
    newInterval = Math.round(intervalDays * newEaseFactor);
  }

  // Cap maximum interval at 365 days (1 year)
  newInterval = Math.min(newInterval, 365);

  return {
    easeFactor: newEaseFactor,
    intervalDays: newInterval,
    nextReviewDate: getNextReviewDate(newInterval),
  };
}

/**
 * Get ISO date string for next review
 */
function getNextReviewDate(daysFromNow: number): string {
  const date = new Date();
  date.setDate(date.getDate() + daysFromNow);
  date.setHours(0, 0, 0, 0);
  return date.toISOString();
}

/**
 * Convert user's self-assessment to quality score
 * Used for flashcard-style reviews
 */
export function assessmentToQuality(assessment: 'again' | 'hard' | 'good' | 'easy'): number {
  const map = {
    again: 0,
    hard: 3,
    good: 4,
    easy: 5,
  };
  return map[assessment];
}

/**
 * Convert quiz accuracy to quality score
 * Used for quiz-based reviews
 */
export function quizAccuracyToQuality(isCorrect: boolean, responseTimeMs: number): number {
  if (!isCorrect) return 1;

  // Fast response (< 2s) = perfect recall (5)
  // Medium response (2-5s) = good recall (4)
  // Slow response (> 5s) = difficult recall (3)
  if (responseTimeMs < 2000) return 5;
  if (responseTimeMs < 5000) return 4;
  return 3;
}

/**
 * Check if a word is due for review
 */
export function isDueForReview(nextReviewDate: string | null): boolean {
  if (!nextReviewDate) return true; // Never reviewed, always due

  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const reviewDate = new Date(nextReviewDate);

  return reviewDate <= now;
}

/**
 * Get days until next review
 */
export function getDaysUntilReview(nextReviewDate: string | null): number {
  if (!nextReviewDate) return 0;

  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const reviewDate = new Date(nextReviewDate);

  const diffMs = reviewDate.getTime() - now.getTime();
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
}

/**
 * Get a human-readable description of the review interval
 */
export function getIntervalDescription(days: number): string {
  if (days === 0) return 'Today';
  if (days === 1) return 'Tomorrow';
  if (days < 7) return `In ${days} days`;
  if (days < 30) return `In ${Math.round(days / 7)} weeks`;
  if (days < 365) return `In ${Math.round(days / 30)} months`;
  return `In ${Math.round(days / 365)} years`;
}
