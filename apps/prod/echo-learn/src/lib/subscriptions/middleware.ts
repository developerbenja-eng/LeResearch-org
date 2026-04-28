/**
 * Subscription Feature Gating Middleware
 * Check usage limits and feature access based on subscription tier
 */

import {
  FeatureKey,
  UsageLimitResult,
  SubscriptionTier,
  getFeatureLimit,
  suggestUpgradeTier,
  getPlan,
} from './types';
import { getOrCreateSubscription, getCurrentUsage, incrementUsage } from './db';

/**
 * Check if user can perform an action based on their subscription
 */
export async function checkUsageLimit(
  userId: string,
  feature: FeatureKey,
  increment: boolean = false
): Promise<UsageLimitResult> {
  const subscription = await getOrCreateSubscription(userId);
  const usage = await getCurrentUsage(userId);
  const limit = getFeatureLimit(subscription.tier, feature);

  // If unlimited, always allow
  if (limit === 'unlimited') {
    if (increment) {
      await incrementUsageForFeature(userId, feature);
    }
    return {
      allowed: true,
      remaining: 'unlimited',
      limit: 'unlimited',
      upgradeRequired: false,
      suggestedTier: null,
    };
  }

  // Get current usage for this feature
  const currentUsage = getUsageForFeature(usage, feature);
  const remaining = Math.max(0, limit - currentUsage);
  const allowed = remaining > 0;

  if (allowed && increment) {
    await incrementUsageForFeature(userId, feature);
  }

  return {
    allowed,
    remaining: allowed ? remaining - (increment ? 1 : 0) : 0,
    limit,
    upgradeRequired: !allowed,
    suggestedTier: allowed ? null : suggestUpgradeTier(subscription.tier, feature),
  };
}

/**
 * Check feature access (for features that are on/off, not counted)
 */
export async function checkFeatureAccess(
  userId: string,
  feature: 'community' | 'lingua' | 'sounds'
): Promise<{
  hasAccess: boolean;
  accessLevel: string;
  upgradeRequired: boolean;
  suggestedTier: SubscriptionTier | null;
}> {
  const subscription = await getOrCreateSubscription(userId);
  const plan = getPlan(subscription.tier);

  switch (feature) {
    case 'community': {
      const access = plan.features.tales.communityAccess;
      return {
        hasAccess: true, // Everyone has some access
        accessLevel: access,
        upgradeRequired: access === 'read',
        suggestedTier: access === 'read' ? suggestUpgradeTier(subscription.tier, 'community') : null,
      };
    }
    case 'lingua': {
      const access = plan.features.learn.linguaAccess;
      return {
        hasAccess: true,
        accessLevel: access,
        upgradeRequired: access === 'basic',
        suggestedTier: access === 'basic' ? suggestUpgradeTier(subscription.tier, 'lingua') : null,
      };
    }
    case 'sounds': {
      const access = plan.features.learn.soundsAccess;
      return {
        hasAccess: true,
        accessLevel: access,
        upgradeRequired: access === 'preview',
        suggestedTier: access === 'preview' ? suggestUpgradeTier(subscription.tier, 'sounds') : null,
      };
    }
    default:
      return {
        hasAccess: true,
        accessLevel: 'full',
        upgradeRequired: false,
        suggestedTier: null,
      };
  }
}

/**
 * Get user's current tier
 */
export async function getUserTier(userId: string): Promise<SubscriptionTier> {
  const subscription = await getOrCreateSubscription(userId);
  return subscription.tier;
}

/**
 * Check if user has a paid subscription
 */
export async function hasPaidSubscription(userId: string): Promise<boolean> {
  const tier = await getUserTier(userId);
  return tier !== 'free';
}

/**
 * Get all limits and usage for a user (for dashboard display)
 */
export async function getSubscriptionSummary(userId: string): Promise<{
  tier: SubscriptionTier;
  tierName: string;
  usage: {
    books: { used: number; limit: number | 'unlimited' };
    songs: { used: number; limit: number | 'unlimited' };
    papers: { used: number; limit: number | 'unlimited' };
    sophia: { used: number; limit: number | 'unlimited' };
    research: { used: number; limit: number | 'unlimited' };
  };
  features: {
    community: 'read' | 'full';
    lingua: 'basic' | 'pro';
    sounds: 'preview' | 'full';
  };
  periodEnd: string;
}> {
  const subscription = await getOrCreateSubscription(userId);
  const usage = await getCurrentUsage(userId);
  const plan = getPlan(subscription.tier);

  return {
    tier: subscription.tier,
    tierName: plan.name,
    usage: {
      books: {
        used: usage.booksCreated,
        limit: plan.features.tales.booksPerMonth,
      },
      songs: {
        used: usage.songsGenerated,
        limit: plan.features.tales.songsPerMonth,
      },
      papers: {
        used: usage.papersRead,
        limit: plan.features.learn.papersPerMonth,
      },
      sophia: {
        used: usage.sophiaVideosWatched,
        limit: plan.features.learn.sophiaVideos,
      },
      research: {
        used: usage.researchTopicsExplored,
        limit: plan.features.tales.researchTopics,
      },
    },
    features: {
      community: plan.features.tales.communityAccess,
      lingua: plan.features.learn.linguaAccess,
      sounds: plan.features.learn.soundsAccess,
    },
    periodEnd: subscription.currentPeriodEnd,
  };
}

// Helper: Get usage count for a feature
function getUsageForFeature(
  usage: { booksCreated: number; songsGenerated: number; papersRead: number; sophiaVideosWatched: number; researchTopicsExplored: number },
  feature: FeatureKey
): number {
  switch (feature) {
    case 'books':
      return usage.booksCreated;
    case 'songs':
      return usage.songsGenerated;
    case 'papers':
      return usage.papersRead;
    case 'sophia':
      return usage.sophiaVideosWatched;
    case 'research':
      return usage.researchTopicsExplored;
    default:
      return 0;
  }
}

// Helper: Increment usage for a feature
async function incrementUsageForFeature(userId: string, feature: FeatureKey): Promise<void> {
  const fieldMap: Record<FeatureKey, 'booksCreated' | 'songsGenerated' | 'papersRead' | 'sophiaVideosWatched' | 'researchTopicsExplored' | 'linguaConversations' | null> = {
    books: 'booksCreated',
    songs: 'songsGenerated',
    papers: 'papersRead',
    sophia: 'sophiaVideosWatched',
    research: 'researchTopicsExplored',
    characters: null, // Characters are not counted monthly
    community: null,
    lingua: 'linguaConversations',
    sounds: null, // Echo Sounds access is not counted monthly
  };

  const field = fieldMap[feature];
  if (field) {
    await incrementUsage(userId, field);
  }
}

// Convenience methods for specific features

export async function canCreateBook(userId: string, increment: boolean = false): Promise<UsageLimitResult> {
  return checkUsageLimit(userId, 'books', increment);
}

export async function canGenerateSong(userId: string, increment: boolean = false): Promise<UsageLimitResult> {
  return checkUsageLimit(userId, 'songs', increment);
}

export async function canReadPaper(userId: string, increment: boolean = false): Promise<UsageLimitResult> {
  return checkUsageLimit(userId, 'papers', increment);
}

export async function canWatchSophia(userId: string, increment: boolean = false): Promise<UsageLimitResult> {
  return checkUsageLimit(userId, 'sophia', increment);
}

export async function canExploreResearch(userId: string, increment: boolean = false): Promise<UsageLimitResult> {
  return checkUsageLimit(userId, 'research', increment);
}
