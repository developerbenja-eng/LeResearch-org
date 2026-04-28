import { createClient, Client } from '@libsql/client';

// Lazy initialization - clients are created on first access
let _universalDb: Client | null = null;
let _booksDb: Client | null = null;
let _researchDb: Client | null = null;
let _sophiaDb: Client | null = null;

// Universal/Users Database
export function getUniversalDb(): Client {
  if (!_universalDb) {
    const url = process.env.TURSO_UNIVERSAL_DB_URL;
    const authToken = process.env.TURSO_UNIVERSAL_DB_TOKEN;

    if (!url || !authToken) {
      throw new Error('Missing TURSO_UNIVERSAL_DB_URL or TURSO_UNIVERSAL_DB_TOKEN environment variables');
    }

    _universalDb = createClient({ url, authToken });
  }
  return _universalDb;
}

// Children Books Database
export function getBooksDb(): Client {
  if (!_booksDb) {
    const url = process.env.TURSO_CHILDREN_BOOKS_DB_URL;
    const authToken = process.env.TURSO_CHILDREN_BOOKS_DB_TOKEN;

    if (!url || !authToken) {
      throw new Error('Missing TURSO_CHILDREN_BOOKS_DB_URL or TURSO_CHILDREN_BOOKS_DB_TOKEN environment variables');
    }

    _booksDb = createClient({ url, authToken });
  }
  return _booksDb;
}

// Research Database
export function getResearchDb(): Client {
  if (!_researchDb) {
    const url = process.env.TURSO_RESEARCH_DB_URL;
    const authToken = process.env.TURSO_RESEARCH_DB_TOKEN;

    if (!url || !authToken) {
      throw new Error('Missing TURSO_RESEARCH_DB_URL or TURSO_RESEARCH_DB_TOKEN environment variables');
    }

    _researchDb = createClient({ url, authToken });
  }
  return _researchDb;
}

// SOPHIA Database - Philosophical Video Learning Platform
export function getSophiaDb(): Client {
  if (!_sophiaDb) {
    const url = process.env.TURSO_SOPHIA_DB_URL;
    const authToken = process.env.TURSO_SOPHIA_DB_TOKEN;

    if (!url || !authToken) {
      throw new Error('Missing TURSO_SOPHIA_DB_URL or TURSO_SOPHIA_DB_TOKEN environment variables');
    }

    _sophiaDb = createClient({ url, authToken });
  }
  return _sophiaDb;
}

// Helper function to get database by name
export function getDb(dbName: 'universal' | 'books' | 'research' | 'sophia'): Client {
  switch (dbName) {
    case 'universal':
      return getUniversalDb();
    case 'books':
      return getBooksDb();
    case 'research':
      return getResearchDb();
    case 'sophia':
      return getSophiaDb();
    default:
      throw new Error(`Unknown database: ${dbName}`);
  }
}

// Type-safe query helper
export async function query<T>(
  db: Client,
  sql: string,
  args: (string | number | null | boolean)[] = []
): Promise<T[]> {
  const result = await db.execute({ sql, args });
  return result.rows as T[];
}

// Single row query helper
export async function queryOne<T>(
  db: Client,
  sql: string,
  args: (string | number | null | boolean)[] = []
): Promise<T | null> {
  const rows = await query<T>(db, sql, args);
  return rows[0] || null;
}

// Execute mutation (insert, update, delete)
export async function execute(
  db: Client,
  sql: string,
  args: (string | number | null | boolean)[] = []
) {
  return await db.execute({ sql, args });
}
