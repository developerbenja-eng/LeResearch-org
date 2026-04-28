import { NextRequest, NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from '@/lib/auth/middleware';
import { getBooksDb, query, queryOne } from '@/lib/db/turso';
import { pollSunoTask, getTimestampedLyrics, convertToLRC } from '@/lib/music/suno';

export const dynamic = 'force-dynamic';
export const maxDuration = 300;

interface BookSongStatus {
  id: string;
  user_id: string;
  song_task_id: string | null;
  song_status: string | null;
  song_url: string | null;
  song_lyrics: string | null;
  song_style: string | null;
  song_character_id: string | null;
  song_is_character_theme: number | null;
}

// GET /api/music/generate/status?bookId=xxx - Check song generation status
export async function GET(request: NextRequest) {
  return withAuth(request, async (req: AuthenticatedRequest) => {
    try {
      const { searchParams } = new URL(request.url);
      const bookId = searchParams.get('bookId');

      if (!bookId) {
        return NextResponse.json({ error: 'bookId is required' }, { status: 400 });
      }

      const db = getBooksDb();

      const book = await queryOne<BookSongStatus>(
        db,
        `SELECT id, user_id, song_task_id, song_status, song_url, song_lyrics, song_style, song_character_id, song_is_character_theme
         FROM books WHERE id = ?`,
        [bookId]
      );

      if (!book) {
        return NextResponse.json({ error: 'Book not found' }, { status: 404 });
      }

      if (book.user_id !== req.user.userId) {
        return NextResponse.json({ error: 'Access denied' }, { status: 403 });
      }

      // If already completed, return the song info
      if (book.song_status === 'completed' && book.song_url) {
        return NextResponse.json({
          success: true,
          status: 'completed',
          songUrl: book.song_url,
          lyrics: book.song_lyrics,
          style: book.song_style,
        });
      }

      // If no task, nothing to check
      if (!book.song_task_id) {
        return NextResponse.json({
          success: true,
          status: 'no_task',
          message: 'No song generation in progress',
        });
      }

      // Check SUNO status
      if (book.song_status === 'generating') {
        try {
          // Poll SUNO for completion (single poll, not waiting)
          const result = await pollSingleCheck(book.song_task_id);

          if (result.status === 'completed') {
            // Download and store the song
            const songUrl = result.audioUrl;
            const duration = result.duration;

            // Try to get timestamped lyrics
            let lrcLyrics = book.song_lyrics;
            try {
              const timestamps = await getTimestampedLyrics(book.song_task_id, result.audioId || '');
              if (timestamps) {
                lrcLyrics = convertToLRC(timestamps);
              }
            } catch {
              // Use original lyrics if timestamp fetch fails
            }

            // Create song record in book_songs (with character info if applicable)
            const songId = `song_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
            const isCharacterTheme = book.song_is_character_theme === 1;
            const characterId = book.song_character_id;

            await query(
              db,
              `INSERT INTO book_songs (id, book_id, song_url, song_name, duration, style, lyrics, is_main, character_id, is_character_theme, created_at)
               VALUES (?, ?, ?, ?, ?, ?, ?, 1, ?, ?, CURRENT_TIMESTAMP)`,
              [
                songId,
                bookId,
                songUrl || '',
                book.song_style || 'Theme Song',
                duration || 0,
                book.song_style || 'children',
                lrcLyrics || null,
                characterId || null,
                isCharacterTheme ? 1 : 0,
              ]
            );

            // If this is a character theme song, update the character's music profile
            if (isCharacterTheme && characterId) {
              try {
                await query(
                  db,
                  `UPDATE character_music_profiles SET theme_song_id = ?, updated_at = CURRENT_TIMESTAMP WHERE character_id = ?`,
                  [songId, characterId]
                );
              } catch {
                // Music profile might not exist yet, that's okay
              }
            }

            // Update book status and clear temporary character fields
            await query(
              db,
              `UPDATE books
               SET song_status = 'completed',
                   song_url = ?,
                   song_generated_at = CURRENT_TIMESTAMP,
                   song_character_id = NULL,
                   song_is_character_theme = 0
               WHERE id = ?`,
              [songUrl || '', bookId]
            );

            return NextResponse.json({
              success: true,
              status: 'completed',
              songUrl,
              duration,
              lyrics: lrcLyrics,
              style: book.song_style,
              songId,
              isCharacterTheme,
              characterId: characterId || null,
            });
          }

          if (result.status === 'failed') {
            await query(
              db,
              `UPDATE books SET song_status = 'failed' WHERE id = ?`,
              [bookId]
            );

            return NextResponse.json({
              success: false,
              status: 'failed',
              error: result.error,
            });
          }

          // Still generating
          return NextResponse.json({
            success: true,
            status: 'generating',
            message: 'Song is still being generated',
            taskId: book.song_task_id,
          });
        } catch (error) {
          console.error('[Status Check] Error:', error);
          return NextResponse.json({
            success: true,
            status: 'generating',
            message: 'Unable to check status, please try again',
          });
        }
      }

      return NextResponse.json({
        success: true,
        status: book.song_status || 'unknown',
      });
    } catch (error) {
      console.error('[Status] Error:', error);
      return NextResponse.json(
        { error: 'Failed to check status', details: (error as Error).message },
        { status: 500 }
      );
    }
  });
}

// Single poll check (doesn't wait for completion)
async function pollSingleCheck(taskId: string): Promise<{
  status: 'pending' | 'completed' | 'failed';
  audioUrl?: string;
  duration?: number;
  audioId?: string;
  error?: string;
}> {
  const sunoApiKey = process.env.SUNO_API_KEY;
  const baseUrl = process.env.SUNO_API_ENDPOINT || 'https://api.sunoapi.org/api/v1';
  const statusEndpoint = `${baseUrl}/generate/record-info?taskId=${taskId}`;

  const response = await fetch(statusEndpoint, {
    headers: {
      Authorization: `Bearer ${sunoApiKey}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    return { status: 'pending' };
  }

  const data = await response.json();

  if (data.code === 200 && data.data?.status === 'SUCCESS') {
    const responseData =
      typeof data.data.response === 'string'
        ? JSON.parse(data.data.response)
        : data.data.response;

    if (responseData && Array.isArray(responseData) && responseData[0]?.audio_url) {
      return {
        status: 'completed',
        audioUrl: responseData[0].audio_url,
        duration: responseData[0].duration,
        audioId: responseData[0].id,
      };
    }
  }

  if (data.data?.status === 'FAILED') {
    return {
      status: 'failed',
      error: data.data.errorMessage || 'Generation failed',
    };
  }

  return { status: 'pending' };
}
