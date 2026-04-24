/**
 * Loop Presets API
 *
 * Manages user's A-B loop markers and practice presets for songs
 */

import { NextRequest, NextResponse } from 'next/server';
import { getUniversalDb } from '@/lib/db/turso';
import { verifyToken } from '@/lib/auth/jwt';

export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const token = request.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const songId = searchParams.get('songId');

    let query;
    let params;

    if (songId) {
      // Get loops for specific song
      query = `
        SELECT * FROM lingua_song_loop_presets
        WHERE user_id = ? AND song_id = ?
        ORDER BY created_at DESC
      `;
      params = [payload.userId, songId];
    } else {
      // Get all user's loops
      query = `
        SELECT * FROM lingua_song_loop_presets
        WHERE user_id = ?
        ORDER BY created_at DESC
        LIMIT 100
      `;
      params = [payload.userId];
    }

    const result = await getUniversalDb().execute({
      sql: query,
      args: params,
    });

    return NextResponse.json({
      success: true,
      loops: result.rows,
    });
  } catch (error: any) {
    console.error('Failed to fetch loop presets:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch loops' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const token = request.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const body = await request.json();
    const { songId, loopName, startTime, endTime, playbackSpeed = 1.0, pitchShift = 0 } = body;

    // Validation
    if (!songId || startTime === undefined || endTime === undefined) {
      return NextResponse.json(
        { error: 'songId, startTime, and endTime are required' },
        { status: 400 }
      );
    }

    if (startTime >= endTime) {
      return NextResponse.json(
        { error: 'startTime must be less than endTime' },
        { status: 400 }
      );
    }

    if (playbackSpeed < 0.25 || playbackSpeed > 2.0) {
      return NextResponse.json(
        { error: 'playbackSpeed must be between 0.25 and 2.0' },
        { status: 400 }
      );
    }

    // Generate ID
    const loopId = `loop_${Date.now()}_${Math.random().toString(36).substring(7)}`;

    // Insert loop preset
    await getUniversalDb().execute({
      sql: `
        INSERT INTO lingua_song_loop_presets
        (id, user_id, song_id, loop_name, start_time, end_time, playback_speed, pitch_shift)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `,
      args: [loopId, payload.userId, songId, loopName || null, startTime, endTime, playbackSpeed, pitchShift],
    });

    return NextResponse.json({
      success: true,
      loopId,
      message: 'Loop preset saved successfully',
    });
  } catch (error: any) {
    console.error('Failed to save loop preset:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to save loop' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Verify authentication
    const token = request.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const loopId = searchParams.get('loopId');

    if (!loopId) {
      return NextResponse.json({ error: 'loopId parameter required' }, { status: 400 });
    }

    // Delete loop (only if owned by user)
    const result = await getUniversalDb().execute({
      sql: `
        DELETE FROM lingua_song_loop_presets
        WHERE id = ? AND user_id = ?
      `,
      args: [loopId, payload.userId],
    });

    if (result.rowsAffected === 0) {
      return NextResponse.json(
        { error: 'Loop not found or unauthorized' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Loop preset deleted successfully',
    });
  } catch (error: any) {
    console.error('Failed to delete loop preset:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete loop' },
      { status: 500 }
    );
  }
}
