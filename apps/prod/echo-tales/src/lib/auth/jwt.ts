/**
 * Backwards-compatible shim over @ledesign-ai/identity.
 * Route handlers still import `verifyToken`/`extractTokenFromHeader`
 * from here; under the hood we now read the shared .ledesign.ai SSO
 * cookie + JWT format. Sync — runs in Node runtime route handlers.
 */

import {
  verifyIdentityToken,
  type IdentityTokenPayload,
} from '@ledesign-ai/identity';
import type { AuthTokenPayload } from '@/types';

const APP_ID = process.env.LEDESIGN_APP_ID ?? 'echo-tales';

function secret(): string {
  const v = process.env.LEDESIGN_JWT_SECRET;
  if (!v) throw new Error('Missing LEDESIGN_JWT_SECRET');
  return v;
}

function toLegacy(p: IdentityTokenPayload): AuthTokenPayload {
  const role = (p.roles[APP_ID] ?? 'user') as AuthTokenPayload['role'];
  return {
    userId: p.userId,
    email: p.email,
    role,
    apps: p.apps ?? [],
    roles: p.roles ?? {},
    iat: p.iat ?? 0,
    exp: p.exp ?? 0,
  };
}

export function verifyToken(token: string): AuthTokenPayload | null {
  const p = verifyIdentityToken(token, secret());
  return p ? toLegacy(p) : null;
}

export function decodeToken(token: string): AuthTokenPayload | null {
  // Verification alone is enough — we don't expose the JWT fields
  // without a signature check in the new world.
  return verifyToken(token);
}

export function isTokenExpired(token: string): boolean {
  const decoded = decodeToken(token);
  if (!decoded || !decoded.exp) return true;
  return decoded.exp < Math.floor(Date.now() / 1000);
}

export function extractTokenFromHeader(authHeader: string | null): string | null {
  if (!authHeader) return null;
  if (authHeader.startsWith('Bearer ')) return authHeader.substring(7);
  return authHeader;
}

// Token issuance lives on auth.ledesign.ai now.
export function generateToken(): never {
  throw new Error('generateToken is no longer valid in echo-tales; auth.ledesign.ai issues tokens.');
}
