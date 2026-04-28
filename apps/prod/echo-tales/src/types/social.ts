// Social Insights Section Types

// Reddit Types
export interface RedditPost {
  id: string;
  title: string;
  selftext: string;
  author: string;
  subreddit: string;
  subreddit_prefixed: string;
  score: number;
  upvote_ratio: number;
  num_comments: number;
  created_utc: number;
  permalink: string;
  url: string;
  is_self: boolean;
  link_flair_text?: string;
  top_comment?: string;
  awards?: number;
}

export interface RedditFetchResponse {
  success: boolean;
  posts: RedditPost[];
  count: number;
  subreddit?: string;
  sort?: string;
}

export type RedditSortOption = 'hot' | 'new' | 'top' | 'rising';

export const PARENTING_SUBREDDITS = [
  { value: 'all', label: 'All Parenting Subreddits' },
  { value: 'Parenting', label: 'r/Parenting' },
  { value: 'toddlers', label: 'r/toddlers' },
  { value: 'Mommit', label: 'r/Mommit' },
  { value: 'daddit', label: 'r/daddit' },
  { value: 'ScienceBasedParenting', label: 'r/ScienceBasedParenting' },
  { value: 'beyondthebump', label: 'r/beyondthebump' },
  { value: 'sleeptrain', label: 'r/sleeptrain' },
  { value: 'pottytraining', label: 'r/pottytraining' },
] as const;

// YouTube Types
export interface YouTubeVideo {
  id: string;
  title: string;
  description: string;
  channel_id: string;
  channel_name: string;
  channel_title?: string; // Alias for channel_name
  thumbnail_url: string;
  published_at: string;
  duration?: string;
  duration_seconds?: number;
  view_count?: number;
  like_count?: number;
  tags?: string[];
  is_curated?: boolean;
}

export interface YouTubeChannel {
  id: string;
  title: string;
  description: string;
  thumbnail_url: string;
  subscriber_count?: number;
  video_count?: number;
  custom_url?: string;
  category?: string;
}

export interface YouTubeFetchResponse {
  success: boolean;
  videos: YouTubeVideo[];
  channels?: YouTubeChannel[];
  count: number;
  query?: string;
}

export const CURATED_PARENTING_CHANNELS = [
  { id: 'UCJbPGzawDH1njbqV-D5HqKw', name: 'Supernanny', category: 'Discipline' },
  { id: 'UC-nPM1_kSZf91ZGkcgy_95Q', name: 'How to ADHD', category: 'Development' },
  { id: 'UCFNJWLVfMG_w8DwPFr3bJBA', name: "What's Up Moms", category: 'General' },
  { id: 'UCbhMfbq3rmuxIZQhsAWcwKA', name: 'TheDadLab', category: 'Activities' },
] as const;

// Community Types
export interface CommunityPost {
  id: string;
  author_id: string;
  author_name: string;
  author_avatar?: string;
  title: string;
  content: string;
  post_type: string;
  category: string;
  tags?: string[];
  upvotes: number;
  downvotes: number;
  comment_count: number;
  view_count: number;
  is_pinned: boolean;
  is_locked: boolean;
  created_at: string;
  updated_at?: string;
}

export interface CommunityComment {
  id: string;
  post_id: string;
  author_id: string;
  author_name: string;
  author_avatar?: string;
  content: string;
  parent_comment_id?: string;
  upvotes: number;
  downvotes: number;
  depth: number;
  created_at: string;
  replies?: CommunityComment[];
}

export interface CommunityCategory {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  post_count?: number;
}

export interface CommunityPostType {
  id: string;
  name: string;
  description?: string;
  icon?: string;
}

export interface CommunityFetchResponse {
  success: boolean;
  posts: CommunityPost[];
  categories: CommunityCategory[];
  post_types: CommunityPostType[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    has_more: boolean;
  };
}

export interface CommunityPostRequest {
  title: string;
  content: string;
  post_type: string;
  category: string;
  tags?: string[];
}

export interface CommunityVoteRequest {
  post_id: string;
  value: 1 | -1;
}

export type CommunitySortOption = 'recent' | 'hot' | 'top';

// Social Platform Tab State
export type SocialPlatform = 'reddit' | 'youtube' | 'saved' | 'community';

export interface SocialSectionState {
  activePlatform: SocialPlatform;
  reddit: {
    posts: RedditPost[];
    subreddit: string;
    sort: RedditSortOption;
    isLoading: boolean;
  };
  youtube: {
    videos: YouTubeVideo[];
    channels: YouTubeChannel[];
    query: string;
    viewingChannel: string | null;
    isLoading: boolean;
  };
  community: {
    posts: CommunityPost[];
    categories: CommunityCategory[];
    postTypes: CommunityPostType[];
    currentCategory: string | null;
    sort: CommunitySortOption;
    offset: number;
    hasMore: boolean;
    isLoading: boolean;
  };
  savedIds: {
    reddit: string[];
    youtube: string[];
  };
}
