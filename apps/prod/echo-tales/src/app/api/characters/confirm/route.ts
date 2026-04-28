import { NextRequest, NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from '@/lib/auth/middleware';
import { createCharacterWithImages } from '@/lib/db/characters';
import { generateStarterVariations } from '@/lib/characters/auto-variations';
import {
  uploadImage,
  generateCharacterReferencePath,
} from '@/lib/storage/gcs';
import { generateId } from '@/lib/utils';
import { CharacterType } from '@/types';

export const dynamic = 'force-dynamic';

interface ConfirmBody {
  illustrationBase64: string;
  originalPhotoUrl?: string;
  character_name: string;
  character_type?: CharacterType;
  age?: number;
  gender?: string;
  personality_traits?: string;
  physical_description?: string;
  birthdate?: string;
  use_fixed_age?: boolean;
}

/**
 * POST /api/characters/confirm
 *
 * Save a previewed character: upload the chosen illustration to GCS
 * and create the database record.
 */
export async function POST(request: NextRequest) {
  return withAuth(request, async (req: AuthenticatedRequest) => {
    const startTime = Date.now();

    try {
      const body: ConfirmBody = await req.json();

      const {
        illustrationBase64,
        originalPhotoUrl,
        character_name,
        character_type = 'main',
        age,
        gender,
        personality_traits,
        physical_description,
        birthdate,
        use_fixed_age,
      } = body;

      if (!character_name || character_name.trim().length < 2) {
        return NextResponse.json(
          { error: 'Character name is required' },
          { status: 400 }
        );
      }

      if (!illustrationBase64) {
        return NextResponse.json(
          { error: 'Illustration data is required' },
          { status: 400 }
        );
      }

      console.log(`[Character Confirm] Saving: ${character_name}`);

      const characterId = generateId();

      // Upload illustration to GCS
      const illustrationBuffer = Buffer.from(illustrationBase64, 'base64');
      const referencePath = generateCharacterReferencePath(req.user.userId, characterId);
      const referenceUploadResult = await uploadImage(illustrationBuffer, referencePath, {
        characterId,
        userId: req.user.userId,
        type: 'reference',
      });

      const referenceImageUrl = referenceUploadResult.publicUrl;
      console.log(`[Character Confirm] Illustration uploaded: ${referenceImageUrl}`);

      // Create database record
      const character = await createCharacterWithImages(req.user.userId, {
        character_name,
        character_type,
        age: age ?? undefined,
        gender: gender ?? undefined,
        personality_traits: personality_traits ?? undefined,
        physical_description: physical_description ?? undefined,
        birthdate: birthdate ?? undefined,
        use_fixed_age: use_fixed_age ?? undefined,
        reference_image_url: referenceImageUrl,
        original_photo_url: originalPhotoUrl,
      });

      const duration = ((Date.now() - startTime) / 1000).toFixed(1);
      console.log(`[Character Confirm] Saved in ${duration}s`);

      // Fire-and-forget: generate starter outfit variations in background
      generateStarterVariations(character).catch((err) =>
        console.error('[Character Confirm] Auto-variation generation failed:', err)
      );

      return NextResponse.json(
        {
          success: true,
          data: {
            character,
            timing: { totalSeconds: parseFloat(duration) },
          },
        },
        { status: 201 }
      );
    } catch (error) {
      console.error('[Character Confirm] Unexpected error:', error);
      return NextResponse.json(
        {
          error: 'Failed to save character',
          details: (error as Error).message,
        },
        { status: 500 }
      );
    }
  });
}
