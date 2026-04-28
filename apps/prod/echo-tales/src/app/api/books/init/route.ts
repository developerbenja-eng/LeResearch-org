/**
 * Initialize Books Database
 * GET /api/books/init - Initialize database with migrations and seed data
 * Only for development/testing
 */

import { NextRequest, NextResponse } from 'next/server';
import { getUniversalDb } from '@/lib/db/turso';
import { seedBooksSimple } from '@/lib/books/seed-data-simple';
import { withAdminAuth, AuthenticatedRequest } from '@/lib/auth/middleware';

async function runMigrations() {
  const db = getUniversalDb();

  // Create all tables
  const tables = [
    // 1. Books table
    `CREATE TABLE IF NOT EXISTS books (
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
      total_chapters INTEGER DEFAULT 0,
      estimated_read_time INTEGER,
      difficulty_level TEXT,
      short_summary TEXT NOT NULL,
      full_summary TEXT,
      why_read_this TEXT,
      target_audience TEXT,
      key_insights TEXT,
      main_themes TEXT,
      discussion_prompts TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      is_public INTEGER DEFAULT 1,
      license_type TEXT DEFAULT 'public_domain',
      total_discussions INTEGER DEFAULT 0,
      total_readers INTEGER DEFAULT 0
    )`,

    // 2. Book chapters
    `CREATE TABLE IF NOT EXISTS book_chapters (
      id TEXT PRIMARY KEY,
      book_id TEXT NOT NULL,
      chapter_number INTEGER NOT NULL,
      chapter_title TEXT NOT NULL,
      summary TEXT NOT NULL,
      key_points TEXT,
      key_quotes TEXT,
      learning_objectives TEXT,
      discussion_questions TEXT,
      new_concepts TEXT,
      concepts_reviewed TEXT,
      estimated_read_time INTEGER,
      difficulty_rating INTEGER DEFAULT 3,
      prerequisite_chapters TEXT,
      related_chapters TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE
    )`,

    // 3. Book concepts
    `CREATE TABLE IF NOT EXISTS book_concepts (
      id TEXT PRIMARY KEY,
      book_id TEXT NOT NULL,
      concept_name TEXT NOT NULL,
      concept_category TEXT,
      short_definition TEXT NOT NULL,
      detailed_explanation TEXT,
      visual_metaphor TEXT,
      real_world_example TEXT,
      introduced_in_chapter_id TEXT,
      introduced_in_chapter_number INTEGER,
      related_concepts TEXT,
      complexity_level INTEGER DEFAULT 3,
      created_at TEXT NOT NULL,
      FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE
    )`,

    // 4. Discussion rooms
    `CREATE TABLE IF NOT EXISTS book_discussion_rooms (
      id TEXT PRIMARY KEY,
      room_code TEXT UNIQUE NOT NULL,
      book_id TEXT NOT NULL,
      discussion_mode TEXT DEFAULT 'full_book',
      focus_chapter_id TEXT,
      focus_concept_ids TEXT,
      custom_topic TEXT,
      created_by_user_id TEXT,
      created_at TEXT NOT NULL,
      ai_personality TEXT DEFAULT 'socratic',
      ai_context TEXT,
      participant_count INTEGER DEFAULT 1,
      is_group INTEGER DEFAULT 0,
      last_message_at TEXT,
      message_count INTEGER DEFAULT 0,
      FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE
    )`,

    // 5. Discussion messages
    `CREATE TABLE IF NOT EXISTS book_discussion_messages (
      id TEXT PRIMARY KEY,
      room_id TEXT NOT NULL,
      user_id TEXT,
      sender_type TEXT NOT NULL,
      message_text TEXT NOT NULL,
      ai_reasoning TEXT,
      referenced_chapter_id TEXT,
      referenced_concept_id TEXT,
      created_at TEXT NOT NULL,
      FOREIGN KEY (room_id) REFERENCES book_discussion_rooms(id) ON DELETE CASCADE
    )`,

    // 6. Presentation interactions
    `CREATE TABLE IF NOT EXISTS book_presentation_interactions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      book_id TEXT NOT NULL,
      chapter_id TEXT,
      concept_id TEXT,
      presentation_mode TEXT NOT NULL,
      device_type TEXT,
      time_spent_seconds INTEGER DEFAULT 0,
      scroll_depth_percentage REAL,
      cards_viewed INTEGER,
      nodes_explored INTEGER,
      interactions_count INTEGER DEFAULT 0,
      asked_followup_question INTEGER DEFAULT 0,
      requested_explanation INTEGER DEFAULT 0,
      marked_as_understood INTEGER DEFAULT 0,
      marked_as_confusing INTEGER DEFAULT 0,
      took_notes INTEGER DEFAULT 0,
      engagement_score REAL,
      comprehension_score REAL,
      session_id TEXT NOT NULL,
      occurred_at TEXT NOT NULL
    )`,
  ];

  for (const table of tables) {
    await db.execute(table);
  }
}

async function seedData() {
  const db = getUniversalDb();

  // Check if books already exist
  const existing = await db.execute('SELECT COUNT(*) as count FROM books');
  if (existing.rows[0] && (existing.rows[0].count as number) > 0) {
    // Data exists, but chapters might not - delete all and re-seed
    await db.execute('DELETE FROM book_presentation_interactions');
    await db.execute('DELETE FROM book_discussion_messages');
    await db.execute('DELETE FROM book_discussion_rooms');
    await db.execute('DELETE FROM book_concepts');
    await db.execute('DELETE FROM book_chapters');
    await db.execute('DELETE FROM books');
  }

  // Use the simplified seed function
  const result = await seedBooksSimple();

  return result;
}

export async function GET(request: NextRequest) {
  return withAdminAuth(request, async (req: AuthenticatedRequest) => {
    try {
      if (process.env.NODE_ENV === 'production') {
        return NextResponse.json({ error: 'This endpoint is not available in production' }, { status: 403 });
      }

      await runMigrations();
      const seedResult = await seedData();

      return NextResponse.json({
        ...seedResult,
        success: true,
      });
    } catch (error) {
      console.error('Error initializing database:', error);
      return NextResponse.json(
        { success: false, error: String(error) },
        { status: 500 }
      );
    }
  });
}
