import { NextResponse } from 'next/server';

const AUTH_ORIGIN = process.env.LEDESIGN_AUTH_ORIGIN ?? 'https://auth.ledesign.ai';

/**
 * Thin proxy. The shared .ledesign.ai cookie can only be cleared from
 * auth.ledesign.ai (the origin that set it), so we delegate — but pass
 * ?redirect=<own-origin> so the user ends back on our landing.
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
