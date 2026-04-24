/**
 * Helpers for Next.js server components + route handlers.
 * Separate from `middleware.ts` because `next/headers` cannot be used in
 * edge middleware — it's for server components / route handlers only.
 */

import { cookies } from 'next/headers';
import { SSO_COOKIE_NAME } from './cookie';
import { verifyIdentityToken, type IdentityTokenPayload } from './jwt';

function requiredJwtSecret(): string {
  const v = process.env.LEDESIGN_JWT_SECRET;
  if (!v) throw new Error('Missing LEDESIGN_JWT_SECRET');
  return v;
}

/** Reads the shared SSO cookie and returns a verified JWT payload, or null. */
export async function readSsoSession(): Promise<IdentityTokenPayload | null> {
  const store = await cookies();
  const token = store.get(SSO_COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyIdentityToken(token, requiredJwtSecret());
}

/** Null-throwing variant for routes that must be authenticated. */
export async function requireSsoSession(): Promise<IdentityTokenPayload> {
  const payload = await readSsoSession();
  if (!payload) throw new Error('Not authenticated');
  return payload;
}

/** Returns true iff the signed-in user has active access to `appId`. */
export async function sessionHasApp(appId: string): Promise<boolean> {
  const p = await readSsoSession();
  return !!p && p.apps.includes(appId);
}
