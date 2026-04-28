-- Character Outfit Variations Schema
-- Stores different outfits/poses for each character

CREATE TABLE IF NOT EXISTS character_outfit_variations (
  id TEXT PRIMARY KEY,
  character_id TEXT NOT NULL,
  variation_name TEXT NOT NULL,
  variation_slot INTEGER NOT NULL DEFAULT 1,
  source_type TEXT DEFAULT 'ai_generated',
  source_vacation_book_id TEXT,
  source_photo_url TEXT,
  outfit_description TEXT,
  outfit_top TEXT,
  outfit_bottom TEXT,
  outfit_shoes TEXT,
  outfit_accessories TEXT,
  outfit_colors TEXT,
  outfit_style TEXT,
  reference_image_url TEXT,
  tags TEXT,
  is_default INTEGER DEFAULT 0,
  is_active INTEGER DEFAULT 1,
  usage_count INTEGER DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (character_id) REFERENCES characters(id) ON DELETE CASCADE
);

-- Index for fast lookups by character
CREATE INDEX IF NOT EXISTS idx_variations_character_id ON character_outfit_variations(character_id);
CREATE INDEX IF NOT EXISTS idx_variations_slot ON character_outfit_variations(character_id, variation_slot);
CREATE INDEX IF NOT EXISTS idx_variations_active ON character_outfit_variations(character_id, is_active);

-- Character Canvases Schema
-- Stores generated 9-slot reference sheets

CREATE TABLE IF NOT EXISTS character_canvases (
  id TEXT PRIMARY KEY,
  character_id TEXT NOT NULL UNIQUE,
  canvas_url TEXT NOT NULL,
  variation_count INTEGER DEFAULT 0,
  canvas_width INTEGER DEFAULT 1800,
  canvas_height INTEGER DEFAULT 2400,
  generated_at TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (character_id) REFERENCES characters(id) ON DELETE CASCADE
);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_canvases_character_id ON character_canvases(character_id);
