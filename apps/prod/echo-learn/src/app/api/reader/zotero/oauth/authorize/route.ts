/**
 * Zotero OAuth - Step 1: Initialize OAuth flow
 *
 * GET: Start OAuth flow by getting request token and returning auth URL
 */

// Force Node.js runtime - crypto module doesn't work in Edge
export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from '@/lib/auth/middleware';
import { getRequestToken, getAuthorizationUrl, isOAuthConfigured } from '@/lib/reader/zotero-oauth';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  return withAuth(request, async (req: AuthenticatedRequest) => {
    try {
      // Check if OAuth is configured
      if (!isOAuthConfigured()) {
        return NextResponse.json(
          { error: 'Zotero OAuth is not configured. Please contact support.' },
          { status: 503 }
        );
      }

      // Get the callback URL from the request or use default
      const host = request.headers.get('host') || 'localhost:3000';
      const protocol = host.includes('localhost') ? 'http' : 'https';
      const callbackUrl = `${protocol}://${host}/api/reader/zotero/oauth/callback`;

      // Get request token from Zotero
      const requestToken = await getRequestToken(callbackUrl);

      // Store the request token secret in a secure cookie
      // We need this for step 3 (exchanging for access token)
      const cookieStore = await cookies();
      cookieStore.set('zotero_oauth_secret', requestToken.oauth_token_secret, {
        httpOnly: true,
        secure: protocol === 'https',
        sameSite: 'lax',
        maxAge: 60 * 10, // 10 minutes
        path: '/',
      });

      // Also store the user ID so we know who to link the account to
      cookieStore.set('zotero_oauth_user', req.user.userId, {
        httpOnly: true,
        secure: protocol === 'https',
        sameSite: 'lax',
        maxAge: 60 * 10, // 10 minutes
        path: '/',
      });

      // Get the authorization URL
      const authUrl = getAuthorizationUrl(requestToken.oauth_token);

      return NextResponse.json({
        success: true,
        authUrl,
      });
    } catch (error: any) {
      console.error('[Zotero OAuth Authorize] Error:', error);
      return NextResponse.json(
        { error: error.message || 'Failed to start Zotero OAuth flow' },
        { status: 500 }
      );
    }
  });
}
