import { NextRequest, NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from '@/lib/auth/middleware';
import { createCharacterIllustration } from '@/lib/ai/gemini-image';
import { validateCharacterImage } from '@/lib/ai/gemini';
import { processUploadedImage } from '@/lib/image/processor';
import { cropCharacterAvatar } from '@/lib/image/background-remover';
import {
  uploadImage,
  generateCharacterOriginalPath,
} from '@/lib/storage/gcs';
import { generateId } from '@/lib/utils';
import { CharacterType } from '@/types';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

interface GenerateBody {
  photoBase64?: string;
  character_name: string;
  character_type?: CharacterType;
  age?: number;
  gender?: string;
  personality_traits?: string;
  physical_description?: string;
}

/**
 * POST /api/characters/generate
 *
 * Generate a character illustration preview WITHOUT saving to DB.
 * Returns the illustration as base64 for the client to preview.
 * The original photo is uploaded to GCS early (it won't change across regenerations).
 */
export async function POST(request: NextRequest) {
  return withAuth(request, async (req: AuthenticatedRequest) => {
    const startTime = Date.now();

    try {
      const body: GenerateBody = await req.json();

      const {
        photoBase64,
        character_name,
        character_type = 'main',
        age,
        gender,
        personality_traits,
        physical_description,
      } = body;

      if (!character_name || character_name.trim().length < 2) {
        return NextResponse.json(
          { error: 'Character name is required (minimum 2 characters)' },
          { status: 400 }
        );
      }

      console.log(`[Character Generate] Starting preview for: ${character_name}`);

      const characterId = generateId();
      let originalPhotoUrl: string | undefined;
      let processedPhotoBase64: string | undefined;

      // Step 1: Process and upload original photo (if provided)
      if (photoBase64) {
        console.log('[Character Generate] Step 1: Processing uploaded photo...');

        try {
          const processed = await processUploadedImage(photoBase64);
          processedPhotoBase64 = processed.base64;

          console.log(
            `[Character Generate] Photo processed: ${processed.width}x${processed.height}, ${(processed.processedSize / 1024).toFixed(1)}KB`
          );

          // Upload original to GCS (won't change across regenerations)
          const originalPath = generateCharacterOriginalPath(req.user.userId, characterId);
          const uploadResult = await uploadImage(processed.buffer, originalPath, {
            characterId,
            userId: req.user.userId,
            type: 'original',
          });

          originalPhotoUrl = uploadResult.publicUrl;
          console.log(`[Character Generate] Original photo uploaded: ${originalPhotoUrl}`);
        } catch (error) {
          console.error('[Character Generate] Error processing photo:', error);
          return NextResponse.json(
            { error: 'Failed to process uploaded photo' },
            { status: 400 }
          );
        }

        // Validate the image contains a person/character
        console.log('[Character Generate] Validating image content...');
        const validation = await validateCharacterImage(photoBase64);
        if (!validation.valid) {
          console.log(`[Character Generate] Image rejected: ${validation.reason}`);
          return NextResponse.json(
            {
              error: validation.reason || 'This image doesn\'t appear to contain a person or character.',
              code: 'INVALID_CHARACTER_IMAGE',
            },
            { status: 400 }
          );
        }
      }

      // Step 2: Generate AI illustration
      console.log('[Character Generate] Step 2: Generating AI illustration...');

      const illustrationResult = await createCharacterIllustration(
        {
          name: character_name,
          age,
          gender: gender || undefined,
          visualDescription: physical_description || undefined,
          personality: personality_traits || undefined,
          characterType: character_type,
        },
        processedPhotoBase64
      );

      console.log('[Character Generate] AI illustration generated');

      // Step 3: Crop background
      console.log('[Character Generate] Step 3: Cropping background...');

      const imageBuffer = Buffer.from(illustrationResult.imageBase64, 'base64');
      const croppedResult = await cropCharacterAvatar(imageBuffer);

      console.log(
        `[Character Generate] Background cropped: ${croppedResult.width}x${croppedResult.height}`
      );

      const duration = ((Date.now() - startTime) / 1000).toFixed(1);
      console.log(`[Character Generate] Preview ready in ${duration}s`);

      // Return base64 for client preview — NO DB record, NO illustration GCS upload
      return NextResponse.json({
        success: true,
        data: {
          illustrationBase64: croppedResult.buffer.toString('base64'),
          originalPhotoUrl,
          optimizedPrompt: illustrationResult.optimizedPrompt,
          timing: { totalSeconds: parseFloat(duration) },
        },
      });
    } catch (error) {
      console.error('[Character Generate] Unexpected error:', error);
      return NextResponse.json(
        {
          error: 'Failed to generate character illustration',
          details: (error as Error).message,
        },
        { status: 500 }
      );
    }
  });
}
