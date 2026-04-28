import { NextRequest, NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from '@/lib/auth/middleware';
import { getLikedSongs } from '@/lib/db/music';

export const dynamic = 'force-dynamic';

// GET /api/music/songs/liked - Get user's liked songs
export async function GET(request: NextRequest) {
  return withAuth(request, async (req: AuthenticatedRequest) => {
    try {
      const likedSongs = await getLikedSongs(req.user.userId);

      return NextResponse.json({
        success: true,
        data: likedSongs,
      });
    } catch (error) {
      console.error('[Get Liked Songs] Error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch liked songs', details: (error as Error).message },
        { status: 500 }
      );
    }
  });
}
