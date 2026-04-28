import { NextRequest, NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from '@/lib/auth/middleware';
import { deleteSong, getSongWithOwnership } from '@/lib/db/music';

export const dynamic = 'force-dynamic';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// DELETE /api/music/songs/:id - Delete a song permanently
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const { id: songId } = await params;

  return withAuth(request, async (req: AuthenticatedRequest) => {
    try {
      // Verify song exists and belongs to user
      const song = await getSongWithOwnership(songId);

      if (!song) {
        return NextResponse.json(
          { error: 'Song not found' },
          { status: 404 }
        );
      }

      if (song.user_id !== req.user.userId) {
        return NextResponse.json(
          { error: 'You do not have permission to delete this song' },
          { status: 403 }
        );
      }

      // Delete the song and related data
      await deleteSong(songId, req.user.userId);

      console.log(`[Delete Song] User ${req.user.userId} deleted song ${songId}`);

      return NextResponse.json({
        success: true,
        message: 'Song deleted successfully',
      });
    } catch (error) {
      console.error('Error deleting song:', error);
      return NextResponse.json(
        { error: 'Failed to delete song' },
        { status: 500 }
      );
    }
  });
}

// GET /api/music/songs/:id - Get a single song
export async function GET(request: NextRequest, { params }: RouteParams) {
  const { id: songId } = await params;

  return withAuth(request, async (req: AuthenticatedRequest) => {
    try {
      const song = await getSongWithOwnership(songId);

      if (!song) {
        return NextResponse.json(
          { error: 'Song not found' },
          { status: 404 }
        );
      }

      if (song.user_id !== req.user.userId) {
        return NextResponse.json(
          { error: 'You do not have permission to view this song' },
          { status: 403 }
        );
      }

      return NextResponse.json({
        success: true,
        data: song,
      });
    } catch (error) {
      console.error('Error fetching song:', error);
      return NextResponse.json(
        { error: 'Failed to fetch song' },
        { status: 500 }
      );
    }
  });
}
