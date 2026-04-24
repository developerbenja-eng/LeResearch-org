/**
 * Spotify OAuth Initiation for Echo-Lin
 * GET /api/lingua/music/spotify/auth - Redirects to Spotify authorization
 */

import { NextRequest, NextResponse } from 'next/server';
import { getLinguaSessionFromRequest } from '@/lib/lingua/middleware';

export const dynamic = 'force-dynamic';

const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
const SPOTIFY_REDIRECT_URI = process.env.SPOTIFY_REDIRECT_URI || `${APP_URL}/api/lingua/music/spotify/callback`;

// Scopes needed for music learning feature
const SPOTIFY_SCOPES = [
  'user-read-email',           // Identify user
  'user-read-private',         // User country/subscription status
  'streaming',                 // Web Playback SDK (Premium)
  'user-library-read',         // Access saved songs
  'user-read-playback-state',  // Current playback state
  'user-modify-playback-state', // Control playback
  'playlist-read-private',     // Read user playlists
].join(' ');

export async function GET(request: NextRequest) {
  // Verify user is authenticated with Lingua
  const session = getLinguaSessionFromRequest(request);

  if (!session) {
    return NextResponse.redirect(`${APP_URL}/lingua?error=not_authenticated`);
  }

  if (!SPOTIFY_CLIENT_ID) {
    return NextResponse.json(
      { error: 'Spotify OAuth not configured. Please set SPOTIFY_CLIENT_ID.' },
      { status: 500 }
    );
  }

  // Generate state parameter for CSRF protection
  // Include Lingua user ID to link Spotify account after callback
  const state = Buffer.from(JSON.stringify({
    linguaUserId: session.userId,
    returnTo: '/lingua/dashboard?tab=music',
    timestamp: Date.now(),
  })).toString('base64');

  // Build Spotify OAuth URL
  const spotifyAuthUrl = new URL('https://accounts.spotify.com/authorize');
  spotifyAuthUrl.searchParams.set('client_id', SPOTIFY_CLIENT_ID);
  spotifyAuthUrl.searchParams.set('redirect_uri', SPOTIFY_REDIRECT_URI);
  spotifyAuthUrl.searchParams.set('response_type', 'code');
  spotifyAuthUrl.searchParams.set('scope', SPOTIFY_SCOPES);
  spotifyAuthUrl.searchParams.set('state', state);
  spotifyAuthUrl.searchParams.set('show_dialog', 'true'); // Force login dialog

  return NextResponse.redirect(spotifyAuthUrl.toString());
}
