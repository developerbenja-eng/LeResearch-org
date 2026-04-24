import { getUniversalDb, getBooksDb, query, queryOne, execute } from './turso';
import type {
  AdminUser,
  AdminBook,
  AdminCharacter,
  AdminCoinAccount,
  AdminCoinTransaction,
  CoinStats,
  AdminApiKey,
  ApiKeyStats,
  AdminAIModel,
  AIModelStats,
  DatabaseTable,
  DatabaseColumn,
  DatabaseQueryResult,
  AdminSetting,
  AdminAppIcon,
  IconStats,
  IconCategory,
  DesignTheme,
  ThemeColors,
  ThemeTypography,
  ThemeSpacing,
  ThemeBorders,
  MarketingContent,
  MarketingContentType,
  MarketingStats,
  EmailTemplate,
  EmailTemplateType,
  EmailLog,
  EmailStatus,
  EmailStats,
  EmailTemplateStats,
  AdminStatistics,
  AdminCharts,
  UserStats,
  BookStats,
  CharacterStats,
  UsageStats,
  GenerationStats,
  AdminMetrics,
  RegistrationTrendItem,
  ThemeItem,
  RecentActivityItem,
} from '@/types/admin';

// Filter options for admin queries
export interface AdminFilterOptions {
  search?: string;
  status?: string;
  role?: string;
  limit?: number;
  offset?: number;
}

// Get all users with statistics
export async function getAdminUsers(options: AdminFilterOptions = {}): Promise<{ users: AdminUser[]; total: number }> {
  const universalDb = getUniversalDb();
  const booksDb = getBooksDb();

  const { search, status, role, limit = 100, offset = 0 } = options;

  // Build WHERE clause
  const conditions: string[] = [];
  const params: (string | number)[] = [];

  if (search) {
    conditions.push('(name LIKE ? OR email LIKE ?)');
    params.push(`%${search}%`, `%${search}%`);
  }
  if (status) {
    conditions.push('status = ?');
    params.push(status);
  }
  if (role) {
    conditions.push('role = ?');
    params.push(role);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  // Get total count
  const countResult = await queryOne<{ count: number }>(
    universalDb,
    `SELECT COUNT(*) as count FROM users ${whereClause}`,
    params
  );
  const total = countResult?.count || 0;

  // Get paginated users from Universal DB
  const usersResult = await query<{
    id: string;
    email: string;
    name: string;
    status: string;
    role: string;
    created_at: string;
    updated_at: string | null;
    last_login_at: string | null;
    email_verified: number;
    avatar_url: string | null;
    timezone: string;
    locale: string;
    two_factor_enabled: number;
    marketing_emails: number;
  }>(
    universalDb,
    `SELECT
      id, email, name, status, role, created_at, updated_at, last_login_at,
      email_verified, avatar_url, timezone, locale,
      two_factor_enabled, marketing_emails
    FROM users
    ${whereClause}
    ORDER BY created_at DESC
    LIMIT ? OFFSET ?`,
    [...params, limit, offset]
  );

  if (usersResult.length === 0) {
    return { users: [], total };
  }

  const userIds = usersResult.map((u) => u.id);
  const placeholders = userIds.map(() => '?').join(',');

  // Get book counts
  const bookCounts = await query<{
    user_id: string;
    total_books: number;
    books_this_month: number;
    total_cost: number;
    cost_this_month: number;
  }>(
    booksDb,
    `SELECT
      user_id,
      COUNT(*) as total_books,
      SUM(CASE WHEN created_at >= date('now', 'start of month') THEN 1 ELSE 0 END) as books_this_month,
      COALESCE(SUM(CAST(generation_cost AS REAL)), 0) as total_cost,
      COALESCE(SUM(CASE WHEN created_at >= date('now', 'start of month') THEN CAST(generation_cost AS REAL) ELSE 0 END), 0) as cost_this_month
    FROM books
    WHERE user_id IN (${placeholders})
    GROUP BY user_id`,
    userIds
  );

  // Get character counts
  const characterCounts = await query<{
    user_id: string;
    total_characters: number;
    main_characters: number;
    guest_characters: number;
  }>(
    booksDb,
    `SELECT
      user_id,
      COUNT(*) as total_characters,
      SUM(CASE WHEN character_type = 'main' THEN 1 ELSE 0 END) as main_characters,
      SUM(CASE WHEN character_type = 'guest' THEN 1 ELSE 0 END) as guest_characters
    FROM characters
    WHERE is_active = 1 AND user_id IN (${placeholders})
    GROUP BY user_id`,
    userIds
  );

  // Create lookup maps
  const bookMap = new Map(bookCounts.map((b) => [b.user_id, b]));
  const charMap = new Map(characterCounts.map((c) => [c.user_id, c]));

  // Combine data
  const users = usersResult.map((user) => {
    const books = bookMap.get(user.id);
    const chars = charMap.get(user.id);

    return {
      ...user,
      status: (user.status || 'active') as AdminUser['status'],
      role: (user.role || 'user') as AdminUser['role'],
      email_verified: Boolean(user.email_verified),
      two_factor_enabled: Boolean(user.two_factor_enabled),
      marketing_emails: user.marketing_emails !== 0,
      timezone: user.timezone || 'UTC',
      locale: user.locale || 'en',
      // Usage stats
      subscription_tier: 'free' as const,
      max_books_per_month: 5,
      monthly_budget: 15.0,
      books_this_month: books?.books_this_month || 0,
      images_this_month: 0,
      cost_this_month: books?.cost_this_month || 0,
      total_books: books?.total_books || 0,
      total_images: 0,
      total_cost: books?.total_cost || 0,
      // Character stats
      total_characters: chars?.total_characters || 0,
      main_characters: chars?.main_characters || 0,
      guest_characters: chars?.guest_characters || 0,
    };
  });

  return { users, total };
}

// Get admin statistics
export async function getAdminStatistics(): Promise<{
  statistics: AdminStatistics;
  charts: AdminCharts;
}> {
  const universalDb = getUniversalDb();
  const booksDb = getBooksDb();

  // Run queries in parallel
  const [
    userStatsResult,
    bookStatsResult,
    characterStatsResult,
    usageStatsResult,
    generationStatsResult,
    newUsersResult,
    activeUsersResult,
    registrationTrendResult,
    booksByThemeResult,
    recentBooksResult,
    recentCharactersResult,
    topThemesResult,
  ] = await Promise.all([
    // User statistics
    queryOne<{
      total: number;
      active: number;
      suspended: number;
      inactive: number;
      verified: number;
    }>(
      universalDb,
      `SELECT
        COUNT(*) as total,
        SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active,
        SUM(CASE WHEN status = 'suspended' THEN 1 ELSE 0 END) as suspended,
        SUM(CASE WHEN status = 'inactive' THEN 1 ELSE 0 END) as inactive,
        SUM(CASE WHEN email_verified = 1 THEN 1 ELSE 0 END) as verified
      FROM users`
    ),

    // Book statistics
    queryOne<{
      total: number;
      draft: number;
      generating: number;
      completed: number;
      published: number;
      archived: number;
    }>(
      booksDb,
      `SELECT
        COUNT(*) as total,
        SUM(CASE WHEN status = 'draft' THEN 1 ELSE 0 END) as draft,
        SUM(CASE WHEN status = 'generating' THEN 1 ELSE 0 END) as generating,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed,
        SUM(CASE WHEN status = 'published' THEN 1 ELSE 0 END) as published,
        SUM(CASE WHEN status = 'archived' THEN 1 ELSE 0 END) as archived
      FROM books`
    ),

    // Character statistics
    queryOne<{
      total: number;
      active: number;
      main_characters: number;
      guest_characters: number;
    }>(
      booksDb,
      `SELECT
        COUNT(*) as total,
        SUM(CASE WHEN is_active = 1 THEN 1 ELSE 0 END) as active,
        SUM(CASE WHEN character_type = 'main' THEN 1 ELSE 0 END) as main_characters,
        SUM(CASE WHEN character_type = 'guest' THEN 1 ELSE 0 END) as guest_characters
      FROM characters`
    ),

    // Usage statistics
    queryOne<{
      books_this_month: number;
      images_this_month: number;
      cost_this_month: number;
      total_books: number;
      total_images: number;
      total_cost: number;
      free_users: number;
      pro_users: number;
      premium_users: number;
    }>(
      booksDb,
      `SELECT
        SUM(books_created_this_month) as books_this_month,
        SUM(images_generated_this_month) as images_this_month,
        SUM(cost_this_month) as cost_this_month,
        SUM(total_books_created) as total_books,
        SUM(total_images_generated) as total_images,
        SUM(total_cost) as total_cost,
        COUNT(CASE WHEN subscription_tier = 'free' THEN 1 END) as free_users,
        COUNT(CASE WHEN subscription_tier = 'pro' THEN 1 END) as pro_users,
        COUNT(CASE WHEN subscription_tier = 'premium' THEN 1 END) as premium_users
      FROM user_usage_stats`
    ).catch(() => null),

    // Generation job statistics
    queryOne<{
      total_jobs: number;
      completed_jobs: number;
      failed_jobs: number;
      running_jobs: number;
      avg_duration: number;
      total_tokens: number;
      total_ai_cost: number;
    }>(
      booksDb,
      `SELECT
        COUNT(*) as total_jobs,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed_jobs,
        SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) as failed_jobs,
        SUM(CASE WHEN status = 'running' THEN 1 ELSE 0 END) as running_jobs,
        AVG(CASE WHEN status = 'completed' THEN duration_seconds END) as avg_duration,
        SUM(tokens_used) as total_tokens,
        SUM(cost_incurred) as total_ai_cost
      FROM generation_jobs
      WHERE created_at >= datetime('now', '-30 days')`
    ).catch(() => null),

    // New users (last 7 days)
    queryOne<{ count: number }>(
      universalDb,
      `SELECT COUNT(*) as count FROM users WHERE created_at >= datetime('now', '-7 days')`
    ),

    // Active users (last 7 days)
    queryOne<{ count: number }>(
      universalDb,
      `SELECT COUNT(*) as count FROM users WHERE last_login_at >= datetime('now', '-7 days')`
    ),

    // Registration trend (last 30 days)
    query<{ date: string; count: number }>(
      universalDb,
      `SELECT
        date(created_at) as date,
        COUNT(*) as count
      FROM users
      WHERE created_at >= datetime('now', '-30 days')
      GROUP BY date(created_at)
      ORDER BY date ASC`
    ),

    // Books by theme (last 30 days)
    query<{ theme: string; count: number }>(
      booksDb,
      `SELECT
        COALESCE(educational_theme, 'Unspecified') as theme,
        COUNT(*) as count
      FROM books
      WHERE created_at >= datetime('now', '-30 days')
      GROUP BY educational_theme
      ORDER BY count DESC
      LIMIT 10`
    ),

    // Recent books
    query<{ type: string; name: string; timestamp: string }>(
      booksDb,
      `SELECT 'book' as type, title as name, created_at as timestamp
      FROM books
      ORDER BY created_at DESC
      LIMIT 5`
    ),

    // Recent characters
    query<{ type: string; name: string; timestamp: string }>(
      booksDb,
      `SELECT 'character' as type, character_name as name, created_at as timestamp
      FROM characters
      ORDER BY created_at DESC
      LIMIT 5`
    ),

    // Top themes all time
    query<{ theme: string; count: number }>(
      booksDb,
      `SELECT
        COALESCE(educational_theme, 'Unspecified') as theme,
        COUNT(*) as count
      FROM books
      GROUP BY educational_theme
      ORDER BY count DESC
      LIMIT 5`
    ),
  ]);

  // Build user stats
  const users: UserStats = {
    total: userStatsResult?.total || 0,
    active: userStatsResult?.active || 0,
    suspended: userStatsResult?.suspended || 0,
    inactive: userStatsResult?.inactive || 0,
    verified: userStatsResult?.verified || 0,
    new_last_7_days: newUsersResult?.count || 0,
    active_last_7_days: activeUsersResult?.count || 0,
  };

  // Build book stats
  const books: BookStats = {
    total: bookStatsResult?.total || 0,
    draft: bookStatsResult?.draft || 0,
    generating: bookStatsResult?.generating || 0,
    completed: bookStatsResult?.completed || 0,
    published: bookStatsResult?.published || 0,
    archived: bookStatsResult?.archived || 0,
  };

  // Build character stats
  const characters: CharacterStats = {
    total: characterStatsResult?.total || 0,
    active: characterStatsResult?.active || 0,
    main_characters: characterStatsResult?.main_characters || 0,
    guest_characters: characterStatsResult?.guest_characters || 0,
  };

  // Build usage stats
  const usage: UsageStats = {
    books_this_month: usageStatsResult?.books_this_month || 0,
    images_this_month: usageStatsResult?.images_this_month || 0,
    cost_this_month: usageStatsResult?.cost_this_month || 0,
    total_books: usageStatsResult?.total_books || 0,
    total_images: usageStatsResult?.total_images || 0,
    total_cost: usageStatsResult?.total_cost || 0,
    by_tier: {
      free: usageStatsResult?.free_users || 0,
      pro: usageStatsResult?.pro_users || 0,
      premium: usageStatsResult?.premium_users || 0,
    },
  };

  // Build generation stats
  const totalJobs = generationStatsResult?.total_jobs || 0;
  const completedJobs = generationStatsResult?.completed_jobs || 0;
  const generation: GenerationStats = {
    total_jobs: totalJobs,
    completed_jobs: completedJobs,
    failed_jobs: generationStatsResult?.failed_jobs || 0,
    running_jobs: generationStatsResult?.running_jobs || 0,
    avg_duration_seconds: generationStatsResult?.avg_duration || 0,
    total_tokens: generationStatsResult?.total_tokens || 0,
    total_ai_cost: generationStatsResult?.total_ai_cost || 0,
    success_rate: totalJobs > 0 ? Number(((completedJobs / totalJobs) * 100).toFixed(2)) : 0,
  };

  // Build metrics
  const metrics: AdminMetrics = {
    avg_cost_per_book:
      usage.total_books > 0 ? Number((usage.total_cost / usage.total_books).toFixed(2)) : 0,
    avg_books_per_user:
      users.total > 0 ? Number((usage.total_books / users.total).toFixed(2)) : 0,
    avg_characters_per_user:
      users.total > 0 ? Number((characters.total / users.total).toFixed(2)) : 0,
    user_growth_rate_7days:
      users.total > 0 ? Number(((users.new_last_7_days / users.total) * 100).toFixed(2)) : 0,
    user_activity_rate_7days:
      users.total > 0 ? Number(((users.active_last_7_days / users.total) * 100).toFixed(2)) : 0,
  };

  // Build charts
  const registrationTrend: RegistrationTrendItem[] = registrationTrendResult.map((r) => ({
    date: r.date,
    count: r.count,
  }));

  const booksByTheme: ThemeItem[] = booksByThemeResult.map((t) => ({
    theme: t.theme || 'Unspecified',
    count: t.count,
  }));

  // Combine recent activity
  const recentActivity: RecentActivityItem[] = [
    ...recentBooksResult.map((b) => ({
      type: 'book' as const,
      name: b.name || 'Untitled',
      timestamp: b.timestamp,
    })),
    ...recentCharactersResult.map((c) => ({
      type: 'character' as const,
      name: c.name || 'Unnamed',
      timestamp: c.timestamp,
    })),
  ]
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 10);

  const topThemes: ThemeItem[] = topThemesResult.map((t) => ({
    theme: t.theme || 'Unspecified',
    count: t.count,
  }));

  return {
    statistics: {
      users,
      books,
      characters,
      usage,
      generation,
      metrics,
    },
    charts: {
      registrationTrend,
      booksByTheme,
      recentActivity,
      topThemes,
    },
  };
}

// Update user
export async function updateUser(
  userId: string,
  data: {
    name?: string;
    email?: string;
    status?: string;
    role?: string;
  }
): Promise<void> {
  const universalDb = getUniversalDb();
  const updates: string[] = [];
  const values: (string | number | null)[] = [];

  if (data.name !== undefined) {
    updates.push('name = ?');
    values.push(data.name);
  }
  if (data.email !== undefined) {
    updates.push('email = ?');
    values.push(data.email);
  }
  if (data.status !== undefined) {
    updates.push('status = ?');
    values.push(data.status);
  }
  if (data.role !== undefined) {
    updates.push('role = ?');
    values.push(data.role);
  }

  if (updates.length === 0) return;

  updates.push('updated_at = CURRENT_TIMESTAMP');
  values.push(userId);

  await execute(universalDb, `UPDATE users SET ${updates.join(', ')} WHERE id = ?`, values);
}

// Delete user (soft delete)
export async function deleteUser(userId: string): Promise<void> {
  const universalDb = getUniversalDb();
  await execute(
    universalDb,
    `UPDATE users SET status = 'deleted', updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
    [userId]
  );
}

// Book filter options
export interface BookFilterOptions {
  search?: string;
  status?: string;
  theme?: string;
  limit?: number;
  offset?: number;
}

// Get recent books for admin with filtering and pagination
export async function getAdminBooks(options: BookFilterOptions = {}): Promise<{ books: AdminBook[]; total: number }> {
  const booksDb = getBooksDb();

  const { search, status, theme, limit = 100, offset = 0 } = options;

  // Build WHERE clause
  const conditions: string[] = [];
  const params: (string | number)[] = [];

  if (search) {
    conditions.push('title LIKE ?');
    params.push(`%${search}%`);
  }
  if (status) {
    conditions.push('status = ?');
    params.push(status);
  }
  if (theme) {
    conditions.push('educational_theme = ?');
    params.push(theme);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  // Get total count
  const countResult = await queryOne<{ count: number }>(
    booksDb,
    `SELECT COUNT(*) as count FROM books ${whereClause}`,
    params
  );
  const total = countResult?.count || 0;

  // Get paginated books
  const books = await query<AdminBook>(
    booksDb,
    `SELECT
      b.id,
      b.user_id,
      b.title,
      b.status,
      b.educational_theme,
      b.page_count,
      COALESCE(b.generation_cost, 0) as generation_cost,
      b.created_at
    FROM books b
    ${whereClause}
    ORDER BY b.created_at DESC
    LIMIT ? OFFSET ?`,
    [...params, limit, offset]
  );

  return { books, total };
}

// Character filter options
export interface CharacterFilterOptions {
  search?: string;
  type?: string;
  includeInactive?: boolean;
  limit?: number;
  offset?: number;
}

// Get recent characters for admin with filtering and pagination
export async function getAdminCharacters(options: CharacterFilterOptions = {}): Promise<{ characters: AdminCharacter[]; total: number }> {
  const booksDb = getBooksDb();

  const { search, type, includeInactive = false, limit = 100, offset = 0 } = options;

  // Build WHERE clause
  const conditions: string[] = [];
  const params: (string | number)[] = [];

  if (!includeInactive) {
    conditions.push('is_active = 1');
  }
  if (search) {
    conditions.push('character_name LIKE ?');
    params.push(`%${search}%`);
  }
  if (type) {
    conditions.push('character_type = ?');
    params.push(type);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  // Get total count
  const countResult = await queryOne<{ count: number }>(
    booksDb,
    `SELECT COUNT(*) as count FROM characters ${whereClause}`,
    params
  );
  const total = countResult?.count || 0;

  // Get paginated characters
  const characters = await query<AdminCharacter>(
    booksDb,
    `SELECT
      c.id,
      c.user_id,
      c.character_name,
      c.character_type,
      c.is_active,
      c.created_at
    FROM characters c
    ${whereClause}
    ORDER BY c.created_at DESC
    LIMIT ? OFFSET ?`,
    [...params, limit, offset]
  );

  return { characters, total };
}

// Update book
export async function updateBook(
  bookId: string,
  data: {
    title?: string;
    status?: string;
    educational_theme?: string;
    age_range?: string;
  }
): Promise<void> {
  const booksDb = getBooksDb();
  const updates: string[] = [];
  const values: (string | number | null)[] = [];

  if (data.title !== undefined) {
    updates.push('title = ?');
    values.push(data.title);
  }
  if (data.status !== undefined) {
    updates.push('status = ?');
    values.push(data.status);
  }
  if (data.educational_theme !== undefined) {
    updates.push('educational_theme = ?');
    values.push(data.educational_theme);
  }
  if (data.age_range !== undefined) {
    updates.push('age_range = ?');
    values.push(data.age_range);
  }

  if (updates.length === 0) return;

  updates.push('updated_at = CURRENT_TIMESTAMP');
  values.push(bookId);

  await execute(booksDb, `UPDATE books SET ${updates.join(', ')} WHERE id = ?`, values);
}

// Delete book (soft delete by setting status to archived)
export async function deleteBook(bookId: string): Promise<void> {
  const booksDb = getBooksDb();
  await execute(
    booksDb,
    `UPDATE books SET status = 'archived', updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
    [bookId]
  );
}

// Update character
export async function updateCharacter(
  characterId: string,
  data: {
    character_name?: string;
    character_type?: string;
    is_active?: boolean;
  }
): Promise<void> {
  const booksDb = getBooksDb();
  const updates: string[] = [];
  const values: (string | number | null)[] = [];

  if (data.character_name !== undefined) {
    updates.push('character_name = ?');
    values.push(data.character_name);
  }
  if (data.character_type !== undefined) {
    updates.push('character_type = ?');
    values.push(data.character_type);
  }
  if (data.is_active !== undefined) {
    updates.push('is_active = ?');
    values.push(data.is_active ? 1 : 0);
  }

  if (updates.length === 0) return;

  updates.push('updated_at = CURRENT_TIMESTAMP');
  values.push(characterId);

  await execute(booksDb, `UPDATE characters SET ${updates.join(', ')} WHERE id = ?`, values);
}

// Delete character (soft delete by setting is_active to false)
export async function deleteCharacter(characterId: string): Promise<void> {
  const booksDb = getBooksDb();
  await execute(
    booksDb,
    `UPDATE characters SET is_active = 0, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
    [characterId]
  );
}

// Coin filter options
export interface CoinAccountFilterOptions {
  search?: string;
  minBalance?: number;
  maxBalance?: number;
  limit?: number;
  offset?: number;
}

export interface CoinTransactionFilterOptions {
  search?: string;
  type?: string;
  userId?: string;
  limit?: number;
  offset?: number;
}

// Get coin accounts with user info
export async function getAdminCoinAccounts(
  options: CoinAccountFilterOptions = {}
): Promise<{ accounts: AdminCoinAccount[]; total: number }> {
  const universalDb = getUniversalDb();

  const { search, minBalance, maxBalance, limit = 25, offset = 0 } = options;

  // Build WHERE clause
  const conditions: string[] = [];
  const params: (string | number)[] = [];

  if (search) {
    conditions.push('(u.name LIKE ? OR u.email LIKE ?)');
    params.push(`%${search}%`, `%${search}%`);
  }
  if (minBalance !== undefined) {
    conditions.push('c.balance >= ?');
    params.push(minBalance);
  }
  if (maxBalance !== undefined) {
    conditions.push('c.balance <= ?');
    params.push(maxBalance);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  // Get total count
  const countResult = await queryOne<{ count: number }>(
    universalDb,
    `SELECT COUNT(*) as count
     FROM coin_accounts c
     LEFT JOIN users u ON c.user_id = u.id
     ${whereClause}`,
    params
  );
  const total = countResult?.count || 0;

  // Get paginated accounts with user info
  const accounts = await query<{
    id: string;
    user_id: string;
    balance: number;
    created_at: string;
    updated_at: string;
    user_name: string | null;
    user_email: string | null;
  }>(
    universalDb,
    `SELECT
      c.id,
      c.user_id,
      c.balance,
      c.created_at,
      c.updated_at,
      u.name as user_name,
      u.email as user_email
     FROM coin_accounts c
     LEFT JOIN users u ON c.user_id = u.id
     ${whereClause}
     ORDER BY c.balance DESC
     LIMIT ? OFFSET ?`,
    [...params, limit, offset]
  );

  return {
    accounts: accounts.map((a) => ({
      ...a,
      user_name: a.user_name || 'Unknown',
      user_email: a.user_email || 'unknown@example.com',
    })),
    total,
  };
}

// Get coin transactions with user info
export async function getAdminCoinTransactions(
  options: CoinTransactionFilterOptions = {}
): Promise<{ transactions: AdminCoinTransaction[]; total: number }> {
  const universalDb = getUniversalDb();

  const { search, type, userId, limit = 25, offset = 0 } = options;

  // Build WHERE clause
  const conditions: string[] = [];
  const params: (string | number)[] = [];

  if (search) {
    conditions.push('(u.name LIKE ? OR u.email LIKE ? OR t.description LIKE ?)');
    params.push(`%${search}%`, `%${search}%`, `%${search}%`);
  }
  if (type) {
    conditions.push('t.type = ?');
    params.push(type);
  }
  if (userId) {
    conditions.push('t.user_id = ?');
    params.push(userId);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  // Get total count
  const countResult = await queryOne<{ count: number }>(
    universalDb,
    `SELECT COUNT(*) as count
     FROM coin_transactions t
     LEFT JOIN users u ON t.user_id = u.id
     ${whereClause}`,
    params
  );
  const total = countResult?.count || 0;

  // Get paginated transactions with user info
  const transactions = await query<{
    id: string;
    user_id: string;
    amount: number;
    type: string;
    description: string;
    reference_id: string | null;
    created_at: string;
    user_name: string | null;
    user_email: string | null;
  }>(
    universalDb,
    `SELECT
      t.id,
      t.user_id,
      t.amount,
      t.type,
      t.description,
      t.reference_id,
      t.created_at,
      u.name as user_name,
      u.email as user_email
     FROM coin_transactions t
     LEFT JOIN users u ON t.user_id = u.id
     ${whereClause}
     ORDER BY t.created_at DESC
     LIMIT ? OFFSET ?`,
    [...params, limit, offset]
  );

  return {
    transactions: transactions.map((t) => ({
      ...t,
      type: t.type as AdminCoinTransaction['type'],
      user_name: t.user_name || 'Unknown',
      user_email: t.user_email || 'unknown@example.com',
    })),
    total,
  };
}

// Get coin statistics
export async function getCoinStats(): Promise<CoinStats> {
  const universalDb = getUniversalDb();

  const [circulationResult, accountsResult, transactionsResult, recentStats] = await Promise.all([
    // Total coins in circulation
    queryOne<{ total: number }>(
      universalDb,
      `SELECT COALESCE(SUM(balance), 0) as total FROM coin_accounts`
    ),
    // Total accounts
    queryOne<{ count: number }>(universalDb, `SELECT COUNT(*) as count FROM coin_accounts`),
    // Total transactions
    queryOne<{ count: number }>(universalDb, `SELECT COUNT(*) as count FROM coin_transactions`),
    // Recent activity (30 days)
    queryOne<{
      purchases: number;
      spend: number;
      rewards: number;
    }>(
      universalDb,
      `SELECT
        COALESCE(SUM(CASE WHEN type = 'purchase' THEN amount ELSE 0 END), 0) as purchases,
        COALESCE(SUM(CASE WHEN type = 'spend' THEN ABS(amount) ELSE 0 END), 0) as spend,
        COALESCE(SUM(CASE WHEN type = 'reward' THEN amount ELSE 0 END), 0) as rewards
       FROM coin_transactions
       WHERE created_at >= datetime('now', '-30 days')`
    ),
  ]);

  return {
    total_coins_in_circulation: circulationResult?.total || 0,
    total_accounts: accountsResult?.count || 0,
    total_transactions: transactionsResult?.count || 0,
    purchases_30_days: recentStats?.purchases || 0,
    spend_30_days: recentStats?.spend || 0,
    rewards_30_days: recentStats?.rewards || 0,
  };
}

// Adjust user coin balance (admin grant/revoke)
export async function adjustCoinBalance(
  userId: string,
  amount: number,
  type: 'admin_grant' | 'admin_revoke',
  description: string,
  adminId: string
): Promise<void> {
  const universalDb = getUniversalDb();
  const now = new Date().toISOString();
  const transactionId = `txn_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

  // Update balance
  const adjustedAmount = type === 'admin_revoke' ? -Math.abs(amount) : Math.abs(amount);
  await execute(
    universalDb,
    `UPDATE coin_accounts SET balance = balance + ?, updated_at = ? WHERE user_id = ?`,
    [adjustedAmount, now, userId]
  );

  // Record transaction
  await execute(
    universalDb,
    `INSERT INTO coin_transactions (id, user_id, amount, type, description, reference_id, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [transactionId, userId, adjustedAmount, type, description, `admin:${adminId}`, now]
  );
}

// API Keys filter options
export interface ApiKeyFilterOptions {
  search?: string;
  status?: 'active' | 'inactive' | 'expired';
  limit?: number;
  offset?: number;
}

// Ensure api_keys table exists
export async function ensureApiKeysTable(): Promise<void> {
  const universalDb = getUniversalDb();
  await execute(
    universalDb,
    `CREATE TABLE IF NOT EXISTS api_keys (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      name TEXT NOT NULL,
      key_hash TEXT NOT NULL,
      key_prefix TEXT NOT NULL,
      permissions TEXT DEFAULT '[]',
      is_active INTEGER DEFAULT 1,
      created_at TEXT NOT NULL,
      last_used_at TEXT,
      expires_at TEXT,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )`
  );

  // Create indexes
  await execute(universalDb, `CREATE INDEX IF NOT EXISTS idx_api_keys_user_id ON api_keys(user_id)`);
  await execute(universalDb, `CREATE INDEX IF NOT EXISTS idx_api_keys_key_hash ON api_keys(key_hash)`);
}

// Get API keys with user info
export async function getAdminApiKeys(
  options: ApiKeyFilterOptions = {}
): Promise<{ apiKeys: AdminApiKey[]; total: number }> {
  const universalDb = getUniversalDb();

  // Ensure table exists
  await ensureApiKeysTable();

  const { search, status, limit = 25, offset = 0 } = options;

  // Build WHERE clause
  const conditions: string[] = [];
  const params: (string | number)[] = [];

  if (search) {
    conditions.push('(u.name LIKE ? OR u.email LIKE ? OR k.name LIKE ?)');
    params.push(`%${search}%`, `%${search}%`, `%${search}%`);
  }
  if (status === 'active') {
    conditions.push('k.is_active = 1 AND (k.expires_at IS NULL OR k.expires_at > datetime("now"))');
  } else if (status === 'inactive') {
    conditions.push('k.is_active = 0');
  } else if (status === 'expired') {
    conditions.push('k.expires_at IS NOT NULL AND k.expires_at <= datetime("now")');
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  // Get total count
  const countResult = await queryOne<{ count: number }>(
    universalDb,
    `SELECT COUNT(*) as count
     FROM api_keys k
     LEFT JOIN users u ON k.user_id = u.id
     ${whereClause}`,
    params
  );
  const total = countResult?.count || 0;

  // Get paginated API keys with user info
  const apiKeys = await query<{
    id: string;
    user_id: string;
    name: string;
    key_prefix: string;
    permissions: string;
    is_active: number;
    created_at: string;
    last_used_at: string | null;
    expires_at: string | null;
    user_name: string | null;
    user_email: string | null;
  }>(
    universalDb,
    `SELECT
      k.id,
      k.user_id,
      k.name,
      k.key_prefix,
      k.permissions,
      k.is_active,
      k.created_at,
      k.last_used_at,
      k.expires_at,
      u.name as user_name,
      u.email as user_email
     FROM api_keys k
     LEFT JOIN users u ON k.user_id = u.id
     ${whereClause}
     ORDER BY k.created_at DESC
     LIMIT ? OFFSET ?`,
    [...params, limit, offset]
  );

  return {
    apiKeys: apiKeys.map((k) => ({
      ...k,
      is_active: Boolean(k.is_active),
      permissions: JSON.parse(k.permissions || '[]'),
      user_name: k.user_name || 'Unknown',
      user_email: k.user_email || 'unknown@example.com',
    })),
    total,
  };
}

// Get API key statistics
export async function getApiKeyStats(): Promise<ApiKeyStats> {
  const universalDb = getUniversalDb();

  // Ensure table exists
  await ensureApiKeysTable();

  const [totalResult, activeResult, expiredResult, usedResult] = await Promise.all([
    queryOne<{ count: number }>(universalDb, `SELECT COUNT(*) as count FROM api_keys`),
    queryOne<{ count: number }>(
      universalDb,
      `SELECT COUNT(*) as count FROM api_keys WHERE is_active = 1 AND (expires_at IS NULL OR expires_at > datetime('now'))`
    ),
    queryOne<{ count: number }>(
      universalDb,
      `SELECT COUNT(*) as count FROM api_keys WHERE expires_at IS NOT NULL AND expires_at <= datetime('now')`
    ),
    queryOne<{ count: number }>(
      universalDb,
      `SELECT COUNT(*) as count FROM api_keys WHERE last_used_at >= datetime('now', '-30 days')`
    ),
  ]);

  return {
    total_keys: totalResult?.count || 0,
    active_keys: activeResult?.count || 0,
    expired_keys: expiredResult?.count || 0,
    keys_used_30_days: usedResult?.count || 0,
  };
}

// Create API key for a user
export async function createApiKey(
  userId: string,
  name: string,
  permissions: string[] = [],
  expiresInDays?: number
): Promise<{ id: string; key: string }> {
  const universalDb = getUniversalDb();
  await ensureApiKeysTable();

  const id = `key_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
  const rawKey = `echo_${Math.random().toString(36).slice(2)}${Math.random().toString(36).slice(2)}`;
  const keyPrefix = rawKey.slice(0, 12) + '...';

  // Simple hash for storage (in production, use bcrypt or similar)
  const keyHash = Buffer.from(rawKey).toString('base64');

  const now = new Date().toISOString();
  const expiresAt = expiresInDays
    ? new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000).toISOString()
    : null;

  await execute(
    universalDb,
    `INSERT INTO api_keys (id, user_id, name, key_hash, key_prefix, permissions, is_active, created_at, expires_at)
     VALUES (?, ?, ?, ?, ?, ?, 1, ?, ?)`,
    [id, userId, name, keyHash, keyPrefix, JSON.stringify(permissions), now, expiresAt]
  );

  return { id, key: rawKey };
}

// Update API key
export async function updateApiKey(
  keyId: string,
  data: { name?: string; is_active?: boolean; permissions?: string[] }
): Promise<void> {
  const universalDb = getUniversalDb();
  const updates: string[] = [];
  const values: (string | number | null)[] = [];

  if (data.name !== undefined) {
    updates.push('name = ?');
    values.push(data.name);
  }
  if (data.is_active !== undefined) {
    updates.push('is_active = ?');
    values.push(data.is_active ? 1 : 0);
  }
  if (data.permissions !== undefined) {
    updates.push('permissions = ?');
    values.push(JSON.stringify(data.permissions));
  }

  if (updates.length === 0) return;

  values.push(keyId);
  await execute(universalDb, `UPDATE api_keys SET ${updates.join(', ')} WHERE id = ?`, values);
}

// Delete API key
export async function deleteApiKey(keyId: string): Promise<void> {
  const universalDb = getUniversalDb();
  await execute(universalDb, `DELETE FROM api_keys WHERE id = ?`, [keyId]);
}

// AI Models filter options
export interface AIModelFilterOptions {
  search?: string;
  provider?: string;
  type?: 'text' | 'image' | 'audio' | 'embedding';
  status?: 'active' | 'inactive';
  limit?: number;
  offset?: number;
}

// Ensure ai_models table exists
export async function ensureAIModelsTable(): Promise<void> {
  const universalDb = getUniversalDb();
  await execute(
    universalDb,
    `CREATE TABLE IF NOT EXISTS ai_models (
      id TEXT PRIMARY KEY,
      provider TEXT NOT NULL,
      model_type TEXT NOT NULL,
      model_id TEXT NOT NULL,
      display_name TEXT NOT NULL,
      description TEXT,
      is_active INTEGER DEFAULT 1,
      is_default INTEGER DEFAULT 0,
      cost_per_1k_tokens REAL,
      cost_per_image REAL,
      max_tokens INTEGER,
      context_window INTEGER,
      capabilities TEXT DEFAULT '[]',
      settings TEXT DEFAULT '{}',
      created_at TEXT NOT NULL,
      updated_at TEXT,
      UNIQUE(provider, model_id)
    )`
  );

  // Create ai_model_usage table for tracking
  await execute(
    universalDb,
    `CREATE TABLE IF NOT EXISTS ai_model_usage (
      id TEXT PRIMARY KEY,
      model_id TEXT NOT NULL,
      user_id TEXT,
      tokens_used INTEGER DEFAULT 0,
      images_generated INTEGER DEFAULT 0,
      cost REAL DEFAULT 0,
      created_at TEXT NOT NULL,
      FOREIGN KEY (model_id) REFERENCES ai_models(id)
    )`
  );

  // Create indexes
  await execute(universalDb, `CREATE INDEX IF NOT EXISTS idx_ai_models_provider ON ai_models(provider)`);
  await execute(universalDb, `CREATE INDEX IF NOT EXISTS idx_ai_models_type ON ai_models(model_type)`);
  await execute(universalDb, `CREATE INDEX IF NOT EXISTS idx_ai_model_usage_model ON ai_model_usage(model_id)`);
}

// Seed default AI models if table is empty
export async function seedDefaultAIModels(): Promise<void> {
  const universalDb = getUniversalDb();
  await ensureAIModelsTable();

  const existingCount = await queryOne<{ count: number }>(
    universalDb,
    `SELECT COUNT(*) as count FROM ai_models`
  );

  if ((existingCount?.count || 0) > 0) return;

  const now = new Date().toISOString();
  const defaultModels = [
    {
      id: 'model_gpt4o',
      provider: 'openai',
      model_type: 'text',
      model_id: 'gpt-4o',
      display_name: 'GPT-4o',
      description: 'Most capable model for complex tasks',
      is_active: 1,
      is_default: 1,
      cost_per_1k_tokens: 0.005,
      max_tokens: 4096,
      context_window: 128000,
      capabilities: JSON.stringify(['text', 'vision', 'function_calling']),
    },
    {
      id: 'model_gpt4omini',
      provider: 'openai',
      model_type: 'text',
      model_id: 'gpt-4o-mini',
      display_name: 'GPT-4o Mini',
      description: 'Fast and cost-effective for simple tasks',
      is_active: 1,
      is_default: 0,
      cost_per_1k_tokens: 0.00015,
      max_tokens: 4096,
      context_window: 128000,
      capabilities: JSON.stringify(['text', 'vision', 'function_calling']),
    },
    {
      id: 'model_claude35sonnet',
      provider: 'anthropic',
      model_type: 'text',
      model_id: 'claude-3-5-sonnet-20241022',
      display_name: 'Claude 3.5 Sonnet',
      description: 'Balanced performance and cost',
      is_active: 1,
      is_default: 0,
      cost_per_1k_tokens: 0.003,
      max_tokens: 8192,
      context_window: 200000,
      capabilities: JSON.stringify(['text', 'vision', 'function_calling']),
    },
    {
      id: 'model_dalle3',
      provider: 'openai',
      model_type: 'image',
      model_id: 'dall-e-3',
      display_name: 'DALL-E 3',
      description: 'High quality image generation',
      is_active: 1,
      is_default: 1,
      cost_per_image: 0.04,
      capabilities: JSON.stringify(['image_generation', 'hd', 'natural_style', 'vivid_style']),
    },
    {
      id: 'model_sdxl',
      provider: 'stability',
      model_type: 'image',
      model_id: 'stable-diffusion-xl',
      display_name: 'Stable Diffusion XL',
      description: 'Open source image generation',
      is_active: 1,
      is_default: 0,
      cost_per_image: 0.002,
      capabilities: JSON.stringify(['image_generation', 'controlnet', 'inpainting']),
    },
    {
      id: 'model_flux',
      provider: 'replicate',
      model_type: 'image',
      model_id: 'black-forest-labs/flux-1.1-pro',
      display_name: 'FLUX 1.1 Pro',
      description: 'Advanced image generation with high fidelity',
      is_active: 1,
      is_default: 0,
      cost_per_image: 0.04,
      capabilities: JSON.stringify(['image_generation', 'high_fidelity', 'fast']),
    },
  ];

  for (const model of defaultModels) {
    await execute(
      universalDb,
      `INSERT INTO ai_models (id, provider, model_type, model_id, display_name, description, is_active, is_default, cost_per_1k_tokens, cost_per_image, max_tokens, context_window, capabilities, settings, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, '{}', ?)`,
      [
        model.id,
        model.provider,
        model.model_type,
        model.model_id,
        model.display_name,
        model.description,
        model.is_active,
        model.is_default,
        model.cost_per_1k_tokens || null,
        model.cost_per_image || null,
        model.max_tokens || null,
        model.context_window || null,
        model.capabilities,
        now,
      ]
    );
  }
}

// Get AI models with usage stats
export async function getAdminAIModels(
  options: AIModelFilterOptions = {}
): Promise<{ models: AdminAIModel[]; total: number }> {
  const universalDb = getUniversalDb();

  // Ensure table exists and seed defaults
  await seedDefaultAIModels();

  const { search, provider, type, status, limit = 25, offset = 0 } = options;

  // Build WHERE clause
  const conditions: string[] = [];
  const params: (string | number)[] = [];

  if (search) {
    conditions.push('(m.display_name LIKE ? OR m.model_id LIKE ? OR m.description LIKE ?)');
    params.push(`%${search}%`, `%${search}%`, `%${search}%`);
  }
  if (provider) {
    conditions.push('m.provider = ?');
    params.push(provider);
  }
  if (type) {
    conditions.push('m.model_type = ?');
    params.push(type);
  }
  if (status === 'active') {
    conditions.push('m.is_active = 1');
  } else if (status === 'inactive') {
    conditions.push('m.is_active = 0');
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  // Get total count
  const countResult = await queryOne<{ count: number }>(
    universalDb,
    `SELECT COUNT(*) as count FROM ai_models m ${whereClause}`,
    params
  );
  const total = countResult?.count || 0;

  // Get paginated models with usage stats
  const models = await query<{
    id: string;
    provider: string;
    model_type: string;
    model_id: string;
    display_name: string;
    description: string | null;
    is_active: number;
    is_default: number;
    cost_per_1k_tokens: number | null;
    cost_per_image: number | null;
    max_tokens: number | null;
    context_window: number | null;
    capabilities: string;
    settings: string;
    created_at: string;
    updated_at: string | null;
    usage_count: number | null;
    total_cost: number | null;
  }>(
    universalDb,
    `SELECT
      m.id,
      m.provider,
      m.model_type,
      m.model_id,
      m.display_name,
      m.description,
      m.is_active,
      m.is_default,
      m.cost_per_1k_tokens,
      m.cost_per_image,
      m.max_tokens,
      m.context_window,
      m.capabilities,
      m.settings,
      m.created_at,
      m.updated_at,
      COALESCE(SUM(u.tokens_used + u.images_generated), 0) as usage_count,
      COALESCE(SUM(u.cost), 0) as total_cost
     FROM ai_models m
     LEFT JOIN ai_model_usage u ON m.id = u.model_id
     ${whereClause}
     GROUP BY m.id
     ORDER BY m.is_default DESC, m.display_name ASC
     LIMIT ? OFFSET ?`,
    [...params, limit, offset]
  );

  return {
    models: models.map((m) => ({
      ...m,
      provider: m.provider as AdminAIModel['provider'],
      model_type: m.model_type as AdminAIModel['model_type'],
      is_active: Boolean(m.is_active),
      is_default: Boolean(m.is_default),
      capabilities: JSON.parse(m.capabilities || '[]'),
      settings: JSON.parse(m.settings || '{}'),
      usage_count: m.usage_count || 0,
      total_cost: m.total_cost || 0,
    })),
    total,
  };
}

// Get AI model statistics
export async function getAIModelStats(): Promise<AIModelStats> {
  const universalDb = getUniversalDb();

  // Ensure table exists
  await ensureAIModelsTable();

  const [totalResult, activeResult, textResult, imageResult, usageResult] = await Promise.all([
    queryOne<{ count: number }>(universalDb, `SELECT COUNT(*) as count FROM ai_models`),
    queryOne<{ count: number }>(universalDb, `SELECT COUNT(*) as count FROM ai_models WHERE is_active = 1`),
    queryOne<{ count: number }>(universalDb, `SELECT COUNT(*) as count FROM ai_models WHERE model_type = 'text'`),
    queryOne<{ count: number }>(universalDb, `SELECT COUNT(*) as count FROM ai_models WHERE model_type = 'image'`),
    queryOne<{ usage: number; cost: number }>(
      universalDb,
      `SELECT
        COALESCE(SUM(tokens_used + images_generated), 0) as usage,
        COALESCE(SUM(cost), 0) as cost
       FROM ai_model_usage
       WHERE created_at >= datetime('now', '-30 days')`
    ),
  ]);

  return {
    total_models: totalResult?.count || 0,
    active_models: activeResult?.count || 0,
    text_models: textResult?.count || 0,
    image_models: imageResult?.count || 0,
    total_usage_30_days: usageResult?.usage || 0,
    total_cost_30_days: usageResult?.cost || 0,
  };
}

// Create AI model
export async function createAIModel(data: {
  provider: string;
  model_type: string;
  model_id: string;
  display_name: string;
  description?: string;
  cost_per_1k_tokens?: number;
  cost_per_image?: number;
  max_tokens?: number;
  context_window?: number;
  capabilities?: string[];
  settings?: Record<string, unknown>;
}): Promise<string> {
  const universalDb = getUniversalDb();
  await ensureAIModelsTable();

  const id = `model_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
  const now = new Date().toISOString();

  await execute(
    universalDb,
    `INSERT INTO ai_models (id, provider, model_type, model_id, display_name, description, is_active, is_default, cost_per_1k_tokens, cost_per_image, max_tokens, context_window, capabilities, settings, created_at)
     VALUES (?, ?, ?, ?, ?, ?, 1, 0, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      data.provider,
      data.model_type,
      data.model_id,
      data.display_name,
      data.description || null,
      data.cost_per_1k_tokens || null,
      data.cost_per_image || null,
      data.max_tokens || null,
      data.context_window || null,
      JSON.stringify(data.capabilities || []),
      JSON.stringify(data.settings || {}),
      now,
    ]
  );

  return id;
}

// Update AI model
export async function updateAIModel(
  modelId: string,
  data: {
    display_name?: string;
    description?: string;
    is_active?: boolean;
    is_default?: boolean;
    cost_per_1k_tokens?: number;
    cost_per_image?: number;
    max_tokens?: number;
    context_window?: number;
    capabilities?: string[];
    settings?: Record<string, unknown>;
  }
): Promise<void> {
  const universalDb = getUniversalDb();
  const updates: string[] = [];
  const values: (string | number | null)[] = [];

  if (data.display_name !== undefined) {
    updates.push('display_name = ?');
    values.push(data.display_name);
  }
  if (data.description !== undefined) {
    updates.push('description = ?');
    values.push(data.description);
  }
  if (data.is_active !== undefined) {
    updates.push('is_active = ?');
    values.push(data.is_active ? 1 : 0);
  }
  if (data.is_default !== undefined) {
    updates.push('is_default = ?');
    values.push(data.is_default ? 1 : 0);
  }
  if (data.cost_per_1k_tokens !== undefined) {
    updates.push('cost_per_1k_tokens = ?');
    values.push(data.cost_per_1k_tokens);
  }
  if (data.cost_per_image !== undefined) {
    updates.push('cost_per_image = ?');
    values.push(data.cost_per_image);
  }
  if (data.max_tokens !== undefined) {
    updates.push('max_tokens = ?');
    values.push(data.max_tokens);
  }
  if (data.context_window !== undefined) {
    updates.push('context_window = ?');
    values.push(data.context_window);
  }
  if (data.capabilities !== undefined) {
    updates.push('capabilities = ?');
    values.push(JSON.stringify(data.capabilities));
  }
  if (data.settings !== undefined) {
    updates.push('settings = ?');
    values.push(JSON.stringify(data.settings));
  }

  if (updates.length === 0) return;

  updates.push('updated_at = CURRENT_TIMESTAMP');
  values.push(modelId);

  await execute(universalDb, `UPDATE ai_models SET ${updates.join(', ')} WHERE id = ?`, values);
}

// Delete AI model
export async function deleteAIModel(modelId: string): Promise<void> {
  const universalDb = getUniversalDb();
  await execute(universalDb, `DELETE FROM ai_models WHERE id = ?`, [modelId]);
}

// Set default AI model for a type
export async function setDefaultAIModel(modelId: string, modelType: string): Promise<void> {
  const universalDb = getUniversalDb();

  // Unset current default for this type
  await execute(
    universalDb,
    `UPDATE ai_models SET is_default = 0, updated_at = CURRENT_TIMESTAMP WHERE model_type = ?`,
    [modelType]
  );

  // Set new default
  await execute(
    universalDb,
    `UPDATE ai_models SET is_default = 1, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
    [modelId]
  );
}

// Database Browser Functions

// Get all tables from both databases
export async function getDatabaseTables(): Promise<DatabaseTable[]> {
  const universalDb = getUniversalDb();
  const booksDb = getBooksDb();

  // Get tables from universal DB
  const universalTables = await query<{ name: string; type: string }>(
    universalDb,
    `SELECT name, type FROM sqlite_master WHERE type IN ('table', 'view') AND name NOT LIKE 'sqlite_%' ORDER BY name`
  );

  // Get tables from books DB
  const booksTables = await query<{ name: string; type: string }>(
    booksDb,
    `SELECT name, type FROM sqlite_master WHERE type IN ('table', 'view') AND name NOT LIKE 'sqlite_%' ORDER BY name`
  );

  // Get row counts for universal tables
  const universalResults: DatabaseTable[] = [];
  for (const table of universalTables) {
    try {
      const countResult = await queryOne<{ count: number }>(
        universalDb,
        `SELECT COUNT(*) as count FROM "${table.name}"`
      );
      universalResults.push({
        name: table.name,
        type: table.type as 'table' | 'view',
        rowCount: countResult?.count || 0,
        database: 'universal',
      });
    } catch {
      universalResults.push({
        name: table.name,
        type: table.type as 'table' | 'view',
        rowCount: 0,
        database: 'universal',
      });
    }
  }

  // Get row counts for books tables
  const booksResults: DatabaseTable[] = [];
  for (const table of booksTables) {
    try {
      const countResult = await queryOne<{ count: number }>(
        booksDb,
        `SELECT COUNT(*) as count FROM "${table.name}"`
      );
      booksResults.push({
        name: table.name,
        type: table.type as 'table' | 'view',
        rowCount: countResult?.count || 0,
        database: 'books',
      });
    } catch {
      booksResults.push({
        name: table.name,
        type: table.type as 'table' | 'view',
        rowCount: 0,
        database: 'books',
      });
    }
  }

  return [...universalResults, ...booksResults];
}

// Get columns for a specific table
export async function getTableColumns(tableName: string, database: 'universal' | 'books'): Promise<DatabaseColumn[]> {
  const db = database === 'universal' ? getUniversalDb() : getBooksDb();

  const columns = await query<{
    cid: number;
    name: string;
    type: string;
    notnull: number;
    dflt_value: string | null;
    pk: number;
  }>(db, `PRAGMA table_info("${tableName}")`);

  return columns.map((col) => ({
    name: col.name,
    type: col.type,
    notnull: Boolean(col.notnull),
    dflt_value: col.dflt_value,
    pk: Boolean(col.pk),
  }));
}

// Get table data with pagination
export async function getTableData(
  tableName: string,
  database: 'universal' | 'books',
  options: { limit?: number; offset?: number; orderBy?: string; orderDir?: 'ASC' | 'DESC' } = {}
): Promise<{ rows: Record<string, unknown>[]; total: number }> {
  const db = database === 'universal' ? getUniversalDb() : getBooksDb();
  const { limit = 50, offset = 0, orderBy, orderDir = 'ASC' } = options;

  // Get total count
  const countResult = await queryOne<{ count: number }>(
    db,
    `SELECT COUNT(*) as count FROM "${tableName}"`
  );
  const total = countResult?.count || 0;

  // Build query
  let sql = `SELECT * FROM "${tableName}"`;
  if (orderBy) {
    sql += ` ORDER BY "${orderBy}" ${orderDir}`;
  }
  sql += ` LIMIT ? OFFSET ?`;

  const rows = await query<Record<string, unknown>>(db, sql, [limit, offset]);

  return { rows, total };
}

// Execute a read-only query
export async function executeReadOnlyQuery(
  sqlQuery: string,
  database: 'universal' | 'books'
): Promise<DatabaseQueryResult> {
  const db = database === 'universal' ? getUniversalDb() : getBooksDb();

  // Validate the query is read-only (basic check)
  const normalizedQuery = sqlQuery.trim().toLowerCase();
  const forbiddenKeywords = ['insert', 'update', 'delete', 'drop', 'alter', 'create', 'truncate', 'replace'];
  for (const keyword of forbiddenKeywords) {
    if (normalizedQuery.startsWith(keyword)) {
      throw new Error(`Query type '${keyword.toUpperCase()}' is not allowed. Only SELECT queries are permitted.`);
    }
  }

  if (!normalizedQuery.startsWith('select') && !normalizedQuery.startsWith('pragma') && !normalizedQuery.startsWith('explain')) {
    throw new Error('Only SELECT, PRAGMA, and EXPLAIN queries are permitted.');
  }

  const startTime = Date.now();
  const rows = await query<Record<string, unknown>>(db, sqlQuery);
  const executionTime = Date.now() - startTime;

  // Extract column names from first row
  const columns = rows.length > 0 ? Object.keys(rows[0]) : [];

  return {
    columns,
    rows,
    rowCount: rows.length,
    executionTime,
  };
}

// ============================================
// Settings Management
// ============================================

// Ensure settings table exists
async function ensureSettingsTable(): Promise<void> {
  const universalDb = getUniversalDb();

  await execute(
    universalDb,
    `CREATE TABLE IF NOT EXISTS app_settings (
      id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
      key TEXT UNIQUE NOT NULL,
      value TEXT NOT NULL,
      type TEXT NOT NULL DEFAULT 'string',
      category TEXT NOT NULL DEFAULT 'general',
      label TEXT NOT NULL,
      description TEXT,
      is_sensitive INTEGER NOT NULL DEFAULT 0,
      requires_restart INTEGER NOT NULL DEFAULT 0,
      updated_at TEXT,
      updated_by TEXT
    )`
  );
}

// Seed default settings
export async function seedDefaultSettings(): Promise<void> {
  await ensureSettingsTable();
  const universalDb = getUniversalDb();

  // Check if we already have settings
  const existing = await queryOne<{ count: number }>(
    universalDb,
    'SELECT COUNT(*) as count FROM app_settings'
  );

  if (existing && existing.count > 0) {
    return; // Already seeded
  }

  const now = new Date().toISOString();

  const defaultSettings = [
    // General settings
    { key: 'app_name', value: 'Echo Tales', type: 'string', category: 'general', label: 'Application Name', description: 'The name displayed in the app header and emails', is_sensitive: 0, requires_restart: 0 },
    { key: 'app_tagline', value: 'Create magical stories for your children', type: 'string', category: 'general', label: 'App Tagline', description: 'Short description shown on landing page', is_sensitive: 0, requires_restart: 0 },
    { key: 'support_email', value: 'support@echotales.com', type: 'string', category: 'general', label: 'Support Email', description: 'Email address for user support inquiries', is_sensitive: 0, requires_restart: 0 },
    { key: 'maintenance_mode', value: 'false', type: 'boolean', category: 'general', label: 'Maintenance Mode', description: 'When enabled, shows maintenance page to non-admin users', is_sensitive: 0, requires_restart: 0 },

    // Security settings
    { key: 'session_timeout_hours', value: '24', type: 'number', category: 'security', label: 'Session Timeout (hours)', description: 'How long before user sessions expire', is_sensitive: 0, requires_restart: 0 },
    { key: 'max_login_attempts', value: '5', type: 'number', category: 'security', label: 'Max Login Attempts', description: 'Number of failed login attempts before temporary lockout', is_sensitive: 0, requires_restart: 0 },
    { key: 'lockout_duration_minutes', value: '15', type: 'number', category: 'security', label: 'Lockout Duration (minutes)', description: 'How long accounts are locked after max failed attempts', is_sensitive: 0, requires_restart: 0 },
    { key: 'require_email_verification', value: 'true', type: 'boolean', category: 'security', label: 'Require Email Verification', description: 'Require users to verify their email before accessing features', is_sensitive: 0, requires_restart: 0 },
    { key: 'allow_registration', value: 'true', type: 'boolean', category: 'security', label: 'Allow Registration', description: 'Allow new users to register accounts', is_sensitive: 0, requires_restart: 0 },

    // Email settings
    { key: 'smtp_host', value: '', type: 'string', category: 'email', label: 'SMTP Host', description: 'SMTP server hostname', is_sensitive: 0, requires_restart: 1 },
    { key: 'smtp_port', value: '587', type: 'number', category: 'email', label: 'SMTP Port', description: 'SMTP server port', is_sensitive: 0, requires_restart: 1 },
    { key: 'smtp_user', value: '', type: 'string', category: 'email', label: 'SMTP Username', description: 'SMTP authentication username', is_sensitive: 0, requires_restart: 1 },
    { key: 'smtp_password', value: '', type: 'secret', category: 'email', label: 'SMTP Password', description: 'SMTP authentication password', is_sensitive: 1, requires_restart: 1 },
    { key: 'email_from_name', value: 'Echo Tales', type: 'string', category: 'email', label: 'From Name', description: 'Sender name for outgoing emails', is_sensitive: 0, requires_restart: 0 },
    { key: 'email_from_address', value: 'noreply@echotales.com', type: 'string', category: 'email', label: 'From Address', description: 'Sender email address', is_sensitive: 0, requires_restart: 0 },

    // Feature flags
    { key: 'feature_character_generation', value: 'true', type: 'boolean', category: 'features', label: 'Character Generation', description: 'Enable AI character image generation', is_sensitive: 0, requires_restart: 0 },
    { key: 'feature_story_narration', value: 'true', type: 'boolean', category: 'features', label: 'Story Narration', description: 'Enable AI voice narration for stories', is_sensitive: 0, requires_restart: 0 },
    { key: 'feature_community_sharing', value: 'false', type: 'boolean', category: 'features', label: 'Community Sharing', description: 'Allow users to share stories publicly', is_sensitive: 0, requires_restart: 0 },
    { key: 'feature_multi_language', value: 'true', type: 'boolean', category: 'features', label: 'Multi-Language Support', description: 'Enable story generation in multiple languages', is_sensitive: 0, requires_restart: 0 },

    // Limits
    { key: 'free_tier_books_per_month', value: '3', type: 'number', category: 'limits', label: 'Free Tier Books/Month', description: 'Maximum books free users can create per month', is_sensitive: 0, requires_restart: 0 },
    { key: 'pro_tier_books_per_month', value: '20', type: 'number', category: 'limits', label: 'Pro Tier Books/Month', description: 'Maximum books pro users can create per month', is_sensitive: 0, requires_restart: 0 },
    { key: 'premium_tier_books_per_month', value: '100', type: 'number', category: 'limits', label: 'Premium Tier Books/Month', description: 'Maximum books premium users can create per month', is_sensitive: 0, requires_restart: 0 },
    { key: 'max_characters_per_user', value: '10', type: 'number', category: 'limits', label: 'Max Characters/User', description: 'Maximum number of saved characters per user', is_sensitive: 0, requires_restart: 0 },
    { key: 'max_pages_per_book', value: '30', type: 'number', category: 'limits', label: 'Max Pages/Book', description: 'Maximum pages allowed per book', is_sensitive: 0, requires_restart: 0 },

    // Integrations
    { key: 'openai_api_key', value: '', type: 'secret', category: 'integrations', label: 'OpenAI API Key', description: 'API key for OpenAI services', is_sensitive: 1, requires_restart: 0 },
    { key: 'anthropic_api_key', value: '', type: 'secret', category: 'integrations', label: 'Anthropic API Key', description: 'API key for Anthropic Claude', is_sensitive: 1, requires_restart: 0 },
    { key: 'replicate_api_key', value: '', type: 'secret', category: 'integrations', label: 'Replicate API Key', description: 'API key for Replicate models', is_sensitive: 1, requires_restart: 0 },
    { key: 'stripe_public_key', value: '', type: 'secret', category: 'integrations', label: 'Stripe Public Key', description: 'Stripe publishable key for payments', is_sensitive: 0, requires_restart: 0 },
    { key: 'stripe_secret_key', value: '', type: 'secret', category: 'integrations', label: 'Stripe Secret Key', description: 'Stripe secret key for payments', is_sensitive: 1, requires_restart: 0 },
    { key: 'analytics_id', value: '', type: 'string', category: 'integrations', label: 'Analytics ID', description: 'Google Analytics or similar tracking ID', is_sensitive: 0, requires_restart: 0 },
  ];

  for (const setting of defaultSettings) {
    await execute(
      universalDb,
      `INSERT INTO app_settings (key, value, type, category, label, description, is_sensitive, requires_restart, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        setting.key,
        setting.value,
        setting.type,
        setting.category,
        setting.label,
        setting.description,
        setting.is_sensitive,
        setting.requires_restart,
        now,
      ]
    );
  }
}

// Get all settings
export async function getAdminSettings(): Promise<AdminSetting[]> {
  await seedDefaultSettings();
  const universalDb = getUniversalDb();

  const settings = await query<{
    id: string;
    key: string;
    value: string;
    type: string;
    category: string;
    label: string;
    description: string | null;
    is_sensitive: number;
    requires_restart: number;
    updated_at: string | null;
    updated_by: string | null;
  }>(
    universalDb,
    `SELECT * FROM app_settings ORDER BY category, label`
  );

  return settings.map((s) => ({
    ...s,
    type: s.type as AdminSetting['type'],
    category: s.category as AdminSetting['category'],
    is_sensitive: Boolean(s.is_sensitive),
    requires_restart: Boolean(s.requires_restart),
    // Mask sensitive values
    value: s.is_sensitive && s.value ? '••••••••' : s.value,
  }));
}

// Get settings by category
export async function getSettingsByCategory(category: string): Promise<AdminSetting[]> {
  await seedDefaultSettings();
  const universalDb = getUniversalDb();

  const settings = await query<{
    id: string;
    key: string;
    value: string;
    type: string;
    category: string;
    label: string;
    description: string | null;
    is_sensitive: number;
    requires_restart: number;
    updated_at: string | null;
    updated_by: string | null;
  }>(
    universalDb,
    `SELECT * FROM app_settings WHERE category = ? ORDER BY label`,
    [category]
  );

  return settings.map((s) => ({
    ...s,
    type: s.type as AdminSetting['type'],
    category: s.category as AdminSetting['category'],
    is_sensitive: Boolean(s.is_sensitive),
    requires_restart: Boolean(s.requires_restart),
    value: s.is_sensitive && s.value ? '••••••••' : s.value,
  }));
}

// Update a single setting
export async function updateSetting(key: string, value: string, updatedBy: string): Promise<void> {
  const universalDb = getUniversalDb();

  await execute(
    universalDb,
    `UPDATE app_settings SET value = ?, updated_at = CURRENT_TIMESTAMP, updated_by = ? WHERE key = ?`,
    [value, updatedBy, key]
  );
}

// Update multiple settings
export async function updateSettings(updates: { key: string; value: string }[], updatedBy: string): Promise<void> {
  const universalDb = getUniversalDb();

  for (const update of updates) {
    await execute(
      universalDb,
      `UPDATE app_settings SET value = ?, updated_at = CURRENT_TIMESTAMP, updated_by = ? WHERE key = ?`,
      [update.value, updatedBy, update.key]
    );
  }
}

// Get a single setting value (unmasked, for server-side use)
export async function getSettingValue(key: string): Promise<string | null> {
  await ensureSettingsTable();
  const universalDb = getUniversalDb();

  const result = await queryOne<{ value: string }>(
    universalDb,
    `SELECT value FROM app_settings WHERE key = ?`,
    [key]
  );

  return result?.value ?? null;
}

// ============================================
// App Icons Management
// ============================================

// Ensure app_icons table exists
async function ensureAppIconsTable(): Promise<void> {
  const universalDb = getUniversalDb();

  await execute(
    universalDb,
    `CREATE TABLE IF NOT EXISTS app_icons (
      id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
      name TEXT UNIQUE NOT NULL,
      category TEXT NOT NULL DEFAULT 'misc',
      icon_type TEXT NOT NULL DEFAULT 'emoji',
      icon_value TEXT NOT NULL,
      description TEXT,
      is_active INTEGER NOT NULL DEFAULT 1,
      usage_count INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL,
      updated_at TEXT
    )`
  );
}

// Seed default icons
export async function seedDefaultIcons(): Promise<void> {
  await ensureAppIconsTable();
  const universalDb = getUniversalDb();

  // Check if we already have icons
  const existing = await queryOne<{ count: number }>(
    universalDb,
    'SELECT COUNT(*) as count FROM app_icons'
  );

  if (existing && existing.count > 0) {
    return; // Already seeded
  }

  const now = new Date().toISOString();

  const defaultIcons = [
    // Navigation icons
    { name: 'nav_home', category: 'navigation', icon_type: 'emoji', icon_value: '🏠', description: 'Home navigation icon' },
    { name: 'nav_library', category: 'navigation', icon_type: 'emoji', icon_value: '📚', description: 'Library navigation icon' },
    { name: 'nav_create', category: 'navigation', icon_type: 'emoji', icon_value: '✨', description: 'Create new story icon' },
    { name: 'nav_profile', category: 'navigation', icon_type: 'emoji', icon_value: '👤', description: 'User profile icon' },
    { name: 'nav_settings', category: 'navigation', icon_type: 'emoji', icon_value: '⚙️', description: 'Settings icon' },

    // Action icons
    { name: 'action_edit', category: 'actions', icon_type: 'emoji', icon_value: '✏️', description: 'Edit action icon' },
    { name: 'action_delete', category: 'actions', icon_type: 'emoji', icon_value: '🗑️', description: 'Delete action icon' },
    { name: 'action_save', category: 'actions', icon_type: 'emoji', icon_value: '💾', description: 'Save action icon' },
    { name: 'action_share', category: 'actions', icon_type: 'emoji', icon_value: '🔗', description: 'Share action icon' },
    { name: 'action_download', category: 'actions', icon_type: 'emoji', icon_value: '⬇️', description: 'Download action icon' },

    // Status icons
    { name: 'status_success', category: 'status', icon_type: 'emoji', icon_value: '✅', description: 'Success status icon' },
    { name: 'status_error', category: 'status', icon_type: 'emoji', icon_value: '❌', description: 'Error status icon' },
    { name: 'status_warning', category: 'status', icon_type: 'emoji', icon_value: '⚠️', description: 'Warning status icon' },
    { name: 'status_info', category: 'status', icon_type: 'emoji', icon_value: 'ℹ️', description: 'Info status icon' },
    { name: 'status_loading', category: 'status', icon_type: 'emoji', icon_value: '⏳', description: 'Loading status icon' },

    // Theme icons
    { name: 'theme_adventure', category: 'themes', icon_type: 'emoji', icon_value: '🏔️', description: 'Adventure theme icon' },
    { name: 'theme_fantasy', category: 'themes', icon_type: 'emoji', icon_value: '🧙', description: 'Fantasy theme icon' },
    { name: 'theme_science', category: 'themes', icon_type: 'emoji', icon_value: '🔬', description: 'Science theme icon' },
    { name: 'theme_nature', category: 'themes', icon_type: 'emoji', icon_value: '🌿', description: 'Nature theme icon' },
    { name: 'theme_space', category: 'themes', icon_type: 'emoji', icon_value: '🚀', description: 'Space theme icon' },

    // Character icons
    { name: 'char_child', category: 'characters', icon_type: 'emoji', icon_value: '👧', description: 'Child character icon' },
    { name: 'char_animal', category: 'characters', icon_type: 'emoji', icon_value: '🐻', description: 'Animal character icon' },
    { name: 'char_hero', category: 'characters', icon_type: 'emoji', icon_value: '🦸', description: 'Hero character icon' },
    { name: 'char_robot', category: 'characters', icon_type: 'emoji', icon_value: '🤖', description: 'Robot character icon' },
    { name: 'char_fairy', category: 'characters', icon_type: 'emoji', icon_value: '🧚', description: 'Fairy character icon' },

    // Misc icons
    { name: 'misc_star', category: 'misc', icon_type: 'emoji', icon_value: '⭐', description: 'Star icon' },
    { name: 'misc_heart', category: 'misc', icon_type: 'emoji', icon_value: '❤️', description: 'Heart icon' },
    { name: 'misc_book', category: 'misc', icon_type: 'emoji', icon_value: '📖', description: 'Book icon' },
    { name: 'misc_magic', category: 'misc', icon_type: 'emoji', icon_value: '🪄', description: 'Magic wand icon' },
    { name: 'misc_crown', category: 'misc', icon_type: 'emoji', icon_value: '👑', description: 'Crown icon' },
  ];

  for (const icon of defaultIcons) {
    await execute(
      universalDb,
      `INSERT INTO app_icons (name, category, icon_type, icon_value, description, is_active, usage_count, created_at)
       VALUES (?, ?, ?, ?, ?, 1, 0, ?)`,
      [icon.name, icon.category, icon.icon_type, icon.icon_value, icon.description, now]
    );
  }
}

// Icon filter options
export interface IconFilterOptions {
  search?: string;
  category?: string;
  status?: 'active' | 'inactive' | 'all';
  limit?: number;
  offset?: number;
}

// Get app icons with filtering
export async function getAdminAppIcons(
  options: IconFilterOptions = {}
): Promise<{ icons: AdminAppIcon[]; total: number }> {
  await seedDefaultIcons();
  const universalDb = getUniversalDb();

  const { search, category, status, limit = 25, offset = 0 } = options;

  // Build WHERE clause
  const conditions: string[] = [];
  const params: (string | number)[] = [];

  if (search) {
    conditions.push('(name LIKE ? OR description LIKE ?)');
    params.push(`%${search}%`, `%${search}%`);
  }
  if (category) {
    conditions.push('category = ?');
    params.push(category);
  }
  if (status === 'active') {
    conditions.push('is_active = 1');
  } else if (status === 'inactive') {
    conditions.push('is_active = 0');
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  // Get total count
  const countResult = await queryOne<{ count: number }>(
    universalDb,
    `SELECT COUNT(*) as count FROM app_icons ${whereClause}`,
    params
  );
  const total = countResult?.count || 0;

  // Get paginated icons
  const icons = await query<{
    id: string;
    name: string;
    category: string;
    icon_type: string;
    icon_value: string;
    description: string | null;
    is_active: number;
    usage_count: number;
    created_at: string;
    updated_at: string | null;
  }>(
    universalDb,
    `SELECT * FROM app_icons ${whereClause} ORDER BY category, name LIMIT ? OFFSET ?`,
    [...params, limit, offset]
  );

  return {
    icons: icons.map((i) => ({
      ...i,
      category: i.category as AdminAppIcon['category'],
      icon_type: i.icon_type as AdminAppIcon['icon_type'],
      is_active: Boolean(i.is_active),
    })),
    total,
  };
}

// Get icon stats
export async function getIconStats(): Promise<IconStats> {
  await seedDefaultIcons();
  const universalDb = getUniversalDb();

  const total = await queryOne<{ count: number }>(
    universalDb,
    'SELECT COUNT(*) as count FROM app_icons'
  );

  const active = await queryOne<{ count: number }>(
    universalDb,
    'SELECT COUNT(*) as count FROM app_icons WHERE is_active = 1'
  );

  const categories = await query<{ category: string; count: number }>(
    universalDb,
    'SELECT category, COUNT(*) as count FROM app_icons GROUP BY category'
  );

  const mostUsed = await query<{ name: string; count: number }>(
    universalDb,
    'SELECT name, usage_count as count FROM app_icons ORDER BY usage_count DESC LIMIT 5'
  );

  const byCategory: Record<string, number> = {
    navigation: 0,
    actions: 0,
    status: 0,
    themes: 0,
    characters: 0,
    misc: 0,
  };

  for (const cat of categories) {
    byCategory[cat.category] = cat.count;
  }

  return {
    total_icons: total?.count || 0,
    active_icons: active?.count || 0,
    by_category: byCategory as Record<IconCategory, number>,
    most_used: mostUsed,
  };
}

// Create a new icon
export async function createAppIcon(data: {
  name: string;
  category: string;
  icon_type: string;
  icon_value: string;
  description?: string;
}): Promise<string> {
  await ensureAppIconsTable();
  const universalDb = getUniversalDb();

  const id = crypto.randomUUID().replace(/-/g, '').substring(0, 16);
  const now = new Date().toISOString();

  await execute(
    universalDb,
    `INSERT INTO app_icons (id, name, category, icon_type, icon_value, description, is_active, usage_count, created_at)
     VALUES (?, ?, ?, ?, ?, ?, 1, 0, ?)`,
    [id, data.name, data.category, data.icon_type, data.icon_value, data.description || null, now]
  );

  return id;
}

// Update an icon
export async function updateAppIcon(
  iconId: string,
  data: {
    name?: string;
    category?: string;
    icon_type?: string;
    icon_value?: string;
    description?: string;
    is_active?: boolean;
  }
): Promise<void> {
  const universalDb = getUniversalDb();
  const updates: string[] = [];
  const values: (string | number | null)[] = [];

  if (data.name !== undefined) {
    updates.push('name = ?');
    values.push(data.name);
  }
  if (data.category !== undefined) {
    updates.push('category = ?');
    values.push(data.category);
  }
  if (data.icon_type !== undefined) {
    updates.push('icon_type = ?');
    values.push(data.icon_type);
  }
  if (data.icon_value !== undefined) {
    updates.push('icon_value = ?');
    values.push(data.icon_value);
  }
  if (data.description !== undefined) {
    updates.push('description = ?');
    values.push(data.description);
  }
  if (data.is_active !== undefined) {
    updates.push('is_active = ?');
    values.push(data.is_active ? 1 : 0);
  }

  if (updates.length === 0) return;

  updates.push('updated_at = CURRENT_TIMESTAMP');
  values.push(iconId);

  await execute(universalDb, `UPDATE app_icons SET ${updates.join(', ')} WHERE id = ?`, values);
}

// Delete an icon
export async function deleteAppIcon(iconId: string): Promise<void> {
  const universalDb = getUniversalDb();
  await execute(universalDb, 'DELETE FROM app_icons WHERE id = ?', [iconId]);
}

// ============================================
// Design Themes Management
// ============================================

// Ensure design_themes table exists
async function ensureDesignThemesTable(): Promise<void> {
  const universalDb = getUniversalDb();

  await execute(
    universalDb,
    `CREATE TABLE IF NOT EXISTS design_themes (
      id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
      name TEXT UNIQUE NOT NULL,
      is_active INTEGER NOT NULL DEFAULT 1,
      is_default INTEGER NOT NULL DEFAULT 0,
      colors TEXT NOT NULL,
      typography TEXT NOT NULL,
      spacing TEXT NOT NULL,
      borders TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT
    )`
  );
}

// Default theme values
const DEFAULT_COLORS: ThemeColors = {
  primary: '#3B82F6',
  secondary: '#8B5CF6',
  accent: '#F59E0B',
  background: '#FFFFFF',
  surface: '#F9FAFB',
  text_primary: '#111827',
  text_secondary: '#6B7280',
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',
};

const DEFAULT_TYPOGRAPHY: ThemeTypography = {
  font_family_heading: 'Inter, system-ui, sans-serif',
  font_family_body: 'Inter, system-ui, sans-serif',
  font_size_base: 16,
  line_height_base: 1.5,
  font_weight_normal: 400,
  font_weight_bold: 700,
};

const DEFAULT_SPACING: ThemeSpacing = {
  unit: 4,
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

const DEFAULT_BORDERS: ThemeBorders = {
  radius_sm: 4,
  radius_md: 8,
  radius_lg: 12,
  radius_full: 9999,
  width_default: 1,
};

// Seed default themes
export async function seedDefaultThemes(): Promise<void> {
  await ensureDesignThemesTable();
  const universalDb = getUniversalDb();

  // Check if we already have themes
  const existing = await queryOne<{ count: number }>(
    universalDb,
    'SELECT COUNT(*) as count FROM design_themes'
  );

  if (existing && existing.count > 0) {
    return; // Already seeded
  }

  const now = new Date().toISOString();

  const defaultThemes = [
    {
      id: 'theme_light',
      name: 'Light Theme',
      is_active: 1,
      is_default: 1,
      colors: DEFAULT_COLORS,
      typography: DEFAULT_TYPOGRAPHY,
      spacing: DEFAULT_SPACING,
      borders: DEFAULT_BORDERS,
    },
    {
      id: 'theme_dark',
      name: 'Dark Theme',
      is_active: 1,
      is_default: 0,
      colors: {
        ...DEFAULT_COLORS,
        background: '#111827',
        surface: '#1F2937',
        text_primary: '#F9FAFB',
        text_secondary: '#9CA3AF',
      },
      typography: DEFAULT_TYPOGRAPHY,
      spacing: DEFAULT_SPACING,
      borders: DEFAULT_BORDERS,
    },
    {
      id: 'theme_kids',
      name: 'Kids Theme',
      is_active: 1,
      is_default: 0,
      colors: {
        ...DEFAULT_COLORS,
        primary: '#EC4899',
        secondary: '#8B5CF6',
        accent: '#FBBF24',
        background: '#FFF7ED',
        surface: '#FFFFFF',
      },
      typography: {
        ...DEFAULT_TYPOGRAPHY,
        font_family_heading: 'Comic Sans MS, cursive, sans-serif',
        font_size_base: 18,
      },
      spacing: {
        ...DEFAULT_SPACING,
        unit: 6,
      },
      borders: {
        ...DEFAULT_BORDERS,
        radius_sm: 8,
        radius_md: 16,
        radius_lg: 24,
      },
    },
  ];

  for (const theme of defaultThemes) {
    await execute(
      universalDb,
      `INSERT INTO design_themes (id, name, is_active, is_default, colors, typography, spacing, borders, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        theme.id,
        theme.name,
        theme.is_active,
        theme.is_default,
        JSON.stringify(theme.colors),
        JSON.stringify(theme.typography),
        JSON.stringify(theme.spacing),
        JSON.stringify(theme.borders),
        now,
      ]
    );
  }
}

// Get all design themes
export async function getDesignThemes(): Promise<DesignTheme[]> {
  await seedDefaultThemes();
  const universalDb = getUniversalDb();

  const themes = await query<{
    id: string;
    name: string;
    is_active: number;
    is_default: number;
    colors: string;
    typography: string;
    spacing: string;
    borders: string;
    created_at: string;
    updated_at: string | null;
  }>(universalDb, 'SELECT * FROM design_themes ORDER BY is_default DESC, name');

  return themes.map((t) => ({
    ...t,
    is_active: Boolean(t.is_active),
    is_default: Boolean(t.is_default),
    colors: JSON.parse(t.colors),
    typography: JSON.parse(t.typography),
    spacing: JSON.parse(t.spacing),
    borders: JSON.parse(t.borders),
  }));
}

// Get active/default theme
export async function getActiveTheme(): Promise<DesignTheme | null> {
  await seedDefaultThemes();
  const universalDb = getUniversalDb();

  const theme = await queryOne<{
    id: string;
    name: string;
    is_active: number;
    is_default: number;
    colors: string;
    typography: string;
    spacing: string;
    borders: string;
    created_at: string;
    updated_at: string | null;
  }>(universalDb, 'SELECT * FROM design_themes WHERE is_default = 1 AND is_active = 1');

  if (!theme) return null;

  return {
    ...theme,
    is_active: Boolean(theme.is_active),
    is_default: Boolean(theme.is_default),
    colors: JSON.parse(theme.colors),
    typography: JSON.parse(theme.typography),
    spacing: JSON.parse(theme.spacing),
    borders: JSON.parse(theme.borders),
  };
}

// Create a new theme
export async function createDesignTheme(data: {
  name: string;
  colors?: Partial<ThemeColors>;
  typography?: Partial<ThemeTypography>;
  spacing?: Partial<ThemeSpacing>;
  borders?: Partial<ThemeBorders>;
}): Promise<string> {
  await ensureDesignThemesTable();
  const universalDb = getUniversalDb();

  const id = crypto.randomUUID().replace(/-/g, '').substring(0, 16);
  const now = new Date().toISOString();

  await execute(
    universalDb,
    `INSERT INTO design_themes (id, name, is_active, is_default, colors, typography, spacing, borders, created_at)
     VALUES (?, ?, 1, 0, ?, ?, ?, ?, ?)`,
    [
      id,
      data.name,
      JSON.stringify({ ...DEFAULT_COLORS, ...data.colors }),
      JSON.stringify({ ...DEFAULT_TYPOGRAPHY, ...data.typography }),
      JSON.stringify({ ...DEFAULT_SPACING, ...data.spacing }),
      JSON.stringify({ ...DEFAULT_BORDERS, ...data.borders }),
      now,
    ]
  );

  return id;
}

// Update a theme
export async function updateDesignTheme(
  themeId: string,
  data: {
    name?: string;
    is_active?: boolean;
    colors?: Partial<ThemeColors>;
    typography?: Partial<ThemeTypography>;
    spacing?: Partial<ThemeSpacing>;
    borders?: Partial<ThemeBorders>;
  }
): Promise<void> {
  const universalDb = getUniversalDb();

  // Get existing theme to merge data
  const existing = await queryOne<{
    colors: string;
    typography: string;
    spacing: string;
    borders: string;
  }>(universalDb, 'SELECT colors, typography, spacing, borders FROM design_themes WHERE id = ?', [
    themeId,
  ]);

  if (!existing) throw new Error('Theme not found');

  const updates: string[] = [];
  const values: (string | number)[] = [];

  if (data.name !== undefined) {
    updates.push('name = ?');
    values.push(data.name);
  }
  if (data.is_active !== undefined) {
    updates.push('is_active = ?');
    values.push(data.is_active ? 1 : 0);
  }
  if (data.colors !== undefined) {
    updates.push('colors = ?');
    values.push(JSON.stringify({ ...JSON.parse(existing.colors), ...data.colors }));
  }
  if (data.typography !== undefined) {
    updates.push('typography = ?');
    values.push(JSON.stringify({ ...JSON.parse(existing.typography), ...data.typography }));
  }
  if (data.spacing !== undefined) {
    updates.push('spacing = ?');
    values.push(JSON.stringify({ ...JSON.parse(existing.spacing), ...data.spacing }));
  }
  if (data.borders !== undefined) {
    updates.push('borders = ?');
    values.push(JSON.stringify({ ...JSON.parse(existing.borders), ...data.borders }));
  }

  if (updates.length === 0) return;

  updates.push('updated_at = CURRENT_TIMESTAMP');
  values.push(themeId);

  await execute(universalDb, `UPDATE design_themes SET ${updates.join(', ')} WHERE id = ?`, values);
}

// Set default theme
export async function setDefaultTheme(themeId: string): Promise<void> {
  const universalDb = getUniversalDb();

  // Remove default from all themes
  await execute(universalDb, 'UPDATE design_themes SET is_default = 0');

  // Set new default
  await execute(
    universalDb,
    'UPDATE design_themes SET is_default = 1, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
    [themeId]
  );
}

// Delete a theme
export async function deleteDesignTheme(themeId: string): Promise<void> {
  const universalDb = getUniversalDb();

  // Don't allow deleting the default theme
  const isDefault = await queryOne<{ is_default: number }>(
    universalDb,
    'SELECT is_default FROM design_themes WHERE id = ?',
    [themeId]
  );

  if (isDefault?.is_default) {
    throw new Error('Cannot delete the default theme. Set another theme as default first.');
  }

  await execute(universalDb, 'DELETE FROM design_themes WHERE id = ?', [themeId]);
}

// ============================================
// Marketing Content Management
// ============================================

// Ensure marketing_content table exists
async function ensureMarketingContentTable(): Promise<void> {
  const universalDb = getUniversalDb();

  await execute(
    universalDb,
    `CREATE TABLE IF NOT EXISTS marketing_content (
      id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
      type TEXT NOT NULL,
      title TEXT NOT NULL,
      subtitle TEXT,
      content TEXT,
      image_url TEXT,
      cta_text TEXT,
      cta_link TEXT,
      order_index INTEGER NOT NULL DEFAULT 0,
      is_active INTEGER NOT NULL DEFAULT 1,
      metadata TEXT NOT NULL DEFAULT '{}',
      created_at TEXT NOT NULL,
      updated_at TEXT
    )`
  );
}

// Seed default marketing content
export async function seedDefaultMarketingContent(): Promise<void> {
  await ensureMarketingContentTable();
  const universalDb = getUniversalDb();

  // Check if we already have content
  const existing = await queryOne<{ count: number }>(
    universalDb,
    'SELECT COUNT(*) as count FROM marketing_content'
  );

  if (existing && existing.count > 0) {
    return; // Already seeded
  }

  const now = new Date().toISOString();

  const defaultContent = [
    // Hero section
    {
      type: 'hero',
      title: 'Create Magical Stories for Your Children',
      subtitle: 'Personalized storybooks featuring your child as the hero',
      content: 'Transform bedtime into an adventure with AI-powered stories that spark imagination and create lasting memories.',
      image_url: null,
      cta_text: 'Start Creating',
      cta_link: '/create',
      order_index: 0,
    },
    // Features
    {
      type: 'feature',
      title: 'Personalized Characters',
      subtitle: null,
      content: 'Create custom characters based on your child, their friends, or favorite imaginary friends.',
      image_url: null,
      cta_text: null,
      cta_link: null,
      order_index: 1,
    },
    {
      type: 'feature',
      title: 'Educational Themes',
      subtitle: null,
      content: 'Choose from themes like kindness, bravery, science, and more to teach valuable lessons.',
      image_url: null,
      cta_text: null,
      cta_link: null,
      order_index: 2,
    },
    {
      type: 'feature',
      title: 'Beautiful Illustrations',
      subtitle: null,
      content: 'AI-generated artwork brings your stories to life with stunning, child-friendly illustrations.',
      image_url: null,
      cta_text: null,
      cta_link: null,
      order_index: 3,
    },
    // Testimonials
    {
      type: 'testimonial',
      title: 'Sarah M.',
      subtitle: 'Parent of 2',
      content: 'My kids absolutely love seeing themselves in the stories. It makes reading time so much more engaging!',
      image_url: null,
      cta_text: null,
      cta_link: null,
      order_index: 4,
    },
    {
      type: 'testimonial',
      title: 'James T.',
      subtitle: 'Grandfather',
      content: 'I create stories for my grandkids who live far away. It\'s a wonderful way to stay connected.',
      image_url: null,
      cta_text: null,
      cta_link: null,
      order_index: 5,
    },
    // Stats
    {
      type: 'stat',
      title: '10,000+',
      subtitle: 'Stories Created',
      content: null,
      image_url: null,
      cta_text: null,
      cta_link: null,
      order_index: 6,
    },
    {
      type: 'stat',
      title: '5,000+',
      subtitle: 'Happy Families',
      content: null,
      image_url: null,
      cta_text: null,
      cta_link: null,
      order_index: 7,
    },
    // FAQ
    {
      type: 'faq',
      title: 'How does it work?',
      subtitle: null,
      content: 'Simply create a character, choose a theme, and our AI will generate a unique story with beautiful illustrations. You can customize and edit before printing or sharing.',
      image_url: null,
      cta_text: null,
      cta_link: null,
      order_index: 8,
    },
    {
      type: 'faq',
      title: 'Is it safe for children?',
      subtitle: null,
      content: 'Absolutely! All content is generated with strict safety filters and reviewed to ensure age-appropriate material.',
      image_url: null,
      cta_text: null,
      cta_link: null,
      order_index: 9,
    },
    // CTA
    {
      type: 'cta',
      title: 'Ready to Create Magic?',
      subtitle: 'Start your free trial today',
      content: 'No credit card required. Create your first story in minutes.',
      image_url: null,
      cta_text: 'Get Started Free',
      cta_link: '/signup',
      order_index: 10,
    },
  ];

  for (const item of defaultContent) {
    await execute(
      universalDb,
      `INSERT INTO marketing_content (type, title, subtitle, content, image_url, cta_text, cta_link, order_index, is_active, metadata, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, '{}', ?)`,
      [item.type, item.title, item.subtitle, item.content, item.image_url, item.cta_text, item.cta_link, item.order_index, now]
    );
  }
}

// Marketing content filter options
export interface MarketingFilterOptions {
  type?: string;
  status?: 'active' | 'inactive' | 'all';
  limit?: number;
  offset?: number;
}

// Get marketing content
export async function getMarketingContent(
  options: MarketingFilterOptions = {}
): Promise<{ content: MarketingContent[]; total: number }> {
  await seedDefaultMarketingContent();
  const universalDb = getUniversalDb();

  const { type, status, limit = 50, offset = 0 } = options;

  // Build WHERE clause
  const conditions: string[] = [];
  const params: (string | number)[] = [];

  if (type) {
    conditions.push('type = ?');
    params.push(type);
  }
  if (status === 'active') {
    conditions.push('is_active = 1');
  } else if (status === 'inactive') {
    conditions.push('is_active = 0');
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  // Get total count
  const countResult = await queryOne<{ count: number }>(
    universalDb,
    `SELECT COUNT(*) as count FROM marketing_content ${whereClause}`,
    params
  );
  const total = countResult?.count || 0;

  // Get content
  const content = await query<{
    id: string;
    type: string;
    title: string;
    subtitle: string | null;
    content: string | null;
    image_url: string | null;
    cta_text: string | null;
    cta_link: string | null;
    order_index: number;
    is_active: number;
    metadata: string;
    created_at: string;
    updated_at: string | null;
  }>(
    universalDb,
    `SELECT * FROM marketing_content ${whereClause} ORDER BY order_index, created_at LIMIT ? OFFSET ?`,
    [...params, limit, offset]
  );

  return {
    content: content.map((c) => ({
      ...c,
      type: c.type as MarketingContent['type'],
      is_active: Boolean(c.is_active),
      metadata: JSON.parse(c.metadata),
    })),
    total,
  };
}

// Get marketing stats
export async function getMarketingStats(): Promise<MarketingStats> {
  await seedDefaultMarketingContent();
  const universalDb = getUniversalDb();

  const total = await queryOne<{ count: number }>(
    universalDb,
    'SELECT COUNT(*) as count FROM marketing_content'
  );

  const active = await queryOne<{ count: number }>(
    universalDb,
    'SELECT COUNT(*) as count FROM marketing_content WHERE is_active = 1'
  );

  const byType = await query<{ type: string; count: number }>(
    universalDb,
    'SELECT type, COUNT(*) as count FROM marketing_content GROUP BY type'
  );

  const typeMap: Record<string, number> = {
    hero: 0,
    feature: 0,
    testimonial: 0,
    faq: 0,
    cta: 0,
    stat: 0,
  };

  for (const t of byType) {
    typeMap[t.type] = t.count;
  }

  return {
    total_content: total?.count || 0,
    active_content: active?.count || 0,
    by_type: typeMap as Record<MarketingContentType, number>,
  };
}

// Create marketing content
export async function createMarketingContent(data: {
  type: string;
  title: string;
  subtitle?: string;
  content?: string;
  image_url?: string;
  cta_text?: string;
  cta_link?: string;
  order_index?: number;
}): Promise<string> {
  await ensureMarketingContentTable();
  const universalDb = getUniversalDb();

  const id = crypto.randomUUID().replace(/-/g, '').substring(0, 16);
  const now = new Date().toISOString();

  // Get max order_index if not provided
  let orderIndex = data.order_index;
  if (orderIndex === undefined) {
    const maxOrder = await queryOne<{ max: number }>(
      universalDb,
      'SELECT MAX(order_index) as max FROM marketing_content'
    );
    orderIndex = (maxOrder?.max || 0) + 1;
  }

  await execute(
    universalDb,
    `INSERT INTO marketing_content (id, type, title, subtitle, content, image_url, cta_text, cta_link, order_index, is_active, metadata, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1, '{}', ?)`,
    [id, data.type, data.title, data.subtitle || null, data.content || null, data.image_url || null, data.cta_text || null, data.cta_link || null, orderIndex, now]
  );

  return id;
}

// Update marketing content
export async function updateMarketingContent(
  contentId: string,
  data: {
    type?: string;
    title?: string;
    subtitle?: string;
    content?: string;
    image_url?: string;
    cta_text?: string;
    cta_link?: string;
    order_index?: number;
    is_active?: boolean;
    metadata?: Record<string, unknown>;
  }
): Promise<void> {
  const universalDb = getUniversalDb();
  const updates: string[] = [];
  const values: (string | number | null)[] = [];

  if (data.type !== undefined) {
    updates.push('type = ?');
    values.push(data.type);
  }
  if (data.title !== undefined) {
    updates.push('title = ?');
    values.push(data.title);
  }
  if (data.subtitle !== undefined) {
    updates.push('subtitle = ?');
    values.push(data.subtitle || null);
  }
  if (data.content !== undefined) {
    updates.push('content = ?');
    values.push(data.content || null);
  }
  if (data.image_url !== undefined) {
    updates.push('image_url = ?');
    values.push(data.image_url || null);
  }
  if (data.cta_text !== undefined) {
    updates.push('cta_text = ?');
    values.push(data.cta_text || null);
  }
  if (data.cta_link !== undefined) {
    updates.push('cta_link = ?');
    values.push(data.cta_link || null);
  }
  if (data.order_index !== undefined) {
    updates.push('order_index = ?');
    values.push(data.order_index);
  }
  if (data.is_active !== undefined) {
    updates.push('is_active = ?');
    values.push(data.is_active ? 1 : 0);
  }
  if (data.metadata !== undefined) {
    updates.push('metadata = ?');
    values.push(JSON.stringify(data.metadata));
  }

  if (updates.length === 0) return;

  updates.push('updated_at = CURRENT_TIMESTAMP');
  values.push(contentId);

  await execute(universalDb, `UPDATE marketing_content SET ${updates.join(', ')} WHERE id = ?`, values);
}

// Delete marketing content
export async function deleteMarketingContent(contentId: string): Promise<void> {
  const universalDb = getUniversalDb();
  await execute(universalDb, 'DELETE FROM marketing_content WHERE id = ?', [contentId]);
}

// Reorder marketing content
export async function reorderMarketingContent(items: { id: string; order_index: number }[]): Promise<void> {
  const universalDb = getUniversalDb();

  for (const item of items) {
    await execute(
      universalDb,
      'UPDATE marketing_content SET order_index = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [item.order_index, item.id]
    );
  }
}

// ============================================
// Email Template and Log Management
// ============================================

// Ensure email tables exist
async function ensureEmailTables(): Promise<void> {
  const universalDb = getUniversalDb();

  // Email templates table
  await execute(
    universalDb,
    `CREATE TABLE IF NOT EXISTS email_templates (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      type TEXT NOT NULL DEFAULT 'notification',
      subject TEXT NOT NULL,
      html_body TEXT NOT NULL,
      text_body TEXT,
      variables TEXT DEFAULT '[]',
      is_active INTEGER DEFAULT 1,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT
    )`
  );

  // Email logs table
  await execute(
    universalDb,
    `CREATE TABLE IF NOT EXISTS email_logs (
      id TEXT PRIMARY KEY,
      template_id TEXT,
      template_name TEXT,
      recipient_email TEXT NOT NULL,
      recipient_name TEXT,
      subject TEXT NOT NULL,
      status TEXT DEFAULT 'pending',
      sent_at TEXT,
      delivered_at TEXT,
      opened_at TEXT,
      clicked_at TEXT,
      bounced_at TEXT,
      error_message TEXT,
      metadata TEXT DEFAULT '{}',
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (template_id) REFERENCES email_templates(id) ON DELETE SET NULL
    )`
  );
}

// Seed default email templates
let emailTemplatesSeeded = false;
async function seedDefaultEmailTemplates(): Promise<void> {
  if (emailTemplatesSeeded) return;
  await ensureEmailTables();

  const universalDb = getUniversalDb();
  const existing = await queryOne<{ count: number }>(
    universalDb,
    'SELECT COUNT(*) as count FROM email_templates'
  );

  if (existing && existing.count > 0) {
    emailTemplatesSeeded = true;
    return;
  }

  const defaultTemplates = [
    {
      id: 'tmpl_welcome',
      name: 'Welcome Email',
      type: 'welcome',
      subject: 'Welcome to Echo Tales, {{name}}!',
      html_body: `<h1>Welcome to Echo Tales!</h1>
<p>Hi {{name}},</p>
<p>Thank you for joining Echo Tales. We're excited to have you on board!</p>
<p>Start creating magical stories for your children today.</p>
<p>Best regards,<br>The Echo Tales Team</p>`,
      text_body: 'Welcome to Echo Tales!\n\nHi {{name}},\n\nThank you for joining Echo Tales. We\'re excited to have you on board!\n\nStart creating magical stories for your children today.\n\nBest regards,\nThe Echo Tales Team',
      variables: ['name', 'email'],
    },
    {
      id: 'tmpl_password_reset',
      name: 'Password Reset',
      type: 'password_reset',
      subject: 'Reset your Echo Tales password',
      html_body: `<h1>Password Reset Request</h1>
<p>Hi {{name}},</p>
<p>We received a request to reset your password. Click the button below to create a new password:</p>
<p><a href="{{reset_link}}" style="background-color: #6B46C1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Reset Password</a></p>
<p>This link will expire in 1 hour.</p>
<p>If you didn't request this, you can safely ignore this email.</p>`,
      text_body: 'Password Reset Request\n\nHi {{name}},\n\nWe received a request to reset your password. Visit this link to create a new password:\n\n{{reset_link}}\n\nThis link will expire in 1 hour.\n\nIf you didn\'t request this, you can safely ignore this email.',
      variables: ['name', 'reset_link'],
    },
    {
      id: 'tmpl_verification',
      name: 'Email Verification',
      type: 'verification',
      subject: 'Verify your Echo Tales email',
      html_body: `<h1>Verify Your Email</h1>
<p>Hi {{name}},</p>
<p>Please verify your email address by clicking the button below:</p>
<p><a href="{{verify_link}}" style="background-color: #10B981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Verify Email</a></p>
<p>This link will expire in 24 hours.</p>`,
      text_body: 'Verify Your Email\n\nHi {{name}},\n\nPlease verify your email address by visiting this link:\n\n{{verify_link}}\n\nThis link will expire in 24 hours.',
      variables: ['name', 'verify_link'],
    },
    {
      id: 'tmpl_book_ready',
      name: 'Book Ready Notification',
      type: 'notification',
      subject: 'Your book "{{book_title}}" is ready!',
      html_body: `<h1>Your Story is Ready!</h1>
<p>Hi {{name}},</p>
<p>Great news! Your book <strong>"{{book_title}}"</strong> has been generated and is ready to read.</p>
<p><a href="{{book_link}}" style="background-color: #6B46C1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">View Your Book</a></p>
<p>Enjoy reading with your little ones!</p>`,
      text_body: 'Your Story is Ready!\n\nHi {{name}},\n\nGreat news! Your book "{{book_title}}" has been generated and is ready to read.\n\nView it here: {{book_link}}\n\nEnjoy reading with your little ones!',
      variables: ['name', 'book_title', 'book_link'],
    },
  ];

  for (const template of defaultTemplates) {
    await execute(
      universalDb,
      `INSERT INTO email_templates (id, name, type, subject, html_body, text_body, variables, is_active, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, 1, CURRENT_TIMESTAMP)`,
      [
        template.id,
        template.name,
        template.type,
        template.subject,
        template.html_body,
        template.text_body,
        JSON.stringify(template.variables),
      ]
    );
  }

  emailTemplatesSeeded = true;
}

// Get email templates
export async function getEmailTemplates(
  options: { type?: string; activeOnly?: boolean; limit?: number; offset?: number } = {}
): Promise<{ templates: EmailTemplate[]; total: number }> {
  await seedDefaultEmailTemplates();
  const universalDb = getUniversalDb();

  const { type, activeOnly, limit = 100, offset = 0 } = options;

  const conditions: string[] = [];
  const params: (string | number)[] = [];

  if (type) {
    conditions.push('type = ?');
    params.push(type);
  }
  if (activeOnly) {
    conditions.push('is_active = 1');
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  const countResult = await queryOne<{ count: number }>(
    universalDb,
    `SELECT COUNT(*) as count FROM email_templates ${whereClause}`,
    params
  );
  const total = countResult?.count || 0;

  const templates = await query<{
    id: string;
    name: string;
    type: string;
    subject: string;
    html_body: string;
    text_body: string | null;
    variables: string;
    is_active: number;
    created_at: string;
    updated_at: string | null;
  }>(
    universalDb,
    `SELECT * FROM email_templates ${whereClause} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
    [...params, limit, offset]
  );

  return {
    templates: templates.map((t) => ({
      ...t,
      type: t.type as EmailTemplateType,
      variables: JSON.parse(t.variables),
      is_active: Boolean(t.is_active),
    })),
    total,
  };
}

// Get single email template
export async function getEmailTemplate(templateId: string): Promise<EmailTemplate | null> {
  await ensureEmailTables();
  const universalDb = getUniversalDb();

  const template = await queryOne<{
    id: string;
    name: string;
    type: string;
    subject: string;
    html_body: string;
    text_body: string | null;
    variables: string;
    is_active: number;
    created_at: string;
    updated_at: string | null;
  }>(universalDb, 'SELECT * FROM email_templates WHERE id = ?', [templateId]);

  if (!template) return null;

  return {
    ...template,
    type: template.type as EmailTemplateType,
    variables: JSON.parse(template.variables),
    is_active: Boolean(template.is_active),
  };
}

// Create email template
export async function createEmailTemplate(data: {
  name: string;
  type: EmailTemplateType;
  subject: string;
  html_body: string;
  text_body?: string;
  variables?: string[];
}): Promise<string> {
  await ensureEmailTables();
  const universalDb = getUniversalDb();

  const id = 'tmpl_' + crypto.randomUUID().replace(/-/g, '').substring(0, 12);

  await execute(
    universalDb,
    `INSERT INTO email_templates (id, name, type, subject, html_body, text_body, variables, is_active, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, 1, CURRENT_TIMESTAMP)`,
    [
      id,
      data.name,
      data.type,
      data.subject,
      data.html_body,
      data.text_body || null,
      JSON.stringify(data.variables || []),
    ]
  );

  return id;
}

// Update email template
export async function updateEmailTemplate(
  templateId: string,
  data: {
    name?: string;
    type?: EmailTemplateType;
    subject?: string;
    html_body?: string;
    text_body?: string;
    variables?: string[];
    is_active?: boolean;
  }
): Promise<void> {
  const universalDb = getUniversalDb();
  const updates: string[] = [];
  const values: (string | number | null)[] = [];

  if (data.name !== undefined) {
    updates.push('name = ?');
    values.push(data.name);
  }
  if (data.type !== undefined) {
    updates.push('type = ?');
    values.push(data.type);
  }
  if (data.subject !== undefined) {
    updates.push('subject = ?');
    values.push(data.subject);
  }
  if (data.html_body !== undefined) {
    updates.push('html_body = ?');
    values.push(data.html_body);
  }
  if (data.text_body !== undefined) {
    updates.push('text_body = ?');
    values.push(data.text_body || null);
  }
  if (data.variables !== undefined) {
    updates.push('variables = ?');
    values.push(JSON.stringify(data.variables));
  }
  if (data.is_active !== undefined) {
    updates.push('is_active = ?');
    values.push(data.is_active ? 1 : 0);
  }

  if (updates.length === 0) return;

  updates.push('updated_at = CURRENT_TIMESTAMP');
  values.push(templateId);

  await execute(universalDb, `UPDATE email_templates SET ${updates.join(', ')} WHERE id = ?`, values);
}

// Delete email template
export async function deleteEmailTemplate(templateId: string): Promise<void> {
  const universalDb = getUniversalDb();
  await execute(universalDb, 'DELETE FROM email_templates WHERE id = ?', [templateId]);
}

// Get email logs
export async function getEmailLogs(
  options: { status?: EmailStatus; search?: string; limit?: number; offset?: number } = {}
): Promise<{ logs: EmailLog[]; total: number }> {
  await ensureEmailTables();
  const universalDb = getUniversalDb();

  const { status, search, limit = 100, offset = 0 } = options;

  const conditions: string[] = [];
  const params: (string | number)[] = [];

  if (status) {
    conditions.push('status = ?');
    params.push(status);
  }
  if (search) {
    conditions.push('(recipient_email LIKE ? OR recipient_name LIKE ? OR subject LIKE ?)');
    params.push(`%${search}%`, `%${search}%`, `%${search}%`);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  const countResult = await queryOne<{ count: number }>(
    universalDb,
    `SELECT COUNT(*) as count FROM email_logs ${whereClause}`,
    params
  );
  const total = countResult?.count || 0;

  const logs = await query<{
    id: string;
    template_id: string | null;
    template_name: string | null;
    recipient_email: string;
    recipient_name: string | null;
    subject: string;
    status: string;
    sent_at: string | null;
    delivered_at: string | null;
    opened_at: string | null;
    clicked_at: string | null;
    bounced_at: string | null;
    error_message: string | null;
    metadata: string;
    created_at: string;
  }>(
    universalDb,
    `SELECT * FROM email_logs ${whereClause} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
    [...params, limit, offset]
  );

  return {
    logs: logs.map((l) => ({
      ...l,
      status: l.status as EmailStatus,
      metadata: JSON.parse(l.metadata),
    })),
    total,
  };
}

// Create email log (for tracking sent emails)
export async function createEmailLog(data: {
  template_id?: string;
  template_name?: string;
  recipient_email: string;
  recipient_name?: string;
  subject: string;
  status?: EmailStatus;
  metadata?: Record<string, unknown>;
}): Promise<string> {
  await ensureEmailTables();
  const universalDb = getUniversalDb();

  const id = 'email_' + crypto.randomUUID().replace(/-/g, '').substring(0, 12);

  await execute(
    universalDb,
    `INSERT INTO email_logs (id, template_id, template_name, recipient_email, recipient_name, subject, status, metadata, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
    [
      id,
      data.template_id || null,
      data.template_name || null,
      data.recipient_email,
      data.recipient_name || null,
      data.subject,
      data.status || 'pending',
      JSON.stringify(data.metadata || {}),
    ]
  );

  return id;
}

// Update email log status
export async function updateEmailLogStatus(
  logId: string,
  status: EmailStatus,
  errorMessage?: string
): Promise<void> {
  const universalDb = getUniversalDb();

  const statusField = status === 'sent' ? 'sent_at' :
                     status === 'delivered' ? 'delivered_at' :
                     status === 'bounced' ? 'bounced_at' : null;

  if (statusField) {
    await execute(
      universalDb,
      `UPDATE email_logs SET status = ?, ${statusField} = CURRENT_TIMESTAMP, error_message = ? WHERE id = ?`,
      [status, errorMessage || null, logId]
    );
  } else {
    await execute(
      universalDb,
      'UPDATE email_logs SET status = ?, error_message = ? WHERE id = ?',
      [status, errorMessage || null, logId]
    );
  }
}

// Mark email as opened
export async function markEmailOpened(logId: string): Promise<void> {
  const universalDb = getUniversalDb();
  await execute(
    universalDb,
    'UPDATE email_logs SET opened_at = CURRENT_TIMESTAMP WHERE id = ? AND opened_at IS NULL',
    [logId]
  );
}

// Mark email as clicked
export async function markEmailClicked(logId: string): Promise<void> {
  const universalDb = getUniversalDb();
  await execute(
    universalDb,
    'UPDATE email_logs SET clicked_at = CURRENT_TIMESTAMP WHERE id = ? AND clicked_at IS NULL',
    [logId]
  );
}

// Get email stats
export async function getEmailStats(): Promise<EmailStats> {
  await ensureEmailTables();
  const universalDb = getUniversalDb();

  const statusCounts = await query<{ status: string; count: number }>(
    universalDb,
    'SELECT status, COUNT(*) as count FROM email_logs GROUP BY status'
  );

  const statusMap: Record<string, number> = {
    pending: 0,
    sent: 0,
    delivered: 0,
    bounced: 0,
    failed: 0,
  };
  for (const s of statusCounts) {
    statusMap[s.status] = s.count;
  }

  const sent24h = await queryOne<{ count: number }>(
    universalDb,
    "SELECT COUNT(*) as count FROM email_logs WHERE created_at >= datetime('now', '-1 day')"
  );

  const sent7d = await queryOne<{ count: number }>(
    universalDb,
    "SELECT COUNT(*) as count FROM email_logs WHERE created_at >= datetime('now', '-7 days')"
  );

  const sent30d = await queryOne<{ count: number }>(
    universalDb,
    "SELECT COUNT(*) as count FROM email_logs WHERE created_at >= datetime('now', '-30 days')"
  );

  const totalSent = statusMap.sent + statusMap.delivered + statusMap.bounced;
  const opened = await queryOne<{ count: number }>(
    universalDb,
    'SELECT COUNT(*) as count FROM email_logs WHERE opened_at IS NOT NULL'
  );
  const clicked = await queryOne<{ count: number }>(
    universalDb,
    'SELECT COUNT(*) as count FROM email_logs WHERE clicked_at IS NOT NULL'
  );

  const openRate = totalSent > 0 ? Math.round((opened?.count || 0) / totalSent * 100) : 0;
  const clickRate = totalSent > 0 ? Math.round((clicked?.count || 0) / totalSent * 100) : 0;

  return {
    total_sent: totalSent,
    delivered: statusMap.delivered,
    bounced: statusMap.bounced,
    failed: statusMap.failed,
    pending: statusMap.pending,
    open_rate: openRate,
    click_rate: clickRate,
    sent_24h: sent24h?.count || 0,
    sent_7d: sent7d?.count || 0,
    sent_30d: sent30d?.count || 0,
  };
}

// Get email template stats
export async function getEmailTemplateStats(): Promise<EmailTemplateStats> {
  await seedDefaultEmailTemplates();
  const universalDb = getUniversalDb();

  const total = await queryOne<{ count: number }>(
    universalDb,
    'SELECT COUNT(*) as count FROM email_templates'
  );

  const active = await queryOne<{ count: number }>(
    universalDb,
    'SELECT COUNT(*) as count FROM email_templates WHERE is_active = 1'
  );

  const byType = await query<{ type: string; count: number }>(
    universalDb,
    'SELECT type, COUNT(*) as count FROM email_templates GROUP BY type'
  );

  const typeMap: Record<string, number> = {
    welcome: 0,
    password_reset: 0,
    verification: 0,
    notification: 0,
    marketing: 0,
    transactional: 0,
  };

  for (const t of byType) {
    typeMap[t.type] = t.count;
  }

  return {
    total_templates: total?.count || 0,
    active_templates: active?.count || 0,
    by_type: typeMap as Record<EmailTemplateType, number>,
  };
}

// Send test email (for preview purposes)
export async function sendTestEmail(
  templateId: string,
  recipientEmail: string,
  variables: Record<string, string>
): Promise<{ success: boolean; message: string }> {
  const template = await getEmailTemplate(templateId);
  if (!template) {
    return { success: false, message: 'Template not found' };
  }

  // Replace variables in subject and body
  let subject = template.subject;
  let htmlBody = template.html_body;
  let textBody = template.text_body || '';

  for (const [key, value] of Object.entries(variables)) {
    const placeholder = `{{${key}}}`;
    subject = subject.replace(new RegExp(placeholder, 'g'), value);
    htmlBody = htmlBody.replace(new RegExp(placeholder, 'g'), value);
    textBody = textBody.replace(new RegExp(placeholder, 'g'), value);
  }

  // Create log entry
  const logId = await createEmailLog({
    template_id: template.id,
    template_name: template.name,
    recipient_email: recipientEmail,
    subject,
    status: 'pending',
    metadata: { test: true, variables },
  });

  // In a real implementation, this would send the email via an email provider
  // For now, we'll just mark it as sent
  await updateEmailLogStatus(logId, 'sent');

  return { success: true, message: `Test email logged with ID: ${logId}` };
}
