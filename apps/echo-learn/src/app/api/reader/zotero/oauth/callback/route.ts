/**
 * Zotero OAuth - Step 2: Handle callback from Zotero
 *
 * GET: Exchange request token for access token and save connection
 */

// Force Node.js runtime - crypto module doesn't work in Edge
export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getAccessToken } from '@/lib/reader/zotero-oauth';
import { saveZoteroConnection } from '@/lib/reader/zotero-sync';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const oauthToken = searchParams.get('oauth_token');
    const oauthVerifier = searchParams.get('oauth_verifier');

    // Check for user denial
    if (!oauthVerifier) {
      // User denied access or there was an error
      const host = request.headers.get('host') || 'localhost:3000';
      const protocol = host.includes('localhost') ? 'http' : 'https';
      return NextResponse.redirect(
        `${protocol}://${host}/reader/settings?zotero=denied`
      );
    }

    if (!oauthToken) {
      return NextResponse.json(
        { error: 'Missing oauth_token parameter' },
        { status: 400 }
      );
    }

    // Get the stored request token secret and user ID from cookies
    const cookieStore = await cookies();
    const oauthTokenSecret = cookieStore.get('zotero_oauth_secret')?.value;
    const userId = cookieStore.get('zotero_oauth_user')?.value;

    if (!oauthTokenSecret) {
      const host = request.headers.get('host') || 'localhost:3000';
      const protocol = host.includes('localhost') ? 'http' : 'https';
      return NextResponse.redirect(
        `${protocol}://${host}/reader/settings?zotero=expired`
      );
    }

    if (!userId) {
      const host = request.headers.get('host') || 'localhost:3000';
      const protocol = host.includes('localhost') ? 'http' : 'https';
      return NextResponse.redirect(
        `${protocol}://${host}/reader/settings?zotero=error&message=session_expired`
      );
    }

    // Exchange for access token
    const accessToken = await getAccessToken(
      oauthToken,
      oauthTokenSecret,
      oauthVerifier
    );

    // Save the connection to the database
    // The oauth_token from Zotero's access token response IS the API key
    await saveZoteroConnection(
      userId,
      accessToken.oauth_token, // This is the Zotero API key
      accessToken.userID,
      accessToken.username
    );

    // Clear the temporary cookies
    cookieStore.delete('zotero_oauth_secret');
    cookieStore.delete('zotero_oauth_user');

    // Redirect back to settings with success
    const host = request.headers.get('host') || 'localhost:3000';
    const protocol = host.includes('localhost') ? 'http' : 'https';

    return NextResponse.redirect(
      `${protocol}://${host}/reader/settings?zotero=success&username=${encodeURIComponent(accessToken.username)}`
    );
  } catch (error: any) {
    console.error('[Zotero OAuth Callback] Error:', error);

    const host = request.headers.get('host') || 'localhost:3000';
    const protocol = host.includes('localhost') ? 'http' : 'https';

    return NextResponse.redirect(
      `${protocol}://${host}/reader/settings?zotero=error&message=${encodeURIComponent(error.message || 'unknown')}`
    );
  }
}
