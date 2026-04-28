import { getBooksDb } from './turso';
import type { InValue } from '@libsql/client';
import type {
  CommunityPost,
  CommunityComment,
  CommunityProfile,
  PostCategory,
  PostType,
  SortOption,
  ProfileWithStats,
  RecentPost,
  ReportReason,
} from '@/types/community';
import { getLevelTitle } from '@/types/community';

// Helper to safely extract values from Turso responses
function getValue(val: unknown): unknown {
  if (val === null || val === undefined) return null;
  if (typeof val === 'object' && val !== null && 'value' in val) {
    return (val as { value: unknown }).value;
  }
  return val;
}

// Get community posts with filtering and pagination
export async function getCommunityPosts(options: {
  sort?: SortOption;
  category?: PostCategory;
  postType?: PostType;
  userId?: string;
  search?: string;
  limit?: number;
  offset?: number;
  currentUserId?: string;
}): Promise<{
  posts: CommunityPost[];
  total: number;
  hasMore: boolean;
}> {
  const db = getBooksDb();
  const {
    sort = 'hot',
    category,
    postType,
    userId,
    search,
    limit = 20,
    offset = 0,
    currentUserId,
  } = options;

  // Build WHERE clause
  const conditions = ["status = 'active'"];
  const params: InValue[] = [];

  if (category) {
    conditions.push('category = ?');
    params.push(category);
  }

  if (postType) {
    conditions.push('post_type = ?');
    params.push(postType);
  }

  if (userId) {
    conditions.push('user_id = ?');
    params.push(userId);
  }

  if (search) {
    conditions.push('(title LIKE ? OR content LIKE ?)');
    params.push(`%${search}%`, `%${search}%`);
  }

  const whereClause = conditions.join(' AND ');

  // Build ORDER BY based on sort
  let orderBy: string;
  switch (sort) {
    case 'new':
      orderBy = 'created_at DESC';
      break;
    case 'top':
      orderBy = 'upvotes DESC, created_at DESC';
      break;
    case 'hot':
    default:
      // Hot = combination of recency and engagement
      orderBy = `(upvotes - downvotes) * 1.0 / (1 + ((julianday('now') - julianday(created_at)) * 24)) DESC, created_at DESC`;
      break;
  }

  // Get posts
  const query = `
    SELECT * FROM community_posts
    WHERE ${whereClause}
    ORDER BY ${orderBy}
    LIMIT ? OFFSET ?
  `;

  const result = await db.execute({
    sql: query,
    args: [...params, limit, offset],
  });

  const posts = (result.rows || []).map((row) => parsePostRow(row));

  // Get user votes if authenticated
  if (currentUserId && posts.length > 0) {
    const postIds = posts.map((p) => p.id);
    const placeholders = postIds.map(() => '?').join(',');
    const votesResult = await db.execute({
      sql: `SELECT target_id, vote_type FROM community_votes
            WHERE user_id = ? AND target_type = 'post' AND target_id IN (${placeholders})`,
      args: [currentUserId, ...postIds],
    });

    const votesMap: Record<string, number> = {};
    (votesResult.rows || []).forEach((row) => {
      const targetId = getValue(row[0]) as string;
      const voteType = getValue(row[1]) as number;
      votesMap[targetId] = voteType;
    });

    posts.forEach((post) => {
      post.user_vote = votesMap[post.id] || 0;
    });
  }

  // Get total count
  const countResult = await db.execute({
    sql: `SELECT COUNT(*) FROM community_posts WHERE ${whereClause}`,
    args: params,
  });

  const total = (getValue(countResult.rows?.[0]?.[0]) as number) || 0;

  return {
    posts,
    total,
    hasMore: offset + posts.length < total,
  };
}

// Get single post by ID
export async function getPostById(
  postId: string,
  currentUserId?: string
): Promise<CommunityPost | null> {
  const db = getBooksDb();

  const result = await db.execute({
    sql: `SELECT * FROM community_posts WHERE id = ? AND status = 'active'`,
    args: [postId],
  });

  if (!result.rows || result.rows.length === 0) {
    return null;
  }

  // Increment view count
  await db.execute({
    sql: `UPDATE community_posts SET view_count = view_count + 1 WHERE id = ?`,
    args: [postId],
  });

  const post = parsePostRow(result.rows[0]);

  // Get user vote
  if (currentUserId) {
    const voteResult = await db.execute({
      sql: `SELECT vote_type FROM community_votes WHERE user_id = ? AND target_type = 'post' AND target_id = ?`,
      args: [currentUserId, postId],
    });
    if (voteResult.rows && voteResult.rows.length > 0) {
      post.user_vote = getValue(voteResult.rows[0][0]) as number;
    }
  }

  return post;
}

// Get comments for a post
export async function getPostComments(
  postId: string,
  currentUserId?: string
): Promise<CommunityComment[]> {
  const db = getBooksDb();

  const result = await db.execute({
    sql: `SELECT * FROM community_comments
          WHERE post_id = ? AND status = 'active'
          ORDER BY created_at ASC`,
    args: [postId],
  });

  const comments = (result.rows || []).map((row) => parseCommentRow(row));

  // Get user votes
  if (currentUserId && comments.length > 0) {
    const commentIds = comments.map((c) => c.id);
    const placeholders = commentIds.map(() => '?').join(',');
    const votesResult = await db.execute({
      sql: `SELECT target_id, vote_type FROM community_votes
            WHERE user_id = ? AND target_type = 'comment' AND target_id IN (${placeholders})`,
      args: [currentUserId, ...commentIds],
    });

    const votesMap: Record<string, number> = {};
    (votesResult.rows || []).forEach((row) => {
      const targetId = getValue(row[0]) as string;
      const voteType = getValue(row[1]) as number;
      votesMap[targetId] = voteType;
    });

    comments.forEach((comment) => {
      comment.user_vote = votesMap[comment.id] || 0;
    });
  }

  // Build nested tree
  return buildCommentTree(comments);
}

// Create a new post
export async function createPost(
  userId: string,
  userName: string,
  data: {
    title: string;
    content: string;
    postType?: PostType;
    category?: PostCategory;
    tags?: string[];
    mediaUrls?: string[];
  }
): Promise<CommunityPost> {
  const db = getBooksDb();

  const postId = `post_${Date.now()}_${Math.random().toString(36).substring(7)}`;
  const now = new Date().toISOString();

  await db.execute({
    sql: `INSERT INTO community_posts (
      id, user_id, title, content, post_type, category, tags, media_urls,
      author_name, created_at, updated_at, last_activity_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [
      postId,
      userId,
      data.title.trim(),
      data.content.trim(),
      data.postType || 'discussion',
      data.category || 'general',
      JSON.stringify(data.tags || []),
      JSON.stringify(data.mediaUrls || []),
      userName,
      now,
      now,
      now,
    ],
  });

  // Update user profile
  await db.execute({
    sql: `INSERT INTO community_profiles (user_id, display_name, posts_count, created_at, updated_at)
          VALUES (?, ?, 1, ?, ?)
          ON CONFLICT(user_id) DO UPDATE SET
            posts_count = posts_count + 1,
            updated_at = ?`,
    args: [userId, userName, now, now, now],
  });

  return {
    id: postId,
    user_id: userId,
    title: data.title.trim(),
    content: data.content.trim(),
    post_type: data.postType || 'discussion',
    category: data.category || 'general',
    tags: data.tags || [],
    media_urls: data.mediaUrls || [],
    upvotes: 0,
    downvotes: 0,
    comment_count: 0,
    view_count: 0,
    is_pinned: false,
    is_locked: false,
    status: 'active',
    author_name: userName,
    author_avatar: null,
    created_at: now,
    updated_at: now,
    last_activity_at: now,
    user_vote: 0,
  };
}

// Vote on a post or comment
export async function vote(
  userId: string,
  targetType: 'post' | 'comment',
  targetId: string,
  voteType: 1 | -1 | 0
): Promise<{ upvotes: number; downvotes: number; userVote: number }> {
  const db = getBooksDb();
  const table = targetType === 'post' ? 'community_posts' : 'community_comments';

  // Get existing vote
  const existingVote = await db.execute({
    sql: `SELECT vote_type FROM community_votes WHERE user_id = ? AND target_type = ? AND target_id = ?`,
    args: [userId, targetType, targetId],
  });

  const previousVote =
    existingVote.rows && existingVote.rows.length > 0
      ? (getValue(existingVote.rows[0][0]) as number)
      : 0;

  // Calculate vote deltas
  let upvoteDelta = 0;
  let downvoteDelta = 0;

  if (voteType === 0) {
    // Removing vote
    if (previousVote === 1) upvoteDelta = -1;
    if (previousVote === -1) downvoteDelta = -1;

    await db.execute({
      sql: `DELETE FROM community_votes WHERE user_id = ? AND target_type = ? AND target_id = ?`,
      args: [userId, targetType, targetId],
    });
  } else {
    if (previousVote === 0) {
      // New vote
      if (voteType === 1) upvoteDelta = 1;
      if (voteType === -1) downvoteDelta = 1;
    } else if (previousVote !== voteType) {
      // Changing vote
      if (previousVote === 1) upvoteDelta = -1;
      if (previousVote === -1) downvoteDelta = -1;
      if (voteType === 1) upvoteDelta += 1;
      if (voteType === -1) downvoteDelta += 1;
    }

    const voteId = `vote_${Date.now()}_${Math.random().toString(36).substring(7)}`;

    await db.execute({
      sql: `INSERT INTO community_votes (id, user_id, target_type, target_id, vote_type, created_at)
            VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
            ON CONFLICT(user_id, target_type, target_id) DO UPDATE SET
              vote_type = excluded.vote_type`,
      args: [voteId, userId, targetType, targetId, voteType],
    });
  }

  // Update counts
  if (upvoteDelta !== 0 || downvoteDelta !== 0) {
    await db.execute({
      sql: `UPDATE ${table} SET upvotes = upvotes + ?, downvotes = downvotes + ? WHERE id = ?`,
      args: [upvoteDelta, downvoteDelta, targetId],
    });
  }

  // Get updated counts
  const updated = await db.execute({
    sql: `SELECT upvotes, downvotes FROM ${table} WHERE id = ?`,
    args: [targetId],
  });

  return {
    upvotes: (getValue(updated.rows?.[0]?.[0]) as number) || 0,
    downvotes: (getValue(updated.rows?.[0]?.[1]) as number) || 0,
    userVote: voteType,
  };
}

// Get community stats
export async function getCommunityStats(): Promise<{
  totalPosts: number;
  totalMembers: number;
  postsToday: number;
}> {
  const db = getBooksDb();

  const [postsResult, membersResult, todayResult] = await Promise.all([
    db.execute({ sql: `SELECT COUNT(*) FROM community_posts WHERE status = 'active'`, args: [] }),
    db.execute({ sql: `SELECT COUNT(*) FROM community_profiles`, args: [] }),
    db.execute({
      sql: `SELECT COUNT(*) FROM community_posts WHERE status = 'active' AND date(created_at) = date('now')`,
      args: [],
    }),
  ]);

  return {
    totalPosts: (getValue(postsResult.rows?.[0]?.[0]) as number) || 0,
    totalMembers: (getValue(membersResult.rows?.[0]?.[0]) as number) || 0,
    postsToday: (getValue(todayResult.rows?.[0]?.[0]) as number) || 0,
  };
}

// Get user profile
export async function getCommunityProfile(userId: string): Promise<CommunityProfile | null> {
  const db = getBooksDb();

  const result = await db.execute({
    sql: `SELECT * FROM community_profiles WHERE user_id = ?`,
    args: [userId],
  });

  if (!result.rows || result.rows.length === 0) {
    return null;
  }

  const row = result.rows[0];
  return {
    user_id: getValue(row[0]) as string,
    display_name: getValue(row[1]) as string | null,
    bio: getValue(row[2]) as string | null,
    avatar_url: getValue(row[3]) as string | null,
    posts_count: (getValue(row[4]) as number) || 0,
    comments_count: (getValue(row[5]) as number) || 0,
    upvotes_received: (getValue(row[6]) as number) || 0,
    helpful_count: (getValue(row[7]) as number) || 0,
    reputation: (getValue(row[8]) as number) || 0,
    badges: JSON.parse((getValue(row[9]) as string) || '[]'),
    created_at: getValue(row[10]) as string,
  };
}

// Get profile with calculated stats and recent posts
export async function getProfileWithStats(userId: string): Promise<ProfileWithStats | null> {
  const db = getBooksDb();

  // Get base profile
  const profile = await getCommunityProfile(userId);

  if (!profile) {
    // Create a default profile if none exists
    const now = new Date().toISOString();
    await db.execute({
      sql: `INSERT OR IGNORE INTO community_profiles (user_id, badges, created_at, updated_at)
            VALUES (?, ?, ?, ?)`,
      args: [userId, JSON.stringify(['newcomer']), now, now],
    });

    // Return default profile
    return {
      user_id: userId,
      display_name: null,
      bio: null,
      avatar_url: null,
      posts_count: 0,
      comments_count: 0,
      upvotes_received: 0,
      helpful_count: 0,
      reputation: 0,
      badges: ['newcomer'],
      created_at: now,
      level: 1,
      levelProgress: 0,
      levelTitle: 'Newcomer',
      recentPosts: [],
    };
  }

  // Calculate level from reputation
  const level = Math.floor(profile.reputation / 100) + 1;
  const levelProgress = profile.reputation % 100;
  const levelTitle = getLevelTitle(level);

  // Get recent posts
  const recentPosts = await getUserRecentPosts(userId, 10);

  return {
    ...profile,
    level,
    levelProgress,
    levelTitle,
    recentPosts,
  };
}

// Get user's recent posts
export async function getUserRecentPosts(userId: string, limit: number = 10): Promise<RecentPost[]> {
  const db = getBooksDb();

  const result = await db.execute({
    sql: `SELECT id, title, post_type, category, upvotes, downvotes, comment_count, created_at
          FROM community_posts
          WHERE user_id = ? AND status = 'active'
          ORDER BY created_at DESC
          LIMIT ?`,
    args: [userId, limit],
  });

  return (result.rows || []).map((row) => ({
    id: getValue(row[0]) as string,
    title: getValue(row[1]) as string,
    post_type: getValue(row[2]) as PostType,
    category: getValue(row[3]) as PostCategory,
    upvotes: (getValue(row[4]) as number) || 0,
    downvotes: (getValue(row[5]) as number) || 0,
    comment_count: (getValue(row[6]) as number) || 0,
    created_at: getValue(row[7]) as string,
  }));
}

// Update user profile
export async function updateProfile(
  userId: string,
  data: {
    displayName?: string;
    bio?: string;
    avatarUrl?: string;
  }
): Promise<CommunityProfile> {
  const db = getBooksDb();
  const now = new Date().toISOString();

  // Upsert profile
  await db.execute({
    sql: `INSERT INTO community_profiles (user_id, display_name, bio, avatar_url, badges, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?)
          ON CONFLICT(user_id) DO UPDATE SET
            display_name = COALESCE(?, display_name),
            bio = COALESCE(?, bio),
            avatar_url = COALESCE(?, avatar_url),
            updated_at = ?`,
    args: [
      userId,
      data.displayName || null,
      data.bio || null,
      data.avatarUrl || null,
      JSON.stringify(['newcomer']),
      now,
      now,
      data.displayName ?? null,
      data.bio ?? null,
      data.avatarUrl ?? null,
      now,
    ],
  });

  const profile = await getCommunityProfile(userId);
  return profile!;
}

// Create a comment
export async function createComment(
  userId: string,
  userName: string,
  postId: string,
  content: string,
  parentCommentId?: string
): Promise<CommunityComment> {
  const db = getBooksDb();

  const commentId = `comment_${Date.now()}_${Math.random().toString(36).substring(7)}`;
  const now = new Date().toISOString();

  // Calculate depth based on parent
  let depth = 0;
  if (parentCommentId) {
    const parentResult = await db.execute({
      sql: `SELECT depth FROM community_comments WHERE id = ?`,
      args: [parentCommentId],
    });
    if (parentResult.rows && parentResult.rows.length > 0) {
      depth = ((getValue(parentResult.rows[0][0]) as number) || 0) + 1;
    }
  }

  // Check if user is the post author
  const postResult = await db.execute({
    sql: `SELECT user_id FROM community_posts WHERE id = ?`,
    args: [postId],
  });
  const postAuthorId = postResult.rows?.[0] ? (getValue(postResult.rows[0][0]) as string) : null;
  const isAuthorReply = postAuthorId === userId ? 1 : 0;

  await db.execute({
    sql: `INSERT INTO community_comments (
      id, post_id, user_id, parent_comment_id, depth, content,
      is_author_reply, author_name, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [
      commentId,
      postId,
      userId,
      parentCommentId || null,
      depth,
      content.trim(),
      isAuthorReply,
      userName,
      now,
      now,
    ],
  });

  // Update post comment count and activity
  await db.execute({
    sql: `UPDATE community_posts SET comment_count = comment_count + 1, last_activity_at = ? WHERE id = ?`,
    args: [now, postId],
  });

  // Update user profile comment count
  await db.execute({
    sql: `INSERT INTO community_profiles (user_id, display_name, comments_count, created_at, updated_at)
          VALUES (?, ?, 1, ?, ?)
          ON CONFLICT(user_id) DO UPDATE SET
            comments_count = comments_count + 1,
            updated_at = ?`,
    args: [userId, userName, now, now, now],
  });

  return {
    id: commentId,
    post_id: postId,
    user_id: userId,
    parent_comment_id: parentCommentId || null,
    depth,
    content: content.trim(),
    upvotes: 0,
    downvotes: 0,
    status: 'active',
    is_author_reply: isAuthorReply === 1,
    author_name: userName,
    author_avatar: null,
    created_at: now,
    updated_at: now,
    user_vote: 0,
  };
}

// Create a report
export async function createReport(
  reporterId: string,
  targetType: 'post' | 'comment',
  targetId: string,
  reason: ReportReason,
  details?: string
): Promise<{ success: boolean; message: string }> {
  const db = getBooksDb();

  const reportId = `report_${Date.now()}_${Math.random().toString(36).substring(7)}`;
  const now = new Date().toISOString();

  // Insert report (upsert to update if same reporter reports again)
  await db.execute({
    sql: `INSERT INTO community_reports (id, reporter_id, target_type, target_id, reason, details, created_at)
          VALUES (?, ?, ?, ?, ?, ?, ?)
          ON CONFLICT(reporter_id, target_type, target_id) DO UPDATE SET
            reason = excluded.reason,
            details = excluded.details,
            created_at = excluded.created_at`,
    args: [reportId, reporterId, targetType, targetId, reason, details || null, now],
  });

  // Check total reports for auto-flagging
  const reportCount = await db.execute({
    sql: `SELECT COUNT(*) FROM community_reports WHERE target_type = ? AND target_id = ? AND status = 'pending'`,
    args: [targetType, targetId],
  });

  const count = (getValue(reportCount.rows?.[0]?.[0]) as number) || 0;

  // Auto-flag content after 3+ reports
  if (count >= 3) {
    const table = targetType === 'post' ? 'community_posts' : 'community_comments';
    await db.execute({
      sql: `UPDATE ${table} SET status = 'flagged' WHERE id = ?`,
      args: [targetId],
    });
  }

  return {
    success: true,
    message: 'Report submitted. Thank you for helping keep our community safe.',
  };
}

// Helper to parse post row
function parsePostRow(row: Record<string, unknown> | unknown[]): CommunityPost {
  const getValue_ = (index: number) => {
    if (Array.isArray(row)) {
      return getValue(row[index]);
    }
    const keys = Object.keys(row);
    return getValue(row[keys[index]]);
  };

  return {
    id: getValue_(0) as string,
    user_id: getValue_(1) as string,
    title: getValue_(2) as string,
    content: getValue_(3) as string,
    post_type: getValue_(4) as PostType,
    category: getValue_(5) as PostCategory,
    tags: JSON.parse((getValue_(6) as string) || '[]'),
    media_urls: JSON.parse((getValue_(7) as string) || '[]'),
    upvotes: (getValue_(8) as number) || 0,
    downvotes: (getValue_(9) as number) || 0,
    comment_count: (getValue_(10) as number) || 0,
    view_count: (getValue_(11) as number) || 0,
    is_pinned: getValue_(12) === 1,
    is_locked: getValue_(13) === 1,
    status: getValue_(14) as 'active',
    author_name: (getValue_(15) as string) || 'Anonymous',
    author_avatar: getValue_(16) as string | null,
    created_at: getValue_(17) as string,
    updated_at: getValue_(18) as string,
    last_activity_at: getValue_(19) as string,
    user_vote: 0,
  };
}

// Helper to parse comment row
function parseCommentRow(row: Record<string, unknown> | unknown[]): CommunityComment {
  const getValue_ = (index: number) => {
    if (Array.isArray(row)) {
      return getValue(row[index]);
    }
    const keys = Object.keys(row);
    return getValue(row[keys[index]]);
  };

  return {
    id: getValue_(0) as string,
    post_id: getValue_(1) as string,
    user_id: getValue_(2) as string,
    parent_comment_id: getValue_(3) as string | null,
    depth: (getValue_(4) as number) || 0,
    content: getValue_(5) as string,
    upvotes: (getValue_(6) as number) || 0,
    downvotes: (getValue_(7) as number) || 0,
    status: getValue_(8) as 'active',
    is_author_reply: getValue_(9) === 1,
    author_name: (getValue_(10) as string) || 'Anonymous',
    author_avatar: getValue_(11) as string | null,
    created_at: getValue_(12) as string,
    updated_at: getValue_(13) as string,
    user_vote: 0,
  };
}

// Build nested comment tree
function buildCommentTree(comments: CommunityComment[]): CommunityComment[] {
  const map = new Map<string, CommunityComment>();
  const roots: CommunityComment[] = [];

  // First pass: create map
  comments.forEach((comment) => {
    comment.replies = [];
    map.set(comment.id, comment);
  });

  // Second pass: build tree
  comments.forEach((comment) => {
    if (comment.parent_comment_id && map.has(comment.parent_comment_id)) {
      const parent = map.get(comment.parent_comment_id)!;
      parent.replies!.push(comment);
    } else {
      roots.push(comment);
    }
  });

  return roots;
}
