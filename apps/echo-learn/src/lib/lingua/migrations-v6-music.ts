/**
 * Echo-Lin V6 Database Migrations - Music Learning Feature
 *
 * Adds music learning tables:
 * - lingua_spotify_tokens: Store Spotify OAuth tokens per user
 * - lingua_songs: Song library (Spotify + Suno songs)
 * - lingua_song_lyrics: Lyrics with translations and timing
 * - lingua_music_sessions: Learning sessions for songs
 * - lingua_song_vocabulary: Links songs to vocabulary items
 * - lingua_suno_generations: Track Suno AI song generation requests
 */

import { getUniversalDb, execute } from '../db/turso';

export async function runLinguaV6MusicMigrations() {
  const db = getUniversalDb();

  console.log('🎵 Creating V6 Music Learning tables...');

  // 1. Create lingua_spotify_tokens table
  console.log('Creating lingua_spotify_tokens table...');
  await execute(db, `
    CREATE TABLE IF NOT EXISTS lingua_spotify_tokens (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      access_token TEXT NOT NULL,
      refresh_token TEXT NOT NULL,
      token_expiry TEXT NOT NULL,
      spotify_user_id TEXT,
      spotify_email TEXT,
      is_premium INTEGER DEFAULT 0,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES lingua_users(id) ON DELETE CASCADE,
      UNIQUE(user_id)
    )
  `);

  await execute(db, `
    CREATE INDEX IF NOT EXISTS idx_lingua_spotify_tokens_user
    ON lingua_spotify_tokens(user_id)
  `);

  console.log('✅ lingua_spotify_tokens table created');

  // 2. Create lingua_songs table
  console.log('Creating lingua_songs table...');
  await execute(db, `
    CREATE TABLE IF NOT EXISTS lingua_songs (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      source TEXT NOT NULL,
      spotify_track_id TEXT,
      suno_generation_id TEXT,
      title TEXT NOT NULL,
      artist TEXT NOT NULL,
      album TEXT,
      duration_ms INTEGER,
      preview_url TEXT,
      full_audio_url TEXT,
      cover_image_url TEXT,
      language TEXT NOT NULL,
      difficulty_level INTEGER DEFAULT 1,
      is_saved INTEGER DEFAULT 0,
      times_played INTEGER DEFAULT 0,
      last_played_at TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES lingua_users(id) ON DELETE CASCADE
    )
  `);

  await execute(db, `
    CREATE INDEX IF NOT EXISTS idx_lingua_songs_user
    ON lingua_songs(user_id)
  `);

  await execute(db, `
    CREATE INDEX IF NOT EXISTS idx_lingua_songs_source
    ON lingua_songs(source)
  `);

  await execute(db, `
    CREATE INDEX IF NOT EXISTS idx_lingua_songs_spotify_id
    ON lingua_songs(spotify_track_id)
  `);

  await execute(db, `
    CREATE INDEX IF NOT EXISTS idx_lingua_songs_language
    ON lingua_songs(user_id, language)
  `);

  console.log('✅ lingua_songs table created');

  // 3. Create lingua_song_lyrics table
  console.log('Creating lingua_song_lyrics table...');
  await execute(db, `
    CREATE TABLE IF NOT EXISTS lingua_song_lyrics (
      id TEXT PRIMARY KEY,
      song_id TEXT NOT NULL,
      lyrics_json TEXT NOT NULL,
      language TEXT NOT NULL,
      has_translations INTEGER DEFAULT 0,
      has_timing INTEGER DEFAULT 0,
      source TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (song_id) REFERENCES lingua_songs(id) ON DELETE CASCADE,
      UNIQUE(song_id)
    )
  `);

  await execute(db, `
    CREATE INDEX IF NOT EXISTS idx_lingua_song_lyrics_song
    ON lingua_song_lyrics(song_id)
  `);

  console.log('✅ lingua_song_lyrics table created');

  // 4. Create lingua_music_sessions table
  console.log('Creating lingua_music_sessions table...');
  await execute(db, `
    CREATE TABLE IF NOT EXISTS lingua_music_sessions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      song_id TEXT NOT NULL,
      session_type TEXT NOT NULL,
      playback_duration_seconds INTEGER DEFAULT 0,
      lines_revealed INTEGER DEFAULT 0,
      words_clicked INTEGER DEFAULT 0,
      vocabulary_added INTEGER DEFAULT 0,
      started_at TEXT NOT NULL,
      completed_at TEXT,
      FOREIGN KEY (user_id) REFERENCES lingua_users(id) ON DELETE CASCADE,
      FOREIGN KEY (song_id) REFERENCES lingua_songs(id) ON DELETE CASCADE
    )
  `);

  await execute(db, `
    CREATE INDEX IF NOT EXISTS idx_lingua_music_sessions_user
    ON lingua_music_sessions(user_id)
  `);

  await execute(db, `
    CREATE INDEX IF NOT EXISTS idx_lingua_music_sessions_song
    ON lingua_music_sessions(song_id)
  `);

  await execute(db, `
    CREATE INDEX IF NOT EXISTS idx_lingua_music_sessions_started
    ON lingua_music_sessions(started_at)
  `);

  console.log('✅ lingua_music_sessions table created');

  // 5. Create lingua_song_vocabulary table
  console.log('Creating lingua_song_vocabulary table...');
  await execute(db, `
    CREATE TABLE IF NOT EXISTS lingua_song_vocabulary (
      id TEXT PRIMARY KEY,
      song_id TEXT NOT NULL,
      vocabulary_id TEXT NOT NULL,
      line_index INTEGER,
      context_text TEXT,
      created_at TEXT NOT NULL,
      FOREIGN KEY (song_id) REFERENCES lingua_songs(id) ON DELETE CASCADE,
      FOREIGN KEY (vocabulary_id) REFERENCES lingua_vocabulary(id) ON DELETE CASCADE,
      UNIQUE(song_id, vocabulary_id)
    )
  `);

  await execute(db, `
    CREATE INDEX IF NOT EXISTS idx_lingua_song_vocabulary_song
    ON lingua_song_vocabulary(song_id)
  `);

  await execute(db, `
    CREATE INDEX IF NOT EXISTS idx_lingua_song_vocabulary_vocab
    ON lingua_song_vocabulary(vocabulary_id)
  `);

  console.log('✅ lingua_song_vocabulary table created');

  // 6. Create lingua_suno_generations table
  console.log('Creating lingua_suno_generations table...');
  await execute(db, `
    CREATE TABLE IF NOT EXISTS lingua_suno_generations (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      prompt TEXT NOT NULL,
      style TEXT NOT NULL,
      language TEXT NOT NULL,
      target_vocabulary TEXT,
      suno_job_id TEXT,
      status TEXT DEFAULT 'pending',
      result_song_id TEXT,
      error_message TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES lingua_users(id) ON DELETE CASCADE,
      FOREIGN KEY (result_song_id) REFERENCES lingua_songs(id) ON DELETE SET NULL
    )
  `);

  await execute(db, `
    CREATE INDEX IF NOT EXISTS idx_lingua_suno_generations_user
    ON lingua_suno_generations(user_id)
  `);

  await execute(db, `
    CREATE INDEX IF NOT EXISTS idx_lingua_suno_generations_status
    ON lingua_suno_generations(status)
  `);

  console.log('✅ lingua_suno_generations table created');

  console.log('🎵 All V6 Music migrations completed successfully!');
}
