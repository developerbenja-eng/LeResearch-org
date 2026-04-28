/**
 * Echo-Lin V3 Learning Pattern Analyzer
 *
 * Calculates learning profiles from tracked interaction data
 * Based on NC Math Platform's metacognitive analysis approach
 */

import { getUniversalDb, execute } from '../../db/turso';
import {
  LearningProfile,
  LearningApproach,
  PreferredPace,
  ReviewTiming,
  LearningStyleIndicators,
  TabUsagePattern,
} from './types';

// ============================================================================
// LEARNING PROFILE CALCULATION
// ============================================================================

/**
 * Calculate complete learning profile for a user
 * Should be called after every 5 sessions or significant milestone
 */
export async function calculateLearningProfile(userId: string): Promise<LearningProfile> {
  const db = getUniversalDb();

  // Get all user sessions and interactions
  const sessions = await getUserSessions(userId);
  const interactions = await getUserInteractions(userId);
  const wordInteractions = await getUserWordInteractions(userId);

  // Calculate each component of the profile
  const modalities = await calculateLearningModalities(userId, interactions, wordInteractions);
  const approach = await calculateLearningApproach(userId, interactions);
  const pace = calculatePreferredPace(sessions, interactions);
  const engagement = calculateEngagementMetrics(sessions, interactions);
  const reviewBehavior = await calculateReviewBehavior(userId);
  const featurePreferences = calculateFeaturePreferences(interactions);

  const profile: LearningProfile = {
    id: `profile_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    userId,
    calculatedAt: new Date().toISOString(),

    // Learning modalities
    visualLearning: modalities.visual.score,
    verbalLearning: modalities.verbal.score,
    kinestheticLearning: modalities.kinesthetic.score,
    analyticalLearning: modalities.analytical.score,

    // Learning approach
    learningApproach: approach,
    preferredPace: pace,

    // Engagement metrics
    avgSessionDuration: engagement.avgSessionDuration,
    persistenceScore: engagement.persistenceScore,
    confidenceLevel: engagement.confidenceLevel,
    fatigueThreshold: engagement.fatigueThreshold,

    // Review behavior
    srsAdherence: reviewBehavior.srsAdherence,
    reviewTiming: reviewBehavior.reviewTiming,
    optimalSessionLength: reviewBehavior.optimalSessionLength,

    // Feature preferences
    quizFrequency: featurePreferences.quizFrequency,
    explorationDepth: featurePreferences.explorationDepth,
    difficultyAdaptation: featurePreferences.difficultyAdaptation,

    // Sample size
    totalSessions: sessions.length,
    totalInteractions: interactions.length,
  };

  // Save profile to database
  await saveProfile(profile);

  return profile;
}

/**
 * Calculate learning modality scores (0-1 scale)
 */
async function calculateLearningModalities(
  userId: string,
  interactions: any[],
  wordInteractions: any[]
): Promise<LearningStyleIndicators> {
  const db = getUniversalDb();

  // Visual Learning Score
  // = (popup_detail_views / total_word_clicks) × 0.4
  // + (grammar_chart_views / total_interactions) × 0.3
  // + (example_sentence_reads / popup_views) × 0.3

  const totalWordClicks = wordInteractions.filter((wi) => wi.interaction_type === 'click').length;
  const popupViews = wordInteractions.filter((wi) => wi.interaction_type === 'popup_open').length;

  let popupDetailViews = 0;
  let exampleSentenceReads = 0;

  wordInteractions
    .filter((wi) => wi.interaction_type === 'popup_open' && wi.sections_viewed)
    .forEach((wi) => {
      const sections = JSON.parse(wi.sections_viewed);
      if (sections.length >= 2) popupDetailViews++;
      if (sections.includes('examples')) exampleSentenceReads++;
    });

  const grammarChartViews = interactions.filter(
    (i) => i.event_type === 'feature_used' && i.metadata && JSON.parse(i.metadata).featureName === 'grammar_chart'
  ).length;

  const visualScore =
    totalWordClicks > 0 && popupViews > 0 && interactions.length > 0
      ? (popupDetailViews / totalWordClicks) * 0.4 +
        (grammarChartViews / interactions.length) * 0.3 +
        (exampleSentenceReads / popupViews) * 0.3
      : 0;

  // Verbal Learning Score
  // = (text_read_time / total_session_time) × 0.5
  // + (note_taking_events / word_interactions) × 0.5
  // Note: text_read_time is hard to measure, so we approximate with tab time

  const practiceTabTime = interactions
    .filter((i) => i.event_type === 'tab_switch' && JSON.parse(i.metadata || '{}').toTab === 'practice')
    .reduce((sum, i) => {
      const meta = JSON.parse(i.metadata || '{}');
      return sum + (meta.timeInPreviousTab || 0);
    }, 0);

  const totalSessionTime = await getTotalSessionTime(userId);

  const verbalScore = totalSessionTime > 0 ? (practiceTabTime / totalSessionTime) * 0.5 : 0;

  // Kinesthetic Learning Score
  // = (interactive_tool_usage / total_interactions) × 0.6
  // + (exploration_tab_time / total_time) × 0.4

  const interactiveToolUsage = interactions.filter(
    (i) => i.event_type === 'feature_used' && i.context_type === 'explore'
  ).length;

  const exploreTabTime = interactions
    .filter((i) => i.event_type === 'tab_switch' && JSON.parse(i.metadata || '{}').toTab === 'explore')
    .reduce((sum, i) => {
      const meta = JSON.parse(i.metadata || '{}');
      return sum + (meta.timeInPreviousTab || 0);
    }, 0);

  const kinestheticScore =
    interactions.length > 0 && totalSessionTime > 0
      ? (interactiveToolUsage / interactions.length) * 0.6 + (exploreTabTime / totalSessionTime) * 0.4
      : 0;

  // Analytical Learning Score
  // = (grammar_rule_views / vocabulary_views) × 0.4
  // + (pattern_analysis_time / exploration_time) × 0.3
  // + (systematic_tab_navigation_score) × 0.3

  const grammarRuleViews = interactions.filter(
    (i) => i.event_type === 'feature_used' && JSON.parse(i.metadata || '{}').featureName?.includes('grammar')
  ).length;

  const vocabularyViews = interactions.filter(
    (i) => i.event_type === 'tab_switch' && JSON.parse(i.metadata || '{}').toTab === 'vocabulary'
  ).length;

  const systematicScore = calculateSystematicNavigationScore(interactions);

  const analyticalScore =
    vocabularyViews > 0 && exploreTabTime > 0
      ? (grammarRuleViews / vocabularyViews) * 0.4 +
        (exploreTabTime / totalSessionTime) * 0.3 +
        systematicScore * 0.3
      : 0;

  return {
    visual: {
      score: Math.min(visualScore, 1.0),
      indicators: [
        popupDetailViews > totalWordClicks * 0.5 ? 'Reads full word details' : '',
        exampleSentenceReads > popupViews * 0.6 ? 'Studies example sentences' : '',
        grammarChartViews > 0 ? 'Uses grammar visualizations' : '',
      ].filter(Boolean),
    },
    verbal: {
      score: Math.min(verbalScore, 1.0),
      indicators: [
        practiceTabTime > totalSessionTime * 0.4 ? 'Prefers reading conversations' : '',
        'Engages with text-based content',
      ].filter(Boolean),
    },
    kinesthetic: {
      score: Math.min(kinestheticScore, 1.0),
      indicators: [
        interactiveToolUsage > interactions.length * 0.2 ? 'Uses interactive tools frequently' : '',
        exploreTabTime > totalSessionTime * 0.2 ? 'Explores hands-on features' : '',
      ].filter(Boolean),
    },
    analytical: {
      score: Math.min(analyticalScore, 1.0),
      indicators: [
        grammarRuleViews > 0 ? 'Studies grammar patterns' : '',
        systematicScore > 0.6 ? 'Follows systematic approach' : '',
      ].filter(Boolean),
    },
  };
}

/**
 * Calculate learning approach: contextual, systematic, immersive, or balanced
 */
async function calculateLearningApproach(
  userId: string,
  interactions: any[]
): Promise<LearningApproach> {
  // Analyze first tab visits per session
  const db = getUniversalDb();

  const firstTabs = await db.execute({
    sql: `
      SELECT
        i.session_id,
        MIN(i.timestamp) as first_time,
        (SELECT event_type FROM lingua_interactions
         WHERE session_id = i.session_id
         ORDER BY timestamp ASC LIMIT 1) as first_event
      FROM lingua_interactions i
      WHERE i.user_id = ? AND i.event_type = 'tab_switch'
      GROUP BY i.session_id
    `,
    args: [userId],
  });

  let practiceFirst = 0;
  let exploreFirst = 0;
  let quizFirst = 0;

  firstTabs.rows.forEach((row) => {
    const metadata = JSON.parse((row as any).metadata || '{}');
    const firstTab = metadata.toTab;

    if (firstTab === 'practice') practiceFirst++;
    else if (firstTab === 'explore') exploreFirst++;
    else if (firstTab === 'quiz') quizFirst++;
  });

  const total = practiceFirst + exploreFirst + quizFirst;

  if (total === 0) return 'balanced';

  // Contextual: Practice tab used 60%+ of time
  if (practiceFirst / total > 0.6) return 'contextual';

  // Systematic: Explore tab before Practice
  if (exploreFirst / total > 0.5) return 'systematic';

  // Immersive: High difficulty level, skip native translations
  // Check for high difficulty settings
  const difficultyChanges = interactions.filter((i) => i.event_type === 'difficulty_change');
  const avgDifficulty =
    difficultyChanges.length > 0
      ? difficultyChanges.reduce((sum, i) => sum + JSON.parse(i.metadata || '{}').newDifficulty, 0) /
        difficultyChanges.length
      : 50;

  if (avgDifficulty > 70) return 'immersive';

  return 'balanced';
}

/**
 * Calculate preferred pace: slow, medium, or fast
 */
function calculatePreferredPace(sessions: any[], interactions: any[]): PreferredPace {
  if (sessions.length === 0 || interactions.length === 0) return 'medium';

  const avgInteractionsPerSession = interactions.length / sessions.length;

  // Fast: > 50 interactions per session
  if (avgInteractionsPerSession > 50) return 'fast';

  // Slow: < 20 interactions per session
  if (avgInteractionsPerSession < 20) return 'slow';

  return 'medium';
}

/**
 * Calculate engagement metrics
 */
function calculateEngagementMetrics(
  sessions: any[],
  interactions: any[]
): {
  avgSessionDuration: number;
  persistenceScore: number;
  confidenceLevel: number;
  fatigueThreshold: number;
} {
  if (sessions.length === 0) {
    return {
      avgSessionDuration: 0,
      persistenceScore: 0,
      confidenceLevel: 0,
      fatigueThreshold: 0,
    };
  }

  // Average session duration (minutes)
  const avgSessionDuration =
    sessions.reduce((sum, s) => sum + (s.duration_seconds || 0), 0) / sessions.length / 60;

  // Persistence score: % of sessions > 5 minutes
  const longSessions = sessions.filter((s) => (s.duration_seconds || 0) > 300).length;
  const persistenceScore = longSessions / sessions.length;

  // Confidence level: 1 - (avg_hesitation_time / avg_response_time)
  // Approximate from interaction timing
  const hesitationInteractions = interactions.filter(
    (i) => i.metadata && JSON.parse(i.metadata).hesitationMs !== undefined
  );

  const avgHesitation =
    hesitationInteractions.length > 0
      ? hesitationInteractions.reduce((sum, i) => sum + JSON.parse(i.metadata).hesitationMs, 0) /
        hesitationInteractions.length
      : 0;

  const confidenceLevel = avgHesitation > 0 ? Math.max(0, 1 - avgHesitation / 3000) : 0.5;

  // Fatigue threshold: session length where performance drops
  // Simplified: use median session duration
  const sortedDurations = sessions.map((s) => s.duration_seconds || 0).sort((a, b) => a - b);
  const fatigueThreshold =
    sortedDurations.length > 0 ? sortedDurations[Math.floor(sortedDurations.length / 2)] / 60 : 30;

  return {
    avgSessionDuration: Math.round(avgSessionDuration),
    persistenceScore: Math.round(persistenceScore * 100) / 100,
    confidenceLevel: Math.round(confidenceLevel * 100) / 100,
    fatigueThreshold: Math.round(fatigueThreshold),
  };
}

/**
 * Calculate review behavior patterns
 */
async function calculateReviewBehavior(
  userId: string
): Promise<{
  srsAdherence: number;
  reviewTiming: ReviewTiming;
  optimalSessionLength: number;
}> {
  const db = getUniversalDb();

  // SRS Adherence: % of reviews done on time
  const reviewsResult = await db.execute({
    sql: `
      SELECT COUNT(*) as total,
        SUM(CASE WHEN reviewed_at <= next_review_date THEN 1 ELSE 0 END) as on_time
      FROM lingua_reviews
      WHERE user_id = ?
    `,
    args: [userId],
  });

  const total = Number(reviewsResult.rows[0]?.total || 0);
  const onTime = Number(reviewsResult.rows[0]?.on_time || 0);
  const srsAdherence = total > 0 ? onTime / total : 0;

  // Review Timing: most common hour of day
  const timingResult = await db.execute({
    sql: `
      SELECT
        CASE
          WHEN CAST(strftime('%H', reviewed_at) AS INTEGER) BETWEEN 5 AND 11 THEN 'morning'
          WHEN CAST(strftime('%H', reviewed_at) AS INTEGER) BETWEEN 12 AND 16 THEN 'afternoon'
          WHEN CAST(strftime('%H', reviewed_at) AS INTEGER) BETWEEN 17 AND 21 THEN 'evening'
          ELSE 'night'
        END as time_period,
        COUNT(*) as count
      FROM lingua_reviews
      WHERE user_id = ?
      GROUP BY time_period
      ORDER BY count DESC
      LIMIT 1
    `,
    args: [userId],
  });

  const reviewTiming = (timingResult.rows[0]?.time_period as ReviewTiming) || 'evening';

  // Optimal session length: when accuracy is highest
  const optimalSessionLength = 25; // Default to 25 minutes (Pomodoro technique)

  return {
    srsAdherence: Math.round(srsAdherence * 100) / 100,
    reviewTiming,
    optimalSessionLength,
  };
}

/**
 * Calculate feature preference metrics
 */
function calculateFeaturePreferences(
  interactions: any[]
): {
  quizFrequency: number;
  explorationDepth: number;
  difficultyAdaptation: number;
} {
  if (interactions.length === 0) {
    return {
      quizFrequency: 0,
      explorationDepth: 0,
      difficultyAdaptation: 0,
    };
  }

  // Quiz frequency: quiz interactions / total interactions
  const quizInteractions = interactions.filter((i) => i.context_type === 'quiz').length;
  const quizFrequency = quizInteractions / interactions.length;

  // Exploration depth: feature usage in explore context
  const exploreInteractions = interactions.filter((i) => i.context_type === 'explore').length;
  const explorationDepth = exploreInteractions / interactions.length;

  // Difficulty adaptation: frequency of difficulty changes
  const difficultyChanges = interactions.filter((i) => i.event_type === 'difficulty_change').length;
  const difficultyAdaptation = difficultyChanges / interactions.length;

  return {
    quizFrequency: Math.round(quizFrequency * 100) / 100,
    explorationDepth: Math.round(explorationDepth * 100) / 100,
    difficultyAdaptation: Math.round(difficultyAdaptation * 100) / 100,
  };
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

async function getUserSessions(userId: string): Promise<any[]> {
  const db = getUniversalDb();
  const result = await db.execute({
    sql: 'SELECT * FROM lingua_sessions WHERE user_id = ? ORDER BY started_at DESC',
    args: [userId],
  });
  return result.rows;
}

async function getUserInteractions(userId: string): Promise<any[]> {
  const db = getUniversalDb();
  const result = await db.execute({
    sql: 'SELECT * FROM lingua_interactions WHERE user_id = ? ORDER BY timestamp DESC',
    args: [userId],
  });
  return result.rows;
}

async function getUserWordInteractions(userId: string): Promise<any[]> {
  const db = getUniversalDb();
  const result = await db.execute({
    sql: 'SELECT * FROM lingua_word_interactions WHERE user_id = ? ORDER BY occurred_at DESC',
    args: [userId],
  });
  return result.rows;
}

async function getTotalSessionTime(userId: string): Promise<number> {
  const db = getUniversalDb();
  const result = await db.execute({
    sql: `
      SELECT SUM(duration_seconds) as total
      FROM lingua_sessions
      WHERE user_id = ? AND duration_seconds IS NOT NULL
    `,
    args: [userId],
  });
  return Number(result.rows[0]?.total || 0);
}

function calculateSystematicNavigationScore(interactions: any[]): number {
  // Check if user follows a pattern: Practice → Explore → Quiz or Explore → Practice → Quiz
  const tabSwitches = interactions.filter((i) => i.event_type === 'tab_switch');

  if (tabSwitches.length < 3) return 0;

  let systematicCount = 0;

  for (let i = 0; i < tabSwitches.length - 2; i++) {
    const meta1 = JSON.parse(tabSwitches[i].metadata || '{}');
    const meta2 = JSON.parse(tabSwitches[i + 1].metadata || '{}');
    const meta3 = JSON.parse(tabSwitches[i + 2].metadata || '{}');

    const sequence = `${meta1.toTab}-${meta2.toTab}-${meta3.toTab}`;

    if (
      sequence === 'practice-explore-quiz' ||
      sequence === 'explore-practice-quiz' ||
      sequence === 'practice-vocabulary-quiz'
    ) {
      systematicCount++;
    }
  }

  return systematicCount / (tabSwitches.length - 2);
}

async function saveProfile(profile: LearningProfile): Promise<void> {
  const db = getUniversalDb();

  // Check if profile exists
  const existing = await db.execute({
    sql: 'SELECT id FROM lingua_learning_profiles WHERE user_id = ?',
    args: [profile.userId],
  });

  if (existing.rows.length > 0) {
    // Update existing profile
    await db.execute({
      sql: `
        UPDATE lingua_learning_profiles SET
          calculated_at = ?,
          visual_learning = ?,
          verbal_learning = ?,
          kinesthetic_learning = ?,
          analytical_learning = ?,
          learning_approach = ?,
          preferred_pace = ?,
          avg_session_duration = ?,
          persistence_score = ?,
          confidence_level = ?,
          fatigue_threshold = ?,
          srs_adherence = ?,
          review_timing = ?,
          optimal_session_length = ?,
          quiz_frequency = ?,
          exploration_depth = ?,
          difficulty_adaptation = ?,
          total_sessions = ?,
          total_interactions = ?
        WHERE user_id = ?
      `,
      args: [
        profile.calculatedAt,
        profile.visualLearning,
        profile.verbalLearning,
        profile.kinestheticLearning,
        profile.analyticalLearning,
        profile.learningApproach || null,
        profile.preferredPace || null,
        profile.avgSessionDuration || null,
        profile.persistenceScore || null,
        profile.confidenceLevel || null,
        profile.fatigueThreshold || null,
        profile.srsAdherence || null,
        profile.reviewTiming || null,
        profile.optimalSessionLength || null,
        profile.quizFrequency || null,
        profile.explorationDepth || null,
        profile.difficultyAdaptation || null,
        profile.totalSessions,
        profile.totalInteractions,
        profile.userId,
      ],
    });
  } else {
    // Insert new profile
    await db.execute({
      sql: `
        INSERT INTO lingua_learning_profiles (
          id, user_id, calculated_at,
          visual_learning, verbal_learning, kinesthetic_learning, analytical_learning,
          learning_approach, preferred_pace,
          avg_session_duration, persistence_score, confidence_level, fatigue_threshold,
          srs_adherence, review_timing, optimal_session_length,
          quiz_frequency, exploration_depth, difficulty_adaptation,
          total_sessions, total_interactions
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      args: [
        profile.id,
        profile.userId,
        profile.calculatedAt,
        profile.visualLearning,
        profile.verbalLearning,
        profile.kinestheticLearning,
        profile.analyticalLearning,
        profile.learningApproach || null,
        profile.preferredPace || null,
        profile.avgSessionDuration || null,
        profile.persistenceScore || null,
        profile.confidenceLevel || null,
        profile.fatigueThreshold || null,
        profile.srsAdherence || null,
        profile.reviewTiming || null,
        profile.optimalSessionLength || null,
        profile.quizFrequency || null,
        profile.explorationDepth || null,
        profile.difficultyAdaptation || null,
        profile.totalSessions,
        profile.totalInteractions,
      ],
    });
  }

  if (process.env.NODE_ENV === 'development') {
    console.log(`[TRACKING] Learning profile updated for user ${profile.userId}`);
  }
}

/**
 * Get learning profile for a user
 */
export async function getLearningProfile(userId: string): Promise<LearningProfile | null> {
  const db = getUniversalDb();

  const result = await db.execute({
    sql: 'SELECT * FROM lingua_learning_profiles WHERE user_id = ?',
    args: [userId],
  });

  if (result.rows.length === 0) return null;

  const row = result.rows[0] as any;

  return {
    id: row.id,
    userId: row.user_id,
    calculatedAt: row.calculated_at,
    visualLearning: row.visual_learning,
    verbalLearning: row.verbal_learning,
    kinestheticLearning: row.kinesthetic_learning,
    analyticalLearning: row.analytical_learning,
    learningApproach: row.learning_approach,
    preferredPace: row.preferred_pace,
    avgSessionDuration: row.avg_session_duration,
    persistenceScore: row.persistence_score,
    confidenceLevel: row.confidence_level,
    fatigueThreshold: row.fatigue_threshold,
    srsAdherence: row.srs_adherence,
    reviewTiming: row.review_timing,
    optimalSessionLength: row.optimal_session_length,
    quizFrequency: row.quiz_frequency,
    explorationDepth: row.exploration_depth,
    difficultyAdaptation: row.difficulty_adaptation,
    totalSessions: row.total_sessions,
    totalInteractions: row.total_interactions,
  };
}
