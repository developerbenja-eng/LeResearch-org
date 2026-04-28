import { getBooksDb, query, queryOne } from './turso';
import { Song, Album, AlbumWithSongs } from '@/types/song';

interface BookWithSongStats {
  id: string;
  user_id: string;
  title: string;
  cover_image_url: string | null;
  theme: string | null;
  created_at: string;
  song_count: number;
  total_duration: number;
}

/**
 * Get all albums (books with songs) for a user
 */
export async function getUserAlbums(userId: string): Promise<Album[]> {
  const db = getBooksDb();

  // Get books that have songs - use NULL for theme if column doesn't exist
  const albums = await query<BookWithSongStats>(
    db,
    `SELECT
      b.id,
      b.user_id,
      b.title,
      b.cover_image_url,
      NULL as theme,
      b.created_at,
      COUNT(bs.id) as song_count,
      COALESCE(SUM(bs.duration), 0) as total_duration
    FROM books b
    INNER JOIN book_songs bs ON b.id = bs.book_id
    WHERE b.user_id = ?
    GROUP BY b.id
    ORDER BY b.created_at DESC`,
    [userId]
  );

  return albums;
}

// ==========================================
// STUDIO COLLECTION (shared albums for admins)
// ==========================================

/** Curated album titles from Echo Writer available to all admins */
export const STUDIO_COLLECTION_TITLES = ['Amor Fati', 'The Report'];

/**
 * Get the shared studio collection albums (Echo Writer originals).
 * These are available to all admin users regardless of who created them.
 */
export async function getStudioCollectionAlbums(): Promise<Album[]> {
  const db = getBooksDb();

  const placeholders = STUDIO_COLLECTION_TITLES.map(() => '?').join(', ');

  const albums = await query<BookWithSongStats>(
    db,
    `SELECT
      b.id,
      b.user_id,
      b.title,
      b.cover_image_url,
      NULL as theme,
      b.created_at,
      COUNT(bs.id) as song_count,
      COALESCE(SUM(bs.duration), 0) as total_duration
    FROM books b
    INNER JOIN book_songs bs ON b.id = bs.book_id
    WHERE b.title IN (${placeholders})
    GROUP BY b.id
    HAVING song_count > 0
    ORDER BY b.title ASC`,
    STUDIO_COLLECTION_TITLES
  );

  return albums;
}

/**
 * Get a single album with all its songs
 */
export async function getAlbumWithSongs(
  albumId: string,
  userId?: string
): Promise<AlbumWithSongs | null> {
  const db = getBooksDb();

  // Get album (book) info
  let bookQuery = 'SELECT * FROM books WHERE id = ?';
  const args: string[] = [albumId];

  if (userId) {
    bookQuery += ' AND user_id = ?';
    args.push(userId);
  }

  const book = await queryOne<{
    id: string;
    user_id: string;
    title: string;
    cover_image_url: string | null;
    theme: string;
    created_at: string;
  }>(db, bookQuery, args);

  if (!book) {
    return null;
  }

  // Get songs for this album
  const songs = await query<Song>(
    db,
    `SELECT * FROM book_songs
     WHERE book_id = ?
     ORDER BY is_main DESC, created_at ASC`,
    [albumId]
  );

  const totalDuration = songs.reduce((acc, song) => acc + (song.duration || 0), 0);

  return {
    id: book.id,
    user_id: book.user_id,
    title: book.title,
    cover_image_url: book.cover_image_url,
    theme: book.theme,
    created_at: book.created_at,
    song_count: songs.length,
    total_duration: totalDuration,
    songs,
  };
}

/**
 * Get all songs for a user (both book songs and standalone)
 */
export async function getUserSongs(userId: string): Promise<Song[]> {
  const db = getBooksDb();

  const songs = await query<Song>(
    db,
    `SELECT bs.* FROM book_songs bs
     LEFT JOIN books b ON bs.book_id = b.id AND bs.book_id != '__standalone__'
     WHERE b.user_id = ? OR bs.user_id = ?
     ORDER BY bs.created_at DESC`,
    [userId, userId]
  );

  return songs;
}

/**
 * Get music library statistics
 */
export async function getMusicStats(
  userId: string
): Promise<{ albumCount: number; songCount: number; totalDuration: number }> {
  const db = getBooksDb();

  const stats = await queryOne<{
    album_count: number;
    song_count: number;
    total_duration: number;
  }>(
    db,
    `SELECT
      COUNT(DISTINCT CASE WHEN bs.book_id != '__standalone__' THEN b.id END) as album_count,
      COUNT(bs.id) as song_count,
      COALESCE(SUM(bs.duration), 0) as total_duration
    FROM book_songs bs
    LEFT JOIN books b ON bs.book_id = b.id AND bs.book_id != '__standalone__'
    WHERE b.user_id = ? OR bs.user_id = ?`,
    [userId, userId]
  );

  return {
    albumCount: stats?.album_count || 0,
    songCount: stats?.song_count || 0,
    totalDuration: stats?.total_duration || 0,
  };
}

// ==========================================
// SONG MANAGEMENT
// ==========================================

interface SongWithOwnership extends Song {
  user_id: string;
  book_title: string;
}

/**
 * Get a song with ownership information
 */
export async function getSongWithOwnership(
  songId: string
): Promise<SongWithOwnership | null> {
  const db = getBooksDb();

  const song = await queryOne<SongWithOwnership>(
    db,
    `SELECT bs.*,
       COALESCE(bs.user_id, b.user_id) as user_id,
       COALESCE(b.title, bs.source_topic_title, 'Standalone') as book_title
     FROM book_songs bs
     LEFT JOIN books b ON bs.book_id = b.id AND bs.book_id != '__standalone__'
     WHERE bs.id = ?`,
    [songId]
  );

  return song;
}

/**
 * Delete a song and all related data
 */
export async function deleteSong(songId: string, userId: string): Promise<void> {
  const db = getBooksDb();

  // Delete from playlist_songs (if table exists)
  try {
    await query(
      db,
      `DELETE FROM playlist_songs WHERE song_id = ?`,
      [songId]
    );
  } catch {
    // Table may not exist, continue
  }

  // Delete from liked_songs (if table exists)
  try {
    await query(
      db,
      `DELETE FROM liked_songs WHERE song_id = ?`,
      [songId]
    );
  } catch {
    // Table may not exist, continue
  }

  // Delete the song
  await query(
    db,
    `DELETE FROM book_songs WHERE id = ?`,
    [songId]
  );
}

// ==========================================
// FAVORITES / LIKED SONGS
// ==========================================

/**
 * Toggle like status for a song
 */
export async function toggleSongLike(
  userId: string,
  songId: string,
  action: 'like' | 'unlike'
): Promise<void> {
  const db = getBooksDb();

  if (action === 'like') {
    // Get song details
    const song = await getSongWithOwnership(songId);
    if (!song) throw new Error('Song not found');

    const likeId = `like_${Date.now()}_${Math.random().toString(36).substring(7)}`;

    await query(
      db,
      `INSERT INTO liked_songs (id, user_id, song_id, book_id, book_title, song_url, song_name, duration, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
       ON CONFLICT(user_id, song_id) DO NOTHING`,
      [likeId, userId, songId, song.book_id, song.book_title, song.song_url, song.song_name, song.duration]
    );
  } else {
    await query(
      db,
      `DELETE FROM liked_songs WHERE user_id = ? AND song_id = ?`,
      [userId, songId]
    );
  }
}

/**
 * Check if a song is liked by the user
 */
export async function isSongLiked(userId: string, songId: string): Promise<boolean> {
  const db = getBooksDb();

  const result = await queryOne<{ count: number }>(
    db,
    `SELECT COUNT(*) as count FROM liked_songs WHERE user_id = ? AND song_id = ?`,
    [userId, songId]
  );

  return (result?.count || 0) > 0;
}

/**
 * Get all liked songs for a user
 */
export async function getLikedSongs(userId: string): Promise<Song[]> {
  const db = getBooksDb();

  const songs = await query<Song>(
    db,
    `SELECT bs.* FROM book_songs bs
     INNER JOIN liked_songs ls ON bs.id = ls.song_id
     WHERE ls.user_id = ?
     ORDER BY ls.created_at DESC`,
    [userId]
  );

  return songs;
}
