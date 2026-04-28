import { getUniversalDb, execute } from './turso';

/**
 * Run migrations for the Music Decoder feature
 */
export async function runDecoderMigrations() {
  const db = getUniversalDb();

  // Create main decoded songs table
  await execute(
    db,
    `CREATE TABLE IF NOT EXISTS music_decoded_songs (
      id TEXT PRIMARY KEY,
      source_id TEXT NOT NULL,
      source_type TEXT DEFAULT 'youtube',
      title TEXT NOT NULL,
      artist TEXT,
      thumbnail_url TEXT,
      duration_ms INTEGER,
      bpm REAL,
      key TEXT,
      scale TEXT,
      time_signature TEXT,
      lyrics TEXT,
      lyrics_analysis TEXT,
      chord_analysis TEXT,
      structure_analysis TEXT,
      dna_analysis TEXT,
      analysis_status TEXT DEFAULT 'pending',
      analyzed_at TEXT,
      user_id TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT,
      UNIQUE(source_type, source_id)
    )`
  );

  // Create index for source lookups
  await execute(
    db,
    `CREATE INDEX IF NOT EXISTS idx_decoded_songs_source
      ON music_decoded_songs(source_type, source_id)`
  );

  // Create index for user lookups
  await execute(
    db,
    `CREATE INDEX IF NOT EXISTS idx_decoded_songs_user
      ON music_decoded_songs(user_id)`
  );

  // Create index for status lookups
  await execute(
    db,
    `CREATE INDEX IF NOT EXISTS idx_decoded_songs_status
      ON music_decoded_songs(analysis_status)`
  );

  // Create decode history table for tracking user views
  await execute(
    db,
    `CREATE TABLE IF NOT EXISTS music_decode_history (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      decoded_song_id TEXT NOT NULL,
      accessed_at TEXT DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id, decoded_song_id),
      FOREIGN KEY (decoded_song_id) REFERENCES music_decoded_songs(id) ON DELETE CASCADE
    )`
  );

  // Create index for history lookups
  await execute(
    db,
    `CREATE INDEX IF NOT EXISTS idx_decode_history_user
      ON music_decode_history(user_id)`
  );

  // Add stem_urls column for cached stem separation results
  try {
    await execute(db, `ALTER TABLE music_decoded_songs ADD COLUMN stem_urls TEXT`);
  } catch {
    // Column already exists — ignore
  }

  console.log('Decoder migrations completed successfully');
}

/**
 * Check if decoder tables exist
 */
export async function checkDecoderTablesExist(): Promise<boolean> {
  const db = getUniversalDb();
  try {
    const result = await db.execute(
      `SELECT name FROM sqlite_master WHERE type='table' AND name='music_decoded_songs'`
    );
    return result.rows.length > 0;
  } catch {
    return false;
  }
}
