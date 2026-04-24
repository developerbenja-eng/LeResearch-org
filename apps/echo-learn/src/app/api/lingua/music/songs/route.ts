/**
 * Songs Library API
 * GET /api/lingua/music/songs - List saved songs
 * POST /api/lingua/music/songs - Save a song to library
 */

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getUniversalDb } from '@/lib/db/turso';
import { v4 as uuidv4 } from 'uuid';

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('lingua_session');

    if (!sessionCookie?.value) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const session = JSON.parse(sessionCookie.value);
    const userId = session.userId;

    if (!userId) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const source = searchParams.get('source'); // 'spotify' | 'suno' | null for all
    const language = searchParams.get('language');
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');

    const db = getUniversalDb();

    let sql = `
      SELECT s.*, l.has_translations, l.has_timing
      FROM lingua_songs s
      LEFT JOIN lingua_song_lyrics l ON s.id = l.song_id
      WHERE s.user_id = ? AND s.is_saved = 1
    `;
    const args: (string | number)[] = [userId];

    if (source) {
      sql += ' AND s.source = ?';
      args.push(source);
    }

    if (language) {
      sql += ' AND s.language = ?';
      args.push(language);
    }

    sql += ' ORDER BY s.updated_at DESC LIMIT ? OFFSET ?';
    args.push(limit, offset);

    const result = await db.execute({ sql, args });

    // Get total count
    let countSql = 'SELECT COUNT(*) as count FROM lingua_songs WHERE user_id = ? AND is_saved = 1';
    const countArgs: (string | number)[] = [userId];

    if (source) {
      countSql += ' AND source = ?';
      countArgs.push(source);
    }

    if (language) {
      countSql += ' AND language = ?';
      countArgs.push(language);
    }

    const countResult = await db.execute({ sql: countSql, args: countArgs });
    const total = Number(countResult.rows[0]?.count || 0);

    return NextResponse.json({
      songs: result.rows,
      total,
      limit,
      offset,
      hasMore: offset + result.rows.length < total,
    });
  } catch (error) {
    console.error('Error fetching songs:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('lingua_session');

    if (!sessionCookie?.value) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const session = JSON.parse(sessionCookie.value);
    const userId = session.userId;

    if (!userId) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
    }

    const body = await request.json();
    const {
      source,
      spotify_track_id,
      suno_generation_id,
      title,
      artist,
      album,
      duration_ms,
      preview_url,
      full_audio_url,
      cover_image_url,
      language,
      difficulty_level = 1,
    } = body;

    if (!source || !title || !artist || !language) {
      return NextResponse.json(
        { error: 'Missing required fields: source, title, artist, language' },
        { status: 400 }
      );
    }

    if (!['spotify', 'suno'].includes(source)) {
      return NextResponse.json(
        { error: 'Invalid source. Must be "spotify" or "suno"' },
        { status: 400 }
      );
    }

    const db = getUniversalDb();

    // Check if song already exists (by spotify_track_id or suno_generation_id)
    if (spotify_track_id) {
      const existing = await db.execute({
        sql: 'SELECT id FROM lingua_songs WHERE user_id = ? AND spotify_track_id = ?',
        args: [userId, spotify_track_id],
      });

      if (existing.rows.length > 0) {
        // Update to saved
        await db.execute({
          sql: 'UPDATE lingua_songs SET is_saved = 1, updated_at = ? WHERE id = ?',
          args: [new Date().toISOString(), existing.rows[0].id],
        });

        return NextResponse.json({
          success: true,
          song_id: existing.rows[0].id,
          message: 'Song already in library',
        });
      }
    }

    // Create new song
    const songId = uuidv4();
    const now = new Date().toISOString();

    await db.execute({
      sql: `INSERT INTO lingua_songs (
        id, user_id, source, spotify_track_id, suno_generation_id,
        title, artist, album, duration_ms, preview_url, full_audio_url,
        cover_image_url, language, difficulty_level, is_saved,
        times_played, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, 0, ?, ?)`,
      args: [
        songId,
        userId,
        source,
        spotify_track_id || null,
        suno_generation_id || null,
        title,
        artist,
        album || null,
        duration_ms || null,
        preview_url || null,
        full_audio_url || null,
        cover_image_url || null,
        language,
        difficulty_level,
        now,
        now,
      ],
    });

    return NextResponse.json({
      success: true,
      song_id: songId,
      message: 'Song saved to library',
    });
  } catch (error) {
    console.error('Error saving song:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
