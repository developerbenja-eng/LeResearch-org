import { NextResponse, type NextRequest } from 'next/server';
import { getSsoPayloadFromRequest } from '@ledesign-ai/identity/edge';

const APP_ID = process.env.LEDESIGN_APP_ID ?? 'echo-tales';
const AUTH_ORIGIN = process.env.LEDESIGN_AUTH_ORIGIN ?? 'https://auth.ledesign.ai';

/**
 * Gate authenticated surfaces at the edge using the shared .ledesign.ai cookie.
 * Unauth → 307 to auth.ledesign.ai/login. No-grant → 307 to /register so the
 * user can be auto-granted (see AUTO_GRANT_APPS on auth.ledesign.ai).
 */
export async function middleware(req: NextRequest) {
  const secret = process.env.LEDESIGN_JWT_SECRET;
  const payload = secret ? await getSsoPayloadFromRequest(req, secret) : null;
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
    // Authenticated app surfaces only — landing + static + public API pass through.
    '/home',
    '/home/:path*',
    '/tales/home',
    '/tales/home/:path*',
    '/tales/play',
    '/tales/play/:path*',
    '/tales/music',
    '/tales/music/:path*',
    '/tales/characters',
    '/tales/characters/:path*',
    '/tales/research',
    '/tales/research/:path*',
    '/tales/community',
    '/tales/community/:path*',
    '/tales/store',
    '/tales/store/:path*',
    '/tales/settings',
    '/tales/settings/:path*',
    '/tales/admin',
    '/tales/admin/:path*',
    '/tales/book/:path*',
    '/book',
    '/book/:path*',
  ],
};
