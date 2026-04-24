import { NextRequest, NextResponse } from 'next/server';
import { withLinguaAuth } from '@/lib/lingua/middleware';
import { getDueWords } from '@/lib/lingua/db';
import { getDaysUntilReview, getIntervalDescription } from '@/lib/lingua/srs';

/**
 * GET /api/lingua/reviews/due
 * Get words that are due for review based on SRS schedule
 *
 * Query params:
 * - limit: number (default: 20, max: 100)
 */
export async function GET(request: NextRequest) {
  return withLinguaAuth(request, async (req, session) => {
    try {
      const { searchParams } = new URL(req.url);
      const limitParam = searchParams.get('limit');
      const limit = limitParam ? Math.min(parseInt(limitParam, 10), 100) : 20;

      if (isNaN(limit) || limit < 1) {
        return NextResponse.json(
          { error: 'Invalid limit parameter' },
          { status: 400 }
        );
      }

      // Get words due for review
      const dueWords = await getDueWords(session.userId, limit);

      // Enrich with review info
      const enrichedWords = dueWords.map((word) => {
        const daysUntil = getDaysUntilReview(word.next_review_date || null);
        const intervalDescription = getIntervalDescription(daysUntil);

        return {
          ...word,
          reviewInfo: {
            isDue: daysUntil <= 0,
            daysUntilReview: daysUntil,
            intervalDescription,
            reviewCount: word.review_count || 0,
            easeFactor: word.ease_factor || 2.5,
            intervalDays: word.interval_days || 0,
            lastReviewDate: word.last_review_date || null,
          },
        };
      });

      return NextResponse.json({
        success: true,
        dueWords: enrichedWords,
        count: enrichedWords.length,
        metadata: {
          requestedLimit: limit,
          userId: session.userId,
        },
      });
    } catch (error) {
      console.error('Error getting due words:', error);
      return NextResponse.json(
        { error: 'Failed to get due words' },
        { status: 500 }
      );
    }
  });
}
