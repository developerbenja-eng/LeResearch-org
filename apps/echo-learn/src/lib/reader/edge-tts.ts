/**
 * Echo Reader - Microsoft Edge TTS Integration
 *
 * Uses Microsoft Edge's online TTS service via @andresaya/edge-tts
 * Provides free, high-quality text-to-speech without API keys.
 *
 * Features:
 * - 36+ audio formats (MP3, WebM, OGG, WAV, PCM)
 * - Multiple voices across 40+ languages
 * - Adjustable pitch, rate, and volume
 * - Word boundary metadata for text highlighting
 * - Streaming support
 *
 * @see https://github.com/andresayac/edge-tts
 */

import { EdgeTTS, Constants } from '@andresaya/edge-tts';

// ============================================================================
// VOICE OPTIONS
// ============================================================================

export interface EdgeTTSVoice {
  id: string;
  name: string;
  shortName: string;
  language: string;
  locale: string;
  gender: 'Male' | 'Female';
  style?: 'conversational' | 'formal' | 'academic';
}

/**
 * Curated list of high-quality English voices for academic content
 */
export const EDGE_TTS_VOICES: EdgeTTSVoice[] = [
  // US English - Female
  { id: 'en-US-JennyNeural', name: 'Jenny', shortName: 'Jenny', language: 'English', locale: 'en-US', gender: 'Female', style: 'conversational' },
  { id: 'en-US-AriaNeural', name: 'Aria', shortName: 'Aria', language: 'English', locale: 'en-US', gender: 'Female', style: 'formal' },
  { id: 'en-US-SaraNeural', name: 'Sara', shortName: 'Sara', language: 'English', locale: 'en-US', gender: 'Female', style: 'conversational' },
  { id: 'en-US-MichelleNeural', name: 'Michelle', shortName: 'Michelle', language: 'English', locale: 'en-US', gender: 'Female', style: 'formal' },
  { id: 'en-US-AnaNeural', name: 'Ana', shortName: 'Ana', language: 'English', locale: 'en-US', gender: 'Female', style: 'conversational' },

  // US English - Male
  { id: 'en-US-GuyNeural', name: 'Guy', shortName: 'Guy', language: 'English', locale: 'en-US', gender: 'Male', style: 'conversational' },
  { id: 'en-US-DavisNeural', name: 'Davis', shortName: 'Davis', language: 'English', locale: 'en-US', gender: 'Male', style: 'formal' },
  { id: 'en-US-TonyNeural', name: 'Tony', shortName: 'Tony', language: 'English', locale: 'en-US', gender: 'Male', style: 'conversational' },
  { id: 'en-US-JasonNeural', name: 'Jason', shortName: 'Jason', language: 'English', locale: 'en-US', gender: 'Male', style: 'formal' },
  { id: 'en-US-BrandonNeural', name: 'Brandon', shortName: 'Brandon', language: 'English', locale: 'en-US', gender: 'Male', style: 'conversational' },

  // UK English - Female
  { id: 'en-GB-SoniaNeural', name: 'Sonia', shortName: 'Sonia', language: 'English', locale: 'en-GB', gender: 'Female', style: 'academic' },
  { id: 'en-GB-LibbyNeural', name: 'Libby', shortName: 'Libby', language: 'English', locale: 'en-GB', gender: 'Female', style: 'conversational' },
  { id: 'en-GB-MaisieNeural', name: 'Maisie', shortName: 'Maisie', language: 'English', locale: 'en-GB', gender: 'Female', style: 'conversational' },

  // UK English - Male
  { id: 'en-GB-RyanNeural', name: 'Ryan', shortName: 'Ryan', language: 'English', locale: 'en-GB', gender: 'Male', style: 'academic' },
  { id: 'en-GB-ThomasNeural', name: 'Thomas', shortName: 'Thomas', language: 'English', locale: 'en-GB', gender: 'Male', style: 'formal' },

  // Australian English
  { id: 'en-AU-NatashaNeural', name: 'Natasha', shortName: 'Natasha', language: 'English', locale: 'en-AU', gender: 'Female', style: 'conversational' },
  { id: 'en-AU-WilliamNeural', name: 'William', shortName: 'William', language: 'English', locale: 'en-AU', gender: 'Male', style: 'formal' },

  // Indian English
  { id: 'en-IN-NeerjaNeural', name: 'Neerja', shortName: 'Neerja', language: 'English', locale: 'en-IN', gender: 'Female', style: 'formal' },
  { id: 'en-IN-PrabhatNeural', name: 'Prabhat', shortName: 'Prabhat', language: 'English', locale: 'en-IN', gender: 'Male', style: 'formal' },
];

// Default voice for academic content
export const DEFAULT_EDGE_VOICE = 'en-US-AriaNeural';

// ============================================================================
// AUDIO FORMAT OPTIONS
// ============================================================================

// Available audio formats from @andresaya/edge-tts
export const EDGE_AUDIO_FORMATS = {
  // MP3 formats (recommended for web)
  MP3_HIGH: Constants.OUTPUT_FORMAT.AUDIO_24KHZ_96KBITRATE_MONO_MP3,
  MP3_MEDIUM: Constants.OUTPUT_FORMAT.AUDIO_24KHZ_96KBITRATE_MONO_MP3,
  MP3_LOW: Constants.OUTPUT_FORMAT.AUDIO_24KHZ_48KBITRATE_MONO_MP3,
  MP3_MOBILE: Constants.OUTPUT_FORMAT.AUDIO_24KHZ_48KBITRATE_MONO_MP3,

  // WebM format (smaller, modern browsers)
  WEBM: Constants.OUTPUT_FORMAT.WEBM_24KHZ_16BIT_MONO_OPUS,
};

// ============================================================================
// SYNTHESIS OPTIONS
// ============================================================================

export interface EdgeTTSSynthesisOptions {
  voice?: string;
  rate?: number; // 0.5 to 2.0 (1.0 = normal)
  pitch?: number; // 0.5 to 2.0 (1.0 = normal)
  volume?: number; // 0 to 1.0 (1.0 = full)
  format?: keyof typeof EDGE_AUDIO_FORMATS;
}

// ============================================================================
// SYNTHESIS FUNCTIONS
// ============================================================================

/**
 * Synthesize text to speech using Edge TTS
 * Returns audio buffer in MP3 format by default
 */
export async function synthesizeWithEdgeTTS(
  text: string,
  options: EdgeTTSSynthesisOptions = {}
): Promise<{ audioData: Buffer; format: string; duration: number }> {
  const voice = options.voice || DEFAULT_EDGE_VOICE;
  const formatKey = options.format || 'MP3_MEDIUM';
  const outputFormat = EDGE_AUDIO_FORMATS[formatKey] || EDGE_AUDIO_FORMATS.MP3_MEDIUM;

  // Convert rate/pitch/volume to Edge TTS format
  // Edge TTS uses percentage strings like '+50%' or '-20%'
  const rate = options.rate ?? 1.0;
  const pitch = options.pitch ?? 1.0;
  const volume = options.volume ?? 1.0;

  const rateStr = rate === 1.0 ? '+0%' : `${rate > 1 ? '+' : ''}${Math.round((rate - 1) * 100)}%`;
  const pitchStr = pitch === 1.0 ? '+0Hz' : `${pitch > 1 ? '+' : ''}${Math.round((pitch - 1) * 50)}Hz`;
  const volumeStr = `${Math.round(volume * 100)}%`;

  console.log(`[Edge TTS] Synthesizing with voice=${voice}, rate=${rateStr}, pitch=${pitchStr}, format=${formatKey}`);

  try {
    const tts = new EdgeTTS();

    await tts.synthesize(text, voice, {
      rate: rateStr,
      pitch: pitchStr,
      volume: volumeStr,
      outputFormat,
    });

    const audioBuffer = tts.toBuffer();
    const audioInfo = tts.getAudioInfo();

    if (!audioBuffer || audioBuffer.length === 0) {
      throw new Error('No audio data generated');
    }

    console.log(`[Edge TTS] Generated ${audioBuffer.length} bytes, duration ~${audioInfo.estimatedDuration}s`);

    return {
      audioData: audioBuffer,
      format: getFormatExtension(formatKey),
      duration: audioInfo.estimatedDuration || 0,
    };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[Edge TTS] Synthesis error:', errorMessage);
    throw new Error(`Edge TTS synthesis failed: ${errorMessage}`);
  }
}

/**
 * Synthesize text with streaming support
 * Yields audio chunks as they're generated
 */
export async function* synthesizeStreamWithEdgeTTS(
  text: string,
  options: EdgeTTSSynthesisOptions = {}
): AsyncGenerator<Buffer, void, unknown> {
  const voice = options.voice || DEFAULT_EDGE_VOICE;
  const formatKey = options.format || 'MP3_MEDIUM';
  const outputFormat = EDGE_AUDIO_FORMATS[formatKey] || EDGE_AUDIO_FORMATS.MP3_MEDIUM;

  const rate = options.rate ?? 1.0;
  const pitch = options.pitch ?? 1.0;
  const volume = options.volume ?? 1.0;

  const rateStr = rate === 1.0 ? '+0%' : `${rate > 1 ? '+' : ''}${Math.round((rate - 1) * 100)}%`;
  const pitchStr = pitch === 1.0 ? '+0Hz' : `${pitch > 1 ? '+' : ''}${Math.round((pitch - 1) * 50)}Hz`;
  const volumeStr = `${Math.round(volume * 100)}%`;

  const tts = new EdgeTTS();

  for await (const chunk of tts.synthesizeStream(text, voice, {
    rate: rateStr,
    pitch: pitchStr,
    volume: volumeStr,
    outputFormat,
  })) {
    // Convert Uint8Array to Buffer for consistency
    yield Buffer.from(chunk);
  }
}

/**
 * Get all available voices from Edge TTS
 */
export async function getEdgeTTSVoices(): Promise<EdgeTTSVoice[]> {
  try {
    const tts = new EdgeTTS();
    const voices = await tts.getVoices();

    return voices
      .filter((v: { Locale: string }) => v.Locale.startsWith('en-'))
      .map((v: { Name: string; ShortName: string; Locale: string; Gender: string }) => ({
        id: v.Name,
        name: v.ShortName.replace('Neural', '').trim(),
        shortName: v.ShortName,
        language: 'English',
        locale: v.Locale,
        gender: v.Gender as 'Male' | 'Female',
      }));
  } catch (error) {
    console.error('[Edge TTS] Failed to get voices:', error);
    return EDGE_TTS_VOICES; // Return predefined list as fallback
  }
}

/**
 * Get file extension for audio format
 */
function getFormatExtension(formatKey: string): string {
  if (formatKey.startsWith('MP3')) return 'mp3';
  if (formatKey === 'WEBM') return 'webm';
  return 'mp3';
}

/**
 * Get content type for audio format
 */
export function getEdgeContentType(formatKey: string): string {
  if (formatKey.startsWith('MP3')) return 'audio/mpeg';
  if (formatKey.startsWith('WEBM')) return 'audio/webm';
  if (formatKey.startsWith('WAV')) return 'audio/wav';
  if (formatKey.startsWith('OGG')) return 'audio/ogg';
  return 'audio/mpeg';
}

/**
 * Edge TTS is always available (no API key needed)
 */
export function isEdgeTTSAvailable(): boolean {
  return true;
}
