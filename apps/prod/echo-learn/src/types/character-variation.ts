/**
 * Character Variation Types
 *
 * Types for outfit variations and character canvases
 */

// ============================================================================
// VARIATION TYPES (9 Standard Outfits)
// ============================================================================

export interface VariationType {
  id: string;
  name: string;
  description: string;
  tags: string[];
  icon: string;
}

export const VARIATION_TYPES: VariationType[] = [
  {
    id: 'casual',
    name: 'Casual Day',
    description: 'Everyday comfortable outfit',
    tags: ['casual', 'play', 'indoor', 'outdoor'],
    icon: '👕',
  },
  {
    id: 'pajamas',
    name: 'Pajamas',
    description: 'Cozy sleepwear for bedtime stories',
    tags: ['bedtime', 'nighttime', 'pajamas', 'indoor'],
    icon: '🌙',
  },
  {
    id: 'school',
    name: 'School',
    description: 'Ready for learning adventures',
    tags: ['school', 'learning', 'indoor', 'formal'],
    icon: '📚',
  },
  {
    id: 'swimming',
    name: 'Swimming',
    description: 'Swimwear for water adventures',
    tags: ['swimming', 'summer', 'outdoor', 'active'],
    icon: '🏊',
  },
  {
    id: 'winter',
    name: 'Winter',
    description: 'Bundled up for cold weather',
    tags: ['winter', 'cold', 'outdoor', 'snow'],
    icon: '❄️',
  },
  {
    id: 'sports',
    name: 'Sports',
    description: 'Athletic wear for active play',
    tags: ['sports', 'active', 'outdoor', 'play'],
    icon: '⚽',
  },
  {
    id: 'formal',
    name: 'Formal',
    description: 'Dressed up for special occasions',
    tags: ['formal', 'special', 'party', 'indoor'],
    icon: '👔',
  },
  {
    id: 'summer',
    name: 'Summer',
    description: 'Light clothes for warm days',
    tags: ['summer', 'outdoor', 'casual', 'play'],
    icon: '☀️',
  },
  {
    id: 'with_toy',
    name: 'With Favorite Toy',
    description: 'Character with their beloved toy',
    tags: ['play', 'indoor', 'toy', 'casual'],
    icon: '🧸',
  },
];

// ============================================================================
// DATABASE TYPES
// ============================================================================

export type SourceType = 'ai_generated' | 'user_uploaded' | 'vacation_book';

export interface CharacterVariation {
  id: string;
  character_id: string;
  variation_name: string;
  variation_slot: number;
  source_type: SourceType;
  source_vacation_book_id: string | null;
  source_photo_url: string | null;
  outfit_description: string | null;
  outfit_top: string | null;
  outfit_bottom: string | null;
  outfit_shoes: string | null;
  outfit_accessories: string | null;
  outfit_colors: string | null;
  outfit_style: string | null;
  reference_image_url: string | null;
  tags: string | null;
  is_default: number;
  is_active: number;
  usage_count: number;
  created_at: string;
  updated_at: string;
}

export interface CharacterCanvas {
  id: string;
  character_id: string;
  canvas_url: string;
  variation_count: number;
  canvas_width: number;
  canvas_height: number;
  generated_at: string;
  created_at: string;
  updated_at: string;
}

// ============================================================================
// INPUT/OUTPUT TYPES
// ============================================================================

export interface CreateVariationInput {
  variation_name: string;
  variation_slot?: number;
  source_type?: SourceType;
  source_vacation_book_id?: string;
  source_photo_url?: string;
  outfit_description?: string;
  outfit_top?: string;
  outfit_bottom?: string;
  outfit_shoes?: string;
  outfit_accessories?: string;
  outfit_colors?: string;
  outfit_style?: string;
  reference_image_url?: string;
}

export interface UpdateVariationInput {
  variation_name?: string;
  outfit_description?: string;
  outfit_top?: string;
  outfit_bottom?: string;
  outfit_shoes?: string;
  outfit_accessories?: string;
  outfit_colors?: string;
  outfit_style?: string;
  reference_image_url?: string;
  tags?: string;
  is_active?: number;
}

// ============================================================================
// UI TYPES
// ============================================================================

export interface VariationSlot {
  slot: number;
  variation: CharacterVariation | null;
  isEmpty: boolean;
}

export interface VariationGridProps {
  characterId: string;
  variations: CharacterVariation[];
  onSlotClick: (slot: number, variation: CharacterVariation | null) => void;
  onSetMain: (variationId: string) => void;
  onDelete: (variationId: string) => void;
  isEditable?: boolean;
}

export interface CanvasGenerationOptions {
  characterId: string;
  variations: CharacterVariation[];
  characterName: string;
  backgroundColor?: string;
}

// ============================================================================
// API RESPONSE TYPES
// ============================================================================

export interface VariationsApiResponse {
  success: boolean;
  variations?: CharacterVariation[];
  canvas?: CharacterCanvas;
  error?: string;
}

export interface GenerateVariationResponse {
  success: boolean;
  variation?: CharacterVariation;
  imageUrl?: string;
  error?: string;
}
