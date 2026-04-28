import { NextResponse, type NextRequest } from 'next/server';
import { getSsoPayloadFromRequest } from '@leresearch-org/identity/edge';

const APP_ID = process.env.LEDESIGN_APP_ID ?? 'echo-learn';
const AUTH_ORIGIN = process.env.LEDESIGN_AUTH_ORIGIN ?? 'https://auth.ledesign.ai';

/**
 * Gate every matched path behind the shared SSO cookie at the edge.
 * Uses jose (Web Crypto) — `jsonwebtoken` silently fails in Edge runtime.
 * Unauthenticated → 307 to auth.ledesign.ai/login with `redirect` preserved.
 * Authenticated but no grant for this app → 307 to /register.
 */
export async function middleware(req: NextRequest) {
  const secret = process.env.LEDESIGN_JWT_SECRET;
  if (!secret) {
    // Fail open in a visible way — unauth redirect, but the real fix is env.
    return NextResponse.redirect(new URL('/login', AUTH_ORIGIN), 307);
  }

  const payload = await getSsoPayloadFromRequest(req, secret);
  if (payload && payload.apps.includes(APP_ID)) {
    return NextResponse.next();
  }

  const target = new URL(payload ? '/register' : '/login', AUTH_ORIGIN);
  target.searchParams.set('app', APP_ID);
  target.searchParams.set('redirect', req.nextUrl.toString());
  return NextResponse.redirect(target, 307);
}

export const config = {
  matcher: [
    // Authenticated app surfaces only — keep landing, static, and public
    // API routes out of the middleware's path.
    '/home',
    '/home/:path*',
    '/play',
    '/play/:path*',
    '/music',
    '/music/:path*',
    '/community',
    '/community/:path*',
    '/admin',
    '/admin/:path*',
    '/settings',
    '/settings/:path*',
    '/store',
    '/store/:path*',
    '/book',
    '/book/:path*',
    '/characters',
    '/characters/:path*',
    '/topics',
    '/topics/:path*',
    '/reader',
    '/reader/:path*',
  ],
};
