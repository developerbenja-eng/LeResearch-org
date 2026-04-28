/**
 * Echo Reader - Zotero & Metadata Enrichment Migrations
 *
 * Tables for Zotero library integration and academic metadata enrichment.
 */

import { getResearchDb } from '@/lib/db/turso';

export async function runZoteroMigrations() {
  const db = getResearchDb();

  console.log('[Zotero Migration] Starting migrations...');

  // ============================================================================
  // ZOTERO INTEGRATION
  // ============================================================================

  // User Zotero connections
  await db.execute({
    sql: `CREATE TABLE IF NOT EXISTS reader_zotero_connections (
      connection_id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL UNIQUE,
      zotero_user_id TEXT NOT NULL,
      zotero_username TEXT,
      api_key TEXT NOT NULL,
      -- Sync state
      last_sync_at TEXT,
      last_sync_version INTEGER DEFAULT 0,
      sync_status TEXT DEFAULT 'never', -- never, syncing, synced, error
      sync_error TEXT,
      -- Settings
      auto_sync INTEGER DEFAULT 1,
      import_pdfs INTEGER DEFAULT 1,
      import_collections INTEGER DEFAULT 1,
      import_tags INTEGER DEFAULT 1,
      -- Timestamps
      connected_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    )`,
    args: [],
  });
  console.log('[Zotero Migration] Created reader_zotero_connections table');

  // Zotero item mapping (maps Zotero items to our papers)
  // Stores extracted metadata fields for fast queries without parsing JSON
  await db.execute({
    sql: `CREATE TABLE IF NOT EXISTS reader_zotero_items (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      zotero_key TEXT NOT NULL,
      zotero_version INTEGER NOT NULL,
      paper_id TEXT, -- NULL until linked to Echo paper
      item_type TEXT NOT NULL, -- journalArticle, book, etc.
      raw_data TEXT NOT NULL, -- Full Zotero item JSON
      -- Extracted metadata for fast queries (denormalized from raw_data)
      title TEXT,
      authors TEXT, -- JSON array of author names
      first_author TEXT, -- For quick sorting/filtering
      publication_year INTEGER,
      journal TEXT,
      doi TEXT,
      abstract TEXT,
      -- PDF tracking
      has_pdf INTEGER DEFAULT 0,
      pdf_attachment_key TEXT,
      -- Collection memberships (JSON array of zotero_keys)
      collection_keys TEXT,
      -- Tags (JSON array)
      tags TEXT,
      -- Status tracking
      processing_status TEXT DEFAULT 'pending', -- pending, processing, completed, linked, failed, skipped
      echo_status TEXT DEFAULT 'not_imported', -- not_imported, importing, imported, linked
      error_message TEXT,
      -- Timestamps
      date_added TEXT, -- When added to Zotero
      date_modified TEXT, -- Last modified in Zotero
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id, zotero_key),
      FOREIGN KEY (paper_id) REFERENCES reader_papers(paper_id) ON DELETE SET NULL
    )`,
    args: [],
  });
  console.log('[Zotero Migration] Created reader_zotero_items table');

  // Add new columns to existing table if they don't exist (migration for existing installations)
  const columnsToAdd = [
    { name: 'title', type: 'TEXT' },
    { name: 'authors', type: 'TEXT' },
    { name: 'first_author', type: 'TEXT' },
    { name: 'publication_year', type: 'INTEGER' },
    { name: 'journal', type: 'TEXT' },
    { name: 'doi', type: 'TEXT' },
    { name: 'abstract', type: 'TEXT' },
    { name: 'collection_keys', type: 'TEXT' },
    { name: 'tags', type: 'TEXT' },
    { name: 'echo_status', type: "TEXT DEFAULT 'not_imported'" },
    { name: 'date_added', type: 'TEXT' },
    { name: 'date_modified', type: 'TEXT' },
  ];

  for (const col of columnsToAdd) {
    try {
      await db.execute({
        sql: `ALTER TABLE reader_zotero_items ADD COLUMN ${col.name} ${col.type}`,
        args: [],
      });
      console.log(`[Zotero Migration] Added column ${col.name} to reader_zotero_items`);
    } catch (e) {
      // Column likely already exists
    }
  }

  // Zotero collections
  await db.execute({
    sql: `CREATE TABLE IF NOT EXISTS reader_zotero_collections (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      zotero_key TEXT NOT NULL,
      zotero_version INTEGER NOT NULL,
      name TEXT NOT NULL,
      parent_key TEXT,
      collection_id TEXT, -- Our collection ID if mapped
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id, zotero_key),
      FOREIGN KEY (collection_id) REFERENCES reader_collections(collection_id) ON DELETE SET NULL
    )`,
    args: [],
  });
  console.log('[Zotero Migration] Created reader_zotero_collections table');

  // Sync jobs table for tracking sync progress
  await db.execute({
    sql: `CREATE TABLE IF NOT EXISTS reader_zotero_sync_jobs (
      job_id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      -- Job state
      status TEXT DEFAULT 'pending', -- pending, fetching, processing, completed, failed, cancelled
      phase TEXT DEFAULT 'idle', -- idle, fetching_items, fetching_collections, processing_items, enriching
      -- Progress tracking
      total_items INTEGER DEFAULT 0,
      processed_items INTEGER DEFAULT 0,
      failed_items INTEGER DEFAULT 0,
      skipped_items INTEGER DEFAULT 0,
      -- Current item being processed
      current_item_key TEXT,
      current_item_title TEXT,
      -- Zotero version tracking
      zotero_version_before INTEGER DEFAULT 0,
      zotero_version_after INTEGER,
      -- Error info
      last_error TEXT,
      error_count INTEGER DEFAULT 0,
      -- Timing
      started_at TEXT,
      completed_at TEXT,
      last_activity_at TEXT DEFAULT CURRENT_TIMESTAMP,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      -- Settings for this job
      import_pdfs INTEGER DEFAULT 1,
      -- Foreign key
      FOREIGN KEY (user_id) REFERENCES reader_zotero_connections(user_id) ON DELETE CASCADE
    )`,
    args: [],
  });
  console.log('[Zotero Migration] Created reader_zotero_sync_jobs table');

  // Index for finding active jobs
  await db.execute({
    sql: 'CREATE INDEX IF NOT EXISTS idx_zotero_sync_jobs_user_status ON reader_zotero_sync_jobs(user_id, status)',
    args: []
  });

  // ============================================================================
  // METADATA ENRICHMENT (CrossRef + OpenAlex)
  // ============================================================================

  // Enriched metadata storage
  await db.execute({
    sql: `CREATE TABLE IF NOT EXISTS reader_paper_metadata (
      paper_id TEXT PRIMARY KEY,
      -- CrossRef data
      crossref_doi TEXT,
      crossref_validated INTEGER DEFAULT 0,
      crossref_data TEXT, -- Full CrossRef response JSON
      -- OpenAlex data
      openalex_id TEXT,
      openalex_data TEXT, -- Full OpenAlex response JSON
      -- Citation metrics (from OpenAlex)
      cited_by_count INTEGER DEFAULT 0,
      fwci REAL, -- Field-Weighted Citation Impact
      citation_percentile INTEGER, -- 0-100
      citations_by_year TEXT, -- JSON array
      -- Topic classification (from OpenAlex)
      primary_topic TEXT,
      primary_topic_id TEXT,
      topics TEXT, -- JSON array of topics
      field TEXT,
      subfield TEXT,
      domain TEXT,
      -- Open Access info
      is_open_access INTEGER DEFAULT 0,
      oa_status TEXT, -- gold, green, hybrid, bronze, closed
      oa_url TEXT,
      -- Related works (from OpenAlex)
      related_works TEXT, -- JSON array of OpenAlex work IDs
      referenced_works TEXT, -- JSON array of OpenAlex work IDs
      -- Author enrichment
      enriched_authors TEXT, -- JSON with ORCID, institutions, h-index
      -- Timestamps
      enriched_at TEXT,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (paper_id) REFERENCES reader_papers(paper_id) ON DELETE CASCADE
    )`,
    args: [],
  });
  console.log('[Zotero Migration] Created reader_paper_metadata table');

  // Author profiles (from OpenAlex)
  await db.execute({
    sql: `CREATE TABLE IF NOT EXISTS reader_author_profiles (
      author_id TEXT PRIMARY KEY,
      openalex_id TEXT UNIQUE,
      orcid TEXT,
      name TEXT NOT NULL,
      display_name TEXT,
      -- Metrics
      works_count INTEGER DEFAULT 0,
      cited_by_count INTEGER DEFAULT 0,
      h_index INTEGER,
      i10_index INTEGER,
      -- Affiliations
      current_institution TEXT,
      current_institution_id TEXT,
      affiliations TEXT, -- JSON array
      -- Topics
      top_topics TEXT, -- JSON array
      -- Timestamps
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    )`,
    args: [],
  });
  console.log('[Zotero Migration] Created reader_author_profiles table');

  // Paper-author junction with enriched data
  await db.execute({
    sql: `CREATE TABLE IF NOT EXISTS reader_paper_authors (
      paper_id TEXT NOT NULL,
      author_id TEXT NOT NULL,
      author_position INTEGER NOT NULL, -- 1, 2, 3...
      is_corresponding INTEGER DEFAULT 0,
      raw_name TEXT, -- Original name from paper
      raw_affiliation TEXT,
      PRIMARY KEY (paper_id, author_id),
      FOREIGN KEY (paper_id) REFERENCES reader_papers(paper_id) ON DELETE CASCADE,
      FOREIGN KEY (author_id) REFERENCES reader_author_profiles(author_id) ON DELETE CASCADE
    )`,
    args: [],
  });
  console.log('[Zotero Migration] Created reader_paper_authors table');

  // ============================================================================
  // PAPER RECOMMENDATIONS
  // ============================================================================

  await db.execute({
    sql: `CREATE TABLE IF NOT EXISTS reader_recommendations (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      paper_id TEXT NOT NULL, -- The paper we're recommending
      source_paper_id TEXT, -- Paper that triggered this recommendation
      recommendation_type TEXT NOT NULL, -- related, cited_by, cites, author, topic
      score REAL DEFAULT 0,
      reason TEXT, -- Explanation for the recommendation
      is_dismissed INTEGER DEFAULT 0,
      is_saved INTEGER DEFAULT 0,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (paper_id) REFERENCES reader_papers(paper_id) ON DELETE CASCADE,
      FOREIGN KEY (source_paper_id) REFERENCES reader_papers(paper_id) ON DELETE SET NULL
    )`,
    args: [],
  });
  console.log('[Zotero Migration] Created reader_recommendations table');

  // ============================================================================
  // INDEXES
  // ============================================================================

  await db.execute({ sql: 'CREATE INDEX IF NOT EXISTS idx_zotero_connections_user ON reader_zotero_connections(user_id)', args: [] });
  await db.execute({ sql: 'CREATE INDEX IF NOT EXISTS idx_zotero_items_user ON reader_zotero_items(user_id)', args: [] });
  await db.execute({ sql: 'CREATE INDEX IF NOT EXISTS idx_zotero_items_paper ON reader_zotero_items(paper_id)', args: [] });
  await db.execute({ sql: 'CREATE INDEX IF NOT EXISTS idx_zotero_items_status ON reader_zotero_items(processing_status)', args: [] });
  // Indexes for fast Zotero library queries
  await db.execute({ sql: 'CREATE INDEX IF NOT EXISTS idx_zotero_items_doi ON reader_zotero_items(doi)', args: [] });
  await db.execute({ sql: 'CREATE INDEX IF NOT EXISTS idx_zotero_items_year ON reader_zotero_items(publication_year)', args: [] });
  await db.execute({ sql: 'CREATE INDEX IF NOT EXISTS idx_zotero_items_title ON reader_zotero_items(title)', args: [] });
  await db.execute({ sql: 'CREATE INDEX IF NOT EXISTS idx_zotero_items_echo_status ON reader_zotero_items(echo_status)', args: [] });
  await db.execute({ sql: 'CREATE INDEX IF NOT EXISTS idx_zotero_items_user_echo ON reader_zotero_items(user_id, echo_status)', args: [] });
  await db.execute({ sql: 'CREATE INDEX IF NOT EXISTS idx_zotero_collections_user ON reader_zotero_collections(user_id)', args: [] });
  await db.execute({ sql: 'CREATE INDEX IF NOT EXISTS idx_paper_metadata_openalex ON reader_paper_metadata(openalex_id)', args: [] });
  await db.execute({ sql: 'CREATE INDEX IF NOT EXISTS idx_author_profiles_openalex ON reader_author_profiles(openalex_id)', args: [] });
  await db.execute({ sql: 'CREATE INDEX IF NOT EXISTS idx_author_profiles_orcid ON reader_author_profiles(orcid)', args: [] });
  await db.execute({ sql: 'CREATE INDEX IF NOT EXISTS idx_recommendations_user ON reader_recommendations(user_id)', args: [] });

  console.log('[Zotero Migration] Created indexes');
  console.log('[Zotero Migration] Migrations completed successfully!');

  return { success: true };
}
