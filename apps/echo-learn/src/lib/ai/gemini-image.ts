/**
 * Gemini Image Generation Service
 *
 * Uses Gemini 3 Pro Image Preview for character illustration generation
 * and Gemini 2.5 Flash for prompt optimization.
 */

// Model configuration — updated March 2026
// Primary: Nano Banana 2 (fast, high-volume). Fallback: Nano Banana Pro (highest quality)
const GEMINI_IMAGE_MODEL = 'gemini-3.1-flash-image-preview';
const GEMINI_IMAGE_FALLBACK = 'gemini-3-pro-image-preview';
const GEMINI_PROMPT_MODEL = 'gemini-3-flash-preview';
const GEMINI_PROMPT_FALLBACK = 'gemini-3.1-flash-lite-preview';
const GEMINI_API_BASE = 'https://generativelanguage.googleapis.com/v1beta/models';

// API key rotation
const apiKeys = [
  process.env.GEMINI_API_KEY_1!,
  process.env.GEMINI_API_KEY_2!,
  process.env.GEMINI_API_KEY_3!,
].filter(Boolean);

let currentKeyIndex = 0;
const rateLimitedKeys = new Map<string, number>();
const RATE_LIMIT_COOLDOWN = 60000; // 1 minute cooldown

function getNextApiKey(): string {
  const now = Date.now();
  let attempts = 0;

  while (attempts < apiKeys.length) {
    const key = apiKeys[currentKeyIndex];
    currentKeyIndex = (currentKeyIndex + 1) % apiKeys.length;

    // Check if key is rate limited
    const limitedUntil = rateLimitedKeys.get(key);
    if (!limitedUntil || now > limitedUntil) {
      rateLimitedKeys.delete(key);
      return key;
    }

    attempts++;
  }

  // All keys are rate limited, return the first one anyway
  return apiKeys[0];
}

function markKeyAsRateLimited(key: string): void {
  rateLimitedKeys.set(key, Date.now() + RATE_LIMIT_COOLDOWN);
}

/**
 * Fixed style anchor for consistent character generation across all illustrations.
 * Every character should look like they belong in the same children's book.
 */
const STYLE_ANCHOR = `**MANDATORY ART STYLE (follow exactly for every character):**
- Style: Modern children's book illustration, soft cel-shading with clean outlines
- Proportions: Slightly stylized — heads ~20% larger than realistic, large expressive eyes
- Eyes: Big, round, warm brown or appropriate color, with a single white highlight dot
- Skin: Smooth flat color with subtle warm blush on cheeks, no realistic texture
- Hair: Simplified shapes with soft highlights, no individual strand detail
- Outlines: Thin, soft dark outlines around all features (not harsh black)
- Shading: Soft gradient shadows, 2-3 tone shading maximum, no hard shadows
- Colors: Warm, saturated palette — avoid muddy or desaturated tones
- Expression: Friendly, warm smile with simple mouth shape
- Rendering: Digital illustration, NOT 3D render, NOT photorealistic, NOT vector/flat
- Consistency reference: Think of the style of "Alma's Way" or "Ada Twist, Scientist" picture books
- Background: PURE WHITE (#FFFFFF), no environment whatsoever`;

// Types
export interface CharacterImageInput {
  name: string;
  age?: number;
  gender?: string;
  visualDescription?: string;
  personality?: string;
  characterType: 'main' | 'guest';
  customPrompt?: string;
}

export interface GeneratedImageResult {
  imageBase64: string;
  optimizedPrompt: string;
  model: string;
  hasReferenceImage: boolean;
}

/**
 * Optimize character prompt using Gemini text model
 */
export async function optimizeCharacterPrompt(
  characterData: CharacterImageInput,
  hasReferenceImage: boolean = false
): Promise<string> {
  const { name, age, visualDescription, personality, characterType, customPrompt } = characterData;

  // Determine if character is an adult (needs extra stylization emphasis)
  const isAdult = age && age >= 18;
  const adultStyleEmphasis = isAdult ? `
**EXTRA IMPORTANT FOR ADULT CHARACTERS:**
- Adult characters MUST be heavily stylized as cartoon/illustrated characters
- DO NOT make adult faces look realistic or photographic
- Exaggerate cartoon features: larger eyes, simplified nose, stylized proportions
- Think of how Pixar/Disney draw adult characters (Mr. Incredible, Elastigirl, Moana's parents)
- Adults should look just as illustrated/cartoon as child characters
- Avoid photorealistic skin textures, lighting, or facial details
` : '';

  let optimizationPrompt: string;

  if (hasReferenceImage) {
    // WITH reference image: Transform photo into illustrated character
    optimizationPrompt = `You are a professional children's book illustrator prompt engineer.
Create a prompt for generating a NEW ILLUSTRATED CHARACTER for a children's book, using a reference photo as visual inspiration.

${STYLE_ANCHOR}

Character Information:
- Name: ${name}
- Age: ${age || 'Not specified'} years old
- Type: ${characterType}
${visualDescription ? `- Additional Details: ${visualDescription}` : ''}
${personality ? `- Personality: ${personality}` : ''}
${customPrompt ? `\n**USER'S CUSTOM INSTRUCTIONS: "${customPrompt}"**\nIMPORTANT: Incorporate these specific user requests into the prompt!` : ''}

**CRITICAL INSTRUCTION: CREATE AN ILLUSTRATED CHARACTER, NOT A PHOTO EDIT**
${adultStyleEmphasis}

**HOW TO USE THE REFERENCE PHOTO:**
The reference photo shows you what this character looks like, but you need to CREATE A NEW CHILDREN'S BOOK ILLUSTRATION, not edit the photo.

Study the reference photo for:
- Overall appearance and features (face shape, expression, proportions)
- Hair style, hair color, and texture
- Skin tone and facial features
- General clothing style and colors
- Age-appropriate characteristics
- Accessories or distinctive elements

Use text description for any unclear or invisible details.

**OUTPUT:**
- Front-facing portrait, head and shoulders, centered composition
- SQUARE IMAGE (1:1 aspect ratio)
- Pure white background, no environment

Return ONLY the optimized prompt text, no preamble.`;
  } else {
    // WITHOUT reference image: Generate from detailed description
    optimizationPrompt = `You are a professional children's book illustrator prompt engineer.
Create a detailed, vivid prompt for generating a children's book character illustration.

${STYLE_ANCHOR}

Character Information:
- Name: ${name}
- Age: ${age || 'Not specified'} years old
- Type: ${characterType}
${visualDescription ? `- Appearance: ${visualDescription}` : ''}
${personality ? `- Personality: ${personality}` : ''}
${customPrompt ? `\n**USER'S CUSTOM INSTRUCTIONS: "${customPrompt}"**\nIMPORTANT: Incorporate these specific user requests into the prompt!` : ''}
${adultStyleEmphasis}

Create a detailed prompt that:
1. Describes the character's physical features in rich, visual detail
2. Captures their personality through expression and posture
3. Specifies appropriate clothing and style for their age
4. Follows the MANDATORY ART STYLE above exactly

**OUTPUT:**
- Front-facing portrait, head and shoulders, centered composition
- SQUARE IMAGE (1:1 aspect ratio)
- Pure white background, no environment
- Think profile photo or avatar style

Return ONLY the optimized prompt, no preamble or explanation.`;
  }

  // Try with multiple API keys, then fallback model
  const models = [GEMINI_PROMPT_MODEL, GEMINI_PROMPT_FALLBACK];
  let lastError: Error | null = null;

  for (const model of models) {
    for (let attempt = 0; attempt < apiKeys.length; attempt++) {
      const apiKey = getNextApiKey();
      const apiUrl = `${GEMINI_API_BASE}/${model}:generateContent?key=${apiKey}`;

      try {
        console.log(`[Prompt Optimization] Attempt with ${model}, key ${attempt + 1}/${apiKeys.length}`);

        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: optimizationPrompt }] }],
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 500,
              topP: 0.95,
              topK: 40,
            },
          }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          if (response.status === 429) {
            markKeyAsRateLimited(apiKey);
            console.warn(`[Prompt Optimization] Rate limited, trying next key...`);
            continue;
          }
          throw new Error(`API failed: ${response.status} - ${errorText}`);
        }

        // Parse response, sanitizing control characters that break JSON.parse
        const responseText = await response.text();
        const sanitized = responseText.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
        let data;
        try {
          data = JSON.parse(sanitized);
        } catch {
          // If still failing, aggressively strip all control chars
          const aggressive = responseText.replace(/[\x00-\x1F\x7F]/g, (ch) =>
            ch === '\n' ? '\\n' : ch === '\r' ? '\\r' : ch === '\t' ? '\\t' : ''
          );
          data = JSON.parse(aggressive);
        }
        const optimizedPrompt = data.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!optimizedPrompt) {
          throw new Error('No prompt returned from API');
        }

        console.log(`[Prompt Optimization] Success with ${model}`);
        return optimizedPrompt.trim();
      } catch (error) {
        lastError = error as Error;
        console.error(`[Prompt Optimization] Failed with ${model}:`, (error as Error).message);
      }
    }
    console.warn(`[Prompt Optimization] All keys exhausted for ${model}, trying fallback model...`);
  }

  // All retries failed - use fallback prompt
  console.error('[Prompt Optimization] All models and keys failed, using fallback prompt');
  return `Create a warm, friendly children's book illustration of ${name}, a ${age || ''} year-old ${characterType} character. ${visualDescription ? `Physical features: ${visualDescription}.` : ''} ${personality ? `Personality: ${personality}.` : ''} Style: Colorful, inviting, suitable for young children. The illustration should be front-facing portrait style, head and shoulders visible, on a pure white background. Think Pixar or Disney animation style - illustrated, not photorealistic.`;
}

/**
 * Generate character image using Gemini 3 Pro Image Preview (Nano Banana)
 */
export async function generateCharacterImage(
  optimizedPrompt: string,
  referenceImageBase64?: string
): Promise<string> {
  const models = [GEMINI_IMAGE_MODEL, GEMINI_IMAGE_FALLBACK];
  let lastError: Error | null = null;

  // Prepend strict constraints that the image model MUST follow.
  // The optimized prompt from the text model sometimes gets diluted,
  // so we enforce the critical rules directly in the generation call.
  const constrainedPrompt = `STRICT RULES — FOLLOW ALL OF THESE WITHOUT EXCEPTION:
- Generate a SINGLE CHARACTER PORTRAIT on a PURE WHITE BACKGROUND.
- NO background scenery, NO environment, NO buildings, NO trees, NO props, NO ground, NO sky.
- Show ONLY the character: head and upper shoulders, front-facing, centered.
- The background MUST be solid pure white (#FFFFFF). Nothing else behind the character.

${STYLE_ANCHOR}

CHARACTER TO ILLUSTRATE:
${optimizedPrompt}`;

  for (const model of models) {
  for (let attempt = 0; attempt < apiKeys.length; attempt++) {
    const apiKey = getNextApiKey();
    const apiUrl = `${GEMINI_API_BASE}/${model}:generateContent?key=${apiKey}`;

    try {
      console.log(`[Image Generation] Attempt with ${model}, key ${attempt + 1}/${apiKeys.length}`);

      // Build request parts
      const parts: Array<{ text: string } | { inline_data: { mime_type: string; data: string } }> = [];
      parts.push({ text: constrainedPrompt });

      // Add reference image if provided
      if (referenceImageBase64) {
        console.log('[Image Generation] Including reference image');

        // Extract MIME type from data URL
        let mimeType = 'image/jpeg';
        const mimeMatch = referenceImageBase64.match(/^data:(image\/\w+);base64,/);
        if (mimeMatch) {
          mimeType = mimeMatch[1];
        }

        // Remove data URL prefix
        const base64Data = referenceImageBase64.replace(/^data:image\/\w+;base64,/, '');

        parts.push({
          inline_data: {
            mime_type: mimeType,
            data: base64Data,
          },
        });
      }

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts }],
          generationConfig: {
            responseModalities: ['IMAGE'],
            imageConfig: {
              aspectRatio: '1:1',
            },
          },
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        if (response.status === 429) {
          markKeyAsRateLimited(apiKey);
          console.warn('[Image Generation] Rate limited, trying next key...');
          continue;
        }
        throw new Error(`API failed: ${response.status} - ${errorText}`);
      }

      // Parse response, sanitizing control characters that break JSON.parse
      const responseText = await response.text();
      const sanitized = responseText.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
      let data;
      try {
        data = JSON.parse(sanitized);
      } catch {
        // If still failing, aggressively strip all control chars
        const aggressive = responseText.replace(/[\x00-\x1F\x7F]/g, (ch) =>
          ch === '\n' ? '\\n' : ch === '\r' ? '\\r' : ch === '\t' ? '\\t' : ''
        );
        data = JSON.parse(aggressive);
      }

      // Extract image from response
      const candidate = data.candidates?.[0];
      if (!candidate) {
        throw new Error('No image candidate in response');
      }

      let imageBase64: string | null = null;
      for (const part of candidate.content?.parts || []) {
        if (part.inline_data || part.inlineData) {
          imageBase64 = part.inline_data?.data || part.inlineData?.data;
          break;
        }
      }

      if (!imageBase64) {
        throw new Error('No image data found in response');
      }

      console.log(`[Image Generation] Success with ${model}`);
      return imageBase64;
    } catch (error) {
      lastError = error as Error;
      console.error(`[Image Generation] Failed with ${model}:`, (error as Error).message);
    }
  }
  console.warn(`[Image Generation] All keys exhausted for ${model}, trying fallback model...`);
  }

  throw lastError || new Error('Image generation failed after all models and retries');
}

/**
 * Full character image generation flow:
 * 1. Optimize prompt with Gemini text model
 * 2. Generate image with Gemini image model
 */
export async function createCharacterIllustration(
  characterData: CharacterImageInput,
  referenceImageBase64?: string
): Promise<GeneratedImageResult> {
  const hasReferenceImage = !!referenceImageBase64;

  console.log(`[Character Illustration] Starting for: ${characterData.name}`);
  console.log(`[Character Illustration] Has reference image: ${hasReferenceImage}`);

  // Step 1: Optimize prompt
  console.log('[Character Illustration] Step 1: Optimizing prompt...');
  const optimizedPrompt = await optimizeCharacterPrompt(characterData, hasReferenceImage);

  // Step 2: Generate image
  console.log('[Character Illustration] Step 2: Generating image...');
  const imageBase64 = await generateCharacterImage(optimizedPrompt, referenceImageBase64);

  return {
    imageBase64,
    optimizedPrompt,
    model: GEMINI_IMAGE_MODEL,
    hasReferenceImage,
  };
}

/**
 * Regenerate character image with custom prompt modifications
 */
export async function regenerateCharacterImage(
  characterData: CharacterImageInput,
  referenceImageBase64?: string,
  customInstructions?: string
): Promise<GeneratedImageResult> {
  // Add custom instructions to character data
  const modifiedData = {
    ...characterData,
    customPrompt: customInstructions,
  };

  return createCharacterIllustration(modifiedData, referenceImageBase64);
}

/**
 * Generate a variation image (outfit change) for an existing character.
 * Takes the character's reference illustration as input and generates
 * the same character wearing a different outfit.
 */
export async function generateVariationImage(
  characterReferenceBase64: string,
  outfitPrompt: string
): Promise<string> {
  const models = [GEMINI_IMAGE_MODEL, GEMINI_IMAGE_FALLBACK];
  let lastError: Error | null = null;

  const variationPrompt = `STRICT RULES — FOLLOW ALL OF THESE WITHOUT EXCEPTION:
- You are given a reference illustration of a character. Generate the SAME CHARACTER in a DIFFERENT OUTFIT.
- Keep the character's face, hair, skin tone, proportions, and style EXACTLY the same.
- ONLY change their clothing/outfit as described below.
- Single character portrait, head and upper body, front-facing, centered.
- Background MUST be solid pure white (#FFFFFF). No environment.

${STYLE_ANCHOR}

OUTFIT TO DRAW:
${outfitPrompt}

CRITICAL: The character must look IDENTICAL to the reference image — same face, same hair, same style. Only the outfit changes.`;

  for (const model of models) {
    for (let attempt = 0; attempt < apiKeys.length; attempt++) {
      const apiKey = getNextApiKey();
      const apiUrl = `${GEMINI_API_BASE}/${model}:generateContent?key=${apiKey}`;

      try {
        console.log(`[Variation Generation] Attempt with ${model}, key ${attempt + 1}/${apiKeys.length}`);

        // Strip data URL prefix if present
        let mimeType = 'image/png';
        let base64Data = characterReferenceBase64;
        const mimeMatch = characterReferenceBase64.match(/^data:(image\/\w+);base64,/);
        if (mimeMatch) {
          mimeType = mimeMatch[1];
          base64Data = characterReferenceBase64.replace(/^data:image\/\w+;base64,/, '');
        }

        const parts = [
          { text: variationPrompt },
          { inline_data: { mime_type: mimeType, data: base64Data } },
        ];

        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts }],
            generationConfig: {
              responseModalities: ['IMAGE'],
              imageConfig: { aspectRatio: '1:1' },
            },
          }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          if (response.status === 429) {
            markKeyAsRateLimited(apiKey);
            console.warn('[Variation Generation] Rate limited, trying next key...');
            continue;
          }
          throw new Error(`API failed: ${response.status} - ${errorText}`);
        }

        const responseText = await response.text();
        const sanitized = responseText.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
        let data;
        try {
          data = JSON.parse(sanitized);
        } catch {
          const aggressive = responseText.replace(/[\x00-\x1F\x7F]/g, (ch) =>
            ch === '\n' ? '\\n' : ch === '\r' ? '\\r' : ch === '\t' ? '\\t' : ''
          );
          data = JSON.parse(aggressive);
        }

        const candidate = data.candidates?.[0];
        if (!candidate) throw new Error('No image candidate in response');

        let imageBase64: string | null = null;
        for (const part of candidate.content?.parts || []) {
          if (part.inline_data || part.inlineData) {
            imageBase64 = part.inline_data?.data || part.inlineData?.data;
            break;
          }
        }

        if (!imageBase64) throw new Error('No image data found in response');

        console.log(`[Variation Generation] Success with ${model}`);
        return imageBase64;
      } catch (error) {
        lastError = error as Error;
        console.error(`[Variation Generation] Failed with ${model}:`, (error as Error).message);
      }
    }
    console.warn(`[Variation Generation] All keys exhausted for ${model}, trying fallback...`);
  }

  throw lastError || new Error('Variation generation failed after all models and retries');
}
