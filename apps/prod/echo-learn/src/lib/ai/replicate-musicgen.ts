/**
 * Replicate MusicGen Integration
 *
 * Melody-conditioned music generation using Meta's MusicGen via Replicate API.
 * Server-side only.
 */

const REPLICATE_API_BASE = 'https://api.replicate.com/v1';
const MUSICGEN_MODEL = 'meta/musicgen:671ac645ce5e552cc63a54a2bbff63fcf798043055d2dac5fc9e36a837eedbd';

function getApiToken(): string {
  const token = process.env.REPLICATE_API_TOKEN;
  if (!token) throw new Error('REPLICATE_API_TOKEN not configured');
  return token;
}

export interface MusicGenInput {
  prompt: string;
  duration?: number;       // seconds, default 8
  temperature?: number;    // 0-2, default 1
  topK?: number;           // default 250
  topP?: number;           // default 0.95
  cfgCoef?: number;        // classifier-free guidance, default 3
  melodyBase64?: string;   // optional melody conditioning audio
}

export interface MusicGenJob {
  id: string;
  status: 'starting' | 'processing' | 'succeeded' | 'failed' | 'canceled';
  outputUrl?: string;
  error?: string;
}

/**
 * Start a MusicGen prediction
 */
export async function startMusicGen(input: MusicGenInput): Promise<MusicGenJob> {
  const token = getApiToken();

  const replicateInput: Record<string, unknown> = {
    prompt: input.prompt,
    duration: Math.min(input.duration || 8, 30),
    temperature: input.temperature || 1.0,
    top_k: input.topK || 250,
    top_p: input.topP || 0.95,
    classifier_free_guidance: input.cfgCoef || 3,
    output_format: 'wav',
  };

  if (input.melodyBase64) {
    replicateInput.input_audio = `data:audio/wav;base64,${input.melodyBase64}`;
  }

  const response = await fetch(`${REPLICATE_API_BASE}/predictions`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      version: MUSICGEN_MODEL.split(':')[1],
      input: replicateInput,
    }),
  });

  if (!response.ok) {
    const err = await response.text().catch(() => 'Unknown error');
    throw new Error(`Replicate prediction failed (${response.status}): ${err}`);
  }

  const data = await response.json();
  return {
    id: data.id,
    status: data.status,
  };
}

/**
 * Check the status of a MusicGen prediction
 */
export async function checkMusicGen(predictionId: string): Promise<MusicGenJob> {
  const token = getApiToken();

  const response = await fetch(`${REPLICATE_API_BASE}/predictions/${predictionId}`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });

  if (!response.ok) {
    throw new Error(`Failed to check prediction (${response.status})`);
  }

  const data = await response.json();

  return {
    id: data.id,
    status: data.status,
    outputUrl: data.output ? (Array.isArray(data.output) ? data.output[0] : data.output) : undefined,
    error: data.error,
  };
}

/**
 * Cancel a running prediction
 */
export async function cancelMusicGen(predictionId: string): Promise<void> {
  const token = getApiToken();

  await fetch(`${REPLICATE_API_BASE}/predictions/${predictionId}/cancel`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` },
  });
}
