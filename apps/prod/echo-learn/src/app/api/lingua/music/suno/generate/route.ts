/**
 * Suno AI Song Generation API
 * POST /api/lingua/music/suno/generate - Start song generation
 */

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getUniversalDb } from '@/lib/db/turso';
import { v4 as uuidv4 } from 'uuid';
import { generateSongWithSuno, STYLE_MAPPINGS } from '@/lib/music/suno';

interface SunoGenerationRequest {
  prompt: string;
  style: string;
  language: string;
  title?: string;
  vocabulary_words?: string[];
  duration_seconds?: number;
}

// Map component styles to Suno styles
const LINGUA_STYLE_MAP: Record<string, string> = {
  'pop': 'pop',
  'latin': 'tropical', // Closest match for Latin music
  'folk': 'acoustic',
  'electronic': 'electronic',
  'jazz': 'jazz',
  'rock': 'rock',
  'r&b': 'hip-hop', // Closest match
  'acoustic': 'acoustic',
  // Additional mappings
  'playful': 'playful',
  'lullaby': 'lullaby',
  'adventure': 'adventure',
  'educational': 'educational',
};

export async function POST(request: NextRequest) {
  try {
    // Try lingua session, fall back to "music-hall" guest user
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('lingua_session');
    let userId = 'music-hall';

    if (sessionCookie?.value) {
      try {
        const session = JSON.parse(sessionCookie.value);
        if (session.userId) userId = session.userId;
      } catch { /* use default */ }
    }

    // Check SUNO_API_KEY
    if (!process.env.SUNO_API_KEY) {
      return NextResponse.json(
        { error: 'Suno API not configured' },
        { status: 503 }
      );
    }

    const body: SunoGenerationRequest = await request.json();
    const { prompt, style, language, title: requestTitle, vocabulary_words = [] } = body;

    if (!prompt || !style || !language) {
      return NextResponse.json(
        { error: 'Missing required fields: prompt, style, language' },
        { status: 400 }
      );
    }

    const db = getUniversalDb();

    // Check user's daily generation limit (e.g., 5 per day)
    const today = new Date().toISOString().split('T')[0];
    const limitCheck = await db.execute({
      sql: `SELECT COUNT(*) as count FROM lingua_suno_generations
            WHERE user_id = ? AND created_at >= ?`,
      args: [userId, today],
    });

    const dailyCount = Number(limitCheck.rows[0]?.count || 0);
    const DAILY_LIMIT = 5;

    if (dailyCount >= DAILY_LIMIT) {
      return NextResponse.json(
        { error: `Daily limit of ${DAILY_LIMIT} AI songs reached. Try again tomorrow!` },
        { status: 429 }
      );
    }

    // Build the enhanced prompt/lyrics
    let enhancedPrompt = prompt;

    if (vocabulary_words.length > 0) {
      enhancedPrompt += `\n\nIMPORTANT: Include these vocabulary words naturally in the lyrics: ${vocabulary_words.join(', ')}`;
    }

    // Map the style to Suno's expected format
    const sunoStyle = LINGUA_STYLE_MAP[style] || style;

    // Create generation record
    const generationId = uuidv4();
    const now = new Date().toISOString();

    await db.execute({
      sql: `INSERT INTO lingua_suno_generations (
        id, user_id, prompt, style, language, target_vocabulary,
        status, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, 'pending', ?, ?)`,
      args: [
        generationId,
        userId,
        enhancedPrompt,
        style,
        language,
        vocabulary_words.length > 0 ? JSON.stringify(vocabulary_words) : null,
        now,
        now,
      ],
    });

    // Call Suno API using existing service
    try {
      const songTitle = requestTitle || `Learning Song - ${style}`;
      const taskId = await generateSongWithSuno(
        enhancedPrompt,
        songTitle,
        sunoStyle,
        language
      );

      // Update with Suno task ID
      await db.execute({
        sql: `UPDATE lingua_suno_generations
              SET suno_job_id = ?, status = 'processing', updated_at = ?
              WHERE id = ?`,
        args: [taskId, new Date().toISOString(), generationId],
      });

      return NextResponse.json({
        success: true,
        generation_id: generationId,
        suno_job_id: taskId,
        status: 'processing',
        message: 'Song generation started! Check status in a few minutes.',
      });
    } catch (apiError) {
      console.error('Suno API call failed:', apiError);

      // Update status to failed
      const errorMessage = apiError instanceof Error ? apiError.message : 'Unknown error';
      await db.execute({
        sql: `UPDATE lingua_suno_generations
              SET status = 'failed', error_message = ?, updated_at = ?
              WHERE id = ?`,
        args: [errorMessage.substring(0, 200), new Date().toISOString(), generationId],
      });

      return NextResponse.json(
        { error: 'Failed to start song generation: ' + errorMessage },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Generation error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// GET - List user's generations
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
    const status = searchParams.get('status');
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 50);

    const db = getUniversalDb();

    let sql = `
      SELECT g.*, s.title as song_title, s.preview_url, s.full_audio_url
      FROM lingua_suno_generations g
      LEFT JOIN lingua_songs s ON g.result_song_id = s.id
      WHERE g.user_id = ?
    `;
    const args: (string | number)[] = [userId];

    if (status) {
      sql += ' AND g.status = ?';
      args.push(status);
    }

    sql += ' ORDER BY g.created_at DESC LIMIT ?';
    args.push(limit);

    const result = await db.execute({ sql, args });

    // Check daily limit
    const today = new Date().toISOString().split('T')[0];
    const limitCheck = await db.execute({
      sql: `SELECT COUNT(*) as count FROM lingua_suno_generations
            WHERE user_id = ? AND created_at >= ?`,
      args: [userId, today],
    });

    const dailyCount = Number(limitCheck.rows[0]?.count || 0);

    return NextResponse.json({
      generations: result.rows,
      dailyCount,
      dailyLimit: 5,
      remainingToday: Math.max(0, 5 - dailyCount),
    });
  } catch (error) {
    console.error('Error fetching generations:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
