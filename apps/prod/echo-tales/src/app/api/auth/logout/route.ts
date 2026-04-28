import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const AUTH_ORIGIN = process.env.LEDESIGN_AUTH_ORIGIN ?? 'https://auth.ledesign.ai';

/**
 * The shared .ledesign.ai cookie can only be cleared from auth.ledesign.ai.
 * We proxy there with ?redirect=<own-origin> so the user lands back on
 * our landing instead of the auth origin.
 */
function targetFor(request: Request): string {
  const selfOrigin = new URL(request.url).origin;
  const t = new URL('/api/auth/logout', AUTH_ORIGIN);
  t.searchParams.set('redirect', `${selfOrigin}/`);
  return t.toString();
}

export async function POST(request: Request) {
  return NextResponse.redirect(targetFor(request), 303);
}

export async function GET(request: Request) {
  return NextResponse.redirect(targetFor(request), 303);
}
