export type ThemeCategory = 'quick' | 'development' | 'behavior' | 'education' | 'health' | 'social' | 'safety';

export interface ThemeData {
  id: string;
  name: string;
  category: ThemeCategory;
  icon: string;
  description: string;
  keyLessons?: string[];
  ageGuidance?: string;
  practicalTips?: string[];
  sourceTopicId?: string;
  customNotes?: string;
}

export interface Book {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  theme: string;
  theme_data: string | null;
  language: 'en' | 'es';
  status: 'draft' | 'generating' | 'complete' | 'error';
  generation_progress: number;
  cover_image_url: string | null;
  page_count: number;
  series_id: string | null;
  custom_instructions: string | null;
  cost_tracking: CostTracking | null;
  // Vacation book fields
  is_vacation_book: boolean;
  vacation_book_id: string | null;
  // Premium video fields
  premium_video_urls: string | null;
  premium_video_generated_at: string | null;
  // Song/music fields
  song_url: string | null;
  song_duration: number | null;
  song_style: string | null;
  song_lyrics: string | null;
  song_status: 'pending' | 'generating' | 'complete' | 'error' | null;
  // Quality check
  quality_check_result: string | null;
  quality_check_at: string | null;
  // Research pipeline - links to Parents Playground topic
  source_topic_id: string | null;
  source_topic_title: string | null;
  created_at: string;
  updated_at: string;
}

export interface TextOverlayPosition {
  x: number; // percentage from left (0-100)
  y: number; // percentage from top (0-100)
  width: number; // percentage width (0-100)
  fontSize: number; // in pixels
  fontFamily: string;
  color: string;
  backgroundColor: string;
  textAlign: 'left' | 'center' | 'right';
  padding: number;
  borderRadius: number;
  opacity: number;
}

export interface BookPage {
  id: string;
  book_id: string;
  page_number: number;
  text: string;
  image_url: string | null;
  image_prompt: string | null;
  coloring_image_url: string | null; // Black and white version for coloring
  audio_url: string | null;
  audio_duration: number | null;
  video_url: string | null;
  layout: 'text-left' | 'text-right' | 'text-bottom' | 'text-top' | 'full-image';
  featured_characters: string[];
  // Text overlay positioning for draggable text
  text_overlay_position: TextOverlayPosition | null;
  // Vacation page fields
  vacation_photo_id: string | null;
  is_bridge_scene: boolean;
  outfit_overrides: string | null;
  photo_url: string | null;
  // Quality & regeneration
  quality_issues: string | null;
  regeneration_count: number | null;
  image_generation_status: string | null;
  created_at: string;
  updated_at: string;
}

export interface BookSeries {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  cover_image_url: string | null;
  created_at: string;
}

export interface CostTracking {
  total_cost: number;
  story_generation: number;
  image_generation: number;
  audio_generation: number;
  video_generation: number;
}

export interface GenerationJob {
  id: string;
  book_id: string;
  type: 'story' | 'image' | 'audio' | 'video';
  status: 'pending' | 'processing' | 'complete' | 'error';
  progress: number;
  error_message: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateBookInput {
  title: string;
  theme: string;
  themeData?: ThemeData;
  language?: 'en' | 'es';
  description?: string;
  characterIds?: string[];
  pageCount?: number;
  seriesId?: string;
  customInstructions?: string;
  sourceTopicId?: string;
  sourceTopicTitle?: string;
}

export interface BookWithPages extends Book {
  pages: BookPage[];
}

export interface BookWithCharacters extends Book {
  characters: Character[];
}

// Import Character type
import { Character } from './character';
