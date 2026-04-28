/**
 * Background Remover for Character Images
 *
 * Crops white backgrounds from AI-generated character illustrations
 * to create clean avatar-style images.
 */

import sharp from 'sharp';

// Configuration
const DEFAULT_THRESHOLD = 240; // White threshold (0-255)
const DEFAULT_PADDING = 25; // Padding around character in pixels
const MAX_OUTPUT_SIZE = 800; // Max width/height for output

export interface CropOptions {
  threshold?: number;
  padding?: number;
  maxWidth?: number;
  maxHeight?: number;
  outputFormat?: 'png' | 'jpeg' | 'webp';
}

export interface CropResult {
  buffer: Buffer;
  mimeType: string;
  width: number;
  height: number;
  base64: string;
  cropInfo: {
    originalWidth: number;
    originalHeight: number;
    cropX: number;
    cropY: number;
    cropWidth: number;
    cropHeight: number;
  };
}

/**
 * Crop white background from character image
 *
 * Finds the bounding box of non-white content and crops to it with padding.
 */
export async function cropWhiteBackground(
  imageBuffer: Buffer,
  options: CropOptions = {}
): Promise<CropResult> {
  const {
    threshold = DEFAULT_THRESHOLD,
    padding = DEFAULT_PADDING,
    maxWidth = MAX_OUTPUT_SIZE,
    maxHeight = MAX_OUTPUT_SIZE,
    outputFormat = 'png',
  } = options;

  console.log('[Background Remover] Starting crop process...');

  // Get image info
  const image = sharp(imageBuffer);
  const metadata = await image.metadata();
  const originalWidth = metadata.width || 0;
  const originalHeight = metadata.height || 0;

  console.log(`[Background Remover] Original dimensions: ${originalWidth}x${originalHeight}`);

  // Use Sharp's trim to find content bounds
  // Sharp's trim removes uniform borders but we can use it to get trim info
  const { data, info } = await image
    .raw()
    .toBuffer({ resolveWithObject: true });

  // Find bounding box of non-white content
  const width = info.width;
  const height = info.height;
  const channels = info.channels;

  let minX = width;
  let minY = height;
  let maxX = 0;
  let maxY = 0;
  let foundContent = false;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * channels;
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];
      const a = channels === 4 ? data[idx + 3] : 255;

      // Check if pixel is not white/transparent
      const isContent =
        a > 10 && // Not transparent
        (r < threshold || g < threshold || b < threshold); // Not white

      if (isContent) {
        foundContent = true;
        minX = Math.min(minX, x);
        minY = Math.min(minY, y);
        maxX = Math.max(maxX, x);
        maxY = Math.max(maxY, y);
      }
    }
  }

  if (!foundContent) {
    console.warn('[Background Remover] No content found, returning original image');
    const outputBuffer = await sharp(imageBuffer)
      .png()
      .toBuffer();
    return {
      buffer: outputBuffer,
      mimeType: 'image/png',
      width: originalWidth,
      height: originalHeight,
      base64: `data:image/png;base64,${outputBuffer.toString('base64')}`,
      cropInfo: {
        originalWidth,
        originalHeight,
        cropX: 0,
        cropY: 0,
        cropWidth: originalWidth,
        cropHeight: originalHeight,
      },
    };
  }

  // Add padding and ensure within bounds
  const cropX = Math.max(0, minX - padding);
  const cropY = Math.max(0, minY - padding);
  const cropRight = Math.min(width - 1, maxX + padding);
  const cropBottom = Math.min(height - 1, maxY + padding);

  const cropWidth = cropRight - cropX + 1;
  const cropHeight = cropBottom - cropY + 1;

  console.log(`[Background Remover] Crop region: ${cropWidth}x${cropHeight} at (${cropX}, ${cropY})`);

  // Calculate scale to fit within max dimensions
  const scale = Math.min(maxWidth / cropWidth, maxHeight / cropHeight, 1); // Don't upscale

  const finalWidth = Math.round(cropWidth * scale);
  const finalHeight = Math.round(cropHeight * scale);

  console.log(`[Background Remover] Final dimensions: ${finalWidth}x${finalHeight}`);

  // Create the cropped and resized image
  let pipeline = sharp(imageBuffer)
    .extract({
      left: cropX,
      top: cropY,
      width: cropWidth,
      height: cropHeight,
    });

  // Resize if needed
  if (scale < 1) {
    pipeline = pipeline.resize(finalWidth, finalHeight);
  }

  // Output in requested format
  let outputBuffer: Buffer;
  let mimeType: string;

  if (outputFormat === 'jpeg') {
    outputBuffer = await pipeline.jpeg({ quality: 90 }).toBuffer();
    mimeType = 'image/jpeg';
  } else if (outputFormat === 'webp') {
    outputBuffer = await pipeline.webp({ quality: 90 }).toBuffer();
    mimeType = 'image/webp';
  } else {
    outputBuffer = await pipeline.png({ compressionLevel: 9 }).toBuffer();
    mimeType = 'image/png';
  }

  const originalSize = imageBuffer.length;
  const croppedSize = outputBuffer.length;
  const savings = ((1 - croppedSize / originalSize) * 100).toFixed(1);

  console.log(`[Background Remover] Size: ${originalSize} -> ${croppedSize} bytes (${savings}% reduction)`);
  console.log('[Background Remover] Crop completed successfully');

  return {
    buffer: outputBuffer,
    mimeType,
    width: finalWidth,
    height: finalHeight,
    base64: `data:${mimeType};base64,${outputBuffer.toString('base64')}`,
    cropInfo: {
      originalWidth,
      originalHeight,
      cropX,
      cropY,
      cropWidth,
      cropHeight,
    },
  };
}

/**
 * Quick crop with optimized defaults for character avatars
 */
export async function cropCharacterAvatar(imageBuffer: Buffer): Promise<CropResult> {
  return cropWhiteBackground(imageBuffer, {
    threshold: 240,
    padding: 25,
    maxWidth: 800,
    maxHeight: 800,
    outputFormat: 'png',
  });
}

/**
 * Crop from base64 string
 */
export async function cropFromBase64(base64Data: string): Promise<CropResult> {
  // Remove data URL prefix if present
  const cleanBase64 = base64Data.replace(/^data:image\/\w+;base64,/, '');
  const buffer = Buffer.from(cleanBase64, 'base64');
  return cropCharacterAvatar(buffer);
}
