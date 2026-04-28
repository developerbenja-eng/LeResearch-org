/**
 * Dolby.io Media Enhance (Mastering) Integration
 *
 * Cloud-based audio mastering using Dolby.io Enhance API.
 * Server-side only.
 */

const DOLBY_API_BASE = 'https://api.dolby.com';

function getApiKey(): string {
  const key = process.env.DOLBY_API_KEY;
  if (!key) throw new Error('DOLBY_API_KEY not configured');
  return key;
}

export type MasteringPreset =
  | 'music_standard'
  | 'music_mastering'
  | 'podcast'
  | 'voice_over'
  | 'studio';

export interface MasteringOptions {
  preset: MasteringPreset;
  loudnessTarget?: number; // -24 to 0 LUFS
  dynamicRange?: 'low' | 'medium' | 'high';
  stereoWidth?: number; // 0-100
}

export interface MasteringJobResult {
  jobId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  outputUrl?: string;
  error?: string;
}

/**
 * Upload audio to Dolby.io temporary storage and start mastering
 */
export async function startMasteringJob(
  audioBuffer: Buffer,
  options: MasteringOptions,
): Promise<MasteringJobResult> {
  const apiKey = getApiKey();

  // Step 1: Get a pre-signed upload URL
  const uploadResponse = await fetch(`${DOLBY_API_BASE}/media/input`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      url: `dlb://producer-input/${Date.now()}.wav`,
    }),
  });

  if (!uploadResponse.ok) {
    const err = await uploadResponse.text().catch(() => 'Upload init failed');
    throw new Error(`Dolby upload init failed (${uploadResponse.status}): ${err}`);
  }

  const { url: uploadUrl } = await uploadResponse.json();

  // Step 2: Upload the audio file (explicit ArrayBuffer copy for TypeScript strict mode)
  const ab = new ArrayBuffer(audioBuffer.byteLength);
  new Uint8Array(ab).set(new Uint8Array(audioBuffer.buffer, audioBuffer.byteOffset, audioBuffer.byteLength));
  const uploadBlob = new Blob([ab], { type: 'audio/wav' });
  await fetch(uploadUrl, {
    method: 'PUT',
    headers: { 'Content-Type': 'audio/wav' },
    body: uploadBlob,
  });

  // Step 3: Start the enhance job
  const enhanceBody: Record<string, unknown> = {
    input: `dlb://producer-input/${Date.now()}.wav`,
    output: `dlb://producer-output/${Date.now()}-mastered.wav`,
    content: {
      type: options.preset === 'podcast' ? 'podcast' : 'music',
    },
    audio: {
      loudness: {
        enable: true,
        dialog_intelligence: false,
        ...(options.loudnessTarget ? { target_level: options.loudnessTarget } : {}),
      },
      dynamics: {
        range_control: {
          enable: true,
          amount: options.dynamicRange === 'low' ? 'low' : options.dynamicRange === 'high' ? 'high' : 'medium',
        },
      },
      filter: {
        high_pass: { enable: true, frequency: 20 },
      },
    },
  };

  const enhanceResponse = await fetch(`${DOLBY_API_BASE}/media/enhance`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(enhanceBody),
  });

  if (!enhanceResponse.ok) {
    const err = await enhanceResponse.text().catch(() => 'Enhance start failed');
    throw new Error(`Dolby enhance failed (${enhanceResponse.status}): ${err}`);
  }

  const enhanceResult = await enhanceResponse.json();
  return {
    jobId: enhanceResult.job_id,
    status: 'processing',
  };
}

/**
 * Check the status of a mastering job
 */
export async function checkMasteringJob(jobId: string): Promise<MasteringJobResult> {
  const apiKey = getApiKey();

  const response = await fetch(`${DOLBY_API_BASE}/media/enhance?job_id=${jobId}`, {
    headers: { 'Authorization': `Bearer ${apiKey}` },
  });

  if (!response.ok) {
    throw new Error(`Failed to check job status (${response.status})`);
  }

  const data = await response.json();
  const status = data.status === 'Success' ? 'completed'
    : data.status === 'Failed' ? 'failed'
    : 'processing';

  let outputUrl: string | undefined;
  if (status === 'completed' && data.output) {
    // Get download URL for the output
    const dlResponse = await fetch(`${DOLBY_API_BASE}/media/output`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url: data.output }),
    });

    if (dlResponse.ok) {
      const dlData = await dlResponse.json();
      outputUrl = dlData.url;
    }
  }

  return {
    jobId,
    status,
    outputUrl,
    error: data.error?.message,
  };
}

/**
 * Download mastered audio from Dolby
 */
export async function downloadMasteredAudio(downloadUrl: string): Promise<Buffer> {
  const response = await fetch(downloadUrl);
  if (!response.ok) {
    throw new Error(`Failed to download mastered audio (${response.status})`);
  }
  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}
