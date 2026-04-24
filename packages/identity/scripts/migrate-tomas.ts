/**
 * One-off: copy Tomas's row from the old lepulse DB into ledesign-identity,
 * preserving his UUID so campaigns.user_id keeps linking. Grants lepulse
 * access only (no other apps).
 *
 *   TURSO_LEPULSE_DB_URL=… TURSO_LEPULSE_DB_TOKEN=…
 *   TURSO_IDENTITY_DB_URL=… TURSO_IDENTITY_DB_TOKEN=…
 *   npx tsx packages/identity/scripts/migrate-tomas.ts
 */

import { createClient } from '@libsql/client';
import { randomUUID } from 'node:crypto';

const OLD_USER_ID = '68d7fe7d-64ac-4d20-accc-9ce7789ce300';
const NEW_EMAIL = 'tomasmarinreyes@gmail.com';

async function main() {
  const src = createClient({
    url: process.env.TURSO_LEPULSE_DB_URL!,
    authToken: process.env.TURSO_LEPULSE_DB_TOKEN!,
  });
  const dst = createClient({
    url: process.env.TURSO_IDENTITY_DB_URL!,
    authToken: process.env.TURSO_IDENTITY_DB_TOKEN!,
  });

  const srcRows = await src.execute({
    sql: `SELECT * FROM users WHERE id = ?`,
    args: [OLD_USER_ID],
  });
  const row = srcRows.rows[0] as unknown as
    | {
        id: string;
        email: string;
        name: string | null;
        password_hash: string | null;
        avatar_url: string | null;
        email_verified: number | boolean | null;
        created_at: string | null;
        updated_at: string | null;
      }
    | undefined;
  if (!row) throw new Error(`No user with id ${OLD_USER_ID} in source DB`);
  console.log(`source: email=${row.email} name=${row.name}`);

  // Check for existing conflict in identity by id or new email.
  const existing = await dst.execute({
    sql: `SELECT id, email FROM users WHERE id = ? OR lower(email) = ? LIMIT 1`,
    args: [OLD_USER_ID, NEW_EMAIL.toLowerCase()],
  });
  if (existing.rows[0]) {
    console.log(`already present: ${JSON.stringify(existing.rows[0])}`);
  } else {
    await dst.execute({
      sql: `
        INSERT INTO users (id, email, name, password_hash, avatar_url, email_verified, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, COALESCE(?, CURRENT_TIMESTAMP), COALESCE(?, CURRENT_TIMESTAMP))
      `,
      args: [
        OLD_USER_ID,
        NEW_EMAIL.toLowerCase(),
        row.name ?? 'Tomas',
        row.password_hash,
        row.avatar_url,
        row.email_verified ? 1 : 0,
        row.created_at,
        row.updated_at,
      ],
    });
    console.log(`inserted user ${OLD_USER_ID} as ${NEW_EMAIL.toLowerCase()}`);
  }

  // Grant lepulse access (user role). Idempotent.
  await dst.execute({
    sql: `
      INSERT INTO user_app_access (id, user_id, app_id, role, status, granted_at)
      VALUES (?, ?, 'lepulse', 'user', 'active', CURRENT_TIMESTAMP)
      ON CONFLICT(user_id, app_id) DO UPDATE SET role = 'user', status = 'active'
    `,
    args: [randomUUID(), OLD_USER_ID],
  });

  const verify = await dst.execute({
    sql: `SELECT u.email, u.name, uaa.app_id, uaa.role, uaa.status
          FROM users u LEFT JOIN user_app_access uaa ON uaa.user_id = u.id
          WHERE u.id = ?`,
    args: [OLD_USER_ID],
  });
  console.log('verify:');
  for (const r of verify.rows) console.log('  ', JSON.stringify(r));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
