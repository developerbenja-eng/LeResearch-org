/**
 * Echo Reader - Gemini 2.5 Text-to-Speech Integration
 *
 * Uses Gemini 2.5 TTS models for high-quality, controllable speech synthesis.
 * These models support natural language style control, multiple voices, and
 * multi-speaker capabilities.
 *
 * Models:
 * - gemini-2.5-flash-preview-tts (faster, good quality)
 * - gemini-2.5-pro-preview-tts (highest quality)
 *
 * @see https://ai.google.dev/gemini-api/docs/speech-generation
 */

import { GoogleGenAI } from '@google/genai';

// ============================================================================
// CLIENT INITIALIZATION
// ============================================================================

let genaiClient: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI {
  if (!genaiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY environment variable is required for Gemini TTS');
    }
    genaiClient = new GoogleGenAI({ apiKey });
  }
  return genaiClient;
}

// ============================================================================
// VOICE OPTIONS
// ============================================================================

export interface GeminiTTSVoice {
  id: string;
  name: string;
  style: string;
  description: string;
  recommended_for: string[];
}

/**
 * Available Gemini TTS voices (30 total)
 * Each voice has a distinct personality and style
 */
export const GEMINI_TTS_VOICES: GeminiTTSVoice[] = [
  // Bright and Upbeat voices
  { id: 'Zephyr', name: 'Zephyr', style: 'Bright', description: 'Bright and cheerful voice', recommended_for: ['narration', 'explainers'] },
  { id: 'Puck', name: 'Puck', style: 'Upbeat', description: 'Upbeat and energetic voice', recommended_for: ['podcasts', 'entertainment'] },
  { id: 'Aoede', name: 'Aoede', style: 'Breezy', description: 'Breezy and light voice', recommended_for: ['casual content', 'tutorials'] },
  { id: 'Autonoe', name: 'Autonoe', style: 'Bright', description: 'Bright and clear voice', recommended_for: ['educational', 'presentations'] },
  { id: 'Laomedeia', name: 'Laomedeia', style: 'Upbeat', description: 'Upbeat and friendly voice', recommended_for: ['marketing', 'announcements'] },

  // Firm and Professional voices
  { id: 'Kore', name: 'Kore', style: 'Firm', description: 'Firm and authoritative voice', recommended_for: ['academic', 'documentation'] },
  { id: 'Orus', name: 'Orus', style: 'Firm', description: 'Firm and confident voice', recommended_for: ['news', 'reports'] },
  { id: 'Alnilam', name: 'Alnilam', style: 'Firm', description: 'Firm and steady voice', recommended_for: ['technical', 'instructions'] },

  // Informative and Clear voices
  { id: 'Charon', name: 'Charon', style: 'Informative', description: 'Informative and clear voice', recommended_for: ['educational', 'explainers'] },
  { id: 'Rasalgethi', name: 'Rasalgethi', style: 'Informative', description: 'Informative and measured voice', recommended_for: ['documentaries', 'lectures'] },
  { id: 'Iapetus', name: 'Iapetus', style: 'Clear', description: 'Clear and articulate voice', recommended_for: ['audiobooks', 'narration'] },
  { id: 'Erinome', name: 'Erinome', style: 'Clear', description: 'Clear and pleasant voice', recommended_for: ['tutorials', 'guides'] },

  // Smooth and Gentle voices
  { id: 'Algieba', name: 'Algieba', style: 'Smooth', description: 'Smooth and flowing voice', recommended_for: ['meditation', 'relaxation'] },
  { id: 'Despina', name: 'Despina', style: 'Smooth', description: 'Smooth and soothing voice', recommended_for: ['storytelling', 'bedtime'] },
  { id: 'Achernar', name: 'Achernar', style: 'Soft', description: 'Soft and gentle voice', recommended_for: ['ASMR', 'calming content'] },
  { id: 'Vindemiatrix', name: 'Vindemiatrix', style: 'Gentle', description: 'Gentle and warm voice', recommended_for: ['wellness', 'self-help'] },

  // Easy-going and Casual voices
  { id: 'Callirrhoe', name: 'Callirrhoe', style: 'Easy-going', description: 'Easy-going and relaxed voice', recommended_for: ['casual', 'conversational'] },
  { id: 'Umbriel', name: 'Umbriel', style: 'Easy-going', description: 'Easy-going and approachable voice', recommended_for: ['vlogs', 'personal'] },
  { id: 'Zubenelgenubi', name: 'Zubenelgenubi', style: 'Casual', description: 'Casual and friendly voice', recommended_for: ['social media', 'casual'] },

  // Expressive and Unique voices
  { id: 'Fenrir', name: 'Fenrir', style: 'Excitable', description: 'Excitable and dynamic voice', recommended_for: ['gaming', 'excitement'] },
  { id: 'Leda', name: 'Leda', style: 'Youthful', description: 'Youthful and fresh voice', recommended_for: ['youth content', 'modern'] },
  { id: 'Enceladus', name: 'Enceladus', style: 'Breathy', description: 'Breathy and intimate voice', recommended_for: ['intimate', 'dramatic'] },
  { id: 'Algenib', name: 'Algenib', style: 'Gravelly', description: 'Gravelly and textured voice', recommended_for: ['drama', 'character'] },

  // Warm and Friendly voices
  { id: 'Achird', name: 'Achird', style: 'Friendly', description: 'Friendly and welcoming voice', recommended_for: ['customer service', 'welcome'] },
  { id: 'Sulafat', name: 'Sulafat', style: 'Warm', description: 'Warm and comforting voice', recommended_for: ['support', 'empathy'] },

  // Professional and Mature voices
  { id: 'Gacrux', name: 'Gacrux', style: 'Mature', description: 'Mature and distinguished voice', recommended_for: ['executive', 'serious'] },
  { id: 'Schedar', name: 'Schedar', style: 'Even', description: 'Even and balanced voice', recommended_for: ['neutral', 'objective'] },
  { id: 'Sadaltager', name: 'Sadaltager', style: 'Knowledgeable', description: 'Knowledgeable and assured voice', recommended_for: ['expert', 'authority'] },

  // Lively and Forward voices
  { id: 'Sadachbia', name: 'Sadachbia', style: 'Lively', description: 'Lively and spirited voice', recommended_for: ['events', 'celebrations'] },
  { id: 'Pulcherrima', name: 'Pulcherrima', style: 'Forward', description: 'Forward and engaging voice', recommended_for: ['presentations', 'pitches'] },
];

// Default voice for academic content
export const DEFAULT_ACADEMIC_VOICE = 'Charon'; // Informative style, great for papers

// ============================================================================
// SYNTHESIS OPTIONS
// ============================================================================

export interface GeminiTTSOptions {
  voice?: string;
  model?: 'flash' | 'pro';
  // Style control via natural language
  stylePrompt?: string;
  // Pacing control
  pace?: 'slow' | 'normal' | 'fast';
  // For academic papers
  readingStyle?: 'academic' | 'conversational' | 'formal';
}

// ============================================================================
// SYNTHESIS FUNCTIONS
// ============================================================================

/**
 * Synthesize text to speech using Gemini 2.5 TTS
 * Returns raw PCM audio data (24kHz, 16-bit, mono)
 */
export async function synthesizeWithGeminiTTS(
  text: string,
  options: GeminiTTSOptions = {}
): Promise<{ audioData: Buffer; format: 'pcm'; sampleRate: number; channels: number; bitDepth: number }> {
  const client = getGeminiClient();

  const voice = options.voice || DEFAULT_ACADEMIC_VOICE;
  const model = options.model === 'pro'
    ? 'gemini-2.5-pro-preview-tts'
    : 'gemini-2.5-flash-preview-tts';

  // Build the content with optional style instructions
  let content = text;

  if (options.stylePrompt) {
    content = `${options.stylePrompt}\n\n${text}`;
  } else if (options.readingStyle === 'academic') {
    content = `Read this academic text in a clear, measured, and informative tone. Maintain a professional pace suitable for comprehension of complex material:\n\n${text}`;
  } else if (options.readingStyle === 'conversational') {
    content = `Read this in a friendly, conversational tone as if explaining to a colleague:\n\n${text}`;
  }

  // Add pacing instructions if specified
  if (options.pace === 'slow') {
    content = `Speak slowly and deliberately, pausing between sentences for clarity.\n\n${content}`;
  } else if (options.pace === 'fast') {
    content = `Speak at a brisk, energetic pace.\n\n${content}`;
  }

  console.log(`[Gemini TTS] Generating with model=${model}, voice=${voice}, text length=${text.length}`);

  try {
    const response = await client.models.generateContent({
      model,
      contents: [{ parts: [{ text: content }] }],
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

    // Decode base64 to buffer
    const audioBuffer = Buffer.from(audioData, 'base64');

    console.log(`[Gemini TTS] Generated ${audioBuffer.length} bytes of PCM audio`);

    return {
      audioData: audioBuffer,
      format: 'pcm',
      sampleRate: 24000,
      channels: 1,
      bitDepth: 16,
    };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[Gemini TTS] Synthesis error:', errorMessage);
    throw new Error(`Gemini TTS synthesis failed: ${errorMessage}`);
  }
}

/**
 * Convert PCM audio to WAV format
 * WAV is a simple container that adds a header to PCM data
 */
export function pcmToWav(
  pcmData: Buffer,
  sampleRate: number = 24000,
  channels: number = 1,
  bitDepth: number = 16
): Buffer {
  const byteRate = sampleRate * channels * (bitDepth / 8);
  const blockAlign = channels * (bitDepth / 8);
  const dataSize = pcmData.length;
  const headerSize = 44;
  const fileSize = headerSize + dataSize - 8;

  const header = Buffer.alloc(headerSize);

  // RIFF header
  header.write('RIFF', 0);
  header.writeUInt32LE(fileSize, 4);
  header.write('WAVE', 8);

  // fmt chunk
  header.write('fmt ', 12);
  header.writeUInt32LE(16, 16); // fmt chunk size
  header.writeUInt16LE(1, 20); // audio format (1 = PCM)
  header.writeUInt16LE(channels, 22);
  header.writeUInt32LE(sampleRate, 24);
  header.writeUInt32LE(byteRate, 28);
  header.writeUInt16LE(blockAlign, 32);
  header.writeUInt16LE(bitDepth, 34);

  // data chunk
  header.write('data', 36);
  header.writeUInt32LE(dataSize, 40);

  return Buffer.concat([header, pcmData]);
}

/**
 * Synthesize and convert to WAV in one step
 */
export async function synthesizeToWav(
  text: string,
  options: GeminiTTSOptions = {}
): Promise<Buffer> {
  const result = await synthesizeWithGeminiTTS(text, options);
  return pcmToWav(result.audioData, result.sampleRate, result.channels, result.bitDepth);
}

/**
 * Synthesize long text by splitting into chunks
 * Gemini TTS has a context window of 32k tokens
 */
export async function synthesizeLongText(
  text: string,
  options: GeminiTTSOptions = {}
): Promise<Buffer> {
  // Estimate tokens (rough: 4 chars per token)
  const estimatedTokens = text.length / 4;
  const MAX_TOKENS = 30000; // Leave margin from 32k limit

  if (estimatedTokens <= MAX_TOKENS) {
    return synthesizeToWav(text, options);
  }

  console.log(`[Gemini TTS] Text too long (${estimatedTokens} estimated tokens), splitting...`);

  // Split by paragraphs first, then sentences
  const paragraphs = text.split(/\n\n+/);
  const chunks: string[] = [];
  let currentChunk = '';

  for (const paragraph of paragraphs) {
    const potentialChunk = currentChunk + '\n\n' + paragraph;
    const potentialTokens = potentialChunk.length / 4;

    if (potentialTokens > MAX_TOKENS) {
      if (currentChunk) {
        chunks.push(currentChunk.trim());
      }

      // If single paragraph is too long, split by sentences
      if (paragraph.length / 4 > MAX_TOKENS) {
        const sentences = paragraph.match(/[^.!?]+[.!?]+/g) || [paragraph];
        let sentenceChunk = '';

        for (const sentence of sentences) {
          const potentialSentenceChunk = sentenceChunk + ' ' + sentence;
          if (potentialSentenceChunk.length / 4 > MAX_TOKENS) {
            if (sentenceChunk) chunks.push(sentenceChunk.trim());
            sentenceChunk = sentence;
          } else {
            sentenceChunk = potentialSentenceChunk;
          }
        }
        if (sentenceChunk.trim()) chunks.push(sentenceChunk.trim());
        currentChunk = '';
      } else {
        currentChunk = paragraph;
      }
    } else {
      currentChunk = potentialChunk;
    }
  }

  if (currentChunk.trim()) {
    chunks.push(currentChunk.trim());
  }

  console.log(`[Gemini TTS] Split into ${chunks.length} chunks`);

  // Synthesize each chunk
  const wavBuffers: Buffer[] = [];
  for (let i = 0; i < chunks.length; i++) {
    console.log(`[Gemini TTS] Processing chunk ${i + 1}/${chunks.length}`);
    const wavBuffer = await synthesizeToWav(chunks[i], options);
    wavBuffers.push(wavBuffer);
  }

  // For multiple WAV files, we need to concatenate the PCM data
  // Extract PCM from each WAV (skip 44-byte header), then create new WAV
  const pcmBuffers = wavBuffers.map(wav => wav.slice(44));
  const combinedPcm = Buffer.concat(pcmBuffers);

  return pcmToWav(combinedPcm);
}

/**
 * Check if Gemini TTS is available (API key configured)
 */
export function isGeminiTTSAvailable(): boolean {
  return !!process.env.GEMINI_API_KEY;
}

/**
 * Get recommended voice for content type
 */
export function getRecommendedVoice(contentType: 'academic' | 'casual' | 'news' | 'storytelling'): string {
  switch (contentType) {
    case 'academic':
      return 'Charon'; // Informative
    case 'casual':
      return 'Puck'; // Upbeat
    case 'news':
      return 'Kore'; // Firm
    case 'storytelling':
      return 'Iapetus'; // Clear
    default:
      return DEFAULT_ACADEMIC_VOICE;
  }
}
