/**
 * Single Variation API
 * GET /api/characters/[id]/variations/[variationId] - Get variation
 * PATCH /api/characters/[id]/variations/[variationId] - Update variation
 * DELETE /api/characters/[id]/variations/[variationId] - Delete variation
 */

import { NextRequest, NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from '@/lib/auth/middleware';
import {
  getVariationById,
  updateVariation,
  deleteVariation,
  setMainVariation,
  swapVariationSlots,
  incrementVariationUsage,
} from '@/lib/db/variations';
import { getCharacterById } from '@/lib/db/characters';
import { UpdateVariationInput } from '@/types/character-variation';

interface RouteContext {
  params: Promise<{ id: string; variationId: string }>;
}

/**
 * GET - Fetch a single variation
 */
export async function GET(request: NextRequest, context: RouteContext) {
  return withAuth(request, async (req: AuthenticatedRequest) => {
    try {
      const { id: characterId, variationId } = await context.params;

      // Verify character belongs to user
      const character = await getCharacterById(characterId);
      if (!character || character.user_id !== req.user.userId) {
        return NextResponse.json({ error: 'Character not found' }, { status: 404 });
      }

      const variation = await getVariationById(variationId);
      if (!variation || variation.character_id !== characterId) {
        return NextResponse.json({ error: 'Variation not found' }, { status: 404 });
      }

      return NextResponse.json({
        success: true,
        variation,
      });
    } catch (error) {
      console.error('[Variation API] GET error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch variation', message: error instanceof Error ? error.message : 'Unknown error' },
        { status: 500 }
      );
    }
  });
}

/**
 * PATCH - Update a variation
 */
export async function PATCH(request: NextRequest, context: RouteContext) {
  return withAuth(request, async (req: AuthenticatedRequest) => {
    try {
      const { id: characterId, variationId } = await context.params;

      // Verify character belongs to user
      const character = await getCharacterById(characterId);
      if (!character || character.user_id !== req.user.userId) {
        return NextResponse.json({ error: 'Character not found' }, { status: 404 });
      }

      const variation = await getVariationById(variationId);
      if (!variation || variation.character_id !== characterId) {
        return NextResponse.json({ error: 'Variation not found' }, { status: 404 });
      }

      const body = await req.json();

      // Handle special actions
      if (body.action === 'set_main') {
        const success = await setMainVariation(characterId, variationId);
        return NextResponse.json({ success });
      }

      if (body.action === 'swap_slot' && typeof body.targetSlot === 'number') {
        const success = await swapVariationSlots(characterId, variation.variation_slot, body.targetSlot);
        return NextResponse.json({ success });
      }

      if (body.action === 'increment_usage') {
        await incrementVariationUsage(variationId);
        return NextResponse.json({ success: true });
      }

      // Regular update
      const updates: UpdateVariationInput = {};
      const allowedFields: (keyof UpdateVariationInput)[] = [
        'variation_name',
        'outfit_description',
        'outfit_top',
        'outfit_bottom',
        'outfit_shoes',
        'outfit_accessories',
        'outfit_colors',
        'outfit_style',
        'reference_image_url',
        'tags',
        'is_active',
      ];

      for (const field of allowedFields) {
        if (body[field] !== undefined) {
          (updates as Record<string, unknown>)[field] = body[field];
        }
      }

      const updatedVariation = await updateVariation(variationId, updates);

      return NextResponse.json({
        success: true,
        variation: updatedVariation,
      });
    } catch (error) {
      console.error('[Variation API] PATCH error:', error);
      return NextResponse.json(
        { error: 'Failed to update variation', message: error instanceof Error ? error.message : 'Unknown error' },
        { status: 500 }
      );
    }
  });
}

/**
 * DELETE - Soft delete a variation
 */
export async function DELETE(request: NextRequest, context: RouteContext) {
  return withAuth(request, async (req: AuthenticatedRequest) => {
    try {
      const { id: characterId, variationId } = await context.params;

      // Verify character belongs to user
      const character = await getCharacterById(characterId);
      if (!character || character.user_id !== req.user.userId) {
        return NextResponse.json({ error: 'Character not found' }, { status: 404 });
      }

      const variation = await getVariationById(variationId);
      if (!variation || variation.character_id !== characterId) {
        return NextResponse.json({ error: 'Variation not found' }, { status: 404 });
      }

      const success = await deleteVariation(variationId);

      return NextResponse.json({ success });
    } catch (error) {
      console.error('[Variation API] DELETE error:', error);
      return NextResponse.json(
        { error: 'Failed to delete variation', message: error instanceof Error ? error.message : 'Unknown error' },
        { status: 500 }
      );
    }
  });
}
