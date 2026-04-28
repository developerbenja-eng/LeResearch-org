// Podcast Room Types

export interface PodcastEpisode {
  id: string;
  topic_id: string;
  approach_id?: string;
  episode_number: number;
  title: string;
  subtitle?: string;
  description: string;
  format: 'host_expert' | 'two_parents' | 'expert_deep_dive';
  duration_minutes: number;
  word_count?: number;
  speakers?: PodcastSpeaker[];
  audio_url?: string;
  audio_format?: string;
  audio_duration_seconds?: number;
  audio_size_bytes?: number;
  script_text?: string;
  script_structured?: PodcastSegment[];
  script_status: 'pending' | 'generating' | 'completed' | 'failed';
  audio_status: 'pending' | 'generating' | 'completed' | 'failed';
  language: string;
  tags?: string[];
  play_count: number;
  rating_avg?: number;
  rating_count?: number;
  status: 'draft' | 'published' | 'archived';
  is_featured: boolean;
  created_at: string;
  published_at?: string;
  topic?: {
    title: string;
    icon: string;
    category: string;
    slug?: string;
  };
}

export interface PodcastSpeaker {
  name: string;
  role: 'Host' | 'Expert' | 'Parent' | 'Guest';
  voice?: string;
  description?: string;
}

export interface PodcastSegment {
  id?: string;
  episode_id?: string;
  segment_order: number;
  speaker: string;
  speaker_role?: string;
  text: string;
  source_refs?: number[];
  segment_type: 'intro' | 'dialogue' | 'key_point' | 'conclusion' | 'transition';
  is_key_point?: boolean;
  word_count?: number;
  start_time_seconds?: number;
  end_time_seconds?: number;
}

export interface PodcastSource {
  id: string;
  episode_id: string;
  number: number;
  title: string;
  journal?: string;
  year?: number;
  url?: string;
  excerpt?: string;
  key_excerpt?: string;
  authors?: string;
  doi?: string;
}

export interface PodcastStats {
  total_episodes: number;
  total_minutes: number;
  topics_covered: number;
  total_plays: number;
}

export interface PodcastCategory {
  category: string;
  topic_count: number;
  podcast_count: number;
  icon?: string;
}

export interface PodcastLibraryResponse {
  success: boolean;
  featured: PodcastEpisode[];
  categories: PodcastCategory[];
  stats: PodcastStats;
  topics_without_podcasts: TopicForGeneration[];
}

export interface TopicForGeneration {
  id: string;
  slug: string;
  title: string;
  category: string;
  icon_emoji: string;
  has_podcast: boolean;
}

export interface PodcastBrowseResponse {
  success: boolean;
  episodes: PodcastEpisode[];
  count: number;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
    has_more: boolean;
  };
}

export interface PodcastGenerateRequest {
  topic_id: string;
  topic_slug?: string;
  duration: 5 | 10 | 15;
  format: 'host_expert' | 'two_parents' | 'expert_deep_dive';
  style?: 'conversational' | 'technical' | 'practical';
  focus?: 'research' | 'practical' | 'balanced';
}

export interface PodcastGenerateResponse {
  success: boolean;
  episode_id?: string;
  audio_url?: string;
  duration?: number;
  transcript?: string;
  status: 'queued' | 'generating' | 'completed' | 'failed';
  message?: string;
  cost_coins?: number;
}

// Audio Player State
export interface AudioPlayerState {
  isPlaying: boolean;
  currentEpisode: PodcastEpisode | null;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  isLoading: boolean;
  error: string | null;
}

export type AudioPlayerAction =
  | { type: 'PLAY'; episode: PodcastEpisode }
  | { type: 'PAUSE' }
  | { type: 'RESUME' }
  | { type: 'STOP' }
  | { type: 'SEEK'; time: number }
  | { type: 'SET_VOLUME'; volume: number }
  | { type: 'TOGGLE_MUTE' }
  | { type: 'SET_DURATION'; duration: number }
  | { type: 'UPDATE_TIME'; time: number }
  | { type: 'SET_LOADING'; isLoading: boolean }
  | { type: 'SET_ERROR'; error: string | null };
