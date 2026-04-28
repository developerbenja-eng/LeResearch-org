/**
 * Character Continuity API
 * GET /api/characters/continuity - Get all characters with their feature unlock status
 * POST /api/characters/continuity/unlock - Unlock a character for a feature
 */

import { NextRequest, NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from '@/lib/auth/middleware';
import {
  getUserCharactersWithContinuity,
  getCharacterContinuity,
  unlockCharacterFor,
  CharacterFeature,
  ensureCharacterSongColumns,
  initCharacterContinuityTables,
} from '@/lib/characters/continuity';
import { getCharacterById } from '@/lib/db/characters';

export const dynamic = 'force-dynamic';

// GET /api/characters/continuity - Get all characters with continuity data
export async function GET(request: NextRequest) {
  return withAuth(request, async (req: AuthenticatedRequest) => {
    try {
      // Ensure tables exist
      await initCharacterContinuityTables();
      await ensureCharacterSongColumns();

      const charactersWithContinuity = await getUserCharactersWithContinuity(req.user.userId);

      return NextResponse.json({
        success: true,
        characters: charactersWithContinuity.map((c) => ({
          ...c.character,
          unlockedFeatures: c.unlockedFeatures,
          hasLinguaProfile: c.hasLinguaProfile,
          hasMusicProfile: c.hasMusicProfile,
        })),
      });
    } catch (error) {
      console.error('Error fetching characters with continuity:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch characters' },
        { status: 500 }
      );
    }
  });
}

// POST /api/characters/continuity - Unlock a character for a feature
export async function POST(request: NextRequest) {
  return withAuth(request, async (req: AuthenticatedRequest) => {
    try {
      const body = await request.json();
      const { characterId, feature } = body;

      if (!characterId || !feature) {
        return NextResponse.json(
          { success: false, error: 'characterId and feature are required' },
          { status: 400 }
        );
      }

      // Validate feature type
      const validFeatures: CharacterFeature[] = ['stories', 'music', 'lingua'];
      if (!validFeatures.includes(feature)) {
        return NextResponse.json(
          { success: false, error: 'Invalid feature. Must be: stories, music, or lingua' },
          { status: 400 }
        );
      }

      // Verify character belongs to user
      const character = await getCharacterById(characterId);
      if (!character) {
        return NextResponse.json(
          { success: false, error: 'Character not found' },
          { status: 404 }
        );
      }

      if (character.user_id !== req.user.userId) {
        return NextResponse.json(
          { success: false, error: 'You do not have permission to modify this character' },
          { status: 403 }
        );
      }

      // Ensure tables exist
      await initCharacterContinuityTables();
      await ensureCharacterSongColumns();

      // Unlock the character for the feature
      await unlockCharacterFor(characterId, feature);

      // Get updated continuity data
      const continuity = await getCharacterContinuity(characterId);

      return NextResponse.json({
        success: true,
        message: `Character unlocked for ${feature}`,
        character: continuity,
      });
    } catch (error) {
      console.error('Error unlocking character:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to unlock character' },
        { status: 500 }
      );
    }
  });
}
