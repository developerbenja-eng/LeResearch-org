import { NextRequest, NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from '@/lib/auth/middleware';
import { getAlbumWithSongs } from '@/lib/db/music';

export const dynamic = 'force-dynamic';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/music/albums/:id - Get album with songs
export async function GET(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;

  return withAuth(request, async (req: AuthenticatedRequest) => {
    try {
      const album = await getAlbumWithSongs(id, req.user.userId);

      if (!album) {
        return NextResponse.json(
          { error: 'Album not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        data: album,
      });
    } catch (error) {
      console.error('Error fetching album:', error);
      return NextResponse.json(
        { error: 'Failed to fetch album' },
        { status: 500 }
      );
    }
  });
}
