import { getBooksDb, query, queryOne } from './turso';

// Default coin costs
export const DEFAULT_COIN_COSTS = {
  SONG_GENERATION: 100,
  BOOK_8_PAGES: 400,
  BOOK_10_PAGES: 450,
  BOOK_12_PAGES: 500,
  IMAGE_GENERATION: 30,
  COVER_GENERATION: 50,
};

export interface UserCoins {
  balance: number;
  isTrialActive: boolean;
  trialCoinsGranted: number;
  trialCoinsUsed: number;
  lifetimeEarned: number;
  lifetimeSpent: number;
}

/**
 * Get user's current coin balance
 */
export async function getUserCoins(userId: string): Promise<UserCoins> {
  const db = getBooksDb();

  const result = await queryOne<{
    coin_balance: number;
    is_trial_active: number;
    trial_coins_granted: number;
    trial_coins_used: number;
    lifetime_coins_earned: number;
    lifetime_coins_spent: number;
  }>(
    db,
    `SELECT coin_balance, is_trial_active, trial_coins_granted,
            trial_coins_used, lifetime_coins_earned, lifetime_coins_spent
     FROM user_coins
     WHERE user_id = ?`,
    [userId]
  );

  if (!result) {
    // Initialize coins if not exists
    await initializeUserCoins(userId);
    return getUserCoins(userId);
  }

  return {
    balance: result.coin_balance || 0,
    isTrialActive: result.is_trial_active === 1,
    trialCoinsGranted: result.trial_coins_granted || 0,
    trialCoinsUsed: result.trial_coins_used || 0,
    lifetimeEarned: result.lifetime_coins_earned || 0,
    lifetimeSpent: result.lifetime_coins_spent || 0,
  };
}

/**
 * Initialize user coins on signup
 */
export async function initializeUserCoins(userId: string): Promise<void> {
  const db = getBooksDb();
  const coinId = `coin_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  const SIGNUP_COINS = 500;

  const trialExpires = new Date();
  trialExpires.setDate(trialExpires.getDate() + 30);

  await query(
    db,
    `INSERT INTO user_coins (
      id, user_id, coin_balance,
      trial_coins_granted, lifetime_coins_earned,
      is_trial_active, trial_expires_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(user_id) DO NOTHING`,
    [coinId, userId, SIGNUP_COINS, SIGNUP_COINS, SIGNUP_COINS, 1, trialExpires.toISOString()]
  );
}

/**
 * Check if user has enough coins
 */
export async function hasEnoughCoins(userId: string, requiredCoins: number): Promise<boolean> {
  const coins = await getUserCoins(userId);
  return coins.balance >= requiredCoins;
}

/**
 * Deduct coins from user balance
 */
export async function deductCoins(
  userId: string,
  amount: number,
  source: string,
  relatedEntityId?: string,
  metadata?: Record<string, unknown>
): Promise<{ success: boolean; newBalance: number }> {
  const db = getBooksDb();

  const current = await getUserCoins(userId);

  if (current.balance < amount) {
    throw new Error(`Insufficient coins. Required: ${amount}, Available: ${current.balance}`);
  }

  const newBalance = current.balance - amount;
  const newTrialUsed = current.isTrialActive
    ? Math.min(current.trialCoinsUsed + amount, current.trialCoinsGranted)
    : current.trialCoinsUsed;

  await query(
    db,
    `UPDATE user_coins
     SET coin_balance = ?,
         trial_coins_used = ?,
         lifetime_coins_spent = lifetime_coins_spent + ?,
         updated_at = CURRENT_TIMESTAMP
     WHERE user_id = ?`,
    [newBalance, newTrialUsed, amount, userId]
  );

  // Record transaction
  await recordTransaction(userId, {
    type: 'spent',
    amount: -amount,
    source,
    balanceAfter: newBalance,
    relatedEntityId,
    metadata,
  });

  return { success: true, newBalance };
}

/**
 * Refund coins to user balance
 */
export async function refundCoins(
  userId: string,
  amount: number,
  originalSource: string,
  relatedEntityId?: string,
  failureReason?: string
): Promise<{ success: boolean; newBalance: number }> {
  const db = getBooksDb();

  const current = await getUserCoins(userId);
  const newBalance = current.balance + amount;

  await query(
    db,
    `UPDATE user_coins
     SET coin_balance = ?,
         lifetime_coins_spent = CASE
           WHEN lifetime_coins_spent >= ? THEN lifetime_coins_spent - ?
           ELSE 0
         END,
         updated_at = CURRENT_TIMESTAMP
     WHERE user_id = ?`,
    [newBalance, amount, amount, userId]
  );

  await recordTransaction(userId, {
    type: 'refund',
    amount,
    source: `refund_${originalSource}`,
    balanceAfter: newBalance,
    metadata: { originalSource, failureReason, refundedAt: new Date().toISOString() },
  });

  return { success: true, newBalance };
}

/**
 * Credit coins to user balance (for purchases)
 */
export async function creditCoins(
  userId: string,
  amount: number,
  source: string,
  relatedEntityId?: string,
  metadata?: Record<string, unknown>
): Promise<{ success: boolean; newBalance: number }> {
  const db = getBooksDb();

  const current = await getUserCoins(userId);
  const newBalance = current.balance + amount;

  await query(
    db,
    `UPDATE user_coins
     SET coin_balance = ?,
         lifetime_coins_earned = lifetime_coins_earned + ?,
         updated_at = CURRENT_TIMESTAMP
     WHERE user_id = ?`,
    [newBalance, amount, userId]
  );

  await recordTransaction(userId, {
    type: 'purchased',
    amount,
    source,
    balanceAfter: newBalance,
    relatedEntityId,
    metadata,
  });

  return { success: true, newBalance };
}

/**
 * Record a coin transaction
 */
async function recordTransaction(
  userId: string,
  data: {
    type: string;
    amount: number;
    source: string;
    balanceAfter: number;
    relatedEntityId?: string;
    metadata?: Record<string, unknown>;
  }
): Promise<void> {
  const db = getBooksDb();
  const txId = `tx_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

  try {
    await query(
      db,
      `INSERT INTO coin_transactions (
        id, user_id, transaction_type, amount,
        balance_after, source, related_entity_id, metadata
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        txId,
        userId,
        data.type,
        data.amount,
        data.balanceAfter,
        data.source,
        data.relatedEntityId || null,
        data.metadata ? JSON.stringify(data.metadata) : null,
      ]
    );
  } catch {
    // Transaction logging is non-critical
    console.warn('Transaction logging failed (non-critical)');
  }
}
