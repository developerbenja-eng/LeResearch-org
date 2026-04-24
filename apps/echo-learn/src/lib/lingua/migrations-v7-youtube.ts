/**
 * Echo-Lin V7 Database Migrations - YouTube Music Integration
 *
 * Adds YouTube support to existing music tables:
 * - Add youtube_video_id column to lingua_songs
 * - Add youtube metadata columns
 */

import { getUniversalDb, execute } from '../db/turso';

export async function runLinguaV7YouTubeMigrations() {
  const db = getUniversalDb();

  console.log('🎥 Running V7 YouTube Music migrations...');

  // Add youtube_video_id column to lingua_songs if it doesn't exist
  console.log('Adding youtube_video_id to lingua_songs...');

  // Check if column exists first
  try {
    await execute(db, `
      ALTER TABLE lingua_songs
      ADD COLUMN youtube_video_id TEXT
    `);
    console.log('✅ Added youtube_video_id column');
  } catch (error: any) {
    if (error.message?.includes('duplicate column name')) {
      console.log('✅ youtube_video_id column already exists');
    } else {
      throw error;
    }
  }

  // Create index on youtube_video_id
  await execute(db, `
    CREATE INDEX IF NOT EXISTS idx_lingua_songs_youtube_id
    ON lingua_songs(youtube_video_id)
  `);

  // Add youtube thumbnail URL
  try {
    await execute(db, `
      ALTER TABLE lingua_songs
      ADD COLUMN youtube_thumbnail_url TEXT
    `);
    console.log('✅ Added youtube_thumbnail_url column');
  } catch (error: any) {
    if (error.message?.includes('duplicate column name')) {
      console.log('✅ youtube_thumbnail_url column already exists');
    } else {
      throw error;
    }
  }

  // Add youtube channel info
  try {
    await execute(db, `
      ALTER TABLE lingua_songs
      ADD COLUMN youtube_channel_name TEXT
    `);
    console.log('✅ Added youtube_channel_name column');
  } catch (error: any) {
    if (error.message?.includes('duplicate column name')) {
      console.log('✅ youtube_channel_name column already exists');
    } else {
      throw error;
    }
  }

  // Add view count for popularity tracking
  try {
    await execute(db, `
      ALTER TABLE lingua_songs
      ADD COLUMN view_count INTEGER DEFAULT 0
    `);
    console.log('✅ Added view_count column');
  } catch (error: any) {
    if (error.message?.includes('duplicate column name')) {
      console.log('✅ view_count column already exists');
    } else {
      throw error;
    }
  }

  console.log('🎥 All V7 YouTube migrations completed successfully!');
}
