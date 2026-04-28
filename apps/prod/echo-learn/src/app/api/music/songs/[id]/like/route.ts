import { NextRequest, NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from '@/lib/auth/middleware';
import { toggleSongLike, isSongLiked, getSongWithOwnership } from '@/lib/db/music';

export const dynamic = 'force-dynamic';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// POST /api/music/songs/:id/like - Toggle like status
export async function POST(request: NextRequest, { params }: RouteParams) {
  const { id: songId } = await params;

  return withAuth(request, async (req: AuthenticatedRequest) => {
    try {
      const body = await request.json();
      const { action } = body;

      if (!action || (action !== 'like' && action !== 'unlike')) {
        return NextResponse.json(
          { error: 'action must be "like" or "unlike"' },
          { status: 400 }
        );
      }

      // Verify song exists
      const song = await getSongWithOwnership(songId);

      if (!song) {
        return NextResponse.json(
          { error: 'Song not found' },
          { status: 404 }
        );
      }

      // Toggle like status
      await toggleSongLike(req.user.userId, songId, action);

      console.log(`[${action === 'like' ? 'Like' : 'Unlike'} Song] User ${req.user.userId} ${action}d song ${songId}`);

      return NextResponse.json({
        success: true,
        action: action === 'like' ? 'liked' : 'unliked',
        message: action === 'like' ? 'Song added to liked songs' : 'Song removed from liked songs',
      });
    } catch (error) {
      console.error('Error toggling like:', error);
      return NextResponse.json(
        { error: 'Failed to toggle like' },
        { status: 500 }
      );
    }
  });
}

// GET /api/music/songs/:id/like - Check if song is liked
export async function GET(request: NextRequest, { params }: RouteParams) {
  const { id: songId } = await params;

  return withAuth(request, async (req: AuthenticatedRequest) => {
    try {
      const liked = await isSongLiked(req.user.userId, songId);

      return NextResponse.json({
        success: true,
        liked,
      });
    } catch (error) {
      console.error('Error checking like status:', error);
      return NextResponse.json(
        { error: 'Failed to check like status' },
        { status: 500 }
      );
    }
  });
}
