import { NextRequest, NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from '@/lib/auth/middleware';
import {
  getFamilyConnectionById,
  getLinguaProfileByMainUserId,
  getVocabStats,
  getVocabulary,
} from '@/lib/lingua/db';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/lingua/family/[id]/progress
 * View a connected family member's learning progress
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  return withAuth(request, async (req: AuthenticatedRequest) => {
    try {
      const { id } = await params;
      const userId = req.user.userId;

      // Get the connection
      const connection = await getFamilyConnectionById(id);
      if (!connection) {
        return NextResponse.json(
          { error: 'Connection not found' },
          { status: 404 }
        );
      }

      // Verify the user is part of this connection
      if (connection.owner_user_id !== userId && connection.connected_user_id !== userId) {
        return NextResponse.json(
          { error: 'You do not have access to this connection' },
          { status: 403 }
        );
      }

      // Connection must be accepted
      if (connection.status !== 'accepted') {
        return NextResponse.json(
          { error: 'This connection is not active' },
          { status: 400 }
        );
      }

      // Determine whose progress to view (the other person)
      const targetUserId = connection.owner_user_id === userId
        ? connection.connected_user_id
        : connection.owner_user_id;

      // Check permissions
      if (connection.can_view_progress !== 1) {
        return NextResponse.json(
          { error: 'You do not have permission to view this user\'s progress' },
          { status: 403 }
        );
      }

      // Get the target user's Lingua profile
      const profile = await getLinguaProfileByMainUserId(targetUserId);
      if (!profile) {
        return NextResponse.json(
          {
            error: 'Profile not found',
            message: 'This user has not set up their Lingua profile yet',
          },
          { status: 404 }
        );
      }

      // Get their stats
      const stats = await getVocabStats(profile.id);

      // Get their vocabulary if permitted
      let vocabulary = null;
      if (connection.can_view_vocabulary === 1) {
        const vocab = await getVocabulary(profile.id, { limit: 50 });
        vocabulary = vocab.map((v) => ({
          word: v.word,
          translation: v.native_translation,
          status: v.status,
          timesSeen: v.times_seen,
          masteredAt: v.mastered_at,
        }));
      }

      return NextResponse.json({
        user: {
          name: profile.name,
          nativeLanguage: profile.native_language,
          targetLanguage: profile.target_language,
          avatarUrl: profile.avatar_url,
        },
        stats: {
          totalWords: stats.totalWords,
          newWords: stats.newWords,
          learningWords: stats.learningWords,
          knownWords: stats.knownWords,
          wordsLearnedThisWeek: stats.wordsLearnedThisWeek,
          currentStreak: stats.currentStreak,
          longestStreak: stats.longestStreak,
        },
        vocabulary,
        lastActivityDate: profile.last_activity_date,
      });
    } catch (error) {
      console.error('Error fetching family member progress:', error);
      return NextResponse.json(
        { error: 'Failed to fetch progress' },
        { status: 500 }
      );
    }
  });
}
