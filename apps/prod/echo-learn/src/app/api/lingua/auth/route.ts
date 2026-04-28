import { NextRequest, NextResponse } from 'next/server';
import {
  createLinguaSession,
  setLinguaSessionCookie,
  clearLinguaSessionCookie,
  getEchoHomeAuthFromRequest,
  LINGUA_PROFILES,
  LinguaProfileId,
} from '@/lib/lingua/middleware';
import {
  createLinguaUser,
  getLinguaUser,
  getLinguaProfileByMainUserId,
} from '@/lib/lingua/db';
import { runLinguaMigrations } from '@/lib/lingua/migrations';

const LINGUA_PASSWORD = process.env.LINGUA_PASSWORD || 'familia2026';

// Flag to track if migrations have run
let migrationsRun = false;

/**
 * POST /api/lingua/auth
 * Two modes:
 * 1. Legacy mode: Verify password and profile selection
 * 2. Echo-Home mode: Use JWT auth (no password needed)
 */
export async function POST(request: NextRequest) {
  try {
    // Run migrations if not yet run
    if (!migrationsRun) {
      try {
        await runLinguaMigrations();
        migrationsRun = true;
      } catch (error) {
        console.error('Migration error:', error);
        // Continue anyway - tables might already exist
      }
    }

    const body = await request.json();
    const { password, profile, useEchoHomeAuth } = body as {
      password?: string;
      profile?: LinguaProfileId;
      useEchoHomeAuth?: boolean;
    };

    // Mode 2: Echo-Home JWT auth (new flow)
    if (useEchoHomeAuth) {
      const echoHomeAuth = getEchoHomeAuthFromRequest(request);

      if (!echoHomeAuth) {
        return NextResponse.json(
          { error: 'Not authenticated with Echo-Home. Please log in first.' },
          { status: 401 }
        );
      }

      // Check if user has a Lingua profile
      const linguaProfile = await getLinguaProfileByMainUserId(echoHomeAuth.userId);

      if (!linguaProfile) {
        return NextResponse.json({
          success: true,
          needsProfileSetup: true,
          mainUserId: echoHomeAuth.userId,
          email: echoHomeAuth.email,
          message: 'Please set up your Lingua profile',
        });
      }

      // Create session from existing profile
      const session = createLinguaSession(
        linguaProfile.id,
        linguaProfile.name,
        linguaProfile.native_language,
        linguaProfile.target_language
      );

      // Add main user ID to session
      session.mainUserId = echoHomeAuth.userId;

      const response = NextResponse.json({
        success: true,
        user: {
          id: linguaProfile.id,
          mainUserId: echoHomeAuth.userId,
          name: linguaProfile.name,
          nativeLang: linguaProfile.native_language,
          targetLang: linguaProfile.target_language,
          currentStreak: linguaProfile.current_streak,
          longestStreak: linguaProfile.longest_streak,
          avatarUrl: linguaProfile.avatar_url,
        },
      });

      return setLinguaSessionCookie(response, session);
    }

    // Mode 1: Legacy password auth (for backward compatibility)
    if (!password) {
      return NextResponse.json(
        { error: 'Password is required for legacy auth' },
        { status: 400 }
      );
    }

    // Verify password
    if (password !== LINGUA_PASSWORD) {
      return NextResponse.json(
        { error: 'Invalid password' },
        { status: 401 }
      );
    }

    // Validate profile
    if (!profile || !LINGUA_PROFILES[profile]) {
      return NextResponse.json(
        { error: 'Invalid profile. Must be "rosa" or "sarah"' },
        { status: 400 }
      );
    }

    const profileData = LINGUA_PROFILES[profile];

    // Ensure user exists in database
    let user = await getLinguaUser(profileData.id);
    if (!user) {
      user = await createLinguaUser(
        profileData.id,
        profileData.name,
        profileData.nativeLang,
        profileData.targetLang
      );
    }

    // Create session
    const session = createLinguaSession(
      profileData.id,
      profileData.name,
      profileData.nativeLang,
      profileData.targetLang
    );

    // Create response with session cookie
    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        nativeLang: user.native_language,
        targetLang: user.target_language,
        currentStreak: user.current_streak,
        longestStreak: user.longest_streak,
      },
    });

    return setLinguaSessionCookie(response, session);
  } catch (error) {
    console.error('Auth error:', error);
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/lingua/auth
 * Logout - clear session cookie
 */
export async function DELETE() {
  const response = NextResponse.json({ success: true });
  return clearLinguaSessionCookie(response);
}

/**
 * GET /api/lingua/auth
 * Check current session (supports both legacy and Echo-Home auth)
 */
export async function GET(request: NextRequest) {
  const { getLinguaSessionFromRequest } = await import('@/lib/lingua/middleware');

  // Run migrations if not yet run
  if (!migrationsRun) {
    try {
      await runLinguaMigrations();
      migrationsRun = true;
    } catch (error) {
      console.error('Migration error:', error);
    }
  }

  // First try legacy session
  const legacySession = getLinguaSessionFromRequest(request);

  if (legacySession) {
    // Get fresh user data
    const user = await getLinguaUser(legacySession.userId);

    return NextResponse.json({
      authenticated: true,
      authMethod: 'legacy',
      user: user
        ? {
            id: user.id,
            name: user.name,
            nativeLang: user.native_language,
            targetLang: user.target_language,
            currentStreak: user.current_streak,
            longestStreak: user.longest_streak,
            mainUserId: user.main_user_id,
          }
        : null,
    });
  }

  // Then try Echo-Home JWT auth
  const echoHomeAuth = getEchoHomeAuthFromRequest(request);

  if (echoHomeAuth) {
    // Check if user has a Lingua profile
    const linguaProfile = await getLinguaProfileByMainUserId(echoHomeAuth.userId);

    if (linguaProfile) {
      return NextResponse.json({
        authenticated: true,
        authMethod: 'echoHome',
        user: {
          id: linguaProfile.id,
          mainUserId: echoHomeAuth.userId,
          name: linguaProfile.name,
          email: echoHomeAuth.email,
          nativeLang: linguaProfile.native_language,
          targetLang: linguaProfile.target_language,
          currentStreak: linguaProfile.current_streak,
          longestStreak: linguaProfile.longest_streak,
          avatarUrl: linguaProfile.avatar_url,
        },
      });
    } else {
      // User is authenticated with Echo-Home but needs to set up Lingua profile
      return NextResponse.json({
        authenticated: true,
        authMethod: 'echoHome',
        needsProfileSetup: true,
        mainUserId: echoHomeAuth.userId,
        email: echoHomeAuth.email,
        user: null,
      });
    }
  }

  return NextResponse.json(
    { authenticated: false },
    { status: 401 }
  );
}
