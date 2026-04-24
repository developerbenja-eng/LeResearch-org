/**
 * Backwards-compatible shim over @leresearch-org/identity.
 * Existing route handlers import `verifyToken` / `extractTokenFromHeader`
 * from here — we keep those names, but under the hood they now read
 * the shared .ledesign.ai SSO cookie + JWT format.
 */

import {
  verifyIdentityToken,
  type IdentityTokenPayload,
} from '@leresearch-org/identity';

/**
 * Legacy payload shape consumers still destructure as `{ userId, email, role }`.
 * We map the new `roles: Record<appId, role>` down to a single `role` for
 * this app by picking `roles['echo-learn']` (falling back to 'user').
 */
export interface AuthTokenPayload {
  userId: string;
  email: string;
  role: 'user' | 'admin' | 'superadmin' | 'owner';
  name?: string | null;
  apps: string[];
  roles: Record<string, 'user' | 'admin' | 'owner'>;
  sid: string;
  iat?: number;
  exp?: number;
}

const APP_ID = process.env.LEDESIGN_APP_ID ?? 'echo-learn';

function secret(): string {
  const v = process.env.LEDESIGN_JWT_SECRET;
  if (!v) throw new Error('Missing LEDESIGN_JWT_SECRET');
  return v;
}

function toLegacy(p: IdentityTokenPayload): AuthTokenPayload {
  const role = (p.roles[APP_ID] ?? 'user') as AuthTokenPayload['role'];
  return { ...p, role };
}

export function verifyToken(token: string): AuthTokenPayload | null {
  const p = verifyIdentityToken(token, secret());
  return p ? toLegacy(p) : null;
}

export function extractTokenFromHeader(authHeader: string | null): string | null {
  if (!authHeader) return null;
  if (authHeader.startsWith('Bearer ')) return authHeader.substring(7);
  return authHeader;
}

// Token issuance lives on auth.ledesign.ai now. This is intentionally
// unavailable from the app side — if anything still calls it, fail loud.
export function generateToken(): never {
  throw new Error('generateToken is no longer valid in echo-learn; auth.ledesign.ai issues tokens.');
}
