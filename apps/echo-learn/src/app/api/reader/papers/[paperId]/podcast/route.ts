/**
 * Echo Reader - Podcast Generation API
 *
 * POST /api/reader/papers/[paperId]/podcast - Generate a new podcast
 * GET /api/reader/papers/[paperId]/podcast - Get podcast status/info
 *
 * NOTE: This uses node-lame for MP3 encoding which requires native binaries.
 * On Vercel serverless, you may need to use:
 * - Vercel Pro/Enterprise with increased function timeout
 * - A background job queue (Inngest, QStash, etc.)
 * - External audio encoding service
 */

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getResearchDb } from '@/lib/db/turso';
import { generatePodcast, PodcastConfig, VOICES, PODCAST_STYLES, DURATION_CONFIGS } from '@/lib/reader/podcast-generator';
import { uploadPodcastAudio, uploadPodcastTranscript } from '@/lib/reader/storage';
import { verifyToken } from '@/lib/auth/jwt';
import { v4 as uuidv4 } from 'uuid';

const COOKIE_NAME = 'ledesign_sso';

// Increase max duration for podcast generation (requires Vercel Pro)
export const maxDuration = 300; // 5 minutes

/**
 * Get user ID from auth token (cookie or header)
 */
async function getUserIdFromRequest(request: NextRequest): Promise<string> {
  try {
    // Try cookie first
    const cookieStore = await cookies();
    let token = cookieStore.get(COOKIE_NAME)?.value;

    // Fall back to Authorization header
    if (!token) {
      const authHeader = request.headers.get('Authorization');
      if (authHeader?.startsWith('Bearer ')) {
        token = authHeader.slice(7);
      }
    }

    if (token) {
      const payload = verifyToken(token);
      if (payload?.userId) {
        return payload.userId;
      }
    }
  } catch (error) {
    console.warn('[Podcast API] Auth check failed:', error);
  }

  return 'anonymous';
}

// ============================================================================
// GET - Get podcast status/info
// ============================================================================

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ paperId: string }> }
) {
  try {
    const { paperId } = await params;
    const userId = await getUserIdFromRequest(request);
    const db = getResearchDb();

    // Get podcasts for this paper (optionally filter by user)
    // For now, show all podcasts for the paper
    const result = await db.execute({
      sql: `SELECT * FROM reader_podcasts WHERE paper_id = ? ORDER BY created_at DESC`,
      args: [paperId],
    });

    const podcasts = result.rows.map(row => ({
      podcastId: row.podcast_id,
      paperId: row.paper_id,
      userId: row.user_id,
      speakers: row.speakers,
      style: row.style,
      duration: row.duration,
      host1Name: row.host1_name,
      host2Name: row.host2_name,
      host1Voice: row.host1_voice,
      host2Voice: row.host2_voice,
      status: row.status,
      progress: row.progress,
      progressMessage: row.progress_message,
      errorMessage: row.error_message,
      audioUrl: row.audio_url,
      audioDuration: row.audio_duration,
      transcript: row.transcript,
      createdAt: row.created_at,
      startedAt: row.started_at,
      completedAt: row.completed_at,
    }));

    return NextResponse.json({
      podcasts,
      currentUserId: userId,
      availableVoices: Object.keys(VOICES),
      availableStyles: Object.keys(PODCAST_STYLES),
      availableDurations: Object.keys(DURATION_CONFIGS),
    });
  } catch (error) {
    console.error('[Podcast API] Error getting podcasts:', error);
    return NextResponse.json(
      { error: 'Failed to get podcasts' },
      { status: 500 }
    );
  }
}

// ============================================================================
// POST - Generate a new podcast
// ============================================================================

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ paperId: string }> }
) {
  try {
    const { paperId } = await params;
    const body = await request.json();

    // Get user ID from auth (not from body - security!)
    const userId = await getUserIdFromRequest(request);

    const {
      speakers = 2,
      style = 'educational',
      duration = 'medium',
      host1Name = 'Alex',
      host2Name = 'Jordan',
      host1Voice = 'Aoede',
      host2Voice = 'Charon',
      bitrate = 192,
      normalize = true,
      crossfadeMs = 100,
    } = body;

    // Validate inputs
    if (!['casual', 'educational', 'debate', 'interview', 'narrative'].includes(style)) {
      return NextResponse.json({ error: 'Invalid style' }, { status: 400 });
    }
    if (!['short', 'medium', 'long'].includes(duration)) {
      return NextResponse.json({ error: 'Invalid duration' }, { status: 400 });
    }
    if (![1, 2].includes(speakers)) {
      return NextResponse.json({ error: 'Invalid speakers count' }, { status: 400 });
    }
    if (![128, 192, 256, 320].includes(bitrate)) {
      return NextResponse.json({ error: 'Invalid bitrate' }, { status: 400 });
    }

    const db = getResearchDb();

    // Get paper content
    const paperResult = await db.execute({
      sql: `SELECT title, abstract FROM reader_papers WHERE paper_id = ?`,
      args: [paperId],
    });

    if (paperResult.rows.length === 0) {
      return NextResponse.json({ error: 'Paper not found' }, { status: 404 });
    }

    const paper = paperResult.rows[0];

    // Get all sections
    const sectionsResult = await db.execute({
      sql: `SELECT section_name, content FROM reader_sections WHERE paper_id = ? ORDER BY section_order`,
      args: [paperId],
    });

    // Build paper content for podcast
    const paperContent = [
      `Title: ${paper.title}`,
      `\nAbstract:\n${paper.abstract || 'No abstract available'}`,
      '\n---\n',
      ...sectionsResult.rows.map(row => `## ${row.section_name}\n\n${row.content || ''}`),
    ].join('\n');

    // Create podcast record
    const podcastId = uuidv4();

    await db.execute({
      sql: `INSERT INTO reader_podcasts (
        podcast_id, paper_id, user_id, speakers, style, duration,
        host1_name, host2_name, host1_voice, host2_voice,
        status, progress, progress_message
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'generating', 0, 'Starting podcast generation...')`,
      args: [
        podcastId, paperId, userId, speakers, style, duration,
        host1Name, host2Name, host1Voice, host2Voice,
      ],
    });

    // Build config
    const config: PodcastConfig = {
      speakers: speakers as 1 | 2,
      style: style as PodcastConfig['style'],
      duration: duration as PodcastConfig['duration'],
      host1Name,
      host2Name,
      host1Voice,
      host2Voice,
      bitrate,
      normalize,
      crossfadeMs,
    };

    // Update progress in database
    const updateProgress = async (progress: { stage: string; progress: number; message: string }) => {
      try {
        await db.execute({
          sql: `UPDATE reader_podcasts SET progress = ?, progress_message = ? WHERE podcast_id = ?`,
          args: [progress.progress, progress.message, podcastId],
        });
      } catch (err) {
        console.warn('[Podcast API] Progress update failed:', err);
      }
    };

    try {
      await db.execute({
        sql: `UPDATE reader_podcasts SET status = 'generating', started_at = CURRENT_TIMESTAMP WHERE podcast_id = ?`,
        args: [podcastId],
      });

      console.log(`[Podcast API] Starting generation for paper ${paperId}, podcast ${podcastId}`);
      const result = await generatePodcast(paperContent, config, updateProgress);
      console.log(`[Podcast API] Generation complete, uploading to GCS...`);

      // Upload audio to GCS
      const audioUpload = await uploadPodcastAudio(userId, paperId, podcastId, result.audioBuffer);

      // Upload transcript to GCS
      await uploadPodcastTranscript(userId, paperId, podcastId, result.transcript);

      // Update database with results
      await db.execute({
        sql: `UPDATE reader_podcasts SET
          status = 'completed',
          progress = 100,
          progress_message = 'Podcast complete!',
          audio_url = ?,
          audio_duration = ?,
          transcript = ?,
          completed_at = CURRENT_TIMESTAMP
        WHERE podcast_id = ?`,
        args: [audioUpload.publicUrl, result.durationSeconds, result.transcript, podcastId],
      });

      console.log(`[Podcast API] Podcast ${podcastId} completed successfully`);

      return NextResponse.json({
        success: true,
        podcastId,
        audioUrl: audioUpload.publicUrl,
        audioDuration: result.durationSeconds,
        title: result.title,
      });
    } catch (genError) {
      console.error('[Podcast API] Generation error:', genError);

      await db.execute({
        sql: `UPDATE reader_podcasts SET
          status = 'failed',
          error_message = ?,
          completed_at = CURRENT_TIMESTAMP
        WHERE podcast_id = ?`,
        args: [genError instanceof Error ? genError.message : 'Generation failed', podcastId],
      });

      return NextResponse.json(
        { error: 'Podcast generation failed', details: genError instanceof Error ? genError.message : 'Unknown error' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('[Podcast API] Error:', error);
    return NextResponse.json(
      { error: 'Failed to generate podcast' },
      { status: 500 }
    );
  }
}
