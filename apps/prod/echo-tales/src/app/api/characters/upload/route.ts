import { NextRequest, NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from '@/lib/auth/middleware';
import { createCharacterWithImages } from '@/lib/db/characters';
import { createCharacterIllustration } from '@/lib/ai/gemini-image';
import { validateCharacterImage } from '@/lib/ai/gemini';
import { processUploadedImage } from '@/lib/image/processor';
import { cropCharacterAvatar } from '@/lib/image/background-remover';
import {
  uploadImage,
  generateCharacterOriginalPath,
  generateCharacterReferencePath,
} from '@/lib/storage/gcs';
import { generateId } from '@/lib/utils';
import { CharacterType } from '@/types';

export const dynamic = 'force-dynamic';
export const maxDuration = 60; // Allow up to 60 seconds for AI generation

interface CharacterUploadBody {
  // Photo data (base64 with data URL prefix)
  photoBase64?: string;

  // Character details
  character_name: string;
  character_type?: CharacterType;
  age?: number;
  gender?: string;
  personality_traits?: string;
  physical_description?: string;

  // Optional custom prompt for regeneration
  customPrompt?: string;
}

/**
 * POST /api/characters/upload
 *
 * Create a new character with photo upload and AI illustration generation.
 *
 * Flow:
 * 1. Validate input
 * 2. Process uploaded photo (if provided)
 * 3. Upload original photo to GCS
 * 4. Generate AI illustration with Gemini
 * 5. Crop background from illustration
 * 6. Upload illustration to GCS
 * 7. Create character record in database
 * 8. Return character with image URLs
 */
export async function POST(request: NextRequest) {
  return withAuth(request, async (req: AuthenticatedRequest) => {
    const startTime = Date.now();

    try {
      const body: CharacterUploadBody = await req.json();

      const {
        photoBase64,
        character_name,
        character_type = 'main',
        age,
        gender,
        personality_traits,
        physical_description,
        customPrompt,
      } = body;

      // Validate required fields
      if (!character_name || character_name.trim().length < 2) {
        return NextResponse.json(
          { error: 'Character name is required (minimum 2 characters)' },
          { status: 400 }
        );
      }

      console.log(`[Character Upload] Starting for: ${character_name}`);
      console.log(`[Character Upload] User: ${req.user.userId}`);
      console.log(`[Character Upload] Has photo: ${!!photoBase64}`);

      const characterId = generateId();
      let originalPhotoUrl: string | undefined;
      let referenceImageUrl: string | undefined;
      let processedPhotoBase64: string | undefined;

      // Step 1: Process and upload original photo (if provided)
      if (photoBase64) {
        console.log('[Character Upload] Step 1: Processing uploaded photo...');

        try {
          // Process the image (resize, compress, fix orientation)
          const processed = await processUploadedImage(photoBase64);
          processedPhotoBase64 = processed.base64;

          console.log(
            `[Character Upload] Photo processed: ${processed.width}x${processed.height}, ${(processed.processedSize / 1024).toFixed(1)}KB`
          );

          // Upload to GCS
          const originalPath = generateCharacterOriginalPath(req.user.userId, characterId);
          const uploadResult = await uploadImage(processed.buffer, originalPath, {
            characterId,
            userId: req.user.userId,
            type: 'original',
          });

          originalPhotoUrl = uploadResult.publicUrl;
          console.log(`[Character Upload] Original photo uploaded: ${originalPhotoUrl}`);
        } catch (error) {
          console.error('[Character Upload] Error processing photo:', error);
          return NextResponse.json(
            { error: 'Failed to process uploaded photo' },
            { status: 400 }
          );
        }

        // Step 1b: Validate the image contains a person/character
        console.log('[Character Upload] Step 1b: Validating image content...');
        const validation = await validateCharacterImage(photoBase64);
        if (!validation.valid) {
          console.log(`[Character Upload] Image rejected: ${validation.reason}`);
          return NextResponse.json(
            {
              error: validation.reason || 'This image doesn\'t appear to contain a person or character. Please upload a photo of the person or character you want to create.',
              code: 'INVALID_CHARACTER_IMAGE',
            },
            { status: 400 }
          );
        }
        console.log('[Character Upload] Image validated as character-appropriate');
      }

      // Step 2: Generate AI illustration
      console.log('[Character Upload] Step 2: Generating AI illustration...');

      try {
        const illustrationResult = await createCharacterIllustration(
          {
            name: character_name,
            age: age,
            gender: gender || undefined,
            visualDescription: physical_description || undefined,
            personality: personality_traits || undefined,
            characterType: character_type,
            customPrompt: customPrompt,
          },
          processedPhotoBase64 // Pass processed photo as reference
        );

        console.log('[Character Upload] AI illustration generated');

        // Step 3: Crop background from illustration
        console.log('[Character Upload] Step 3: Cropping background...');

        const imageBuffer = Buffer.from(illustrationResult.imageBase64, 'base64');
        const croppedResult = await cropCharacterAvatar(imageBuffer);

        console.log(
          `[Character Upload] Background cropped: ${croppedResult.width}x${croppedResult.height}`
        );

        // Step 4: Upload illustration to GCS
        console.log('[Character Upload] Step 4: Uploading illustration...');

        const referencePath = generateCharacterReferencePath(req.user.userId, characterId);
        const referenceUploadResult = await uploadImage(croppedResult.buffer, referencePath, {
          characterId,
          userId: req.user.userId,
          type: 'reference',
          model: illustrationResult.model,
        });

        referenceImageUrl = referenceUploadResult.publicUrl;
        console.log(`[Character Upload] Illustration uploaded: ${referenceImageUrl}`);
      } catch (error) {
        console.error('[Character Upload] Error generating illustration:', error);
        return NextResponse.json(
          {
            error: 'Failed to generate character illustration',
            details: (error as Error).message,
          },
          { status: 500 }
        );
      }

      // Step 5: Create character record in database
      console.log('[Character Upload] Step 5: Creating database record...');

      const character = await createCharacterWithImages(req.user.userId, {
        character_name,
        character_type,
        age: age ?? undefined,
        gender: gender ?? undefined,
        personality_traits: personality_traits ?? undefined,
        physical_description: physical_description ?? undefined,
        reference_image_url: referenceImageUrl,
        original_photo_url: originalPhotoUrl,
      });

      const duration = ((Date.now() - startTime) / 1000).toFixed(1);
      console.log(`[Character Upload] Complete in ${duration}s`);

      return NextResponse.json(
        {
          success: true,
          data: {
            character,
            timing: {
              totalSeconds: parseFloat(duration),
            },
          },
        },
        { status: 201 }
      );
    } catch (error) {
      console.error('[Character Upload] Unexpected error:', error);
      return NextResponse.json(
        {
          error: 'Failed to create character',
          details: (error as Error).message,
        },
        { status: 500 }
      );
    }
  });
}
