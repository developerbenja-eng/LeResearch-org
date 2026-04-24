/**
 * Applies every `migrations/*.sql` file in order against the identity DB.
 * Run once after `turso db create ledesign-identity`.
 *
 *   TURSO_IDENTITY_DB_URL=... \
 *   TURSO_IDENTITY_DB_TOKEN=... \
 *   npx tsx packages/identity/scripts/migrate.ts
 */

import { createClient } from '@libsql/client';
import { readFile, readdir } from 'node:fs/promises';
import { join } from 'node:path';

async function main() {
  const url = process.env.TURSO_IDENTITY_DB_URL;
  const authToken = process.env.TURSO_IDENTITY_DB_TOKEN;
  if (!url || !authToken) {
    console.error('Missing TURSO_IDENTITY_DB_URL or TURSO_IDENTITY_DB_TOKEN');
    process.exit(1);
  }

  const client = createClient({ url, authToken });
  const dir = join(__dirname, '..', 'migrations');
  const files = (await readdir(dir)).filter((f) => f.endsWith('.sql')).sort();

  for (const file of files) {
    const raw = await readFile(join(dir, file), 'utf8');
    console.log(`→ applying ${file} (${raw.length} chars)`);
    // Strip comment-only lines so they don't accidentally eat the next statement
    // when we split on `;`. Keeps trailing-line comments on SQL lines alone.
    const sanitized = raw
      .split('\n')
      .filter((line) => !/^\s*--/.test(line))
      .join('\n');
    const statements = sanitized
      .split(';')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
    for (const stmt of statements) {
      await client.execute(stmt);
    }
    console.log(`  ok (${statements.length} statements)`);
  }

  console.log('✅ identity migrations applied');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
