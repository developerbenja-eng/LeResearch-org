/**
 * Echo-Lingua Database Migrations - V8: Player Enhancements
 *
 * Adds support for:
 * - Loop & Practice Mode (A-B loop markers, playback speed presets)
 * - Chord Diagram Preferences (guitar/piano, fingering display)
 * - Multi-Language Lyrics (translation preferences)
 */

import { getUniversalDb } from '../db/turso';

export async function runLinguaV8PlayerEnhancementsMigrations() {
  console.log('Running Lingua V8 migrations: Player Enhancements...');

  try {
    // 1. Loop Presets Table
    console.log('Creating lingua_song_loop_presets table...');
    await getUniversalDb().execute(`
      CREATE TABLE IF NOT EXISTS lingua_song_loop_presets (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        song_id TEXT NOT NULL,
        loop_name TEXT,
        start_time REAL NOT NULL,
        end_time REAL NOT NULL,
        playback_speed REAL DEFAULT 1.0,
        pitch_shift INTEGER DEFAULT 0,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // Index for fetching user's loops for a song
    await getUniversalDb().execute(`
      CREATE INDEX IF NOT EXISTS idx_loop_presets_user_song
      ON lingua_song_loop_presets(user_id, song_id)
    `);

    console.log('✅ lingua_song_loop_presets table created');

    // 2. Chord Diagram Preferences Table
    console.log('Creating lingua_chord_diagram_preferences table...');
    await getUniversalDb().execute(`
      CREATE TABLE IF NOT EXISTS lingua_chord_diagram_preferences (
        user_id TEXT PRIMARY KEY,
        instrument TEXT DEFAULT 'guitar',
        show_fingering BOOLEAN DEFAULT 1,
        show_transitions BOOLEAN DEFAULT 1,
        show_barre_chords BOOLEAN DEFAULT 1,
        preferred_position INTEGER DEFAULT 0,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    console.log('✅ lingua_chord_diagram_preferences table created');

    // 3. Lyrics Translation Preferences Table
    console.log('Creating lingua_lyrics_translation_preferences table...');
    await getUniversalDb().execute(`
      CREATE TABLE IF NOT EXISTS lingua_lyrics_translation_preferences (
        user_id TEXT PRIMARY KEY,
        show_side_by_side BOOLEAN DEFAULT 1,
        show_original BOOLEAN DEFAULT 1,
        show_translation BOOLEAN DEFAULT 1,
        show_romanization BOOLEAN DEFAULT 0,
        show_cultural_notes BOOLEAN DEFAULT 1,
        auto_translate BOOLEAN DEFAULT 1,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    console.log('✅ lingua_lyrics_translation_preferences table created');

    // 4. Cached Translations Table (avoid re-translating)
    console.log('Creating lingua_cached_translations table...');
    await getUniversalDb().execute(`
      CREATE TABLE IF NOT EXISTS lingua_cached_translations (
        id TEXT PRIMARY KEY,
        song_id TEXT NOT NULL,
        source_language TEXT NOT NULL,
        target_language TEXT NOT NULL,
        original_text TEXT NOT NULL,
        translated_text TEXT NOT NULL,
        romanized_text TEXT,
        cultural_notes TEXT,
        line_index INTEGER,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Index for quick translation lookups
    await getUniversalDb().execute(`
      CREATE INDEX IF NOT EXISTS idx_cached_translations_song_lang
      ON lingua_cached_translations(song_id, source_language, target_language)
    `);

    console.log('✅ lingua_cached_translations table created');

    // 5. Practice Session Stats Table
    console.log('Creating lingua_practice_sessions table...');
    await getUniversalDb().execute(`
      CREATE TABLE IF NOT EXISTS lingua_practice_sessions (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        song_id TEXT NOT NULL,
        session_type TEXT DEFAULT 'practice',
        loops_completed INTEGER DEFAULT 0,
        playback_speeds_used TEXT,
        total_duration_seconds REAL DEFAULT 0,
        chords_practiced TEXT,
        started_at TEXT DEFAULT CURRENT_TIMESTAMP,
        ended_at TEXT,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // Index for user's practice history
    await getUniversalDb().execute(`
      CREATE INDEX IF NOT EXISTS idx_practice_sessions_user
      ON lingua_practice_sessions(user_id, started_at DESC)
    `);

    console.log('✅ lingua_practice_sessions table created');

    console.log('✅ All V8 Player Enhancement migrations completed successfully!');
  } catch (error) {
    console.error('❌ V8 migration failed:', error);
    throw error;
  }
}
