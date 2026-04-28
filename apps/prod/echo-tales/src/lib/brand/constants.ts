/**
 * Echo Brand Constants
 * Central source of truth for branding, hub structure, and feature organization.
 */

// Local SVG icons — the GCS bucket is not public, so we self-host everything.
export const ICONS = {
  home: '/icons/home-icon.svg',
  playRoom: '/icons/tales/stories-icon.svg',
  musicRoom: '/icons/tales/music-icon.svg',
  research: '/icons/tales/research-icon.svg',
  craftRoom: '/icons/tales/craft-icon.svg',
  reader: '/icons/reader-icon.svg',
  lingua: '/icons/lingua-icon.svg',
  sophia: '/icons/sophia-icon.svg',
  musicLearning: '/icons/music-learning-icon.svg',
  // Tales-specific custom icons
  talesStories: '/icons/tales/stories-icon.svg',
  talesMusic: '/icons/tales/music-icon.svg',
  talesCharacters: '/icons/tales/characters-icon.svg',
  talesResearch: '/icons/tales/research-icon.svg',
  talesCommunity: '/icons/tales/community-icon.svg',
  talesCraft: '/icons/tales/craft-icon.svg',
} as const;

export const BRAND = {
  name: 'Echo',
  tagline: 'Learning that echoes back',
  legalEntity: 'Echo Craft Systems',

  hubs: {
    tales: {
      id: 'tales',
      name: 'Echo Tales',
      tagline: 'Stories that grow with your family',
      route: '/tales',
      color: 'purple',
      gradient: 'from-purple-500 to-pink-500',
    },
    learn: {
      id: 'learn',
      name: 'Echo Learn',
      tagline: 'Master anything, your way',
      route: '/learn',
      color: 'blue',
      gradient: 'from-blue-500 to-indigo-500',
    },
  },

  // Echo Tales features - for parents and families
  tales: {
    stories: {
      id: 'stories',
      name: 'Stories',
      description: 'Personalized AI-generated books',
      route: '/play',
      icon: ICONS.talesStories,
      gradient: 'from-purple-500 to-pink-500',
    },
    music: {
      id: 'music',
      name: 'Music',
      description: 'Songs created from storybooks',
      route: '/music',
      icon: ICONS.talesMusic,
      gradient: 'from-blue-500 to-cyan-500',
    },
    characters: {
      id: 'characters',
      name: 'Characters',
      description: 'Create and manage characters',
      route: '/play?tab=characters',
      icon: ICONS.talesCharacters,
      gradient: 'from-rose-500 to-pink-500',
    },
    research: {
      id: 'research',
      name: 'Research',
      description: 'Evidence-based parenting insights',
      route: '/research',
      icon: ICONS.talesResearch,
      gradient: 'from-green-500 to-teal-500',
    },
    community: {
      id: 'community',
      name: 'Community',
      description: 'Share and connect with other families',
      route: '/community',
      icon: ICONS.talesCommunity,
      gradient: 'from-orange-500 to-amber-500',
    },
    craft: {
      id: 'craft',
      name: 'Craft Room',
      description: 'Physical books, coloring pages & more',
      route: '/store',
      icon: ICONS.talesCraft,
      gradient: 'from-violet-500 to-purple-600',
    },
  },

  // Echo Learn features - for self-directed learning
  learn: {
    lingua: {
      id: 'lingua',
      name: 'Echo Lingua',
      description: 'Language learning (Spanish/English)',
      route: '/lingua',
      icon: ICONS.lingua,
      gradient: 'from-rose-500 to-pink-500',
    },
    reader: {
      id: 'reader',
      name: 'Echo Reader',
      description: 'Academic paper reading & study',
      route: 'https://echo-learn.ledesign.ai/reader/library',
      icon: ICONS.reader,
      gradient: 'from-indigo-500 to-violet-500',
    },
    sophia: {
      id: 'sophia',
      name: 'Sophia',
      description: 'Philosophy learning with great thinkers',
      route: '/sophia',
      icon: ICONS.sophia,
      gradient: 'from-amber-500 to-orange-500',
    },
    sounds: {
      id: 'sounds',
      name: 'Echo Sounds',
      description: 'Visual music education',
      route: '/learn/music',
      icon: ICONS.musicLearning,
      gradient: 'from-cyan-500 to-teal-500',
    },
    nourish: {
      id: 'nourish',
      name: 'Echo Nourish',
      description: 'How we know what we know about nutrition',
      route: '/learn/nutrition',
      icon: '/icons/nutrition-icon.svg',
      gradient: 'from-green-500 to-emerald-600',
    },
    alchemy: {
      id: 'alchemy',
      name: 'Echo Alchemy',
      description: 'Food science through cultural cuisines',
      route: '/learn/alchemy',
      icon: '/icons/alchemy-icon.svg',
      gradient: 'from-amber-600 to-orange-700',
    },
    anatomy: {
      id: 'anatomy',
      name: 'Anatomy Hall',
      description: 'Interactive 3D human body exploration',
      route: '/learn/anatomy',
      icon: '/icons/anatomy-icon.svg',
      gradient: 'from-red-500 to-rose-600',
    },
    origins: {
      id: 'origins',
      name: 'Echo Origins',
      description: 'The systems that shaped how we learn, work, and think',
      route: '/learn/origins',
      icon: '/icons/origins-icon.svg',
      gradient: 'from-purple-500 to-amber-500',
    },
  },
} as const;

// Helper functions
export function getTalesFeatures() {
  return Object.values(BRAND.tales);
}

export function getLearnFeatures() {
  return Object.values(BRAND.learn);
}

export function getAllFeatures() {
  return [...getTalesFeatures(), ...getLearnFeatures()];
}

export function getFeatureByRoute(route: string) {
  return getAllFeatures().find(f => f.route === route);
}

// Navigation structure for desktop dropdowns
export const NAV_STRUCTURE = {
  tales: {
    label: BRAND.hubs.tales.name,
    items: getTalesFeatures(),
  },
  learn: {
    label: BRAND.hubs.learn.name,
    items: getLearnFeatures(),
  },
} as const;

// Mobile bottom nav items
export const MOBILE_NAV_ITEMS = [
  { href: '/home', icon: ICONS.home, label: 'Home' },
  { href: '/tales', icon: ICONS.playRoom, label: 'Tales' },
  { href: '/learn', icon: ICONS.reader, label: 'Learn' },
  { href: '/community', icon: ICONS.research, label: 'Profile' },
] as const;

export type HubId = keyof typeof BRAND.hubs;
export type TalesFeatureId = keyof typeof BRAND.tales;
export type LearnFeatureId = keyof typeof BRAND.learn;
