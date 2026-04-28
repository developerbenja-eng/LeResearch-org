// Character types aligned with actual database schema

export type CharacterType = 'main' | 'guest';

export interface Character {
  id: string;
  user_id: string;
  character_name: string;
  character_type: CharacterType;
  age: number | null;
  gender: string | null;
  personality_traits: string | null;
  physical_description: string | null;
  reference_image_url: string | null;
  original_photo_url: string | null;
  birthdate: string | null;
  use_fixed_age: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Get the effective age of a character.
 * If use_fixed_age is true (or no birthdate), returns the stored age.
 * Otherwise calculates current age from birthdate.
 */
export function getCharacterAge(character: Character): number | null {
  if (character.use_fixed_age || !character.birthdate) {
    return character.age;
  }
  const birth = new Date(character.birthdate);
  const now = new Date();
  let age = now.getFullYear() - birth.getFullYear();
  const monthDiff = now.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}

// Visual consistency data stored as JSON in DB
export interface VisualConsistencyData {
  style: string;
  color_palette: string[];
  distinctive_features: string[];
  clothing_style: string;
  accessories: string[];
}

// Character variation for different outfits/poses
export interface CharacterVariation {
  id: string;
  character_id: string;
  name: string;
  description: string;
  image_url: string;
  outfit_type: string;
  created_at: string;
}

// Reference sheet for visual consistency
export interface CharacterReferenceSheet {
  id: string;
  user_id: string;
  character_id: string;
  image_url: string;
  poses: string[];
  expressions: string[];
  created_at: string;
}

// Many-to-many relationship between books and characters
export interface BookCharacter {
  book_id: string;
  character_id: string;
  role: 'protagonist' | 'supporting' | 'antagonist' | 'background';
  created_at: string;
}

// Input for creating a new character
export interface CreateCharacterInput {
  character_name: string;
  character_type?: CharacterType;
  age?: number;
  gender?: string;
  personality_traits?: string;
  physical_description?: string;
  birthdate?: string;
  use_fixed_age?: boolean;
}

// Input for updating an existing character
export interface UpdateCharacterInput {
  character_name?: string;
  character_type?: CharacterType;
  age?: number;
  gender?: string;
  personality_traits?: string;
  physical_description?: string;
  reference_image_url?: string;
  original_photo_url?: string;
  birthdate?: string;
  use_fixed_age?: boolean;
  is_active?: boolean;
}

// Character with photo upload data (used during creation flow)
export interface CharacterCreationData extends CreateCharacterInput {
  photoBase64?: string;
  photoMimeType?: string;
}

// Response from character image generation
export interface GeneratedCharacterImage {
  referenceImageUrl: string;
  originalPhotoUrl?: string;
  regenerationPrompt?: string;
}

// Character generation status for progress tracking
export type CharacterGenerationStatus =
  | 'idle'
  | 'processing_photo'
  | 'optimizing_prompt'
  | 'generating_image'
  | 'removing_background'
  | 'uploading'
  | 'complete'
  | 'error';

// Progress callback for character generation
export interface CharacterGenerationProgress {
  status: CharacterGenerationStatus;
  message: string;
  progress: number; // 0-100
}
