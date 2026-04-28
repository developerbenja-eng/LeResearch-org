import { NextResponse } from 'next/server';
import { readSsoSession } from '@ledesign-ai/identity/server';

const APP_ID = process.env.LEDESIGN_APP_ID ?? 'echo-tales';

export const dynamic = 'force-dynamic';

export async function GET() {
  const payload = await readSsoSession();
  if (!payload) {
    return NextResponse.json({ user: null }, { headers: { 'Cache-Control': 'no-store' } });
  }
  const role = payload.roles[APP_ID] ?? 'user';
  return NextResponse.json(
    {
      user: {
        id: payload.userId,
        email: payload.email,
        name: payload.name ?? null,
        role,
        email_verified: true,
      },
      apps: payload.apps,
      roles: payload.roles,
      hasAppAccess: payload.apps.includes(APP_ID),
    },
    { headers: { 'Cache-Control': 'no-store' } },
  );
}
