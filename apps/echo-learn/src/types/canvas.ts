/**
 * TypeScript types for Collaborative Canvas & Group Chat System
 */

// ==================== Conversation Types ====================

export type ConversationType = 'solo' | 'group' | 'classroom';

export type ParticipantRole = 'host' | 'participant' | 'observer';

export type ParticipantType = 'user' | 'persona';

export interface GroupConversation {
  id: string;
  roomCode: string;
  title: string;
  conversationType: ConversationType;
  createdBy: string;
  createdAt: string;
  lastMessageAt?: string;
  isActive: boolean;
  settings: ConversationSettings;
}

export interface ConversationSettings {
  difficultyLevel: number;
  allowedPersonas: string[];
  maxParticipants?: number;
  isPublic: boolean;
  autoGenerateArtifacts: boolean;
  expiresAt?: string;
}

export interface ConversationParticipant {
  id: string;
  conversationId: string;
  participantType: ParticipantType;
  participantId: string; // User ID or Persona ID
  displayName: string;
  avatar?: string;
  joinedAt: string;
  leftAt?: string;
  isActive: boolean;
  role: ParticipantRole;
}

export interface GroupMessage {
  id: string;
  conversationId: string;
  participantId: string;
  participantType: ParticipantType;
  content: string;
  messageType: 'text' | 'voice' | 'artifact';
  audioUrl?: string;
  audioDuration?: number;
  artifactId?: string;
  timestamp: string;

  // Populated from joins
  participant?: ConversationParticipant;
}

// ==================== Artifact Types ====================

export type ArtifactType =
  | 'word_match'
  | 'conversation_quiz'
  | 'flashcards'
  | 'word_cloud'
  | 'timeline'
  | 'progress_chart'
  | 'dialogue_tree'
  | 'pronunciation'
  | 'fill_blanks'
  | 'role_play'
  | 'presentation';

export interface Artifact {
  id: string;
  conversationId: string;
  artifactType: ArtifactType;
  title: string;
  description?: string;
  config: ArtifactConfig;
  createdBy: string;
  createdAt: string;
  lastUpdated?: string;
  isActive: boolean;
}

export type ArtifactConfig =
  | WordMatchConfig
  | ConversationQuizConfig
  | FlashcardsConfig
  | WordCloudConfig
  | TimelineConfig
  | ProgressChartConfig
  | PresentationConfig;

// ==================== Word Match Game ====================

export interface WordMatchConfig {
  type: 'word_match';
  pairs: WordPair[];
  timeLimit: number; // seconds
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface WordPair {
  id: string;
  spanish: string;
  english: string;
  sourceMessageId?: string;
  imageUrl?: string;
}

// ==================== Conversation Quiz ====================

export interface ConversationQuizConfig {
  type: 'conversation_quiz';
  questions: QuizQuestion[];
  timeLimit?: number;
  passingScore: number; // percentage
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correct: number; // index of correct answer
  explanation?: string;
  sourceMessageId?: string;
  points: number;
}

// ==================== Flashcards ====================

export interface FlashcardsConfig {
  type: 'flashcards';
  cards: Flashcard[];
  mode: 'review' | 'test';
}

export interface Flashcard {
  id: string;
  front: string;
  back: string;
  frontLanguage: 'es' | 'en';
  backLanguage: 'es' | 'en';
  audioUrl?: string;
  imageUrl?: string;
  sourceMessageId?: string;
}

// ==================== Word Cloud ====================

export interface WordCloudConfig {
  type: 'word_cloud';
  words: WordFrequency[];
  colorScheme: 'purple-pink' | 'blue-green' | 'warm' | 'cool';
  maxWords: number;
  languageFilter?: 'es' | 'en' | 'both';
}

export interface WordFrequency {
  text: string;
  count: number;
  language: 'es' | 'en';
  category?: 'noun' | 'verb' | 'adjective' | 'other';
}

// ==================== Timeline ====================

export interface TimelineConfig {
  type: 'timeline';
  events: TimelineEvent[];
  startTime: string;
  endTime: string;
}

export interface TimelineEvent {
  id: string;
  timestamp: string;
  messageId: string;
  participantName: string;
  content: string;
  isHighlight: boolean;
  icon?: string;
}

// ==================== Progress Chart ====================

export interface ProgressChartConfig {
  type: 'progress_chart';
  metrics: ChartMetric[];
  chartType: 'line' | 'bar' | 'area' | 'radar';
  timeRange: 'session' | 'week' | 'month' | 'all';
}

export interface ChartMetric {
  name: string;
  values: number[];
  labels: string[];
  color: string;
}

// ==================== Presentation ====================

export interface PresentationConfig {
  type: 'presentation';
  slides: PresentationSlide[];
  theme: 'default' | 'dark' | 'minimal';
}

export interface PresentationSlide {
  id: string;
  type: 'dialogue' | 'vocabulary' | 'grammar' | 'practice' | 'stats';
  title: string;
  content: string;
  items?: string[];
  imageUrl?: string;
  audioUrl?: string;
  notes?: string;
}

// ==================== Interactions ====================

export interface ArtifactInteraction {
  id: string;
  artifactId: string;
  participantId: string;
  interactionType: 'answer' | 'vote' | 'reaction' | 'complete';
  interactionData: InteractionData;
  timestamp: string;
}

export type InteractionData =
  | WordMatchInteraction
  | QuizAnswerInteraction
  | FlashcardInteraction
  | GeneralInteraction;

export interface WordMatchInteraction {
  matchedPairs: string[]; // IDs of matched pairs
  score: number;
  timeElapsed: number;
  mistakes: number;
}

export interface QuizAnswerInteraction {
  questionId: string;
  selectedAnswer: number;
  isCorrect: boolean;
  timeToAnswer: number;
}

export interface FlashcardInteraction {
  cardId: string;
  correct: boolean;
  confidence: 'low' | 'medium' | 'high';
  timeToAnswer: number;
}

export interface GeneralInteraction {
  action: string;
  data: Record<string, any>;
}

// ==================== Statistics ====================

export interface ConversationStats {
  id: string;
  conversationId: string;
  totalMessages: number;
  totalWords: number;
  totalDurationMs: number;

  spanishWordCount: number;
  englishWordCount: number;

  userMessageCount: number;
  personaMessageCount: number;

  voiceMessageCount: number;
  totalVoiceDurationSec: number;

  uniqueWordsUsed: number;
  newWordsLearned: number;

  artifactsCreated: number;
  gamesPlayed: number;

  calculatedAt: string;
}

export interface VocabularyUsage {
  id: string;
  conversationId: string;
  word: string;
  language: 'es' | 'en';
  count: number;
  firstUsedAt: string;
  lastUsedAt: string;
}

// ==================== Leaderboard ====================

export interface LeaderboardEntry {
  participantId: string;
  participantName: string;
  avatar?: string;
  score: number;
  rank: number;
  completedAt?: string;
}

// ==================== API Request/Response Types ====================

export interface CreateGroupConversationRequest {
  title: string;
  conversationType: ConversationType;
  settings: ConversationSettings;
  initialPersonas?: string[]; // Persona IDs to add
}

export interface CreateGroupConversationResponse {
  success: boolean;
  conversation?: GroupConversation;
  roomCode?: string;
  error?: string;
}

export interface JoinConversationRequest {
  roomCode: string;
}

export interface JoinConversationResponse {
  success: boolean;
  conversation?: GroupConversation;
  participantId?: string;
  participants?: ConversationParticipant[];
  messages?: GroupMessage[];
  error?: string;
}

export interface SendGroupMessageRequest {
  conversationId: string;
  content: string;
  messageType?: 'text' | 'voice' | 'artifact';
  audioUrl?: string;
  audioDuration?: number;
  artifactId?: string;
}

export interface SendGroupMessageResponse {
  success: boolean;
  message?: GroupMessage;
  error?: string;
}

export interface CreateArtifactRequest {
  conversationId: string;
  artifactType: ArtifactType;
  title: string;
  description?: string;
  config: ArtifactConfig;
  autoGenerate?: boolean; // If true, AI generates config from conversation
}

export interface CreateArtifactResponse {
  success: boolean;
  artifact?: Artifact;
  error?: string;
}

export interface RecordInteractionRequest {
  artifactId: string;
  interactionType: string;
  interactionData: InteractionData;
}

export interface RecordInteractionResponse {
  success: boolean;
  interaction?: ArtifactInteraction;
  leaderboard?: LeaderboardEntry[];
  error?: string;
}

// ==================== Component Props ====================

export interface GroupConversationProps {
  conversationId?: string;
  roomCode?: string;
  mode?: 'create' | 'join' | 'existing';
}

export interface CanvasPanelProps {
  conversationId: string;
  artifacts: Artifact[];
  activeArtifactId: string | null;
  participants: ConversationParticipant[];
  onArtifactChange: (id: string | null) => void;
  onCreateArtifact: () => void;
}

export interface ArtifactRendererProps {
  artifact: Artifact;
  participantId: string;
  onInteraction: (interaction: InteractionData) => void;
}

export interface StatsPanelProps {
  conversationId: string;
  stats: ConversationStats;
  vocabularyUsage: VocabularyUsage[];
  messages: GroupMessage[];
  participants: ConversationParticipant[];
}
