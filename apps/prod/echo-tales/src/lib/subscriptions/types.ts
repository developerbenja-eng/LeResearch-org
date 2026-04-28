/**
 * Subscription System Types
 * Hub-based subscription tiers for Echo
 */

export type SubscriptionTier = 'free' | 'tales' | 'learn' | 'complete';
export type BillingInterval = 'monthly' | 'annual';
export type SubscriptionStatus = 'active' | 'canceled' | 'past_due' | 'trialing' | 'incomplete';

export interface SubscriptionPlan {
  id: SubscriptionTier;
  name: string;
  description: string;
  monthlyPrice: number;
  annualPrice: number;
  features: PlanFeatures;
  stripePriceIds: {
    monthly: string | null;
    annual: string | null;
  };
}

export interface PlanFeatures {
  // Echo Tales features - for parents and families
  tales: {
    booksPerMonth: number | 'unlimited';
    songsPerMonth: number | 'unlimited';
    characters: number | 'unlimited';
    communityAccess: 'read' | 'full';
    researchTopics: number | 'unlimited';
  };
  // Echo Learn features - for self-directed learning
  learn: {
    linguaAccess: 'basic' | 'pro';
    papersPerMonth: number | 'unlimited';
    sophiaVideos: number | 'unlimited';
    soundsAccess: 'preview' | 'full';
  };
}

export interface UserSubscription {
  id: string;
  userId: string;
  tier: SubscriptionTier;
  status: SubscriptionStatus;
  billingInterval: BillingInterval;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SubscriptionUsage {
  id: string;
  userId: string;
  periodStart: string;
  periodEnd: string;
  // Tales usage
  booksCreated: number;
  songsGenerated: number;
  // Learn usage
  papersRead: number;
  sophiaVideosWatched: number;
  researchTopicsExplored: number;
  linguaConversations: number;
  updatedAt: string;
}

export interface UsageLimitResult {
  allowed: boolean;
  remaining: number | 'unlimited';
  limit: number | 'unlimited';
  upgradeRequired: boolean;
  suggestedTier: SubscriptionTier | null;
}

export type FeatureKey =
  | 'books'
  | 'songs'
  | 'characters'
  | 'community'
  | 'research'
  | 'lingua'
  | 'papers'
  | 'sophia'
  | 'sounds';

// Plan definitions
export const SUBSCRIPTION_PLANS: Record<SubscriptionTier, SubscriptionPlan> = {
  free: {
    id: 'free',
    name: 'Free',
    description: 'Basic access to both hubs',
    monthlyPrice: 0,
    annualPrice: 0,
    stripePriceIds: { monthly: null, annual: null },
    features: {
      tales: {
        booksPerMonth: 1,
        songsPerMonth: 0,
        characters: 2,
        communityAccess: 'read',
        researchTopics: 10,
      },
      learn: {
        linguaAccess: 'basic',
        papersPerMonth: 3,
        sophiaVideos: 50,
        soundsAccess: 'preview',
      },
    },
  },
  tales: {
    id: 'tales',
    name: 'Echo Tales',
    description: 'Full access to creative tools',
    monthlyPrice: 9.99,
    annualPrice: 99.99, // ~2 months free
    stripePriceIds: {
      monthly: process.env.STRIPE_PRICE_TALES_MONTHLY || null,
      annual: process.env.STRIPE_PRICE_TALES_ANNUAL || null,
    },
    features: {
      tales: {
        booksPerMonth: 'unlimited',
        songsPerMonth: 10,
        characters: 'unlimited',
        communityAccess: 'full',
        researchTopics: 'unlimited',
      },
      learn: {
        linguaAccess: 'basic',
        papersPerMonth: 3,
        sophiaVideos: 50,
        soundsAccess: 'preview',
      },
    },
  },
  learn: {
    id: 'learn',
    name: 'Echo Learn',
    description: 'Full access to learning tools',
    monthlyPrice: 9.99,
    annualPrice: 99.99,
    stripePriceIds: {
      monthly: process.env.STRIPE_PRICE_LEARN_MONTHLY || null,
      annual: process.env.STRIPE_PRICE_LEARN_ANNUAL || null,
    },
    features: {
      tales: {
        booksPerMonth: 1,
        songsPerMonth: 0,
        characters: 2,
        communityAccess: 'read',
        researchTopics: 10,
      },
      learn: {
        linguaAccess: 'pro',
        papersPerMonth: 'unlimited',
        sophiaVideos: 'unlimited',
        soundsAccess: 'full',
      },
    },
  },
  complete: {
    id: 'complete',
    name: 'Echo Complete',
    description: 'Everything in both hubs',
    monthlyPrice: 14.99,
    annualPrice: 149.99,
    stripePriceIds: {
      monthly: process.env.STRIPE_PRICE_COMPLETE_MONTHLY || null,
      annual: process.env.STRIPE_PRICE_COMPLETE_ANNUAL || null,
    },
    features: {
      tales: {
        booksPerMonth: 'unlimited',
        songsPerMonth: 10,
        characters: 'unlimited',
        communityAccess: 'full',
        researchTopics: 'unlimited',
      },
      learn: {
        linguaAccess: 'pro',
        papersPerMonth: 'unlimited',
        sophiaVideos: 'unlimited',
        soundsAccess: 'full',
      },
    },
  },
};

// Helper to get plan by tier
export function getPlan(tier: SubscriptionTier): SubscriptionPlan {
  return SUBSCRIPTION_PLANS[tier];
}

// Get feature limit for a specific tier
export function getFeatureLimit(
  tier: SubscriptionTier,
  feature: FeatureKey
): number | 'unlimited' {
  const plan = getPlan(tier);

  switch (feature) {
    case 'books':
      return plan.features.tales.booksPerMonth;
    case 'songs':
      return plan.features.tales.songsPerMonth;
    case 'characters':
      return plan.features.tales.characters;
    case 'research':
      return plan.features.tales.researchTopics;
    case 'papers':
      return plan.features.learn.papersPerMonth;
    case 'sophia':
      return plan.features.learn.sophiaVideos;
    default:
      return 'unlimited';
  }
}

// Suggest upgrade tier based on feature
export function suggestUpgradeTier(
  currentTier: SubscriptionTier,
  feature: FeatureKey
): SubscriptionTier | null {
  if (currentTier === 'complete') return null;

  const talesFeatures: FeatureKey[] = ['books', 'songs', 'characters', 'community', 'research'];
  const learnFeatures: FeatureKey[] = ['lingua', 'papers', 'sophia', 'sounds'];

  if (talesFeatures.includes(feature)) {
    if (currentTier === 'tales') return 'complete';
    if (currentTier === 'learn') return 'complete';
    return 'tales';
  }

  if (learnFeatures.includes(feature)) {
    if (currentTier === 'learn') return 'complete';
    if (currentTier === 'tales') return 'complete';
    return 'learn';
  }

  return 'complete';
}
