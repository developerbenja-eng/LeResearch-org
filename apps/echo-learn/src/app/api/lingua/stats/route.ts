import { NextRequest, NextResponse } from 'next/server';
import { withLinguaAuth } from '@/lib/lingua/middleware';
import { getVocabStats, getLinguaUser } from '@/lib/lingua/db';

/**
 * GET /api/lingua/stats
 * Get user's learning statistics
 */
export async function GET(request: NextRequest) {
  return withLinguaAuth(request, async (req, session) => {
    try {
      const stats = await getVocabStats(session.userId);
      const user = await getLinguaUser(session.userId);

      return NextResponse.json({
        success: true,
        stats: {
          ...stats,
          userName: user?.name || session.name,
          nativeLanguage: user?.native_language || session.nativeLang,
          targetLanguage: user?.target_language || session.targetLang,
          lastActivityDate: user?.last_activity_date,
        },
      });
    } catch (error) {
      console.error('Error getting stats:', error);
      return NextResponse.json(
        { error: 'Failed to get statistics' },
        { status: 500 }
      );
    }
  });
}
