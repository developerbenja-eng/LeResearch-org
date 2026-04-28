/**
 * Character Variations API
 * GET /api/characters/[id]/variations - Get all variations
 * POST /api/characters/[id]/variations - Create new variation
 */

import { NextRequest, NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from '@/lib/auth/middleware';
import {
  getCharacterVariations,
  createVariation,
  getNextAvailableSlot,
} from '@/lib/db/variations';
import { getCharacterById } from '@/lib/db/characters';
import { CreateVariationInput, VARIATION_TYPES } from '@/types/character-variation';

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * GET - Fetch all variations for a character
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

      const { searchParams } = new URL(req.url);
      const includeInactive = searchParams.get('includeInactive') === 'true';

      const variations = await getCharacterVariations(characterId, { includeInactive });
      const nextSlot = await getNextAvailableSlot(characterId);

      return NextResponse.json({
        success: true,
        variations,
        availableSlots: nextSlot !== null ? 9 - variations.length : 0,
        nextAvailableSlot: nextSlot,
        variationTypes: VARIATION_TYPES,
      });
    } catch (error) {
      console.error('[Variations API] GET error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch variations', message: error instanceof Error ? error.message : 'Unknown error' },
        { status: 500 }
      );
    }
  });
}

/**
 * POST - Create a new variation
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

      // Check if slots available
      const nextSlot = await getNextAvailableSlot(characterId);
      if (nextSlot === null) {
        return NextResponse.json(
          { error: 'All 9 variation slots are full' },
          { status: 400 }
        );
      }

      const body = await req.json();
      const input: CreateVariationInput = {
        variation_name: body.variation_name,
        variation_slot: body.variation_slot,
        source_type: body.source_type || 'ai_generated',
        source_vacation_book_id: body.source_vacation_book_id,
        source_photo_url: body.source_photo_url,
        outfit_description: body.outfit_description,
        outfit_top: body.outfit_top,
        outfit_bottom: body.outfit_bottom,
        outfit_shoes: body.outfit_shoes,
        outfit_accessories: body.outfit_accessories,
        outfit_colors: body.outfit_colors,
        outfit_style: body.outfit_style,
        reference_image_url: body.reference_image_url,
      };

      // Validate variation_name
      const validType = VARIATION_TYPES.find((t) => t.id === input.variation_name);
      if (!validType) {
        return NextResponse.json(
          {
            error: 'Invalid variation type',
            validTypes: VARIATION_TYPES.map((t) => ({ id: t.id, name: t.name })),
          },
          { status: 400 }
        );
      }

      const variation = await createVariation(characterId, input);

      return NextResponse.json({
        success: true,
        variation,
      });
    } catch (error) {
      console.error('[Variations API] POST error:', error);
      return NextResponse.json(
        { error: 'Failed to create variation', message: error instanceof Error ? error.message : 'Unknown error' },
        { status: 500 }
      );
    }
  });
}
