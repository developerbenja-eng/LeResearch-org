import { NextRequest, NextResponse } from 'next/server';
import { withLinguaAuth } from '@/lib/lingua/middleware';
import { getRecentInsights, markInsightViewed, dismissInsight, rateInsight } from '@/lib/lingua/coach/insight-generator';

/**
 * GET /api/lingua/coach/insights
 * Get recent insights for authenticated user
 */
export async function GET(request: NextRequest) {
  return withLinguaAuth(request, async (req, session) => {
    try {
      const insights = await getRecentInsights(session.userId, 10);

      return NextResponse.json({
        success: true,
        insights,
      });
    } catch (error) {
      console.error('Error fetching insights:', error);
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to fetch insights',
        },
        { status: 500 }
      );
    }
  });
}

/**
 * POST /api/lingua/coach/insights
 * Mark insight as viewed, dismiss, or rate
 */
export async function POST(request: NextRequest) {
  return withLinguaAuth(request, async (req, session) => {
    try {
      const body = await req.json();
      const { action, insightId, rating } = body;

      if (!insightId) {
        return NextResponse.json(
          {
            success: false,
            error: 'Missing insightId',
          },
          { status: 400 }
        );
      }

      if (action === 'view') {
        await markInsightViewed(insightId);
      } else if (action === 'dismiss') {
        await dismissInsight(insightId);
      } else if (action === 'rate') {
        if (!rating || rating < 1 || rating > 5) {
          return NextResponse.json(
            {
              success: false,
              error: 'Invalid rating (must be 1-5)',
            },
            { status: 400 }
          );
        }
        await rateInsight(insightId, rating);
      } else {
        return NextResponse.json(
          {
            success: false,
            error: 'Invalid action',
          },
          { status: 400 }
        );
      }

      return NextResponse.json({
        success: true,
      });
    } catch (error) {
      console.error('Error updating insight:', error);
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to update insight',
        },
        { status: 500 }
      );
    }
  });
}
