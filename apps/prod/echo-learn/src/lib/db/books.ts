import { getBooksDb, query, queryOne } from './turso';
import { Book, BookPage, BookWithPages, BookWithCharacters } from '@/types';
import { Character } from '@/types/character';

/**
 * Get a book with all its pages
 */
export async function getBookWithPages(
  bookId: string,
  userId?: string
): Promise<BookWithPages | null> {
  const db = getBooksDb();

  // If userId provided, check ownership
  let book: Book | null;
  if (userId) {
    book = await queryOne<Book>(
      db,
      'SELECT * FROM books WHERE id = ? AND user_id = ?',
      [bookId, userId]
    );
  } else {
    // Public access - check if book is shareable or sample
    book = await queryOne<Book>(
      db,
      'SELECT * FROM books WHERE id = ?',
      [bookId]
    );
  }

  if (!book) {
    return null;
  }

  const pages = await query<BookPage>(
    db,
    'SELECT * FROM book_pages WHERE book_id = ? ORDER BY page_number',
    [bookId]
  );

  return {
    ...book,
    pages,
  };
}

/**
 * Get a book with its characters
 */
export async function getBookWithCharacters(
  bookId: string,
  userId?: string
): Promise<BookWithCharacters | null> {
  const db = getBooksDb();

  let book: Book | null;
  if (userId) {
    book = await queryOne<Book>(
      db,
      'SELECT * FROM books WHERE id = ? AND user_id = ?',
      [bookId, userId]
    );
  } else {
    book = await queryOne<Book>(
      db,
      'SELECT * FROM books WHERE id = ?',
      [bookId]
    );
  }

  if (!book) {
    return null;
  }

  const characters = await query<Character>(
    db,
    `SELECT c.* FROM characters c
     JOIN book_characters bc ON c.id = bc.character_id
     WHERE bc.book_id = ?`,
    [bookId]
  );

  return {
    ...book,
    characters,
  };
}

/**
 * Get user's books for library display
 */
export async function getUserBooks(
  userId: string,
  options: {
    status?: Book['status'];
    limit?: number;
    offset?: number;
  } = {}
): Promise<{ books: Book[]; total: number }> {
  const db = getBooksDb();
  const { status, limit = 20, offset = 0 } = options;

  let sql = 'SELECT * FROM books WHERE user_id = ?';
  const args: (string | number)[] = [userId];

  if (status) {
    sql += ' AND status = ?';
    args.push(status);
  }

  sql += ' ORDER BY updated_at DESC LIMIT ? OFFSET ?';
  args.push(limit, offset);

  const books = await query<Book>(db, sql, args);

  // Get total count
  let countSql = 'SELECT COUNT(*) as count FROM books WHERE user_id = ?';
  const countArgs: (string | number)[] = [userId];

  if (status) {
    countSql += ' AND status = ?';
    countArgs.push(status);
  }

  const countResult = await queryOne<{ count: number }>(db, countSql, countArgs);
  const total = countResult?.count || 0;

  return { books, total };
}

/**
 * Get a single book page
 */
export async function getBookPage(
  bookId: string,
  pageNumber: number
): Promise<BookPage | null> {
  const db = getBooksDb();

  return queryOne<BookPage>(
    db,
    'SELECT * FROM book_pages WHERE book_id = ? AND page_number = ?',
    [bookId, pageNumber]
  );
}

/**
 * Get sample/featured books for non-authenticated users
 */
export async function getSampleBooks(limit: number = 6): Promise<Book[]> {
  const db = getBooksDb();

  // Get featured/sample books (books marked for showcase)
  const books = await query<Book>(
    db,
    `SELECT * FROM books
     WHERE status = 'complete'
     ORDER BY created_at DESC
     LIMIT ?`,
    [limit]
  );

  return books;
}
