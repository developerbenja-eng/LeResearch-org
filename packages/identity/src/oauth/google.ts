/**
 * Google OAuth 2.0 helpers — just enough to build the authorize URL,
 * exchange the code for tokens, and fetch the userinfo. No extra scopes.
 */

export const GOOGLE_AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth';
export const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token';
export const GOOGLE_USERINFO_URL = 'https://www.googleapis.com/oauth2/v3/userinfo';

export interface GoogleOAuthConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
}

function readConfig(env?: Partial<GoogleOAuthConfig>): GoogleOAuthConfig {
  const clientId = env?.clientId ?? process.env.GOOGLE_OAUTH_CLIENT_ID;
  const clientSecret = env?.clientSecret ?? process.env.GOOGLE_OAUTH_CLIENT_SECRET;
  const redirectUri = env?.redirectUri ?? process.env.GOOGLE_OAUTH_REDIRECT_URI;
  if (!clientId) throw new Error('Missing GOOGLE_OAUTH_CLIENT_ID');
  if (!clientSecret) throw new Error('Missing GOOGLE_OAUTH_CLIENT_SECRET');
  if (!redirectUri) throw new Error('Missing GOOGLE_OAUTH_REDIRECT_URI');
  return { clientId, clientSecret, redirectUri };
}

export interface BuildAuthUrlInput {
  state: string;
  scope?: string[];
  prompt?: 'none' | 'consent' | 'select_account';
  config?: Partial<GoogleOAuthConfig>;
}

export function buildGoogleAuthUrl(input: BuildAuthUrlInput): string {
  const cfg = readConfig(input.config);
  const scopes = input.scope ?? ['openid', 'email', 'profile'];
  const url = new URL(GOOGLE_AUTH_URL);
  url.searchParams.set('client_id', cfg.clientId);
  url.searchParams.set('redirect_uri', cfg.redirectUri);
  url.searchParams.set('response_type', 'code');
  url.searchParams.set('scope', scopes.join(' '));
  url.searchParams.set('state', input.state);
  url.searchParams.set('access_type', 'offline');
  url.searchParams.set('include_granted_scopes', 'true');
  if (input.prompt) url.searchParams.set('prompt', input.prompt);
  return url.toString();
}

export interface GoogleTokenResponse {
  access_token: string;
  expires_in: number;
  refresh_token?: string;
  scope: string;
  token_type: 'Bearer';
  id_token?: string;
}

export async function exchangeGoogleCode(
  code: string,
  config?: Partial<GoogleOAuthConfig>,
): Promise<GoogleTokenResponse> {
  const cfg = readConfig(config);
  const body = new URLSearchParams({
    code,
    client_id: cfg.clientId,
    client_secret: cfg.clientSecret,
    redirect_uri: cfg.redirectUri,
    grant_type: 'authorization_code',
  });
  const res = await fetch(GOOGLE_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Google token exchange failed (${res.status}): ${text}`);
  }
  return (await res.json()) as GoogleTokenResponse;
}

export interface GoogleUserInfo {
  sub: string;
  email: string;
  email_verified: boolean;
  name?: string;
  given_name?: string;
  family_name?: string;
  picture?: string;
  locale?: string;
}

export async function fetchGoogleUserInfo(accessToken: string): Promise<GoogleUserInfo> {
  const res = await fetch(GOOGLE_USERINFO_URL, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Google userinfo fetch failed (${res.status}): ${text}`);
  }
  return (await res.json()) as GoogleUserInfo;
}
