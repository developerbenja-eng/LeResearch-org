/**
 * Spotify Token Refresh for Echo-Lin
 * POST /api/lingua/music/spotify/refresh - Refreshes expired Spotify access token
 */

import { NextRequest, NextResponse } from 'next/server';
import { getUniversalDb, execute, queryOne } from '@/lib/db/turso';
import { withLinguaAuth } from '@/lib/lingua/middleware';
import { LinguaSession } from '@/types/lingua';

export const dynamic = 'force-dynamic';

const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID!;
const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET!;

interface SpotifyTokenRecord {
  id: string;
  user_id: string;
  access_token: string;
  refresh_token: string;
  token_expiry: string;
  spotify_user_id: string;
  is_premium: number;
}

interface SpotifyRefreshResponse {
  access_token: string;
  token_type: string;
  scope: string;
  expires_in: number;
  refresh_token?: string; // Sometimes Spotify returns a new refresh token
}

export async function POST(request: NextRequest) {
  return withLinguaAuth(request, async (req: NextRequest, session: LinguaSession) => {
    try {
      const db = getUniversalDb();

      // Get current tokens
      const tokens = await queryOne<SpotifyTokenRecord>(
        db,
        'SELECT * FROM lingua_spotify_tokens WHERE user_id = ?',
        [session.userId]
      );

      if (!tokens) {
        return NextResponse.json(
          { error: 'No Spotify connection found. Please connect your Spotify account.' },
          { status: 404 }
        );
      }

      // Check if token is actually expired (add 1 minute buffer)
      const expiryTime = new Date(tokens.token_expiry).getTime();
      const now = Date.now();
      const bufferMs = 60 * 1000; // 1 minute

      if (expiryTime - now > bufferMs) {
        // Token is still valid
        return NextResponse.json({
          access_token: tokens.access_token,
          expires_at: tokens.token_expiry,
          is_premium: tokens.is_premium === 1,
        });
      }

      // Refresh the token
      const refreshResponse = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${Buffer.from(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`).toString('base64')}`,
        },
        body: new URLSearchParams({
          grant_type: 'refresh_token',
          refresh_token: tokens.refresh_token,
        }),
      });

      if (!refreshResponse.ok) {
        const errorText = await refreshResponse.text();
        console.error('Failed to refresh Spotify token:', errorText);

        // If refresh fails, user needs to re-authenticate
        if (refreshResponse.status === 400 || refreshResponse.status === 401) {
          // Delete invalid tokens
          await execute(
            db,
            'DELETE FROM lingua_spotify_tokens WHERE user_id = ?',
            [session.userId]
          );

          return NextResponse.json(
            { error: 'Spotify session expired. Please reconnect your account.', needsReauth: true },
            { status: 401 }
          );
        }

        return NextResponse.json(
          { error: 'Failed to refresh Spotify token' },
          { status: 500 }
        );
      }

      const refreshData: SpotifyRefreshResponse = await refreshResponse.json();

      // Calculate new expiry
      const newExpiry = new Date(Date.now() + refreshData.expires_in * 1000).toISOString();
      const nowIso = new Date().toISOString();

      // Update tokens in database
      await execute(
        db,
        `UPDATE lingua_spotify_tokens SET
          access_token = ?,
          refresh_token = COALESCE(?, refresh_token),
          token_expiry = ?,
          updated_at = ?
        WHERE user_id = ?`,
        [
          refreshData.access_token,
          refreshData.refresh_token || null,
          newExpiry,
          nowIso,
          session.userId,
        ]
      );

      return NextResponse.json({
        access_token: refreshData.access_token,
        expires_at: newExpiry,
        is_premium: tokens.is_premium === 1,
      });
    } catch (error) {
      console.error('Error refreshing Spotify token:', error);
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  });
}

/**
 * GET /api/lingua/music/spotify/refresh - Get current token status
 */
export async function GET(request: NextRequest) {
  return withLinguaAuth(request, async (req: NextRequest, session: LinguaSession) => {
    try {
      const db = getUniversalDb();

      const tokens = await queryOne<SpotifyTokenRecord>(
        db,
        'SELECT * FROM lingua_spotify_tokens WHERE user_id = ?',
        [session.userId]
      );

      if (!tokens) {
        return NextResponse.json({
          connected: false,
        });
      }

      const expiryTime = new Date(tokens.token_expiry).getTime();
      const now = Date.now();
      const isExpired = expiryTime <= now;

      return NextResponse.json({
        connected: true,
        is_premium: tokens.is_premium === 1,
        spotify_user_id: tokens.spotify_user_id,
        is_expired: isExpired,
        expires_at: tokens.token_expiry,
      });
    } catch (error) {
      console.error('Error checking Spotify status:', error);
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  });
}
