/**
 * Image Processing Utilities
 *
 * Handles image processing for character photo uploads:
 * - HEIC/HEIF to JPEG conversion
 * - Auto-rotation (EXIF orientation fix)
 * - Resizing to max dimensions
 * - Compression to max file size
 */

import sharp from 'sharp';

// Configuration
const MAX_DIMENSION = 1500; // Max width or height
const MAX_FILE_SIZE = 4 * 1024 * 1024; // 4MB
const JPEG_QUALITY = 85;

export interface ProcessedImage {
  buffer: Buffer;
  mimeType: string;
  width: number;
  height: number;
  originalSize: number;
  processedSize: number;
  base64: string;
}

/**
 * Process an uploaded image (from base64 data URL)
 *
 * - Converts HEIC/HEIF to JPEG
 * - Fixes EXIF orientation
 * - Resizes to max dimensions
 * - Compresses to max file size
 */
export async function processUploadedImage(
  base64DataUrl: string
): Promise<ProcessedImage> {
  console.log('[Image Processor] Starting image processing...');

  // Extract base64 data and detect MIME type
  let mimeType = 'image/jpeg';
  const mimeMatch = base64DataUrl.match(/^data:(image\/[\w+-]+);base64,/);
  if (mimeMatch) {
    mimeType = mimeMatch[1];
    console.log(`[Image Processor] Detected MIME type: ${mimeType}`);
  }

  // Remove data URL prefix to get raw base64
  const base64Data = base64DataUrl.replace(/^data:image\/[\w+-]+;base64,/, '');
  const inputBuffer = Buffer.from(base64Data, 'base64');
  const originalSize = inputBuffer.length;

  console.log(`[Image Processor] Input size: ${(originalSize / 1024).toFixed(1)}KB`);

  // Create Sharp instance with auto-rotation enabled
  let pipeline = sharp(inputBuffer).rotate(); // Auto-rotate based on EXIF

  // Get image metadata
  const metadata = await pipeline.metadata();
  const inputWidth = metadata.width || 0;
  const inputHeight = metadata.height || 0;

  console.log(`[Image Processor] Input dimensions: ${inputWidth}x${inputHeight}`);

  // Check if resizing is needed
  const needsResize = inputWidth > MAX_DIMENSION || inputHeight > MAX_DIMENSION;

  if (needsResize) {
    // Calculate new dimensions maintaining aspect ratio
    const scale = Math.min(MAX_DIMENSION / inputWidth, MAX_DIMENSION / inputHeight);
    const newWidth = Math.round(inputWidth * scale);
    const newHeight = Math.round(inputHeight * scale);

    console.log(`[Image Processor] Resizing to: ${newWidth}x${newHeight}`);
    pipeline = pipeline.resize(newWidth, newHeight, {
      fit: 'inside',
      withoutEnlargement: true,
    });
  }

  // Convert to JPEG (handles HEIC/HEIF conversion automatically)
  let outputBuffer = await pipeline
    .jpeg({
      quality: JPEG_QUALITY,
      mozjpeg: true, // Use mozjpeg for better compression
    })
    .toBuffer();

  let outputWidth = needsResize
    ? Math.round(inputWidth * Math.min(MAX_DIMENSION / inputWidth, MAX_DIMENSION / inputHeight))
    : inputWidth;
  let outputHeight = needsResize
    ? Math.round(inputHeight * Math.min(MAX_DIMENSION / inputWidth, MAX_DIMENSION / inputHeight))
    : inputHeight;

  // If still too large, progressively reduce quality
  let quality = JPEG_QUALITY;
  while (outputBuffer.length > MAX_FILE_SIZE && quality > 30) {
    quality -= 10;
    console.log(`[Image Processor] Reducing quality to ${quality}%...`);

    outputBuffer = await sharp(inputBuffer)
      .rotate()
      .resize(outputWidth, outputHeight, {
        fit: 'inside',
        withoutEnlargement: true,
      })
      .jpeg({
        quality,
        mozjpeg: true,
      })
      .toBuffer();
  }

  // If still too large, reduce dimensions
  while (outputBuffer.length > MAX_FILE_SIZE && outputWidth > 500) {
    outputWidth = Math.round(outputWidth * 0.8);
    outputHeight = Math.round(outputHeight * 0.8);
    console.log(`[Image Processor] Reducing dimensions to ${outputWidth}x${outputHeight}...`);

    outputBuffer = await sharp(inputBuffer)
      .rotate()
      .resize(outputWidth, outputHeight, {
        fit: 'inside',
        withoutEnlargement: true,
      })
      .jpeg({
        quality,
        mozjpeg: true,
      })
      .toBuffer();
  }

  const processedSize = outputBuffer.length;
  const base64Output = `data:image/jpeg;base64,${outputBuffer.toString('base64')}`;

  console.log(`[Image Processor] Output size: ${(processedSize / 1024).toFixed(1)}KB`);
  console.log(`[Image Processor] Output dimensions: ${outputWidth}x${outputHeight}`);
  console.log(
    `[Image Processor] Compression ratio: ${((1 - processedSize / originalSize) * 100).toFixed(1)}%`
  );

  return {
    buffer: outputBuffer,
    mimeType: 'image/jpeg',
    width: outputWidth,
    height: outputHeight,
    originalSize,
    processedSize,
    base64: base64Output,
  };
}

/**
 * Process a raw buffer (for server-side processing)
 */
export async function processImageBuffer(
  inputBuffer: Buffer,
  options: {
    maxDimension?: number;
    maxFileSize?: number;
    quality?: number;
    format?: 'jpeg' | 'png' | 'webp';
  } = {}
): Promise<ProcessedImage> {
  const {
    maxDimension = MAX_DIMENSION,
    maxFileSize = MAX_FILE_SIZE,
    quality = JPEG_QUALITY,
    format = 'jpeg',
  } = options;

  console.log('[Image Processor] Processing buffer...');

  // Create Sharp instance with auto-rotation
  let pipeline = sharp(inputBuffer).rotate();

  // Get metadata
  const metadata = await pipeline.metadata();
  const inputWidth = metadata.width || 0;
  const inputHeight = metadata.height || 0;

  // Resize if needed
  const needsResize = inputWidth > maxDimension || inputHeight > maxDimension;
  if (needsResize) {
    const scale = Math.min(maxDimension / inputWidth, maxDimension / inputHeight);
    const newWidth = Math.round(inputWidth * scale);
    const newHeight = Math.round(inputHeight * scale);
    pipeline = pipeline.resize(newWidth, newHeight, {
      fit: 'inside',
      withoutEnlargement: true,
    });
  }

  // Convert to target format
  let outputBuffer: Buffer;
  let mimeType: string;

  if (format === 'png') {
    outputBuffer = await pipeline
      .png({ compressionLevel: 9 })
      .toBuffer();
    mimeType = 'image/png';
  } else if (format === 'webp') {
    outputBuffer = await pipeline
      .webp({ quality })
      .toBuffer();
    mimeType = 'image/webp';
  } else {
    outputBuffer = await pipeline
      .jpeg({ quality, mozjpeg: true })
      .toBuffer();
    mimeType = 'image/jpeg';
  }

  // Get final dimensions
  const outputMeta = await sharp(outputBuffer).metadata();
  const outputWidth = outputMeta.width || inputWidth;
  const outputHeight = outputMeta.height || inputHeight;

  return {
    buffer: outputBuffer,
    mimeType,
    width: outputWidth,
    height: outputHeight,
    originalSize: inputBuffer.length,
    processedSize: outputBuffer.length,
    base64: `data:${mimeType};base64,${outputBuffer.toString('base64')}`,
  };
}

/**
 * Validate that a file is an acceptable image type
 */
export function isValidImageType(mimeType: string): boolean {
  const validTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
    'image/heic',
    'image/heif',
  ];
  return validTypes.includes(mimeType.toLowerCase());
}

/**
 * Get file extension from MIME type
 */
export function getExtensionFromMimeType(mimeType: string): string {
  const extensionMap: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/jpg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
    'image/heic': 'heic',
    'image/heif': 'heif',
  };
  return extensionMap[mimeType.toLowerCase()] || 'jpg';
}

// Thumbnail configuration
const THUMBNAIL_SIZE = 400; // Square thumbnail
const THUMBNAIL_QUALITY = 80;

export interface ThumbnailResult {
  buffer: Buffer;
  width: number;
  height: number;
  size: number;
  base64: string;
}

/**
 * Generate a thumbnail from an image buffer
 * Creates a square thumbnail that covers the target size (crop to fit)
 */
export async function generateThumbnail(
  inputBuffer: Buffer,
  options: {
    size?: number;
    quality?: number;
    format?: 'jpeg' | 'webp';
  } = {}
): Promise<ThumbnailResult> {
  const {
    size = THUMBNAIL_SIZE,
    quality = THUMBNAIL_QUALITY,
    format = 'jpeg',
  } = options;

  console.log(`[Image Processor] Generating ${size}x${size} thumbnail...`);

  // Create thumbnail with cover fit (crops to fill the square)
  let pipeline = sharp(inputBuffer)
    .rotate() // Auto-rotate based on EXIF
    .resize(size, size, {
      fit: 'cover', // Crop to fill the square
      position: 'centre', // Center the crop
    });

  let outputBuffer: Buffer;
  if (format === 'webp') {
    outputBuffer = await pipeline.webp({ quality }).toBuffer();
  } else {
    outputBuffer = await pipeline.jpeg({ quality, mozjpeg: true }).toBuffer();
  }

  const mimeType = format === 'webp' ? 'image/webp' : 'image/jpeg';

  console.log(`[Image Processor] Thumbnail generated: ${(outputBuffer.length / 1024).toFixed(1)}KB`);

  return {
    buffer: outputBuffer,
    width: size,
    height: size,
    size: outputBuffer.length,
    base64: `data:${mimeType};base64,${outputBuffer.toString('base64')}`,
  };
}

/**
 * Process an image and generate both full-size and thumbnail versions
 */
export async function processImageWithThumbnail(
  base64DataUrl: string,
  thumbnailOptions?: {
    size?: number;
    quality?: number;
  }
): Promise<{
  full: ProcessedImage;
  thumbnail: ThumbnailResult;
}> {
  // Process the full image
  const full = await processUploadedImage(base64DataUrl);

  // Generate thumbnail from the processed buffer
  const thumbnail = await generateThumbnail(full.buffer, thumbnailOptions);

  return { full, thumbnail };
}
