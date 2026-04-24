/**
 * Echo Reader - Enhanced Gemini TTS with Emotion & Prosody Control
 *
 * Extends base Gemini TTS with:
 * - Emotion tags: [happy], [sad], [excited], [calm], [serious], [warm]
 * - SSML prosody control: rate, pitch, volume
 * - Automatic narrative emotion analysis
 * - Segment-based generation for varied tone
 *
 * Based on Gemini 2.5 Pro TTS capabilities:
 * @see https://ai.google.dev/gemini-api/docs/speech-generation
 * @see https://docs.cloud.google.com/text-to-speech/docs/ssml
 */

import { GoogleGenAI } from '@google/genai';
import { pcmToWav } from './gemini-tts';

// ============================================================================
// TYPES
// ============================================================================

export type EmotionTag =
  | 'neutral'
  | 'happy'
  | 'sad'
  | 'excited'
  | 'calm'
  | 'serious'
  | 'warm'
  | 'concerned'
  | 'hopeful'
  | 'reflective'
  | 'urgent'
  | 'inspiring'
  | 'empathetic'
  | 'confident'
  | 'whisper'
  | 'passionate';

export interface NarrativeSegment {
  text: string;
  emotion: EmotionTag;
  pace: 'slow' | 'normal' | 'fast';
  emphasis: 'low' | 'normal' | 'high';
  pauseAfter?: number; // milliseconds
  rationale?: string;
}

export interface EnhancedTTSOptions {
  voice?: string;
  model?: 'flash' | 'pro';
  // Scene setting (establishes mood)
  sceneDescription?: string;
  // Director's notes (performance guidance)
  directorNotes?: string;
  // Default emotion if not specified per segment
  defaultEmotion?: EmotionTag;
  // Whether to auto-analyze for emotions
  autoAnalyze?: boolean;
}

// ============================================================================
// EMOTION TAG MAPPINGS
// ============================================================================

/**
 * Maps our emotion tags to Gemini-compatible instructions
 * Gemini 2.5 Pro TTS supports [tag] style emotion control
 */
const EMOTION_INSTRUCTIONS: Record<EmotionTag, string> = {
  neutral: '',
  happy: '[happy, warm] ',
  sad: '[sad, melancholic] ',
  excited: '[excited, energetic] ',
  calm: '[calm, soothing] ',
  serious: '[serious, measured] ',
  warm: '[warm, friendly] ',
  concerned: '[concerned, thoughtful] ',
  hopeful: '[hopeful, optimistic] ',
  reflective: '[reflective, contemplative] ',
  urgent: '[urgent, pressing] ',
  inspiring: '[inspiring, uplifting] ',
  empathetic: '[empathetic, understanding] ',
  confident: '[confident, assured] ',
  whisper: '[whisper] ',
  passionate: '[passionate, heartfelt] ',
};

/**
 * SSML prosody mappings for pace control
 */
const PACE_TO_SSML: Record<'slow' | 'normal' | 'fast', string> = {
  slow: 'rate="slow"',
  normal: 'rate="medium"',
  fast: 'rate="fast"',
};

// ============================================================================
// NARRATIVE ANALYZER
// ============================================================================

/**
 * Patterns for detecting emotional content in narrative text
 */
const EMOTION_PATTERNS: Array<{ pattern: RegExp; emotion: EmotionTag; pace: 'slow' | 'normal' | 'fast' }> = [
  // Hopeful/Inspiring patterns
  { pattern: /\b(imagine|vision|dream|possibility|opportunity|could be|might be|what if)\b/i, emotion: 'hopeful', pace: 'normal' },
  { pattern: /\b(change|transform|revolution|breakthrough|finally|at last)\b/i, emotion: 'inspiring', pace: 'normal' },

  // Serious/Urgent patterns
  { pattern: /\b(uncomfortable truth|real damage|failed|broken|wrong|problem|crisis)\b/i, emotion: 'serious', pace: 'slow' },
  { pattern: /\b(urgently|critical|essential|must|cannot ignore)\b/i, emotion: 'urgent', pace: 'normal' },

  // Warm/Empathetic patterns
  { pattern: /\b(you remember|everyone does|we've all|like you|felt that|understand)\b/i, emotion: 'warm', pace: 'slow' },
  { pattern: /\b(I know|we know|you know|believed|scared|frustrated)\b/i, emotion: 'empathetic', pace: 'slow' },

  // Reflective patterns
  { pattern: /\b(here's what|the truth is|in reality|actually|fundamentally)\b/i, emotion: 'reflective', pace: 'slow' },
  { pattern: /\b(question|ask yourself|wonder|consider|think about)\b/i, emotion: 'reflective', pace: 'slow' },

  // Confident/Assertive patterns
  { pattern: /\b(we're building|we built|we've built|we created|the mission|our goal)\b/i, emotion: 'confident', pace: 'normal' },
  { pattern: /\b(this is|that's|here's|it works|it means)\b/i, emotion: 'confident', pace: 'normal' },

  // Happy/Optimistic patterns
  { pattern: /\b(beautiful|wonderful|amazing|great|love|joy|celebrate)\b/i, emotion: 'happy', pace: 'normal' },

  // Concerned patterns
  { pattern: /\b(might be wrong|could fail|worry|concern|risk|danger)\b/i, emotion: 'concerned', pace: 'slow' },
];

/**
 * Section-level emotion mapping for narrative documents
 */
const SECTION_EMOTIONS: Record<string, { emotion: EmotionTag; pace: 'slow' | 'normal' | 'fast' }> = {
  'the teacher who changed': { emotion: 'warm', pace: 'slow' },
  'you remember': { emotion: 'reflective', pace: 'slow' },
  'why now': { emotion: 'serious', pace: 'normal' },
  'what we actually built': { emotion: 'confident', pace: 'normal' },
  "what you'll actually experience": { emotion: 'confident', pace: 'normal' },
  "maria's story": { emotion: 'warm', pace: 'slow' },
  'the family bridge': { emotion: 'warm', pace: 'normal' },
  "what we're not doing": { emotion: 'serious', pace: 'normal' },
  "what we don't do": { emotion: 'serious', pace: 'normal' },
  'the mission': { emotion: 'inspiring', pace: 'normal' },
  'what could go wrong': { emotion: 'concerned', pace: 'slow' },
  'the invitation': { emotion: 'hopeful', pace: 'normal' },
  'try it': { emotion: 'hopeful', pace: 'normal' },
};

/**
 * Analyze a paragraph and determine its emotional tone
 */
function analyzeEmotionForParagraph(text: string, sectionTitle?: string): { emotion: EmotionTag; pace: 'slow' | 'normal' | 'fast' } {
  // Check section title first
  if (sectionTitle) {
    const lowerTitle = sectionTitle.toLowerCase();
    for (const [key, value] of Object.entries(SECTION_EMOTIONS)) {
      if (lowerTitle.includes(key)) {
        return value;
      }
    }
  }

  // Check patterns in text
  for (const { pattern, emotion, pace } of EMOTION_PATTERNS) {
    if (pattern.test(text)) {
      return { emotion, pace };
    }
  }

  // Default
  return { emotion: 'neutral', pace: 'normal' };
}

/**
 * Analyze entire narrative document and split into emotional segments
 */
export function analyzeNarrativeEmotions(text: string): NarrativeSegment[] {
  const segments: NarrativeSegment[] = [];

  // Split by sections (## headers) or paragraphs
  const parts = text.split(/(?=^##\s)/m);

  for (const part of parts) {
    if (!part.trim()) continue;

    // Extract section title if present
    const titleMatch = part.match(/^##\s+(.+)$/m);
    const sectionTitle = titleMatch ? titleMatch[1] : undefined;

    // Split into paragraphs
    const paragraphs = part.split(/\n\n+/).filter(p => p.trim() && !p.startsWith('##'));

    for (const para of paragraphs) {
      const cleanPara = para.replace(/\*\*/g, '').replace(/\*/g, '').trim();
      if (!cleanPara || cleanPara.startsWith('---')) continue;

      const { emotion, pace } = analyzeEmotionForParagraph(cleanPara, sectionTitle);

      // Determine if this paragraph needs emphasis
      const hasQuote = cleanPara.includes('"') || cleanPara.includes('"');
      const isQuestion = cleanPara.includes('?');
      const isShort = cleanPara.length < 100;

      segments.push({
        text: cleanPara,
        emotion,
        pace,
        emphasis: isQuestion || isShort ? 'high' : hasQuote ? 'normal' : 'normal',
        pauseAfter: sectionTitle && para === paragraphs[0] ? 1500 : 800,
        rationale: sectionTitle ? `Section: ${sectionTitle}` : undefined,
      });
    }
  }

  return segments;
}

// ============================================================================
// ENHANCED SYNTHESIS
// ============================================================================

let genaiClient: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI {
  if (!genaiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY environment variable is required');
    }
    genaiClient = new GoogleGenAI({ apiKey });
  }
  return genaiClient;
}

/**
 * Apply emotion and prosody markers to text
 */
function applyEmotionMarkers(segment: NarrativeSegment): string {
  const emotionPrefix = EMOTION_INSTRUCTIONS[segment.emotion];

  // Build SSML-like structure for complex control
  let markedText = segment.text;

  // Add emotion tag prefix
  if (emotionPrefix) {
    markedText = emotionPrefix + markedText;
  }

  // Add pause after if specified
  if (segment.pauseAfter && segment.pauseAfter > 500) {
    markedText += ` <break time="${segment.pauseAfter}ms"/>`;
  }

  return markedText;
}

/**
 * Build complete prompt with director's notes
 */
function buildNarrativePrompt(
  segments: NarrativeSegment[],
  options: EnhancedTTSOptions
): string {
  const parts: string[] = [];

  // Audio Profile / Scene Description
  if (options.sceneDescription) {
    parts.push(`SCENE: ${options.sceneDescription}`);
  } else {
    parts.push(`SCENE: A thoughtful narrator sharing important ideas about education and human potential. The setting is intimate, like a fireside conversation.`);
  }

  // Director's Notes
  if (options.directorNotes) {
    parts.push(`DIRECTION: ${options.directorNotes}`);
  } else {
    parts.push(`DIRECTION: Read with genuine conviction. Vary your pace - slow down for emotional moments, maintain energy for inspiring sections. Use natural pauses. This is not a lecture; it's a personal invitation.`);
  }

  parts.push('\n---\n');

  // Add each segment with its emotion markers
  for (const segment of segments) {
    parts.push(applyEmotionMarkers(segment));
    parts.push(''); // Empty line for natural pause
  }

  return parts.join('\n');
}

/**
 * Synthesize a single segment with emotion control
 */
async function synthesizeSegment(
  segment: NarrativeSegment,
  options: EnhancedTTSOptions
): Promise<Buffer> {
  const client = getGeminiClient();
  const voice = options.voice || 'Charon';
  const model = options.model === 'pro'
    ? 'gemini-2.5-pro-preview-tts'
    : 'gemini-2.5-flash-preview-tts';

  const markedText = applyEmotionMarkers(segment);

  // Build prompt with emotion and pace guidance
  const prompt = `${EMOTION_INSTRUCTIONS[segment.emotion]}Speak at a ${segment.pace} pace. ${markedText}`;

  const response = await client.models.generateContent({
    model,
    contents: [{ parts: [{ text: prompt }] }],
    config: {
      responseModalities: ['AUDIO'],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName: voice },
        },
      },
    },
  });

  const audioData = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  if (!audioData) {
    throw new Error('No audio data received from Gemini TTS');
  }

  return Buffer.from(audioData, 'base64');
}

/**
 * Synthesize complete narrative with emotion analysis
 * Generates each segment separately for better tone variation
 */
export async function synthesizeNarrativeWithEmotion(
  text: string,
  options: EnhancedTTSOptions = {}
): Promise<{ wav: Buffer; segments: NarrativeSegment[] }> {
  console.log('[Enhanced TTS] Analyzing narrative emotions...');

  // Analyze the narrative
  const segments = analyzeNarrativeEmotions(text);
  console.log(`[Enhanced TTS] Found ${segments.length} segments with varied emotions`);

  // Log emotion distribution
  const emotionCounts: Record<string, number> = {};
  for (const seg of segments) {
    emotionCounts[seg.emotion] = (emotionCounts[seg.emotion] || 0) + 1;
  }
  console.log('[Enhanced TTS] Emotion distribution:', emotionCounts);

  // For short narratives, synthesize as one piece with emotion markers
  if (segments.length < 20) {
    const fullPrompt = buildNarrativePrompt(segments, options);

    const client = getGeminiClient();
    const voice = options.voice || 'Achird'; // Warm, friendly voice for narratives
    const model = options.model === 'pro'
      ? 'gemini-2.5-pro-preview-tts'
      : 'gemini-2.5-flash-preview-tts';

    console.log(`[Enhanced TTS] Generating with model=${model}, voice=${voice}`);

    const response = await client.models.generateContent({
      model,
      contents: [{ parts: [{ text: fullPrompt }] }],
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: voice },
          },
        },
      },
    });

    const audioData = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!audioData) {
      throw new Error('No audio data received from Gemini TTS');
    }

    const pcmBuffer = Buffer.from(audioData, 'base64');
    const wavBuffer = pcmToWav(pcmBuffer, 24000, 1, 16);

    console.log(`[Enhanced TTS] Generated ${wavBuffer.length} bytes of WAV audio`);

    return { wav: wavBuffer, segments };
  }

  // For longer narratives, synthesize in chunks
  console.log('[Enhanced TTS] Long narrative - synthesizing in chunks...');
  const pcmBuffers: Buffer[] = [];
  const chunkSize = 15;

  for (let i = 0; i < segments.length; i += chunkSize) {
    const chunkSegments = segments.slice(i, i + chunkSize);
    const chunkPrompt = buildNarrativePrompt(chunkSegments, options);

    const client = getGeminiClient();
    const voice = options.voice || 'Achird';
    const model = options.model === 'pro'
      ? 'gemini-2.5-pro-preview-tts'
      : 'gemini-2.5-flash-preview-tts';

    console.log(`[Enhanced TTS] Chunk ${Math.floor(i/chunkSize) + 1}/${Math.ceil(segments.length/chunkSize)}`);

    const response = await client.models.generateContent({
      model,
      contents: [{ parts: [{ text: chunkPrompt }] }],
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: voice },
          },
        },
      },
    });

    const audioData = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!audioData) {
      throw new Error('No audio data received from Gemini TTS');
    }

    pcmBuffers.push(Buffer.from(audioData, 'base64'));

    // Small delay between chunks to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  // Combine all PCM buffers
  const combinedPcm = Buffer.concat(pcmBuffers);
  const wavBuffer = pcmToWav(combinedPcm, 24000, 1, 16);

  console.log(`[Enhanced TTS] Generated ${wavBuffer.length} bytes of combined WAV audio`);

  return { wav: wavBuffer, segments };
}

/**
 * Available voices optimized for narrative content
 */
export const NARRATIVE_VOICES = {
  // Best for warm, personal narratives
  warm: 'Achird',       // Friendly and welcoming
  empathetic: 'Sulafat', // Warm and comforting

  // Best for inspiring content
  inspiring: 'Pulcherrima', // Forward and engaging
  passionate: 'Fenrir',     // Dynamic and energetic

  // Best for serious/academic content
  serious: 'Charon',        // Informative and clear
  authoritative: 'Kore',    // Firm and authoritative

  // Best for storytelling
  storyteller: 'Iapetus',   // Clear and articulate
  intimate: 'Enceladus',    // Breathy and intimate
};

/**
 * Get recommended voice for narrative type
 */
export function getVoiceForNarrative(
  type: 'manifesto' | 'story' | 'academic' | 'invitation' | 'personal'
): string {
  switch (type) {
    case 'manifesto':
      return NARRATIVE_VOICES.inspiring;
    case 'story':
      return NARRATIVE_VOICES.storyteller;
    case 'academic':
      return NARRATIVE_VOICES.serious;
    case 'invitation':
      return NARRATIVE_VOICES.warm;
    case 'personal':
      return NARRATIVE_VOICES.empathetic;
    default:
      return NARRATIVE_VOICES.warm;
  }
}
