/**
 * Generic "collapse old lepulse DB user(s) into a single new identity user".
 *
 * For every user-scoped column in the old lepulse DB (user_id / created_by /
 * owner_id / author_id / creator_id across every table), repoints rows
 * referencing any of `OLD_UUIDS` to `NEW_UUID`. Optionally adds OAuth
 * links in ledesign-identity so Google/GitHub sign-ins resolve to the
 * new user. Leaves the old user rows in place as audit trail.
 *
 * Configure via env:
 *   OLD_UUIDS      - comma-separated list of source user ids in old DB
 *   NEW_UUID       - target user id in ledesign-identity
 *   GOOGLE_SUBS    - (optional) comma-separated Google `sub` values to link
 *   GITHUB_IDS     - (optional) comma-separated GitHub ids to link
 *
 *   TURSO_LEPULSE_DB_URL=… TURSO_LEPULSE_DB_TOKEN=…
 *   TURSO_IDENTITY_DB_URL=… TURSO_IDENTITY_DB_TOKEN=…
 *   OLD_UUIDS=id1,id2,id3 NEW_UUID=<identity-id>
 *   GOOGLE_SUBS=<sub>                   # optional
 *   npx tsx packages/identity/scripts/collapse-old-user.ts
 */

import { createClient, type Client } from '@libsql/client';
import { randomUUID } from 'node:crypto';

function readList(name: string): string[] {
  const raw = process.env[name] ?? '';
  return raw
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

function require1(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing ${name}`);
  return v;
}

async function findUserScopedTables(
  client: Client,
): Promise<Array<{ table: string; col: string }>> {
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
  const OLD_UUIDS = readList('OLD_UUIDS');
  const NEW_UUID = require1('NEW_UUID');
  const GOOGLE_SUBS = readList('GOOGLE_SUBS');
  const GITHUB_IDS = readList('GITHUB_IDS');

  if (OLD_UUIDS.length === 0) throw new Error('OLD_UUIDS must list at least one source id.');

  const src = createClient({
    url: require1('TURSO_LEPULSE_DB_URL'),
    authToken: require1('TURSO_LEPULSE_DB_TOKEN'),
  });
  const dst = createClient({
    url: require1('TURSO_IDENTITY_DB_URL'),
    authToken: require1('TURSO_IDENTITY_DB_TOKEN'),
  });

  const target = await dst.execute({
    sql: `SELECT id, email FROM users WHERE id = ?`,
    args: [NEW_UUID],
  });
  if (target.rows.length === 0) throw new Error(`NEW_UUID ${NEW_UUID} not found in identity DB`);
  console.log(`target: ${(target.rows[0] as { email: string }).email}`);
  console.log(`sources: ${OLD_UUIDS.join(', ')}`);

  const scoped = await findUserScopedTables(src);
  console.log(`\nscanning ${scoped.length} user-scoped columns...`);

  const placeholders = OLD_UUIDS.map(() => '?').join(',');
  let totalUpdated = 0;
  for (const { table, col } of scoped) {
    const r = await src.execute({
      sql: `SELECT COUNT(*) AS cnt FROM ${table} WHERE ${col} IN (${placeholders})`,
      args: OLD_UUIDS,
    });
    const cnt = Number((r.rows[0] as { cnt: number }).cnt);
    if (cnt === 0) continue;
    console.log(`  ${table}.${col}: ${cnt} → ${NEW_UUID}`);
    await src.execute({
      sql: `UPDATE ${table} SET ${col} = ? WHERE ${col} IN (${placeholders})`,
      args: [NEW_UUID, ...OLD_UUIDS],
    });
    totalUpdated += cnt;
  }
  console.log(`✅ updated ${totalUpdated} domain rows`);

  // OAuth links in identity. If the (provider, provider_user_id) is
  // already linked to someone, REPOINT to the collapse target — the
  // whole point of collapsing is to claim those identities. The old
  // user row is left behind as audit trail.
  async function upsertOAuth(provider: 'google' | 'github', id: string) {
    const existing = await dst.execute({
      sql: `SELECT id, user_id FROM oauth_accounts WHERE provider=? AND provider_user_id=? LIMIT 1`,
      args: [provider, id],
    });
    const row = existing.rows[0] as { id: string; user_id: string } | undefined;
    if (row && row.user_id === NEW_UUID) {
      console.log(`${provider} ${id}: already points at ${NEW_UUID}`);
      return;
    }
    if (row) {
      await dst.execute({
        sql: `UPDATE oauth_accounts SET user_id = ? WHERE id = ?`,
        args: [NEW_UUID, row.id],
      });
      console.log(`↻ ${provider} ${id}: repointed ${row.user_id} → ${NEW_UUID}`);
      return;
    }
    await dst.execute({
      sql: `INSERT INTO oauth_accounts (id, user_id, provider, provider_user_id, created_at)
            VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)`,
      args: [randomUUID(), NEW_UUID, provider, id],
    });
    console.log(`+ ${provider} ${id}: linked → ${NEW_UUID}`);
  }
  for (const sub of GOOGLE_SUBS) await upsertOAuth('google', sub);
  for (const gh of GITHUB_IDS) await upsertOAuth('github', gh);

  // Final leak check.
  console.log('\n=== leak check ===');
  let leaks = 0;
  for (const { table, col } of scoped) {
    const r = await src.execute({
      sql: `SELECT COUNT(*) AS cnt FROM ${table} WHERE ${col} IN (${placeholders})`,
      args: OLD_UUIDS,
    });
    const cnt = Number((r.rows[0] as { cnt: number }).cnt);
    if (cnt > 0) {
      console.log(`  LEAK ${table}.${col} = ${cnt}`);
      leaks += cnt;
    }
  }
  if (leaks === 0) console.log('clean.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
