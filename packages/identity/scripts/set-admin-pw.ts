import { createClient } from '@libsql/client';
import { hashPassword } from '@leresearch-org/auth/password';

async function main() {
  const client = createClient({
    url: process.env.TURSO_IDENTITY_DB_URL!,
    authToken: process.env.TURSO_IDENTITY_DB_TOKEN!,
  });
  const hash = await hashPassword('Qwerty.2026');
  const res = await client.execute({
    sql: `UPDATE users SET password_hash = ?, updated_at = CURRENT_TIMESTAMP
          WHERE email IN ('waldo@ledesign.ai', 'benja@ledesign.ai') RETURNING email`,
    args: [hash],
  });
  console.log('updated:', res.rows.map((r) => r.email));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
