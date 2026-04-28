import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { LinguaSession, LinguaLanguage } from '@/types/lingua';
import { verifyToken } from '@/lib/auth/jwt';
import { AuthTokenPayload } from '@/types';

const LINGUA_COOKIE_NAME = 'lingua_session';
const AUTH_COOKIE_NAME = 'auth_token';
const COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

/**
 * Parse the Lingua session from cookie
 */
export function parseLinguaSession(cookieValue: string | undefined): LinguaSession | null {
  if (!cookieValue) return null;

  try {
    const session = JSON.parse(cookieValue) as LinguaSession;

    // Validate session structure
    if (
      !session.userId ||
      !session.name ||
      !session.nativeLang ||
      !session.targetLang ||
      !session.authenticatedAt
    ) {
      return null;
    }

    // Check if session is not too old (30 days)
    const sessionAge = Date.now() - session.authenticatedAt;
    if (sessionAge > COOKIE_MAX_AGE * 1000) {
      return null;
    }

    return session;
  } catch {
    return null;
  }
}

/**
 * Create a Lingua session cookie value
 */
export function createLinguaSession(
  userId: string,
  name: string,
  nativeLang: LinguaLanguage,
  targetLang: LinguaLanguage
): LinguaSession {
  return {
    userId,
    name,
    nativeLang,
    targetLang,
    authenticatedAt: Date.now(),
  };
}

/**
 * Set the Lingua session cookie on a response
 */
export function setLinguaSessionCookie(
  response: NextResponse,
  session: LinguaSession
): NextResponse {
  response.cookies.set(LINGUA_COOKIE_NAME, JSON.stringify(session), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: COOKIE_MAX_AGE,
    path: '/',
  });
  return response;
}

/**
 * Clear the Lingua session cookie
 */
export function clearLinguaSessionCookie(response: NextResponse): NextResponse {
  response.cookies.delete(LINGUA_COOKIE_NAME);
  return response;
}

/**
 * Get Lingua session from request cookies (for API routes)
 */
export function getLinguaSessionFromRequest(request: NextRequest): LinguaSession | null {
  const cookieValue = request.cookies.get(LINGUA_COOKIE_NAME)?.value;
  return parseLinguaSession(cookieValue);
}

/**
 * Get Lingua session from cookies (for server components)
 */
export async function getLinguaSession(): Promise<LinguaSession | null> {
  const cookieStore = await cookies();
  const cookieValue = cookieStore.get(LINGUA_COOKIE_NAME)?.value;
  return parseLinguaSession(cookieValue);
}

/**
 * Middleware wrapper for protected Lingua API routes
 * Supports both legacy cookie session and new JWT auth
 */
export async function withLinguaAuth(
  request: NextRequest,
  handler: (
    request: NextRequest,
    session: LinguaSession
  ) => Promise<NextResponse>
): Promise<NextResponse> {
  // First try the legacy lingua session cookie
  const legacySession = getLinguaSessionFromRequest(request);
  if (legacySession) {
    return handler(request, legacySession);
  }

  // Then try JWT auth from Echo-Home
  const jwtAuth = getEchoHomeAuthFromRequest(request);
  if (jwtAuth) {
    // Create a LinguaSession from JWT auth
    // Note: caller should fetch the actual lingua profile from DB
    const session: LinguaSession = {
      userId: jwtAuth.userId,
      name: jwtAuth.email.split('@')[0], // Use email prefix as fallback name
      nativeLang: 'en' as LinguaLanguage, // Default, should be fetched from profile
      targetLang: 'es' as LinguaLanguage, // Default, should be fetched from profile
      authenticatedAt: Date.now(),
      mainUserId: jwtAuth.userId, // Link to Echo-Home user
    };
    return handler(request, session);
  }

  return NextResponse.json(
    { error: 'Not authenticated' },
    { status: 401 }
  );
}

/**
 * Get Echo-Home JWT auth from request
 */
export function getEchoHomeAuthFromRequest(request: NextRequest): AuthTokenPayload | null {
  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  if (!token) return null;

  return verifyToken(token);
}

/**
 * Get Echo-Home JWT auth from cookies (for server components)
 */
export async function getEchoHomeAuth(): Promise<AuthTokenPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
  if (!token) return null;

  return verifyToken(token);
}

/**
 * Check if user is authenticated via Echo-Home (JWT) or legacy Lingua session
 */
export async function isAuthenticated(): Promise<boolean> {
  const echoHomeAuth = await getEchoHomeAuth();
  if (echoHomeAuth) return true;

  const linguaSession = await getLinguaSession();
  if (linguaSession) return true;

  return false;
}

/**
 * Get the main user ID (Echo-Home user ID) from either auth method
 */
export async function getMainUserId(): Promise<string | null> {
  const echoHomeAuth = await getEchoHomeAuth();
  if (echoHomeAuth) return echoHomeAuth.userId;

  const linguaSession = await getLinguaSession();
  if (linguaSession?.mainUserId) return linguaSession.mainUserId;

  return null;
}

// Legacy profiles kept for backward compatibility during migration
// These will be removed once all users are migrated to Echo-Home auth
export const LINGUA_PROFILES = {
  rosa: {
    id: 'rosa',
    name: 'Rosa',
    nativeLang: 'es' as LinguaLanguage,
    targetLang: 'en' as LinguaLanguage,
  },
  sarah: {
    id: 'sarah',
    name: 'Sarah',
    nativeLang: 'en' as LinguaLanguage,
    targetLang: 'es' as LinguaLanguage,
  },
} as const;

export type LinguaProfileId = keyof typeof LINGUA_PROFILES;
