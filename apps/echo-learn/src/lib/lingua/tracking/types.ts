/**
 * Echo-Lin V3 Learning Pattern Tracking Types
 *
 * Types for tracking user behavior and calculating learning profiles
 */

// ============================================================================
// SESSION TRACKING
// ============================================================================

export interface Session {
  id: string;
  userId: string;
  startedAt: string;
  endedAt?: string;
  entryPoint?: 'practice' | 'explore' | 'quiz' | 'reflect' | 'vocabulary' | 'history' | 'stats';
  deviceType?: string;
  appVersion?: string;
  durationSeconds?: number;
  engagementScore?: number;
}

// ============================================================================
// INTERACTION TRACKING
// ============================================================================

export type EventType =
  | 'word_click'
  | 'word_skip'
  | 'word_status_change'
  | 'tab_switch'
  | 'difficulty_change'
  | 'quiz_start'
  | 'quiz_question_answered'
  | 'quiz_complete'
  | 'conversation_processed'
  | 'popup_opened'
  | 'popup_closed'
  | 'feature_used'
  | 'exploration_start'
  | 'exploration_end'
  | 'modality_switch'
  | 'reflection_submitted';

export type ContextType = 'conversation' | 'quiz' | 'vocab' | 'explore' | 'practice' | 'history';

export interface Interaction {
  id: string;
  userId: string;
  sessionId: string;
  timestamp: string;
  eventType: EventType;
  contextType?: ContextType;
  contextId?: string;
  metadata?: Record<string, any>;
}

// ============================================================================
// WORD-LEVEL TRACKING
// ============================================================================

export type WordInteractionType = 'click' | 'skip' | 'popup_open' | 'popup_close' | 'status_change';

export interface WordInteraction {
  id: string;
  userId: string;
  vocabularyId: string;
  sessionId: string;
  interactionType: WordInteractionType;
  contextType?: ContextType;
  contextId?: string;
  hesitationMs?: number;
  timeInPopupMs?: number;
  sectionsViewed?: string[]; // ['definition', 'examples', 'grammar', 'audio']
  occurredAt: string;
}

// ============================================================================
// LEARNING PROFILE
// ============================================================================

export type LearningApproach = 'contextual' | 'systematic' | 'immersive' | 'balanced';
export type PreferredPace = 'slow' | 'medium' | 'fast';
export type ReviewTiming = 'morning' | 'afternoon' | 'evening' | 'night';

export interface LearningProfile {
  id: string;
  userId: string;
  calculatedAt: string;

  // Primary Learning Modalities (0-1 scale)
  visualLearning: number;
  verbalLearning: number;
  kinestheticLearning: number;
  analyticalLearning: number;

  // Learning approach
  learningApproach?: LearningApproach;
  preferredPace?: PreferredPace;

  // Engagement metrics
  avgSessionDuration?: number;
  persistenceScore?: number;
  confidenceLevel?: number;
  fatigueThreshold?: number;

  // Review behavior
  srsAdherence?: number;
  reviewTiming?: ReviewTiming;
  optimalSessionLength?: number;

  // Feature preferences
  quizFrequency?: number;
  explorationDepth?: number;
  difficultyAdaptation?: number;

  // Sample size for confidence
  totalSessions: number;
  totalInteractions: number;
}

// ============================================================================
// AI COACH INSIGHTS
// ============================================================================

export type InsightType = 'observation' | 'strategy' | 'reflection_prompt';

export interface CoachInsight {
  id: string;
  userId: string;
  insightType: InsightType;
  title: string;
  content: string;
  basedOnProfile?: string; // JSON snapshot of profile data
  generatedAt: string;
  viewedAt?: string;
  dismissedAt?: string;
  userRating?: number; // 1-5
}

// ============================================================================
// TRACKING METADATA TYPES
// ============================================================================

export interface WordClickMetadata {
  word: string;
  translation?: string;
  hesitationMs: number;
  isRevisit: boolean;
  previousClicks: number;
}

export interface TabSwitchMetadata {
  fromTab: string;
  toTab: string;
  timeInPreviousTab: number;
}

export interface DifficultyChangeMetadata {
  oldDifficulty: number;
  newDifficulty: number;
  reason?: string;
}

export interface PopupMetadata {
  word: string;
  vocabularyId: string;
  sectionsViewed: string[];
  timeInPopup: number;
}

export interface QuizAnswerMetadata {
  questionId: string;
  questionType: string;
  word: string;
  isCorrect: boolean;
  hesitationMs: number;
  answerRevisions: number;
}

export interface ModalitySwitchMetadata {
  fromModality: 'visual' | 'verbal' | 'kinesthetic';
  toModality: 'visual' | 'verbal' | 'kinesthetic';
  context: string;
}

// ============================================================================
// TRACKING CONFIGURATION
// ============================================================================

export interface TrackingConfig {
  enabled: boolean;
  userId: string;
  sessionId: string;
  verbose?: boolean; // Log tracking events to console
}

// ============================================================================
// PATTERN ANALYSIS TYPES
// ============================================================================

export interface BehaviorPattern {
  patternType: string;
  confidence: number; // 0-1
  description: string;
  dataPoints: number;
  firstObserved: string;
  lastObserved: string;
}

export interface TabUsagePattern {
  tab: string;
  totalTime: number;
  visitCount: number;
  avgTimePerVisit: number;
  percentage: number;
}

export interface LearningStyleIndicators {
  visual: {
    score: number;
    indicators: string[];
  };
  verbal: {
    score: number;
    indicators: string[];
  };
  kinesthetic: {
    score: number;
    indicators: string[];
  };
  analytical: {
    score: number;
    indicators: string[];
  };
}
