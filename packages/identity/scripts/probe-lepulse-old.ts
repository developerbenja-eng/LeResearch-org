/**
 * Probe the pre-migration lepulse Turso DB for Tomas' account and the
 * data he attached. Read-only — prints what's there so we can plan a
 * proper migration.
 *
 *   TURSO_LEPULSE_DB_URL=... TURSO_LEPULSE_DB_TOKEN=... \
 *   npx tsx packages/identity/scripts/probe-lepulse-old.ts
 */

import { createClient, type Client } from '@libsql/client';

async function tableExists(client: Client, name: string): Promise<boolean> {
  const r = await client.execute({
    sql: `SELECT 1 AS ok FROM sqlite_master WHERE type='table' AND name=? LIMIT 1`,
    args: [name],
  });
  return r.rows.length > 0;
}

async function safeCount(client: Client, sql: string, args: unknown[] = []): Promise<number | string> {
  try {
    const r = await client.execute({ sql, args: args as never });
    const n = Number(r.rows[0]?.[0] ?? r.rows[0]?.cnt ?? 0);
    return Number.isFinite(n) ? n : '?';
  } catch (e) {
    return `err: ${(e as Error).message.slice(0, 60)}`;
  }
}

async function main() {
  const url = process.env.TURSO_LEPULSE_DB_URL!;
  const authToken = process.env.TURSO_LEPULSE_DB_TOKEN!;
  if (!url || !authToken) throw new Error('Need TURSO_LEPULSE_DB_URL + TURSO_LEPULSE_DB_TOKEN');

  const client = createClient({ url, authToken });

  console.log('=== users table schema ===');
  const schema = await client.execute('PRAGMA table_info(users)');
  for (const c of schema.rows) console.log('  ', (c as unknown as { name: string; type: string }).name, '·', (c as unknown as { name: string; type: string }).type);

  console.log('\n=== all users (most recent first) ===');
  const allUsers = await client.execute(
    `SELECT * FROM users ORDER BY created_at DESC LIMIT 50`,
  );
  for (const r of allUsers.rows) console.log(JSON.stringify(r));

  console.log('\n=== users matching tomas ===');
  const users = await client.execute({
    sql: `SELECT * FROM users
          WHERE lower(email) LIKE '%tomas%' OR lower(email) LIKE '%tomás%'
             OR lower(coalesce(name,'')) LIKE '%tomas%' OR lower(coalesce(name,'')) LIKE '%tomás%'
          ORDER BY created_at DESC`,
    args: [],
  });
  for (const r of users.rows) console.log(JSON.stringify(r, null, 2));

  // Build a shortlist of user ids to count per-table rows against.
  const candidateIds = users.rows.map((r) => (r as unknown as { id: string }).id);

  console.log('\n=== table inventory (user-scoped row counts) ===');
  const all = await client.execute(`SELECT name FROM sqlite_master WHERE type='table' ORDER BY name`);
  const tables = all.rows.map((r) => (r as unknown as { name: string }).name);
  for (const t of tables) {
    // probe common user-linking columns
    const cols = await client.execute({
      sql: `PRAGMA table_info(${t})`,
      args: [],
    });
    const colNames = cols.rows.map((c) => (c as unknown as { name: string }).name);
    const userCol = ['user_id', 'created_by', 'author_id', 'owner_id', 'creator_id'].find((c) =>
      colNames.includes(c),
    );
    const totalRows = await safeCount(client, `SELECT COUNT(*) AS cnt FROM ${t}`);
    const bits = [`total=${totalRows}`];
    if (userCol && candidateIds.length > 0) {
      const placeholders = candidateIds.map(() => '?').join(',');
      const byUser = await safeCount(
        client,
        `SELECT COUNT(*) AS cnt FROM ${t} WHERE ${userCol} IN (${placeholders})`,
        candidateIds,
      );
      bits.push(`tomas_via_${userCol}=${byUser}`);
    }
    console.log(`  ${t.padEnd(32)} ${bits.join('  ')}`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
