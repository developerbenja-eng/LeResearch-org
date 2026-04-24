/**
 * Echo Origins - Type Definitions
 * The Systems That Made You: Education, Work, Communication, Economy, Social, Industrial
 */

// ==================== Timeline Types ====================

export type TimelineId =
  | 'education'
  | 'employment'
  | 'communication'
  | 'economy'
  | 'social'
  | 'industrial';

export type EraId =
  | 'ancient'
  | 'pre_industrial'
  | 'industrial'
  | 'information'
  | 'ai';

export interface ScholarReference {
  name: string;
  work: string;
  year?: number;
  quote?: string;
}

export interface TimelineEvent {
  id: string;
  timelineId: TimelineId;
  era: EraId;
  year?: number;
  yearEnd?: number;
  title: string;
  location?: string;
  description: string;
  keyInsight: string;
  characteristics: string[];
  scholars: ScholarReference[];
  counterArguments: string[];
  relatedEvents: string[];  // IDs of events in other timelines
  createdAt: string;
}

export interface Timeline {
  id: TimelineId;
  label: string;
  emoji: string;
  color: string;
  description: string;
  eventCount?: number;
}

// ==================== Thinker Types ====================

export type ThinkerId =
  | 'sapolsky'
  | 'rogers'
  | 'robinson'
  | 'kuhn'
  | 'gramsci'
  | 'tyack-cuban';

export interface Thinker {
  id: ThinkerId;
  name: string;
  field: string;
  era: string;
  keyWorks: string[];
  coreInsight: string;
  implications: string[];
  evidence: string[];
  counterArguments: string[];
  emoji: string;
  color: string;
  imageUrl?: string;
  createdAt: string;
}

// ==================== Paradigm Shift Types ====================

export interface ParadigmShift {
  id: string;
  title: string;
  beforeState: string;
  afterState: string;
  era: string;
  yearApprox?: number;
  description: string;
  forces: string[];  // What caused the shift
  questionForYou: string;  // Personal reflection prompt
  relatedTimelines: TimelineId[];
  createdAt: string;
}

// ==================== Framework Types ====================

export interface LearningLevel {
  level: 1 | 2 | 3;
  name: string;
  subtitle: string;
  description: string;
  focus: string;
  examples: string[];
  assessmentQuestion: string;
  color: string;
}

export interface Principle {
  id: number;
  name: string;
  source: string;
  sourceThinker?: ThinkerId;
  statement: string;
  therefore: string[];
  evidenceNeeded: string[];
  evidenceStatus: 'strong' | 'moderate' | 'weak';
  counterArguments: string[];
  category: 'foundation' | 'context' | 'response';
}

// ==================== User Progress Types ====================

export type OriginsContentType = 'timeline' | 'event' | 'thinker' | 'shift' | 'framework';

export interface OriginsProgress {
  id: string;
  userId: string;
  contentType: OriginsContentType;
  contentId: string;
  completed: boolean;
  notes?: string;
  lastViewed: string;
  createdAt: string;
}

// ==================== API Filter Types ====================

export interface EventFilters {
  timelineId?: TimelineId;
  era?: EraId;
  search?: string;
  limit?: number;
  offset?: number;
}

export interface ThinkerFilters {
  field?: string;
  search?: string;
}

// ==================== Metadata Constants ====================

export const TIMELINE_METADATA: Record<TimelineId, {
  label: string;
  emoji: string;
  color: string;
  description: string;
  question: string;
}> = {
  education: {
    label: 'Education',
    emoji: '📚',
    color: '#3b82f6',
    description: 'How we learn and transmit knowledge',
    question: 'Why does school look the way it does?',
  },
  employment: {
    label: 'Work',
    emoji: '💼',
    color: '#f59e0b',
    description: 'How we labor and organize production',
    question: 'Why do we sell our time by the hour?',
  },
  communication: {
    label: 'Communication',
    emoji: '📡',
    color: '#8b5cf6',
    description: 'How we share information and ideas',
    question: 'How did each medium reshape thought?',
  },
  economy: {
    label: 'Economy',
    emoji: '💰',
    color: '#22c55e',
    description: 'How we exchange value and resources',
    question: 'Why do we assume markets are natural?',
  },
  social: {
    label: 'Social Structures',
    emoji: '🏛️',
    color: '#ec4899',
    description: 'How we organize societies and power',
    question: 'What makes a nation-state seem inevitable?',
  },
  industrial: {
    label: 'Industrial Revolutions',
    emoji: '🏭',
    color: '#6366f1',
    description: 'How we transformed production and energy',
    question: 'Why Britain first? Why did it spread?',
  },
};

export const ERA_METADATA: Record<EraId, {
  label: string;
  yearRange: string;
  color: string;
  description: string;
}> = {
  ancient: {
    label: 'Ancient',
    yearRange: '~200,000 BCE - 500 CE',
    color: '#78716c',
    description: 'Before widespread literacy and formal institutions',
  },
  pre_industrial: {
    label: 'Pre-Industrial',
    yearRange: '500 - 1760',
    color: '#a78bfa',
    description: 'Feudal systems, guilds, and early modernity',
  },
  industrial: {
    label: 'Industrial',
    yearRange: '1760 - 1970',
    color: '#f97316',
    description: 'Mass production, urbanization, nation-states',
  },
  information: {
    label: 'Information',
    yearRange: '1970 - 2020',
    color: '#06b6d4',
    description: 'Computers, internet, knowledge workers',
  },
  ai: {
    label: 'AI Era',
    yearRange: '2020 - Present',
    color: '#ec4899',
    description: 'Artificial intelligence reshaping everything',
  },
};

export const THINKER_METADATA: Record<ThinkerId, {
  name: string;
  emoji: string;
  color: string;
  field: string;
  shortInsight: string;
}> = {
  sapolsky: {
    name: 'Robert Sapolsky',
    emoji: '🧠',
    color: '#ef4444',
    field: 'Neuroscience',
    shortInsight: 'Environment shapes biology across timescales',
  },
  rogers: {
    name: 'Carl Rogers',
    emoji: '🌱',
    color: '#22c55e',
    field: 'Humanistic Psychology',
    shortInsight: 'Humans naturally grow given supportive conditions',
  },
  robinson: {
    name: 'Ken Robinson',
    emoji: '🎨',
    color: '#f59e0b',
    field: 'Education',
    shortInsight: 'Diverse intelligence is suppressed by schools',
  },
  kuhn: {
    name: 'Thomas Kuhn',
    emoji: '🔬',
    color: '#3b82f6',
    field: 'Philosophy of Science',
    shortInsight: 'Paradigms resist change until crisis',
  },
  gramsci: {
    name: 'Gramsci & Althusser',
    emoji: '⚔️',
    color: '#dc2626',
    field: 'Political Theory',
    shortInsight: 'Power becomes invisible "common sense"',
  },
  'tyack-cuban': {
    name: 'Tyack & Cuban',
    emoji: '🏫',
    color: '#8b5cf6',
    field: 'Education History',
    shortInsight: 'The "grammar of schooling" persists despite reform',
  },
};

export const LEARNING_LEVELS: LearningLevel[] = [
  {
    level: 1,
    name: 'Content',
    subtitle: 'The Vehicle',
    description: 'Facts, concepts, procedures - the actual material being learned.',
    focus: 'What to learn',
    examples: [
      'Mathematical formulas',
      'Historical dates',
      'Scientific principles',
      'Vocabulary words',
    ],
    assessmentQuestion: 'Can you recall and apply specific knowledge?',
    color: '#3b82f6',
  },
  {
    level: 2,
    name: 'Process',
    subtitle: 'The Capability',
    description: 'Metacognition - understanding how you learn best.',
    focus: 'How you learn',
    examples: [
      'Knowing you focus better in morning',
      'Recognizing when you\'re memorizing vs. understanding',
      'Choosing effective study strategies',
      'Managing your attention and energy',
    ],
    assessmentQuestion: 'Do you know how you learn most effectively?',
    color: '#f59e0b',
  },
  {
    level: 3,
    name: 'Identity',
    subtitle: 'The Destination',
    description: 'The deep belief: "I can figure out how to learn anything."',
    focus: 'Who you are as a learner',
    examples: [
      'Approaching new domains with confidence',
      'Seeing challenges as learnable, not fixed',
      'Using AI as a tool, not a crutch',
      'Adapting to constant change',
    ],
    assessmentQuestion: 'Do you believe you can learn anything you need to?',
    color: '#22c55e',
  },
];

export const PRINCIPLE_CATEGORIES = {
  foundation: {
    label: 'Foundation',
    description: 'What humans are',
    color: '#3b82f6',
  },
  context: {
    label: 'Context',
    description: 'What environment we\'re in',
    color: '#f59e0b',
  },
  response: {
    label: 'Response',
    description: 'What we should do',
    color: '#22c55e',
  },
};

// ==================== Helper Functions ====================

export function getTimelineColor(timelineId: TimelineId): string {
  return TIMELINE_METADATA[timelineId]?.color || '#6b7280';
}

export function getEraColor(eraId: EraId): string {
  return ERA_METADATA[eraId]?.color || '#6b7280';
}

export function getThinkerColor(thinkerId: ThinkerId): string {
  return THINKER_METADATA[thinkerId]?.color || '#6b7280';
}

export function getAllTimelines(): Timeline[] {
  return Object.entries(TIMELINE_METADATA).map(([id, meta]) => ({
    id: id as TimelineId,
    ...meta,
  }));
}

export function getAllEras(): Array<{ id: EraId } & typeof ERA_METADATA[EraId]> {
  return Object.entries(ERA_METADATA).map(([id, meta]) => ({
    id: id as EraId,
    ...meta,
  }));
}
