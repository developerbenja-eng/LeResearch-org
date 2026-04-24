import { NextRequest, NextResponse } from 'next/server';
import { withLinguaAuth } from '@/lib/lingua/middleware';
import { calculateLearningAnalytics } from '@/lib/lingua/analytics';

/**
 * GET /api/lingua/analytics
 * Get comprehensive learning analytics for the user
 */
export async function GET(request: NextRequest) {
  return withLinguaAuth(request, async (req, session) => {
    try {
      const analytics = await calculateLearningAnalytics(session.userId);

      return NextResponse.json({
        success: true,
        analytics,
      });
    } catch (error) {
      console.error('Error calculating analytics:', error);
      return NextResponse.json(
        { error: 'Failed to calculate analytics' },
        { status: 500 }
      );
    }
  });
}
