/**
 * Individual Song API
 * GET /api/lingua/music/songs/[id] - Get song details
 * DELETE /api/lingua/music/songs/[id] - Remove from library
 * PATCH /api/lingua/music/songs/[id] - Update song (play count, etc.)
 */

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getUniversalDb } from '@/lib/db/turso';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

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

    const db = getUniversalDb();

    const result = await db.execute({
      sql: `
        SELECT s.*, l.lyrics_json, l.has_translations, l.has_timing
        FROM lingua_songs s
        LEFT JOIN lingua_song_lyrics l ON s.id = l.song_id
        WHERE s.id = ? AND s.user_id = ?
      `,
      args: [id, userId],
    });

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Song not found' }, { status: 404 });
    }

    const song = result.rows[0];

    // Get linked vocabulary
    const vocabResult = await db.execute({
      sql: `
        SELECT sv.*, v.word, v.translation, v.example_sentence
        FROM lingua_song_vocabulary sv
        JOIN lingua_vocabulary v ON sv.vocabulary_id = v.id
        WHERE sv.song_id = ?
      `,
      args: [id],
    });

    return NextResponse.json({
      song,
      vocabulary: vocabResult.rows,
    });
  } catch (error) {
    console.error('Error fetching song:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

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

    const db = getUniversalDb();

    // Verify ownership
    const check = await db.execute({
      sql: 'SELECT id FROM lingua_songs WHERE id = ? AND user_id = ?',
      args: [id, userId],
    });

    if (check.rows.length === 0) {
      return NextResponse.json({ error: 'Song not found' }, { status: 404 });
    }

    // Soft delete - just mark as not saved
    await db.execute({
      sql: 'UPDATE lingua_songs SET is_saved = 0, updated_at = ? WHERE id = ?',
      args: [new Date().toISOString(), id],
    });

    return NextResponse.json({ success: true, message: 'Song removed from library' });
  } catch (error) {
    console.error('Error deleting song:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

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
    const { increment_play_count, difficulty_level } = body;

    const db = getUniversalDb();

    // Verify ownership
    const check = await db.execute({
      sql: 'SELECT id, times_played FROM lingua_songs WHERE id = ? AND user_id = ?',
      args: [id, userId],
    });

    if (check.rows.length === 0) {
      return NextResponse.json({ error: 'Song not found' }, { status: 404 });
    }

    const updates: string[] = [];
    const args: (string | number)[] = [];

    if (increment_play_count) {
      const currentCount = Number(check.rows[0].times_played || 0);
      updates.push('times_played = ?');
      args.push(currentCount + 1);
      updates.push('last_played_at = ?');
      args.push(new Date().toISOString());
    }

    if (difficulty_level !== undefined) {
      updates.push('difficulty_level = ?');
      args.push(difficulty_level);
    }

    if (updates.length === 0) {
      return NextResponse.json({ error: 'No updates provided' }, { status: 400 });
    }

    updates.push('updated_at = ?');
    args.push(new Date().toISOString());
    args.push(id);

    await db.execute({
      sql: `UPDATE lingua_songs SET ${updates.join(', ')} WHERE id = ?`,
      args,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating song:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
