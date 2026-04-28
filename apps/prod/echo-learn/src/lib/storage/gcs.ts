import { Storage, Bucket } from '@google-cloud/storage';

let storageClient: Storage | null = null;

function getStorageClient(): Storage {
  if (!storageClient) {
    const credentialsJson = process.env.GOOGLE_CLOUD_CREDENTIALS;

    if (credentialsJson) {
      try {
        // dotenv may convert \n in JSON to literal newlines — re-escape before parsing
        let parsed;
        try {
          parsed = JSON.parse(credentialsJson);
        } catch {
          parsed = JSON.parse(credentialsJson.replace(/\n/g, '\\n').replace(/\r/g, '\\r'));
        }
        storageClient = new Storage({
          projectId: process.env.GOOGLE_CLOUD_PROJECT_ID || parsed.project_id,
          credentials: parsed,
        });
      } catch (err) {
        console.warn('[GCS] Failed to parse credentials, falling back to ADC:', (err as Error).message);
        storageClient = new Storage({
          projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
        });
      }
    } else {
      // Use Application Default Credentials (gcloud CLI auth)
      storageClient = new Storage({
        projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
      });
    }
  }

  return storageClient;
}

export function getBucket(): Bucket {
  const bucketName = process.env.GOOGLE_CLOUD_BUCKET_NAME || 'children-books-images-prod-2025';
  const storage = getStorageClient();
  return storage.bucket(bucketName);
}

interface UploadResult {
  publicUrl: string;
  fileName: string;
  bucketName: string;
}

/**
 * Upload image buffer to Google Cloud Storage
 */
export async function uploadImage(
  imageBuffer: Buffer,
  destinationPath: string,
  metadata: Record<string, string> = {}
): Promise<UploadResult> {
  const bucket = getBucket();
  const file = bucket.file(destinationPath);

  // Determine content type from file extension
  const extension = destinationPath.split('.').pop()?.toLowerCase() || 'jpg';
  const contentTypeMap: Record<string, string> = {
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    webp: 'image/webp',
    svg: 'image/svg+xml',
  };
  const contentType = contentTypeMap[extension] || 'image/jpeg';

  // Use resumable for files > 512KB
  const useResumable = imageBuffer.length > 512 * 1024;

  await file.save(imageBuffer, {
    metadata: {
      contentType: contentType,
      metadata: {
        uploadedAt: new Date().toISOString(),
        ...metadata,
      },
    },
    resumable: useResumable,
    validation: false,
  });

  const publicUrl = `https://storage.googleapis.com/${bucket.name}/${destinationPath}`;

  return {
    publicUrl,
    fileName: destinationPath,
    bucketName: bucket.name,
  };
}

/**
 * Delete image from Google Cloud Storage
 */
export async function deleteImage(filePath: string): Promise<boolean> {
  try {
    const bucket = getBucket();
    const file = bucket.file(filePath);
    await file.delete();
    return true;
  } catch (error: unknown) {
    const gcsError = error as { code?: number };
    if (gcsError.code === 404) {
      return false;
    }
    throw error;
  }
}

/**
 * Generate path for vacation photos
 */
export function generateVacationPhotoPath(
  userId: string,
  vacationBookId: string,
  photoOrder: number
): string {
  return `vacation-photos/${userId}/${vacationBookId}/photo_${photoOrder}_${Date.now()}.jpg`;
}

/**
 * Generate path for vacation photo thumbnails
 */
export function generateVacationThumbnailPath(
  userId: string,
  vacationBookId: string,
  photoOrder: number
): string {
  return `vacation-photos/${userId}/${vacationBookId}/thumbnails/thumb_${photoOrder}_${Date.now()}.jpg`;
}

/**
 * Generate path for character original photos (user uploads)
 */
export function generateCharacterOriginalPath(
  userId: string,
  characterId: string
): string {
  return `characters/${userId}/originals/${characterId}_${Date.now()}.jpg`;
}

/**
 * Generate path for character reference images (AI-generated illustrations)
 */
export function generateCharacterReferencePath(
  userId: string,
  characterId: string
): string {
  return `characters/${userId}/references/${characterId}_${Date.now()}.png`;
}

/**
 * Generate path for character variation images
 */
export function generateVariationPath(
  userId: string,
  characterId: string,
  variationName: string
): string {
  return `characters/${userId}/variations/${characterId}_${variationName}_${Date.now()}.png`;
}

/**
 * Generate path for character canvas (9-slot reference sheet)
 */
export function generateCanvasPath(
  userId: string,
  characterId: string
): string {
  return `characters/${userId}/canvases/${characterId}_canvas_${Date.now()}.png`;
}
