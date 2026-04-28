/**
 * Gemini Album Art Generation
 *
 * Uses Nano Banana 2 (gemini-3.1-flash-image-preview) for album cover generation,
 * and Gemini Flash for prompt optimization. Server-side only.
 */

import { getGeminiClient, GEMINI_MODELS } from './gemini';
import { GoogleGenAI } from '@google/genai';

// API key rotation (matching gemini-image.ts pattern)
const apiKeys = [
  process.env.GEMINI_API_KEY_1!,
  process.env.GEMINI_API_KEY_2!,
  process.env.GEMINI_API_KEY_3!,
].filter(Boolean);

let currentKeyIndex = 0;
const rateLimitedKeys = new Map<string, number>();
const RATE_LIMIT_COOLDOWN = 60000;

function getNextKey(): string {
  const now = Date.now();
  let attempts = 0;

  while (attempts < apiKeys.length) {
    const key = apiKeys[currentKeyIndex];
    currentKeyIndex = (currentKeyIndex + 1) % apiKeys.length;

    const limitedUntil = rateLimitedKeys.get(key);
    if (!limitedUntil || now > limitedUntil) {
      rateLimitedKeys.delete(key);
      return key;
    }
    attempts++;
  }

  return apiKeys[0];
}

function markKeyAsRateLimited(key: string): void {
  rateLimitedKeys.set(key, Date.now() + RATE_LIMIT_COOLDOWN);
}

export interface ProjectMetadata {
  name: string;
  genre?: string;
  bpm?: number;
  scale?: string;
}

export interface AlbumArtResult {
  imageBase64: string;
  optimizedPrompt: string;
}

/**
 * Optimize a user prompt into an effective album art generation prompt
 */
export async function optimizeAlbumArtPrompt(
  userPrompt: string,
  metadata?: ProjectMetadata,
): Promise<string> {
  const metadataContext = metadata
    ? `\nProject context: name="${metadata.name}", genre="${metadata.genre || 'unknown'}", BPM=${metadata.bpm || 'unknown'}, scale="${metadata.scale || 'unknown'}".`
    : '';

  const systemPrompt = `You are an album art prompt engineer specializing in music cover art. Rewrite the user's description into a detailed, vivid prompt that will produce stunning 1:1 square album cover art.

Guidelines:
- Focus on composition, color palette, lighting, mood, and artistic style
- The output must work as a standalone album cover — visually striking and professional
- Incorporate the project's musical context (genre, tempo, mood from scale) naturally
- Keep the prompt under 200 words
- Do NOT include any text, titles, or typography in the image description
- Return ONLY the optimized prompt, nothing else
${metadataContext}

User's description: ${userPrompt}`;

  try {
    const client = getGeminiClient();
    const response = await client.models.generateContent({
      model: GEMINI_MODELS.TEXT,
      contents: [{ parts: [{ text: systemPrompt }] }],
      config: {
        temperature: 0.7,
        maxOutputTokens: 300,
      },
    });

    const text = response.text?.trim();
    if (text) return text;
  } catch (error) {
    console.error('[Album Art] Prompt optimization failed, using raw prompt:', (error as Error).message);
  }

  // Fallback: use the raw prompt
  return userPrompt;
}

/**
 * Generate album art using Nano Banana 2, with Nano Banana Pro fallback
 */
export async function generateAlbumArt(
  optimizedPrompt: string,
): Promise<string> {
  const models = [GEMINI_MODELS.IMAGE, GEMINI_MODELS.IMAGE_FALLBACK];
  let lastError: Error | null = null;

  for (const model of models) {
    for (let attempt = 0; attempt < apiKeys.length; attempt++) {
      const apiKey = getNextKey();

      try {
        console.log(`[Album Art] Attempt with ${model}, key ${attempt + 1}/${apiKeys.length}`);
        const client = new GoogleGenAI({ apiKey });

        const response = await client.models.generateContent({
          model,
          contents: [{ parts: [{ text: `Generate a square 1:1 album cover art image. ${optimizedPrompt}` }] }],
          config: {
            responseModalities: ['IMAGE'],
          },
        });

        // Extract image from response
        const candidate = response.candidates?.[0];
        if (!candidate) {
          throw new Error('No candidate in response');
        }

        let imageBase64: string | null = null;
        for (const part of candidate.content?.parts || []) {
          if (part.inlineData?.data) {
            imageBase64 = part.inlineData.data;
            break;
          }
        }

        if (!imageBase64) {
          throw new Error('No image data in response');
        }

        console.log(`[Album Art] Generation successful with ${model}`);
        return imageBase64;
      } catch (error) {
        lastError = error as Error;
        const status = (error as { status?: number }).status;
        if (status === 429) {
          markKeyAsRateLimited(apiKey);
          console.warn('[Album Art] Rate limited, trying next key...');
          continue;
        }
        console.error(`[Album Art] Failed with ${model}:`, (error as Error).message);
      }
    }
    console.warn(`[Album Art] All keys exhausted for ${model}, trying fallback model...`);
  }

  throw lastError || new Error('Album art generation failed after all models and retries');
}

/**
 * Full album art generation flow: optimize prompt → generate image
 */
export async function createAlbumArt(
  userPrompt: string,
  metadata?: ProjectMetadata,
): Promise<AlbumArtResult> {
  console.log('[Album Art] Starting generation...');

  const optimizedPrompt = await optimizeAlbumArtPrompt(userPrompt, metadata);
  console.log('[Album Art] Prompt optimized, generating image...');

  const imageBase64 = await generateAlbumArt(optimizedPrompt);

  return { imageBase64, optimizedPrompt };
}
