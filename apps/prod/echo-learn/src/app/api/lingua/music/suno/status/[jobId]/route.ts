/**
 * Suno Generation Status API
 * GET /api/lingua/music/suno/status/[jobId] - Check generation status
 */

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getUniversalDb } from '@/lib/db/turso';
import { v4 as uuidv4 } from 'uuid';
import { getTimestampedLyrics } from '@/lib/music/suno';

const SUNO_API_KEY = process.env.SUNO_API_KEY;
const SUNO_API_ENDPOINT = process.env.SUNO_API_ENDPOINT || 'https://api.sunoapi.org/api/v1';

interface SunoStatusResponse {
  code: number;
  data: {
    status: 'PENDING' | 'SUCCESS' | 'FAILED';
    response?: string | SunoSongData[];
    errorMessage?: string;
  };
}

interface SunoSongData {
  audioUrl: string;
  sourceAudioUrl?: string;
  imageUrl?: string;
  sourceImageUrl?: string;
  duration: number;
  title: string;
  id: string;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
) {
  try {
    const { jobId } = await params;

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

    const db = getUniversalDb();

    // Get generation record - match by job ID, scoped to user or music-hall guest
    const result = await db.execute({
      sql: `SELECT * FROM lingua_suno_generations
            WHERE (suno_job_id = ? OR id = ?) AND user_id = ?`,
      args: [jobId, jobId, userId],
    });

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Generation not found' }, { status: 404 });
    }

    const generation = result.rows[0];

    // If already completed or failed, return cached status
    if (generation.status === 'completed' || generation.status === 'failed') {
      return NextResponse.json({
        status: generation.status,
        generation,
        song_id: generation.result_song_id,
        error: generation.error_message,
      });
    }

    // Check Suno API for status
    if (!SUNO_API_KEY) {
      return NextResponse.json({
        status: generation.status,
        message: 'Suno API not configured',
      });
    }

    try {
      const statusEndpoint = `${SUNO_API_ENDPOINT}/generate/record-info?taskId=${generation.suno_job_id}`;

      const response = await fetch(statusEndpoint, {
        headers: {
          Authorization: `Bearer ${SUNO_API_KEY}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        console.warn(`Suno status check failed: HTTP ${response.status}`);
        return NextResponse.json({
          status: 'processing',
          message: 'Checking generation status...',
        });
      }

      const statusData = (await response.json()) as SunoStatusResponse;
      const now = new Date().toISOString();

      console.log(`[Lingua Suno] Status for ${generation.suno_job_id}: ${statusData.data?.status || 'unknown'}`);

      if (statusData.code === 200 && statusData.data.status === 'SUCCESS') {
        // Parse response data - handle both nested {sunoData:[]} and flat array formats
        const rawResponse =
          typeof statusData.data.response === 'string'
            ? JSON.parse(statusData.data.response)
            : statusData.data.response;

        let songList: SunoSongData[];
        if (Array.isArray(rawResponse)) {
          songList = rawResponse;
        } else if (rawResponse?.sunoData && Array.isArray(rawResponse.sunoData)) {
          songList = rawResponse.sunoData;
        } else {
          throw new Error('Invalid response data structure from Suno');
        }

        if (songList.length === 0) {
          throw new Error('No songs in completed task');
        }

        const firstSong = songList[0];

        if (!firstSong?.audioUrl) {
          throw new Error('No audio URL in completed task');
        }

        // Create the song in our database
        const songId = uuidv4();
        const durationMs = (firstSong.duration || 60) * 1000;

        await db.execute({
          sql: `INSERT INTO lingua_songs (
            id, user_id, source, suno_generation_id, title, artist, album,
            duration_ms, full_audio_url, cover_image_url, language,
            difficulty_level, is_saved, times_played, created_at, updated_at
          ) VALUES (?, ?, 'suno', ?, ?, 'AI Generated', 'Learning Songs',
            ?, ?, ?, ?, 2, 1, 0, ?, ?)`,
          args: [
            songId,
            userId,
            generation.id,
            firstSong.title || `Learning Song - ${generation.style}`,
            durationMs,
            firstSong.audioUrl,
            firstSong.imageUrl || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300&h=300&fit=crop',
            generation.language,
            now,
            now,
          ],
        });

        // Try to get timestamped lyrics
        let lyricsData: { text: string; translation?: string; startMs?: number }[] = [];

        try {
          const alignedWords = await getTimestampedLyrics(
            String(generation.suno_job_id),
            firstSong.id
          );

          if (alignedWords && alignedWords.length > 0) {
            // Group words into lines
            let currentLine: string[] = [];
            let lineStartTime: number | null = null;

            for (let i = 0; i < alignedWords.length; i++) {
              const word = alignedWords[i];

              if (lineStartTime === null) {
                lineStartTime = word.startS * 1000;
              }

              currentLine.push(word.word.trim());

              // End line on punctuation, after 8 words, or large time gap
              const shouldEndLine =
                /[.,!?;:]$/.test(word.word) ||
                currentLine.length >= 8 ||
                (i < alignedWords.length - 1 && alignedWords[i + 1].startS - word.startS > 1.5) ||
                i === alignedWords.length - 1;

              if (shouldEndLine && currentLine.length > 0) {
                lyricsData.push({
                  text: currentLine.join(' '),
                  startMs: lineStartTime,
                });
                currentLine = [];
                lineStartTime = null;
              }
            }
          }
        } catch (lyricsError) {
          console.warn('Failed to get timestamped lyrics:', lyricsError);
        }

        // If no timestamped lyrics, use the prompt as lyrics
        if (lyricsData.length === 0) {
          const promptLines = String(generation.prompt).split('\n').filter(line => line.trim());
          lyricsData = promptLines.map(text => ({ text }));
        }

        // Store lyrics
        if (lyricsData.length > 0) {
          const lyricsId = uuidv4();
          const hasTimings = lyricsData.some(l => l.startMs !== undefined);

          await db.execute({
            sql: `INSERT INTO lingua_song_lyrics (
              id, song_id, lyrics_json, language, has_translations, has_timing, source, created_at, updated_at
            ) VALUES (?, ?, ?, ?, 0, ?, 'suno', ?, ?)`,
            args: [
              lyricsId,
              songId,
              JSON.stringify(lyricsData),
              generation.language,
              hasTimings ? 1 : 0,
              now,
              now
            ],
          });
        }

        // Update generation status
        await db.execute({
          sql: `UPDATE lingua_suno_generations
                SET status = 'completed', result_song_id = ?, updated_at = ?
                WHERE id = ?`,
          args: [songId, now, generation.id],
        });

        return NextResponse.json({
          status: 'completed',
          song_id: songId,
          audio_url: firstSong.audioUrl,
          message: 'Song generated successfully!',
        });

      } else if (statusData.data.status === 'FAILED') {
        const errorMsg = statusData.data.errorMessage || 'Generation failed';

        await db.execute({
          sql: `UPDATE lingua_suno_generations
                SET status = 'failed', error_message = ?, updated_at = ?
                WHERE id = ?`,
          args: [errorMsg, now, generation.id],
        });

        return NextResponse.json({
          status: 'failed',
          error: errorMsg,
        });
      }

      // Still processing
      return NextResponse.json({
        status: 'processing',
        progress: 50,
        message: 'Generating your song...',
      });

    } catch (apiError) {
      console.error('Suno status check error:', apiError);
      return NextResponse.json({
        status: generation.status,
        message: 'Unable to check generation status',
      });
    }
  } catch (error) {
    console.error('Status check error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
