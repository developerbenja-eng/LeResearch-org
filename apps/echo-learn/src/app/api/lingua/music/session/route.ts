/**
 * Music Session Tracking API
 * POST /api/lingua/music/session/start - Start a learning session
 * POST /api/lingua/music/session/track - Track events during session
 * POST /api/lingua/music/session/end - End session with stats
 */

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getUniversalDb } from '@/lib/db/turso';
import { v4 as uuidv4 } from 'uuid';

// Start a new session
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
    const { action, song_id, session_id, session_type = 'listening' } = body;

    const db = getUniversalDb();
    const now = new Date().toISOString();

    if (action === 'start') {
      // Start new session
      if (!song_id) {
        return NextResponse.json({ error: 'song_id is required' }, { status: 400 });
      }

      // Verify song exists
      const songCheck = await db.execute({
        sql: 'SELECT id FROM lingua_songs WHERE id = ? AND user_id = ?',
        args: [song_id, userId],
      });

      if (songCheck.rows.length === 0) {
        return NextResponse.json({ error: 'Song not found' }, { status: 404 });
      }

      const newSessionId = uuidv4();

      await db.execute({
        sql: `INSERT INTO lingua_music_sessions (
          id, user_id, song_id, session_type, playback_duration_seconds,
          lines_revealed, words_clicked, vocabulary_added, started_at
        ) VALUES (?, ?, ?, ?, 0, 0, 0, 0, ?)`,
        args: [newSessionId, userId, song_id, session_type, now],
      });

      return NextResponse.json({
        success: true,
        session_id: newSessionId,
      });
    }

    if (action === 'track') {
      // Track events during session
      if (!session_id) {
        return NextResponse.json({ error: 'session_id is required' }, { status: 400 });
      }

      const { event_type, data } = body;

      // Verify session exists and belongs to user
      const sessionCheck = await db.execute({
        sql: 'SELECT * FROM lingua_music_sessions WHERE id = ? AND user_id = ?',
        args: [session_id, userId],
      });

      if (sessionCheck.rows.length === 0) {
        return NextResponse.json({ error: 'Session not found' }, { status: 404 });
      }

      const currentSession = sessionCheck.rows[0];

      // Update session stats based on event
      const updates: string[] = [];
      const args: (string | number)[] = [];

      switch (event_type) {
        case 'playback_time':
          if (data?.seconds) {
            updates.push('playback_duration_seconds = playback_duration_seconds + ?');
            args.push(data.seconds);
          }
          break;

        case 'line_revealed':
          updates.push('lines_revealed = lines_revealed + 1');
          break;

        case 'word_clicked':
          updates.push('words_clicked = words_clicked + 1');
          break;

        case 'vocabulary_added':
          const count = data?.count || 1;
          updates.push('vocabulary_added = vocabulary_added + ?');
          args.push(count);
          break;
      }

      if (updates.length > 0) {
        args.push(session_id);
        await db.execute({
          sql: `UPDATE lingua_music_sessions SET ${updates.join(', ')} WHERE id = ?`,
          args,
        });
      }

      return NextResponse.json({ success: true });
    }

    if (action === 'end') {
      // End session
      if (!session_id) {
        return NextResponse.json({ error: 'session_id is required' }, { status: 400 });
      }

      // Get session
      const sessionCheck = await db.execute({
        sql: 'SELECT * FROM lingua_music_sessions WHERE id = ? AND user_id = ?',
        args: [session_id, userId],
      });

      if (sessionCheck.rows.length === 0) {
        return NextResponse.json({ error: 'Session not found' }, { status: 404 });
      }

      const currentSession = sessionCheck.rows[0];

      // Mark as completed
      await db.execute({
        sql: 'UPDATE lingua_music_sessions SET completed_at = ? WHERE id = ?',
        args: [now, session_id],
      });

      // Update song play count
      await db.execute({
        sql: `UPDATE lingua_songs
              SET times_played = times_played + 1, last_played_at = ?, updated_at = ?
              WHERE id = ?`,
        args: [now, now, currentSession.song_id],
      });

      return NextResponse.json({
        success: true,
        stats: {
          playback_duration_seconds: currentSession.playback_duration_seconds,
          lines_revealed: currentSession.lines_revealed,
          words_clicked: currentSession.words_clicked,
          vocabulary_added: currentSession.vocabulary_added,
        },
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Session error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// GET - Get session stats summary
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
    const period = searchParams.get('period') || 'all'; // 'today', 'week', 'month', 'all'

    const db = getUniversalDb();

    let dateFilter = '';
    const now = new Date();

    switch (period) {
      case 'today':
        dateFilter = ` AND started_at >= '${now.toISOString().split('T')[0]}'`;
        break;
      case 'week':
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        dateFilter = ` AND started_at >= '${weekAgo.toISOString()}'`;
        break;
      case 'month':
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        dateFilter = ` AND started_at >= '${monthAgo.toISOString()}'`;
        break;
    }

    // Aggregate stats
    const statsResult = await db.execute({
      sql: `
        SELECT
          COUNT(*) as total_sessions,
          SUM(playback_duration_seconds) as total_listening_seconds,
          SUM(lines_revealed) as total_lines_revealed,
          SUM(words_clicked) as total_words_clicked,
          SUM(vocabulary_added) as total_vocabulary_added
        FROM lingua_music_sessions
        WHERE user_id = ? AND completed_at IS NOT NULL${dateFilter}
      `,
      args: [userId],
    });

    // Get song count
    const songCountResult = await db.execute({
      sql: `SELECT COUNT(DISTINCT song_id) as unique_songs
            FROM lingua_music_sessions
            WHERE user_id = ?${dateFilter}`,
      args: [userId],
    });

    // Get recent sessions
    const recentSessions = await db.execute({
      sql: `
        SELECT m.*, s.title, s.artist, s.cover_image_url
        FROM lingua_music_sessions m
        JOIN lingua_songs s ON m.song_id = s.id
        WHERE m.user_id = ? AND m.completed_at IS NOT NULL
        ORDER BY m.completed_at DESC
        LIMIT 10
      `,
      args: [userId],
    });

    const stats = statsResult.rows[0] || {};

    return NextResponse.json({
      period,
      stats: {
        totalSessions: Number(stats.total_sessions || 0),
        totalListeningMinutes: Math.round(Number(stats.total_listening_seconds || 0) / 60),
        totalLinesRevealed: Number(stats.total_lines_revealed || 0),
        totalWordsClicked: Number(stats.total_words_clicked || 0),
        totalVocabularyAdded: Number(stats.total_vocabulary_added || 0),
        uniqueSongsPlayed: Number(songCountResult.rows[0]?.unique_songs || 0),
      },
      recentSessions: recentSessions.rows,
    });
  } catch (error) {
    console.error('Stats error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
