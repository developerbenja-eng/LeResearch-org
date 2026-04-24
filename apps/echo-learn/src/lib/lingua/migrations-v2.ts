import { getUniversalDb, execute } from '../db/turso';

/**
 * Modify lingua_vocabulary to add SRS columns
 */
export async function addSRSColumnsToVocabulary() {
  const db = getUniversalDb();

  const columns = [
    'ALTER TABLE lingua_vocabulary ADD COLUMN next_review_date TEXT',
    'ALTER TABLE lingua_vocabulary ADD COLUMN ease_factor REAL DEFAULT 2.5',
    'ALTER TABLE lingua_vocabulary ADD COLUMN interval_days INTEGER DEFAULT 0',
    'ALTER TABLE lingua_vocabulary ADD COLUMN last_review_date TEXT',
    'ALTER TABLE lingua_vocabulary ADD COLUMN review_count INTEGER DEFAULT 0',
  ];

  for (const sql of columns) {
    try {
      await execute(db, sql);
      console.log(`✓ Added column: ${sql.split('ADD COLUMN ')[1]?.split(' ')[0]}`);
    } catch (error: any) {
      // Column might already exist, continue
      if (error.message?.includes('duplicate column name')) {
        console.log(`- Column already exists: ${sql.split('ADD COLUMN ')[1]?.split(' ')[0]}`);
      } else {
        throw error;
      }
    }
  }

  console.log('✅ SRS columns added to lingua_vocabulary');
}

/**
 * Create lingua_reviews table
 */
export async function createReviewsTable() {
  const db = getUniversalDb();

  try {
    await execute(db, `
      CREATE TABLE IF NOT EXISTS lingua_reviews (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        vocabulary_id TEXT NOT NULL,
        word TEXT NOT NULL,
        quality INTEGER NOT NULL,
        response_time_ms INTEGER,
        previous_ease_factor REAL,
        new_ease_factor REAL,
        previous_interval INTEGER,
        new_interval INTEGER,
        reviewed_at TEXT NOT NULL,
        FOREIGN KEY (user_id) REFERENCES lingua_users(id) ON DELETE CASCADE,
        FOREIGN KEY (vocabulary_id) REFERENCES lingua_vocabulary(id) ON DELETE CASCADE
      )
    `);

    await execute(db, 'CREATE INDEX IF NOT EXISTS idx_lingua_reviews_user ON lingua_reviews(user_id)');
    await execute(db, 'CREATE INDEX IF NOT EXISTS idx_lingua_reviews_vocab ON lingua_reviews(vocabulary_id)');
    await execute(db, 'CREATE INDEX IF NOT EXISTS idx_lingua_reviews_date ON lingua_reviews(reviewed_at)');

    console.log('✅ lingua_reviews table created');
  } catch (error) {
    console.error('Error creating lingua_reviews table:', error);
    throw error;
  }
}

/**
 * Create quiz tables
 */
export async function createQuizTables() {
  const db = getUniversalDb();

  try {
    // Quiz sessions
    await execute(db, `
      CREATE TABLE IF NOT EXISTS lingua_quiz_sessions (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        quiz_type TEXT NOT NULL,
        total_questions INTEGER NOT NULL,
        correct_answers INTEGER DEFAULT 0,
        completed_at TEXT,
        duration_seconds INTEGER,
        created_at TEXT NOT NULL,
        FOREIGN KEY (user_id) REFERENCES lingua_users(id) ON DELETE CASCADE
      )
    `);

    await execute(db, 'CREATE INDEX IF NOT EXISTS idx_lingua_quiz_sessions_user ON lingua_quiz_sessions(user_id)');
    await execute(db, 'CREATE INDEX IF NOT EXISTS idx_lingua_quiz_sessions_date ON lingua_quiz_sessions(created_at)');

    // Quiz answers
    await execute(db, `
      CREATE TABLE IF NOT EXISTS lingua_quiz_answers (
        id TEXT PRIMARY KEY,
        session_id TEXT NOT NULL,
        vocabulary_id TEXT NOT NULL,
        word TEXT NOT NULL,
        question_type TEXT NOT NULL,
        user_answer TEXT,
        correct_answer TEXT NOT NULL,
        is_correct INTEGER NOT NULL,
        response_time_ms INTEGER,
        answered_at TEXT NOT NULL,
        FOREIGN KEY (session_id) REFERENCES lingua_quiz_sessions(id) ON DELETE CASCADE,
        FOREIGN KEY (vocabulary_id) REFERENCES lingua_vocabulary(id) ON DELETE SET NULL
      )
    `);

    await execute(db, 'CREATE INDEX IF NOT EXISTS idx_lingua_quiz_answers_session ON lingua_quiz_answers(session_id)');
    await execute(db, 'CREATE INDEX IF NOT EXISTS idx_lingua_quiz_answers_vocab ON lingua_quiz_answers(vocabulary_id)');

    console.log('✅ Quiz tables created');
  } catch (error) {
    console.error('Error creating quiz tables:', error);
    throw error;
  }
}

/**
 * Run all V2 migrations
 */
export async function runLinguaV2Migrations() {
  console.log('🚀 Starting Echo-Lin V2 migrations...\n');

  try {
    await addSRSColumnsToVocabulary();
    console.log('');

    await createReviewsTable();
    console.log('');

    await createQuizTables();
    console.log('');

    console.log('✅ Echo-Lin V2 migrations completed successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  }
}
