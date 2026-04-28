import { GoogleGenAI, Type } from '@google/genai';

// Model configuration — updated March 2026
// See: https://ai.google.dev/gemini-api/docs/models/gemini
export const GEMINI_MODELS = {
  // Primary text model (stories, lyrics, research, prompts) — $0.50/$3 per 1M tokens
  TEXT: 'gemini-3-flash-preview',
  // Text fallback (Flash Lite — cheapest workhorse) — $0.25/$1.50 per 1M tokens
  TEXT_FALLBACK: 'gemini-3.1-flash-lite-preview',
  // Primary image model (Nano Banana 2 — fast, high-volume) — $0.25 input / $0.067 per image
  IMAGE: 'gemini-3.1-flash-image-preview',
  // Image fallback (Nano Banana Pro — highest quality) — $2 input / $0.134 per image
  IMAGE_FALLBACK: 'gemini-3-pro-image-preview',
  // Vision/analysis model (photo analysis)
  VISION: 'gemini-3-flash-preview',
  // Audio/TTS model
  AUDIO: 'gemini-2.5-flash-preview-tts',
} as const;

// API key rotation for load balancing
// Use lazy initialization to ensure dotenv has loaded first (important for CLI scripts)
let apiKeys: string[] | null = null;
let currentKeyIndex = 0;

function getApiKeys(): string[] {
  if (apiKeys === null) {
    apiKeys = [
      process.env.GEMINI_API_KEY_1!,
      process.env.GEMINI_API_KEY_2!,
      process.env.GEMINI_API_KEY_3!,
    ].filter(Boolean);

    if (apiKeys.length === 0) {
      throw new Error('No Gemini API keys found. Please set GEMINI_API_KEY_1, GEMINI_API_KEY_2, or GEMINI_API_KEY_3 in your environment.');
    }
  }
  return apiKeys;
}

function getNextApiKey(): string {
  const keys = getApiKeys();
  const key = keys[currentKeyIndex];
  currentKeyIndex = (currentKeyIndex + 1) % keys.length;
  return key;
}

export function getGeminiClient(): GoogleGenAI {
  return new GoogleGenAI({ apiKey: getNextApiKey() });
}

// Text generation
export async function generateText(
  prompt: string,
  options: {
    model?: string;
    maxTokens?: number;
    temperature?: number;
  } = {}
): Promise<string> {
  const client = getGeminiClient();
  const modelId = options.model || GEMINI_MODELS.TEXT;

  const response = await client.models.generateContent({
    model: modelId,
    contents: [{ parts: [{ text: prompt }] }],
    config: {
      maxOutputTokens: options.maxTokens || 8192,
      temperature: options.temperature || 0.7,
    },
  });

  return response.text || '';
}

// JSON generation with structured output using responseSchema
export async function generateJSON<T>(
  prompt: string,
  options: {
    model?: string;
    maxTokens?: number;
    schema?: Record<string, unknown>;
  } = {}
): Promise<T> {
  const client = getGeminiClient();
  const modelId = options.model || GEMINI_MODELS.TEXT;

  const response = await client.models.generateContent({
    model: modelId,
    contents: [{ parts: [{ text: prompt }] }],
    config: {
      responseMimeType: 'application/json',
      maxOutputTokens: options.maxTokens || 8192,
      temperature: 0.3, // Lower temperature for more consistent JSON
      ...(options.schema ? { responseSchema: options.schema } : {}),
    },
  });

  const text = response.text || '{}';
  return JSON.parse(text) as T;
}

// Legacy generateJSON without schema for backwards compatibility
export async function generateJSONLegacy<T>(
  prompt: string,
  options: {
    model?: string;
    maxTokens?: number;
  } = {}
): Promise<T> {
  const jsonPrompt = `${prompt}

IMPORTANT: Respond ONLY with valid JSON. Do not include any markdown formatting, code blocks, or explanatory text.`;

  const text = await generateText(jsonPrompt, {
    ...options,
    temperature: 0.3,
  });

  // Clean up potential markdown formatting
  let cleanText = text.trim();
  if (cleanText.startsWith('```json')) {
    cleanText = cleanText.slice(7);
  }
  if (cleanText.startsWith('```')) {
    cleanText = cleanText.slice(3);
  }
  if (cleanText.endsWith('```')) {
    cleanText = cleanText.slice(0, -3);
  }

  return JSON.parse(cleanText.trim()) as T;
}

// Story generation interface
export interface StoryGenerationInput {
  title: string;
  theme: string;
  characters: {
    name: string;
    personality: string;
    appearance: string;
    outfitDetails?: string; // From variation system
  }[];
  pageCount: number;
  language: 'en' | 'es';
  educationalTheme?: string;
  customInstructions?: string;
}

export interface GeneratedStory {
  title: string;
  pages: {
    pageNumber: number;
    text: string;
    imagePrompt: string;
    featuredCharacters: string[];
    layout: string;
  }[];
}

// Schema for story generation structured output
const STORY_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING },
    pages: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          pageNumber: { type: Type.INTEGER },
          text: { type: Type.STRING },
          imagePrompt: { type: Type.STRING },
          featuredCharacters: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
          },
          layout: { type: Type.STRING },
        },
        required: ['pageNumber', 'text', 'imagePrompt', 'featuredCharacters', 'layout'],
      },
    },
  },
  required: ['title', 'pages'],
};

// Generate a children's book story
export async function generateStory(
  input: StoryGenerationInput
): Promise<GeneratedStory> {
  const characterDescriptions = input.characters
    .map((c) => {
      let desc = `- ${c.name}: ${c.personality}. Appearance: ${c.appearance}`;
      if (c.outfitDetails) {
        desc += `\n  OUTFIT (IMPORTANT - use this exact outfit in all illustrations): ${c.outfitDetails}`;
      }
      return desc;
    })
    .join('\n');

  const prompt = `Create a children's story with the following details:

Title: ${input.title}
Theme: ${input.theme}
Number of pages: ${input.pageCount}
Language: ${input.language === 'es' ? 'Spanish' : 'English'}
${input.educationalTheme ? `Educational theme: ${input.educationalTheme}` : ''}
${input.customInstructions ? `\nCustom Instructions (IMPORTANT - follow these guidelines):\n${input.customInstructions}` : ''}

Characters:
${characterDescriptions}

Requirements:
1. Create engaging, age-appropriate content for children ages 3-8
2. Each page should have 2-4 sentences of story text
3. Include all characters naturally throughout the story
4. Create vivid image prompts for each page illustration
   - CRITICAL: Include the character's EXACT OUTFIT DETAILS in every image prompt where they appear
   - Describe their clothing consistently across all pages
5. Vary the page layouts (text-left, text-right, text-bottom, full-image)
6. End with a positive, heartwarming conclusion`;

  return generateJSON<GeneratedStory>(prompt, { maxTokens: 8192, schema: STORY_SCHEMA });
}

// Image prompt generation
export async function generateImagePrompt(
  scene: string,
  characters: { name: string; appearance: string }[],
  style: string = 'children\'s book illustration, colorful, friendly'
): Promise<string> {
  const characterDetails = characters
    .map((c) => `${c.name}: ${c.appearance}`)
    .join('; ');

  const prompt = `Create a detailed image generation prompt for this children's book scene:

Scene: ${scene}
Characters: ${characterDetails}
Art style: ${style}

Return only the image prompt, no additional text. Make it detailed and specific for AI image generation.`;

  const client = getGeminiClient();
  const response = await client.models.generateContent({
    model: GEMINI_MODELS.TEXT,
    contents: [{ parts: [{ text: prompt }] }],
    config: {
      temperature: 0.6,
      maxOutputTokens: 1024,
    },
  });

  return response.text || '';
}

// Vacation photo analysis types
export interface VacationPhotoAnalysis {
  scene: {
    locationType: string;
    locationName: string | null;
    locationCity: string | null;
    description: string;
    landmarks: string[];
    activities: string[];
    objects: string[];
  };
  atmosphere: {
    timeOfDay: string;
    weather: string;
    mood: string;
    lighting: string;
  };
  people: {
    position: number;
    estimatedAge: string;
    estimatedAgeYears: number;
    estimatedGender: string;
    outfit: {
      full: string;
      top: string | null;
      bottom: string | null;
      shoes: string | null;
      accessories: string | null;
      colors: string[];
      style: string;
    };
    pose: string;
    expression: string;
    distinguishingFeatures: string;
  }[];
  storyPotential: {
    suggestedChapter: string;
    narrativeMoment: string;
    emotionalTone: string;
  };
}

// Schema for vacation photo analysis structured output
const VACATION_PHOTO_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    scene: {
      type: Type.OBJECT,
      properties: {
        locationType: { type: Type.STRING },
        locationName: { type: Type.STRING, nullable: true },
        locationCity: { type: Type.STRING, nullable: true },
        description: { type: Type.STRING },
        landmarks: { type: Type.ARRAY, items: { type: Type.STRING } },
        activities: { type: Type.ARRAY, items: { type: Type.STRING } },
        objects: { type: Type.ARRAY, items: { type: Type.STRING } },
      },
      required: ['locationType', 'description', 'landmarks', 'activities', 'objects'],
    },
    atmosphere: {
      type: Type.OBJECT,
      properties: {
        timeOfDay: { type: Type.STRING },
        weather: { type: Type.STRING },
        mood: { type: Type.STRING },
        lighting: { type: Type.STRING },
      },
      required: ['timeOfDay', 'weather', 'mood', 'lighting'],
    },
    people: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          position: { type: Type.INTEGER },
          estimatedAge: { type: Type.STRING },
          estimatedAgeYears: { type: Type.INTEGER },
          estimatedGender: { type: Type.STRING },
          outfit: {
            type: Type.OBJECT,
            properties: {
              full: { type: Type.STRING },
              top: { type: Type.STRING, nullable: true },
              bottom: { type: Type.STRING, nullable: true },
              shoes: { type: Type.STRING, nullable: true },
              accessories: { type: Type.STRING, nullable: true },
              colors: { type: Type.ARRAY, items: { type: Type.STRING } },
              style: { type: Type.STRING },
            },
            required: ['full', 'colors', 'style'],
          },
          pose: { type: Type.STRING },
          expression: { type: Type.STRING },
          distinguishingFeatures: { type: Type.STRING },
        },
        required: ['position', 'estimatedAge', 'estimatedAgeYears', 'estimatedGender', 'outfit', 'pose', 'expression', 'distinguishingFeatures'],
      },
    },
    storyPotential: {
      type: Type.OBJECT,
      properties: {
        suggestedChapter: { type: Type.STRING },
        narrativeMoment: { type: Type.STRING },
        emotionalTone: { type: Type.STRING },
      },
      required: ['suggestedChapter', 'narrativeMoment', 'emotionalTone'],
    },
  },
  required: ['scene', 'atmosphere', 'people', 'storyPotential'],
};

/**
 * Validate that an uploaded image is appropriate for character creation.
 * Uses a fast, cheap model to check if the image contains a person or character.
 * Returns { valid, reason } — reason explains rejection if invalid.
 */
export async function validateCharacterImage(
  imageBase64: string
): Promise<{ valid: boolean; reason?: string }> {
  const client = getGeminiClient();

  const prompt = `You are a content validator for a children's storybook app.
Look at this image and determine if it is suitable as a CHARACTER reference photo.

A VALID image must contain at least ONE of:
- A person (child, adult, etc.)
- An animal that could be a character
- A drawn/illustrated character

An INVALID image is one that contains NONE of the above, for example:
- A landscape or scenery with no people/animals
- Food, objects, or text only
- Abstract art or patterns
- Screenshots, documents, or memes
- Inappropriate content for children

Respond with ONLY valid JSON: {"valid": true} or {"valid": false, "reason": "brief explanation"}`;

  let mimeType = 'image/jpeg';
  const mimeMatch = imageBase64.match(/^data:(image\/\w+);base64,/);
  if (mimeMatch) {
    mimeType = mimeMatch[1];
  }
  const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '');

  try {
    const response = await client.models.generateContent({
      model: GEMINI_MODELS.TEXT_FALLBACK, // Fast and cheap
      contents: [
        {
          parts: [
            { text: prompt },
            { inlineData: { mimeType, data: base64Data } },
          ],
        },
      ],
      config: {
        responseMimeType: 'application/json',
        maxOutputTokens: 128,
        temperature: 0.1,
      },
    });

    const text = response.text || '{"valid": true}';
    return JSON.parse(text) as { valid: boolean; reason?: string };
  } catch (error) {
    console.error('[validateCharacterImage] Error:', error);
    // On validation failure, allow through to not block users
    return { valid: true };
  }
}

/**
 * Analyze vacation photo with Gemini Vision
 * Returns comprehensive scene and people analysis
 */
export async function analyzeVacationPhoto(
  imageBase64: string
): Promise<VacationPhotoAnalysis> {
  const client = getGeminiClient();
  const modelName = GEMINI_MODELS.VISION;

  const prompt = `You are analyzing a vacation/travel photo for a children's storybook project.
Analyze this photo in EXTREME DETAIL, especially the clothing/outfits of each person.

CRITICAL INSTRUCTIONS FOR OUTFIT DETECTION:
1. Describe EVERY piece of clothing in detail
2. Include specific colors (not just "blue" but "navy blue" or "light blue")
3. Note patterns (stripes, floral, solid, plaid, etc.)
4. Include brand logos if visible
5. Describe accessories thoroughly (sunglasses on head vs wearing, hat style, bag type)
6. For children especially, be very detailed as we need to recreate these outfits in illustrations

People should be ordered LEFT TO RIGHT as they appear in the photo.

For scene.locationType use: beach|museum|restaurant|landmark|hotel|nature|city|park|airport|other
For atmosphere.timeOfDay use: morning|afternoon|sunset|night
For atmosphere.weather use: sunny|cloudy|rainy|indoor
For atmosphere.mood use: excited|peaceful|adventurous|tired|joyful|curious|relaxed
For atmosphere.lighting use: bright|soft|dramatic|indoor
For people[].estimatedAge use: child|teen|adult|elderly
For people[].estimatedGender use: male|female|unknown
For people[].outfit.style use: casual|formal|sporty|beachwear|dressy
For storyPotential.suggestedChapter use: arrival|adventure|rest|climax|conclusion`;

  // Extract MIME type and base64 data
  let mimeType = 'image/jpeg';
  const mimeMatch = imageBase64.match(/^data:(image\/\w+);base64,/);
  if (mimeMatch) {
    mimeType = mimeMatch[1];
  }
  const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '');

  const response = await client.models.generateContent({
    model: modelName,
    contents: [
      {
        parts: [
          { text: prompt },
          {
            inlineData: {
              mimeType,
              data: base64Data,
            },
          },
        ],
      },
    ],
    config: {
      responseMimeType: 'application/json',
      responseSchema: VACATION_PHOTO_SCHEMA,
      temperature: 0.2,
      maxOutputTokens: 4000,
    },
  });

  const text = response.text || '{}';
  return JSON.parse(text) as VacationPhotoAnalysis;
}
