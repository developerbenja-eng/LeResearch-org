/**
 * Echo Reader - Storage helpers for academic papers
 *
 * Uses a dedicated bucket for reader files (PDFs, audio, figures).
 */

import { Storage, Bucket } from '@google-cloud/storage';

// Reader-specific bucket (separate from the main app bucket)
const READER_BUCKET_NAME = process.env.READER_BUCKET_NAME || 'echo-home-reader-storage-2025';

let readerStorageClient: Storage | null = null;
let readerBucket: Bucket | null = null;

function getReaderStorageClient(): Storage {
  if (!readerStorageClient) {
    const credentialsJson = process.env.GOOGLE_CLOUD_CREDENTIALS;
    if (credentialsJson) {
      const credentials = JSON.parse(credentialsJson);
      readerStorageClient = new Storage({
        projectId: process.env.GOOGLE_CLOUD_PROJECT_ID || credentials.project_id,
        credentials: credentials,
      });
    } else {
      readerStorageClient = new Storage({
        projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
      });
    }
  }
  return readerStorageClient;
}

export function getReaderBucket(): Bucket {
  if (!readerBucket) {
    readerBucket = getReaderStorageClient().bucket(READER_BUCKET_NAME);
  }
  return readerBucket;
}

// Alias for backwards compatibility
const getBucket = getReaderBucket;

// ============================================================================
// PATH GENERATION
// ============================================================================

/**
 * Get standardized GCS paths for a paper
 */
export function getStandardizedReaderPaths(userId: string, paperId: string) {
  return {
    pdf: `reader/${userId}/papers/${paperId}/original.pdf`,
    cover: `reader/${userId}/papers/${paperId}/cover.png`,
    figuresDir: `reader/${userId}/papers/${paperId}/figures/`,
    tablesDir: `reader/${userId}/papers/${paperId}/tables/`,
    audioDir: `reader/${userId}/papers/${paperId}/audio/`,
    podcastsDir: `reader/${userId}/papers/${paperId}/podcasts/`,
    getFigurePath: (figureNumber: number) => `reader/${userId}/papers/${paperId}/figures/figure_${figureNumber}.png`,
    getTablePath: (tableNumber: number) => `reader/${userId}/papers/${paperId}/tables/table_${tableNumber}.png`,
    getAudioPath: (sectionId: string) => `reader/${userId}/papers/${paperId}/audio/${sectionId}.mp3`,
    getPodcastPath: (podcastId: string) => `reader/${userId}/papers/${paperId}/podcasts/${podcastId}.mp3`,
    getPodcastTranscriptPath: (podcastId: string) => `reader/${userId}/papers/${paperId}/podcasts/${podcastId}.transcript.md`,
    getOriginalPath: (filename: string) => `reader/${userId}/papers/${paperId}/${filename}`,
  };
}

/**
 * Get public URL for a GCS file
 */
export function getPublicReaderUrl(gcsPath: string): string {
  const bucket = getBucket();
  return `https://storage.googleapis.com/${bucket.name}/${gcsPath}`;
}

// ============================================================================
// UPLOAD FUNCTIONS
// ============================================================================

interface UploadResult {
  publicUrl: string;
  fileName: string;
  bucketName: string;
}

/**
 * Upload PDF for a paper
 */
export async function uploadPaperPDF(
  userId: string,
  paperId: string,
  pdfBuffer: Buffer
): Promise<UploadResult> {
  const paths = getStandardizedReaderPaths(userId, paperId);

  const bucket = getBucket();
  const file = bucket.file(paths.pdf);

  await file.save(pdfBuffer, {
    metadata: {
      contentType: 'application/pdf',
      metadata: {
        uploadedAt: new Date().toISOString(),
        paperId: paperId,
        userId: userId,
      },
    },
    resumable: pdfBuffer.length > 512 * 1024,
    validation: false,
  });

  return {
    publicUrl: `https://storage.googleapis.com/${bucket.name}/${paths.pdf}`,
    fileName: paths.pdf,
    bucketName: bucket.name,
  };
}

/**
 * Upload any file for a paper (generic: markdown, text, etc.)
 */
export async function uploadPaperFile(
  userId: string,
  paperId: string,
  buffer: Buffer,
  filename: string,
  contentType: string
): Promise<UploadResult> {
  const paths = getStandardizedReaderPaths(userId, paperId);
  const gcsPath = paths.getOriginalPath(filename);

  const bucket = getBucket();
  const file = bucket.file(gcsPath);

  await file.save(buffer, {
    metadata: {
      contentType,
      metadata: {
        uploadedAt: new Date().toISOString(),
        paperId: paperId,
        userId: userId,
      },
    },
    resumable: buffer.length > 512 * 1024,
    validation: false,
  });

  return {
    publicUrl: `https://storage.googleapis.com/${bucket.name}/${gcsPath}`,
    fileName: gcsPath,
    bucketName: bucket.name,
  };
}

/**
 * Upload cover image for a paper
 */
export async function uploadPaperCover(
  userId: string,
  paperId: string,
  imageBuffer: Buffer
): Promise<UploadResult> {
  const paths = getStandardizedReaderPaths(userId, paperId);

  const bucket = getBucket();
  const file = bucket.file(paths.cover);

  await file.save(imageBuffer, {
    metadata: {
      contentType: 'image/png',
      cacheControl: 'public, max-age=31536000',
      metadata: {
        uploadedAt: new Date().toISOString(),
        paperId: paperId,
        userId: userId,
        type: 'cover',
      },
    },
    resumable: imageBuffer.length > 512 * 1024,
    validation: false,
  });

  return {
    publicUrl: `https://storage.googleapis.com/${bucket.name}/${paths.cover}`,
    fileName: paths.cover,
    bucketName: bucket.name,
  };
}

/**
 * Upload figure image for a paper
 */
export async function uploadPaperFigure(
  userId: string,
  paperId: string,
  figureNumber: number,
  imageBuffer: Buffer
): Promise<UploadResult> {
  const paths = getStandardizedReaderPaths(userId, paperId);
  const gcsPath = paths.getFigurePath(figureNumber);
  const bucket = getBucket();

  const file = bucket.file(gcsPath);
  await file.save(imageBuffer, {
    metadata: {
      contentType: 'image/png',
      metadata: {
        uploadedAt: new Date().toISOString(),
        paperId,
        figureNumber: String(figureNumber),
      },
    },
    resumable: imageBuffer.length > 512 * 1024,
    validation: false,
  });

  return {
    publicUrl: `https://storage.googleapis.com/${bucket.name}/${gcsPath}`,
    fileName: gcsPath,
    bucketName: bucket.name,
  };
}

/**
 * Upload table image for a paper
 */
export async function uploadPaperTable(
  userId: string,
  paperId: string,
  tableNumber: number,
  imageBuffer: Buffer
): Promise<UploadResult> {
  const paths = getStandardizedReaderPaths(userId, paperId);
  const gcsPath = paths.getTablePath(tableNumber);
  const bucket = getBucket();

  const file = bucket.file(gcsPath);
  await file.save(imageBuffer, {
    metadata: {
      contentType: 'image/png',
      metadata: {
        uploadedAt: new Date().toISOString(),
        paperId,
        tableNumber: String(tableNumber),
      },
    },
    resumable: imageBuffer.length > 512 * 1024,
    validation: false,
  });

  return {
    publicUrl: `https://storage.googleapis.com/${bucket.name}/${gcsPath}`,
    fileName: gcsPath,
    bucketName: bucket.name,
  };
}

/**
 * Upload audio file for a paper section
 */
export async function uploadSectionAudio(
  userId: string,
  paperId: string,
  sectionId: string,
  audioBuffer: Buffer
): Promise<UploadResult> {
  const paths = getStandardizedReaderPaths(userId, paperId);

  const bucket = getBucket();
  const audioPath = paths.getAudioPath(sectionId);
  const file = bucket.file(audioPath);

  await file.save(audioBuffer, {
    metadata: {
      contentType: 'audio/mpeg',
      metadata: {
        uploadedAt: new Date().toISOString(),
        paperId: paperId,
        sectionId: sectionId,
      },
    },
    resumable: audioBuffer.length > 512 * 1024,
    validation: false,
  });

  return {
    publicUrl: `https://storage.googleapis.com/${bucket.name}/${audioPath}`,
    fileName: audioPath,
    bucketName: bucket.name,
  };
}

/**
 * Upload podcast audio file for a paper
 */
export async function uploadPodcastAudio(
  userId: string,
  paperId: string,
  podcastId: string,
  audioBuffer: Buffer
): Promise<UploadResult> {
  const paths = getStandardizedReaderPaths(userId, paperId);

  const bucket = getBucket();
  const podcastPath = paths.getPodcastPath(podcastId);
  const file = bucket.file(podcastPath);

  await file.save(audioBuffer, {
    metadata: {
      contentType: 'audio/mpeg',
      metadata: {
        uploadedAt: new Date().toISOString(),
        paperId: paperId,
        podcastId: podcastId,
        type: 'podcast',
      },
    },
    resumable: audioBuffer.length > 512 * 1024,
    validation: false,
  });

  return {
    publicUrl: `https://storage.googleapis.com/${bucket.name}/${podcastPath}`,
    fileName: podcastPath,
    bucketName: bucket.name,
  };
}

/**
 * Upload podcast transcript for a paper
 */
export async function uploadPodcastTranscript(
  userId: string,
  paperId: string,
  podcastId: string,
  transcript: string
): Promise<UploadResult> {
  const paths = getStandardizedReaderPaths(userId, paperId);

  const bucket = getBucket();
  const transcriptPath = paths.getPodcastTranscriptPath(podcastId);
  const file = bucket.file(transcriptPath);

  await file.save(transcript, {
    metadata: {
      contentType: 'text/markdown',
      metadata: {
        uploadedAt: new Date().toISOString(),
        paperId: paperId,
        podcastId: podcastId,
        type: 'podcast-transcript',
      },
    },
  });

  return {
    publicUrl: `https://storage.googleapis.com/${bucket.name}/${transcriptPath}`,
    fileName: transcriptPath,
    bucketName: bucket.name,
  };
}

// ============================================================================
// URL HELPERS
// ============================================================================

/**
 * Get all GCS URLs for a paper
 */
export function getPaperGCSUrls(
  userId: string,
  paperId: string,
  figureCount: number,
  tableCount: number
) {
  const paths = getStandardizedReaderPaths(userId, paperId);

  return {
    pdf: getPublicReaderUrl(paths.pdf),
    figures: Array.from({ length: figureCount }, (_, i) =>
      getPublicReaderUrl(paths.getFigurePath(i + 1))
    ),
    tables: Array.from({ length: tableCount }, (_, i) =>
      getPublicReaderUrl(paths.getTablePath(i + 1))
    ),
  };
}

/**
 * Check if a file exists in GCS
 */
export async function fileExistsInReader(gcsPath: string): Promise<boolean> {
  try {
    const bucket = getBucket();
    const [exists] = await bucket.file(gcsPath).exists();
    return exists;
  } catch {
    return false;
  }
}

/**
 * Delete a file from GCS
 */
export async function deleteReaderFile(gcsPath: string): Promise<boolean> {
  try {
    const bucket = getBucket();
    await bucket.file(gcsPath).delete();
    return true;
  } catch {
    return false;
  }
}

/**
 * Upload a buffer to GCS (generic function for figures, tables, etc.)
 */
export async function uploadBufferToReader(
  buffer: Buffer,
  gcsPath: string,
  contentType: string,
  metadata?: Record<string, string>
): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    const bucket = getBucket();
    const file = bucket.file(gcsPath);

    await file.save(buffer, {
      metadata: {
        contentType,
        metadata: {
          uploadedAt: new Date().toISOString(),
          ...metadata,
        },
      },
      resumable: buffer.length > 512 * 1024,
      validation: false,
    });

    return {
      success: true,
      url: `https://storage.googleapis.com/${bucket.name}/${gcsPath}`,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Upload failed',
    };
  }
}
