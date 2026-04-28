/**
 * Spotify OAuth Callback for Echo-Lin
 * GET /api/lingua/music/spotify/callback - Handles Spotify authorization response
 */

import { NextRequest, NextResponse } from 'next/server';
import { getUniversalDb, execute, queryOne } from '@/lib/db/turso';
import { generateId } from '@/lib/utils';

export const dynamic = 'force-dynamic';

const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID!;
const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET!;
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
const SPOTIFY_REDIRECT_URI = process.env.SPOTIFY_REDIRECT_URI || `${APP_URL}/api/lingua/music/spotify/callback`;

interface SpotifyTokenResponse {
  access_token: string;
  token_type: string;
  scope: string;
  expires_in: number;
  refresh_token: string;
}

interface SpotifyUserProfile {
  id: string;
  email: string;
  display_name: string;
  product: 'free' | 'premium' | 'open';
  country: string;
  images: { url: string }[];
}

interface SpotifyTokenRecord {
  id: string;
  user_id: string;
  access_token: string;
  refresh_token: string;
  token_expiry: string;
  spotify_user_id: string;
  spotify_email: string;
  is_premium: number;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');

    // Handle errors from Spotify
    if (error) {
      console.error('Spotify OAuth error:', error);
      return NextResponse.redirect(
        `${APP_URL}/lingua/dashboard?tab=music&error=spotify_auth_failed&message=${encodeURIComponent(error)}`
      );
    }

    if (!code) {
      return NextResponse.redirect(
        `${APP_URL}/lingua/dashboard?tab=music&error=no_code`
      );
    }

    // Parse state to get Lingua user ID
    let linguaUserId: string | null = null;
    let returnTo = '/lingua/dashboard?tab=music';

    if (state) {
      try {
        const stateData = JSON.parse(Buffer.from(state, 'base64').toString());
        linguaUserId = stateData.linguaUserId;
        returnTo = stateData.returnTo || returnTo;
      } catch {
        console.error('Invalid state parameter');
        return NextResponse.redirect(
          `${APP_URL}/lingua/dashboard?tab=music&error=invalid_state`
        );
      }
    }

    if (!linguaUserId) {
      return NextResponse.redirect(
        `${APP_URL}/lingua?error=no_user_session`
      );
    }

    // Exchange authorization code for tokens
    const tokenResponse = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${Buffer.from(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`).toString('base64')}`,
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: SPOTIFY_REDIRECT_URI,
      }),
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error('Failed to exchange code for tokens:', errorText);
      return NextResponse.redirect(
        `${APP_URL}/lingua/dashboard?tab=music&error=token_exchange_failed`
      );
    }

    const tokens: SpotifyTokenResponse = await tokenResponse.json();

    // Get Spotify user profile
    const profileResponse = await fetch('https://api.spotify.com/v1/me', {
      headers: {
        'Authorization': `Bearer ${tokens.access_token}`,
      },
    });

    if (!profileResponse.ok) {
      console.error('Failed to get Spotify profile:', await profileResponse.text());
      return NextResponse.redirect(
        `${APP_URL}/lingua/dashboard?tab=music&error=profile_fetch_failed`
      );
    }

    const profile: SpotifyUserProfile = await profileResponse.json();

    // Calculate token expiry
    const tokenExpiry = new Date(Date.now() + tokens.expires_in * 1000).toISOString();
    const now = new Date().toISOString();
    const isPremium = profile.product === 'premium' ? 1 : 0;

    const db = getUniversalDb();

    // Check if user already has Spotify tokens
    const existingTokens = await queryOne<SpotifyTokenRecord>(
      db,
      'SELECT * FROM lingua_spotify_tokens WHERE user_id = ?',
      [linguaUserId]
    );

    if (existingTokens) {
      // Update existing tokens
      await execute(
        db,
        `UPDATE lingua_spotify_tokens SET
          access_token = ?,
          refresh_token = ?,
          token_expiry = ?,
          spotify_user_id = ?,
          spotify_email = ?,
          is_premium = ?,
          updated_at = ?
        WHERE user_id = ?`,
        [
          tokens.access_token,
          tokens.refresh_token,
          tokenExpiry,
          profile.id,
          profile.email,
          isPremium,
          now,
          linguaUserId,
        ]
      );
    } else {
      // Insert new tokens
      await execute(
        db,
        `INSERT INTO lingua_spotify_tokens (
          id, user_id, access_token, refresh_token, token_expiry,
          spotify_user_id, spotify_email, is_premium, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          generateId(),
          linguaUserId,
          tokens.access_token,
          tokens.refresh_token,
          tokenExpiry,
          profile.id,
          profile.email,
          isPremium,
          now,
          now,
        ]
      );
    }

    // Redirect back to Music tab with success
    return NextResponse.redirect(
      `${APP_URL}${returnTo}&spotify=connected&premium=${isPremium === 1}`
    );
  } catch (error) {
    console.error('Spotify OAuth callback error:', error);
    return NextResponse.redirect(
      `${APP_URL}/lingua/dashboard?tab=music&error=oauth_failed`
    );
  }
}
