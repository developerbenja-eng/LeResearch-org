import { NextRequest, NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from '@/lib/auth/middleware';
import { getAlbumWithSongs, STUDIO_COLLECTION_TITLES } from '@/lib/db/music';
import { isAdminRole } from '@/types/admin';

export const dynamic = 'force-dynamic';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/music/albums/:id - Get album with songs
export async function GET(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;

  return withAuth(request, async (req: AuthenticatedRequest) => {
    try {
      // Try fetching with user ownership first
      let album = await getAlbumWithSongs(id, req.user.userId);

      // If not found and user is admin, try without user filter
      // (allows access to studio collection albums)
      if (!album && isAdminRole(req.user.role || '')) {
        album = await getAlbumWithSongs(id);
        // Only allow if it's a studio collection album
        if (album && !STUDIO_COLLECTION_TITLES.includes(album.title)) {
          album = null;
        }
      }

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
