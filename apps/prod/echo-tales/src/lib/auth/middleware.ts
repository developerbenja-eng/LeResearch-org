import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { SSO_COOKIE_NAME } from '@ledesign-ai/identity';
import { verifyToken, extractTokenFromHeader } from './jwt';
import type { AuthTokenPayload, User } from '@/types';

const APP_ID = process.env.LEDESIGN_APP_ID ?? 'echo-tales';

export interface AuthenticatedRequest extends NextRequest {
  user: AuthTokenPayload;
  dbUser?: User;
}

async function readToken(request: NextRequest): Promise<string | null> {
  const store = await cookies();
  const fromCookie = store.get(SSO_COOKIE_NAME)?.value;
  if (fromCookie) return fromCookie;
  return extractTokenFromHeader(request.headers.get('Authorization'));
}

export async function withAuth(
  request: NextRequest,
  handler: (req: AuthenticatedRequest) => Promise<NextResponse>,
): Promise<NextResponse> {
  const token = await readToken(request);
  if (!token) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }
  const payload = verifyToken(token);
  if (!payload) {
    return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
  }
  // Extract apps[] from the raw JWT to enforce app-access here.
  const apps = ((payload as unknown) as { apps?: string[] }).apps ?? [];
  if (!apps.includes(APP_ID)) {
    return NextResponse.json({ error: 'This account is not granted access to this app.' }, { status: 403 });
  }
  const authRequest = request as AuthenticatedRequest;
  authRequest.user = payload;
  return handler(authRequest);
}

export async function withAdminAuth(
  request: NextRequest,
  handler: (req: AuthenticatedRequest) => Promise<NextResponse>,
): Promise<NextResponse> {
  return withAuth(request, async (req) => {
    if (!['admin', 'owner'].includes(req.user.role)) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }
    return handler(req);
  });
}

export async function withOwnerAuth(
  request: NextRequest,
  handler: (req: AuthenticatedRequest) => Promise<NextResponse>,
): Promise<NextResponse> {
  return withAuth(request, async (req) => {
    if (req.user.role !== 'owner') {
      return NextResponse.json({ error: 'Owner access required' }, { status: 403 });
    }
    return handler(req);
  });
}

export interface OptionalAuthRequest extends NextRequest {
  user: AuthTokenPayload | null;
}

export async function withOptionalAuth(
  request: NextRequest,
  handler: (req: OptionalAuthRequest) => Promise<NextResponse>,
): Promise<NextResponse> {
  const token = await readToken(request);
  const optionalRequest = request as OptionalAuthRequest;
  optionalRequest.user = token ? verifyToken(token) : null;
  return handler(optionalRequest);
}

export async function getAuthenticatedUser(
  request: NextRequest,
): Promise<AuthTokenPayload | null> {
  const token = await readToken(request);
  if (!token) return null;
  return verifyToken(token);
}
