/**
 * Echo-Lin V3 Database Migrations
 *
 * Adds learning pattern tracking tables:
 * - lingua_sessions: Track complete learning sessions
 * - lingua_interactions: Log all user interactions
 * - lingua_word_interactions: Detailed word-level tracking
 * - lingua_learning_profiles: Cached learning pattern analysis
 * - lingua_coach_insights: AI-generated learning insights
 *
 * Also enhances existing tables with tracking columns
 */

import { getUniversalDb, execute } from '../db/turso';

export async function runLinguaV3Migrations() {
  const db = getUniversalDb();

  console.log('📊 Creating V3 tracking tables...');

  // 1. Create lingua_sessions table
  console.log('Creating lingua_sessions table...');
  await execute(db, `
    CREATE TABLE IF NOT EXISTS lingua_sessions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      started_at TEXT NOT NULL,
      ended_at TEXT,
      entry_point TEXT,
      device_type TEXT,
      app_version TEXT,
      duration_seconds INTEGER,
      engagement_score REAL,
      FOREIGN KEY (user_id) REFERENCES lingua_users(id)
    )
  `);

  await execute(db, `
    CREATE INDEX IF NOT EXISTS idx_lingua_sessions_user_id
    ON lingua_sessions(user_id)
  `);

  await execute(db, `
    CREATE INDEX IF NOT EXISTS idx_lingua_sessions_started_at
    ON lingua_sessions(started_at)
  `);

  console.log('✅ lingua_sessions table created');

  // 2. Create lingua_interactions table
  console.log('Creating lingua_interactions table...');
  await execute(db, `
    CREATE TABLE IF NOT EXISTS lingua_interactions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      session_id TEXT NOT NULL,
      timestamp TEXT NOT NULL,
      event_type TEXT NOT NULL,
      context_type TEXT,
      context_id TEXT,
      metadata TEXT,
      FOREIGN KEY (user_id) REFERENCES lingua_users(id),
      FOREIGN KEY (session_id) REFERENCES lingua_sessions(id)
    )
  `);

  await execute(db, `
    CREATE INDEX IF NOT EXISTS idx_lingua_interactions_user_session
    ON lingua_interactions(user_id, session_id)
  `);

  await execute(db, `
    CREATE INDEX IF NOT EXISTS idx_lingua_interactions_type
    ON lingua_interactions(event_type)
  `);

  console.log('✅ lingua_interactions table created');

  // 3. Create lingua_word_interactions table
  console.log('Creating lingua_word_interactions table...');
  await execute(db, `
    CREATE TABLE IF NOT EXISTS lingua_word_interactions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      vocabulary_id TEXT NOT NULL,
      session_id TEXT NOT NULL,
      interaction_type TEXT NOT NULL,
      context_type TEXT,
      context_id TEXT,
      hesitation_ms INTEGER,
      time_in_popup_ms INTEGER,
      sections_viewed TEXT,
      occurred_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES lingua_users(id),
      FOREIGN KEY (vocabulary_id) REFERENCES lingua_vocabulary(id),
      FOREIGN KEY (session_id) REFERENCES lingua_sessions(id)
    )
  `);

  await execute(db, `
    CREATE INDEX IF NOT EXISTS idx_lingua_word_interactions_user
    ON lingua_word_interactions(user_id)
  `);

  await execute(db, `
    CREATE INDEX IF NOT EXISTS idx_lingua_word_interactions_vocab
    ON lingua_word_interactions(vocabulary_id)
  `);

  await execute(db, `
    CREATE INDEX IF NOT EXISTS idx_lingua_word_interactions_session
    ON lingua_word_interactions(session_id)
  `);

  console.log('✅ lingua_word_interactions table created');

  // 4. Create lingua_learning_profiles table
  console.log('Creating lingua_learning_profiles table...');
  await execute(db, `
    CREATE TABLE IF NOT EXISTS lingua_learning_profiles (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL UNIQUE,
      calculated_at TEXT NOT NULL,

      visual_learning REAL DEFAULT 0,
      verbal_learning REAL DEFAULT 0,
      kinesthetic_learning REAL DEFAULT 0,
      analytical_learning REAL DEFAULT 0,

      learning_approach TEXT,
      preferred_pace TEXT,

      avg_session_duration REAL,
      persistence_score REAL,
      confidence_level REAL,
      fatigue_threshold INTEGER,

      srs_adherence REAL,
      review_timing TEXT,
      optimal_session_length INTEGER,

      quiz_frequency REAL,
      exploration_depth REAL,
      difficulty_adaptation REAL,

      total_sessions INTEGER DEFAULT 0,
      total_interactions INTEGER DEFAULT 0,

      FOREIGN KEY (user_id) REFERENCES lingua_users(id)
    )
  `);

  await execute(db, `
    CREATE INDEX IF NOT EXISTS idx_lingua_learning_profiles_user
    ON lingua_learning_profiles(user_id)
  `);

  console.log('✅ lingua_learning_profiles table created');

  // 5. Create lingua_coach_insights table
  console.log('Creating lingua_coach_insights table...');
  await execute(db, `
    CREATE TABLE IF NOT EXISTS lingua_coach_insights (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      insight_type TEXT NOT NULL,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      based_on_profile TEXT,
      generated_at TEXT NOT NULL,
      viewed_at TEXT,
      dismissed_at TEXT,
      user_rating INTEGER,
      FOREIGN KEY (user_id) REFERENCES lingua_users(id)
    )
  `);

  await execute(db, `
    CREATE INDEX IF NOT EXISTS idx_lingua_coach_insights_user
    ON lingua_coach_insights(user_id)
  `);

  await execute(db, `
    CREATE INDEX IF NOT EXISTS idx_lingua_coach_insights_type
    ON lingua_coach_insights(insight_type)
  `);

  console.log('✅ lingua_coach_insights table created');

  // 6. Add tracking columns to existing tables
  console.log('Adding tracking columns to lingua_quiz_answers...');

  // Check if columns already exist before adding
  try {
    await execute(db, `
      ALTER TABLE lingua_quiz_answers
      ADD COLUMN hesitation_ms INTEGER DEFAULT 0
    `);
    console.log('  ✅ Added hesitation_ms column');
  } catch (error: any) {
    if (error.message?.includes('duplicate column')) {
      console.log('  ℹ️  hesitation_ms column already exists');
    } else {
      throw error;
    }
  }

  try {
    await execute(db, `
      ALTER TABLE lingua_quiz_answers
      ADD COLUMN answer_revisions INTEGER DEFAULT 0
    `);
    console.log('  ✅ Added answer_revisions column');
  } catch (error: any) {
    if (error.message?.includes('duplicate column')) {
      console.log('  ℹ️  answer_revisions column already exists');
    } else {
      throw error;
    }
  }

  console.log('✅ All V3 migrations completed successfully!');
}
