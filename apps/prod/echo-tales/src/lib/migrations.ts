import { getUniversalDb, execute } from './turso';
import { runTalesPipelineMigrations } from './tales-pipeline-migrations';
import { runEducationalApproachesMigrations } from './educational-approaches-migration';

/**
 * Run all database migrations for auth tables
 */
export async function runAuthMigrations() {
  const db = getUniversalDb();

  // Create password_reset_tokens table
  await execute(
    db,
    `CREATE TABLE IF NOT EXISTS password_reset_tokens (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      token_hash TEXT NOT NULL,
      expires_at TEXT NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )`
  );

  // Create index for token lookups
  await execute(
    db,
    `CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_token_hash
      ON password_reset_tokens(token_hash)`
  );

  // Create index for cleanup queries
  await execute(
    db,
    `CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_expires_at
      ON password_reset_tokens(expires_at)`
  );

  // Create email_verification_tokens table
  await execute(
    db,
    `CREATE TABLE IF NOT EXISTS email_verification_tokens (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      token_hash TEXT NOT NULL,
      expires_at TEXT NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )`
  );

  // Create index for token lookups
  await execute(
    db,
    `CREATE INDEX IF NOT EXISTS idx_email_verification_tokens_token_hash
      ON email_verification_tokens(token_hash)`
  );

  // Create index for cleanup queries
  await execute(
    db,
    `CREATE INDEX IF NOT EXISTS idx_email_verification_tokens_expires_at
      ON email_verification_tokens(expires_at)`
  );

  console.log('Auth migrations completed successfully');
}

/**
 * Add google_id column to users table if it doesn't exist
 */
export async function addGoogleIdColumn() {
  const db = getUniversalDb();

  try {
    // Check if column exists by querying table info
    const result = await db.execute(`PRAGMA table_info(users)`);
    const columns = result.rows as unknown as Array<{ name: string }>;
    const hasGoogleId = columns.some((col) => col.name === 'google_id');

    if (!hasGoogleId) {
      await execute(db, `ALTER TABLE users ADD COLUMN google_id TEXT`);
      await execute(
        db,
        `CREATE INDEX IF NOT EXISTS idx_users_google_id ON users(google_id)`
      );
      console.log('Added google_id column to users table');
    } else {
      console.log('google_id column already exists');
    }
  } catch (error) {
    console.error('Error adding google_id column:', error);
  }
}

/**
 * Add last_login column to users table if it doesn't exist
 */
export async function addLastLoginColumn() {
  const db = getUniversalDb();

  try {
    const result = await db.execute(`PRAGMA table_info(users)`);
    const columns = result.rows as unknown as Array<{ name: string }>;
    const hasLastLogin = columns.some((col) => col.name === 'last_login');

    if (!hasLastLogin) {
      await execute(db, `ALTER TABLE users ADD COLUMN last_login TEXT`);
      console.log('Added last_login column to users table');
    } else {
      console.log('last_login column already exists');
    }
  } catch (error) {
    console.error('Error adding last_login column:', error);
  }
}

/**
 * Add missing user preference columns
 */
export async function addUserPreferenceColumns() {
  const db = getUniversalDb();

  try {
    const result = await db.execute(`PRAGMA table_info(users)`);
    const columns = result.rows as unknown as Array<{ name: string }>;
    const columnNames = columns.map((col) => col.name);

    // Add language_preference if missing
    if (!columnNames.includes('language_preference')) {
      await execute(db, `ALTER TABLE users ADD COLUMN language_preference TEXT DEFAULT 'en'`);
      console.log('Added language_preference column to users table');
    }

    // Add theme_preference if missing
    if (!columnNames.includes('theme_preference')) {
      await execute(db, `ALTER TABLE users ADD COLUMN theme_preference TEXT DEFAULT 'light'`);
      console.log('Added theme_preference column to users table');
    }

    // Add avatar_url if missing
    if (!columnNames.includes('avatar_url')) {
      await execute(db, `ALTER TABLE users ADD COLUMN avatar_url TEXT`);
      console.log('Added avatar_url column to users table');
    }

    // Add email_verified if missing
    if (!columnNames.includes('email_verified')) {
      await execute(db, `ALTER TABLE users ADD COLUMN email_verified INTEGER DEFAULT 0`);
      console.log('Added email_verified column to users table');
    }

    console.log('User preference columns migration complete');
  } catch (error) {
    console.error('Error adding user preference columns:', error);
  }
}

/**
 * Create coin_accounts table if it doesn't exist
 */
export async function createCoinAccountsTable() {
  const db = getUniversalDb();

  try {
    await execute(
      db,
      `CREATE TABLE IF NOT EXISTS coin_accounts (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL UNIQUE,
        balance INTEGER DEFAULT 0,
        created_at TEXT NOT NULL,
        updated_at TEXT,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )`
    );

    await execute(
      db,
      `CREATE INDEX IF NOT EXISTS idx_coin_accounts_user_id ON coin_accounts(user_id)`
    );

    console.log('coin_accounts table created/verified');
  } catch (error) {
    console.error('Error creating coin_accounts table:', error);
  }
}

/**
 * Create coin_transactions table if it doesn't exist
 */
export async function createCoinTransactionsTable() {
  const db = getUniversalDb();

  try {
    await execute(
      db,
      `CREATE TABLE IF NOT EXISTS coin_transactions (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        amount INTEGER NOT NULL,
        type TEXT NOT NULL,
        description TEXT,
        reference_id TEXT,
        created_at TEXT NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )`
    );

    await execute(
      db,
      `CREATE INDEX IF NOT EXISTS idx_coin_transactions_user_id ON coin_transactions(user_id)`
    );

    await execute(
      db,
      `CREATE INDEX IF NOT EXISTS idx_coin_transactions_created_at ON coin_transactions(created_at)`
    );

    await execute(
      db,
      `CREATE INDEX IF NOT EXISTS idx_coin_transactions_type ON coin_transactions(type)`
    );

    console.log('coin_transactions table created/verified');
  } catch (error) {
    console.error('Error creating coin_transactions table:', error);
  }
}

/**
 * Create Music Hall tables for music concepts and multi-lens explanations
 */
export async function createMusicHallTables() {
  const db = getUniversalDb();

  try {
    // Create music_concepts table
    await execute(
      db,
      `CREATE TABLE IF NOT EXISTS music_concepts (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        category TEXT NOT NULL,
        difficulty TEXT NOT NULL DEFAULT 'beginner',
        description TEXT,
        emoji TEXT,
        color TEXT,
        prerequisites TEXT,
        related_concepts TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT
      )`
    );

    // Create indexes for music_concepts
    await execute(
      db,
      `CREATE INDEX IF NOT EXISTS idx_music_concepts_category ON music_concepts(category)`
    );
    await execute(
      db,
      `CREATE INDEX IF NOT EXISTS idx_music_concepts_difficulty ON music_concepts(difficulty)`
    );

    console.log('music_concepts table created/verified');

    // Create music_concept_lenses table
    await execute(
      db,
      `CREATE TABLE IF NOT EXISTS music_concept_lenses (
        id TEXT PRIMARY KEY,
        concept_id TEXT NOT NULL,
        lens_type TEXT NOT NULL,
        title TEXT,
        content TEXT NOT NULL,
        video_examples TEXT,
        audio_examples TEXT,
        interactive_data TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (concept_id) REFERENCES music_concepts(id) ON DELETE CASCADE
      )`
    );

    // Create indexes for music_concept_lenses
    await execute(
      db,
      `CREATE INDEX IF NOT EXISTS idx_music_concept_lenses_concept_id ON music_concept_lenses(concept_id)`
    );
    await execute(
      db,
      `CREATE INDEX IF NOT EXISTS idx_music_concept_lenses_type ON music_concept_lenses(lens_type)`
    );

    // Create unique constraint for concept_id + lens_type
    await execute(
      db,
      `CREATE UNIQUE INDEX IF NOT EXISTS idx_music_concept_lenses_unique ON music_concept_lenses(concept_id, lens_type)`
    );

    console.log('music_concept_lenses table created/verified');

    // Create music_journeys table
    await execute(
      db,
      `CREATE TABLE IF NOT EXISTS music_journeys (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        difficulty TEXT DEFAULT 'beginner',
        estimated_minutes INTEGER,
        emoji TEXT,
        color TEXT,
        prerequisites TEXT,
        steps TEXT NOT NULL,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT
      )`
    );
    console.log('music_journeys table created/verified');

    // Create music_journey_progress table
    await execute(
      db,
      `CREATE TABLE IF NOT EXISTS music_journey_progress (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        journey_id TEXT NOT NULL,
        current_step INTEGER DEFAULT 0,
        completed_steps TEXT,
        started_at TEXT DEFAULT CURRENT_TIMESTAMP,
        completed_at TEXT,
        FOREIGN KEY (journey_id) REFERENCES music_journeys(id) ON DELETE CASCADE
      )`
    );
    await execute(
      db,
      `CREATE UNIQUE INDEX IF NOT EXISTS idx_journey_progress_unique ON music_journey_progress(user_id, journey_id)`
    );
    console.log('music_journey_progress table created/verified');

    // Create music_personas table
    await execute(
      db,
      `CREATE TABLE IF NOT EXISTS music_personas (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        emoji TEXT,
        specialty TEXT,
        description TEXT,
        system_prompt TEXT NOT NULL,
        color TEXT,
        avatar_url TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      )`
    );
    console.log('music_personas table created/verified');

    // Create music_processed_songs table
    await execute(
      db,
      `CREATE TABLE IF NOT EXISTS music_processed_songs (
        id TEXT PRIMARY KEY,
        source TEXT NOT NULL,
        source_id TEXT,
        title TEXT,
        artist TEXT,
        duration_ms INTEGER,
        bpm REAL,
        key TEXT,
        time_signature TEXT,
        chords TEXT,
        beats TEXT,
        stems_url TEXT,
        midi_url TEXT,
        waveform_data TEXT,
        processed_at TEXT DEFAULT CURRENT_TIMESTAMP
      )`
    );
    await execute(
      db,
      `CREATE INDEX IF NOT EXISTS idx_processed_songs_source ON music_processed_songs(source, source_id)`
    );
    console.log('music_processed_songs table created/verified');

    // Create music_practice_sessions table
    await execute(
      db,
      `CREATE TABLE IF NOT EXISTS music_practice_sessions (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        song_id TEXT,
        practice_type TEXT,
        duration_ms INTEGER,
        accuracy_score REAL,
        timing_score REAL,
        notes_played INTEGER,
        notes_correct INTEGER,
        started_at TEXT DEFAULT CURRENT_TIMESTAMP,
        ended_at TEXT,
        FOREIGN KEY (song_id) REFERENCES music_processed_songs(id) ON DELETE SET NULL
      )`
    );
    await execute(
      db,
      `CREATE INDEX IF NOT EXISTS idx_practice_sessions_user ON music_practice_sessions(user_id)`
    );
    console.log('music_practice_sessions table created/verified');

    // Create music_learning_profiles table
    await execute(
      db,
      `CREATE TABLE IF NOT EXISTS music_learning_profiles (
        user_id TEXT PRIMARY KEY,
        preferred_instrument TEXT DEFAULT 'piano',
        skill_level TEXT DEFAULT 'beginner',
        learning_style TEXT,
        concepts_mastered TEXT,
        total_practice_minutes INTEGER DEFAULT 0,
        streak_days INTEGER DEFAULT 0,
        last_practice_at TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT
      )`
    );
    console.log('music_learning_profiles table created/verified');

    console.log('Music Hall tables migration complete');
  } catch (error) {
    console.error('Error creating Music Hall tables:', error);
  }
}

/**
 * Add enabled_hubs column to users table for hub preferences
 * Users can choose to see: 'tales', 'learn', or 'both' hubs
 */
export async function addEnabledHubsColumn() {
  const db = getUniversalDb();

  try {
    const result = await db.execute(`PRAGMA table_info(users)`);
    const columns = result.rows as unknown as Array<{ name: string }>;
    const hasEnabledHubs = columns.some((col) => col.name === 'enabled_hubs');

    if (!hasEnabledHubs) {
      await execute(db, `ALTER TABLE users ADD COLUMN enabled_hubs TEXT DEFAULT 'both'`);
      console.log('Added enabled_hubs column to users table');
    } else {
      console.log('enabled_hubs column already exists');
    }
  } catch (error) {
    console.error('Error adding enabled_hubs column:', error);
  }
}

/**
 * Run all migrations
 */
export async function runAllMigrations() {
  await runAuthMigrations();
  await addGoogleIdColumn();
  await addLastLoginColumn();
  await addUserPreferenceColumns();
  await addEnabledHubsColumn();
  await createCoinAccountsTable();
  await createCoinTransactionsTable();
  await createMusicHallTables();
  await runTalesPipelineMigrations();
  await runEducationalApproachesMigrations();
}
