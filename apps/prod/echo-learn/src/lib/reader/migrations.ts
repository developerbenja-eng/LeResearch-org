/**
 * Echo Reader - Database Migrations
 *
 * Creates tables for the academic paper reader feature.
 * Uses the research database (getResearchDb).
 */

import { getResearchDb } from '@/lib/db/turso';

export async function runReaderMigrations() {
  const db = getResearchDb();

  console.log('[Reader Migration] Starting migrations...');

  // ============================================================================
  // CORE PAPER TABLES
  // ============================================================================

  // Main papers table
  await db.execute({
    sql: `CREATE TABLE IF NOT EXISTS reader_papers (
      paper_id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      authors TEXT NOT NULL, -- JSON array of author objects
      publication_year INTEGER,
      doi TEXT,
      journal TEXT,
      abstract TEXT,
      pdf_url TEXT,
      uploaded_by_user_id TEXT NOT NULL,
      processing_status TEXT DEFAULT 'pending', -- pending, processing, completed, failed
      upload_timestamp TEXT DEFAULT CURRENT_TIMESTAMP,
      grobid_raw_xml TEXT, -- Store original XML for re-parsing
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    )`,
    args: [],
  });
  console.log('[Reader Migration] Created reader_papers table');

  // Sections table
  await db.execute({
    sql: `CREATE TABLE IF NOT EXISTS reader_sections (
      section_id TEXT PRIMARY KEY,
      paper_id TEXT NOT NULL,
      section_name TEXT NOT NULL,
      section_type TEXT, -- abstract, introduction, methods, results, etc.
      section_order INTEGER NOT NULL,
      content TEXT,
      audio_url TEXT,
      audio_duration INTEGER, -- seconds
      FOREIGN KEY (paper_id) REFERENCES reader_papers(paper_id) ON DELETE CASCADE
    )`,
    args: [],
  });
  console.log('[Reader Migration] Created reader_sections table');

  // Figures table
  await db.execute({
    sql: `CREATE TABLE IF NOT EXISTS reader_figures (
      figure_id TEXT PRIMARY KEY,
      paper_id TEXT NOT NULL,
      figure_name TEXT,
      caption TEXT,
      page_number INTEGER,
      coords TEXT, -- GROBID coords: "page,x,y,width,height"
      image_url TEXT,
      ai_description TEXT,
      FOREIGN KEY (paper_id) REFERENCES reader_papers(paper_id) ON DELETE CASCADE
    )`,
    args: [],
  });
  console.log('[Reader Migration] Created reader_figures table');

  // Tables table
  await db.execute({
    sql: `CREATE TABLE IF NOT EXISTS reader_tables (
      table_id TEXT PRIMARY KEY,
      paper_id TEXT NOT NULL,
      table_name TEXT,
      caption TEXT,
      page_number INTEGER,
      coords TEXT,
      image_url TEXT,
      ai_description TEXT,
      FOREIGN KEY (paper_id) REFERENCES reader_papers(paper_id) ON DELETE CASCADE
    )`,
    args: [],
  });
  console.log('[Reader Migration] Created reader_tables table');

  // Formulas/equations table
  await db.execute({
    sql: `CREATE TABLE IF NOT EXISTS reader_formulas (
      id TEXT PRIMARY KEY,
      paper_id TEXT NOT NULL,
      formula_id TEXT,
      label TEXT, -- "(1)", "(2)", etc.
      content TEXT NOT NULL, -- LaTeX or text content
      page_number INTEGER,
      coords TEXT,
      formula_order INTEGER,
      ai_explanation TEXT,
      FOREIGN KEY (paper_id) REFERENCES reader_papers(paper_id) ON DELETE CASCADE
    )`,
    args: [],
  });
  console.log('[Reader Migration] Created reader_formulas table');

  // Keywords table
  await db.execute({
    sql: `CREATE TABLE IF NOT EXISTS reader_keywords (
      paper_id TEXT NOT NULL,
      keyword TEXT NOT NULL,
      source TEXT DEFAULT 'grobid', -- grobid, author, extracted, user
      PRIMARY KEY (paper_id, keyword),
      FOREIGN KEY (paper_id) REFERENCES reader_papers(paper_id) ON DELETE CASCADE
    )`,
    args: [],
  });
  console.log('[Reader Migration] Created reader_keywords table');

  // Bibliography/references table
  await db.execute({
    sql: `CREATE TABLE IF NOT EXISTS reader_bibliography (
      id TEXT PRIMARY KEY,
      paper_id TEXT NOT NULL,
      citation_key TEXT, -- "Smith2020"
      ref_order INTEGER,
      ref_title TEXT,
      ref_authors TEXT, -- JSON array
      ref_year INTEGER,
      ref_journal TEXT,
      ref_doi TEXT,
      ref_volume TEXT,
      ref_pages TEXT,
      linked_paper_id TEXT, -- If reference is in our library
      FOREIGN KEY (paper_id) REFERENCES reader_papers(paper_id) ON DELETE CASCADE
    )`,
    args: [],
  });
  console.log('[Reader Migration] Created reader_bibliography table');

  // ============================================================================
  // USER INTERACTION TABLES
  // ============================================================================

  // User paper progress
  await db.execute({
    sql: `CREATE TABLE IF NOT EXISTS reader_user_progress (
      user_id TEXT NOT NULL,
      paper_id TEXT NOT NULL,
      read_status TEXT DEFAULT 'unread', -- unread, reading, read
      current_section_id TEXT,
      current_audio_position INTEGER, -- seconds
      total_reading_time INTEGER DEFAULT 0, -- seconds
      last_read_at TEXT,
      comprehension_score INTEGER, -- 0-100, optional
      PRIMARY KEY (user_id, paper_id),
      FOREIGN KEY (paper_id) REFERENCES reader_papers(paper_id) ON DELETE CASCADE
    )`,
    args: [],
  });
  console.log('[Reader Migration] Created reader_user_progress table');

  // User annotations (highlights, notes, questions)
  await db.execute({
    sql: `CREATE TABLE IF NOT EXISTS reader_annotations (
      annotation_id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      paper_id TEXT NOT NULL,
      section_id TEXT,
      annotation_type TEXT NOT NULL, -- highlight, note, question, bookmark
      color TEXT, -- yellow, green, blue, pink, purple
      content TEXT,
      start_offset INTEGER,
      end_offset INTEGER,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (paper_id) REFERENCES reader_papers(paper_id) ON DELETE CASCADE
    )`,
    args: [],
  });
  console.log('[Reader Migration] Created reader_annotations table');

  // User collections
  await db.execute({
    sql: `CREATE TABLE IF NOT EXISTS reader_collections (
      collection_id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      name TEXT NOT NULL,
      description TEXT,
      color TEXT,
      icon TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    )`,
    args: [],
  });
  console.log('[Reader Migration] Created reader_collections table');

  // Paper-collection junction
  await db.execute({
    sql: `CREATE TABLE IF NOT EXISTS reader_paper_collections (
      paper_id TEXT NOT NULL,
      collection_id TEXT NOT NULL,
      added_at TEXT DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (paper_id, collection_id),
      FOREIGN KEY (paper_id) REFERENCES reader_papers(paper_id) ON DELETE CASCADE,
      FOREIGN KEY (collection_id) REFERENCES reader_collections(collection_id) ON DELETE CASCADE
    )`,
    args: [],
  });
  console.log('[Reader Migration] Created reader_paper_collections table');

  // ============================================================================
  // CONCEPT TRACKING (SRS FOR ACADEMIC TERMS)
  // ============================================================================

  await db.execute({
    sql: `CREATE TABLE IF NOT EXISTS reader_concepts (
      concept_id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      term TEXT NOT NULL,
      definition TEXT NOT NULL,
      first_seen_paper_id TEXT,
      first_seen_section_id TEXT,
      status TEXT DEFAULT 'new', -- new, learning, known
      -- SRS fields
      ease_factor REAL DEFAULT 2.5,
      interval INTEGER DEFAULT 0,
      repetitions INTEGER DEFAULT 0,
      next_review TEXT,
      last_reviewed TEXT,
      related_concepts TEXT, -- JSON array of concept_ids
      papers_seen_in TEXT, -- JSON array of paper_ids
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (first_seen_paper_id) REFERENCES reader_papers(paper_id)
    )`,
    args: [],
  });
  console.log('[Reader Migration] Created reader_concepts table');

  // Concept reviews (SRS history)
  await db.execute({
    sql: `CREATE TABLE IF NOT EXISTS reader_concept_reviews (
      review_id TEXT PRIMARY KEY,
      concept_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      quality INTEGER NOT NULL, -- 0-5 SM-2 quality
      reviewed_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (concept_id) REFERENCES reader_concepts(concept_id) ON DELETE CASCADE
    )`,
    args: [],
  });
  console.log('[Reader Migration] Created reader_concept_reviews table');

  // ============================================================================
  // READING SESSIONS
  // ============================================================================

  await db.execute({
    sql: `CREATE TABLE IF NOT EXISTS reader_sessions (
      session_id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      paper_id TEXT NOT NULL,
      started_at TEXT DEFAULT CURRENT_TIMESTAMP,
      ended_at TEXT,
      duration_seconds INTEGER DEFAULT 0,
      sections_read TEXT, -- JSON array of section_ids
      mode TEXT DEFAULT 'deep', -- deep, skim, review
      notes_taken INTEGER DEFAULT 0,
      highlights_made INTEGER DEFAULT 0,
      concepts_learned INTEGER DEFAULT 0,
      FOREIGN KEY (paper_id) REFERENCES reader_papers(paper_id) ON DELETE CASCADE
    )`,
    args: [],
  });
  console.log('[Reader Migration] Created reader_sessions table');

  // ============================================================================
  // SUMMARIES
  // ============================================================================

  await db.execute({
    sql: `CREATE TABLE IF NOT EXISTS reader_summaries (
      paper_id TEXT NOT NULL,
      summary_type TEXT NOT NULL, -- executive, section, key_findings
      content TEXT NOT NULL, -- JSON
      model_version TEXT,
      generated_at TEXT DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (paper_id, summary_type),
      FOREIGN KEY (paper_id) REFERENCES reader_papers(paper_id) ON DELETE CASCADE
    )`,
    args: [],
  });
  console.log('[Reader Migration] Created reader_summaries table');

  // ============================================================================
  // ENHANCED PROGRESS TRACKING (Per-Section - Like Audiobook Chapters)
  // ============================================================================

  // Per-section listening progress
  await db.execute({
    sql: `CREATE TABLE IF NOT EXISTS reader_section_progress (
      user_id TEXT NOT NULL,
      section_id TEXT NOT NULL,
      paper_id TEXT NOT NULL,
      -- Playback state
      listened_seconds INTEGER DEFAULT 0,
      total_duration INTEGER DEFAULT 0,
      is_completed INTEGER DEFAULT 0,
      completed_at TEXT,
      -- Position for resume
      last_position INTEGER DEFAULT 0,
      last_played_at TEXT,
      -- Engagement metrics
      play_count INTEGER DEFAULT 0,
      replay_count INTEGER DEFAULT 0,
      PRIMARY KEY (user_id, section_id),
      FOREIGN KEY (section_id) REFERENCES reader_sections(section_id) ON DELETE CASCADE,
      FOREIGN KEY (paper_id) REFERENCES reader_papers(paper_id) ON DELETE CASCADE
    )`,
    args: [],
  });
  console.log('[Reader Migration] Created reader_section_progress table');

  // ============================================================================
  // STUDY ROOM / WORKSPACE
  // ============================================================================

  // Study workspaces (like NotebookLM notebooks)
  await db.execute({
    sql: `CREATE TABLE IF NOT EXISTS reader_study_workspaces (
      workspace_id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      name TEXT NOT NULL,
      description TEXT,
      goal TEXT,
      status TEXT DEFAULT 'active', -- active, paused, completed, archived
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
      last_accessed_at TEXT
    )`,
    args: [],
  });
  console.log('[Reader Migration] Created reader_study_workspaces table');

  // Papers in study workspaces
  await db.execute({
    sql: `CREATE TABLE IF NOT EXISTS reader_workspace_papers (
      workspace_id TEXT NOT NULL,
      paper_id TEXT NOT NULL,
      added_at TEXT DEFAULT CURRENT_TIMESTAMP,
      study_order INTEGER DEFAULT 0,
      notes TEXT,
      PRIMARY KEY (workspace_id, paper_id),
      FOREIGN KEY (workspace_id) REFERENCES reader_study_workspaces(workspace_id) ON DELETE CASCADE,
      FOREIGN KEY (paper_id) REFERENCES reader_papers(paper_id) ON DELETE CASCADE
    )`,
    args: [],
  });
  console.log('[Reader Migration] Created reader_workspace_papers table');

  // AI-generated study guides
  await db.execute({
    sql: `CREATE TABLE IF NOT EXISTS reader_study_guides (
      guide_id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      paper_id TEXT,
      workspace_id TEXT,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      model_used TEXT,
      generated_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT,
      is_favorite INTEGER DEFAULT 0,
      FOREIGN KEY (paper_id) REFERENCES reader_papers(paper_id) ON DELETE CASCADE,
      FOREIGN KEY (workspace_id) REFERENCES reader_study_workspaces(workspace_id) ON DELETE CASCADE
    )`,
    args: [],
  });
  console.log('[Reader Migration] Created reader_study_guides table');

  // Concept maps
  await db.execute({
    sql: `CREATE TABLE IF NOT EXISTS reader_concept_maps (
      map_id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      paper_id TEXT,
      workspace_id TEXT,
      title TEXT NOT NULL,
      nodes TEXT NOT NULL,
      edges TEXT NOT NULL,
      central_concept TEXT,
      layout_data TEXT,
      generated_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT,
      FOREIGN KEY (paper_id) REFERENCES reader_papers(paper_id) ON DELETE CASCADE,
      FOREIGN KEY (workspace_id) REFERENCES reader_study_workspaces(workspace_id) ON DELETE CASCADE
    )`,
    args: [],
  });
  console.log('[Reader Migration] Created reader_concept_maps table');

  // AI-generated flashcard decks
  await db.execute({
    sql: `CREATE TABLE IF NOT EXISTS reader_flashcard_decks (
      deck_id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      paper_id TEXT,
      workspace_id TEXT,
      title TEXT NOT NULL,
      description TEXT,
      cards TEXT NOT NULL,
      total_cards INTEGER DEFAULT 0,
      mastered_cards INTEGER DEFAULT 0,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      last_studied_at TEXT,
      FOREIGN KEY (paper_id) REFERENCES reader_papers(paper_id) ON DELETE CASCADE,
      FOREIGN KEY (workspace_id) REFERENCES reader_study_workspaces(workspace_id) ON DELETE CASCADE
    )`,
    args: [],
  });
  console.log('[Reader Migration] Created reader_flashcard_decks table');

  // Flashcard study progress
  await db.execute({
    sql: `CREATE TABLE IF NOT EXISTS reader_flashcard_progress (
      user_id TEXT NOT NULL,
      deck_id TEXT NOT NULL,
      card_id TEXT NOT NULL,
      ease_factor REAL DEFAULT 2.5,
      interval INTEGER DEFAULT 0,
      repetitions INTEGER DEFAULT 0,
      next_review TEXT,
      last_reviewed TEXT,
      correct_count INTEGER DEFAULT 0,
      incorrect_count INTEGER DEFAULT 0,
      PRIMARY KEY (user_id, deck_id, card_id),
      FOREIGN KEY (deck_id) REFERENCES reader_flashcard_decks(deck_id) ON DELETE CASCADE
    )`,
    args: [],
  });
  console.log('[Reader Migration] Created reader_flashcard_progress table');

  // ============================================================================
  // CROSS-DOCUMENT CONNECTIONS
  // ============================================================================

  // Document connections (AI-discovered or user-created)
  await db.execute({
    sql: `CREATE TABLE IF NOT EXISTS reader_document_connections (
      connection_id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      paper_id_1 TEXT NOT NULL,
      paper_id_2 TEXT NOT NULL,
      connection_type TEXT NOT NULL,
      description TEXT,
      strength TEXT DEFAULT 'moderate',
      shared_concepts TEXT,
      is_ai_generated INTEGER DEFAULT 0,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (paper_id_1) REFERENCES reader_papers(paper_id) ON DELETE CASCADE,
      FOREIGN KEY (paper_id_2) REFERENCES reader_papers(paper_id) ON DELETE CASCADE
    )`,
    args: [],
  });
  console.log('[Reader Migration] Created reader_document_connections table');

  // Cross-document annotation links
  await db.execute({
    sql: `CREATE TABLE IF NOT EXISTS reader_annotation_links (
      link_id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      source_annotation_id TEXT NOT NULL,
      target_annotation_id TEXT,
      target_paper_id TEXT,
      target_section_id TEXT,
      link_type TEXT NOT NULL,
      note TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (source_annotation_id) REFERENCES reader_annotations(annotation_id) ON DELETE CASCADE,
      FOREIGN KEY (target_annotation_id) REFERENCES reader_annotations(annotation_id) ON DELETE SET NULL,
      FOREIGN KEY (target_paper_id) REFERENCES reader_papers(paper_id) ON DELETE CASCADE
    )`,
    args: [],
  });
  console.log('[Reader Migration] Created reader_annotation_links table');

  // ============================================================================
  // STUDY CHAT HISTORY
  // ============================================================================

  await db.execute({
    sql: `CREATE TABLE IF NOT EXISTS reader_study_chats (
      chat_id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      paper_id TEXT,
      workspace_id TEXT,
      title TEXT,
      messages TEXT NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT,
      FOREIGN KEY (paper_id) REFERENCES reader_papers(paper_id) ON DELETE CASCADE,
      FOREIGN KEY (workspace_id) REFERENCES reader_study_workspaces(workspace_id) ON DELETE CASCADE
    )`,
    args: [],
  });
  console.log('[Reader Migration] Created reader_study_chats table');

  // ============================================================================
  // DIAGRAMS
  // ============================================================================

  await db.execute({
    sql: `CREATE TABLE IF NOT EXISTS reader_diagrams (
      diagram_id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      paper_id TEXT,
      workspace_id TEXT,
      title TEXT NOT NULL,
      diagram_type TEXT NOT NULL,
      mermaid_code TEXT NOT NULL,
      explanation TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT,
      FOREIGN KEY (paper_id) REFERENCES reader_papers(paper_id) ON DELETE CASCADE,
      FOREIGN KEY (workspace_id) REFERENCES reader_study_workspaces(workspace_id) ON DELETE CASCADE
    )`,
    args: [],
  });
  console.log('[Reader Migration] Created reader_diagrams table');

  // ============================================================================
  // RESEARCH BROWSER BOOKMARKS
  // ============================================================================

  await db.execute({
    sql: `CREATE TABLE IF NOT EXISTS reader_research_bookmarks (
      bookmark_id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      paper_id TEXT,
      url TEXT NOT NULL,
      title TEXT NOT NULL,
      snippet TEXT,
      source TEXT,
      search_query TEXT,
      tab_type TEXT DEFAULT 'web',
      image_url TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (paper_id) REFERENCES reader_papers(paper_id) ON DELETE CASCADE
    )`,
    args: [],
  });
  console.log('[Reader Migration] Created reader_research_bookmarks table');

  // ============================================================================
  // PODCASTS (NotebookLM-style audio overviews)
  // ============================================================================

  await db.execute({
    sql: `CREATE TABLE IF NOT EXISTS reader_podcasts (
      podcast_id TEXT PRIMARY KEY,
      paper_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      -- Generation settings
      speakers INTEGER DEFAULT 2,
      style TEXT DEFAULT 'educational',
      duration TEXT DEFAULT 'medium',
      host1_name TEXT DEFAULT 'Alex',
      host2_name TEXT DEFAULT 'Jordan',
      host1_voice TEXT DEFAULT 'Aoede',
      host2_voice TEXT DEFAULT 'Charon',
      -- Status tracking
      status TEXT DEFAULT 'pending',
      progress INTEGER DEFAULT 0,
      progress_message TEXT,
      error_message TEXT,
      -- Output
      audio_url TEXT,
      audio_duration INTEGER,
      transcript TEXT,
      -- Timestamps
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      started_at TEXT,
      completed_at TEXT,
      FOREIGN KEY (paper_id) REFERENCES reader_papers(paper_id) ON DELETE CASCADE
    )`,
    args: [],
  });
  console.log('[Reader Migration] Created reader_podcasts table');

  // ============================================================================
  // INDEXES
  // ============================================================================

  await db.execute({ sql: 'CREATE INDEX IF NOT EXISTS idx_reader_podcasts_paper ON reader_podcasts(paper_id)', args: [] });
  await db.execute({ sql: 'CREATE INDEX IF NOT EXISTS idx_reader_podcasts_user ON reader_podcasts(user_id)', args: [] });
  await db.execute({ sql: 'CREATE INDEX IF NOT EXISTS idx_reader_papers_user ON reader_papers(uploaded_by_user_id)', args: [] });
  await db.execute({ sql: 'CREATE INDEX IF NOT EXISTS idx_reader_papers_doi ON reader_papers(doi)', args: [] });
  await db.execute({ sql: 'CREATE INDEX IF NOT EXISTS idx_reader_papers_year ON reader_papers(publication_year)', args: [] });
  await db.execute({ sql: 'CREATE INDEX IF NOT EXISTS idx_reader_sections_paper ON reader_sections(paper_id)', args: [] });
  await db.execute({ sql: 'CREATE INDEX IF NOT EXISTS idx_reader_figures_paper ON reader_figures(paper_id)', args: [] });
  await db.execute({ sql: 'CREATE INDEX IF NOT EXISTS idx_reader_tables_paper ON reader_tables(paper_id)', args: [] });
  await db.execute({ sql: 'CREATE INDEX IF NOT EXISTS idx_reader_annotations_user ON reader_annotations(user_id)', args: [] });
  await db.execute({ sql: 'CREATE INDEX IF NOT EXISTS idx_reader_annotations_paper ON reader_annotations(paper_id)', args: [] });
  await db.execute({ sql: 'CREATE INDEX IF NOT EXISTS idx_reader_concepts_user ON reader_concepts(user_id)', args: [] });
  await db.execute({ sql: 'CREATE INDEX IF NOT EXISTS idx_reader_concepts_review ON reader_concepts(next_review)', args: [] });
  await db.execute({ sql: 'CREATE INDEX IF NOT EXISTS idx_reader_progress_user ON reader_user_progress(user_id)', args: [] });
  await db.execute({ sql: 'CREATE INDEX IF NOT EXISTS idx_reader_sessions_user ON reader_sessions(user_id)', args: [] });

  // New indexes for study features
  await db.execute({ sql: 'CREATE INDEX IF NOT EXISTS idx_reader_section_progress_user ON reader_section_progress(user_id)', args: [] });
  await db.execute({ sql: 'CREATE INDEX IF NOT EXISTS idx_reader_section_progress_paper ON reader_section_progress(paper_id)', args: [] });
  await db.execute({ sql: 'CREATE INDEX IF NOT EXISTS idx_reader_workspaces_user ON reader_study_workspaces(user_id)', args: [] });
  await db.execute({ sql: 'CREATE INDEX IF NOT EXISTS idx_reader_study_guides_user ON reader_study_guides(user_id)', args: [] });
  await db.execute({ sql: 'CREATE INDEX IF NOT EXISTS idx_reader_flashcard_decks_user ON reader_flashcard_decks(user_id)', args: [] });
  await db.execute({ sql: 'CREATE INDEX IF NOT EXISTS idx_reader_document_connections_user ON reader_document_connections(user_id)', args: [] });
  await db.execute({ sql: 'CREATE INDEX IF NOT EXISTS idx_reader_study_chats_user ON reader_study_chats(user_id)', args: [] });
  await db.execute({ sql: 'CREATE INDEX IF NOT EXISTS idx_reader_research_bookmarks_user ON reader_research_bookmarks(user_id)', args: [] });
  await db.execute({ sql: 'CREATE INDEX IF NOT EXISTS idx_reader_research_bookmarks_paper ON reader_research_bookmarks(paper_id)', args: [] });

  console.log('[Reader Migration] Created indexes');

  // ============================================================================
  // SCHEMA UPDATES (Add columns to existing tables)
  // ============================================================================

  // Add cover_url column to reader_papers (for AI-generated covers)
  try {
    await db.execute({
      sql: `ALTER TABLE reader_papers ADD COLUMN cover_url TEXT`,
      args: [],
    });
    console.log('[Reader Migration] Added cover_url column to reader_papers');
  } catch (error: any) {
    // Column likely already exists - SQLite throws error on duplicate column
    if (!error.message?.includes('duplicate column')) {
      console.log('[Reader Migration] cover_url column already exists or error:', error.message);
    }
  }

  // Add enrichment columns to reader_bibliography (for OpenAlex/CrossRef data)
  try {
    await db.execute({
      sql: `ALTER TABLE reader_bibliography ADD COLUMN enrichment_data TEXT`,
      args: [],
    });
    console.log('[Reader Migration] Added enrichment_data column to reader_bibliography');
  } catch (error: any) {
    if (!error.message?.includes('duplicate column')) {
      console.log('[Reader Migration] enrichment_data column already exists or error:', error.message);
    }
  }

  try {
    await db.execute({
      sql: `ALTER TABLE reader_bibliography ADD COLUMN enriched_at TEXT`,
      args: [],
    });
    console.log('[Reader Migration] Added enriched_at column to reader_bibliography');
  } catch (error: any) {
    if (!error.message?.includes('duplicate column')) {
      console.log('[Reader Migration] enriched_at column already exists or error:', error.message);
    }
  }

  // Add file_type column to reader_papers (for multi-format support)
  try {
    await db.execute({
      sql: `ALTER TABLE reader_papers ADD COLUMN file_type TEXT DEFAULT 'pdf'`,
      args: [],
    });
    console.log('[Reader Migration] Added file_type column to reader_papers');
  } catch (error: any) {
    if (!error.message?.includes('duplicate column')) {
      console.log('[Reader Migration] file_type column already exists or error:', error.message);
    }
  }

  // Add source_url column to reader_papers (original file URL in GCS, not always a PDF)
  try {
    await db.execute({
      sql: `ALTER TABLE reader_papers ADD COLUMN source_url TEXT`,
      args: [],
    });
    console.log('[Reader Migration] Added source_url column to reader_papers');
  } catch (error: any) {
    if (!error.message?.includes('duplicate column')) {
      console.log('[Reader Migration] source_url column already exists or error:', error.message);
    }
  }

  // Kindle credentials table for Send-to-Kindle feature
  await db.execute({
    sql: `CREATE TABLE IF NOT EXISTS reader_kindle_credentials (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL UNIQUE,
      device_info_encrypted TEXT NOT NULL,
      device_name TEXT,
      given_name TEXT,
      connected_at TEXT DEFAULT CURRENT_TIMESTAMP,
      last_used_at TEXT
    )`,
    args: [],
  });
  console.log('[Reader Migration] Ensured reader_kindle_credentials table exists');

  console.log('[Reader Migration] Migrations completed successfully!');

  return { success: true };
}
