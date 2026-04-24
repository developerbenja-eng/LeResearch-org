import { NextRequest, NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from '@/lib/auth/middleware';
import { getBooksDb, query, queryOne } from '@/lib/db/turso';
import { getUserCoins, hasEnoughCoins, deductCoins, refundCoins, DEFAULT_COIN_COSTS } from '@/lib/db/coins';
import { generateSongWithSuno } from '@/lib/music/suno';
import { canGenerateSong } from '@/lib/subscriptions/middleware';

export const dynamic = 'force-dynamic';
export const maxDuration = 300; // 5 minutes max for song generation

interface BookData {
  id: string;
  title: string;
  user_id: string;
  primary_language: string | null;
}

// POST /api/music/generate - Generate a song (with coin deduction)
// Supports both book songs and character theme songs
export async function POST(request: NextRequest) {
  return withAuth(request, async (req: AuthenticatedRequest) => {
    const userId = req.user.userId;

    try {
      const body = await request.json();
      const {
        bookId,
        lyrics,
        musicStyle = 'playful',
        targetDuration = 60,
        generateLyrics = false,
        characterId,
        isCharacterTheme = false,
        songTitle,
        sourceTopicId,
        sourceTopicTitle,
      } = body;

      // Support standalone songs (no book required)
      const isStandalone = !bookId || bookId === '__standalone__';

      if (!isStandalone && !bookId) {
        return NextResponse.json({ error: 'bookId is required (or omit for standalone)' }, { status: 400 });
      }

      if (!generateLyrics && !lyrics) {
        return NextResponse.json(
          { error: 'lyrics is required (or set generateLyrics=true)' },
          { status: 400 }
        );
      }

      const isThemeSong = isCharacterTheme && characterId;
      console.log(`[Song Generation] Starting ${isStandalone ? 'standalone' : isThemeSong ? 'character theme' : 'book'} song`);
      console.log(`  User: ${userId}`);
      console.log(`  Style: ${musicStyle}`);
      console.log(`  Duration: ${targetDuration}s`);
      if (isThemeSong) {
        console.log(`  Character: ${characterId}`);
      }

      // Check subscription limits first
      const usageCheck = await canGenerateSong(userId);
      if (!usageCheck.allowed) {
        return NextResponse.json(
          {
            error: 'Song limit reached',
            upgradeRequired: true,
            suggestedTier: usageCheck.suggestedTier,
            limit: usageCheck.limit,
            remaining: usageCheck.remaining,
          },
          { status: 402 }
        );
      }

      const songCost = DEFAULT_COIN_COSTS.SONG_GENERATION;

      // Check coin balance
      const hasCoins = await hasEnoughCoins(userId, songCost);
      if (!hasCoins) {
        const currentBalance = await getUserCoins(userId);
        return NextResponse.json(
          {
            error: 'Insufficient coins',
            required: songCost,
            balance: currentBalance.balance,
            needed: songCost - currentBalance.balance,
          },
          { status: 402 }
        );
      }

      const db = getBooksDb();

      let book: BookData | null = null;

      if (isStandalone) {
        // For standalone songs, use a virtual book record
        book = {
          id: '__standalone__',
          title: songTitle || 'Standalone Song',
          user_id: userId,
          primary_language: null,
        };
      } else {
        // Verify book ownership
        book = await queryOne<BookData>(
          db,
          `SELECT id, title, user_id, primary_language FROM books WHERE id = ?`,
          [bookId]
        );

        if (!book) {
          return NextResponse.json({ error: 'Book not found' }, { status: 404 });
        }

        if (book.user_id !== userId) {
          return NextResponse.json(
            { error: 'You do not have permission to modify this book' },
            { status: 403 }
          );
        }
      }

      // Deduct coins BEFORE generation
      const deductionResult = await deductCoins(userId, songCost, 'song_generation', bookId, {
        bookId,
        bookTitle: book.title,
        musicStyle,
        targetDuration,
      });

      console.log(`  Coins deducted: ${songCost}`);
      console.log(`  New balance: ${deductionResult.newBalance}`);

      // Get lyrics (either provided or generate)
      let finalLyrics = lyrics;

      if (!finalLyrics || generateLyrics) {
        console.log(`[Song Generation] Generating lyrics...`);

        // Call internal lyrics endpoint
        const origin = request.headers.get('origin') || process.env.NEXT_PUBLIC_APP_URL || '';
        const lyricsResponse = await fetch(`${origin}/api/music/generate/lyrics`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: request.headers.get('Authorization') || '',
          },
          body: JSON.stringify({
            bookId,
            musicStyle,
            targetDuration,
            characterId: isThemeSong ? characterId : undefined,
            isCharacterTheme: isThemeSong,
          }),
        });

        if (!lyricsResponse.ok) {
          // Refund coins if lyrics generation fails
          await refundCoins(userId, songCost, 'song_generation', bookId, 'Lyrics generation failed');
          const errorData = await lyricsResponse.json();
          return NextResponse.json(
            { error: 'Failed to generate lyrics', details: errorData.error },
            { status: 500 }
          );
        }

        const lyricsData = await lyricsResponse.json();
        finalLyrics = lyricsData.lyrics;
        console.log(`[Song Generation] Lyrics generated (${finalLyrics.length} chars)`);
      }

      try {
        // Submit to SUNO API
        const taskId = await generateSongWithSuno(
          finalLyrics,
          book.title,
          musicStyle,
          book.primary_language || 'en'
        );

        if (isStandalone) {
          // For standalone songs, create a pending song record directly
          const songId = `song_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
          await query(
            db,
            `INSERT INTO book_songs (id, book_id, user_id, song_url, song_name, duration, style, lyrics, is_main, character_id, is_character_theme, source_topic_id, source_topic_title, created_at)
             VALUES (?, '__standalone__', ?, '', ?, 0, ?, ?, 0, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
            [
              songId,
              userId,
              songTitle || musicStyle + ' Song',
              musicStyle,
              finalLyrics || null,
              isThemeSong ? characterId : null,
              isThemeSong ? 1 : 0,
              sourceTopicId || null,
              sourceTopicTitle || null,
            ]
          );

          // Store the taskId in the song name temporarily (will be updated on completion)
          // We track the task via a simple mapping approach
          await query(
            db,
            `INSERT OR REPLACE INTO song_generation_tasks (task_id, song_id, user_id, created_at)
             VALUES (?, ?, ?, CURRENT_TIMESTAMP)`,
            [taskId, songId, userId]
          ).catch(() => {
            // Table might not exist yet, that's ok - the status check can fall back
          });

          // Link to creative project if from research
          if (sourceTopicId) {
            await query(
              db,
              `INSERT INTO creative_projects (id, user_id, source_topic_id, source_topic_title, content_type, content_id, content_title)
               VALUES (?, ?, ?, ?, 'song', ?, ?)
               ON CONFLICT(source_topic_id, content_type, content_id) DO NOTHING`,
              [
                `cp_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
                userId,
                sourceTopicId,
                sourceTopicTitle || 'Untitled Topic',
                songId,
                songTitle || musicStyle + ' Song',
              ]
            ).catch(() => {});
          }

          console.log(`[Song Generation] Standalone task submitted: ${taskId}, songId: ${songId}`);

          // Increment subscription usage
          await canGenerateSong(userId, true);

          return NextResponse.json({
            success: true,
            status: 'generating',
            taskId,
            songId,
            coinsDeducted: songCost,
            newBalance: deductionResult.newBalance,
            message: 'Song generation started. Poll /api/music/generate/status to check progress.',
            metadata: {
              bookId: '__standalone__',
              songTitle: songTitle || musicStyle + ' Song',
              musicStyle,
              estimatedTime: '2-3 minutes',
              isStandalone: true,
            },
          });
        }

        // Store taskId, lyrics, and character info in database (book songs)
        await query(
          db,
          `UPDATE books
           SET song_task_id = ?,
               song_lyrics = ?,
               song_style = ?,
               song_status = 'generating',
               song_character_id = ?,
               song_is_character_theme = ?
           WHERE id = ?`,
          [taskId, finalLyrics, musicStyle, isThemeSong ? characterId : null, isThemeSong ? 1 : 0, bookId]
        );

        console.log(`[Song Generation] Task submitted: ${taskId}`);

        // Increment subscription usage
        await canGenerateSong(userId, true);

        return NextResponse.json({
          success: true,
          status: 'generating',
          taskId,
          coinsDeducted: songCost,
          newBalance: deductionResult.newBalance,
          message: 'Song generation started. Poll /api/music/generate/status to check progress.',
          metadata: {
            bookId: book.id,
            bookTitle: book.title,
            musicStyle,
            estimatedTime: '2-3 minutes',
            isCharacterTheme: isThemeSong,
            characterId: isThemeSong ? characterId : null,
          },
        });
      } catch (error) {
        // Refund coins if SUNO submission fails
        console.error('[Song Generation] SUNO submission failed:', error);
        const refundResult = await refundCoins(
          userId,
          songCost,
          'song_generation',
          bookId,
          (error as Error).message
        );

        return NextResponse.json(
          {
            error: 'Song generation failed',
            details: (error as Error).message,
            refunded: true,
            refundAmount: songCost,
            newBalance: refundResult.newBalance,
          },
          { status: 500 }
        );
      }
    } catch (error) {
      console.error('[Song Generation] Error:', error);
      return NextResponse.json(
        { error: 'Failed to generate song', details: (error as Error).message },
        { status: 500 }
      );
    }
  });
}
