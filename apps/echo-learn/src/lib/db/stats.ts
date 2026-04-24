import { getBooksDb, getResearchDb, query, queryOne } from './turso';

interface UserStats {
  booksCount: number;
  charactersCount: number;
  songsCount: number;
  albumsCount: number;
}

/**
 * Fetch user's content stats in parallel
 * This runs on the server - no client-side fetching needed
 */
export async function getUserStats(userId: string): Promise<UserStats> {
  const db = getBooksDb();

  // Execute all queries in parallel
  const [booksResult, charactersResult, albumsResult, songsResult] = await Promise.all([
    queryOne<{ count: number }>(db, 'SELECT COUNT(*) as count FROM books WHERE user_id = ?', [
      userId,
    ]),
    queryOne<{ count: number }>(
      db,
      'SELECT COUNT(*) as count FROM characters WHERE user_id = ?',
      [userId]
    ),
    queryOne<{ count: number }>(db, 'SELECT COUNT(*) as count FROM albums WHERE user_id = ?', [
      userId,
    ]).catch(() => ({ count: 0 })), // Gracefully handle if table doesn't exist
    queryOne<{ count: number }>(db, 'SELECT COUNT(*) as count FROM songs WHERE user_id = ?', [
      userId,
    ]).catch(() => ({ count: 0 })), // Gracefully handle if table doesn't exist
  ]);

  return {
    booksCount: booksResult?.count || 0,
    charactersCount: charactersResult?.count || 0,
    albumsCount: albumsResult?.count || 0,
    songsCount: songsResult?.count || 0,
  };
}

/**
 * Get recent books for a user
 */
export async function getRecentBooks(userId: string, limit: number = 4) {
  const db = getBooksDb();

  const books = await query<{
    id: string;
    title: string;
    cover_image_url: string | null;
    status: string;
    created_at: string;
  }>(
    db,
    `SELECT id, title, cover_image_url, status, created_at
     FROM books WHERE user_id = ?
     ORDER BY created_at DESC LIMIT ?`,
    [userId, limit]
  );

  return books;
}

/**
 * Get recent characters for a user
 */
export async function getRecentCharacters(userId: string, limit: number = 6) {
  const db = getBooksDb();

  const characters = await query<{
    id: string;
    name: string;
    avatar_url: string | null;
    species: string;
    created_at: string;
  }>(
    db,
    `SELECT id, name, avatar_url, species, created_at
     FROM characters WHERE user_id = ?
     ORDER BY created_at DESC LIMIT ?`,
    [userId, limit]
  );

  return characters;
}

/**
 * Get topics count from research database
 */
export async function getTopicsCount(): Promise<number> {
  const db = getResearchDb();

  const result = await queryOne<{ count: number }>(
    db,
    "SELECT COUNT(*) as count FROM parenting_topics WHERE status = 'active'"
  );

  return result?.count || 0;
}
