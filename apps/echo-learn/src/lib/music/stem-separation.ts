import { Client, handle_file } from '@gradio/client';
import type { StemName } from '@/types/visualizer';

export interface StemSeparationResult {
  stems: Record<StemName, Buffer>;
}

/**
 * Separate audio into 4 stems using Demucs via HuggingFace Spaces.
 *
 * Uses the ahk-d/Spleeter-HT-Demucs-Stem-Separation-2025 Space which
 * runs HT-Demucs and returns: drums, bass, other, vocals.
 *
 * API: separate_selected_models
 *   inputs: [audio (file), ht_demucs (bool), spleeter (bool)]
 *   outputs: [drums, bass, other, vocals, ...spleeter stems..., status]
 *   We only use HT-Demucs outputs (indices 0-3).
 */
const HF_SPACE_4STEM = 'ahk-d/Spleeter-HT-Demucs-Stem-Separation-2025';
const HF_SPACE_2STEM = 'abidlabs/music-separation';

function bufferToBlob(buf: Buffer, type: string): Blob {
  // Copy into a fresh ArrayBuffer to avoid SharedArrayBuffer issues
  const ab = new ArrayBuffer(buf.length);
  const view = new Uint8Array(ab);
  for (let i = 0; i < buf.length; i++) view[i] = buf[i];
  return new Blob([ab], { type });
}

async function fetchAudioBlob(data: unknown): Promise<Buffer> {
  // Gradio can return { url: string } or { data: string } or a raw URL string
  if (data && typeof data === 'object' && 'url' in data) {
    const url = (data as { url: string }).url;
    const resp = await fetch(url);
    if (!resp.ok) throw new Error(`Failed to fetch stem from ${url}: ${resp.status}`);
    const arrayBuffer = await resp.arrayBuffer();
    return Buffer.from(arrayBuffer);
  }
  if (typeof data === 'string' && data.startsWith('http')) {
    const resp = await fetch(data);
    if (!resp.ok) throw new Error(`Failed to fetch stem from ${data}: ${resp.status}`);
    const arrayBuffer = await resp.arrayBuffer();
    return Buffer.from(arrayBuffer);
  }
  throw new Error(`Unexpected stem data format: ${typeof data}`);
}

/**
 * 4-stem separation using HT-Demucs.
 * Falls back to 2-stem separation if the 4-stem space is unavailable.
 */
export async function separateStems(audioBuffer: Buffer): Promise<StemSeparationResult> {
  // Try 4-stem first
  try {
    return await separate4Stems(audioBuffer);
  } catch (err) {
    console.warn('4-stem separation failed, falling back to 2-stem:', err);
    return await separate2Stems(audioBuffer);
  }
}

async function separate4Stems(audioBuffer: Buffer): Promise<StemSeparationResult> {
  const client = await Client.connect(HF_SPACE_4STEM, {
    token: process.env.HF_TOKEN as `hf_${string}` | undefined,
  });

  const audioBlob = bufferToBlob(audioBuffer, 'audio/wav');

  const result = await client.predict('/separate_selected_models', {
    audio_file: handle_file(audioBlob),
    use_htdemucs: true,
    use_spleeter: false,
  });

  const outputs = result.data as unknown[];

  // HT-Demucs outputs: [0]=drums, [1]=bass, [2]=other, [3]=vocals
  const [drumsData, bassData, otherData, vocalsData] = outputs;

  const [drums, bass, other, vocals] = await Promise.all([
    fetchAudioBlob(drumsData),
    fetchAudioBlob(bassData),
    fetchAudioBlob(otherData),
    fetchAudioBlob(vocalsData),
  ]);

  return { stems: { vocals, drums, bass, other } };
}

async function separate2Stems(audioBuffer: Buffer): Promise<StemSeparationResult> {
  const client = await Client.connect(HF_SPACE_2STEM, {
    token: process.env.HF_TOKEN as `hf_${string}` | undefined,
  });

  const audioBlob = bufferToBlob(audioBuffer, 'audio/wav');

  const result = await client.predict('/predict', {
    audio: handle_file(audioBlob),
  });

  const outputs = result.data as unknown[];

  // 2-stem outputs: [0]=vocals, [1]=accompaniment
  const [vocalsData, accompData] = outputs;

  const [vocals, other] = await Promise.all([
    fetchAudioBlob(vocalsData),
    fetchAudioBlob(accompData),
  ]);

  // For 2-stem mode, put the accompaniment in "other" and leave drums/bass as silent copies
  // The UI will show 4 tracks but drums and bass will mirror "other"
  return {
    stems: {
      vocals,
      drums: other,
      bass: other,
      other,
    },
  };
}
