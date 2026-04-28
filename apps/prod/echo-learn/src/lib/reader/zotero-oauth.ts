/**
 * Zotero OAuth 1.0a Implementation
 *
 * Handles the OAuth flow to authenticate users with their Zotero accounts
 * without requiring them to manually create API keys.
 */

import OAuth from 'oauth-1.0a';
import { createHmac } from 'crypto';

// Zotero OAuth endpoints
const ZOTERO_OAUTH_BASE = 'https://www.zotero.org/oauth';
const REQUEST_TOKEN_URL = `${ZOTERO_OAUTH_BASE}/request`;
const AUTHORIZE_URL = `${ZOTERO_OAUTH_BASE}/authorize`;
const ACCESS_TOKEN_URL = `${ZOTERO_OAUTH_BASE}/access`;

// Helper to get credentials at runtime (not cached at module load)
function getCredentials() {
  return {
    key: process.env.ZOTERO_CLIENT_KEY || '',
    secret: process.env.ZOTERO_CLIENT_SECRET || '',
  };
}

interface OAuthToken {
  oauth_token: string;
  oauth_token_secret: string;
}

interface ZoteroAccessToken extends OAuthToken {
  userID: string;
  username: string;
}

// Create OAuth 1.0a instance with runtime credentials
function createOAuth(): OAuth {
  const creds = getCredentials();
  return new OAuth({
    consumer: {
      key: creds.key,
      secret: creds.secret,
    },
    signature_method: 'HMAC-SHA1',
    hash_function(baseString: string, key: string) {
      return createHmac('sha1', key)
        .update(baseString)
        .digest('base64');
    },
  });
}

/**
 * Parse OAuth response body (form-encoded)
 */
function parseOAuthResponse(body: string): Record<string, string> {
  const params: Record<string, string> = {};
  body.split('&').forEach(pair => {
    const [key, value] = pair.split('=');
    params[decodeURIComponent(key)] = decodeURIComponent(value || '');
  });
  return params;
}

/**
 * Step 1: Get a request token from Zotero
 */
export async function getRequestToken(callbackUrl: string): Promise<OAuthToken> {
  try {
    // Get credentials at runtime to ensure env vars are loaded
    const clientKey = process.env.ZOTERO_CLIENT_KEY || '';
    const clientSecret = process.env.ZOTERO_CLIENT_SECRET || '';

    console.log('[Zotero OAuth] ========== REQUEST TOKEN ==========');
    console.log('[Zotero OAuth] Client key:', clientKey);
    console.log('[Zotero OAuth] Client key first 4 chars:', clientKey?.substring(0, 4));
    console.log('[Zotero OAuth] Client secret length:', clientSecret?.length || 0);
    console.log('[Zotero OAuth] Client secret first 4 chars:', clientSecret?.substring(0, 4));
    console.log('[Zotero OAuth] Callback URL:', callbackUrl);
    console.log('[Zotero OAuth] Request URL:', REQUEST_TOKEN_URL);

    if (!clientKey || !clientSecret) {
      throw new Error('Zotero OAuth credentials not configured');
    }

    // Use the oauth-1.0a library for signature generation
    const oauth = new OAuth({
      consumer: {
        key: clientKey,
        secret: clientSecret,
      },
      signature_method: 'HMAC-SHA1',
      hash_function(baseString: string, key: string) {
        return createHmac('sha1', key)
          .update(baseString)
          .digest('base64');
      },
    });

    const requestData = {
      url: REQUEST_TOKEN_URL,
      method: 'POST' as const,
      data: {
        oauth_callback: callbackUrl,
      },
    };

    const authorized = oauth.authorize(requestData);
    const authHeader = oauth.toHeader(authorized);

    console.log('[Zotero OAuth] Auth header:', authHeader.Authorization);

    const response = await fetch(REQUEST_TOKEN_URL, {
      method: 'POST',
      headers: {
        ...authHeader,
      },
    });

    const responseText = await response.text();
    console.log('[Zotero OAuth] Response status:', response.status);
    console.log('[Zotero OAuth] Response body:', responseText);

    if (!response.ok) {
      console.error('[Zotero OAuth] Request token FAILED');
      console.error('[Zotero OAuth] Response headers:', JSON.stringify(Object.fromEntries(response.headers.entries())));
      console.error('[Zotero OAuth] Response body:', responseText);
      throw new Error(`Failed to get request token: ${response.status} - ${responseText}`);
    }

    const params = parseOAuthResponse(responseText);

    if (!params.oauth_token || !params.oauth_token_secret) {
      throw new Error('Invalid response from Zotero OAuth');
    }

    return {
      oauth_token: params.oauth_token,
      oauth_token_secret: params.oauth_token_secret,
    };
  } catch (error: any) {
    console.error('[Zotero OAuth] Exception in getRequestToken:', error.message, error.stack);
    throw error;
  }
}

/**
 * Step 2: Get the authorization URL to redirect the user to
 */
export function getAuthorizationUrl(requestToken: string): string {
  return `${AUTHORIZE_URL}?oauth_token=${encodeURIComponent(requestToken)}&all_groups=write&library_access=1`;
}

/**
 * Step 3: Exchange the request token for an access token
 */
export async function getAccessToken(
  requestToken: string,
  requestTokenSecret: string,
  oauthVerifier: string
): Promise<ZoteroAccessToken> {
  const oauth = createOAuth();

  const requestData = {
    url: ACCESS_TOKEN_URL,
    method: 'POST' as const,
    data: {
      oauth_verifier: oauthVerifier,
    },
  };

  const token = {
    key: requestToken,
    secret: requestTokenSecret,
  };

  console.log('[Zotero OAuth] ========== ACCESS TOKEN ==========');
  console.log('[Zotero OAuth] Request token:', requestToken);
  console.log('[Zotero OAuth] Request token secret length:', requestTokenSecret?.length);
  console.log('[Zotero OAuth] OAuth verifier:', oauthVerifier);

  const authorized = oauth.authorize(requestData, token);
  const headers = oauth.toHeader(authorized);

  console.log('[Zotero OAuth] Auth header:', headers.Authorization);

  const response = await fetch(ACCESS_TOKEN_URL, {
    method: 'POST',
    headers: {
      ...headers,
    },
  });

  const responseText = await response.text();
  console.log('[Zotero OAuth] Access token response status:', response.status);
  console.log('[Zotero OAuth] Access token response body:', responseText);

  if (!response.ok) {
    console.error('[Zotero OAuth] Access token error:', responseText);
    throw new Error(`Failed to get access token: ${response.status}`);
  }

  const params = parseOAuthResponse(responseText);

  if (!params.oauth_token || !params.userID || !params.username) {
    console.error('[Zotero OAuth] Invalid response:', params);
    throw new Error('Invalid response from Zotero OAuth - missing required fields');
  }

  return {
    oauth_token: params.oauth_token,
    oauth_token_secret: params.oauth_token_secret || '',
    userID: params.userID,
    username: params.username,
  };
}

/**
 * Check if Zotero OAuth is configured
 */
export function isOAuthConfigured(): boolean {
  const creds = getCredentials();
  return Boolean(creds.key && creds.secret);
}
