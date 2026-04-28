// Echo Lingua - Language Learning Feature Types

export type WordStatus = 'new' | 'learning' | 'known';
export type LinguaLanguage = 'en' | 'es';

export interface LinguaUser {
  id: string;
  name: string;
  native_language: LinguaLanguage;
  target_language: LinguaLanguage;
  current_streak: number;
  longest_streak: number;
  last_activity_date: string | null;
  created_at: string;
  updated_at: string;
  // User management fields (v2)
  main_user_id?: string | null; // Link to Echo-Home users table
  avatar_url?: string | null;
  is_active?: number; // 1 = active, 0 = inactive
}

export interface LinguaVocabulary {
  id: string;
  user_id: string;
  word: string;
  word_normalized: string;
  native_translation: string | null;
  status: WordStatus;
  times_seen: number;
  times_correct: number;
  first_seen_at: string;
  last_seen_at: string;
  mastered_at: string | null;
  // SRS fields (v2)
  next_review_date?: string | null;
  ease_factor?: number;
  interval_days?: number;
  last_review_date?: string | null;
  review_count?: number;
}

export interface LinguaConversation {
  id: string;
  user_id: string;
  title: string | null;
  raw_text: string;
  parsed_data: string; // JSON string
  word_count: number;
  new_words_count: number;
  created_at: string;
}

export interface LinguaWordDetails {
  id: string;
  word: string;
  source_language: LinguaLanguage;
  target_language: LinguaLanguage;
  translation: string;
  definition: string | null;
  part_of_speech: string | null;
  example_sentence: string | null;
  example_translation: string | null;
  related_words: string | null; // JSON array
  memory_tip: string | null;
  difficulty_level: number;
  created_at: string;
}

// Parsed conversation types
export interface ParsedMessage {
  sender: string;
  content: string;
  timestamp?: string;
  words: ExtractedWord[];
}

export interface ExtractedWord {
  original: string;
  normalized: string;
  position: number;
  language: LinguaLanguage;
  vocabEntry?: LinguaVocabulary;
  showInTargetLang: boolean;
}

// Stats types
export interface VocabStats {
  totalWords: number;
  newWords: number;
  learningWords: number;
  knownWords: number;
  wordsLearnedThisWeek: number;
  currentStreak: number;
  longestStreak: number;
}

export interface DailyProgress {
  date: string;
  wordsLearned: number;
  wordsReviewed: number;
}

// Session types
export interface LinguaSession {
  userId: string;
  name: string;
  nativeLang: LinguaLanguage;
  targetLang: LinguaLanguage;
  authenticatedAt: number;
  mainUserId?: string; // Link to Echo-Home user ID
}

// Family connection types (v2)
export type ConnectionType = 'family' | 'friend' | 'partner';
export type ConnectionStatus = 'pending' | 'accepted' | 'declined';

export interface LinguaFamilyConnection {
  id: string;
  owner_user_id: string;
  connected_user_id: string;
  connection_type: ConnectionType;
  can_view_progress: number; // 1 = yes, 0 = no
  can_view_vocabulary: number; // 1 = yes, 0 = no
  status: ConnectionStatus;
  created_at: string;
  accepted_at: string | null;
  // Joined fields from users table
  connected_user_name?: string;
  connected_user_email?: string;
}

// API types
export interface ProcessConversationRequest {
  text: string;
  saveConversation?: boolean;
}

export interface ProcessConversationResponse {
  messages: ParsedMessage[];
  words: ExtractedWord[];
  newWordsCount: number;
  conversationId?: string;
}

export interface WordDetailsResponse {
  translation: string;
  definition: string;
  partOfSpeech: string;
  exampleSentence: string;
  exampleTranslation: string;
  relatedWords: string[];
  memoryTip: string;
  difficultyLevel: number;
}

// Filter types
export interface VocabFilters {
  status?: WordStatus;
  search?: string;
  limit?: number;
  offset?: number;
}

// ==================== SRS Types (v2) ====================

export interface SRSCard {
  vocabularyId: string;
  word: string;
  easeFactor: number;
  intervalDays: number;
  nextReviewDate: string;
  reviewCount: number;
  lastReviewDate: string | null;
}

export interface SRSReview {
  id: string;
  user_id: string;
  vocabulary_id: string;
  word: string;
  quality: number; // 0-5
  response_time_ms: number;
  previous_ease_factor: number;
  new_ease_factor: number;
  previous_interval: number;
  new_interval: number;
  reviewed_at: string;
}

export interface SRSUpdateResult {
  nextReviewDate: string;
  intervalDays: number;
  easeFactor: number;
  isCorrect: boolean;
}

// ==================== Quiz Types (v2) ====================

export type QuizType = 'translation' | 'fill_blank' | 'multiple_choice' | 'listening';
export type QuestionDifficulty = 'easy' | 'medium' | 'hard';

export interface QuizQuestion {
  id: string;
  vocabularyId: string;
  type: QuizType;
  question: string;
  correctAnswer: string;
  options?: string[]; // For multiple choice
  word: string;
  difficulty: QuestionDifficulty;
  context?: string; // Original sentence from conversation
}

export interface QuizSession {
  id: string;
  user_id: string;
  quiz_type: string;
  total_questions: number;
  correct_answers: number;
  completed_at: string | null;
  duration_seconds: number | null;
  created_at: string;
}

export interface QuizAnswer {
  id: string;
  session_id: string;
  vocabulary_id: string;
  word: string;
  question_type: string;
  user_answer: string;
  correct_answer: string;
  is_correct: number; // 0 or 1
  response_time_ms: number;
  answered_at: string;
}

export interface QuizResult {
  sessionId: string;
  score: number; // 0-100
  correctCount: number;
  totalCount: number;
  accuracy: number; // 0-1
  averageResponseTime: number;
  questionsReviewed: QuizAnswerResult[];
}

export interface QuizAnswerResult {
  word: string;
  question: string;
  userAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
  responseTime: number;
  memoryTip?: string;
}

// ==================== Analytics Types (v2) ====================

export interface LearningAnalytics {
  // Overview
  totalStudyDays: number;
  averageSessionDuration: number; // minutes
  totalWordsLearned: number;

  // Progress over time
  dailyProgress: DailyProgress[];
  weeklyProgress: WeeklyProgress[];

  // Retention metrics
  overallRetentionRate: number; // 0-1
  retentionByDifficulty: Record<number, number>; // difficulty level → retention

  // Quiz performance
  totalQuizzesTaken: number;
  averageQuizScore: number; // 0-100
  quizAccuracyTrend: { date: string; accuracy: number }[];

  // Word analysis
  mostReviewedWords: { word: string; count: number }[];
  weakestWords: { word: string; retentionRate: number }[];
  fastestLearnedWords: { word: string; daysToMaster: number }[];

  // Study patterns
  studyTimeByDayOfWeek: Record<string, number>; // "Monday" → minutes
  studyTimeByHour: Record<number, number>; // 0-23 → minutes

  // SRS metrics
  wordsScheduledForReview: number;
  averageReviewInterval: number; // days
  srsEfficiency: number; // 0-1 (how well SRS is working)
}

export interface WeeklyProgress {
  weekStart: string; // ISO date
  wordsLearned: number;
  wordsReviewed: number;
  quizzesTaken: number;
  studyMinutes: number;
}

export interface ConversationMetadata {
  id: string;
  title: string;
  participants: string[];
  messageCount: number;
  wordCount: number;
  newWordsCount: number;
  dateRange: { start: string; end: string } | null;
  createdAt: string;
}
