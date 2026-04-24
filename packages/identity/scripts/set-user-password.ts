/**
 * Set a plaintext password on one user in ledesign-identity.
 *
 *   EMAIL=tomasmarinreyes@gmail.com PASSWORD='lepulsetomas123' \
 *   TURSO_IDENTITY_DB_URL=… TURSO_IDENTITY_DB_TOKEN=… \
 *   npx tsx packages/identity/scripts/set-user-password.ts
 */

import { createClient } from '@libsql/client';
import { hashPassword } from '@leresearch-org/auth/password';

async function main() {
  const email = process.env.EMAIL?.trim().toLowerCase();
  const password = process.env.PASSWORD;
  if (!email || !password) throw new Error('Need EMAIL and PASSWORD env vars');

  const client = createClient({
    url: process.env.TURSO_IDENTITY_DB_URL!,
    authToken: process.env.TURSO_IDENTITY_DB_TOKEN!,
  });
  const hash = await hashPassword(password);
  const res = await client.execute({
    sql: `UPDATE users SET password_hash = ?, updated_at = CURRENT_TIMESTAMP
          WHERE lower(email) = ? RETURNING email`,
    args: [hash, email],
  });
  console.log('updated:', res.rows.map((r) => r.email));
  if (res.rows.length === 0) throw new Error(`No user with email ${email}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
