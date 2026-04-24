/**
 * Edge-runtime-safe JWT verification using `jose` (Web Crypto under the hood).
 * Use this from Next.js middleware; the Node-runtime helpers in `./jwt`
 * keep using `jsonwebtoken` for signing on the auth app side.
 */

import { jwtVerify, type JWTPayload } from 'jose';
import type { NextRequest } from 'next/server';
import { SSO_COOKIE_NAME } from './cookie';
import type { IdentityTokenPayload } from './jwt';

let _secretKey: Uint8Array | null = null;
let _cachedSecret: string | null = null;

function toKey(secret: string): Uint8Array {
  if (_secretKey && _cachedSecret === secret) return _secretKey;
  _cachedSecret = secret;
  _secretKey = new TextEncoder().encode(secret);
  return _secretKey;
}

function looksLikeIdentityPayload(p: JWTPayload): p is JWTPayload & IdentityTokenPayload {
  return (
    typeof (p as { userId?: unknown }).userId === 'string' &&
    typeof (p as { email?: unknown }).email === 'string' &&
    Array.isArray((p as { apps?: unknown }).apps)
  );
}

export async function verifyIdentityTokenEdge(
  token: string,
  secret: string,
): Promise<IdentityTokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, toKey(secret), { algorithms: ['HS256'] });
    if (!looksLikeIdentityPayload(payload)) return null;
    return payload;
  } catch {
    return null;
  }
}

export function readSsoCookieFromRequest(req: NextRequest): string | null {
  return req.cookies.get(SSO_COOKIE_NAME)?.value ?? null;
}

export async function getSsoPayloadFromRequest(
  req: NextRequest,
  secret: string,
): Promise<IdentityTokenPayload | null> {
  const token = readSsoCookieFromRequest(req);
  if (!token) return null;
  return verifyIdentityTokenEdge(token, secret);
}
