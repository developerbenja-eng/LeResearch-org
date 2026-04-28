// Research Playground Types - NotebookLM-style parenting research

export interface ConversationMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ResearchRequirements {
  topic: string;
  childAge: string;
  specificConcerns: string[];
  goals: string[];
  searchQuery: string;
}

export interface AcademicSource {
  id: string;
  title: string;
  authors: string;
  year: number;
  journal: string;
  abstract: string;
  url: string;
  source: string;
  relevanceScore: number;
}

export interface SocialThread {
  id: string;
  title: string;
  platform: string;
  subreddit?: string;
  upvotes: number;
  comments: number;
  topComment: string;
  url: string;
}

export interface ResearchNote {
  title: string;
  icon: string;
  items: string[];
}

export interface BookConcept {
  title: string;
  theme: string;
  targetAge: string;
  pages: number;
  synopsis: string;
  keyLessons: string[];
  characters: Array<{
    name: string;
    role: string;
    description: string;
  }>;
}

export interface ResearchResults {
  sources: AcademicSource[];
  social: SocialThread[];
  notes: ResearchNote[];
  books: BookConcept[];
  requirements: ResearchRequirements;
  cached: boolean;
  cacheSource?: string;
}

export interface ChatResponse {
  message: string;
  conversationHistory: ConversationMessage[];
  readyToSearch: boolean;
}

// API Request types
export interface ChatRequest {
  action: 'chat';
  message: string;
  conversationHistory: ConversationMessage[];
}

export interface ResearchRequest {
  action: 'research';
  conversationHistory: ConversationMessage[];
}

export type ResearchAgentRequest = ChatRequest | ResearchRequest;

// ============================================
// TOPIC BROWSING TYPES (Pre-cached research)
// ============================================

export interface ParentingTopic {
  id: string;
  slug: string;
  title: string;
  short_description: string;
  full_description: string;
  icon_emoji: string;
  category: 'development' | 'behavior' | 'education' | 'health' | 'social' | 'safety';
  age_range: string;
  difficulty_level: 'beginner' | 'intermediate' | 'advanced';
  priority_score: number;
  keywords: string;
  related_topic_ids: string;
  // Content counts
  academic_count: number;
  social_count: number;
  notes_count: number;
  concepts_count: number;
  approach_count: number;
  // Analytics
  view_count: number;
  search_count: number;
  book_generation_count: number;
}

export interface TopicsResponse {
  topics: ParentingTopic[];
  count: number;
  language: string;
}

// Research Content (Pre-searched Perplexity results)
export interface ResearchSection {
  key: string;
  content: string | null;
  parsed: unknown;
}

export interface ResearchSectionConfig {
  id: string;
  section_key: string;
  display_name: string;
  icon: string;
  display_order: number;
  render_type: 'text' | 'list' | 'cards' | 'grid' | 'accordion';
  color_scheme: string;
  collapsible: boolean;
  default_expanded: boolean;
  max_items_visible: number | null;
}

export interface OrderedSection extends ResearchSectionConfig {
  data: ResearchSection | null;
  hasContent: boolean;
}

export interface TopicResearchContent {
  id: string;
  topic_id: string;
  research_query: string;
  perplexity_model: string;
  research_date: string;
  sections: {
    overview: ResearchSection;
    key_findings: ResearchSection;
    evidence_summary: ResearchSection;
    practical_tips: ResearchSection;
    warnings: ResearchSection;
    age_guidance: ResearchSection;
    methodology_notes: ResearchSection;
    citations: ResearchSection;
    related_topics: ResearchSection;
    follow_up_questions: ResearchSection;
  };
  citation_count: number;
  confidence_score: number;
  source_diversity_score: number;
  recency_score: number;
  validation_status: 'not_revised' | 'in_review' | 'validated' | 'needs_update';
  version: number;
}

export interface TopicResearchResponse {
  success: boolean;
  hasContent: boolean;
  topic_id: string;
  message?: string;
  research?: {
    id: string;
    query: string;
    model: string;
    date: string;
    citation_count: number;
    validation_status: string;
    confidence_score: number;
    version: number;
  };
  sections: OrderedSection[];
  sectionConfig?: ResearchSectionConfig[];
}

// Citation type for tooltips
export interface Citation {
  number: number;
  title: string;
  authors: string;
  year: string;
  domain: string;
  url: string;
  snippet: string;
  credibility_score?: number;
  relevance_score?: number;
}

// Feedback types
export interface ResearchFeedback {
  type: 'broken_link' | 'inaccurate' | 'outdated' | 'other';
  details: string;
  topic_id?: string;
  research_id?: string;
  topic_title?: string;
  citation_count?: number;
  citations?: Citation[];
}

export interface FeedbackResponse {
  success: boolean;
  report_id: string;
  message: string;
}
