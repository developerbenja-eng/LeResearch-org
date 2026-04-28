/**
 * Database migrations for V4: Collaborative Canvas & Group Chat System
 *
 * Adds support for:
 * - Group conversations (multiple users + multiple AI personas)
 * - Interactive artifacts (games, visualizations, presentations)
 * - Conversation statistics and analytics
 */

import { Client } from '@libsql/client';
import { execute } from '../db/turso';

export async function runCanvasMigrations(db: Client): Promise<void> {
  console.log('Running Canvas System migrations (V4)...');

  // 1. Group Conversations Table
  await execute(
    db,
    `CREATE TABLE IF NOT EXISTS lingua_group_conversations (
      id TEXT PRIMARY KEY,
      room_code TEXT UNIQUE,
      title TEXT NOT NULL,
      conversation_type TEXT NOT NULL,
      created_by TEXT NOT NULL,
      created_at TEXT NOT NULL,
      last_message_at TEXT,
      is_active INTEGER DEFAULT 1,
      settings TEXT,
      FOREIGN KEY (created_by) REFERENCES lingua_users(id)
    )`,
    []
  );

  await execute(
    db,
    `CREATE INDEX IF NOT EXISTS idx_group_conversations_room
     ON lingua_group_conversations(room_code)`,
    []
  );

  await execute(
    db,
    `CREATE INDEX IF NOT EXISTS idx_group_conversations_created_by
     ON lingua_group_conversations(created_by)`,
    []
  );

  // 2. Conversation Participants Table
  await execute(
    db,
    `CREATE TABLE IF NOT EXISTS lingua_conversation_participants (
      id TEXT PRIMARY KEY,
      conversation_id TEXT NOT NULL,
      participant_type TEXT NOT NULL,
      participant_id TEXT NOT NULL,
      display_name TEXT NOT NULL,
      avatar TEXT,
      joined_at TEXT NOT NULL,
      left_at TEXT,
      is_active INTEGER DEFAULT 1,
      role TEXT DEFAULT 'participant',
      FOREIGN KEY (conversation_id) REFERENCES lingua_group_conversations(id)
    )`,
    []
  );

  await execute(
    db,
    `CREATE INDEX IF NOT EXISTS idx_participants_conv
     ON lingua_conversation_participants(conversation_id)`,
    []
  );

  await execute(
    db,
    `CREATE INDEX IF NOT EXISTS idx_participants_user
     ON lingua_conversation_participants(participant_id)`,
    []
  );

  // 3. Group Messages Table
  await execute(
    db,
    `CREATE TABLE IF NOT EXISTS lingua_group_messages (
      id TEXT PRIMARY KEY,
      conversation_id TEXT NOT NULL,
      participant_id TEXT NOT NULL,
      participant_type TEXT NOT NULL,
      content TEXT NOT NULL,
      message_type TEXT DEFAULT 'text',
      audio_url TEXT,
      audio_duration REAL,
      artifact_id TEXT,
      timestamp TEXT NOT NULL,
      FOREIGN KEY (conversation_id) REFERENCES lingua_group_conversations(id),
      FOREIGN KEY (participant_id) REFERENCES lingua_conversation_participants(id)
    )`,
    []
  );

  await execute(
    db,
    `CREATE INDEX IF NOT EXISTS idx_group_messages_conv
     ON lingua_group_messages(conversation_id)`,
    []
  );

  await execute(
    db,
    `CREATE INDEX IF NOT EXISTS idx_group_messages_timestamp
     ON lingua_group_messages(timestamp)`,
    []
  );

  // 4. Artifacts Table
  await execute(
    db,
    `CREATE TABLE IF NOT EXISTS lingua_artifacts (
      id TEXT PRIMARY KEY,
      conversation_id TEXT NOT NULL,
      artifact_type TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      config TEXT NOT NULL,
      created_by TEXT NOT NULL,
      created_at TEXT NOT NULL,
      last_updated TEXT,
      is_active INTEGER DEFAULT 1,
      FOREIGN KEY (conversation_id) REFERENCES lingua_group_conversations(id)
    )`,
    []
  );

  await execute(
    db,
    `CREATE INDEX IF NOT EXISTS idx_artifacts_conv
     ON lingua_artifacts(conversation_id)`,
    []
  );

  await execute(
    db,
    `CREATE INDEX IF NOT EXISTS idx_artifacts_type
     ON lingua_artifacts(artifact_type)`,
    []
  );

  // 5. Artifact Interactions Table
  await execute(
    db,
    `CREATE TABLE IF NOT EXISTS lingua_artifact_interactions (
      id TEXT PRIMARY KEY,
      artifact_id TEXT NOT NULL,
      participant_id TEXT NOT NULL,
      interaction_type TEXT NOT NULL,
      interaction_data TEXT NOT NULL,
      timestamp TEXT NOT NULL,
      FOREIGN KEY (artifact_id) REFERENCES lingua_artifacts(id),
      FOREIGN KEY (participant_id) REFERENCES lingua_conversation_participants(id)
    )`,
    []
  );

  await execute(
    db,
    `CREATE INDEX IF NOT EXISTS idx_artifact_interactions
     ON lingua_artifact_interactions(artifact_id)`,
    []
  );

  await execute(
    db,
    `CREATE INDEX IF NOT EXISTS idx_artifact_interactions_participant
     ON lingua_artifact_interactions(participant_id)`,
    []
  );

  // 6. Conversation Stats Table
  await execute(
    db,
    `CREATE TABLE IF NOT EXISTS lingua_conversation_stats (
      id TEXT PRIMARY KEY,
      conversation_id TEXT NOT NULL UNIQUE,
      total_messages INTEGER DEFAULT 0,
      total_words INTEGER DEFAULT 0,
      total_duration_ms INTEGER DEFAULT 0,

      spanish_word_count INTEGER DEFAULT 0,
      english_word_count INTEGER DEFAULT 0,

      user_message_count INTEGER DEFAULT 0,
      persona_message_count INTEGER DEFAULT 0,

      voice_message_count INTEGER DEFAULT 0,
      total_voice_duration_sec REAL DEFAULT 0,

      unique_words_used INTEGER DEFAULT 0,
      new_words_learned INTEGER DEFAULT 0,

      artifacts_created INTEGER DEFAULT 0,
      games_played INTEGER DEFAULT 0,

      calculated_at TEXT NOT NULL,
      FOREIGN KEY (conversation_id) REFERENCES lingua_group_conversations(id)
    )`,
    []
  );

  await execute(
    db,
    `CREATE INDEX IF NOT EXISTS idx_conversation_stats
     ON lingua_conversation_stats(conversation_id)`,
    []
  );

  // 7. Vocabulary Usage Tracking (for word clouds and stats)
  await execute(
    db,
    `CREATE TABLE IF NOT EXISTS lingua_vocabulary_usage (
      id TEXT PRIMARY KEY,
      conversation_id TEXT NOT NULL,
      word TEXT NOT NULL,
      language TEXT NOT NULL,
      count INTEGER DEFAULT 1,
      first_used_at TEXT NOT NULL,
      last_used_at TEXT NOT NULL,
      FOREIGN KEY (conversation_id) REFERENCES lingua_group_conversations(id)
    )`,
    []
  );

  await execute(
    db,
    `CREATE INDEX IF NOT EXISTS idx_vocab_usage_conv
     ON lingua_vocabulary_usage(conversation_id)`,
    []
  );

  await execute(
    db,
    `CREATE INDEX IF NOT EXISTS idx_vocab_usage_word
     ON lingua_vocabulary_usage(word, language)`,
    []
  );

  console.log('✅ Canvas System migrations completed successfully');
}

/**
 * Generate a unique 6-character room code
 */
export function generateRoomCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Exclude confusing characters
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

/**
 * Generate unique IDs for various entities
 */
export function generateConversationId(): string {
  return `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export function generateParticipantId(): string {
  return `part_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export function generateMessageId(): string {
  return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export function generateArtifactId(): string {
  return `art_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export function generateInteractionId(): string {
  return `int_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}
