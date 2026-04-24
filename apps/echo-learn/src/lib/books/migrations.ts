/**
 * Database Migrations for Book Discussion System
 *
 * This system enables:
 * 1. Book and chapter summaries
 * 2. AI-powered discussion groups
 * 3. Multiple presentation modes (visual, text, conversation, etc.)
 * 4. Learning pattern tracking across presentation types
 */

import { getUniversalDb } from '@/lib/db/turso';;

export async function runBookMigrations() {
  const db = getUniversalDb();
  console.log('Running book system migrations...');

  // 1. Books table - Core book metadata
  await db.execute(`
    CREATE TABLE IF NOT EXISTS books (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      subtitle TEXT,
      author TEXT NOT NULL,
      author_bio TEXT,
      isbn TEXT,
      publication_year INTEGER,
      genre TEXT,
      cover_url TEXT,
      cover_color TEXT DEFAULT '#8B5CF6',

      -- Content metadata
      total_chapters INTEGER DEFAULT 0,
      estimated_read_time INTEGER, -- minutes
      difficulty_level TEXT, -- 'beginner', 'intermediate', 'advanced'

      -- Summary and context
      short_summary TEXT NOT NULL, -- 2-3 sentences
      full_summary TEXT, -- Multiple paragraphs
      why_read_this TEXT, -- Why this book matters
      target_audience TEXT, -- Who should read this

      -- Key insights (JSON array of strings)
      key_insights TEXT, -- JSON: ["insight 1", "insight 2", ...]
      main_themes TEXT, -- JSON: ["theme 1", "theme 2", ...]

      -- Discussion prompts
      discussion_prompts TEXT, -- JSON: [{"prompt": "...", "difficulty": "easy"}, ...]

      -- Metadata
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      is_public INTEGER DEFAULT 1,
      license_type TEXT DEFAULT 'public_domain', -- 'public_domain', 'licensed', 'fair_use'

      -- Stats
      total_discussions INTEGER DEFAULT 0,
      total_readers INTEGER DEFAULT 0
    )
  `);

  // 2. Book chapters - Detailed chapter content
  await db.execute(`
    CREATE TABLE IF NOT EXISTS book_chapters (
      id TEXT PRIMARY KEY,
      book_id TEXT NOT NULL,
      chapter_number INTEGER NOT NULL,
      chapter_title TEXT NOT NULL,

      -- Chapter content
      summary TEXT NOT NULL, -- 2-3 paragraph summary
      key_points TEXT, -- JSON: ["point 1", "point 2", ...]
      key_quotes TEXT, -- JSON: [{"quote": "...", "page": 42, "context": "..."}, ...]

      -- Learning objectives
      learning_objectives TEXT, -- JSON: ["objective 1", ...]
      discussion_questions TEXT, -- JSON: [{"question": "...", "type": "reflection"}, ...]

      -- Concepts introduced
      new_concepts TEXT, -- JSON: [concept_id, concept_id, ...]
      concepts_reviewed TEXT, -- JSON: [concept_id, ...]

      -- Reading metadata
      estimated_read_time INTEGER, -- minutes for original chapter
      difficulty_rating INTEGER DEFAULT 3, -- 1-5 scale

      -- Connections
      prerequisite_chapters TEXT, -- JSON: [chapter_id, ...]
      related_chapters TEXT, -- JSON: [chapter_id, ...]

      -- Metadata
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,

      FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE
    )
  `);

  // 3. Book concepts - Knowledge graph of concepts
  await db.execute(`
    CREATE TABLE IF NOT EXISTS book_concepts (
      id TEXT PRIMARY KEY,
      book_id TEXT NOT NULL,
      concept_name TEXT NOT NULL,
      concept_category TEXT, -- 'theory', 'principle', 'case_study', 'definition', 'technique'

      -- Concept explanation
      short_definition TEXT NOT NULL, -- 1-2 sentences
      detailed_explanation TEXT,

      -- Visual aids
      visual_metaphor TEXT, -- "Think of this like..."
      real_world_example TEXT,

      -- First introduced
      introduced_in_chapter_id TEXT,
      introduced_in_chapter_number INTEGER,

      -- Related concepts (JSON array of concept IDs)
      related_concepts TEXT, -- JSON: [{"concept_id": "...", "relationship": "prerequisite"}, ...]

      -- Difficulty
      complexity_level INTEGER DEFAULT 3, -- 1-5

      -- Metadata
      created_at TEXT NOT NULL,

      FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE,
      FOREIGN KEY (introduced_in_chapter_id) REFERENCES book_chapters(id) ON DELETE SET NULL
    )
  `);

  // 4. Book discussion rooms - Group or solo discussions
  await db.execute(`
    CREATE TABLE IF NOT EXISTS book_discussion_rooms (
      id TEXT PRIMARY KEY,
      room_code TEXT UNIQUE NOT NULL,
      book_id TEXT NOT NULL,

      -- Room configuration
      discussion_mode TEXT DEFAULT 'full_book', -- 'full_book', 'chapter', 'concept', 'custom_topic'
      focus_chapter_id TEXT, -- If discussing specific chapter
      focus_concept_ids TEXT, -- JSON: [concept_id, ...] if discussing concepts
      custom_topic TEXT, -- Free-form topic if custom_topic mode

      -- Room metadata
      created_by_user_id TEXT,
      created_at TEXT NOT NULL,

      -- AI configuration
      ai_personality TEXT DEFAULT 'socratic', -- 'socratic', 'expert', 'peer', 'facilitator'
      ai_context TEXT, -- JSON with chapter summaries, concepts loaded into AI

      -- Participants
      participant_count INTEGER DEFAULT 1,
      is_group INTEGER DEFAULT 0, -- 0 = solo, 1 = group

      -- Activity
      last_message_at TEXT,
      message_count INTEGER DEFAULT 0,

      FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE,
      FOREIGN KEY (focus_chapter_id) REFERENCES book_chapters(id) ON DELETE SET NULL
    )
  `);

  // 5. Book discussion messages - Conversation history
  await db.execute(`
    CREATE TABLE IF NOT EXISTS book_discussion_messages (
      id TEXT PRIMARY KEY,
      room_id TEXT NOT NULL,

      -- Message details
      sender_type TEXT NOT NULL, -- 'user', 'ai'
      sender_id TEXT, -- User ID if user message
      message_content TEXT NOT NULL,

      -- Context
      referenced_chapter_id TEXT,
      referenced_concept_ids TEXT, -- JSON: [concept_id, ...]
      referenced_quote TEXT,

      -- Metadata
      created_at TEXT NOT NULL,

      FOREIGN KEY (room_id) REFERENCES book_discussion_rooms(id) ON DELETE CASCADE,
      FOREIGN KEY (referenced_chapter_id) REFERENCES book_chapters(id) ON DELETE SET NULL
    )
  `);

  // 6. Book reading progress - Track user progress
  await db.execute(`
    CREATE TABLE IF NOT EXISTS book_reading_progress (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      book_id TEXT NOT NULL,

      -- Progress tracking
      chapters_completed TEXT, -- JSON: [chapter_id, ...]
      current_chapter_id TEXT,
      concepts_understood TEXT, -- JSON: [concept_id, ...]
      concepts_struggling TEXT, -- JSON: [concept_id, ...]

      -- Completion status
      started_at TEXT NOT NULL,
      completed_at TEXT,
      completion_percentage REAL DEFAULT 0,

      -- Engagement metrics
      total_discussion_time INTEGER DEFAULT 0, -- minutes
      total_messages_sent INTEGER DEFAULT 0,
      total_questions_asked INTEGER DEFAULT 0,

      UNIQUE(user_id, book_id),
      FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE,
      FOREIGN KEY (current_chapter_id) REFERENCES book_chapters(id) ON DELETE SET NULL
    )
  `);

  // 7. Book presentation interactions - Track presentation mode effectiveness
  await db.execute(`
    CREATE TABLE IF NOT EXISTS book_presentation_interactions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      book_id TEXT NOT NULL,
      chapter_id TEXT,
      concept_id TEXT,

      -- Presentation mode
      presentation_mode TEXT NOT NULL, -- 'linear_text', 'visual_cards', 'conversation', 'quiz', 'concept_map', 'timeline', 'comparison_table'
      device_type TEXT, -- 'mobile', 'tablet', 'desktop'

      -- Interaction metrics
      time_spent_seconds INTEGER DEFAULT 0,
      scroll_depth_percentage REAL, -- How much they scrolled (for linear formats)
      cards_viewed INTEGER, -- For card-based presentations
      nodes_explored INTEGER, -- For concept maps
      interactions_count INTEGER DEFAULT 0, -- Clicks, taps, hovers

      -- Comprehension signals
      asked_followup_question INTEGER DEFAULT 0,
      requested_explanation INTEGER DEFAULT 0,
      marked_as_understood INTEGER DEFAULT 0,
      marked_as_confusing INTEGER DEFAULT 0,
      took_notes INTEGER DEFAULT 0,

      -- Engagement quality
      engagement_score REAL, -- 0-1 calculated score
      comprehension_score REAL, -- 0-1 based on subsequent quiz/discussion

      -- Session metadata
      session_id TEXT NOT NULL,
      occurred_at TEXT NOT NULL,

      FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE,
      FOREIGN KEY (chapter_id) REFERENCES book_chapters(id) ON DELETE CASCADE,
      FOREIGN KEY (concept_id) REFERENCES book_concepts(id) ON DELETE CASCADE
    )
  `);

  // 8. Book learning patterns - Aggregated learning preferences
  await db.execute(`
    CREATE TABLE IF NOT EXISTS book_learning_patterns (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL UNIQUE,

      -- Preferred presentation modes (0-1 scores)
      linear_text_score REAL DEFAULT 0,
      visual_cards_score REAL DEFAULT 0,
      conversation_score REAL DEFAULT 0,
      quiz_score REAL DEFAULT 0,
      concept_map_score REAL DEFAULT 0,
      timeline_score REAL DEFAULT 0,
      comparison_table_score REAL DEFAULT 0,

      -- Learning style indicators
      prefers_visual INTEGER DEFAULT 0,
      prefers_verbal INTEGER DEFAULT 0,
      prefers_interactive INTEGER DEFAULT 0,
      prefers_structured INTEGER DEFAULT 0,

      -- Optimal conditions
      optimal_session_length INTEGER, -- minutes
      preferred_difficulty_level TEXT, -- 'gradual', 'challenge', 'deep_dive'

      -- Content preferences
      prefers_examples INTEGER DEFAULT 0,
      prefers_theory INTEGER DEFAULT 0,
      prefers_applications INTEGER DEFAULT 0,

      -- Calculated at
      calculated_at TEXT NOT NULL,
      sample_size INTEGER DEFAULT 0, -- Number of interactions used for calculation
      confidence_level REAL DEFAULT 0 -- 0-1, higher with more data
    )
  `);

  // Create indexes for performance
  await db.execute(`CREATE INDEX IF NOT EXISTS idx_book_chapters_book_id ON book_chapters(book_id)`);
  await db.execute(`CREATE INDEX IF NOT EXISTS idx_book_chapters_number ON book_chapters(book_id, chapter_number)`);
  await db.execute(`CREATE INDEX IF NOT EXISTS idx_book_concepts_book_id ON book_concepts(book_id)`);
  await db.execute(`CREATE INDEX IF NOT EXISTS idx_book_concepts_chapter ON book_concepts(introduced_in_chapter_id)`);
  await db.execute(`CREATE INDEX IF NOT EXISTS idx_discussion_rooms_code ON book_discussion_rooms(room_code)`);
  await db.execute(`CREATE INDEX IF NOT EXISTS idx_discussion_messages_room ON book_discussion_messages(room_id)`);
  await db.execute(`CREATE INDEX IF NOT EXISTS idx_reading_progress_user ON book_reading_progress(user_id)`);
  await db.execute(`CREATE INDEX IF NOT EXISTS idx_presentation_interactions_user ON book_presentation_interactions(user_id)`);
  await db.execute(`CREATE INDEX IF NOT EXISTS idx_presentation_interactions_mode ON book_presentation_interactions(presentation_mode)`);

  console.log('✅ Book system migrations completed');
}
