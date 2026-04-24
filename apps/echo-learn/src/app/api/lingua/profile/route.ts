import { NextRequest, NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from '@/lib/auth/middleware';
import {
  getLinguaProfileByMainUserId,
  createLinguaProfile,
  updateLinguaProfile,
} from '@/lib/lingua/db';
import { runLinguaMigrations } from '@/lib/lingua/migrations';
import { LinguaLanguage } from '@/types/lingua';

// Flag to track if migrations have run
let migrationsRun = false;

/**
 * GET /api/lingua/profile
 * Get current user's Lingua profile
 */
export async function GET(request: NextRequest) {
  return withAuth(request, async (req: AuthenticatedRequest) => {
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

      const mainUserId = req.user.userId;
      const profile = await getLinguaProfileByMainUserId(mainUserId);

      if (!profile) {
        return NextResponse.json(
          {
            hasProfile: false,
            message: 'No Lingua profile found. Please create one.',
          },
          { status: 200 }
        );
      }

      return NextResponse.json({
        hasProfile: true,
        profile: {
          id: profile.id,
          name: profile.name,
          nativeLanguage: profile.native_language,
          targetLanguage: profile.target_language,
          currentStreak: profile.current_streak,
          longestStreak: profile.longest_streak,
          lastActivityDate: profile.last_activity_date,
          avatarUrl: profile.avatar_url,
          createdAt: profile.created_at,
        },
      });
    } catch (error) {
      console.error('Error fetching profile:', error);
      return NextResponse.json(
        { error: 'Failed to fetch profile' },
        { status: 500 }
      );
    }
  });
}

/**
 * POST /api/lingua/profile
 * Create a new Lingua profile for the logged-in user
 */
export async function POST(request: NextRequest) {
  return withAuth(request, async (req: AuthenticatedRequest) => {
    try {
      // Run migrations if not yet run
      if (!migrationsRun) {
        try {
          await runLinguaMigrations();
          migrationsRun = true;
        } catch (error) {
          console.error('Migration error:', error);
        }
      }

      const mainUserId = req.user.userId;

      // Check if profile already exists
      const existingProfile = await getLinguaProfileByMainUserId(mainUserId);
      if (existingProfile) {
        return NextResponse.json(
          { error: 'Profile already exists', profile: existingProfile },
          { status: 400 }
        );
      }

      const body = await request.json();
      const { name, nativeLanguage, targetLanguage, avatarUrl } = body as {
        name: string;
        nativeLanguage: LinguaLanguage;
        targetLanguage: LinguaLanguage;
        avatarUrl?: string;
      };

      // Validate required fields
      if (!name || !nativeLanguage || !targetLanguage) {
        return NextResponse.json(
          { error: 'Name, native language, and target language are required' },
          { status: 400 }
        );
      }

      // Validate languages
      const validLanguages: LinguaLanguage[] = ['en', 'es'];
      if (!validLanguages.includes(nativeLanguage) || !validLanguages.includes(targetLanguage)) {
        return NextResponse.json(
          { error: 'Invalid language. Must be "en" or "es"' },
          { status: 400 }
        );
      }

      // Validate native and target are different
      if (nativeLanguage === targetLanguage) {
        return NextResponse.json(
          { error: 'Native and target languages must be different' },
          { status: 400 }
        );
      }

      const profile = await createLinguaProfile(
        mainUserId,
        name,
        nativeLanguage,
        targetLanguage,
        avatarUrl
      );

      return NextResponse.json({
        success: true,
        profile: {
          id: profile.id,
          name: profile.name,
          nativeLanguage: profile.native_language,
          targetLanguage: profile.target_language,
          currentStreak: profile.current_streak,
          longestStreak: profile.longest_streak,
          avatarUrl: profile.avatar_url,
          createdAt: profile.created_at,
        },
      });
    } catch (error) {
      console.error('Error creating profile:', error);
      return NextResponse.json(
        { error: 'Failed to create profile' },
        { status: 500 }
      );
    }
  });
}

/**
 * PUT /api/lingua/profile
 * Update the current user's Lingua profile
 */
export async function PUT(request: NextRequest) {
  return withAuth(request, async (req: AuthenticatedRequest) => {
    try {
      const mainUserId = req.user.userId;

      // Get existing profile
      const existingProfile = await getLinguaProfileByMainUserId(mainUserId);
      if (!existingProfile) {
        return NextResponse.json(
          { error: 'Profile not found. Please create one first.' },
          { status: 404 }
        );
      }

      const body = await request.json();
      const { name, nativeLanguage, targetLanguage, avatarUrl } = body as {
        name?: string;
        nativeLanguage?: LinguaLanguage;
        targetLanguage?: LinguaLanguage;
        avatarUrl?: string;
      };

      // Validate languages if provided
      const validLanguages: LinguaLanguage[] = ['en', 'es'];
      if (nativeLanguage && !validLanguages.includes(nativeLanguage)) {
        return NextResponse.json(
          { error: 'Invalid native language. Must be "en" or "es"' },
          { status: 400 }
        );
      }
      if (targetLanguage && !validLanguages.includes(targetLanguage)) {
        return NextResponse.json(
          { error: 'Invalid target language. Must be "en" or "es"' },
          { status: 400 }
        );
      }

      // Validate native and target are different
      const finalNative = nativeLanguage || existingProfile.native_language;
      const finalTarget = targetLanguage || existingProfile.target_language;
      if (finalNative === finalTarget) {
        return NextResponse.json(
          { error: 'Native and target languages must be different' },
          { status: 400 }
        );
      }

      const updatedProfile = await updateLinguaProfile(existingProfile.id, {
        name,
        nativeLanguage,
        targetLanguage,
        avatarUrl,
      });

      if (!updatedProfile) {
        return NextResponse.json(
          { error: 'Failed to update profile' },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        profile: {
          id: updatedProfile.id,
          name: updatedProfile.name,
          nativeLanguage: updatedProfile.native_language,
          targetLanguage: updatedProfile.target_language,
          currentStreak: updatedProfile.current_streak,
          longestStreak: updatedProfile.longest_streak,
          avatarUrl: updatedProfile.avatar_url,
          updatedAt: updatedProfile.updated_at,
        },
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      return NextResponse.json(
        { error: 'Failed to update profile' },
        { status: 500 }
      );
    }
  });
}
