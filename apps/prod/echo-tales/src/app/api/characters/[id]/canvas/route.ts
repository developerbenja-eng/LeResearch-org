/**
 * Character Canvas API
 * GET /api/characters/[id]/canvas - Get existing canvas
 * POST /api/characters/[id]/canvas - Generate new canvas
 */

import { NextRequest, NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from '@/lib/auth/middleware';
import {
  getCharacterVariations,
  getCharacterCanvas,
  upsertCharacterCanvas,
} from '@/lib/db/variations';
import { getCharacterById } from '@/lib/db/characters';
import { generateCharacterCanvas } from '@/lib/image/canvas-generator';
import { uploadImage, generateCanvasPath } from '@/lib/storage/gcs';

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * GET - Fetch existing canvas for a character
 */
export async function GET(request: NextRequest, context: RouteContext) {
  return withAuth(request, async (req: AuthenticatedRequest) => {
    try {
      const { id: characterId } = await context.params;

      // Verify character belongs to user
      const character = await getCharacterById(characterId);
      if (!character || character.user_id !== req.user.userId) {
        return NextResponse.json({ error: 'Character not found' }, { status: 404 });
      }

      const canvas = await getCharacterCanvas(characterId);
      const variations = await getCharacterVariations(characterId);

      return NextResponse.json({
        success: true,
        canvas,
        variationCount: variations.length,
        needsRegeneration: canvas ? canvas.variation_count !== variations.length : true,
      });
    } catch (error) {
      console.error('[Canvas API] GET error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch canvas', message: error instanceof Error ? error.message : 'Unknown error' },
        { status: 500 }
      );
    }
  });
}

/**
 * POST - Generate a new canvas for a character
 */
export async function POST(request: NextRequest, context: RouteContext) {
  return withAuth(request, async (req: AuthenticatedRequest) => {
    try {
      const { id: characterId } = await context.params;

      // Verify character belongs to user
      const character = await getCharacterById(characterId);
      if (!character || character.user_id !== req.user.userId) {
        return NextResponse.json({ error: 'Character not found' }, { status: 404 });
      }

      // Get all variations
      const variations = await getCharacterVariations(characterId);
      if (variations.length === 0) {
        return NextResponse.json(
          { error: 'No variations to include in canvas' },
          { status: 400 }
        );
      }

      // Generate the canvas image
      const canvasResult = await generateCharacterCanvas({
        characterName: character.character_name,
        variations,
      });

      // Upload to GCS
      const gcsPath = generateCanvasPath(req.user.userId, characterId);
      const uploadResult = await uploadImage(canvasResult.buffer, gcsPath, {
        characterId,
        variationCount: String(canvasResult.variationCount),
        generatedBy: 'canvas-generator',
      });

      // Save canvas record to database
      const canvas = await upsertCharacterCanvas(
        characterId,
        uploadResult.publicUrl,
        canvasResult.variationCount
      );

      return NextResponse.json({
        success: true,
        canvas,
        imageUrl: uploadResult.publicUrl,
        dimensions: {
          width: canvasResult.width,
          height: canvasResult.height,
        },
      });
    } catch (error) {
      console.error('[Canvas API] POST error:', error);
      return NextResponse.json(
        { error: 'Failed to generate canvas', message: error instanceof Error ? error.message : 'Unknown error' },
        { status: 500 }
      );
    }
  });
}
