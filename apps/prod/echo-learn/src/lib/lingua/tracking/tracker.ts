/**
 * Echo-Lin V3 Learning Pattern Tracker
 *
 * Core tracking functions that log user behavior for learning style analysis
 * Philosophy: "If we wouldn't tell users we're tracking it, we shouldn't."
 */

import { getUniversalDb, execute } from '../../db/turso';
import {
  Session,
  Interaction,
  WordInteraction,
  EventType,
  ContextType,
  WordInteractionType,
  TrackingConfig,
} from './types';

// ============================================================================
// SESSION MANAGEMENT
// ============================================================================

/**
 * Start a new learning session
 */
export async function startSession(
  userId: string,
  entryPoint?: string,
  deviceType?: string
): Promise<string> {
  const db = getUniversalDb();
  const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const startedAt = new Date().toISOString();

  await db.execute({
    sql: `
      INSERT INTO lingua_sessions (
        id, user_id, started_at, entry_point, device_type, app_version
      ) VALUES (?, ?, ?, ?, ?, ?)
    `,
    args: [sessionId, userId, startedAt, entryPoint || null, deviceType || null, 'v3.0.0'],
  });

  if (process.env.NODE_ENV === 'development') {
    console.log(`[TRACKING] Session started: ${sessionId}`);
  }

  return sessionId;
}

/**
 * End a learning session
 */
export async function endSession(
  sessionId: string,
  engagementScore?: number
): Promise<void> {
  const db = getUniversalDb();
  const endedAt = new Date().toISOString();

  // Calculate duration
  const sessionResult = await db.execute({
    sql: 'SELECT started_at FROM lingua_sessions WHERE id = ?',
    args: [sessionId],
  });

  if (sessionResult.rows.length === 0) {
    console.warn(`[TRACKING] Session not found: ${sessionId}`);
    return;
  }

  const startedAt = new Date(sessionResult.rows[0].started_at as string);
  const durationSeconds = Math.floor((new Date(endedAt).getTime() - startedAt.getTime()) / 1000);

  await db.execute({
    sql: `
      UPDATE lingua_sessions
      SET ended_at = ?, duration_seconds = ?, engagement_score = ?
      WHERE id = ?
    `,
    args: [endedAt, durationSeconds, engagementScore || null, sessionId],
  });

  if (process.env.NODE_ENV === 'development') {
    console.log(`[TRACKING] Session ended: ${sessionId} (${durationSeconds}s)`);
  }
}

// ============================================================================
// INTERACTION TRACKING
// ============================================================================

/**
 * Track a general user interaction
 */
export async function trackInteraction(
  userId: string,
  sessionId: string,
  eventType: EventType,
  contextType?: ContextType,
  contextId?: string,
  metadata?: Record<string, any>
): Promise<void> {
  const db = getUniversalDb();
  const interactionId = `int_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const timestamp = new Date().toISOString();

  await db.execute({
    sql: `
      INSERT INTO lingua_interactions (
        id, user_id, session_id, timestamp, event_type, context_type, context_id, metadata
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `,
    args: [
      interactionId,
      userId,
      sessionId,
      timestamp,
      eventType,
      contextType || null,
      contextId || null,
      metadata ? JSON.stringify(metadata) : null,
    ],
  });

  if (process.env.NODE_ENV === 'development') {
    console.log(`[TRACKING] ${eventType}:`, metadata || {});
  }
}

// ============================================================================
// WORD-LEVEL TRACKING
// ============================================================================

/**
 * Track word click with hesitation timing
 */
export async function trackWordClick(
  userId: string,
  sessionId: string,
  vocabularyId: string,
  word: string,
  hesitationMs: number,
  contextType?: ContextType,
  contextId?: string
): Promise<void> {
  const db = getUniversalDb();
  const interactionId = `word_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const occurredAt = new Date().toISOString();

  await db.execute({
    sql: `
      INSERT INTO lingua_word_interactions (
        id, user_id, vocabulary_id, session_id, interaction_type,
        context_type, context_id, hesitation_ms, occurred_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    args: [
      interactionId,
      userId,
      vocabularyId,
      sessionId,
      'click',
      contextType || null,
      contextId || null,
      hesitationMs,
      occurredAt,
    ],
  });
}

/**
 * Track word skip (seen but not clicked)
 */
export async function trackWordSkip(
  userId: string,
  sessionId: string,
  vocabularyId: string,
  contextType?: ContextType,
  contextId?: string
): Promise<void> {
  const db = getUniversalDb();
  const interactionId = `word_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const occurredAt = new Date().toISOString();

  await db.execute({
    sql: `
      INSERT INTO lingua_word_interactions (
        id, user_id, vocabulary_id, session_id, interaction_type,
        context_type, context_id, occurred_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `,
    args: [
      interactionId,
      userId,
      vocabularyId,
      sessionId,
      'skip',
      contextType || null,
      contextId || null,
      occurredAt,
    ],
  });
}

/**
 * Track popup engagement
 */
export async function trackPopupEngagement(
  userId: string,
  sessionId: string,
  vocabularyId: string,
  sectionsViewed: string[],
  timeInPopupMs: number,
  contextType?: ContextType,
  contextId?: string
): Promise<void> {
  const db = getUniversalDb();
  const interactionId = `word_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const occurredAt = new Date().toISOString();

  await db.execute({
    sql: `
      INSERT INTO lingua_word_interactions (
        id, user_id, vocabulary_id, session_id, interaction_type,
        context_type, context_id, sections_viewed, time_in_popup_ms, occurred_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    args: [
      interactionId,
      userId,
      vocabularyId,
      sessionId,
      'popup_open',
      contextType || null,
      contextId || null,
      JSON.stringify(sectionsViewed),
      timeInPopupMs,
      occurredAt,
    ],
  });
}

// ============================================================================
// TAB NAVIGATION TRACKING
// ============================================================================

/**
 * Track tab switch behavior
 */
export async function trackTabSwitch(
  userId: string,
  sessionId: string,
  fromTab: string,
  toTab: string,
  timeInPreviousTab: number
): Promise<void> {
  await trackInteraction(userId, sessionId, 'tab_switch', undefined, undefined, {
    fromTab,
    toTab,
    timeInPreviousTab,
  });
}

// ============================================================================
// DIFFICULTY & ADAPTATION TRACKING
// ============================================================================

/**
 * Track difficulty adjustment
 */
export async function trackDifficultyChange(
  userId: string,
  sessionId: string,
  oldDifficulty: number,
  newDifficulty: number,
  contextType?: ContextType
): Promise<void> {
  await trackInteraction(userId, sessionId, 'difficulty_change', contextType, undefined, {
    oldDifficulty,
    newDifficulty,
    delta: newDifficulty - oldDifficulty,
  });
}

// ============================================================================
// QUIZ TRACKING ENHANCEMENTS
// ============================================================================

/**
 * Track quiz hesitation (time before first keystroke)
 */
export async function trackQuizHesitation(
  userId: string,
  sessionId: string,
  questionId: string,
  hesitationMs: number,
  questionType: string
): Promise<void> {
  await trackInteraction(userId, sessionId, 'quiz_question_answered', 'quiz', questionId, {
    hesitationMs,
    questionType,
    timestamp: new Date().toISOString(),
  });
}

// ============================================================================
// EXPLORATION TRACKING (for Tab 2)
// ============================================================================

/**
 * Track modality switch in exploration
 */
export async function trackModalitySwitch(
  userId: string,
  sessionId: string,
  fromModality: 'visual' | 'verbal' | 'kinesthetic',
  toModality: 'visual' | 'verbal' | 'kinesthetic',
  context: string
): Promise<void> {
  await trackInteraction(userId, sessionId, 'modality_switch', 'explore', undefined, {
    fromModality,
    toModality,
    context,
  });
}

/**
 * Track feature usage in exploration tab
 */
export async function trackFeatureUsage(
  userId: string,
  sessionId: string,
  featureName: string,
  duration?: number,
  metadata?: Record<string, any>
): Promise<void> {
  await trackInteraction(userId, sessionId, 'feature_used', 'explore', undefined, {
    featureName,
    duration,
    ...metadata,
  });
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get active session for user (or create one if none exists)
 */
export async function getOrCreateSession(
  userId: string,
  entryPoint?: string
): Promise<string> {
  const db = getUniversalDb();

  // Check for active session (within last 30 minutes)
  const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000).toISOString();

  const result = await db.execute({
    sql: `
      SELECT id FROM lingua_sessions
      WHERE user_id = ? AND started_at > ? AND ended_at IS NULL
      ORDER BY started_at DESC
      LIMIT 1
    `,
    args: [userId, thirtyMinutesAgo],
  });

  if (result.rows.length > 0) {
    return result.rows[0].id as string;
  }

  // No active session, create one
  return await startSession(userId, entryPoint);
}

/**
 * Calculate engagement score based on session activity
 */
export async function calculateEngagementScore(sessionId: string): Promise<number> {
  const db = getUniversalDb();

  // Count interactions in session
  const result = await db.execute({
    sql: 'SELECT COUNT(*) as count FROM lingua_interactions WHERE session_id = ?',
    args: [sessionId],
  });

  const interactionCount = Number(result.rows[0]?.count || 0);

  // Get session duration
  const sessionResult = await db.execute({
    sql: 'SELECT started_at FROM lingua_sessions WHERE id = ?',
    args: [sessionId],
  });

  if (sessionResult.rows.length === 0) return 0;

  const startedAt = new Date(sessionResult.rows[0].started_at as string);
  const durationMinutes = (Date.now() - startedAt.getTime()) / 1000 / 60;

  if (durationMinutes === 0) return 0;

  // Engagement score: interactions per minute, capped at 1.0
  const score = Math.min(interactionCount / durationMinutes / 10, 1.0);

  return Math.round(score * 100) / 100;
}
