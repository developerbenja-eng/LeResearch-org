// Echo Alchemy - Food Science Types

// ==================== Core Enums ====================

export type ReactionType =
  | 'maillard'
  | 'caramelization'
  | 'denaturation'
  | 'fermentation'
  | 'emulsification'
  | 'gelatinization'
  | 'oxidation'
  | 'hydrolysis';

export type CultureType =
  | 'chinese'
  | 'mexican'
  | 'indian'
  | 'japanese'
  | 'french'
  | 'italian'
  | 'korean'
  | 'thai'
  | 'peruvian'
  | 'mediterranean'
  | 'middle_eastern'
  | 'american';

export type TemperatureCategory =
  | 'protein'
  | 'sugar'
  | 'fat'
  | 'starch'
  | 'water'
  | 'chemical';

export type MoleculeCategory =
  | 'aroma'
  | 'taste'
  | 'texture'
  | 'color'
  | 'preservative';

export type HeatTransferMethod = 'conduction' | 'convection' | 'radiation';

export type AlchemySectionType =
  | 'reaction'
  | 'technique'
  | 'temperature'
  | 'molecule'
  | 'recipe';

// ==================== Chemical Reactions ====================

export interface VisualCue {
  type: 'color' | 'smell' | 'texture' | 'sound';
  description: string;
  indicator: string;
}

export interface CulturalExample {
  culture: CultureType;
  dish: string;
  description: string;
}

export interface ChemicalReaction {
  id: string;
  name: string;
  type: ReactionType;
  description: string;
  shortDescription: string;
  temperatureMinC: number | null;
  temperatureMaxC: number | null;
  temperatureMinF: number | null;
  temperatureMaxF: number | null;
  reactants: string[];
  products: string[];
  mechanism: string;
  visualCues: VisualCue[];
  commonFoods: string[];
  culturalExamples: CulturalExample[];
  imageUrl: string | null;
  videoUrl: string | null;
  createdAt: string;
}

// ==================== Cooking Techniques ====================

export interface TechniqueDetail {
  step: string;
  science: string;
  tip: string;
}

export interface CookingTechnique {
  id: string;
  name: string;
  nativeName: string | null;
  culture: CultureType;
  description: string;
  shortDescription: string;
  scienceExplanation: string;
  temperatureRange: string;
  keyReactions: string[];
  equipment: string[];
  keyTechniques: TechniqueDetail[];
  historicalContext: string;
  healthBenefits: string | null;
  exampleDishes: string[];
  imageUrl: string | null;
  videoUrl: string | null;
  createdAt: string;
}

// ==================== Temperature Events ====================

export interface TemperatureEvent {
  id: string;
  temperatureC: number;
  temperatureF: number;
  eventName: string;
  description: string;
  category: TemperatureCategory;
  visualIndicator: string | null;
  reversible: boolean;
  relatedReactions: string[];
  foodsAffected: string[];
  tips: string | null;
  createdAt: string;
}

// ==================== Molecules ====================

export interface TasteProfile {
  bitter: number;
  sweet: number;
  sour: number;
  salty: number;
  umami: number;
}

export interface FlavorMolecule {
  id: string;
  name: string;
  commonName: string | null;
  chemicalFormula: string | null;
  molecularWeight: number | null;
  category: MoleculeCategory;
  tasteProfile: TasteProfile | null;
  aromaProfile: string[];
  foundIn: string[];
  createdByReaction: string | null;
  thresholdPpm: number | null;
  safetyNotes: string | null;
  synergies: string[];
  antagonists: string[];
  imageUrl: string | null;
  createdAt: string;
}

// ==================== User Progress ====================

export interface AlchemyProgress {
  id: string;
  userId: string;
  sectionId: string;
  sectionType: AlchemySectionType;
  completedAt: string | null;
  notes: string | null;
  createdAt: string;
}

// ==================== Navigation Sections ====================

export interface AlchemySection {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  href: string;
  icon: string;
  color: string;
  gradient: string;
  comingSoon?: boolean;
}

// ==================== Constants ====================

export const REACTION_TYPES: Record<
  ReactionType,
  { label: string; color: string; emoji: string; description: string }
> = {
  maillard: {
    label: 'Maillard Reaction',
    color: '#b45309',
    emoji: '🍞',
    description: 'Browning between amino acids and sugars',
  },
  caramelization: {
    label: 'Caramelization',
    color: '#d97706',
    emoji: '🍯',
    description: 'Thermal decomposition of sugars',
  },
  denaturation: {
    label: 'Protein Denaturation',
    color: '#dc2626',
    emoji: '🍳',
    description: 'Unfolding of protein structures',
  },
  fermentation: {
    label: 'Fermentation',
    color: '#65a30d',
    emoji: '🧬',
    description: 'Microbial transformation of sugars',
  },
  emulsification: {
    label: 'Emulsification',
    color: '#0891b2',
    emoji: '🥣',
    description: 'Mixing of immiscible liquids',
  },
  gelatinization: {
    label: 'Gelatinization',
    color: '#7c3aed',
    emoji: '🍝',
    description: 'Starch granule swelling and thickening',
  },
  oxidation: {
    label: 'Oxidation',
    color: '#78716c',
    emoji: '🍎',
    description: 'Reaction with oxygen',
  },
  hydrolysis: {
    label: 'Hydrolysis',
    color: '#0ea5e9',
    emoji: '💧',
    description: 'Breaking bonds with water',
  },
};

export const CULTURE_METADATA: Record<
  CultureType,
  { label: string; emoji: string; region: string }
> = {
  chinese: { label: 'Chinese', emoji: '🥢', region: 'East Asia' },
  mexican: { label: 'Mexican', emoji: '🌶️', region: 'Central America' },
  indian: { label: 'Indian', emoji: '🍛', region: 'South Asia' },
  japanese: { label: 'Japanese', emoji: '🍱', region: 'East Asia' },
  french: { label: 'French', emoji: '🥐', region: 'Western Europe' },
  italian: { label: 'Italian', emoji: '🍝', region: 'Southern Europe' },
  korean: { label: 'Korean', emoji: '🥬', region: 'East Asia' },
  thai: { label: 'Thai', emoji: '🍜', region: 'Southeast Asia' },
  peruvian: { label: 'Peruvian', emoji: '🐟', region: 'South America' },
  mediterranean: {
    label: 'Mediterranean',
    emoji: '🫒',
    region: 'Mediterranean Basin',
  },
  middle_eastern: { label: 'Middle Eastern', emoji: '🧆', region: 'Western Asia' },
  american: { label: 'American', emoji: '🍔', region: 'North America' },
};

export const MOLECULE_CATEGORIES: Record<
  MoleculeCategory,
  { label: string; color: string; emoji: string }
> = {
  aroma: { label: 'Aroma', color: '#f472b6', emoji: '👃' },
  taste: { label: 'Taste', color: '#f59e0b', emoji: '👅' },
  texture: { label: 'Texture', color: '#8b5cf6', emoji: '✋' },
  color: { label: 'Color', color: '#22c55e', emoji: '🎨' },
  preservative: { label: 'Preservative', color: '#64748b', emoji: '🧊' },
};

export const TEMPERATURE_CATEGORIES: Record<
  TemperatureCategory,
  { label: string; color: string; emoji: string }
> = {
  protein: { label: 'Protein', color: '#dc2626', emoji: '🥩' },
  sugar: { label: 'Sugar', color: '#d97706', emoji: '🍬' },
  fat: { label: 'Fat', color: '#fbbf24', emoji: '🧈' },
  starch: { label: 'Starch', color: '#7c3aed', emoji: '🥔' },
  water: { label: 'Water', color: '#0ea5e9', emoji: '💧' },
  chemical: { label: 'Chemical', color: '#22c55e', emoji: '⚗️' },
};

export const JOURNEY_SECTIONS: AlchemySection[] = [
  {
    id: 'reactions',
    title: 'Chemical Reactions',
    subtitle: 'The Science of Transformation',
    description:
      'Maillard reaction, caramelization, denaturation, fermentation, and more',
    href: '/learn/alchemy/reactions',
    icon: '⚗️',
    color: '#b45309',
    gradient: 'from-amber-600 to-orange-700',
  },
  {
    id: 'techniques',
    title: 'Cultural Techniques',
    subtitle: 'Global Cooking Decoded',
    description:
      'Wok hei, nixtamalization, tadka, sous vide - the science behind traditions',
    href: '/learn/alchemy/techniques',
    icon: '🌍',
    color: '#dc2626',
    gradient: 'from-red-600 to-rose-700',
  },
  {
    id: 'temperature',
    title: 'Temperature Scale',
    subtitle: 'What Happens at Every Degree',
    description: 'Interactive exploration from freezing to smoking point',
    href: '/learn/alchemy/temperature',
    icon: '🌡️',
    color: '#f59e0b',
    gradient: 'from-amber-500 to-red-600',
  },
  {
    id: 'molecules',
    title: 'Flavor Molecules',
    subtitle: 'The Chemistry of Taste',
    description:
      'Diacetyl, glutamate, capsaicin - understand what creates flavor',
    href: '/learn/alchemy/molecules',
    icon: '🔬',
    color: '#8b5cf6',
    gradient: 'from-purple-600 to-pink-600',
  },
  {
    id: 'lab',
    title: 'Recipe Lab',
    subtitle: 'Decode Any Dish',
    description: 'Enter a recipe, see the science behind every step',
    href: '/learn/alchemy/lab',
    icon: '🧪',
    color: '#0891b2',
    gradient: 'from-cyan-600 to-blue-700',
  },
];
