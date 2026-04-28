import { getUniversalDb, query, queryOne } from '../db/turso';
import {
  LearningAnalytics,
  DailyProgress,
  WeeklyProgress,
} from '@/types/lingua';

/**
 * Calculate comprehensive learning analytics for a user
 */
export async function calculateLearningAnalytics(
  userId: string
): Promise<LearningAnalytics> {
  const db = getUniversalDb();

  // Get total study days (days with activity)
  const studyDaysResult = await queryOne<{ days: number }>(
    db,
    `SELECT COUNT(DISTINCT DATE(last_activity_date)) as days
     FROM lingua_users
     WHERE id = ? AND last_activity_date IS NOT NULL`,
    [userId]
  );
  const totalStudyDays = studyDaysResult?.days || 0;

  // Calculate average session duration from quiz sessions
  const avgDurationResult = await queryOne<{ avg_duration: number }>(
    db,
    `SELECT AVG(duration_seconds) as avg_duration
     FROM lingua_quiz_sessions
     WHERE user_id = ? AND duration_seconds IS NOT NULL`,
    [userId]
  );
  const averageSessionDuration = Math.round(avgDurationResult?.avg_duration || 0);

  // Get total words learned (known status or mastered)
  const totalWordsResult = await queryOne<{ count: number }>(
    db,
    `SELECT COUNT(*) as count
     FROM lingua_vocabulary
     WHERE user_id = ? AND (status = 'known' OR mastered_at IS NOT NULL)`,
    [userId]
  );
  const totalWordsLearned = totalWordsResult?.count || 0;

  // Get daily progress (last 30 days)
  const dailyProgress = await calculateDailyProgress(userId);

  // Get weekly progress (last 12 weeks)
  const weeklyProgress = await calculateWeeklyProgress(userId);

  // Calculate overall retention rate
  const retentionResult = await queryOne<{
    total_reviews: number;
    passed_reviews: number;
  }>(
    db,
    `SELECT
       COUNT(*) as total_reviews,
       SUM(CASE WHEN quality >= 3 THEN 1 ELSE 0 END) as passed_reviews
     FROM lingua_reviews
     WHERE user_id = ?`,
    [userId]
  );
  const overallRetentionRate =
    retentionResult && retentionResult.total_reviews > 0
      ? (retentionResult.passed_reviews / retentionResult.total_reviews) * 100
      : 0;

  // Calculate retention by difficulty
  const retentionByDifficulty = await calculateRetentionByDifficulty(userId);

  // Get total quizzes taken
  const quizCountResult = await queryOne<{ count: number }>(
    db,
    `SELECT COUNT(*) as count FROM lingua_quiz_sessions WHERE user_id = ?`,
    [userId]
  );
  const totalQuizzesTaken = quizCountResult?.count || 0;

  // Calculate average quiz score
  const avgQuizResult = await queryOne<{
    avg_correct: number;
    avg_total: number;
  }>(
    db,
    `SELECT
       AVG(correct_answers) as avg_correct,
       AVG(total_questions) as avg_total
     FROM lingua_quiz_sessions
     WHERE user_id = ? AND completed_at IS NOT NULL`,
    [userId]
  );
  const averageQuizScore =
    avgQuizResult && avgQuizResult.avg_total > 0
      ? (avgQuizResult.avg_correct / avgQuizResult.avg_total) * 100
      : 0;

  // Get quiz accuracy trend (last 10 quizzes)
  const quizAccuracyTrend = await calculateQuizAccuracyTrend(userId);

  // Get most reviewed words
  const mostReviewedWords = await query<{ word: string; count: number }>(
    db,
    `SELECT word, COUNT(*) as count
     FROM lingua_reviews
     WHERE user_id = ?
     GROUP BY word
     ORDER BY count DESC
     LIMIT 10`,
    [userId]
  );

  // Get weakest words (low retention rate)
  const weakestWords = await calculateWeakestWords(userId);

  // Get fastest learned words
  const fastestLearnedWords = await calculateFastestLearnedWords(userId);

  // Study time by day of week
  const studyTimeByDayOfWeek = await calculateStudyTimeByDayOfWeek(userId);

  // Study time by hour
  const studyTimeByHour = await calculateStudyTimeByHour(userId);

  // Get words scheduled for review
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const scheduledResult = await queryOne<{ count: number }>(
    db,
    `SELECT COUNT(*) as count
     FROM lingua_vocabulary
     WHERE user_id = ? AND next_review_date <= ?`,
    [userId, now.toISOString()]
  );
  const wordsScheduledForReview = scheduledResult?.count || 0;

  // Calculate average review interval
  const avgIntervalResult = await queryOne<{ avg_interval: number }>(
    db,
    `SELECT AVG(interval_days) as avg_interval
     FROM lingua_vocabulary
     WHERE user_id = ? AND interval_days IS NOT NULL AND interval_days > 0`,
    [userId]
  );
  const averageReviewInterval = Math.round(avgIntervalResult?.avg_interval || 0);

  // Calculate SRS efficiency (ratio of successful reviews)
  const srsEfficiencyResult = await queryOne<{
    total: number;
    successful: number;
  }>(
    db,
    `SELECT
       COUNT(*) as total,
       SUM(CASE WHEN quality >= 4 THEN 1 ELSE 0 END) as successful
     FROM lingua_reviews
     WHERE user_id = ?`,
    [userId]
  );
  const srsEfficiency =
    srsEfficiencyResult && srsEfficiencyResult.total > 0
      ? (srsEfficiencyResult.successful / srsEfficiencyResult.total) * 100
      : 0;

  return {
    totalStudyDays,
    averageSessionDuration,
    totalWordsLearned,
    dailyProgress,
    weeklyProgress,
    overallRetentionRate: Math.round(overallRetentionRate * 10) / 10,
    retentionByDifficulty,
    totalQuizzesTaken,
    averageQuizScore: Math.round(averageQuizScore * 10) / 10,
    quizAccuracyTrend,
    mostReviewedWords,
    weakestWords,
    fastestLearnedWords,
    studyTimeByDayOfWeek,
    studyTimeByHour,
    wordsScheduledForReview,
    averageReviewInterval,
    srsEfficiency: Math.round(srsEfficiency * 10) / 10,
  };
}

async function calculateDailyProgress(userId: string): Promise<DailyProgress[]> {
  const db = getUniversalDb();
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const progress = await query<{
    date: string;
    reviews: number;
    newWords: number;
  }>(
    db,
    `SELECT
       DATE(reviewed_at) as date,
       COUNT(*) as reviews,
       COUNT(DISTINCT vocabulary_id) as newWords
     FROM lingua_reviews
     WHERE user_id = ? AND reviewed_at >= ?
     GROUP BY DATE(reviewed_at)
     ORDER BY date ASC`,
    [userId, thirtyDaysAgo.toISOString()]
  );

  return progress.map((p) => ({
    date: p.date,
    wordsLearned: p.newWords,
    wordsReviewed: p.reviews,
  }));
}

async function calculateWeeklyProgress(
  userId: string
): Promise<WeeklyProgress[]> {
  const db = getUniversalDb();
  const twelveWeeksAgo = new Date();
  twelveWeeksAgo.setDate(twelveWeeksAgo.getDate() - 84);

  const progress = await query<{
    week_start: string;
    reviews: number;
    new_words: number;
  }>(
    db,
    `SELECT
       DATE(reviewed_at, 'weekday 0', '-6 days') as week_start,
       COUNT(*) as reviews,
       COUNT(DISTINCT vocabulary_id) as new_words
     FROM lingua_reviews
     WHERE user_id = ? AND reviewed_at >= ?
     GROUP BY week_start
     ORDER BY week_start ASC`,
    [userId, twelveWeeksAgo.toISOString()]
  );

  return progress.map((p) => ({
    weekStart: p.week_start,
    wordsLearned: p.new_words,
    wordsReviewed: p.reviews,
    quizzesTaken: 0,
    studyMinutes: 0,
  }));
}

async function calculateRetentionByDifficulty(
  userId: string
): Promise<Record<number, number>> {
  const db = getUniversalDb();

  // Get retention rate for each difficulty level (1-5)
  const retention: Record<number, number> = {};

  for (let difficulty = 1; difficulty <= 5; difficulty++) {
    const result = await queryOne<{ total: number; passed: number }>(
      db,
      `SELECT
         COUNT(*) as total,
         SUM(CASE WHEN quality >= 3 THEN 1 ELSE 0 END) as passed
       FROM lingua_reviews r
       JOIN lingua_word_details wd ON r.word = wd.word
       WHERE r.user_id = ? AND wd.difficulty_level = ?`,
      [userId, difficulty]
    );

    retention[difficulty] =
      result && result.total > 0 ? (result.passed / result.total) * 100 : 0;
  }

  return retention;
}

async function calculateQuizAccuracyTrend(
  userId: string
): Promise<Array<{ date: string; accuracy: number }>> {
  const db = getUniversalDb();

  const trend = await query<{
    date: string;
    correct: number;
    total: number;
  }>(
    db,
    `SELECT
       DATE(created_at) as date,
       SUM(correct_answers) as correct,
       SUM(total_questions) as total
     FROM lingua_quiz_sessions
     WHERE user_id = ? AND completed_at IS NOT NULL
     GROUP BY DATE(created_at)
     ORDER BY date DESC
     LIMIT 10`,
    [userId]
  );

  return trend.map((t) => ({
    date: t.date,
    accuracy: t.total > 0 ? (t.correct / t.total) * 100 : 0,
  }));
}

async function calculateWeakestWords(
  userId: string
): Promise<Array<{ word: string; retentionRate: number }>> {
  const db = getUniversalDb();

  const words = await query<{
    word: string;
    total: number;
    passed: number;
  }>(
    db,
    `SELECT
       word,
       COUNT(*) as total,
       SUM(CASE WHEN quality >= 3 THEN 1 ELSE 0 END) as passed
     FROM lingua_reviews
     WHERE user_id = ?
     GROUP BY word
     HAVING total >= 3
     ORDER BY (passed * 1.0 / total) ASC
     LIMIT 10`,
    [userId]
  );

  return words.map((w) => ({
    word: w.word,
    retentionRate: (w.passed / w.total) * 100,
  }));
}

async function calculateFastestLearnedWords(
  userId: string
): Promise<Array<{ word: string; daysToMaster: number }>> {
  const db = getUniversalDb();

  const words = await query<{
    word: string;
    first_seen: string;
    mastered: string;
  }>(
    db,
    `SELECT word, first_seen_at as first_seen, mastered_at as mastered
     FROM lingua_vocabulary
     WHERE user_id = ? AND mastered_at IS NOT NULL
     ORDER BY (JULIANDAY(mastered_at) - JULIANDAY(first_seen_at)) ASC
     LIMIT 10`,
    [userId]
  );

  return words.map((w) => {
    const firstSeen = new Date(w.first_seen).getTime();
    const mastered = new Date(w.mastered).getTime();
    const days = Math.round((mastered - firstSeen) / (1000 * 60 * 60 * 24));
    return { word: w.word, daysToMaster: days };
  });
}

async function calculateStudyTimeByDayOfWeek(
  userId: string
): Promise<Record<string, number>> {
  const db = getUniversalDb();

  const dayNames = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
  ];
  const studyTime: Record<string, number> = {};

  const data = await query<{ day: number; minutes: number }>(
    db,
    `SELECT
       CAST(strftime('%w', created_at) AS INTEGER) as day,
       SUM(duration_seconds) / 60 as minutes
     FROM lingua_quiz_sessions
     WHERE user_id = ? AND duration_seconds IS NOT NULL
     GROUP BY day`,
    [userId]
  );

  // Initialize all days to 0
  dayNames.forEach((day) => (studyTime[day] = 0));

  // Fill in actual data
  data.forEach((d) => {
    studyTime[dayNames[d.day]] = Math.round(d.minutes);
  });

  return studyTime;
}

async function calculateStudyTimeByHour(
  userId: string
): Promise<Record<number, number>> {
  const db = getUniversalDb();

  const studyTime: Record<number, number> = {};

  const data = await query<{ hour: number; minutes: number }>(
    db,
    `SELECT
       CAST(strftime('%H', created_at) AS INTEGER) as hour,
       SUM(duration_seconds) / 60 as minutes
     FROM lingua_quiz_sessions
     WHERE user_id = ? AND duration_seconds IS NOT NULL
     GROUP BY hour`,
    [userId]
  );

  // Initialize all hours to 0
  for (let i = 0; i < 24; i++) {
    studyTime[i] = 0;
  }

  // Fill in actual data
  data.forEach((d) => {
    studyTime[d.hour] = Math.round(d.minutes);
  });

  return studyTime;
}
