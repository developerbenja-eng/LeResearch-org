/**
 * One-time: copy every existing lecivil user row into the shared
 * ledesign-identity DB and grant them `lecivil` app access. Preserves
 * the user's primary-key id so FKs in per-user DBs don't break.
 *
 * Skips rows that already exist in the identity DB (by id OR email).
 *
 *   SOURCE_DB_URL=libsql://... SOURCE_DB_TOKEN=... \
 *   TURSO_IDENTITY_DB_URL=libsql://... TURSO_IDENTITY_DB_TOKEN=... \
 *   npx tsx packages/identity/scripts/migrate-lecivil-users.ts
 */

import { createClient } from '@libsql/client';
import { randomUUID } from 'node:crypto';

const APP_ID = 'lecivil';

interface SrcUser {
  id: string;
  email: string;
  name: string | null;
  password_hash: string | null;
  avatar_url: string | null;
  role: string;
  email_verified: number | boolean | null;
  google_id: string | null;
  company: string | null;
  last_login: string | null;
  created_at: string | null;
  updated_at: string | null;
}

async function main() {
  const srcUrl = process.env.SOURCE_DB_URL;
  const srcToken = process.env.SOURCE_DB_TOKEN;
  const dstUrl = process.env.TURSO_IDENTITY_DB_URL;
  const dstToken = process.env.TURSO_IDENTITY_DB_TOKEN;
  if (!srcUrl || !srcToken) throw new Error('Missing SOURCE_DB_URL / SOURCE_DB_TOKEN');
  if (!dstUrl || !dstToken) throw new Error('Missing TURSO_IDENTITY_DB_URL / TURSO_IDENTITY_DB_TOKEN');

  const src = createClient({ url: srcUrl, authToken: srcToken });
  const dst = createClient({ url: dstUrl, authToken: dstToken });

  const srcRows = await src.execute('SELECT * FROM users');
  const rows = srcRows.rows as unknown as SrcUser[];
  console.log(`→ ${rows.length} source user(s)`);

  let inserted = 0;
  let skipped = 0;
  let granted = 0;

  for (const u of rows) {
    if (!u.email) {
      console.warn('  skip: row missing email', u.id);
      skipped++;
      continue;
    }

    const existing = await dst.execute({
      sql: 'SELECT id FROM users WHERE id = ? OR email = ? LIMIT 1',
      args: [u.id, u.email.toLowerCase()],
    });
    const existingId = existing.rows[0]?.id as string | undefined;

    let userId = existingId;
    if (!userId) {
      userId = u.id;
      await dst.execute({
        sql: `
          INSERT INTO users (id, email, name, password_hash, avatar_url, email_verified, last_login_at, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, COALESCE(?, CURRENT_TIMESTAMP), COALESCE(?, CURRENT_TIMESTAMP))
        `,
        args: [
          userId,
          u.email.toLowerCase(),
          u.name,
          u.password_hash,
          u.avatar_url,
          u.email_verified ? 1 : 0,
          u.last_login,
          u.created_at,
          u.updated_at,
        ],
      });
      inserted++;

      if (u.google_id) {
        await dst.execute({
          sql: `INSERT OR IGNORE INTO oauth_accounts (id, user_id, provider, provider_user_id, created_at) VALUES (?, ?, 'google', ?, CURRENT_TIMESTAMP)`,
          args: [randomUUID(), userId, u.google_id],
        });
      }
    } else {
      skipped++;
    }

    // Grant app access (idempotent via unique index on user_id+app_id).
    const role = (['user', 'admin', 'owner'].includes(u.role) ? u.role : 'user') as 'user' | 'admin' | 'owner';
    await dst.execute({
      sql: `
        INSERT INTO user_app_access (id, user_id, app_id, role, status, granted_at)
        VALUES (?, ?, ?, ?, 'active', CURRENT_TIMESTAMP)
        ON CONFLICT(user_id, app_id) DO UPDATE SET role = excluded.role, status = 'active'
      `,
      args: [randomUUID(), userId, APP_ID, role],
    });
    granted++;
  }

  console.log(`✅ users inserted: ${inserted}, skipped (already present): ${skipped}, grants: ${granted}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
