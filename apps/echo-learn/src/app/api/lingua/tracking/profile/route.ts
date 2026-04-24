/**
 * API Route: /api/lingua/tracking/profile
 *
 * Retrieves and calculates learning profiles
 * GET - Get user's learning profile
 * POST - Recalculate learning profile
 */

import { NextRequest, NextResponse } from 'next/server';
import { withOptionalAuth, OptionalAuthRequest } from '@/lib/auth/middleware';
import { calculateLearningProfile, getLearningProfile } from '@/lib/lingua/tracking/analyzer';

export async function GET(request: NextRequest) {
  return withOptionalAuth(request, async (req: OptionalAuthRequest) => {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId') || req.user?.userId;

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // Get existing profile
    const profile = await getLearningProfile(userId);

    if (!profile) {
      return NextResponse.json(
        {
          error: 'No learning profile found',
          message: 'User needs at least 3 sessions before profile can be calculated',
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      profile,
    });
  } catch (error) {
    console.error('[API] Profile retrieval error:', error);
    return NextResponse.json(
      {
        error: 'Failed to retrieve learning profile',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
  });
}

export async function POST(request: NextRequest) {
  return withOptionalAuth(request, async (req: OptionalAuthRequest) => {
  try {
    const body = await req.json();
    const { userId, forceRecalculate } = body;

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // Check if profile exists and was recently calculated
    if (!forceRecalculate) {
      const existingProfile = await getLearningProfile(userId);

      if (existingProfile) {
        const calculatedAt = new Date(existingProfile.calculatedAt);
        const hoursSinceCalculation = (Date.now() - calculatedAt.getTime()) / 1000 / 60 / 60;

        // Don't recalculate if less than 24 hours old
        if (hoursSinceCalculation < 24) {
          return NextResponse.json({
            success: true,
            profile: existingProfile,
            message: 'Using cached profile (less than 24 hours old)',
          });
        }
      }
    }

    // Calculate new profile
    const profile = await calculateLearningProfile(userId);

    return NextResponse.json({
      success: true,
      profile,
      message: 'Learning profile calculated',
    });
  } catch (error) {
    console.error('[API] Profile calculation error:', error);
    return NextResponse.json(
      {
        error: 'Failed to calculate learning profile',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
  });
}
