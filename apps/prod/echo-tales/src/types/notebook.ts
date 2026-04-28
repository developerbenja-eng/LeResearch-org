// Notebook Section Types

export type NoteType = 'thought' | 'book_idea' | 'insight' | 'question' | 'action';

export interface UserNote {
  id: string;
  user_id: string;
  note_type: NoteType;
  title?: string;
  content: string;
  is_pinned: boolean;
  captured_topic?: string;
  captured_topic_id?: string;
  captured_context?: string;
  tags?: string[];
  linked_content_id?: string;
  linked_content_type?: 'reddit' | 'youtube' | 'topic' | 'approach';
  created_at: string;
  updated_at?: string;
}

export interface NoteCreateRequest {
  note_type: NoteType;
  title?: string;
  content: string;
  captured_topic?: string;
  captured_topic_id?: string;
  captured_context?: string;
  tags?: string[];
  linked_content_id?: string;
  linked_content_type?: string;
}

export interface NoteUpdateRequest {
  id: string;
  note_type?: NoteType;
  title?: string;
  content?: string;
  is_pinned?: boolean;
  tags?: string[];
}

export interface NotesListResponse {
  success: boolean;
  notes: UserNote[];
  count: number;
}

// AI-Generated Insights
export interface AIInsight {
  id: string;
  user_id: string;
  topic_id?: string;
  topic_title?: string;
  insight_type: 'pattern' | 'recommendation' | 'observation' | 'connection';
  title: string;
  content: string;
  confidence_score?: number;
  source_references?: string[];
  created_at: string;
}

export interface AIInsightsResponse {
  success: boolean;
  insights: AIInsight[];
  count: number;
}

// Book Ideas (from research)
export interface BookIdeaFromResearch {
  id: string;
  user_id: string;
  topic_id?: string;
  topic_title?: string;
  title: string;
  theme: string;
  target_age: string;
  synopsis: string;
  key_lessons: string[];
  characters?: Array<{
    name: string;
    role: string;
    description: string;
  }>;
  estimated_pages?: number;
  status: 'idea' | 'saved' | 'in_progress' | 'generated';
  created_at: string;
}

export interface BookIdeasResponse {
  success: boolean;
  book_ideas: BookIdeaFromResearch[];
  count: number;
}

// Saved Content
export type SavedContentType = 'reddit' | 'youtube' | 'approach' | 'topic' | 'article';

export interface SavedContent {
  id: string;
  user_id: string;
  content_type: SavedContentType;
  content_id: string;
  title: string;
  description?: string;
  source_url?: string;
  thumbnail_url?: string;
  saved_at: string;
  metadata: SavedContentMetadata;
}

export interface SavedContentMetadata {
  // Reddit
  subreddit?: string;
  author?: string;
  upvotes?: number;
  comments?: number;
  // YouTube
  channel_id?: string;
  channel_name?: string;
  duration?: string;
  view_count?: number;
  // Approach/Topic
  category?: string;
  icon?: string;
  approach_count?: number;
}

export interface SavedContentResponse {
  success: boolean;
  content: SavedContent[];
  count: number;
}

export interface SaveContentRequest {
  content_type: SavedContentType;
  content_id: string;
  title: string;
  description?: string;
  source_url?: string;
  thumbnail_url?: string;
  metadata?: SavedContentMetadata;
}

export interface UnsaveContentRequest {
  content_type: SavedContentType;
  content_id: string;
}

// Note type metadata for UI
export const NOTE_TYPE_CONFIG: Record<NoteType, { label: string; icon: string; color: string }> = {
  thought: { label: 'Thought', icon: '💭', color: 'purple' },
  book_idea: { label: 'Book Idea', icon: '📚', color: 'pink' },
  insight: { label: 'Insight', icon: '💡', color: 'yellow' },
  question: { label: 'Question', icon: '❓', color: 'blue' },
  action: { label: 'Action', icon: '✅', color: 'green' },
};
