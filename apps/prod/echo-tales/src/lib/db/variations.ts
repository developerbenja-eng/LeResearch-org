/**
 * Character Variations Database Operations
 *
 * Handles CRUD for character outfit variations and canvases
 */

import { getBooksDb, query, queryOne, execute } from './turso';
import { generateId } from '@/lib/utils';
import {
  CharacterVariation,
  CharacterCanvas,
  CreateVariationInput,
  UpdateVariationInput,
  VariationType,
  VARIATION_TYPES,
} from '@/types/character-variation';

// ============================================================================
// VARIATION CRUD
// ============================================================================

/**
 * Get all variations for a character
 */
export async function getCharacterVariations(
  characterId: string,
  options: { includeInactive?: boolean } = {}
): Promise<CharacterVariation[]> {
  const db = getBooksDb();
  const { includeInactive = false } = options;

  let sql = `
    SELECT * FROM character_outfit_variations
    WHERE character_id = ?
  `;
  const args: (string | number | boolean)[] = [characterId];

  if (!includeInactive) {
    sql += ' AND is_active = ?';
    args.push(1);
  }

  sql += ' ORDER BY variation_slot ASC, created_at DESC';

  return query<CharacterVariation>(db, sql, args);
}

/**
 * Get a single variation by ID
 */
export async function getVariationById(
  variationId: string
): Promise<CharacterVariation | null> {
  const db = getBooksDb();
  return queryOne<CharacterVariation>(
    db,
    'SELECT * FROM character_outfit_variations WHERE id = ?',
    [variationId]
  );
}

/**
 * Get variation by character and slot
 */
export async function getVariationBySlot(
  characterId: string,
  slot: number
): Promise<CharacterVariation | null> {
  const db = getBooksDb();
  return queryOne<CharacterVariation>(
    db,
    `SELECT * FROM character_outfit_variations
     WHERE character_id = ? AND variation_slot = ? AND is_active = 1`,
    [characterId, slot]
  );
}

/**
 * Get the default (slot 1) variation for a character
 */
export async function getDefaultVariation(
  characterId: string
): Promise<CharacterVariation | null> {
  return getVariationBySlot(characterId, 1);
}

/**
 * Get next available slot for a character (1-9)
 */
export async function getNextAvailableSlot(
  characterId: string
): Promise<number | null> {
  const db = getBooksDb();
  const variations = await query<{ variation_slot: number }>(
    db,
    `SELECT variation_slot FROM character_outfit_variations
     WHERE character_id = ? AND is_active = 1
     ORDER BY variation_slot ASC`,
    [characterId]
  );

  const usedSlots = new Set(variations.map((v) => v.variation_slot));

  for (let slot = 1; slot <= 9; slot++) {
    if (!usedSlots.has(slot)) {
      return slot;
    }
  }

  return null; // All 9 slots are full
}

/**
 * Create a new variation
 */
export async function createVariation(
  characterId: string,
  input: CreateVariationInput
): Promise<CharacterVariation> {
  const db = getBooksDb();
  const id = generateId();
  const now = new Date().toISOString();

  // Get next available slot if not specified
  const slot = input.variation_slot ?? (await getNextAvailableSlot(characterId));
  if (slot === null) {
    throw new Error('All 9 variation slots are full');
  }

  // Get tags for this variation type
  const variationType = VARIATION_TYPES.find((t) => t.id === input.variation_name);
  const tags = variationType?.tags.join(',') || '';

  await execute(
    db,
    `INSERT INTO character_outfit_variations (
      id, character_id, variation_name, variation_slot,
      source_type, source_vacation_book_id, source_photo_url,
      outfit_description, outfit_top, outfit_bottom, outfit_shoes,
      outfit_accessories, outfit_colors, outfit_style,
      reference_image_url, tags, is_default, is_active,
      usage_count, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      characterId,
      input.variation_name,
      slot,
      input.source_type || 'ai_generated',
      input.source_vacation_book_id ?? null,
      input.source_photo_url ?? null,
      input.outfit_description ?? null,
      input.outfit_top ?? null,
      input.outfit_bottom ?? null,
      input.outfit_shoes ?? null,
      input.outfit_accessories ?? null,
      input.outfit_colors ?? null,
      input.outfit_style ?? null,
      input.reference_image_url ?? null,
      tags,
      slot === 1 ? 1 : 0, // First slot is default
      1, // is_active
      0, // usage_count
      now,
      now,
    ]
  );

  const variation = await getVariationById(id);
  if (!variation) {
    throw new Error('Failed to create variation');
  }

  return variation;
}

/**
 * Update a variation
 */
export async function updateVariation(
  variationId: string,
  updates: UpdateVariationInput
): Promise<CharacterVariation | null> {
  const db = getBooksDb();

  const existing = await getVariationById(variationId);
  if (!existing) {
    return null;
  }

  const updateFields: string[] = [];
  const args: (string | number | boolean | null)[] = [];

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
    if (updates[field] !== undefined) {
      updateFields.push(`${field} = ?`);
      args.push(updates[field] as string | number | boolean | null);
    }
  }

  if (updateFields.length === 0) {
    return existing;
  }

  updateFields.push('updated_at = ?');
  args.push(new Date().toISOString());
  args.push(variationId);

  await execute(
    db,
    `UPDATE character_outfit_variations SET ${updateFields.join(', ')} WHERE id = ?`,
    args
  );

  return getVariationById(variationId);
}

/**
 * Swap variation to a different slot
 */
export async function swapVariationSlots(
  characterId: string,
  fromSlot: number,
  toSlot: number
): Promise<boolean> {
  const db = getBooksDb();
  const now = new Date().toISOString();

  const fromVariation = await getVariationBySlot(characterId, fromSlot);
  const toVariation = await getVariationBySlot(characterId, toSlot);

  if (!fromVariation) {
    return false;
  }

  // If target slot is empty, just move the variation
  if (!toVariation) {
    await execute(
      db,
      `UPDATE character_outfit_variations
       SET variation_slot = ?, is_default = ?, updated_at = ?
       WHERE id = ?`,
      [toSlot, toSlot === 1 ? 1 : 0, now, fromVariation.id]
    );
    return true;
  }

  // Swap both variations
  await execute(
    db,
    `UPDATE character_outfit_variations
     SET variation_slot = ?, is_default = ?, updated_at = ?
     WHERE id = ?`,
    [toSlot, toSlot === 1 ? 1 : 0, now, fromVariation.id]
  );

  await execute(
    db,
    `UPDATE character_outfit_variations
     SET variation_slot = ?, is_default = ?, updated_at = ?
     WHERE id = ?`,
    [fromSlot, fromSlot === 1 ? 1 : 0, now, toVariation.id]
  );

  return true;
}

/**
 * Set a variation as the main/default (move to slot 1)
 */
export async function setMainVariation(
  characterId: string,
  variationId: string
): Promise<boolean> {
  const variation = await getVariationById(variationId);
  if (!variation || variation.character_id !== characterId) {
    return false;
  }

  return swapVariationSlots(characterId, variation.variation_slot, 1);
}

/**
 * Soft delete a variation
 */
export async function deleteVariation(
  variationId: string
): Promise<boolean> {
  const db = getBooksDb();

  const variation = await getVariationById(variationId);
  if (!variation) {
    return false;
  }

  // Soft delete
  await execute(
    db,
    `UPDATE character_outfit_variations
     SET is_active = 0, updated_at = ?
     WHERE id = ?`,
    [new Date().toISOString(), variationId]
  );

  // If this was slot 1, promote next variation to slot 1
  if (variation.variation_slot === 1) {
    const nextVariation = await queryOne<CharacterVariation>(
      db,
      `SELECT * FROM character_outfit_variations
       WHERE character_id = ? AND is_active = 1
       ORDER BY variation_slot ASC LIMIT 1`,
      [variation.character_id]
    );

    if (nextVariation) {
      await swapVariationSlots(variation.character_id, nextVariation.variation_slot, 1);
    }
  }

  return true;
}

/**
 * Increment usage count for a variation
 */
export async function incrementVariationUsage(
  variationId: string
): Promise<void> {
  const db = getBooksDb();
  await execute(
    db,
    `UPDATE character_outfit_variations
     SET usage_count = usage_count + 1, updated_at = ?
     WHERE id = ?`,
    [new Date().toISOString(), variationId]
  );
}

// ============================================================================
// CANVAS OPERATIONS
// ============================================================================

/**
 * Get canvas for a character
 */
export async function getCharacterCanvas(
  characterId: string
): Promise<CharacterCanvas | null> {
  const db = getBooksDb();
  return queryOne<CharacterCanvas>(
    db,
    'SELECT * FROM character_canvases WHERE character_id = ?',
    [characterId]
  );
}

/**
 * Create or update character canvas
 */
export async function upsertCharacterCanvas(
  characterId: string,
  canvasUrl: string,
  variationCount: number
): Promise<CharacterCanvas> {
  const db = getBooksDb();
  const now = new Date().toISOString();

  const existing = await getCharacterCanvas(characterId);

  if (existing) {
    await execute(
      db,
      `UPDATE character_canvases
       SET canvas_url = ?, variation_count = ?, generated_at = ?, updated_at = ?
       WHERE character_id = ?`,
      [canvasUrl, variationCount, now, now, characterId]
    );
  } else {
    const id = generateId();
    await execute(
      db,
      `INSERT INTO character_canvases (
        id, character_id, canvas_url, variation_count,
        canvas_width, canvas_height, generated_at, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, characterId, canvasUrl, variationCount, 1800, 2400, now, now, now]
    );
  }

  const canvas = await getCharacterCanvas(characterId);
  if (!canvas) {
    throw new Error('Failed to create/update canvas');
  }

  return canvas;
}

/**
 * Delete character canvas
 */
export async function deleteCharacterCanvas(
  characterId: string
): Promise<boolean> {
  const db = getBooksDb();
  await execute(
    db,
    'DELETE FROM character_canvases WHERE character_id = ?',
    [characterId]
  );
  return true;
}

// ============================================================================
// SMART VARIATION SELECTION
// ============================================================================

/**
 * Find the best variation for a story theme
 */
export async function selectVariationForTheme(
  characterId: string,
  theme: string
): Promise<CharacterVariation | null> {
  const variations = await getCharacterVariations(characterId);
  if (variations.length === 0) return null;

  // Theme to tag mapping
  const themeTagMap: Record<string, string[]> = {
    bedtime: ['bedtime', 'nighttime', 'indoor', 'pajamas'],
    adventure: ['outdoor', 'active', 'play', 'summer'],
    friendship: ['play', 'outdoor', 'casual'],
    kindness: ['casual', 'play', 'indoor'],
    bravery: ['active', 'sports', 'outdoor'],
    creativity: ['play', 'indoor', 'casual'],
    nature: ['outdoor', 'summer', 'active'],
    family: ['indoor', 'casual', 'formal'],
    learning: ['school', 'learning', 'indoor'],
    swimming: ['swimming', 'summer', 'outdoor'],
    winter: ['winter', 'cold', 'outdoor'],
    formal: ['formal', 'special'],
  };

  const targetTags = themeTagMap[theme.toLowerCase()] || ['casual', 'play'];

  // Score each variation by tag match
  let bestMatch: CharacterVariation | null = null;
  let bestScore = -1;

  for (const variation of variations) {
    const variationTags = (variation.tags || '').split(',').map((t) => t.trim().toLowerCase());
    const score = targetTags.filter((tag) => variationTags.includes(tag)).length;

    if (score > bestScore) {
      bestScore = score;
      bestMatch = variation;
    }
  }

  // Fall back to default variation if no good match
  return bestMatch || variations.find((v) => v.variation_slot === 1) || variations[0];
}
