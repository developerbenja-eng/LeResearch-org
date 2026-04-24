import { getUniversalDb, execute } from '@/lib/db/turso';

/**
 * Run migrations for the Producer Studio projects feature.
 * Called lazily from the producer API routes.
 */
export async function runProducerMigrations() {
  const db = getUniversalDb();

  await execute(
    db,
    `CREATE TABLE IF NOT EXISTS producer_projects (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      name TEXT NOT NULL,
      data TEXT NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    )`
  );

  await execute(
    db,
    `CREATE INDEX IF NOT EXISTS idx_producer_projects_user
      ON producer_projects(user_id)`
  );

  await execute(
    db,
    `CREATE TABLE IF NOT EXISTS producer_shares (
      id TEXT PRIMARY KEY,
      project_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      share_code TEXT UNIQUE NOT NULL,
      is_active INTEGER DEFAULT 1,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (project_id) REFERENCES producer_projects(id) ON DELETE CASCADE
    )`
  );

  await execute(
    db,
    `CREATE INDEX IF NOT EXISTS idx_producer_shares_code
      ON producer_shares(share_code)`
  );

  // Collaboration sessions table
  await execute(
    db,
    `CREATE TABLE IF NOT EXISTS producer_collab_sessions (
      id TEXT PRIMARY KEY,
      project_id TEXT NOT NULL,
      created_by TEXT NOT NULL,
      is_active INTEGER DEFAULT 1,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (project_id) REFERENCES producer_projects(id) ON DELETE CASCADE
    )`
  );

  // Collaboration operations log (for polling-based sync)
  await execute(
    db,
    `CREATE TABLE IF NOT EXISTS producer_collab_ops (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      session_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      operation TEXT NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (session_id) REFERENCES producer_collab_sessions(id) ON DELETE CASCADE
    )`
  );

  await execute(
    db,
    `CREATE INDEX IF NOT EXISTS idx_collab_ops_session
      ON producer_collab_ops(session_id, id)`
  );
}
