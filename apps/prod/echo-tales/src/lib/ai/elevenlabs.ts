/**
 * ElevenLabs Integration
 *
 * Sound effects generation and voice synthesis via ElevenLabs API.
 * Server-side only.
 */

const ELEVENLABS_API_BASE = 'https://api.elevenlabs.io/v1';

function getApiKey(): string {
  const key = process.env.ELEVENLABS_API_KEY;
  if (!key) throw new Error('ELEVENLABS_API_KEY not configured');
  return key;
}

export interface SoundEffectResult {
  audioBase64: string;
  mimeType: string;
}

/**
 * Generate a sound effect from a text description
 */
export async function generateSoundEffect(
  text: string,
  durationSeconds?: number,
  promptInfluence: number = 0.3,
): Promise<SoundEffectResult> {
  const apiKey = getApiKey();

  const body: Record<string, unknown> = {
    text,
    prompt_influence: promptInfluence,
  };
  if (durationSeconds) {
    body.duration_seconds = Math.min(durationSeconds, 22);
  }

  const response = await fetch(`${ELEVENLABS_API_BASE}/sound-generation`, {
    method: 'POST',
    headers: {
      'xi-api-key': apiKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => 'Unknown error');
    throw new Error(`ElevenLabs SFX failed (${response.status}): ${errorText}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  const audioBase64 = Buffer.from(arrayBuffer).toString('base64');
  const mimeType = response.headers.get('content-type') || 'audio/mpeg';

  return { audioBase64, mimeType };
}

export interface VoiceInfo {
  voice_id: string;
  name: string;
  category: string;
  labels: Record<string, string>;
}

/**
 * List available voices
 */
export async function listVoices(): Promise<VoiceInfo[]> {
  const apiKey = getApiKey();

  const response = await fetch(`${ELEVENLABS_API_BASE}/voices`, {
    headers: { 'xi-api-key': apiKey },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch voices (${response.status})`);
  }

  const data = await response.json();
  return (data.voices || []).map((v: VoiceInfo) => ({
    voice_id: v.voice_id,
    name: v.name,
    category: v.category,
    labels: v.labels || {},
  }));
}

export interface TTSResult {
  audioBase64: string;
  mimeType: string;
}

/**
 * Generate speech from text
 */
export async function textToSpeech(
  text: string,
  voiceId: string = 'pNInz6obpgDQGcFmaJgB', // Adam - default voice
  modelId: string = 'eleven_multilingual_v2',
  settings?: { stability?: number; similarity_boost?: number },
): Promise<TTSResult> {
  const apiKey = getApiKey();

  const response = await fetch(`${ELEVENLABS_API_BASE}/text-to-speech/${voiceId}`, {
    method: 'POST',
    headers: {
      'xi-api-key': apiKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      text,
      model_id: modelId,
      voice_settings: {
        stability: settings?.stability ?? 0.5,
        similarity_boost: settings?.similarity_boost ?? 0.75,
      },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => 'Unknown error');
    throw new Error(`ElevenLabs TTS failed (${response.status}): ${errorText}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  const audioBase64 = Buffer.from(arrayBuffer).toString('base64');
  const mimeType = response.headers.get('content-type') || 'audio/mpeg';

  return { audioBase64, mimeType };
}
