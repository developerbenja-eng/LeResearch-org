/**
 * Spotify Search API
 * GET /api/lingua/music/search?q=query&type=track&limit=20
 */

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getUniversalDb } from '@/lib/db/turso';

interface SpotifyTrack {
  id: string;
  name: string;
  artists: Array<{ id: string; name: string }>;
  album: {
    id: string;
    name: string;
    images: Array<{ url: string; width: number; height: number }>;
  };
  duration_ms: number;
  preview_url: string | null;
  external_urls: { spotify: string };
  explicit: boolean;
}

interface SpotifySearchResponse {
  tracks: {
    items: SpotifyTrack[];
    total: number;
    limit: number;
    offset: number;
  };
}

async function getValidAccessToken(userId: string): Promise<string | null> {
  const db = getUniversalDb();

  // Get stored tokens
  const result = await db.execute({
    sql: 'SELECT access_token, refresh_token, token_expiry FROM lingua_spotify_tokens WHERE user_id = ?',
    args: [userId],
  });

  if (result.rows.length === 0) {
    return null;
  }

  const { access_token, refresh_token, token_expiry } = result.rows[0] as unknown as {
    access_token: string;
    refresh_token: string;
    token_expiry: string;
  };

  // Check if token is expired
  const expiryTime = new Date(token_expiry).getTime();
  const now = Date.now();

  if (now < expiryTime - 60000) {
    // Token is still valid (with 1 minute buffer)
    return access_token;
  }

  // Token expired, refresh it
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return null;
  }

  const refreshResponse = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
    },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refresh_token,
    }),
  });

  if (!refreshResponse.ok) {
    return null;
  }

  const tokens = await refreshResponse.json();
  const newExpiry = new Date(Date.now() + tokens.expires_in * 1000).toISOString();

  // Update tokens in database
  await db.execute({
    sql: `UPDATE lingua_spotify_tokens
          SET access_token = ?, token_expiry = ?, updated_at = ?
          WHERE user_id = ?`,
    args: [tokens.access_token, newExpiry, new Date().toISOString(), userId],
  });

  return tokens.access_token;
}

export async function GET(request: NextRequest) {
  try {
    // Get Lingua user from session
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('lingua_session');

    if (!sessionCookie?.value) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const session = JSON.parse(sessionCookie.value);
    const userId = session.userId;

    if (!userId) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
    }

    // Get search parameters
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const type = searchParams.get('type') || 'track';
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 50);
    const offset = parseInt(searchParams.get('offset') || '0');
    const market = searchParams.get('market') || 'US';

    if (!query) {
      return NextResponse.json({ error: 'Search query is required' }, { status: 400 });
    }

    // Get valid access token
    const accessToken = await getValidAccessToken(userId);

    if (!accessToken) {
      return NextResponse.json(
        { error: 'Spotify not connected or token expired' },
        { status: 401 }
      );
    }

    // Search Spotify
    const spotifyUrl = new URL('https://api.spotify.com/v1/search');
    spotifyUrl.searchParams.set('q', query);
    spotifyUrl.searchParams.set('type', type);
    spotifyUrl.searchParams.set('limit', limit.toString());
    spotifyUrl.searchParams.set('offset', offset.toString());
    spotifyUrl.searchParams.set('market', market);

    const response = await fetch(spotifyUrl.toString(), {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Spotify search error:', error);
      return NextResponse.json(
        { error: 'Failed to search Spotify' },
        { status: response.status }
      );
    }

    const data: SpotifySearchResponse = await response.json();

    // Transform tracks to our format
    const tracks = data.tracks.items.map((track) => ({
      spotify_track_id: track.id,
      title: track.name,
      artist: track.artists.map((a) => a.name).join(', '),
      album: track.album.name,
      duration_ms: track.duration_ms,
      preview_url: track.preview_url,
      cover_image_url: track.album.images[0]?.url || null,
      spotify_url: track.external_urls.spotify,
      explicit: track.explicit,
    }));

    return NextResponse.json({
      tracks,
      total: data.tracks.total,
      limit: data.tracks.limit,
      offset: data.tracks.offset,
      hasMore: data.tracks.offset + data.tracks.items.length < data.tracks.total,
    });
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
