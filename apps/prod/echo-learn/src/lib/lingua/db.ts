import { getUniversalDb, query, queryOne, execute } from '../db/turso';
import {
  LinguaUser,
  LinguaVocabulary,
  LinguaConversation,
  LinguaWordDetails,
  LinguaFamilyConnection,
  WordStatus,
  VocabStats,
  VocabFilters,
  LinguaLanguage,
  ConnectionType,
  ConnectionStatus,
} from '@/types/lingua';

// Re-export database utilities for API routes
export { query, queryOne, execute, getUniversalDb };
// Alias for convenience - but routes should call getUniversalDb()
export { getUniversalDb as db };

// Generate a simple unique ID
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// ==================== USER FUNCTIONS ====================

export async function getLinguaUser(userId: string): Promise<LinguaUser | null> {
  const db = getUniversalDb();
  return queryOne<LinguaUser>(
    db,
    'SELECT * FROM lingua_users WHERE id = ?',
    [userId]
  );
}

export async function createLinguaUser(
  id: string,
  name: string,
  nativeLanguage: LinguaLanguage,
  targetLanguage: LinguaLanguage
): Promise<LinguaUser> {
  const db = getUniversalDb();
  const now = new Date().toISOString();

  await execute(
    db,
    `INSERT INTO lingua_users (
      id, name, native_language, target_language,
      current_streak, longest_streak, last_activity_date,
      created_at, updated_at
    ) VALUES (?, ?, ?, ?, 0, 0, NULL, ?, ?)`,
    [id, name, nativeLanguage, targetLanguage, now, now]
  );

  const user = await getLinguaUser(id);
  if (!user) throw new Error('Failed to create user');
  return user;
}

export async function updateUserActivity(userId: string): Promise<void> {
  const db = getUniversalDb();
  const user = await getLinguaUser(userId);
  if (!user) return;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStr = today.toISOString().split('T')[0];

  let newStreak = user.current_streak;
  let newLongest = user.longest_streak;

  if (user.last_activity_date) {
    const lastActivity = new Date(user.last_activity_date);
    lastActivity.setHours(0, 0, 0, 0);
    const lastDateStr = lastActivity.toISOString().split('T')[0];

    if (lastDateStr === todayStr) {
      // Same day, no streak change
    } else {
      const diffDays = Math.floor(
        (today.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (diffDays === 1) {
        // Consecutive day
        newStreak = user.current_streak + 1;
        newLongest = Math.max(newStreak, user.longest_streak);
      } else {
        // Streak broken
        newStreak = 1;
      }
    }
  } else {
    // First activity
    newStreak = 1;
    newLongest = Math.max(1, user.longest_streak);
  }

  await execute(
    db,
    `UPDATE lingua_users SET
      current_streak = ?,
      longest_streak = ?,
      last_activity_date = ?,
      updated_at = ?
    WHERE id = ?`,
    [newStreak, newLongest, todayStr, new Date().toISOString(), userId]
  );
}

// ==================== VOCABULARY FUNCTIONS ====================

export async function getVocabulary(
  userId: string,
  filters?: VocabFilters
): Promise<LinguaVocabulary[]> {
  const db = getUniversalDb();

  let sql = 'SELECT * FROM lingua_vocabulary WHERE user_id = ?';
  const args: (string | number)[] = [userId];

  if (filters?.status) {
    sql += ' AND status = ?';
    args.push(filters.status);
  }

  if (filters?.search) {
    sql += ' AND (word LIKE ? OR native_translation LIKE ?)';
    const searchTerm = `%${filters.search}%`;
    args.push(searchTerm, searchTerm);
  }

  sql += ' ORDER BY last_seen_at DESC';

  if (filters?.limit) {
    sql += ' LIMIT ?';
    args.push(filters.limit);

    if (filters?.offset) {
      sql += ' OFFSET ?';
      args.push(filters.offset);
    }
  }

  return query<LinguaVocabulary>(db, sql, args);
}

export async function getVocabularyByWord(
  userId: string,
  wordNormalized: string
): Promise<LinguaVocabulary | null> {
  const db = getUniversalDb();
  return queryOne<LinguaVocabulary>(
    db,
    'SELECT * FROM lingua_vocabulary WHERE user_id = ? AND word_normalized = ?',
    [userId, wordNormalized]
  );
}

export async function getVocabularyById(
  vocabularyId: string
): Promise<LinguaVocabulary | null> {
  const db = getUniversalDb();
  return queryOne<LinguaVocabulary>(
    db,
    'SELECT * FROM lingua_vocabulary WHERE id = ?',
    [vocabularyId]
  );
}

export async function upsertWord(
  userId: string,
  word: string,
  wordNormalized: string,
  translation?: string
): Promise<LinguaVocabulary> {
  const db = getUniversalDb();
  const now = new Date().toISOString();

  const existing = await getVocabularyByWord(userId, wordNormalized);

  if (existing) {
    // Update times_seen and last_seen_at
    const newTimesSeen = existing.times_seen + 1;
    let newStatus: WordStatus = existing.status;

    // Auto-progress status based on times seen
    if (existing.status === 'new' && newTimesSeen >= 1) {
      newStatus = 'learning';
    }
    if (existing.status === 'learning' && newTimesSeen >= 5) {
      newStatus = 'known';
    }

    await execute(
      db,
      `UPDATE lingua_vocabulary SET
        times_seen = ?,
        status = ?,
        last_seen_at = ?,
        native_translation = COALESCE(?, native_translation),
        mastered_at = CASE WHEN ? = 'known' AND mastered_at IS NULL THEN ? ELSE mastered_at END
      WHERE id = ?`,
      [newTimesSeen, newStatus, now, translation || null, newStatus, now, existing.id]
    );

    const updated = await getVocabularyByWord(userId, wordNormalized);
    return updated!;
  } else {
    // Create new vocabulary entry
    const id = generateId();
    await execute(
      db,
      `INSERT INTO lingua_vocabulary (
        id, user_id, word, word_normalized, native_translation,
        status, times_seen, times_correct, first_seen_at, last_seen_at
      ) VALUES (?, ?, ?, ?, ?, 'new', 1, 0, ?, ?)`,
      [id, userId, word, wordNormalized, translation || null, now, now]
    );

    const created = await getVocabularyByWord(userId, wordNormalized);
    return created!;
  }
}

export async function updateWordStatus(
  userId: string,
  wordId: string,
  status: WordStatus
): Promise<LinguaVocabulary | null> {
  const db = getUniversalDb();
  const now = new Date().toISOString();

  await execute(
    db,
    `UPDATE lingua_vocabulary SET
      status = ?,
      mastered_at = CASE WHEN ? = 'known' THEN COALESCE(mastered_at, ?) ELSE mastered_at END
    WHERE id = ? AND user_id = ?`,
    [status, status, now, wordId, userId]
  );

  return queryOne<LinguaVocabulary>(
    db,
    'SELECT * FROM lingua_vocabulary WHERE id = ?',
    [wordId]
  );
}

export async function getVocabStats(userId: string): Promise<VocabStats> {
  const db = getUniversalDb();
  const user = await getLinguaUser(userId);

  // Get counts by status
  const statusCounts = await query<{ status: string; count: number }>(
    db,
    `SELECT status, COUNT(*) as count
     FROM lingua_vocabulary
     WHERE user_id = ?
     GROUP BY status`,
    [userId]
  );

  // Get words learned this week
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  const weekAgoStr = weekAgo.toISOString();

  const weekResult = await queryOne<{ count: number }>(
    db,
    `SELECT COUNT(*) as count FROM lingua_vocabulary
     WHERE user_id = ? AND mastered_at >= ?`,
    [userId, weekAgoStr]
  );

  const stats: VocabStats = {
    totalWords: 0,
    newWords: 0,
    learningWords: 0,
    knownWords: 0,
    wordsLearnedThisWeek: weekResult?.count || 0,
    currentStreak: user?.current_streak || 0,
    longestStreak: user?.longest_streak || 0,
  };

  for (const row of statusCounts) {
    stats.totalWords += row.count;
    if (row.status === 'new') stats.newWords = row.count;
    if (row.status === 'learning') stats.learningWords = row.count;
    if (row.status === 'known') stats.knownWords = row.count;
  }

  return stats;
}

// ==================== CONVERSATION FUNCTIONS ====================

export async function saveConversation(
  userId: string,
  rawText: string,
  parsedData: string,
  wordCount: number,
  newWordsCount: number,
  title?: string
): Promise<LinguaConversation> {
  const db = getUniversalDb();
  const id = generateId();
  const now = new Date().toISOString();

  await execute(
    db,
    `INSERT INTO lingua_conversations (
      id, user_id, title, raw_text, parsed_data,
      word_count, new_words_count, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [id, userId, title || null, rawText, parsedData, wordCount, newWordsCount, now]
  );

  const conversation = await queryOne<LinguaConversation>(
    db,
    'SELECT * FROM lingua_conversations WHERE id = ?',
    [id]
  );

  return conversation!;
}

export async function getConversations(
  userId: string,
  limit: number = 20
): Promise<LinguaConversation[]> {
  const db = getUniversalDb();
  return query<LinguaConversation>(
    db,
    'SELECT * FROM lingua_conversations WHERE user_id = ? ORDER BY created_at DESC LIMIT ?',
    [userId, limit]
  );
}

export async function getConversation(
  conversationId: string,
  userId: string
): Promise<LinguaConversation | null> {
  const db = getUniversalDb();
  return queryOne<LinguaConversation>(
    db,
    'SELECT * FROM lingua_conversations WHERE id = ? AND user_id = ?',
    [conversationId, userId]
  );
}

// ==================== WORD DETAILS CACHE ====================

export async function getCachedWordDetails(
  word: string,
  sourceLanguage: LinguaLanguage,
  targetLanguage: LinguaLanguage
): Promise<LinguaWordDetails | null> {
  const db = getUniversalDb();
  return queryOne<LinguaWordDetails>(
    db,
    `SELECT * FROM lingua_word_details
     WHERE word = ? AND source_language = ? AND target_language = ?`,
    [word.toLowerCase(), sourceLanguage, targetLanguage]
  );
}

export async function cacheWordDetails(
  word: string,
  sourceLanguage: LinguaLanguage,
  targetLanguage: LinguaLanguage,
  details: {
    translation: string;
    definition?: string;
    partOfSpeech?: string;
    exampleSentence?: string;
    exampleTranslation?: string;
    relatedWords?: string[];
    memoryTip?: string;
    difficultyLevel?: number;
  }
): Promise<LinguaWordDetails> {
  const db = getUniversalDb();
  const id = generateId();
  const now = new Date().toISOString();

  // Check if already exists
  const existing = await getCachedWordDetails(word, sourceLanguage, targetLanguage);
  if (existing) return existing;

  await execute(
    db,
    `INSERT INTO lingua_word_details (
      id, word, source_language, target_language, translation,
      definition, part_of_speech, example_sentence, example_translation,
      related_words, memory_tip, difficulty_level, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      word.toLowerCase(),
      sourceLanguage,
      targetLanguage,
      details.translation,
      details.definition || null,
      details.partOfSpeech || null,
      details.exampleSentence || null,
      details.exampleTranslation || null,
      details.relatedWords ? JSON.stringify(details.relatedWords) : null,
      details.memoryTip || null,
      details.difficultyLevel || 1,
      now,
    ]
  );

  const cached = await getCachedWordDetails(word, sourceLanguage, targetLanguage);
  return cached!;
}

// ==================== SRS FUNCTIONS (v2) ====================

/**
 * Update vocabulary with new SRS values after review
 */
export async function updateVocabSRS(
  vocabularyId: string,
  easeFactor: number,
  intervalDays: number,
  nextReviewDate: string,
  lastReviewDate: string
): Promise<void> {
  const db = getUniversalDb();

  await execute(
    db,
    `UPDATE lingua_vocabulary SET
      ease_factor = ?,
      interval_days = ?,
      next_review_date = ?,
      last_review_date = ?,
      review_count = COALESCE(review_count, 0) + 1
    WHERE id = ?`,
    [easeFactor, intervalDays, nextReviewDate, lastReviewDate, vocabularyId]
  );
}

/**
 * Record a review attempt
 */
export async function recordReview(
  userId: string,
  vocabularyId: string,
  word: string,
  quality: number,
  responseTimeMs: number,
  previousEaseFactor: number,
  newEaseFactor: number,
  previousInterval: number,
  newInterval: number
): Promise<void> {
  const db = getUniversalDb();
  const id = generateId();
  const now = new Date().toISOString();

  await execute(
    db,
    `INSERT INTO lingua_reviews (
      id, user_id, vocabulary_id, word, quality, response_time_ms,
      previous_ease_factor, new_ease_factor, previous_interval, new_interval,
      reviewed_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id, userId, vocabularyId, word, quality, responseTimeMs,
      previousEaseFactor, newEaseFactor, previousInterval, newInterval, now
    ]
  );
}

/**
 * Get words due for review
 */
export async function getDueWords(userId: string, limit: number = 20): Promise<LinguaVocabulary[]> {
  const db = getUniversalDb();
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const todayStr = now.toISOString();

  return query<LinguaVocabulary>(
    db,
    `SELECT * FROM lingua_vocabulary
     WHERE user_id = ?
     AND (next_review_date IS NULL OR next_review_date <= ?)
     AND status != 'new'
     ORDER BY next_review_date ASC
     LIMIT ?`,
    [userId, todayStr, limit]
  );
}

/**
 * Get review history for a word
 */
export async function getWordReviews(vocabularyId: string, limit: number = 10) {
  const db = getUniversalDb();
  return query(
    db,
    `SELECT * FROM lingua_reviews
     WHERE vocabulary_id = ?
     ORDER BY reviewed_at DESC
     LIMIT ?`,
    [vocabularyId, limit]
  );
}

// ==================== QUIZ FUNCTIONS (v2) ====================

/**
 * Create a quiz session
 */
export async function createQuizSession(
  userId: string,
  quizType: string,
  totalQuestions: number
): Promise<{ id: string }> {
  const db = getUniversalDb();
  const id = generateId();
  const now = new Date().toISOString();

  await execute(
    db,
    `INSERT INTO lingua_quiz_sessions (
      id, user_id, quiz_type, total_questions, created_at
    ) VALUES (?, ?, ?, ?, ?)`,
    [id, userId, quizType, totalQuestions, now]
  );

  return { id };
}

/**
 * Record a quiz answer
 */
export async function recordQuizAnswer(
  sessionId: string,
  vocabularyId: string,
  word: string,
  questionType: string,
  userAnswer: string,
  correctAnswer: string,
  isCorrect: boolean,
  responseTimeMs: number
): Promise<void> {
  const db = getUniversalDb();
  const id = generateId();
  const now = new Date().toISOString();

  await execute(
    db,
    `INSERT INTO lingua_quiz_answers (
      id, session_id, vocabulary_id, word, question_type,
      user_answer, correct_answer, is_correct, response_time_ms, answered_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id, sessionId, vocabularyId, word, questionType,
      userAnswer, correctAnswer, isCorrect ? 1 : 0, responseTimeMs, now
    ]
  );
}

/**
 * Complete a quiz session
 */
export async function completeQuizSession(
  sessionId: string,
  correctAnswers: number,
  durationSeconds: number
): Promise<void> {
  const db = getUniversalDb();
  const now = new Date().toISOString();

  await execute(
    db,
    `UPDATE lingua_quiz_sessions SET
      correct_answers = ?,
      duration_seconds = ?,
      completed_at = ?
    WHERE id = ?`,
    [correctAnswers, durationSeconds, now, sessionId]
  );
}

/**
 * Get quiz results
 */
export async function getQuizResults(sessionId: string) {
  const db = getUniversalDb();

  const session = await queryOne(
    db,
    'SELECT * FROM lingua_quiz_sessions WHERE id = ?',
    [sessionId]
  );

  const answers = await query(
    db,
    'SELECT * FROM lingua_quiz_answers WHERE session_id = ? ORDER BY answered_at',
    [sessionId]
  );

  return { session, answers };
}

/**
 * Get user's quiz history
 */
export async function getUserQuizHistory(userId: string, limit: number = 10) {
  const db = getUniversalDb();
  return query(
    db,
    `SELECT * FROM lingua_quiz_sessions
     WHERE user_id = ?
     ORDER BY created_at DESC
     LIMIT ?`,
    [userId, limit]
  );
}

// ==================== USER PROFILE FUNCTIONS (v2) ====================

/**
 * Get Lingua profile by main Echo-Home user ID
 */
export async function getLinguaProfileByMainUserId(mainUserId: string): Promise<LinguaUser | null> {
  const db = getUniversalDb();
  return queryOne<LinguaUser>(
    db,
    'SELECT * FROM lingua_users WHERE main_user_id = ?',
    [mainUserId]
  );
}

/**
 * Create a new Lingua profile linked to Echo-Home user
 */
export async function createLinguaProfile(
  mainUserId: string,
  name: string,
  nativeLanguage: LinguaLanguage,
  targetLanguage: LinguaLanguage,
  avatarUrl?: string
): Promise<LinguaUser> {
  const db = getUniversalDb();
  const id = generateId();
  const now = new Date().toISOString();

  await execute(
    db,
    `INSERT INTO lingua_users (
      id, main_user_id, name, native_language, target_language,
      current_streak, longest_streak, last_activity_date,
      avatar_url, is_active, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, 0, 0, NULL, ?, 1, ?, ?)`,
    [id, mainUserId, name, nativeLanguage, targetLanguage, avatarUrl || null, now, now]
  );

  const profile = await getLinguaProfileByMainUserId(mainUserId);
  if (!profile) throw new Error('Failed to create profile');
  return profile;
}

/**
 * Update Lingua profile
 */
export async function updateLinguaProfile(
  profileId: string,
  updates: {
    name?: string;
    nativeLanguage?: LinguaLanguage;
    targetLanguage?: LinguaLanguage;
    avatarUrl?: string;
  }
): Promise<LinguaUser | null> {
  const db = getUniversalDb();
  const now = new Date().toISOString();

  const setClauses: string[] = ['updated_at = ?'];
  const args: (string | null)[] = [now];

  if (updates.name !== undefined) {
    setClauses.push('name = ?');
    args.push(updates.name);
  }
  if (updates.nativeLanguage !== undefined) {
    setClauses.push('native_language = ?');
    args.push(updates.nativeLanguage);
  }
  if (updates.targetLanguage !== undefined) {
    setClauses.push('target_language = ?');
    args.push(updates.targetLanguage);
  }
  if (updates.avatarUrl !== undefined) {
    setClauses.push('avatar_url = ?');
    args.push(updates.avatarUrl);
  }

  args.push(profileId);

  await execute(
    db,
    `UPDATE lingua_users SET ${setClauses.join(', ')} WHERE id = ?`,
    args
  );

  return getLinguaUser(profileId);
}

/**
 * Link existing Lingua user to Echo-Home user
 * Used during migration when matching existing profiles
 */
export async function linkLinguaUserToMainUser(
  linguaUserId: string,
  mainUserId: string
): Promise<void> {
  const db = getUniversalDb();
  const now = new Date().toISOString();

  await execute(
    db,
    `UPDATE lingua_users SET main_user_id = ?, updated_at = ? WHERE id = ?`,
    [mainUserId, now, linguaUserId]
  );
}

// ==================== FAMILY CONNECTION FUNCTIONS (v2) ====================

/**
 * Create a family connection invite
 */
export async function createFamilyConnection(
  ownerUserId: string,
  connectedUserId: string,
  connectionType: ConnectionType = 'family'
): Promise<LinguaFamilyConnection> {
  const db = getUniversalDb();
  const id = generateId();
  const now = new Date().toISOString();

  await execute(
    db,
    `INSERT INTO lingua_family_connections (
      id, owner_user_id, connected_user_id, connection_type,
      can_view_progress, can_view_vocabulary, status, created_at
    ) VALUES (?, ?, ?, ?, 1, 1, 'pending', ?)`,
    [id, ownerUserId, connectedUserId, connectionType, now]
  );

  const connection = await getFamilyConnectionById(id);
  if (!connection) throw new Error('Failed to create family connection');
  return connection;
}

/**
 * Get family connection by ID
 */
export async function getFamilyConnectionById(connectionId: string): Promise<LinguaFamilyConnection | null> {
  const db = getUniversalDb();
  return queryOne<LinguaFamilyConnection>(
    db,
    `SELECT fc.*, u.name as connected_user_name, u.email as connected_user_email
     FROM lingua_family_connections fc
     LEFT JOIN users u ON fc.connected_user_id = u.id
     WHERE fc.id = ?`,
    [connectionId]
  );
}

/**
 * Get all family connections for a user (both sent and received)
 */
export async function getFamilyConnections(userId: string): Promise<{
  sent: LinguaFamilyConnection[];
  received: LinguaFamilyConnection[];
}> {
  const db = getUniversalDb();

  const sent = await query<LinguaFamilyConnection>(
    db,
    `SELECT fc.*, u.name as connected_user_name, u.email as connected_user_email
     FROM lingua_family_connections fc
     LEFT JOIN users u ON fc.connected_user_id = u.id
     WHERE fc.owner_user_id = ?
     ORDER BY fc.created_at DESC`,
    [userId]
  );

  const received = await query<LinguaFamilyConnection>(
    db,
    `SELECT fc.*, u.name as connected_user_name, u.email as connected_user_email
     FROM lingua_family_connections fc
     LEFT JOIN users u ON fc.owner_user_id = u.id
     WHERE fc.connected_user_id = ? AND fc.status = 'pending'
     ORDER BY fc.created_at DESC`,
    [userId]
  );

  return { sent, received };
}

/**
 * Get accepted family connections for a user
 */
export async function getAcceptedFamilyConnections(userId: string): Promise<LinguaFamilyConnection[]> {
  const db = getUniversalDb();

  return query<LinguaFamilyConnection>(
    db,
    `SELECT fc.*, u.name as connected_user_name, u.email as connected_user_email
     FROM lingua_family_connections fc
     LEFT JOIN users u ON CASE
       WHEN fc.owner_user_id = ? THEN fc.connected_user_id = u.id
       ELSE fc.owner_user_id = u.id
     END
     WHERE (fc.owner_user_id = ? OR fc.connected_user_id = ?)
     AND fc.status = 'accepted'
     ORDER BY fc.accepted_at DESC`,
    [userId, userId, userId]
  );
}

/**
 * Update family connection status
 */
export async function updateFamilyConnectionStatus(
  connectionId: string,
  status: ConnectionStatus
): Promise<LinguaFamilyConnection | null> {
  const db = getUniversalDb();
  const now = new Date().toISOString();

  await execute(
    db,
    `UPDATE lingua_family_connections SET
      status = ?,
      accepted_at = CASE WHEN ? = 'accepted' THEN ? ELSE accepted_at END
     WHERE id = ?`,
    [status, status, now, connectionId]
  );

  return getFamilyConnectionById(connectionId);
}

/**
 * Delete a family connection
 */
export async function deleteFamilyConnection(connectionId: string): Promise<void> {
  const db = getUniversalDb();
  await execute(db, 'DELETE FROM lingua_family_connections WHERE id = ?', [connectionId]);
}

/**
 * Check if a family connection exists between two users
 */
export async function familyConnectionExists(
  userId1: string,
  userId2: string
): Promise<boolean> {
  const db = getUniversalDb();
  const result = await queryOne<{ count: number }>(
    db,
    `SELECT COUNT(*) as count FROM lingua_family_connections
     WHERE (owner_user_id = ? AND connected_user_id = ?)
     OR (owner_user_id = ? AND connected_user_id = ?)`,
    [userId1, userId2, userId2, userId1]
  );
  return (result?.count || 0) > 0;
}

/**
 * Get user by email (for family invite lookup)
 */
export async function getUserByEmail(email: string): Promise<{ id: string; name: string; email: string } | null> {
  const db = getUniversalDb();
  return queryOne<{ id: string; name: string; email: string }>(
    db,
    'SELECT id, name, email FROM users WHERE email = ?',
    [email.toLowerCase()]
  );
}
