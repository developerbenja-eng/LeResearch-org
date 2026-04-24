import { getUniversalDb, execute } from '../db/turso';

/**
 * Create lingua_users table - profiles for language learners
 */
export async function createLinguaUsersTable() {
  const db = getUniversalDb();

  try {
    await execute(
      db,
      `CREATE TABLE IF NOT EXISTS lingua_users (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        native_language TEXT NOT NULL,
        target_language TEXT NOT NULL,
        current_streak INTEGER DEFAULT 0,
        longest_streak INTEGER DEFAULT 0,
        last_activity_date TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      )`
    );

    console.log('lingua_users table created/verified');
  } catch (error) {
    console.error('Error creating lingua_users table:', error);
    throw error;
  }
}

/**
 * Create lingua_vocabulary table - tracks words each user is learning
 */
export async function createLinguaVocabularyTable() {
  const db = getUniversalDb();

  try {
    await execute(
      db,
      `CREATE TABLE IF NOT EXISTS lingua_vocabulary (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        word TEXT NOT NULL,
        word_normalized TEXT NOT NULL,
        native_translation TEXT,
        status TEXT DEFAULT 'new',
        times_seen INTEGER DEFAULT 0,
        times_correct INTEGER DEFAULT 0,
        first_seen_at TEXT NOT NULL,
        last_seen_at TEXT NOT NULL,
        mastered_at TEXT,
        FOREIGN KEY (user_id) REFERENCES lingua_users(id) ON DELETE CASCADE,
        UNIQUE(user_id, word_normalized)
      )`
    );

    // Create indexes for performance
    await execute(
      db,
      `CREATE INDEX IF NOT EXISTS idx_lingua_vocabulary_user_id
        ON lingua_vocabulary(user_id)`
    );

    await execute(
      db,
      `CREATE INDEX IF NOT EXISTS idx_lingua_vocabulary_status
        ON lingua_vocabulary(user_id, status)`
    );

    await execute(
      db,
      `CREATE INDEX IF NOT EXISTS idx_lingua_vocabulary_word
        ON lingua_vocabulary(word_normalized)`
    );

    console.log('lingua_vocabulary table created/verified');
  } catch (error) {
    console.error('Error creating lingua_vocabulary table:', error);
    throw error;
  }
}

/**
 * Create lingua_conversations table - saved pasted conversations
 */
export async function createLinguaConversationsTable() {
  const db = getUniversalDb();

  try {
    await execute(
      db,
      `CREATE TABLE IF NOT EXISTS lingua_conversations (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        title TEXT,
        raw_text TEXT NOT NULL,
        parsed_data TEXT,
        word_count INTEGER DEFAULT 0,
        new_words_count INTEGER DEFAULT 0,
        created_at TEXT NOT NULL,
        FOREIGN KEY (user_id) REFERENCES lingua_users(id) ON DELETE CASCADE
      )`
    );

    await execute(
      db,
      `CREATE INDEX IF NOT EXISTS idx_lingua_conversations_user
        ON lingua_conversations(user_id)`
    );

    console.log('lingua_conversations table created/verified');
  } catch (error) {
    console.error('Error creating lingua_conversations table:', error);
    throw error;
  }
}

/**
 * Create lingua_word_details table - cached AI-generated word info
 */
export async function createLinguaWordDetailsTable() {
  const db = getUniversalDb();

  try {
    await execute(
      db,
      `CREATE TABLE IF NOT EXISTS lingua_word_details (
        id TEXT PRIMARY KEY,
        word TEXT NOT NULL,
        source_language TEXT NOT NULL,
        target_language TEXT NOT NULL,
        translation TEXT NOT NULL,
        definition TEXT,
        part_of_speech TEXT,
        example_sentence TEXT,
        example_translation TEXT,
        related_words TEXT,
        memory_tip TEXT,
        difficulty_level INTEGER DEFAULT 1,
        created_at TEXT NOT NULL,
        UNIQUE(word, source_language, target_language)
      )`
    );

    await execute(
      db,
      `CREATE INDEX IF NOT EXISTS idx_lingua_word_details_lookup
        ON lingua_word_details(word, source_language)`
    );

    console.log('lingua_word_details table created/verified');
  } catch (error) {
    console.error('Error creating lingua_word_details table:', error);
    throw error;
  }
}

/**
 * Add main_user_id column to lingua_users table
 * Links Lingua profiles to main Echo-Home users
 */
export async function addMainUserIdToLinguaUsers() {
  const db = getUniversalDb();

  try {
    // Check if column already exists by trying to add it
    // SQLite will error if column exists, so we catch and continue
    await execute(
      db,
      `ALTER TABLE lingua_users ADD COLUMN main_user_id TEXT REFERENCES users(id)`
    );
    console.log('Added main_user_id column to lingua_users');
  } catch (error: unknown) {
    // Column might already exist
    const errorMessage = error instanceof Error ? error.message : String(error);
    if (!errorMessage.includes('duplicate column')) {
      console.log('main_user_id column may already exist or:', errorMessage);
    }
  }

  try {
    await execute(
      db,
      `ALTER TABLE lingua_users ADD COLUMN avatar_url TEXT`
    );
    console.log('Added avatar_url column to lingua_users');
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    if (!errorMessage.includes('duplicate column')) {
      console.log('avatar_url column may already exist or:', errorMessage);
    }
  }

  try {
    await execute(
      db,
      `ALTER TABLE lingua_users ADD COLUMN is_active INTEGER DEFAULT 1`
    );
    console.log('Added is_active column to lingua_users');
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    if (!errorMessage.includes('duplicate column')) {
      console.log('is_active column may already exist or:', errorMessage);
    }
  }

  // Create index on main_user_id for faster lookups
  try {
    await execute(
      db,
      `CREATE INDEX IF NOT EXISTS idx_lingua_users_main_user_id
       ON lingua_users(main_user_id)`
    );
  } catch {
    // Index might already exist
  }
}

/**
 * Create lingua_family_connections table
 * Allows users to share learning progress with family members
 */
export async function createLinguaFamilyConnectionsTable() {
  const db = getUniversalDb();

  try {
    await execute(
      db,
      `CREATE TABLE IF NOT EXISTS lingua_family_connections (
        id TEXT PRIMARY KEY,
        owner_user_id TEXT NOT NULL,
        connected_user_id TEXT NOT NULL,
        connection_type TEXT DEFAULT 'family',
        can_view_progress INTEGER DEFAULT 1,
        can_view_vocabulary INTEGER DEFAULT 1,
        status TEXT DEFAULT 'pending',
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        accepted_at TEXT,
        UNIQUE(owner_user_id, connected_user_id)
      )`
    );

    // Create indexes for faster lookups
    await execute(
      db,
      `CREATE INDEX IF NOT EXISTS idx_lingua_family_owner
       ON lingua_family_connections(owner_user_id)`
    );

    await execute(
      db,
      `CREATE INDEX IF NOT EXISTS idx_lingua_family_connected
       ON lingua_family_connections(connected_user_id)`
    );

    await execute(
      db,
      `CREATE INDEX IF NOT EXISTS idx_lingua_family_status
       ON lingua_family_connections(status)`
    );

    console.log('lingua_family_connections table created/verified');
  } catch (error) {
    console.error('Error creating lingua_family_connections table:', error);
    throw error;
  }
}

/**
 * Run all Lingua migrations
 */
export async function runLinguaMigrations() {
  console.log('Running Lingua migrations...');

  await createLinguaUsersTable();
  await createLinguaVocabularyTable();
  await createLinguaConversationsTable();
  await createLinguaWordDetailsTable();

  // User management migrations
  await addMainUserIdToLinguaUsers();
  await createLinguaFamilyConnectionsTable();

  console.log('Lingua migrations completed successfully');
}
