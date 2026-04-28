import { NextResponse } from 'next/server';
import { readSsoSession } from '@leresearch-org/identity/server';

const APP_ID = process.env.LEDESIGN_APP_ID ?? 'echo-learn';

/**
 * Same-origin /me for echo-learn. Reads the shared .ledesign.ai cookie
 * and returns what's safe to hand to the client. No DB lookup — the JWT
 * is the source of truth for identity + app access.
 */
export async function GET() {
  const payload = await readSsoSession();
  const res = NextResponse.json(
    payload
      ? {
          user: {
            id: payload.userId,
            email: payload.email,
            name: payload.name ?? null,
          },
          apps: payload.apps,
          roles: payload.roles,
          hasAppAccess: payload.apps.includes(APP_ID),
        }
      : { user: null },
  );
  res.headers.set('Cache-Control', 'no-store');
  return res;
}
