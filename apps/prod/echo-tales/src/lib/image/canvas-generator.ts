/**
 * Character Canvas Generator
 *
 * Creates 9-slot reference sheets using Jimp v1 (pure JS)
 * Canvas: 1800x2400px with 3x3 grid of character variations
 */

import { Jimp, JimpMime, HorizontalAlign, VerticalAlign } from 'jimp';
import { CharacterVariation, VARIATION_TYPES } from '@/types/character-variation';

// ============================================================================
// CONSTANTS
// ============================================================================

const CANVAS_WIDTH = 1800;
const CANVAS_HEIGHT = 2400;
const GRID_COLS = 3;
const GRID_ROWS = 3;
const PADDING = 40;
const CELL_GAP = 20;
const HEADER_HEIGHT = 100;
const FOOTER_HEIGHT = 60;

// Calculate cell dimensions
const CONTENT_WIDTH = CANVAS_WIDTH - PADDING * 2;
const CONTENT_HEIGHT = CANVAS_HEIGHT - HEADER_HEIGHT - FOOTER_HEIGHT - PADDING * 2;
const CELL_WIDTH = Math.floor((CONTENT_WIDTH - CELL_GAP * (GRID_COLS - 1)) / GRID_COLS);
const CELL_HEIGHT = Math.floor((CONTENT_HEIGHT - CELL_GAP * (GRID_ROWS - 1)) / GRID_ROWS);

// Colors (RGBA format for Jimp v1)
const COLORS = {
  background: 0xfff8f0ff, // Warm white
  cellBackground: 0xffffffff, // White
  border: 0xe8e0d8ff, // Soft gray
  emptySlot: 0xf5f0ebff, // Light cream
  text: 0x2d2d2dff, // Dark gray
};

// ============================================================================
// CANVAS GENERATOR
// ============================================================================

export interface CanvasGeneratorOptions {
  characterName: string;
  variations: CharacterVariation[];
  backgroundColor?: number;
}

export interface GeneratedCanvas {
  buffer: Buffer;
  width: number;
  height: number;
  variationCount: number;
}

/**
 * Generate a 9-slot character canvas
 */
export async function generateCharacterCanvas(
  options: CanvasGeneratorOptions
): Promise<GeneratedCanvas> {
  const { characterName, variations, backgroundColor = COLORS.background } = options;

  // Create base canvas with background color
  const canvas = new Jimp({ width: CANVAS_WIDTH, height: CANVAS_HEIGHT, color: backgroundColor });

  // Create variation map by slot
  const variationMap = new Map<number, CharacterVariation>();
  for (const v of variations) {
    variationMap.set(v.variation_slot, v);
  }

  // Draw each slot
  for (let row = 0; row < GRID_ROWS; row++) {
    for (let col = 0; col < GRID_COLS; col++) {
      const slot = row * GRID_COLS + col + 1;
      const variation = variationMap.get(slot);

      const x = PADDING + col * (CELL_WIDTH + CELL_GAP);
      const y = HEADER_HEIGHT + row * (CELL_HEIGHT + CELL_GAP);

      await drawSlot(canvas, x, y, slot, variation);
    }
  }

  // Convert to buffer
  const buffer = await canvas.getBuffer(JimpMime.png);

  return {
    buffer,
    width: CANVAS_WIDTH,
    height: CANVAS_HEIGHT,
    variationCount: variations.length,
  };
}

/**
 * Draw a single slot in the grid
 */
async function drawSlot(
  canvas: InstanceType<typeof Jimp>,
  x: number,
  y: number,
  slot: number,
  variation: CharacterVariation | undefined
): Promise<void> {
  // Draw cell background
  drawRect(canvas, x, y, CELL_WIDTH, CELL_HEIGHT, COLORS.cellBackground);
  drawRectBorder(canvas, x, y, CELL_WIDTH, CELL_HEIGHT, COLORS.border, 2);

  if (variation && variation.reference_image_url) {
    try {
      // Load and place variation image
      const image = await Jimp.read(variation.reference_image_url);

      // Scale to fit cell with padding
      const innerWidth = CELL_WIDTH - 40;
      const innerHeight = CELL_HEIGHT - 60; // Leave room for label

      image.scaleToFit({ w: innerWidth, h: innerHeight });

      // Center image in cell
      const imgX = x + (CELL_WIDTH - image.width) / 2;
      const imgY = y + 20;

      canvas.composite(image, Math.round(imgX), Math.round(imgY));
    } catch (error) {
      console.error(`Failed to load image for slot ${slot}:`, error);
      drawEmptySlot(canvas, x, y, slot);
    }
  } else {
    drawEmptySlot(canvas, x, y, slot);
  }
}

/**
 * Draw empty slot placeholder
 */
function drawEmptySlot(
  canvas: InstanceType<typeof Jimp>,
  x: number,
  y: number,
  slot: number
): void {
  // Fill with empty color
  for (let py = y + 2; py < y + CELL_HEIGHT - 2; py++) {
    for (let px = x + 2; px < x + CELL_WIDTH - 2; px++) {
      canvas.setPixelColor(COLORS.emptySlot, px, py);
    }
  }

  // Draw slot number in center (simple pixel representation)
  const centerX = x + CELL_WIDTH / 2;
  const centerY = y + CELL_HEIGHT / 2;

  // Draw a simple circle indicator for the slot
  const radius = 20;
  for (let angle = 0; angle < 360; angle += 10) {
    const rad = (angle * Math.PI) / 180;
    const px = Math.round(centerX + Math.cos(rad) * radius);
    const py = Math.round(centerY + Math.sin(rad) * radius);
    canvas.setPixelColor(COLORS.border, px, py);
  }
}

/**
 * Draw a filled rectangle
 */
function drawRect(
  canvas: InstanceType<typeof Jimp>,
  x: number,
  y: number,
  width: number,
  height: number,
  color: number
): void {
  for (let py = y; py < y + height; py++) {
    for (let px = x; px < x + width; px++) {
      if (px >= 0 && px < canvas.width && py >= 0 && py < canvas.height) {
        canvas.setPixelColor(color, px, py);
      }
    }
  }
}

/**
 * Draw a rectangle border
 */
function drawRectBorder(
  canvas: InstanceType<typeof Jimp>,
  x: number,
  y: number,
  width: number,
  height: number,
  color: number,
  thickness: number
): void {
  // Top and bottom borders
  for (let t = 0; t < thickness; t++) {
    for (let px = x; px < x + width; px++) {
      canvas.setPixelColor(color, px, y + t);
      canvas.setPixelColor(color, px, y + height - 1 - t);
    }
  }

  // Left and right borders
  for (let t = 0; t < thickness; t++) {
    for (let py = y; py < y + height; py++) {
      canvas.setPixelColor(color, x + t, py);
      canvas.setPixelColor(color, x + width - 1 - t, py);
    }
  }
}

/**
 * Generate a simple preview canvas (smaller, for thumbnails)
 */
export async function generatePreviewCanvas(
  options: CanvasGeneratorOptions
): Promise<GeneratedCanvas> {
  const fullCanvas = await generateCharacterCanvas(options);

  // Load the full canvas and resize
  const image = await Jimp.read(fullCanvas.buffer);
  image.resize({ w: 600, h: 800 });

  const buffer = await image.getBuffer(JimpMime.png);

  return {
    buffer,
    width: 600,
    height: 800,
    variationCount: fullCanvas.variationCount,
  };
}
