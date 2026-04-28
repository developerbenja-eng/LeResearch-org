// Echo Anatomy Hall - Human Body Learning Feature Types

// ==================== Core Enums & Categories ====================

export type AnatomyCategory = 'bone' | 'muscle' | 'organ' | 'nerve' | 'vessel' | 'ligament' | 'tendon' | 'cartilage' | 'gland';

export type BodySystem =
  | 'skeletal'
  | 'muscular'
  | 'nervous'
  | 'cardiovascular'
  | 'respiratory'
  | 'digestive'
  | 'urinary'
  | 'endocrine'
  | 'lymphatic'
  | 'integumentary'
  | 'reproductive';

export type BodyRegion =
  | 'head'
  | 'neck'
  | 'thorax'
  | 'abdomen'
  | 'pelvis'
  | 'upper_limb'
  | 'lower_limb'
  | 'back';

export type AnatomyDifficulty = 'beginner' | 'intermediate' | 'advanced';

export type AnatomyLensType = 'anatomical' | 'functional' | 'clinical' | 'connections' | 'interactive';

export type RelationshipType =
  | 'origin'
  | 'insertion'
  | 'innervation'
  | 'blood_supply'
  | 'venous_drainage'
  | 'lymphatic_drainage'
  | 'articulation'
  | 'attachment'
  | 'contains'
  | 'adjacent_to';

export type VocabStatus = 'new' | 'learning' | 'reviewing' | 'mastered';

export type QuizType = 'identification' | 'labeling' | 'function' | 'relationships' | 'clinical' | 'mixed';

export type JourneyStepType = 'lesson' | 'exploration' | 'quiz' | 'review' | 'summary';

// ==================== Anatomical Structures ====================

export interface AnatomyStructure {
  id: string;
  name: string;
  latinName: string | null;
  category: AnatomyCategory;
  system: BodySystem;
  region: BodyRegion;
  difficulty: AnatomyDifficulty;
  description: string;
  parentStructureId: string | null;
  modelPath: string | null;
  modelHighlightIds: string[];
  imageUrls: string[];
  prerequisites: string[];
  relatedStructures: string[];
  clinicalSignificance: string | null;
  createdAt: string;
  updatedAt?: string;
}

export interface AnatomyStructureWithLenses extends AnatomyStructure {
  lenses: AnatomyLens[];
}

export interface AnatomyStructureWithRelationships extends AnatomyStructure {
  relationships: AnatomyRelationship[];
  relatedStructureDetails: AnatomyStructure[];
}

// ==================== Lenses ====================

export interface AnatomyLens {
  id: string;
  structureId: string;
  lensType: AnatomyLensType;
  title: string;
  content: string;
  imageReferences: ImageReference[];
  videoReferences: VideoReference[];
  modelAnnotations: ModelAnnotation[];
  interactiveData: InteractiveData | null;
  createdAt: string;
}

export interface ImageReference {
  url: string;
  caption: string;
  type: 'diagram' | 'photo' | 'xray' | 'mri' | 'ct' | 'histology' | 'illustration';
}

export interface VideoReference {
  url: string;
  title: string;
  startTime?: number;
  endTime?: number;
  source: 'youtube' | 'vimeo' | 'local';
}

export interface ModelAnnotation {
  meshId: string;
  label: string;
  description: string;
  position: { x: number; y: number; z: number };
}

export interface InteractiveData {
  type: 'muscle_action' | 'joint_movement' | 'blood_flow' | 'nerve_pathway' | 'quiz_hotspot';
  data: Record<string, unknown>;
}

// ==================== Relationships ====================

export interface AnatomyRelationship {
  id: string;
  sourceStructureId: string;
  targetStructureId: string;
  relationshipType: RelationshipType;
  description: string;
  clinicalNote: string | null;
  createdAt: string;
}

// ==================== 3D Models ====================

export interface AnatomyModel {
  id: string;
  filePath: string;
  fileName: string;
  modelType: 'full_body' | 'system' | 'region' | 'structure';
  system: BodySystem | null;
  region: BodyRegion | null;
  meshIds: string[];
  meshToStructureMap: Record<string, string>;
  thumbnailUrl: string | null;
  createdAt: string;
}

// ==================== User & Learning ====================

export interface AnatomyUser {
  id: string;
  mainUserId: string | null;
  name: string;
  currentStreak: number;
  longestStreak: number;
  lastActivityDate: string | null;
  preferredLearningStyle: 'visual' | 'textual' | 'interactive' | 'mixed';
  focusSystems: BodySystem[];
  createdAt: string;
  updatedAt: string;
}

export interface AnatomyVocabulary {
  id: string;
  userId: string;
  term: string;
  termNormalized: string;
  definition: string;
  relatedStructureId: string | null;
  status: VocabStatus;
  timesSeen: number;
  timesCorrect: number;
  firstSeenAt: string;
  lastSeenAt: string;
  masteredAt: string | null;
  nextReviewDate: string | null;
  easeFactor: number;
  intervalDays: number;
  lastReviewDate: string | null;
  reviewCount: number;
}

// ==================== SRS Reviews ====================

export interface AnatomyReview {
  id: string;
  userId: string;
  vocabularyId: string | null;
  structureId: string | null;
  reviewType: 'vocabulary' | 'structure' | 'relationship';
  quality: number; // 0-5 (SM-2 scale)
  responseTimeMs: number;
  previousEaseFactor: number;
  newEaseFactor: number;
  previousInterval: number;
  newInterval: number;
  reviewedAt: string;
}

export interface SRSUpdateResult {
  nextReviewDate: string;
  intervalDays: number;
  easeFactor: number;
  isCorrect: boolean;
}

// ==================== Quiz System ====================

export interface AnatomyQuizSession {
  id: string;
  userId: string;
  quizType: QuizType;
  focusSystem: BodySystem | null;
  focusRegion: BodyRegion | null;
  difficulty: AnatomyDifficulty;
  totalQuestions: number;
  correctAnswers: number;
  durationSeconds: number | null;
  completedAt: string | null;
  createdAt: string;
}

export interface AnatomyQuizAnswer {
  id: string;
  sessionId: string;
  structureId: string;
  questionType: QuizType;
  questionText: string;
  userAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
  responseTimeMs: number;
  answeredAt: string;
}

export interface QuizQuestion {
  id: string;
  structureId: string;
  type: QuizType;
  question: string;
  correctAnswer: string;
  options: string[];
  imageUrl?: string;
  modelHighlight?: string[];
  difficulty: AnatomyDifficulty;
  hint?: string;
}

export interface QuizResult {
  sessionId: string;
  score: number;
  correctCount: number;
  totalCount: number;
  accuracy: number;
  averageResponseTime: number;
  questionsReviewed: QuizAnswerResult[];
  systemBreakdown: Record<BodySystem, { correct: number; total: number }>;
}

export interface QuizAnswerResult {
  structureName: string;
  question: string;
  userAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
  responseTime: number;
  explanation?: string;
}

// ==================== Learning Journeys ====================

export interface AnatomyJourney {
  id: string;
  title: string;
  description: string;
  system: BodySystem | null;
  region: BodyRegion | null;
  difficulty: AnatomyDifficulty;
  estimatedMinutes: number;
  emoji: string;
  color: string;
  prerequisites: string[];
  steps: JourneyStep[];
  createdAt: string;
  updatedAt?: string;
}

export interface JourneyStep {
  id: string;
  title: string;
  type: JourneyStepType;
  content: string;
  structureIds: string[];
  videoUrl?: string;
  quizQuestions?: QuizQuestion[];
  modelFocus?: {
    modelId: string;
    highlightMeshIds: string[];
    cameraPosition: { x: number; y: number; z: number };
  };
  duration?: number;
}

export interface AnatomyJourneyProgress {
  id: string;
  userId: string;
  journeyId: string;
  currentStep: number;
  completedSteps: number[];
  startedAt: string;
  completedAt: string | null;
  lastActivityAt: string;
}

// ==================== Progress Tracking ====================

export interface AnatomyStructureProgress {
  id: string;
  userId: string;
  structureId: string;
  masteryLevel: number; // 0-100
  timesStudied: number;
  timesQuizzed: number;
  timesCorrect: number;
  lensesViewed: AnatomyLensType[];
  firstStudiedAt: string;
  lastStudiedAt: string;
}

export interface SystemProgress {
  system: BodySystem;
  totalStructures: number;
  studiedStructures: number;
  masteredStructures: number;
  averageMastery: number;
  quizAccuracy: number;
}

export interface RegionProgress {
  region: BodyRegion;
  totalStructures: number;
  studiedStructures: number;
  masteredStructures: number;
  averageMastery: number;
}

export interface OverallProgress {
  totalStructuresStudied: number;
  totalStructuresMastered: number;
  totalVocabularyLearned: number;
  totalQuizzesTaken: number;
  averageQuizScore: number;
  currentStreak: number;
  longestStreak: number;
  totalStudyTimeMinutes: number;
  systemProgress: SystemProgress[];
  regionProgress: RegionProgress[];
  recentActivity: ActivityEntry[];
}

export interface ActivityEntry {
  type: 'study' | 'quiz' | 'review' | 'journey';
  timestamp: string;
  description: string;
  structureId?: string;
  journeyId?: string;
  score?: number;
}

// ==================== Analytics ====================

export interface LearningAnalytics {
  totalStudyDays: number;
  averageSessionDuration: number;
  totalStructuresLearned: number;
  dailyProgress: DailyProgress[];
  weeklyProgress: WeeklyProgress[];
  overallRetentionRate: number;
  retentionBySystem: Record<BodySystem, number>;
  totalQuizzesTaken: number;
  averageQuizScore: number;
  quizAccuracyTrend: { date: string; accuracy: number }[];
  weakestStructures: { structureId: string; name: string; accuracy: number }[];
  strongestStructures: { structureId: string; name: string; accuracy: number }[];
  studyTimeByDayOfWeek: Record<string, number>;
  studyTimeByHour: Record<number, number>;
  structuresScheduledForReview: number;
  averageReviewInterval: number;
}

export interface DailyProgress {
  date: string;
  structuresStudied: number;
  structuresReviewed: number;
  quizzesTaken: number;
  minutesStudied: number;
}

export interface WeeklyProgress {
  weekStart: string;
  structuresStudied: number;
  structuresReviewed: number;
  quizzesTaken: number;
  minutesStudied: number;
  averageQuizScore: number;
}

// ==================== API Types ====================

export interface StructureFilters {
  system?: BodySystem;
  region?: BodyRegion;
  category?: AnatomyCategory;
  difficulty?: AnatomyDifficulty;
  search?: string;
  parentId?: string;
  limit?: number;
  offset?: number;
}

export interface VocabularyFilters {
  status?: VocabStatus;
  relatedStructureId?: string;
  search?: string;
  limit?: number;
  offset?: number;
}

export interface QuizGenerateRequest {
  quizType: QuizType;
  focusSystem?: BodySystem;
  focusRegion?: BodyRegion;
  difficulty?: AnatomyDifficulty;
  questionCount: number;
}

export interface QuizSubmitRequest {
  sessionId: string;
  answers: {
    questionId: string;
    answer: string;
    responseTimeMs: number;
  }[];
}

// ==================== 3D Viewer State ====================

export interface LayerVisibility {
  skeletal: boolean;
  muscular: boolean;
  nervous: boolean;
  cardiovascular: boolean;
  respiratory: boolean;
  digestive: boolean;
  urinary: boolean;
  endocrine: boolean;
  lymphatic: boolean;
  integumentary: boolean;
  reproductive: boolean;
}

export interface ViewerState {
  modelLoaded: boolean;
  modelUrl: string | null;
  visibleLayers: LayerVisibility;
  selectedStructure: string | null;
  hoveredStructure: string | null;
  isolatedRegion: BodyRegion | null;
  activeLens: AnatomyLensType;
  cameraTarget: { x: number; y: number; z: number } | null;
  viewMode: 'explore' | 'quiz' | 'journey';
}

// ==================== Metadata Constants ====================

export const LENS_METADATA: Record<AnatomyLensType, { emoji: string; label: string; description: string; color: string }> = {
  anatomical: {
    emoji: '🦴',
    label: 'Anatomical',
    description: 'Structure, location, and physical characteristics',
    color: '#3b82f6',
  },
  functional: {
    emoji: '⚡',
    label: 'Functional',
    description: 'What it does and how it works',
    color: '#22c55e',
  },
  clinical: {
    emoji: '🏥',
    label: 'Clinical',
    description: 'Medical relevance, conditions, and injuries',
    color: '#ef4444',
  },
  connections: {
    emoji: '🔗',
    label: 'Connections',
    description: 'Relationships to other structures',
    color: '#a855f7',
  },
  interactive: {
    emoji: '🎮',
    label: 'Interactive',
    description: 'Explore with 3D models and exercises',
    color: '#f59e0b',
  },
};

export const SYSTEM_METADATA: Record<BodySystem, { emoji: string; label: string; color: string; description: string }> = {
  skeletal: {
    emoji: '🦴',
    label: 'Skeletal',
    color: '#f5f5f4',
    description: 'Bones and cartilage providing structure and support',
  },
  muscular: {
    emoji: '💪',
    label: 'Muscular',
    color: '#dc2626',
    description: 'Muscles enabling movement and posture',
  },
  nervous: {
    emoji: '🧠',
    label: 'Nervous',
    color: '#fbbf24',
    description: 'Brain, spinal cord, and nerves controlling the body',
  },
  cardiovascular: {
    emoji: '❤️',
    label: 'Cardiovascular',
    color: '#b91c1c',
    description: 'Heart and blood vessels circulating blood',
  },
  respiratory: {
    emoji: '🫁',
    label: 'Respiratory',
    color: '#60a5fa',
    description: 'Lungs and airways for breathing',
  },
  digestive: {
    emoji: '🫃',
    label: 'Digestive',
    color: '#84cc16',
    description: 'Organs processing food and nutrients',
  },
  urinary: {
    emoji: '💧',
    label: 'Urinary',
    color: '#fcd34d',
    description: 'Kidneys and bladder filtering waste',
  },
  endocrine: {
    emoji: '🧪',
    label: 'Endocrine',
    color: '#c084fc',
    description: 'Glands producing hormones',
  },
  lymphatic: {
    emoji: '🛡️',
    label: 'Lymphatic',
    color: '#4ade80',
    description: 'Immune system and lymph circulation',
  },
  integumentary: {
    emoji: '🖐️',
    label: 'Integumentary',
    color: '#fbbf24',
    description: 'Skin, hair, and nails',
  },
  reproductive: {
    emoji: '🧬',
    label: 'Reproductive',
    color: '#f472b6',
    description: 'Reproductive organs and processes',
  },
};

export const REGION_METADATA: Record<BodyRegion, { emoji: string; label: string; description: string }> = {
  head: { emoji: '🗣️', label: 'Head', description: 'Skull, face, and brain' },
  neck: { emoji: '🦒', label: 'Neck', description: 'Cervical region connecting head to torso' },
  thorax: { emoji: '🫁', label: 'Thorax', description: 'Chest containing heart and lungs' },
  abdomen: { emoji: '🫃', label: 'Abdomen', description: 'Belly containing digestive organs' },
  pelvis: { emoji: '🦴', label: 'Pelvis', description: 'Hip region and pelvic organs' },
  upper_limb: { emoji: '💪', label: 'Upper Limb', description: 'Shoulder, arm, forearm, and hand' },
  lower_limb: { emoji: '🦵', label: 'Lower Limb', description: 'Hip, thigh, leg, and foot' },
  back: { emoji: '🔙', label: 'Back', description: 'Spine and posterior muscles' },
};

export const CATEGORY_METADATA: Record<AnatomyCategory, { emoji: string; label: string; color: string }> = {
  bone: { emoji: '🦴', label: 'Bone', color: '#f5f5f4' },
  muscle: { emoji: '💪', label: 'Muscle', color: '#dc2626' },
  organ: { emoji: '🫀', label: 'Organ', color: '#7c3aed' },
  nerve: { emoji: '⚡', label: 'Nerve', color: '#fbbf24' },
  vessel: { emoji: '🩸', label: 'Vessel', color: '#dc2626' },
  ligament: { emoji: '🔗', label: 'Ligament', color: '#a3a3a3' },
  tendon: { emoji: '🎗️', label: 'Tendon', color: '#fafafa' },
  cartilage: { emoji: '🔵', label: 'Cartilage', color: '#60a5fa' },
  gland: { emoji: '💠', label: 'Gland', color: '#c084fc' },
};

export const RELATIONSHIP_METADATA: Record<RelationshipType, { label: string; description: string }> = {
  origin: { label: 'Origin', description: 'Where a muscle attaches proximally' },
  insertion: { label: 'Insertion', description: 'Where a muscle attaches distally' },
  innervation: { label: 'Innervation', description: 'Nerve supply to a structure' },
  blood_supply: { label: 'Blood Supply', description: 'Arterial supply to a structure' },
  venous_drainage: { label: 'Venous Drainage', description: 'Veins draining a structure' },
  lymphatic_drainage: { label: 'Lymphatic Drainage', description: 'Lymph drainage pathway' },
  articulation: { label: 'Articulation', description: 'Joint connection between bones' },
  attachment: { label: 'Attachment', description: 'General attachment point' },
  contains: { label: 'Contains', description: 'Structure contained within another' },
  adjacent_to: { label: 'Adjacent To', description: 'Structures next to each other' },
};

// ==================== 3D Model URLs (GCS - Draco Compressed) ====================

const GCS_BASE_URL = 'https://storage.googleapis.com/echo-home-reader-storage-2025/anatomy-models-draco';

export const ANATOMY_MODEL_URLS = {
  myology: `${GCS_BASE_URL}/myology.glb`,           // Muscles (16MB, Draco compressed from 154MB)
  angiology: `${GCS_BASE_URL}/angiology.glb`,       // Blood vessels (8.5MB, from 114MB)
  neurology: `${GCS_BASE_URL}/neurology.glb`,       // Nerves (7.8MB, from 83MB)
  muscular_insertions: `${GCS_BASE_URL}/muscular_insertions.glb`, // Muscle attachments (5.1MB, from 52MB)
  splanchnology: `${GCS_BASE_URL}/splanchnology.glb`, // Organs (4.9MB, from 48MB)
  arthrology: `${GCS_BASE_URL}/arthrology.glb`,     // Joints (4.2MB, from 48MB)
} as const;

// Note: Models use KHR_draco_mesh_compression extension
// Total: ~46MB (down from ~500MB original)

export type AnatomyModelKey = keyof typeof ANATOMY_MODEL_URLS;

// Map body systems to their corresponding 3D models
export const SYSTEM_TO_MODEL: Partial<Record<BodySystem, AnatomyModelKey>> = {
  muscular: 'myology',
  cardiovascular: 'angiology',
  nervous: 'neurology',
  digestive: 'splanchnology',
  respiratory: 'splanchnology',
  urinary: 'splanchnology',
  endocrine: 'splanchnology',
  skeletal: 'arthrology', // Joints/ligaments - for bones we'd need osteology
};
