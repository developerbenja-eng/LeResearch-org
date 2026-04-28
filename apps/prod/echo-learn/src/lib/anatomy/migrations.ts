import { getUniversalDb, execute } from '../db/turso';

/**
 * Anatomy Hall - Database Migrations
 * Creates all tables for the human body learning feature
 */

/**
 * V1: Create core anatomy content tables
 * - anatomy_structures: bones, muscles, organs, etc.
 * - anatomy_structure_lenses: multi-perspective content
 * - anatomy_relationships: connections between structures
 * - anatomy_models: 3D model metadata
 */
export async function createAnatomyCoreTables() {
  const db = getUniversalDb();

  try {
    // Create anatomy_structures table
    await execute(
      db,
      `CREATE TABLE IF NOT EXISTS anatomy_structures (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        latin_name TEXT,
        category TEXT NOT NULL,
        system TEXT NOT NULL,
        region TEXT NOT NULL,
        difficulty TEXT NOT NULL DEFAULT 'beginner',
        description TEXT NOT NULL,
        parent_structure_id TEXT,
        model_path TEXT,
        model_highlight_ids TEXT,
        image_urls TEXT,
        prerequisites TEXT,
        related_structures TEXT,
        clinical_significance TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT,
        FOREIGN KEY (parent_structure_id) REFERENCES anatomy_structures(id) ON DELETE SET NULL
      )`
    );

    // Create indexes for anatomy_structures
    await execute(
      db,
      `CREATE INDEX IF NOT EXISTS idx_anatomy_structures_system ON anatomy_structures(system)`
    );
    await execute(
      db,
      `CREATE INDEX IF NOT EXISTS idx_anatomy_structures_region ON anatomy_structures(region)`
    );
    await execute(
      db,
      `CREATE INDEX IF NOT EXISTS idx_anatomy_structures_category ON anatomy_structures(category)`
    );
    await execute(
      db,
      `CREATE INDEX IF NOT EXISTS idx_anatomy_structures_difficulty ON anatomy_structures(difficulty)`
    );
    await execute(
      db,
      `CREATE INDEX IF NOT EXISTS idx_anatomy_structures_parent ON anatomy_structures(parent_structure_id)`
    );

    console.log('anatomy_structures table created/verified');

    // Create anatomy_structure_lenses table
    await execute(
      db,
      `CREATE TABLE IF NOT EXISTS anatomy_structure_lenses (
        id TEXT PRIMARY KEY,
        structure_id TEXT NOT NULL,
        lens_type TEXT NOT NULL,
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        image_references TEXT,
        video_references TEXT,
        model_annotations TEXT,
        interactive_data TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (structure_id) REFERENCES anatomy_structures(id) ON DELETE CASCADE
      )`
    );

    // Create indexes for anatomy_structure_lenses
    await execute(
      db,
      `CREATE INDEX IF NOT EXISTS idx_anatomy_lenses_structure_id ON anatomy_structure_lenses(structure_id)`
    );
    await execute(
      db,
      `CREATE INDEX IF NOT EXISTS idx_anatomy_lenses_type ON anatomy_structure_lenses(lens_type)`
    );
    await execute(
      db,
      `CREATE UNIQUE INDEX IF NOT EXISTS idx_anatomy_lenses_unique ON anatomy_structure_lenses(structure_id, lens_type)`
    );

    console.log('anatomy_structure_lenses table created/verified');

    // Create anatomy_relationships table
    await execute(
      db,
      `CREATE TABLE IF NOT EXISTS anatomy_relationships (
        id TEXT PRIMARY KEY,
        source_structure_id TEXT NOT NULL,
        target_structure_id TEXT NOT NULL,
        relationship_type TEXT NOT NULL,
        description TEXT,
        clinical_note TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (source_structure_id) REFERENCES anatomy_structures(id) ON DELETE CASCADE,
        FOREIGN KEY (target_structure_id) REFERENCES anatomy_structures(id) ON DELETE CASCADE
      )`
    );

    // Create indexes for anatomy_relationships
    await execute(
      db,
      `CREATE INDEX IF NOT EXISTS idx_anatomy_rel_source ON anatomy_relationships(source_structure_id)`
    );
    await execute(
      db,
      `CREATE INDEX IF NOT EXISTS idx_anatomy_rel_target ON anatomy_relationships(target_structure_id)`
    );
    await execute(
      db,
      `CREATE INDEX IF NOT EXISTS idx_anatomy_rel_type ON anatomy_relationships(relationship_type)`
    );

    console.log('anatomy_relationships table created/verified');

    // Create anatomy_models table
    await execute(
      db,
      `CREATE TABLE IF NOT EXISTS anatomy_models (
        id TEXT PRIMARY KEY,
        file_path TEXT NOT NULL,
        file_name TEXT NOT NULL,
        model_type TEXT NOT NULL,
        system TEXT,
        region TEXT,
        mesh_ids TEXT,
        mesh_to_structure_map TEXT,
        thumbnail_url TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      )`
    );

    // Create indexes for anatomy_models
    await execute(
      db,
      `CREATE INDEX IF NOT EXISTS idx_anatomy_models_type ON anatomy_models(model_type)`
    );
    await execute(
      db,
      `CREATE INDEX IF NOT EXISTS idx_anatomy_models_system ON anatomy_models(system)`
    );
    await execute(
      db,
      `CREATE INDEX IF NOT EXISTS idx_anatomy_models_region ON anatomy_models(region)`
    );

    console.log('anatomy_models table created/verified');

    console.log('Anatomy Hall V1 (core tables) migration complete');
  } catch (error) {
    console.error('Error creating Anatomy Hall core tables:', error);
    throw error;
  }
}

/**
 * V2: Create user learning tables
 * - anatomy_users: user profiles for anatomy learning
 * - anatomy_vocabulary: medical terminology learning
 */
export async function createAnatomyUserTables() {
  const db = getUniversalDb();

  try {
    // Create anatomy_users table
    await execute(
      db,
      `CREATE TABLE IF NOT EXISTS anatomy_users (
        id TEXT PRIMARY KEY,
        main_user_id TEXT,
        name TEXT NOT NULL,
        current_streak INTEGER DEFAULT 0,
        longest_streak INTEGER DEFAULT 0,
        last_activity_date TEXT,
        preferred_learning_style TEXT DEFAULT 'mixed',
        focus_systems TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT
      )`
    );

    await execute(
      db,
      `CREATE INDEX IF NOT EXISTS idx_anatomy_users_main_user ON anatomy_users(main_user_id)`
    );

    console.log('anatomy_users table created/verified');

    // Create anatomy_vocabulary table
    await execute(
      db,
      `CREATE TABLE IF NOT EXISTS anatomy_vocabulary (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        term TEXT NOT NULL,
        term_normalized TEXT NOT NULL,
        definition TEXT NOT NULL,
        related_structure_id TEXT,
        status TEXT DEFAULT 'new',
        times_seen INTEGER DEFAULT 0,
        times_correct INTEGER DEFAULT 0,
        first_seen_at TEXT DEFAULT CURRENT_TIMESTAMP,
        last_seen_at TEXT,
        mastered_at TEXT,
        next_review_date TEXT,
        ease_factor REAL DEFAULT 2.5,
        interval_days INTEGER DEFAULT 0,
        last_review_date TEXT,
        review_count INTEGER DEFAULT 0,
        FOREIGN KEY (user_id) REFERENCES anatomy_users(id) ON DELETE CASCADE,
        FOREIGN KEY (related_structure_id) REFERENCES anatomy_structures(id) ON DELETE SET NULL
      )`
    );

    await execute(
      db,
      `CREATE INDEX IF NOT EXISTS idx_anatomy_vocab_user ON anatomy_vocabulary(user_id)`
    );
    await execute(
      db,
      `CREATE INDEX IF NOT EXISTS idx_anatomy_vocab_status ON anatomy_vocabulary(status)`
    );
    await execute(
      db,
      `CREATE INDEX IF NOT EXISTS idx_anatomy_vocab_next_review ON anatomy_vocabulary(next_review_date)`
    );
    await execute(
      db,
      `CREATE UNIQUE INDEX IF NOT EXISTS idx_anatomy_vocab_unique ON anatomy_vocabulary(user_id, term_normalized)`
    );

    console.log('anatomy_vocabulary table created/verified');

    console.log('Anatomy Hall V2 (user tables) migration complete');
  } catch (error) {
    console.error('Error creating Anatomy Hall user tables:', error);
    throw error;
  }
}

/**
 * V3: Create SRS review tracking table
 */
export async function createAnatomyReviewTables() {
  const db = getUniversalDb();

  try {
    // Create anatomy_reviews table
    await execute(
      db,
      `CREATE TABLE IF NOT EXISTS anatomy_reviews (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        vocabulary_id TEXT,
        structure_id TEXT,
        review_type TEXT NOT NULL,
        quality INTEGER NOT NULL,
        response_time_ms INTEGER,
        previous_ease_factor REAL,
        new_ease_factor REAL,
        previous_interval INTEGER,
        new_interval INTEGER,
        reviewed_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES anatomy_users(id) ON DELETE CASCADE,
        FOREIGN KEY (vocabulary_id) REFERENCES anatomy_vocabulary(id) ON DELETE CASCADE,
        FOREIGN KEY (structure_id) REFERENCES anatomy_structures(id) ON DELETE CASCADE
      )`
    );

    await execute(
      db,
      `CREATE INDEX IF NOT EXISTS idx_anatomy_reviews_user ON anatomy_reviews(user_id)`
    );
    await execute(
      db,
      `CREATE INDEX IF NOT EXISTS idx_anatomy_reviews_vocab ON anatomy_reviews(vocabulary_id)`
    );
    await execute(
      db,
      `CREATE INDEX IF NOT EXISTS idx_anatomy_reviews_structure ON anatomy_reviews(structure_id)`
    );
    await execute(
      db,
      `CREATE INDEX IF NOT EXISTS idx_anatomy_reviews_date ON anatomy_reviews(reviewed_at)`
    );

    console.log('anatomy_reviews table created/verified');

    console.log('Anatomy Hall V3 (review tables) migration complete');
  } catch (error) {
    console.error('Error creating Anatomy Hall review tables:', error);
    throw error;
  }
}

/**
 * V4: Create quiz system tables
 */
export async function createAnatomyQuizTables() {
  const db = getUniversalDb();

  try {
    // Create anatomy_quiz_sessions table
    await execute(
      db,
      `CREATE TABLE IF NOT EXISTS anatomy_quiz_sessions (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        quiz_type TEXT NOT NULL,
        focus_system TEXT,
        focus_region TEXT,
        difficulty TEXT DEFAULT 'beginner',
        total_questions INTEGER NOT NULL,
        correct_answers INTEGER DEFAULT 0,
        duration_seconds INTEGER,
        completed_at TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES anatomy_users(id) ON DELETE CASCADE
      )`
    );

    await execute(
      db,
      `CREATE INDEX IF NOT EXISTS idx_anatomy_quiz_user ON anatomy_quiz_sessions(user_id)`
    );
    await execute(
      db,
      `CREATE INDEX IF NOT EXISTS idx_anatomy_quiz_type ON anatomy_quiz_sessions(quiz_type)`
    );
    await execute(
      db,
      `CREATE INDEX IF NOT EXISTS idx_anatomy_quiz_created ON anatomy_quiz_sessions(created_at)`
    );

    console.log('anatomy_quiz_sessions table created/verified');

    // Create anatomy_quiz_answers table
    await execute(
      db,
      `CREATE TABLE IF NOT EXISTS anatomy_quiz_answers (
        id TEXT PRIMARY KEY,
        session_id TEXT NOT NULL,
        structure_id TEXT NOT NULL,
        question_type TEXT NOT NULL,
        question_text TEXT NOT NULL,
        user_answer TEXT NOT NULL,
        correct_answer TEXT NOT NULL,
        is_correct INTEGER NOT NULL,
        response_time_ms INTEGER,
        answered_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (session_id) REFERENCES anatomy_quiz_sessions(id) ON DELETE CASCADE,
        FOREIGN KEY (structure_id) REFERENCES anatomy_structures(id) ON DELETE CASCADE
      )`
    );

    await execute(
      db,
      `CREATE INDEX IF NOT EXISTS idx_anatomy_quiz_answers_session ON anatomy_quiz_answers(session_id)`
    );
    await execute(
      db,
      `CREATE INDEX IF NOT EXISTS idx_anatomy_quiz_answers_structure ON anatomy_quiz_answers(structure_id)`
    );

    console.log('anatomy_quiz_answers table created/verified');

    console.log('Anatomy Hall V4 (quiz tables) migration complete');
  } catch (error) {
    console.error('Error creating Anatomy Hall quiz tables:', error);
    throw error;
  }
}

/**
 * V5: Create learning journey tables
 */
export async function createAnatomyJourneyTables() {
  const db = getUniversalDb();

  try {
    // Create anatomy_journeys table
    await execute(
      db,
      `CREATE TABLE IF NOT EXISTS anatomy_journeys (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        system TEXT,
        region TEXT,
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

    await execute(
      db,
      `CREATE INDEX IF NOT EXISTS idx_anatomy_journeys_system ON anatomy_journeys(system)`
    );
    await execute(
      db,
      `CREATE INDEX IF NOT EXISTS idx_anatomy_journeys_difficulty ON anatomy_journeys(difficulty)`
    );

    console.log('anatomy_journeys table created/verified');

    // Create anatomy_journey_progress table
    await execute(
      db,
      `CREATE TABLE IF NOT EXISTS anatomy_journey_progress (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        journey_id TEXT NOT NULL,
        current_step INTEGER DEFAULT 0,
        completed_steps TEXT,
        started_at TEXT DEFAULT CURRENT_TIMESTAMP,
        completed_at TEXT,
        last_activity_at TEXT,
        FOREIGN KEY (user_id) REFERENCES anatomy_users(id) ON DELETE CASCADE,
        FOREIGN KEY (journey_id) REFERENCES anatomy_journeys(id) ON DELETE CASCADE
      )`
    );

    await execute(
      db,
      `CREATE UNIQUE INDEX IF NOT EXISTS idx_anatomy_journey_progress_unique ON anatomy_journey_progress(user_id, journey_id)`
    );
    await execute(
      db,
      `CREATE INDEX IF NOT EXISTS idx_anatomy_journey_progress_user ON anatomy_journey_progress(user_id)`
    );

    console.log('anatomy_journey_progress table created/verified');

    console.log('Anatomy Hall V5 (journey tables) migration complete');
  } catch (error) {
    console.error('Error creating Anatomy Hall journey tables:', error);
    throw error;
  }
}

/**
 * V6: Create progress tracking table
 */
export async function createAnatomyProgressTables() {
  const db = getUniversalDb();

  try {
    // Create anatomy_structure_progress table
    await execute(
      db,
      `CREATE TABLE IF NOT EXISTS anatomy_structure_progress (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        structure_id TEXT NOT NULL,
        mastery_level INTEGER DEFAULT 0,
        times_studied INTEGER DEFAULT 0,
        times_quizzed INTEGER DEFAULT 0,
        times_correct INTEGER DEFAULT 0,
        lenses_viewed TEXT,
        first_studied_at TEXT DEFAULT CURRENT_TIMESTAMP,
        last_studied_at TEXT,
        FOREIGN KEY (user_id) REFERENCES anatomy_users(id) ON DELETE CASCADE,
        FOREIGN KEY (structure_id) REFERENCES anatomy_structures(id) ON DELETE CASCADE
      )`
    );

    await execute(
      db,
      `CREATE UNIQUE INDEX IF NOT EXISTS idx_anatomy_structure_progress_unique ON anatomy_structure_progress(user_id, structure_id)`
    );
    await execute(
      db,
      `CREATE INDEX IF NOT EXISTS idx_anatomy_structure_progress_user ON anatomy_structure_progress(user_id)`
    );
    await execute(
      db,
      `CREATE INDEX IF NOT EXISTS idx_anatomy_structure_progress_mastery ON anatomy_structure_progress(mastery_level)`
    );

    console.log('anatomy_structure_progress table created/verified');

    console.log('Anatomy Hall V6 (progress tables) migration complete');
  } catch (error) {
    console.error('Error creating Anatomy Hall progress tables:', error);
    throw error;
  }
}

/**
 * Run all Anatomy Hall migrations
 */
export async function runAnatomyMigrations() {
  console.log('Starting Anatomy Hall migrations...');

  await createAnatomyCoreTables();
  await createAnatomyUserTables();
  await createAnatomyReviewTables();
  await createAnatomyQuizTables();
  await createAnatomyJourneyTables();
  await createAnatomyProgressTables();

  console.log('All Anatomy Hall migrations completed successfully');
}
