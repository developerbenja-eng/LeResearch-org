import { NextRequest, NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from '@/lib/auth/middleware';
import { getCharacterById } from '@/lib/db/characters';
import { createVariation } from '@/lib/db/variations';
import { generateVariationImage } from '@/lib/ai/gemini-image';
import { cropCharacterAvatar } from '@/lib/image/background-remover';
import { uploadImage, generateVariationPath } from '@/lib/storage/gcs';
import { VARIATION_TYPES } from '@/types/character-variation';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

interface GenerateVariationBody {
  variation_name: string;
  outfit_description?: string;
}

/**
 * POST /api/characters/[id]/variations/generate
 *
 * Generate an AI outfit variation for an existing character.
 * Uses the character's reference illustration to maintain visual consistency.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAuth(request, async (req: AuthenticatedRequest) => {
    const { id: characterId } = await params;

    try {
      // Verify character exists and belongs to user
      const character = await getCharacterById(characterId);
      if (!character || character.user_id !== req.user.userId) {
        return NextResponse.json({ error: 'Character not found' }, { status: 404 });
      }

      if (!character.reference_image_url) {
        return NextResponse.json(
          { error: 'Character has no reference image for variation generation' },
          { status: 400 }
        );
      }

      const body: GenerateVariationBody = await req.json();
      const { variation_name, outfit_description } = body;

      // Validate variation name
      const variationType = VARIATION_TYPES.find((t) => t.id === variation_name);
      if (!variationType) {
        return NextResponse.json(
          { error: `Invalid variation name. Must be one of: ${VARIATION_TYPES.map((t) => t.id).join(', ')}` },
          { status: 400 }
        );
      }

      console.log(`[Variation Generate] ${variation_name} for ${character.character_name}`);

      // Download reference image
      const refRes = await fetch(character.reference_image_url);
      if (!refRes.ok) {
        return NextResponse.json({ error: 'Failed to fetch character reference image' }, { status: 500 });
      }
      const refBuffer = Buffer.from(await refRes.arrayBuffer());
      const referenceBase64 = refBuffer.toString('base64');

      // Build outfit prompt
      const prompt = outfit_description || `${character.character_name} wearing ${variationType.name.toLowerCase()} outfit — ${variationType.description.toLowerCase()}.`;

      // Generate variation image
      const rawBase64 = await generateVariationImage(referenceBase64, prompt);

      // Crop background
      const imageBuffer = Buffer.from(rawBase64, 'base64');
      const cropped = await cropCharacterAvatar(imageBuffer);

      // Upload to GCS
      const path = generateVariationPath(req.user.userId, characterId, variation_name);
      const uploadResult = await uploadImage(cropped.buffer, path, {
        characterId,
        userId: req.user.userId,
        type: 'variation',
        variationName: variation_name,
      });

      // Create DB record
      const variation = await createVariation(characterId, {
        variation_name,
        source_type: 'ai_generated',
        reference_image_url: uploadResult.publicUrl,
        outfit_description: prompt,
      });

      console.log(`[Variation Generate] Success: ${uploadResult.publicUrl}`);

      return NextResponse.json({
        success: true,
        data: { variation },
      }, { status: 201 });
    } catch (error) {
      console.error('[Variation Generate] Error:', error);
      return NextResponse.json(
        { error: 'Failed to generate variation', details: (error as Error).message },
        { status: 500 }
      );
    }
  });
}
