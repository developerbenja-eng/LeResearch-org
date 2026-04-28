/**
 * Character Continuity System
 * Makes user-created characters work across Stories, Music, and Lingua
 */

import { getBooksDb, getUniversalDb, query, queryOne, execute } from '@/lib/db/turso';
import { Character } from '@/types/character';
import { Persona } from '@/lib/lingua/ai-chat/personas';

// Feature types that characters can be unlocked for
export type CharacterFeature = 'stories' | 'music' | 'lingua';

export interface CharacterFeatureUnlock {
  id: string;
  characterId: string;
  featureType: CharacterFeature;
  unlockedAt: string;
  isActive: boolean;
}

export interface CharacterLinguaProfile {
  id: string;
  characterId: string;
  region: string;
  country: string;
  personalitySummary: string;
  speechPatterns: string[];
  favoriteTopics: string[];
  backstory: string;
  greetingStyle: string;
  voiceId: string | null;
  difficultyPreference: number;
  createdAt: string;
  updatedAt: string;
}

export interface CharacterMusicProfile {
  id: string;
  characterId: string;
  preferredStyles: string[];
  themeSongId: string | null;
  voiceType: string;
  createdAt: string;
  updatedAt: string;
}

export interface CharacterContinuity {
  character: Character;
  unlockedFeatures: CharacterFeature[];
  linguaProfile: CharacterLinguaProfile | null;
  musicProfile: CharacterMusicProfile | null;
  usage: {
    storiesCount: number;
    songsCount: number;
    linguaConversations: number;
  };
}

// Generate unique IDs
function generateId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Initialize character continuity tables
 */
export async function initCharacterContinuityTables(): Promise<void> {
  const db = getBooksDb();

  // Feature unlocks table
  await execute(db, `
    CREATE TABLE IF NOT EXISTS character_feature_unlocks (
      id TEXT PRIMARY KEY,
      character_id TEXT NOT NULL,
      feature_type TEXT NOT NULL,
      unlocked_at TEXT DEFAULT CURRENT_TIMESTAMP,
      is_active INTEGER DEFAULT 1,
      UNIQUE(character_id, feature_type),
      FOREIGN KEY (character_id) REFERENCES characters(id)
    )
  `);

  // Lingua-specific character profiles
  await execute(db, `
    CREATE TABLE IF NOT EXISTS character_lingua_profiles (
      id TEXT PRIMARY KEY,
      character_id TEXT NOT NULL UNIQUE,
      region TEXT DEFAULT 'Fantasy World',
      country TEXT DEFAULT 'Storybook Land',
      personality_summary TEXT,
      speech_patterns TEXT,
      favorite_topics TEXT,
      backstory TEXT,
      greeting_style TEXT,
      voice_id TEXT,
      difficulty_preference INTEGER DEFAULT 50,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (character_id) REFERENCES characters(id)
    )
  `);

  // Music-specific character profiles
  await execute(db, `
    CREATE TABLE IF NOT EXISTS character_music_profiles (
      id TEXT PRIMARY KEY,
      character_id TEXT NOT NULL UNIQUE,
      preferred_styles TEXT,
      theme_song_id TEXT,
      voice_type TEXT DEFAULT 'child',
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (character_id) REFERENCES characters(id)
    )
  `);

  // Character feature usage tracking
  await execute(db, `
    CREATE TABLE IF NOT EXISTS character_feature_usage (
      id TEXT PRIMARY KEY,
      character_id TEXT NOT NULL,
      feature_type TEXT NOT NULL,
      total_sessions INTEGER DEFAULT 0,
      last_used_at TEXT,
      UNIQUE(character_id, feature_type),
      FOREIGN KEY (character_id) REFERENCES characters(id)
    )
  `);

  // Create indexes
  await execute(db, `CREATE INDEX IF NOT EXISTS idx_char_unlock_char ON character_feature_unlocks(character_id)`);
  await execute(db, `CREATE INDEX IF NOT EXISTS idx_char_lingua_char ON character_lingua_profiles(character_id)`);
  await execute(db, `CREATE INDEX IF NOT EXISTS idx_char_music_char ON character_music_profiles(character_id)`);
}

/**
 * Check if character is unlocked for a feature
 */
export async function isCharacterUnlockedFor(
  characterId: string,
  feature: CharacterFeature
): Promise<boolean> {
  const db = getBooksDb();
  const result = await queryOne<{ is_active: number }>(
    db,
    `SELECT is_active FROM character_feature_unlocks
     WHERE character_id = ? AND feature_type = ?`,
    [characterId, feature]
  );
  return result?.is_active === 1;
}

/**
 * Get all unlocked features for a character
 */
export async function getCharacterUnlocks(characterId: string): Promise<CharacterFeature[]> {
  const db = getBooksDb();
  const results = await query<{ feature_type: CharacterFeature }>(
    db,
    `SELECT feature_type FROM character_feature_unlocks
     WHERE character_id = ? AND is_active = 1`,
    [characterId]
  );
  return results.map((r) => r.feature_type);
}

/**
 * Unlock character for a feature
 */
export async function unlockCharacterFor(
  characterId: string,
  feature: CharacterFeature
): Promise<void> {
  const db = getBooksDb();
  const id = generateId('unlock');

  await execute(
    db,
    `INSERT INTO character_feature_unlocks (id, character_id, feature_type, is_active)
     VALUES (?, ?, ?, 1)
     ON CONFLICT(character_id, feature_type) DO UPDATE SET is_active = 1, unlocked_at = CURRENT_TIMESTAMP`,
    [id, characterId, feature]
  );

  // If unlocking for lingua, create default lingua profile
  if (feature === 'lingua') {
    await createDefaultLinguaProfile(characterId);
  }

  // If unlocking for music, create default music profile
  if (feature === 'music') {
    await createDefaultMusicProfile(characterId);
  }
}

/**
 * Get character with all continuity data
 */
export async function getCharacterContinuity(characterId: string): Promise<CharacterContinuity | null> {
  const db = getBooksDb();

  // Get character
  const character = await queryOne<Character>(
    db,
    'SELECT * FROM characters WHERE id = ? AND is_active = 1',
    [characterId]
  );

  if (!character) return null;

  // Get unlocks
  const unlockedFeatures = await getCharacterUnlocks(characterId);

  // Get lingua profile
  const linguaProfile = await getLinguaProfile(characterId);

  // Get music profile
  const musicProfile = await getMusicProfile(characterId);

  // Get usage stats
  const usage = await getCharacterUsageStats(characterId);

  return {
    character,
    unlockedFeatures,
    linguaProfile,
    musicProfile,
    usage,
  };
}

/**
 * Get lingua profile for a character
 */
export async function getLinguaProfile(characterId: string): Promise<CharacterLinguaProfile | null> {
  const db = getBooksDb();

  const result = await queryOne<{
    id: string;
    character_id: string;
    region: string;
    country: string;
    personality_summary: string;
    speech_patterns: string;
    favorite_topics: string;
    backstory: string;
    greeting_style: string;
    voice_id: string | null;
    difficulty_preference: number;
    created_at: string;
    updated_at: string;
  }>(
    db,
    'SELECT * FROM character_lingua_profiles WHERE character_id = ?',
    [characterId]
  );

  if (!result) return null;

  return {
    id: result.id,
    characterId: result.character_id,
    region: result.region,
    country: result.country,
    personalitySummary: result.personality_summary,
    speechPatterns: JSON.parse(result.speech_patterns || '[]'),
    favoriteTopics: JSON.parse(result.favorite_topics || '[]'),
    backstory: result.backstory,
    greetingStyle: result.greeting_style,
    voiceId: result.voice_id,
    difficultyPreference: result.difficulty_preference,
    createdAt: result.created_at,
    updatedAt: result.updated_at,
  };
}

/**
 * Create default lingua profile from character
 */
async function createDefaultLinguaProfile(characterId: string): Promise<void> {
  const db = getBooksDb();

  // Get character
  const character = await queryOne<Character>(
    db,
    'SELECT * FROM characters WHERE id = ?',
    [characterId]
  );

  if (!character) return;

  const id = generateId('lp');

  // Generate profile from character traits
  const speechPatterns = generateSpeechPatterns(character);
  const backstory = generateBackstory(character);
  const greetingStyle = generateGreeting(character);

  await execute(
    db,
    `INSERT INTO character_lingua_profiles (
      id, character_id, personality_summary, speech_patterns,
      favorite_topics, backstory, greeting_style
    ) VALUES (?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(character_id) DO NOTHING`,
    [
      id,
      characterId,
      character.personality_traits || 'Friendly and curious',
      JSON.stringify(speechPatterns),
      JSON.stringify(['hobbies', 'learning', 'social']),
      backstory,
      greetingStyle,
    ]
  );
}

/**
 * Get music profile for a character
 */
export async function getMusicProfile(characterId: string): Promise<CharacterMusicProfile | null> {
  const db = getBooksDb();

  const result = await queryOne<{
    id: string;
    character_id: string;
    preferred_styles: string;
    theme_song_id: string | null;
    voice_type: string;
    created_at: string;
    updated_at: string;
  }>(
    db,
    'SELECT * FROM character_music_profiles WHERE character_id = ?',
    [characterId]
  );

  if (!result) return null;

  return {
    id: result.id,
    characterId: result.character_id,
    preferredStyles: JSON.parse(result.preferred_styles || '[]'),
    themeSongId: result.theme_song_id,
    voiceType: result.voice_type,
    createdAt: result.created_at,
    updatedAt: result.updated_at,
  };
}

/**
 * Create default music profile from character
 */
async function createDefaultMusicProfile(characterId: string): Promise<void> {
  const db = getBooksDb();

  const character = await queryOne<Character>(
    db,
    'SELECT * FROM characters WHERE id = ?',
    [characterId]
  );

  if (!character) return;

  const id = generateId('mp');

  // Determine voice type based on age
  const age = character.age || 8;
  let voiceType = 'child';
  if (age >= 18) voiceType = character.gender === 'female' ? 'female' : 'male';
  else if (age >= 13) voiceType = 'teen';

  // Default preferred styles based on personality
  const styles = ['lullaby', 'adventure', 'educational'];

  await execute(
    db,
    `INSERT INTO character_music_profiles (id, character_id, preferred_styles, voice_type)
     VALUES (?, ?, ?, ?)
     ON CONFLICT(character_id) DO NOTHING`,
    [id, characterId, JSON.stringify(styles), voiceType]
  );
}

/**
 * Get character usage statistics
 */
async function getCharacterUsageStats(characterId: string): Promise<{
  storiesCount: number;
  songsCount: number;
  linguaConversations: number;
}> {
  const db = getBooksDb();

  // Count stories (books with this character)
  const storiesResult = await queryOne<{ count: number }>(
    db,
    'SELECT COUNT(*) as count FROM book_characters WHERE character_id = ?',
    [characterId]
  );

  // Count songs (would need book_songs table with character_id)
  const songsResult = await queryOne<{ count: number }>(
    db,
    `SELECT COUNT(*) as count FROM book_songs bs
     JOIN book_characters bc ON bs.book_id = bc.book_id
     WHERE bc.character_id = ?`,
    [characterId]
  );

  // Get lingua usage
  const linguaResult = await queryOne<{ total_sessions: number }>(
    db,
    `SELECT total_sessions FROM character_feature_usage
     WHERE character_id = ? AND feature_type = 'lingua'`,
    [characterId]
  );

  return {
    storiesCount: storiesResult?.count || 0,
    songsCount: songsResult?.count || 0,
    linguaConversations: linguaResult?.total_sessions || 0,
  };
}

/**
 * Record character usage
 */
export async function recordCharacterUsage(
  characterId: string,
  feature: CharacterFeature
): Promise<void> {
  const db = getBooksDb();
  const id = generateId('usage');

  await execute(
    db,
    `INSERT INTO character_feature_usage (id, character_id, feature_type, total_sessions, last_used_at)
     VALUES (?, ?, ?, 1, CURRENT_TIMESTAMP)
     ON CONFLICT(character_id, feature_type) DO UPDATE SET
       total_sessions = total_sessions + 1,
       last_used_at = CURRENT_TIMESTAMP`,
    [id, characterId, feature]
  );
}

/**
 * Get all characters with their continuity status for dashboard
 */
export async function getUserCharactersWithContinuity(
  userId: string
): Promise<Array<{
  character: Character;
  unlockedFeatures: CharacterFeature[];
  hasLinguaProfile: boolean;
  hasMusicProfile: boolean;
}>> {
  const db = getBooksDb();

  const characters = await query<Character>(
    db,
    'SELECT * FROM characters WHERE user_id = ? AND is_active = 1 ORDER BY created_at DESC',
    [userId]
  );

  const results = await Promise.all(
    characters.map(async (character) => {
      const unlockedFeatures = await getCharacterUnlocks(character.id);
      const linguaProfile = await getLinguaProfile(character.id);
      const musicProfile = await getMusicProfile(character.id);

      return {
        character,
        unlockedFeatures,
        hasLinguaProfile: linguaProfile !== null,
        hasMusicProfile: musicProfile !== null,
      };
    })
  );

  return results;
}

// Helper functions to generate profiles from character data

function generateSpeechPatterns(character: Character): string[] {
  const patterns: string[] = [];

  if (character.age && character.age < 10) {
    patterns.push('Uses simple words and short sentences');
    patterns.push('Sometimes mixes up grammar playfully');
    patterns.push('Very enthusiastic with exclamations');
  } else if (character.age && character.age < 18) {
    patterns.push('Uses casual, friendly language');
    patterns.push('Incorporates current expressions');
  }

  if (character.personality_traits) {
    const traits = character.personality_traits.toLowerCase();
    if (traits.includes('curious')) {
      patterns.push('Asks lots of questions');
    }
    if (traits.includes('shy')) {
      patterns.push('Speaks softly and hesitantly at first');
    }
    if (traits.includes('brave') || traits.includes('adventurous')) {
      patterns.push('Speaks confidently about adventures');
    }
  }

  if (patterns.length === 0) {
    patterns.push('Friendly and conversational');
  }

  return patterns;
}

function generateBackstory(character: Character): string {
  const name = character.character_name;
  const age = character.age ? `${character.age}-year-old` : 'young';
  const personality = character.personality_traits || 'curious and friendly';

  return `${name} is a ${age} character who is ${personality}. They love learning new things and having conversations with friends.`;
}

function generateGreeting(character: Character): string {
  const name = character.character_name;
  const age = character.age || 8;

  if (age < 10) {
    return `¡Hola! I'm ${name}! Do you want to be my friend? 🌟`;
  } else if (age < 18) {
    return `Hey! I'm ${name}. Nice to meet you! 👋`;
  }
  return `Hello, I'm ${name}. Nice to meet you.`;
}

// ==========================================
// CHARACTER THEME SONGS
// ==========================================

/**
 * Add character theme columns to book_songs and books tables if they don't exist
 */
export async function ensureCharacterSongColumns(): Promise<void> {
  const db = getBooksDb();

  // Add character_id column to book_songs if it doesn't exist
  try {
    await execute(db, `ALTER TABLE book_songs ADD COLUMN character_id TEXT`);
  } catch {
    // Column already exists
  }

  // Add is_character_theme column to book_songs if it doesn't exist
  try {
    await execute(db, `ALTER TABLE book_songs ADD COLUMN is_character_theme INTEGER DEFAULT 0`);
  } catch {
    // Column already exists
  }

  // Create index for character lookups
  try {
    await execute(db, `CREATE INDEX IF NOT EXISTS idx_book_songs_character ON book_songs(character_id)`);
  } catch {
    // Index already exists
  }

  // Add temporary columns to books table for tracking during generation
  try {
    await execute(db, `ALTER TABLE books ADD COLUMN song_character_id TEXT`);
  } catch {
    // Column already exists
  }

  try {
    await execute(db, `ALTER TABLE books ADD COLUMN song_is_character_theme INTEGER DEFAULT 0`);
  } catch {
    // Column already exists
  }
}

/**
 * Set a song as a character's theme song
 */
export async function setCharacterThemeSong(
  characterId: string,
  songId: string
): Promise<void> {
  const db = getBooksDb();

  // Update the song to mark it as a character theme
  await execute(
    db,
    `UPDATE book_songs SET character_id = ?, is_character_theme = 1 WHERE id = ?`,
    [characterId, songId]
  );

  // Update the character's music profile with theme song
  await execute(
    db,
    `UPDATE character_music_profiles SET theme_song_id = ?, updated_at = CURRENT_TIMESTAMP
     WHERE character_id = ?`,
    [songId, characterId]
  );
}

/**
 * Get a character's theme song
 */
export async function getCharacterThemeSong(characterId: string): Promise<{
  id: string;
  song_name: string | null;
  song_url: string;
  duration: number;
  style: string;
} | null> {
  const db = getBooksDb();

  const song = await queryOne<{
    id: string;
    song_name: string | null;
    song_url: string;
    duration: number;
    style: string;
  }>(
    db,
    `SELECT id, song_name, song_url, duration, style FROM book_songs
     WHERE character_id = ? AND is_character_theme = 1
     ORDER BY created_at DESC LIMIT 1`,
    [characterId]
  );

  return song;
}

/**
 * Get all songs associated with a character
 */
export async function getCharacterSongs(characterId: string): Promise<Array<{
  id: string;
  song_name: string | null;
  song_url: string;
  duration: number;
  style: string;
  is_character_theme: boolean;
  book_id: string;
}>> {
  const db = getBooksDb();

  const songs = await query<{
    id: string;
    song_name: string | null;
    song_url: string;
    duration: number;
    style: string;
    is_character_theme: number;
    book_id: string;
  }>(
    db,
    `SELECT id, song_name, song_url, duration, style, is_character_theme, book_id
     FROM book_songs
     WHERE character_id = ?
     ORDER BY is_character_theme DESC, created_at DESC`,
    [characterId]
  );

  return songs.map((s) => ({
    ...s,
    is_character_theme: s.is_character_theme === 1,
  }));
}
