/**
 * Nutrition Module Types
 * For the Echo Nourish - Epistemology of Nutrition module
 */

// Discovery categories
export type DiscoveryCategory =
  | 'vitamin'
  | 'mineral'
  | 'macronutrient'
  | 'method'
  | 'guideline'
  | 'theory';

// A single nutritional discovery
export interface NutritionDiscovery {
  id: string;
  year: number;
  endYear?: number;            // For discoveries spanning years
  title: string;
  description: string;         // Full narrative
  shortDescription: string;    // For timeline cards
  scientistName?: string;
  scientistId?: string;
  category: DiscoveryCategory;
  impact: string;              // "What changed" section
  primarySources: PrimarySource[];
  relatedDiscoveries?: string[];  // IDs of related discoveries
  imageUrl?: string;
  createdAt: string;
}

// Primary source citation
export interface PrimarySource {
  title: string;
  authors: string[];
  year: number;
  publication?: string;
  url?: string;                // Link to paper/archive
  doi?: string;
  type: 'paper' | 'book' | 'archive' | 'government' | 'news';
}

// Nutrition pioneer/scientist
export interface NutritionPioneer {
  id: string;
  name: string;
  birthYear?: number;
  deathYear?: number;
  nationality: string;
  portraitUrl?: string;
  biography: string;
  shortBio: string;            // For cards
  keyContributions: string[];
  notableQuote?: string;
  discoveries: string[];       // Discovery IDs
  createdAt: string;
}

// Measurement method
export interface MeasurementMethod {
  id: string;
  name: string;
  description: string;
  inventedYear: number;
  inventor?: string;
  howItWorks: string;          // Detailed explanation
  limitations: string[];
  accuracy: string;            // e.g., "±5%" or "highly variable"
  stillUsed: boolean;
  modernAlternative?: string;
  visualType: 'animation' | 'diagram' | 'interactive';
}

// Dietary standard/guideline
export interface DietaryStandard {
  id: string;
  name: string;
  value: string;               // e.g., "2000 calories"
  description: string;
  originYear: number;
  originStory: string;         // The full narrative
  organization: string;        // e.g., "FDA", "WHO"
  country: string;
  howDetermined: string;
  limitations: string[];
  changes: StandardChange[];   // History of changes
}

export interface StandardChange {
  year: number;
  previousValue: string;
  newValue: string;
  reason: string;
}

// Nutrition mystery/contested area
export interface NutritionMystery {
  id: string;
  title: string;
  description: string;
  category: 'contested' | 'unknown' | 'emerging' | 'debunked';
  currentConsensus?: string;
  arguments: {
    position: string;
    evidence: string;
    proponents: string[];
  }[];
  whyItMatters: string;
  latestResearch?: string;
}

// User progress tracking
export interface NutritionProgress {
  id: string;
  userId: string;
  sectionId: string;
  sectionType: 'timeline' | 'measurement' | 'standards' | 'mysteries' | 'pioneer';
  completedAt?: string;
  notes?: string;
  createdAt: string;
}

// Timeline filter options
export interface TimelineFilters {
  categories: DiscoveryCategory[];
  yearRange: [number, number];
  searchQuery?: string;
}

// Journey section for landing page
export interface JourneySection {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  href: string;
  icon: string;               // Emoji or icon name
  color: string;              // Hex color
  gradient: string;           // Tailwind gradient classes
  comingSoon?: boolean;
}

// Constants
export const DISCOVERY_CATEGORIES: Record<DiscoveryCategory, { label: string; color: string; emoji: string }> = {
  vitamin: { label: 'Vitamin', color: '#22c55e', emoji: '💊' },
  mineral: { label: 'Mineral', color: '#3b82f6', emoji: '🔬' },
  macronutrient: { label: 'Macronutrient', color: '#f59e0b', emoji: '🥩' },
  method: { label: 'Method', color: '#8b5cf6', emoji: '⚗️' },
  guideline: { label: 'Guideline', color: '#ec4899', emoji: '📋' },
  theory: { label: 'Theory', color: '#06b6d4', emoji: '💡' },
};

export const JOURNEY_SECTIONS: JourneySection[] = [
  {
    id: 'timeline',
    title: 'Discovery Timeline',
    subtitle: 'The Story of Nutrients',
    description: 'How we discovered vitamins, minerals, and the science of food',
    href: '/learn/nutrition/timeline',
    icon: '📜',
    color: '#22c55e',
    gradient: 'from-green-500 to-emerald-600',
  },
  {
    id: 'measurement',
    title: 'Measurement',
    subtitle: 'How Do We Know What\'s In Food?',
    description: 'Calorimetry, lab methods, and the accuracy of nutrition labels',
    href: '/learn/nutrition/measurement',
    icon: '⚖️',
    color: '#3b82f6',
    gradient: 'from-blue-500 to-indigo-600',
  },
  {
    id: 'standards',
    title: 'Standards',
    subtitle: 'Who Decides What We Should Eat?',
    description: 'Where the 2000 calorie diet, RDAs, and guidelines come from',
    href: '/learn/nutrition/standards',
    icon: '📊',
    color: '#f59e0b',
    gradient: 'from-amber-500 to-orange-600',
  },
  {
    id: 'mysteries',
    title: 'Mysteries',
    subtitle: 'What We Don\'t Know',
    description: 'Contested science, individual variation, and emerging research',
    href: '/learn/nutrition/mysteries',
    icon: '🔮',
    color: '#8b5cf6',
    gradient: 'from-purple-500 to-pink-600',
  },
];
