import { NextResponse, type NextRequest } from 'next/server';
import {
  verifyIdentityToken,
  tokenGrantsApp,
  type IdentityTokenPayload,
} from './jwt';
import { SSO_COOKIE_NAME } from './cookie';

export interface SsoEnv {
  /** Shared JWT secret. Required. */
  jwtSecret: string;
  /** Base URL of auth.ledesign.ai (no trailing slash). Required. */
  authOrigin: string;
  /** This app's id (must match a key expected in JWT `apps`). Required. */
  appId: string;
}

function readEnv(env?: Partial<SsoEnv>): SsoEnv {
  const jwtSecret = env?.jwtSecret ?? process.env.LEDESIGN_JWT_SECRET;
  const authOrigin = env?.authOrigin ?? process.env.LEDESIGN_AUTH_ORIGIN;
  const appId = env?.appId ?? process.env.LEDESIGN_APP_ID;
  if (!jwtSecret) throw new Error('Missing LEDESIGN_JWT_SECRET');
  if (!authOrigin) throw new Error('Missing LEDESIGN_AUTH_ORIGIN');
  if (!appId) throw new Error('Missing LEDESIGN_APP_ID');
  return { jwtSecret, authOrigin, appId };
}

export function readSsoCookie(req: NextRequest): string | null {
  return req.cookies.get(SSO_COOKIE_NAME)?.value ?? null;
}

/** Returns a decoded, verified payload or null. No redirects. */
export function getSsoPayload(
  req: NextRequest,
  env?: Partial<SsoEnv>,
): IdentityTokenPayload | null {
  const { jwtSecret } = readEnv(env);
  const token = readSsoCookie(req);
  if (!token) return null;
  return verifyIdentityToken(token, jwtSecret);
}

/**
 * Build the redirect URL back to auth.ledesign.ai/login with the intended
 * destination encoded so the user lands where they started after auth.
 */
export function buildLoginRedirect(req: NextRequest, env?: Partial<SsoEnv>): URL {
  const { authOrigin, appId } = readEnv(env);
  const url = new URL('/login', authOrigin);
  url.searchParams.set('app', appId);
  url.searchParams.set('redirect', req.nextUrl.toString());
  return url;
}

/**
 * Drop-in middleware for an app: if unauthenticated OR the JWT doesn't
 * grant access to this app, redirect to auth.ledesign.ai. Apps usually
 * wrap their `middleware.ts` around this plus a `matcher` in the config.
 */
export function requireSso(req: NextRequest, env?: Partial<SsoEnv>): NextResponse {
  const resolved = readEnv(env);
  const payload = getSsoPayload(req, resolved);
  if (!payload || !tokenGrantsApp(payload, resolved.appId)) {
    return NextResponse.redirect(buildLoginRedirect(req, resolved));
  }
  return NextResponse.next();
}
