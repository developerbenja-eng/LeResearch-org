import { createClient, type Client } from '@libsql/client/web';
import { drizzle } from 'drizzle-orm/libsql';
import * as schema from './schema';

type DrizzleDb = ReturnType<typeof drizzle<typeof schema>>;

let _client: Client | null = null;
let _db: DrizzleDb | null = null;

/**
 * Returns the singleton libSQL client bound to the identity Turso DB.
 * Reads TURSO_IDENTITY_DB_URL + TURSO_IDENTITY_DB_TOKEN at first access.
 */
export function getIdentityClient(): Client {
  if (_client) return _client;
  const url = process.env.TURSO_IDENTITY_DB_URL;
  const authToken = process.env.TURSO_IDENTITY_DB_TOKEN;
  if (!url) throw new Error('Missing TURSO_IDENTITY_DB_URL');
  if (!authToken) throw new Error('Missing TURSO_IDENTITY_DB_TOKEN');
  _client = createClient({ url, authToken });
  return _client;
}

export function getIdentityDb(): DrizzleDb {
  if (_db) return _db;
  _db = drizzle(getIdentityClient(), { schema });
  return _db;
}

export type IdentityDb = DrizzleDb;
export { schema };
