/**
 * Echo Origins - Database Migrations
 * Tables for timelines, events, thinkers, shifts, and user progress
 */

import { getUniversalDb, execute } from '@/lib/db/turso';

/**
 * Create core content tables
 */
export async function createCoreTables() {
  const db = getUniversalDb();

  // Timelines table (metadata for each evolution track)
  await execute(db, `
    CREATE TABLE IF NOT EXISTS origins_timelines (
      id TEXT PRIMARY KEY,
      label TEXT NOT NULL,
      emoji TEXT,
      color TEXT,
      description TEXT,
      question TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    )
  `, []);

  // Events table (individual points on timelines)
  await execute(db, `
    CREATE TABLE IF NOT EXISTS origins_events (
      id TEXT PRIMARY KEY,
      timeline_id TEXT NOT NULL,
      era TEXT NOT NULL,
      year INTEGER,
      year_end INTEGER,
      title TEXT NOT NULL,
      location TEXT,
      description TEXT NOT NULL,
      key_insight TEXT,
      characteristics TEXT,
      scholars TEXT,
      counter_arguments TEXT,
      related_events TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (timeline_id) REFERENCES origins_timelines(id) ON DELETE CASCADE
    )
  `, []);

  // Create indexes for efficient querying
  await execute(db, `
    CREATE INDEX IF NOT EXISTS idx_origins_events_timeline
    ON origins_events(timeline_id)
  `, []);

  await execute(db, `
    CREATE INDEX IF NOT EXISTS idx_origins_events_era
    ON origins_events(era)
  `, []);

  await execute(db, `
    CREATE INDEX IF NOT EXISTS idx_origins_events_year
    ON origins_events(year)
  `, []);

  console.log('Origins core tables created');
}

/**
 * Create thinkers table
 */
export async function createThinkersTables() {
  const db = getUniversalDb();

  await execute(db, `
    CREATE TABLE IF NOT EXISTS origins_thinkers (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      field TEXT,
      era TEXT,
      key_works TEXT,
      core_insight TEXT NOT NULL,
      implications TEXT,
      evidence TEXT,
      counter_arguments TEXT,
      emoji TEXT,
      color TEXT,
      image_url TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    )
  `, []);

  console.log('Origins thinkers table created');
}

/**
 * Create paradigm shifts table
 */
export async function createShiftsTables() {
  const db = getUniversalDb();

  await execute(db, `
    CREATE TABLE IF NOT EXISTS origins_shifts (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      before_state TEXT NOT NULL,
      after_state TEXT NOT NULL,
      era TEXT,
      year_approx INTEGER,
      description TEXT NOT NULL,
      forces TEXT,
      question_for_you TEXT,
      related_timelines TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    )
  `, []);

  console.log('Origins shifts table created');
}

/**
 * Create frameworks tables (principles)
 */
export async function createFrameworksTables() {
  const db = getUniversalDb();

  await execute(db, `
    CREATE TABLE IF NOT EXISTS origins_principles (
      id INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      source TEXT,
      source_thinker TEXT,
      statement TEXT NOT NULL,
      therefore TEXT,
      evidence_needed TEXT,
      evidence_status TEXT,
      counter_arguments TEXT,
      category TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    )
  `, []);

  console.log('Origins frameworks table created');
}

/**
 * Create user progress tracking table
 */
export async function createProgressTables() {
  const db = getUniversalDb();

  await execute(db, `
    CREATE TABLE IF NOT EXISTS origins_user_progress (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      content_type TEXT NOT NULL,
      content_id TEXT NOT NULL,
      completed INTEGER DEFAULT 0,
      notes TEXT,
      last_viewed TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    )
  `, []);

  await execute(db, `
    CREATE INDEX IF NOT EXISTS idx_origins_progress_user
    ON origins_user_progress(user_id)
  `, []);

  await execute(db, `
    CREATE INDEX IF NOT EXISTS idx_origins_progress_content
    ON origins_user_progress(content_type, content_id)
  `, []);

  console.log('Origins progress table created');
}

/**
 * Run all migrations
 */
export async function runOriginsMigrations() {
  console.log('Running Echo Origins migrations...');

  await createCoreTables();
  await createThinkersTables();
  await createShiftsTables();
  await createFrameworksTables();
  await createProgressTables();

  console.log('Echo Origins migrations complete');
}
