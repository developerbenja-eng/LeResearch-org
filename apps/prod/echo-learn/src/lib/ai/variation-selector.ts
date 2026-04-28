/**
 * Smart Variation Selector for Story Generation
 *
 * Selects the best character variations based on story theme
 * to ensure consistent outfit appearances in generated books
 */

import { selectVariationForTheme, getDefaultVariation } from '@/lib/db/variations';
import { CharacterVariation } from '@/types/character-variation';
import { Character } from '@/types/character';

// Theme to tag mapping for smart selection
export const THEME_TAG_MAP: Record<string, string[]> = {
  // Story themes
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
  holiday: ['formal', 'special', 'indoor'],
  birthday: ['formal', 'special', 'party'],
  school: ['school', 'learning', 'indoor'],
  sports: ['sports', 'active', 'outdoor'],
  beach: ['swimming', 'summer', 'outdoor'],
  camping: ['outdoor', 'summer', 'active'],
  // Vacation themes
  vacation: ['summer', 'outdoor', 'casual'],
  travel: ['casual', 'outdoor', 'summer'],
  museum: ['casual', 'indoor', 'learning'],
  park: ['outdoor', 'play', 'casual'],
  restaurant: ['casual', 'formal', 'indoor'],
};

export interface CharacterWithVariation {
  character: Character;
  variation: CharacterVariation | null;
  outfitDescription: string;
}

/**
 * Get the best variation for each character based on story theme
 */
export async function selectVariationsForStory(
  characters: Character[],
  theme: string
): Promise<CharacterWithVariation[]> {
  const results: CharacterWithVariation[] = [];

  for (const character of characters) {
    let variation: CharacterVariation | null = null;

    // Try to get theme-appropriate variation
    variation = await selectVariationForTheme(character.id, theme);

    // Fall back to default variation if no match
    if (!variation) {
      variation = await getDefaultVariation(character.id);
    }

    // Build outfit description from variation or physical description
    const outfitDescription = buildOutfitDescription(character, variation);

    results.push({
      character,
      variation,
      outfitDescription,
    });
  }

  return results;
}

/**
 * Build a complete outfit description for image generation
 */
function buildOutfitDescription(
  character: Character,
  variation: CharacterVariation | null
): string {
  if (!variation) {
    // Fall back to character's physical description
    return character.physical_description || '';
  }

  const parts: string[] = [];

  // Add the full outfit description if available
  if (variation.outfit_description) {
    parts.push(variation.outfit_description);
  } else {
    // Build from individual pieces
    if (variation.outfit_top) {
      parts.push(variation.outfit_top);
    }
    if (variation.outfit_bottom) {
      parts.push(variation.outfit_bottom);
    }
    if (variation.outfit_shoes) {
      parts.push(variation.outfit_shoes);
    }
    if (variation.outfit_accessories) {
      parts.push(variation.outfit_accessories);
    }
  }

  // Add colors if specified
  if (variation.outfit_colors) {
    parts.push(`Colors: ${variation.outfit_colors}`);
  }

  // Add style if specified
  if (variation.outfit_style) {
    parts.push(`Style: ${variation.outfit_style}`);
  }

  return parts.join('. ');
}

/**
 * Generate enhanced character descriptions for story generation
 * that include outfit information from selected variations
 */
export async function getEnhancedCharacterDescriptions(
  characters: Character[],
  theme: string
): Promise<
  {
    name: string;
    personality: string;
    appearance: string;
    outfitDetails: string;
    variationId: string | null;
  }[]
> {
  const charactersWithVariations = await selectVariationsForStory(characters, theme);

  return charactersWithVariations.map(({ character, variation, outfitDescription }) => ({
    name: character.character_name,
    personality: character.personality_traits || 'friendly and kind',
    appearance: character.physical_description || '',
    outfitDetails: outfitDescription,
    variationId: variation?.id || null,
  }));
}

/**
 * Build image prompt additions for consistent outfit rendering
 */
export function buildOutfitPromptAddition(outfitDescription: string): string {
  if (!outfitDescription) return '';

  return `IMPORTANT - Character outfit: ${outfitDescription}. Ensure the character is wearing this exact outfit in the illustration.`;
}

/**
 * Get best theme match from a story's theme string
 */
export function normalizeTheme(themeInput: string): string {
  const loweredTheme = themeInput.toLowerCase();

  // Check for exact match
  if (THEME_TAG_MAP[loweredTheme]) {
    return loweredTheme;
  }

  // Check for partial match
  for (const knownTheme of Object.keys(THEME_TAG_MAP)) {
    if (loweredTheme.includes(knownTheme) || knownTheme.includes(loweredTheme)) {
      return knownTheme;
    }
  }

  // Default to casual/play themes
  return 'casual';
}
