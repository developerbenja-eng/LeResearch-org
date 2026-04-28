/**
 * Auto-generate starter outfit variations for newly created characters.
 *
 * After a character is confirmed/saved, this module generates 3 starter
 * variations (casual, pajamas, school) so the variation selector has
 * options for different story themes from the start.
 */

import { Character, getCharacterAge } from '@/types/character';
import { generateVariationImage } from '@/lib/ai/gemini-image';
import { cropCharacterAvatar } from '@/lib/image/background-remover';
import { createVariation } from '@/lib/db/variations';
import { uploadImage, generateVariationPath } from '@/lib/storage/gcs';

type AgeCategory = 'child' | 'adult';

function getAgeCategory(character: Character): AgeCategory {
  const age = getCharacterAge(character);
  if (age !== null && age >= 18) return 'adult';
  return 'child';
}

interface StarterVariation {
  variationName: string;
  slot: number;
  buildPrompt: (character: Character, category: AgeCategory) => string;
}

const STARTER_VARIATIONS: StarterVariation[] = [
  {
    variationName: 'casual',
    slot: 1,
    buildPrompt: (char, category) => {
      const ageDesc = char.age ? `${char.age}-year-old` : '';
      if (category === 'child') {
        return `${ageDesc} ${char.character_name} wearing comfortable, colorful play clothes — a fun t-shirt and shorts or jeans. Relaxed, happy expression.`;
      }
      return `${ageDesc} ${char.character_name} wearing casual everyday clothes — a comfortable top and pants. Relaxed, friendly expression.`;
    },
  },
  {
    variationName: 'pajamas',
    slot: 2,
    buildPrompt: (char, category) => {
      const ageDesc = char.age ? `${char.age}-year-old` : '';
      if (category === 'child') {
        return `${ageDesc} ${char.character_name} wearing cozy pajamas with a fun pattern (stars, animals, or stripes). Sleepy, warm smile.`;
      }
      return `${ageDesc} ${char.character_name} wearing comfortable sleepwear — soft pajama top and pants. Relaxed, warm smile.`;
    },
  },
  {
    variationName: 'school',
    slot: 3,
    buildPrompt: (char, category) => {
      const ageDesc = char.age ? `${char.age}-year-old` : '';
      if (category === 'child') {
        return `${ageDesc} ${char.character_name} dressed for school — neat shirt or polo, carrying a colorful backpack. Eager, bright expression.`;
      }
      return `${ageDesc} ${char.character_name} wearing smart-casual work clothes — a button-up shirt or blouse. Confident, warm expression.`;
    },
  },
];

/**
 * Generate starter variations for a newly created character.
 * Runs asynchronously — does not block the character creation response.
 *
 * @param character - The saved character (must have reference_image_url)
 */
export async function generateStarterVariations(character: Character): Promise<void> {
  if (!character.reference_image_url) {
    console.warn(`[Auto-Variations] No reference image for ${character.character_name}, skipping`);
    return;
  }

  const category = getAgeCategory(character);

  console.log(`[Auto-Variations] Starting for ${character.character_name} (category: ${category})`);

  // Download the character's reference illustration to use as input
  let referenceBase64: string;
  try {
    const res = await fetch(character.reference_image_url);
    if (!res.ok) throw new Error(`Failed to fetch reference: ${res.status}`);
    const buffer = Buffer.from(await res.arrayBuffer());
    referenceBase64 = buffer.toString('base64');
  } catch (error) {
    console.error(`[Auto-Variations] Failed to fetch reference image:`, (error as Error).message);
    return;
  }

  // Generate each starter variation sequentially (to avoid hitting rate limits)
  for (const starter of STARTER_VARIATIONS) {
    try {
      const outfitPrompt = starter.buildPrompt(character, category);
      console.log(`[Auto-Variations] Generating ${starter.variationName} for ${character.character_name}...`);

      // Generate the variation image
      const rawBase64 = await generateVariationImage(referenceBase64, outfitPrompt);

      // Crop background
      const imageBuffer = Buffer.from(rawBase64, 'base64');
      const cropped = await cropCharacterAvatar(imageBuffer);

      // Upload to GCS
      const path = generateVariationPath(character.user_id, character.id, starter.variationName);
      const uploadResult = await uploadImage(cropped.buffer, path, {
        characterId: character.id,
        userId: character.user_id,
        type: 'variation',
        variationName: starter.variationName,
      });

      // Create DB record
      await createVariation(character.id, {
        variation_name: starter.variationName,
        variation_slot: starter.slot,
        source_type: 'ai_generated',
        reference_image_url: uploadResult.publicUrl,
        outfit_description: outfitPrompt,
      });

      console.log(`[Auto-Variations] ${starter.variationName} complete: ${uploadResult.publicUrl}`);
    } catch (error) {
      console.error(
        `[Auto-Variations] Failed to generate ${starter.variationName} for ${character.character_name}:`,
        (error as Error).message
      );
      // Continue with next variation — don't fail the whole batch
    }
  }

  console.log(`[Auto-Variations] Finished for ${character.character_name}`);
}
