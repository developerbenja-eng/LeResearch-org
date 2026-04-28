import { getUniversalDb, execute } from './turso';

/**
 * Run migrations for the Music Pattern Analysis feature.
 * Called lazily from the patterns API routes.
 */
export async function runPatternMigrations() {
  const db = getUniversalDb();

  await execute(
    db,
    `CREATE TABLE IF NOT EXISTS music_song_patterns (
      id TEXT PRIMARY KEY,
      song_id TEXT NOT NULL UNIQUE,

      -- Audio features (JSON, from Web Audio API)
      spectral_profile TEXT,
      energy_timeline TEXT,

      -- Normalized patterns (queryable flat columns)
      chord_progression TEXT,
      chord_category TEXT,
      chord_nickname TEXT,
      rhythm_groove TEXT,
      rhythm_bpm_bucket TEXT,

      -- Rich analysis (JSON)
      genre_tags TEXT,
      style_dna TEXT,
      rhythm_details TEXT,

      analyzed_at TEXT DEFAULT CURRENT_TIMESTAMP,

      FOREIGN KEY (song_id) REFERENCES music_decoded_songs(id) ON DELETE CASCADE
    )`
  );

  await execute(
    db,
    `CREATE INDEX IF NOT EXISTS idx_song_patterns_chord
      ON music_song_patterns(chord_progression)`
  );

  await execute(
    db,
    `CREATE INDEX IF NOT EXISTS idx_song_patterns_category
      ON music_song_patterns(chord_category)`
  );

  await execute(
    db,
    `CREATE INDEX IF NOT EXISTS idx_song_patterns_groove
      ON music_song_patterns(rhythm_groove)`
  );

  console.log('Pattern migrations completed successfully');
}
