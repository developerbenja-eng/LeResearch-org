import { getBucket } from './gcs';

interface UploadResult {
  publicUrl: string;
  fileName: string;
  bucketName: string;
}

const AUDIO_CONTENT_TYPES: Record<string, string> = {
  wav: 'audio/wav',
  mp3: 'audio/mpeg',
  flac: 'audio/flac',
  ogg: 'audio/ogg',
  m4a: 'audio/mp4',
  webm: 'audio/webm',
};

export async function uploadAudio(
  audioBuffer: Buffer,
  destinationPath: string,
  metadata: Record<string, string> = {}
): Promise<UploadResult> {
  const bucket = getBucket();
  const file = bucket.file(destinationPath);

  const extension = destinationPath.split('.').pop()?.toLowerCase() || 'wav';
  const contentType = AUDIO_CONTENT_TYPES[extension] || 'audio/wav';

  // Always use resumable for audio (typically > 512KB)
  await file.save(audioBuffer, {
    metadata: {
      contentType,
      metadata: {
        uploadedAt: new Date().toISOString(),
        ...metadata,
      },
    },
    resumable: true,
    validation: false,
  });

  const publicUrl = `https://storage.googleapis.com/${bucket.name}/${destinationPath}`;

  return {
    publicUrl,
    fileName: destinationPath,
    bucketName: bucket.name,
  };
}

export function generateStemPath(
  sessionId: string,
  stemName: string,
  ext: string = 'wav'
): string {
  return `music-hall/stems/${sessionId}/${stemName}.${ext}`;
}
