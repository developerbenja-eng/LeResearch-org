/**
 * Book Library Migration
 * Creates the book_library and book_content tables in the Research DB
 * for the curated parenting book explorer feature
 */

import { getResearchDb, execute } from './turso';

/**
 * Create the book_library table — one row per curated book
 */
export async function createBookLibraryTable() {
  const db = getResearchDb();

  try {
    await execute(
      db,
      `CREATE TABLE IF NOT EXISTS book_library (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        slug TEXT NOT NULL UNIQUE,
        title TEXT NOT NULL,
        author TEXT NOT NULL,
        category TEXT NOT NULL,
        subcategory TEXT,
        publication_year INTEGER,
        cover_gradient TEXT NOT NULL DEFAULT 'from-gray-500 to-gray-700',
        icon_emoji TEXT NOT NULL DEFAULT '📖',
        short_description TEXT NOT NULL,
        why_we_picked TEXT NOT NULL,
        buy_link TEXT,
        goodreads_url TEXT,
        is_free_online INTEGER DEFAULT 0,
        free_url TEXT,
        verified INTEGER DEFAULT 0,
        status TEXT DEFAULT 'active',
        view_count INTEGER DEFAULT 0,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT
      )`
    );

    await execute(
      db,
      `CREATE INDEX IF NOT EXISTS idx_book_library_category ON book_library(category)`
    );
    await execute(
      db,
      `CREATE INDEX IF NOT EXISTS idx_book_library_slug ON book_library(slug)`
    );
    await execute(
      db,
      `CREATE INDEX IF NOT EXISTS idx_book_library_status ON book_library(status)`
    );

    console.log('book_library table created/verified');
  } catch (error) {
    console.error('Error creating book_library table:', error);
  }
}

/**
 * Create the book_content table — structured content sections per book
 * Each book has multiple content sections stored as JSON
 */
export async function createBookContentTable() {
  const db = getResearchDb();

  try {
    await execute(
      db,
      `CREATE TABLE IF NOT EXISTS book_content (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        book_id INTEGER NOT NULL,
        overview TEXT NOT NULL,
        key_concepts TEXT NOT NULL,
        age_takeaways TEXT NOT NULL,
        activities TEXT NOT NULL,
        is_for_me TEXT NOT NULL,
        related_approaches TEXT,
        related_topics TEXT,
        version INTEGER DEFAULT 1,
        is_verified INTEGER DEFAULT 0,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (book_id) REFERENCES book_library(id)
      )`
    );

    await execute(
      db,
      `CREATE UNIQUE INDEX IF NOT EXISTS idx_book_content_book_version
       ON book_content(book_id, version)`
    );

    console.log('book_content table created/verified');
  } catch (error) {
    console.error('Error creating book_content table:', error);
  }
}

/**
 * Run all book library migrations
 */
export async function runBookLibraryMigrations() {
  await createBookLibraryTable();
  await createBookContentTable();
  console.log('Book library migrations completed');
}
