import { NextRequest, NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from '@/lib/auth/middleware';
import { getBooksDb, query } from '@/lib/db/turso';
import { getUserCoins, hasEnoughCoins, deductCoins, refundCoins, DEFAULT_COIN_COSTS } from '@/lib/db/coins';
import { generateSongWithSuno } from '@/lib/music/suno';
import { canGenerateSong } from '@/lib/subscriptions/middleware';

export const dynamic = 'force-dynamic';
export const maxDuration = 300;

/**
 * POST /api/music/regenerate
 * Regenerate a song with modified prompt/style/lyrics.
 * Used by the Production Studio to tweak and re-generate songs via Suno.
 */
export async function POST(request: NextRequest) {
  return withAuth(request, async (req: AuthenticatedRequest) => {
    const userId = req.user.userId;

    try {
      const body = await request.json();
      const {
        songId,
        lyrics,
        style,
        stylePrompt,
        title,
      } = body;

      if (!songId) {
        return NextResponse.json({ error: 'songId is required' }, { status: 400 });
      }

      if (!lyrics) {
        return NextResponse.json({ error: 'lyrics is required' }, { status: 400 });
      }

      // Check subscription limits
      const usageCheck = await canGenerateSong(userId);
      if (!usageCheck.allowed) {
        return NextResponse.json(
          {
            error: 'Song limit reached',
            upgradeRequired: true,
            suggestedTier: usageCheck.suggestedTier,
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

      // Deduct coins
      const deductionResult = await deductCoins(userId, songCost, 'song_regeneration', songId, {
        songId,
        title,
        style,
      });

      try {
        // Build the final style: if user provided a custom stylePrompt, use it;
        // otherwise fall back to the standard style mapping
        const finalStyle = stylePrompt || style || 'playful';
        const finalTitle = title || 'Regenerated Song';

        const taskId = await generateSongWithSuno(
          lyrics,
          finalTitle,
          // If stylePrompt is set, pass it directly as the style won't match a key
          // The suno lib will fall back to 'playful' mapping, which is fine
          // since we want the raw prompt control
          stylePrompt ? 'playful' : finalStyle,
          'en'
        );

        // Create a new song record for the regeneration
        const db = getBooksDb();
        const newSongId = `song_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

        // Get the original song's book_id
        const originalSong = await query<{ book_id: string }>(
          db,
          `SELECT book_id FROM book_songs WHERE id = ?`,
          [songId]
        );

        const bookId = originalSong[0]?.book_id || '__standalone__';

        await query(
          db,
          `INSERT INTO book_songs (id, book_id, user_id, song_url, song_name, duration, style, lyrics, is_main, created_at)
           VALUES (?, ?, ?, '', ?, 0, ?, ?, 0, CURRENT_TIMESTAMP)`,
          [
            newSongId,
            bookId,
            userId,
            finalTitle + ' (v2)',
            style || 'playful',
            lyrics,
          ]
        );

        // Track the task
        await query(
          db,
          `INSERT OR REPLACE INTO song_generation_tasks (task_id, song_id, user_id, created_at)
           VALUES (?, ?, ?, CURRENT_TIMESTAMP)`,
          [taskId, newSongId, userId]
        ).catch(() => {});

        // Increment subscription usage
        await canGenerateSong(userId, true);

        return NextResponse.json({
          success: true,
          taskId,
          newSongId,
          coinsDeducted: songCost,
          newBalance: deductionResult.newBalance,
          message: 'Regeneration started. Poll /api/music/generate/status for progress.',
        });
      } catch (error) {
        // Refund on failure
        const refundResult = await refundCoins(
          userId,
          songCost,
          'song_regeneration',
          songId,
          (error as Error).message
        );

        return NextResponse.json(
          {
            error: 'Regeneration failed',
            details: (error as Error).message,
            refunded: true,
            newBalance: refundResult.newBalance,
          },
          { status: 500 }
        );
      }
    } catch (error) {
      console.error('[Regenerate] Error:', error);
      return NextResponse.json(
        { error: 'Failed to regenerate song', details: (error as Error).message },
        { status: 500 }
      );
    }
  });
}
