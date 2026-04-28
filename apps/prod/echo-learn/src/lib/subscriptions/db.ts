/**
 * Subscription Database Operations
 */

import { getUniversalDb, query, queryOne, execute } from '@/lib/db/turso';
import {
  SubscriptionTier,
  SubscriptionStatus,
  BillingInterval,
  UserSubscription,
  SubscriptionUsage,
} from './types';

// Generate unique IDs
function generateId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

// Get current billing period dates
function getCurrentPeriodDates(interval: BillingInterval): { start: string; end: string } {
  const now = new Date();
  const start = now.toISOString();
  const end = new Date(now);

  if (interval === 'annual') {
    end.setFullYear(end.getFullYear() + 1);
  } else {
    end.setMonth(end.getMonth() + 1);
  }

  return { start, end: end.toISOString() };
}

/**
 * Initialize subscription tables (run on app startup or migration)
 */
export async function initSubscriptionTables(): Promise<void> {
  const db = getUniversalDb();

  // User subscriptions table
  await execute(db, `
    CREATE TABLE IF NOT EXISTS user_subscriptions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL UNIQUE,
      tier TEXT NOT NULL DEFAULT 'free',
      status TEXT NOT NULL DEFAULT 'active',
      billing_interval TEXT DEFAULT 'monthly',
      stripe_customer_id TEXT,
      stripe_subscription_id TEXT,
      current_period_start TEXT NOT NULL,
      current_period_end TEXT NOT NULL,
      cancel_at_period_end INTEGER DEFAULT 0,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Usage tracking table
  await execute(db, `
    CREATE TABLE IF NOT EXISTS subscription_usage (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      period_start TEXT NOT NULL,
      period_end TEXT NOT NULL,
      books_created INTEGER DEFAULT 0,
      songs_generated INTEGER DEFAULT 0,
      papers_read INTEGER DEFAULT 0,
      sophia_videos_watched INTEGER DEFAULT 0,
      research_topics_explored INTEGER DEFAULT 0,
      lingua_conversations INTEGER DEFAULT 0,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id, period_start)
    )
  `);

  // Subscription events log
  await execute(db, `
    CREATE TABLE IF NOT EXISTS subscription_events (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      event_type TEXT NOT NULL,
      tier_from TEXT,
      tier_to TEXT,
      stripe_event_id TEXT,
      metadata TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create indexes
  await execute(db, `CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_id ON user_subscriptions(user_id)`);
  await execute(db, `CREATE INDEX IF NOT EXISTS idx_subscription_usage_user_period ON subscription_usage(user_id, period_start)`);
  await execute(db, `CREATE INDEX IF NOT EXISTS idx_subscription_events_user_id ON subscription_events(user_id)`);
}

/**
 * Get user's current subscription
 */
export async function getUserSubscription(userId: string): Promise<UserSubscription | null> {
  const db = getUniversalDb();

  const result = await queryOne<{
    id: string;
    user_id: string;
    tier: SubscriptionTier;
    status: SubscriptionStatus;
    billing_interval: BillingInterval;
    stripe_customer_id: string | null;
    stripe_subscription_id: string | null;
    current_period_start: string;
    current_period_end: string;
    cancel_at_period_end: number;
    created_at: string;
    updated_at: string;
  }>(
    db,
    `SELECT * FROM user_subscriptions WHERE user_id = ?`,
    [userId]
  );

  if (!result) return null;

  return {
    id: result.id,
    userId: result.user_id,
    tier: result.tier,
    status: result.status,
    billingInterval: result.billing_interval,
    stripeCustomerId: result.stripe_customer_id,
    stripeSubscriptionId: result.stripe_subscription_id,
    currentPeriodStart: result.current_period_start,
    currentPeriodEnd: result.current_period_end,
    cancelAtPeriodEnd: result.cancel_at_period_end === 1,
    createdAt: result.created_at,
    updatedAt: result.updated_at,
  };
}

/**
 * Get or create user subscription (defaults to free tier)
 */
export async function getOrCreateSubscription(userId: string): Promise<UserSubscription> {
  const existing = await getUserSubscription(userId);
  if (existing) return existing;

  // Create free tier subscription
  const db = getUniversalDb();
  const id = generateId('sub');
  const { start, end } = getCurrentPeriodDates('monthly');

  await execute(
    db,
    `INSERT INTO user_subscriptions (
      id, user_id, tier, status, billing_interval,
      current_period_start, current_period_end
    ) VALUES (?, ?, 'free', 'active', 'monthly', ?, ?)`,
    [id, userId, start, end]
  );

  return getUserSubscription(userId) as Promise<UserSubscription>;
}

/**
 * Update user subscription
 */
export async function updateSubscription(
  userId: string,
  updates: Partial<{
    tier: SubscriptionTier;
    status: SubscriptionStatus;
    billingInterval: BillingInterval;
    stripeCustomerId: string;
    stripeSubscriptionId: string;
    currentPeriodStart: string;
    currentPeriodEnd: string;
    cancelAtPeriodEnd: boolean;
  }>
): Promise<UserSubscription> {
  const db = getUniversalDb();

  const setClauses: string[] = ['updated_at = CURRENT_TIMESTAMP'];
  const values: (string | number | null)[] = [];

  if (updates.tier !== undefined) {
    setClauses.push('tier = ?');
    values.push(updates.tier);
  }
  if (updates.status !== undefined) {
    setClauses.push('status = ?');
    values.push(updates.status);
  }
  if (updates.billingInterval !== undefined) {
    setClauses.push('billing_interval = ?');
    values.push(updates.billingInterval);
  }
  if (updates.stripeCustomerId !== undefined) {
    setClauses.push('stripe_customer_id = ?');
    values.push(updates.stripeCustomerId);
  }
  if (updates.stripeSubscriptionId !== undefined) {
    setClauses.push('stripe_subscription_id = ?');
    values.push(updates.stripeSubscriptionId);
  }
  if (updates.currentPeriodStart !== undefined) {
    setClauses.push('current_period_start = ?');
    values.push(updates.currentPeriodStart);
  }
  if (updates.currentPeriodEnd !== undefined) {
    setClauses.push('current_period_end = ?');
    values.push(updates.currentPeriodEnd);
  }
  if (updates.cancelAtPeriodEnd !== undefined) {
    setClauses.push('cancel_at_period_end = ?');
    values.push(updates.cancelAtPeriodEnd ? 1 : 0);
  }

  values.push(userId);

  await execute(
    db,
    `UPDATE user_subscriptions SET ${setClauses.join(', ')} WHERE user_id = ?`,
    values
  );

  return getUserSubscription(userId) as Promise<UserSubscription>;
}

/**
 * Get or create usage record for current period
 */
export async function getCurrentUsage(userId: string): Promise<SubscriptionUsage> {
  const db = getUniversalDb();
  const subscription = await getOrCreateSubscription(userId);

  // Find existing usage for current period
  const existing = await queryOne<{
    id: string;
    user_id: string;
    period_start: string;
    period_end: string;
    books_created: number;
    songs_generated: number;
    papers_read: number;
    sophia_videos_watched: number;
    research_topics_explored: number;
    lingua_conversations: number;
    updated_at: string;
  }>(
    db,
    `SELECT * FROM subscription_usage
     WHERE user_id = ? AND period_start = ?`,
    [userId, subscription.currentPeriodStart]
  );

  if (existing) {
    return {
      id: existing.id,
      userId: existing.user_id,
      periodStart: existing.period_start,
      periodEnd: existing.period_end,
      booksCreated: existing.books_created,
      songsGenerated: existing.songs_generated,
      papersRead: existing.papers_read,
      sophiaVideosWatched: existing.sophia_videos_watched,
      researchTopicsExplored: existing.research_topics_explored,
      linguaConversations: existing.lingua_conversations,
      updatedAt: existing.updated_at,
    };
  }

  // Create new usage record for this period
  const id = generateId('usage');
  await execute(
    db,
    `INSERT INTO subscription_usage (
      id, user_id, period_start, period_end
    ) VALUES (?, ?, ?, ?)`,
    [id, userId, subscription.currentPeriodStart, subscription.currentPeriodEnd]
  );

  return getCurrentUsage(userId);
}

/**
 * Increment usage counter
 */
export async function incrementUsage(
  userId: string,
  field: keyof Pick<SubscriptionUsage, 'booksCreated' | 'songsGenerated' | 'papersRead' | 'sophiaVideosWatched' | 'researchTopicsExplored' | 'linguaConversations'>,
  amount: number = 1
): Promise<SubscriptionUsage> {
  const db = getUniversalDb();
  const usage = await getCurrentUsage(userId);

  const columnMap: Record<string, string> = {
    booksCreated: 'books_created',
    songsGenerated: 'songs_generated',
    papersRead: 'papers_read',
    sophiaVideosWatched: 'sophia_videos_watched',
    researchTopicsExplored: 'research_topics_explored',
    linguaConversations: 'lingua_conversations',
  };

  const column = columnMap[field];

  await execute(
    db,
    `UPDATE subscription_usage
     SET ${column} = ${column} + ?, updated_at = CURRENT_TIMESTAMP
     WHERE id = ?`,
    [amount, usage.id]
  );

  return getCurrentUsage(userId);
}

/**
 * Log subscription event
 */
export async function logSubscriptionEvent(
  userId: string,
  eventType: string,
  tierFrom?: SubscriptionTier,
  tierTo?: SubscriptionTier,
  stripeEventId?: string,
  metadata?: Record<string, unknown>
): Promise<void> {
  const db = getUniversalDb();
  const id = generateId('evt');

  await execute(
    db,
    `INSERT INTO subscription_events (
      id, user_id, event_type, tier_from, tier_to, stripe_event_id, metadata
    ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      userId,
      eventType,
      tierFrom || null,
      tierTo || null,
      stripeEventId || null,
      metadata ? JSON.stringify(metadata) : null,
    ]
  );
}

/**
 * Get user's subscription history
 */
export async function getSubscriptionHistory(
  userId: string,
  limit: number = 50
): Promise<Array<{
  eventType: string;
  tierFrom: SubscriptionTier | null;
  tierTo: SubscriptionTier | null;
  createdAt: string;
}>> {
  const db = getUniversalDb();

  const results = await query<{
    event_type: string;
    tier_from: SubscriptionTier | null;
    tier_to: SubscriptionTier | null;
    created_at: string;
  }>(
    db,
    `SELECT event_type, tier_from, tier_to, created_at
     FROM subscription_events
     WHERE user_id = ?
     ORDER BY created_at DESC
     LIMIT ?`,
    [userId, limit]
  );

  return results.map((r) => ({
    eventType: r.event_type,
    tierFrom: r.tier_from,
    tierTo: r.tier_to,
    createdAt: r.created_at,
  }));
}
