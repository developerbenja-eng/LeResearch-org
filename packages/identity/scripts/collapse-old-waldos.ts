/**
 * Collapse the 3 old-lepulse Waldo accounts into the single new
 * waldo@ledesign.ai row in ledesign-identity.
 *
 * Old UUIDs (in lepulse-developer-benja.users):
 *   - waldo@lepulse.cl        b4713a26-1da5-4e04-a61a-6a0ccc914f74  (password)
 *   - bare "waldo"            cec6066f-8204-4edf-ba86-adf8091c0e9e  (password)
 *   - wledesmav@gmail.com     4f338647-f332-4437-8b04-d57e3c0b0e91  (google_id=111391054666956534330)
 *
 * Target (already in ledesign-identity):
 *   - waldo@ledesign.ai       f9a5966f-8b1a-4079-bdab-8d0ca2079968
 *
 * What we do:
 *  1. In the OLD lepulse DB: UPDATE every user-scoped row
 *     (campaigns.user_id, and any other user_id-bearing table) from any
 *     of the 3 old UUIDs → the new UUID. Lepulse in prod then reads
 *     those rows as belonging to waldo@ledesign.ai.
 *  2. In ledesign-identity: add an oauth_accounts row linking Waldo's
 *     Google account (wledesmav@gmail.com, sub=111391…) to the new
 *     user so future Google sign-in resolves correctly.
 *  3. Do NOT delete the 3 old user rows — they stay as a historical
 *     audit trail; nothing in the domain tables references them after
 *     the UPDATE.
 *
 *   TURSO_LEPULSE_DB_URL=… TURSO_LEPULSE_DB_TOKEN=…
 *   TURSO_IDENTITY_DB_URL=… TURSO_IDENTITY_DB_TOKEN=…
 *   npx tsx packages/identity/scripts/collapse-old-waldos.ts
 */

import { createClient, type Client } from '@libsql/client';
import { randomUUID } from 'node:crypto';

const OLD_UUIDS = [
  'b4713a26-1da5-4e04-a61a-6a0ccc914f74', // waldo@lepulse.cl
  'cec6066f-8204-4edf-ba86-adf8091c0e9e', // waldo (bare)
  '4f338647-f332-4437-8b04-d57e3c0b0e91', // wledesmav@gmail.com (google)
] as const;
const NEW_UUID = 'f9a5966f-8b1a-4079-bdab-8d0ca2079968'; // waldo@ledesign.ai
const GOOGLE_SUB = '111391054666956534330';

async function findUserScopedTables(client: Client): Promise<Array<{ table: string; col: string }>> {
  const all = await client.execute(
    `SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name`,
  );
  const out: Array<{ table: string; col: string }> = [];
  const candidateCols = ['user_id', 'created_by', 'owner_id', 'author_id', 'creator_id'];
  for (const r of all.rows) {
    const t = (r as unknown as { name: string }).name;
    const cols = await client.execute(`PRAGMA table_info(${t})`);
    const names = cols.rows.map((c) => (c as unknown as { name: string }).name);
    for (const c of candidateCols) {
      if (names.includes(c)) out.push({ table: t, col: c });
    }
  }
  return out;
}

async function main() {
  const src = createClient({
    url: process.env.TURSO_LEPULSE_DB_URL!,
    authToken: process.env.TURSO_LEPULSE_DB_TOKEN!,
  });
  const dst = createClient({
    url: process.env.TURSO_IDENTITY_DB_URL!,
    authToken: process.env.TURSO_IDENTITY_DB_TOKEN!,
  });

  // 1. Sanity-check the new Waldo exists.
  const target = await dst.execute({
    sql: `SELECT id, email FROM users WHERE id = ?`,
    args: [NEW_UUID],
  });
  if (target.rows.length === 0) {
    throw new Error(`Target user ${NEW_UUID} (waldo@ledesign.ai) not found in identity DB.`);
  }
  console.log(`target user: ${(target.rows[0] as { email: string }).email}`);

  // 2. Find every user-scoped (table, column) pair in the old DB.
  const scoped = await findUserScopedTables(src);
  console.log(`\nscanning ${scoped.length} user-scoped columns...`);

  const placeholders = OLD_UUIDS.map(() => '?').join(',');
  let totalBefore = 0;
  let totalUpdated = 0;

  for (const { table, col } of scoped) {
    const before = await src.execute({
      sql: `SELECT COUNT(*) AS cnt FROM ${table} WHERE ${col} IN (${placeholders})`,
      args: OLD_UUIDS as unknown as string[],
    });
    const cnt = Number((before.rows[0] as { cnt: number }).cnt);
    if (cnt === 0) continue;
    totalBefore += cnt;
    console.log(`  ${table}.${col}: ${cnt} rows matched; updating → ${NEW_UUID}`);

    await src.execute({
      sql: `UPDATE ${table} SET ${col} = ? WHERE ${col} IN (${placeholders})`,
      args: [NEW_UUID, ...OLD_UUIDS] as unknown as string[],
    });
    totalUpdated += cnt;
  }

  console.log(`\n✅ updated ${totalUpdated} / ${totalBefore} row(s) in the old lepulse DB`);

  // 3. Link Waldo's Google account in identity so future Google sign-in
  //    resolves to waldo@ledesign.ai (once we wire Google OAuth).
  const existing = await dst.execute({
    sql: `SELECT id FROM oauth_accounts WHERE provider='google' AND provider_user_id=? LIMIT 1`,
    args: [GOOGLE_SUB],
  });
  if (existing.rows.length === 0) {
    await dst.execute({
      sql: `
        INSERT INTO oauth_accounts (id, user_id, provider, provider_user_id, created_at)
        VALUES (?, ?, 'google', ?, CURRENT_TIMESTAMP)
      `,
      args: [randomUUID(), NEW_UUID, GOOGLE_SUB],
    });
    console.log(`✅ linked Google account ${GOOGLE_SUB} → waldo@ledesign.ai`);
  } else {
    console.log(`Google account ${GOOGLE_SUB} already linked.`);
  }

  // 4. Final verification.
  console.log('\n=== verification: rows still pointing at old UUIDs ===');
  for (const { table, col } of scoped) {
    const r = await src.execute({
      sql: `SELECT COUNT(*) AS cnt FROM ${table} WHERE ${col} IN (${placeholders})`,
      args: OLD_UUIDS as unknown as string[],
    });
    const cnt = Number((r.rows[0] as { cnt: number }).cnt);
    if (cnt > 0) console.log(`  LEAK: ${table}.${col} = ${cnt}`);
  }
  console.log('(no rows → clean)');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
