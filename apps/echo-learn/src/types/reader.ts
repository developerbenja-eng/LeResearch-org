/**
 * Echo Reader - Type Definitions
 *
 * Types for academic paper reading, audio playback, and learning tracking.
 */

// ============================================================================
// PAPER TYPES
// ============================================================================

export type PaperSource = 'upload' | 'zotero' | 'doi' | 'url';

export type FileType = 'pdf' | 'markdown' | 'txt';

export interface ReaderPaper {
  paper_id: string;
  title: string;
  authors: ReaderAuthor[];
  publication_year: number | null;
  doi: string | null;
  journal: string | null;
  abstract: string | null;
  pdf_url: string | null;
  source_url?: string | null;
  cover_url?: string | null;
  uploaded_by_user_id: string;
  processing_status: 'pending' | 'processing' | 'completed' | 'failed';
  file_type: FileType;
  upload_timestamp: string;
  grobid_raw_xml?: string;
  source?: PaperSource;
}

export interface ReaderAuthor {
  name: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  orcid?: string;
  affiliations?: ReaderAffiliation[];
}

export interface ReaderAffiliation {
  institution: string;
  department?: string;
  laboratory?: string;
  city?: string;
  region?: string;
  country?: string;
}

export interface ReaderSection {
  section_id: string;
  paper_id: string;
  section_name: string;
  section_type: SectionType;
  section_order: number;
  content: string;
  audio_url?: string;
  audio_duration?: number;
}

export type SectionType =
  | 'abstract'
  | 'introduction'
  | 'methods'
  | 'results'
  | 'discussion'
  | 'conclusions'
  | 'references'
  | 'acknowledgments'
  | 'supplementary'
  | 'other';

export interface ReaderFigure {
  figure_id: string;
  paper_id: string;
  figure_name: string;
  caption: string | null;
  page_number: number | null;
  coords: string | null; // "page,x,y,width,height"
  image_url?: string;
  ai_description?: string;
}

export interface ReaderTable {
  table_id: string;
  paper_id: string;
  table_name: string;
  caption: string | null;
  page_number: number | null;
  coords: string | null;
  image_url?: string;
  ai_description?: string;
}

export interface ReaderFormula {
  id: string;
  paper_id: string;
  formula_id: string | null;
  label: string | null; // "(1)", "(2)", etc.
  content: string; // LaTeX or text
  page_number: number | null;
  coords: string | null;
  formula_order: number;
  ai_explanation?: string;
}

export interface ReaderReference {
  id: string;
  paper_id: string;
  citation_key: string; // "Smith2020"
  ref_order: number;
  ref_title: string | null;
  ref_authors: string[]; // JSON array
  ref_year: number | null;
  ref_journal: string | null;
  ref_doi: string | null;
  ref_volume: string | null;
  ref_pages: string | null;
  linked_paper_id?: string; // If referenced paper is in library
}

// Enriched reference with live data from OpenAlex/CrossRef
export interface EnrichedReference extends ReaderReference {
  // Live enrichment data
  cited_by_count?: number;
  abstract?: string;
  is_open_access?: boolean;
  oa_status?: 'gold' | 'green' | 'hybrid' | 'bronze' | 'closed';
  oa_url?: string;
  related_works?: Array<{
    title: string;
    doi?: string;
    year?: number;
  }>;
  enriched_at?: string;
  enrichment_source?: 'openalex' | 'crossref';
}

// Unified inline reference type for figures, tables, formulas, and citations
export type InlineReferenceType = 'figure' | 'table' | 'formula' | 'citation';

export interface InlineReference {
  type: InlineReferenceType;
  number: number;
  matchText: string; // The original matched text (e.g., "Figure 1", "[15]")
  data: ReaderFigure | ReaderTable | ReaderFormula | EnrichedReference | null;
}

export interface ReaderKeyword {
  paper_id: string;
  keyword: string;
  source: 'grobid' | 'author' | 'extracted' | 'user';
}

// ============================================================================
// USER INTERACTION TYPES
// ============================================================================

export interface UserPaperProgress {
  user_id: string;
  paper_id: string;
  read_status: 'unread' | 'reading' | 'read';
  current_section_id?: string;
  current_audio_position?: number; // seconds
  total_reading_time: number; // seconds
  last_read_at: string;
  comprehension_score?: number; // 0-100
}

export interface UserAnnotation {
  annotation_id: string;
  user_id: string;
  paper_id: string;
  section_id?: string;
  annotation_type: 'highlight' | 'note' | 'question' | 'bookmark';
  color?: 'yellow' | 'green' | 'blue' | 'pink' | 'purple';
  content: string;
  start_offset?: number;
  end_offset?: number;
  created_at: string;
  updated_at: string;
}

export interface UserCollection {
  collection_id: string;
  user_id: string;
  name: string;
  description?: string;
  color?: string;
  icon?: string;
  created_at: string;
  paper_count: number;
}

// ============================================================================
// CONCEPT TRACKING (SRS FOR ACADEMIC TERMS)
// ============================================================================

export interface ReaderConcept {
  concept_id: string;
  user_id: string;
  term: string;
  definition: string;
  first_seen_paper_id: string;
  first_seen_section_id?: string;
  status: 'new' | 'learning' | 'known';
  // SRS fields (similar to Lingua)
  ease_factor: number;
  interval: number;
  repetitions: number;
  next_review: string | null;
  last_reviewed: string | null;
  related_concepts?: string[]; // concept_ids
  papers_seen_in: string[]; // paper_ids
}

// ============================================================================
// AUDIO PLAYBACK TYPES
// ============================================================================

export interface AudioTrack {
  id: string;
  title: string;
  subtitle?: string;
  audioSrc: string;
  duration?: number;
  paperId: string;
  sectionId?: string;
  sectionType?: SectionType;
}

export interface ReadingMode {
  mode: 'deep' | 'skim' | 'review';
  audioSpeed: number; // 0.5 - 2.0
  skipCitations: boolean;
  skipFootnotes: boolean;
  pauseOnFigures: boolean;
  pauseOnEquations: boolean;
}

export type TTSProvider = 'edge' | 'gemini';

export interface AudioSettings {
  provider: TTSProvider;
  voice: string;
  speed: number;
  pitch: number;
  autoPlay: boolean;
  autoAdvanceSection: boolean;
}

// Google TTS voice types
export interface GoogleVoice {
  id: string;
  name: string;
  languageCode: string;
  gender: 'MALE' | 'FEMALE' | 'NEUTRAL';
  type: 'standard' | 'wavenet' | 'neural2' | 'studio' | 'journey';
  description: string;
  premium: boolean;
}

// ============================================================================
// READING SESSION TYPES
// ============================================================================

export interface ReadingSession {
  session_id: string;
  user_id: string;
  paper_id: string;
  started_at: string;
  ended_at?: string;
  duration_seconds: number;
  sections_read: string[];
  mode: ReadingMode['mode'];
  notes_taken: number;
  highlights_made: number;
  concepts_learned: number;
}

// ============================================================================
// PAPER SUMMARY TYPES
// ============================================================================

export interface PaperSummary {
  paper_id: string;
  summary_type: 'executive' | 'section' | 'key_findings';
  content: ExecutiveSummary | SectionSummary | KeyFindings;
  model_version: string;
  generated_at: string;
}

export interface ExecutiveSummary {
  one_liner: string;
  key_findings: string[];
  methodology_summary: string;
  limitations: string[];
  future_work: string[];
}

export interface SectionSummary {
  section_id: string;
  summary: string;
  key_points: string[];
}

export interface KeyFindings {
  findings: Array<{
    finding: string;
    evidence: string;
    confidence: 'high' | 'medium' | 'low';
  }>;
}

// ============================================================================
// ENRICHMENT TYPES (OpenAlex / CrossRef)
// ============================================================================

export interface PaperEnrichment {
  openalex_id?: string;
  cited_by_count: number;
  fwci?: number; // Field Weighted Citation Impact
  citation_percentile?: number;
  citations_by_year?: Array<{ year: number; cited_by_count: number }>;
  primary_topic?: string;
  primary_topic_id?: string;
  topics?: string[];
  field?: string;
  subfield?: string;
  domain?: string;
  is_open_access: boolean;
  oa_status?: 'gold' | 'green' | 'hybrid' | 'bronze' | 'closed';
  oa_url?: string;
  related_works?: string[];
  referenced_works?: string[];
  enriched_authors?: EnrichedAuthor[];
  enriched_at?: string;
}

export interface EnrichedAuthor {
  name: string;
  openalex_id?: string;
  orcid?: string;
  institutions?: string[];
  is_corresponding?: boolean;
  h_index?: number;
  works_count?: number;
  cited_by_count?: number;
}

// ============================================================================
// API RESPONSE TYPES
// ============================================================================

export interface PaperWithDetails extends ReaderPaper {
  sections: ReaderSection[];
  figures: ReaderFigure[];
  tables: ReaderTable[];
  formulas: ReaderFormula[];
  references: ReaderReference[];
  keywords: string[];
  summary?: PaperSummary;
  user_progress?: UserPaperProgress;
  enrichment?: PaperEnrichment;
}

export interface LibraryPaper {
  paper_id: string;
  title: string;
  authors: ReaderAuthor[];
  year: number | null;
  journal: string | null;
  read_status: 'unread' | 'reading' | 'read';
  date_saved: string;
  collections: string[];
  tags: string[];
  thumbnail_url?: string;
}

// ============================================================================
// TTS TYPES
// ============================================================================

export interface TTSRequest {
  text: string;
  voice?: string;
  rate?: number;
  pitch?: number;
  // Academic-specific options
  skipCitations?: boolean;
  skipFootnotes?: boolean;
  simplifyEquations?: boolean;
}

export interface TTSVoice {
  id: string;
  name: string;
  language: string;
  gender: 'male' | 'female' | 'neutral';
  style?: 'conversational' | 'formal' | 'academic';
}

export const AVAILABLE_VOICES: TTSVoice[] = [
  { id: 'en-US-JennyNeural', name: 'Jenny', language: 'en-US', gender: 'female', style: 'conversational' },
  { id: 'en-US-GuyNeural', name: 'Guy', language: 'en-US', gender: 'male', style: 'conversational' },
  { id: 'en-US-AriaNeural', name: 'Aria', language: 'en-US', gender: 'female', style: 'formal' },
  { id: 'en-US-DavisNeural', name: 'Davis', language: 'en-US', gender: 'male', style: 'formal' },
  { id: 'en-GB-SoniaNeural', name: 'Sonia', language: 'en-GB', gender: 'female', style: 'academic' },
  { id: 'en-GB-RyanNeural', name: 'Ryan', language: 'en-GB', gender: 'male', style: 'academic' },
];
