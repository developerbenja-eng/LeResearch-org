/**
 * Deeper probe — find every trace of Tomas across the old lepulse DB.
 * Looks at his campaign, meetings, and scans every text column for his
 * user_id substring.
 */

import { createClient, type Client } from '@libsql/client';

const TOMAS_ID = '68d7fe7d-64ac-4d20-accc-9ce7789ce300';

async function allTables(client: Client): Promise<string[]> {
  const r = await client.execute(
    `SELECT name FROM sqlite_master WHERE type='table' ORDER BY name`,
  );
  return r.rows.map((x) => (x as unknown as { name: string }).name);
}

async function tableColumns(client: Client, t: string): Promise<Array<{ name: string; type: string }>> {
  const r = await client.execute(`PRAGMA table_info(${t})`);
  return r.rows.map((x) => ({
    name: (x as unknown as { name: string }).name,
    type: (x as unknown as { type: string }).type,
  }));
}

async function main() {
  const client = createClient({
    url: process.env.TURSO_LEPULSE_DB_URL!,
    authToken: process.env.TURSO_LEPULSE_DB_TOKEN!,
  });

  console.log('=== Tomas\' campaign(s) ===');
  const camp = await client.execute({
    sql: `SELECT * FROM campaigns WHERE user_id = ?`,
    args: [TOMAS_ID],
  });
  for (const r of camp.rows) console.log(JSON.stringify(r, null, 2));
  const campIds = camp.rows.map((r) => (r as unknown as { id: string | number }).id);

  console.log('\n=== scanning every table for any Tomas linkage ===');
  const tables = await allTables(client);
  for (const t of tables) {
    const cols = await tableColumns(client, t);
    const textCols = cols.filter((c) => /TEXT|CHAR/i.test(c.type)).map((c) => c.name);
    if (textCols.length === 0) continue;

    const idCols = cols.map((c) => c.name).filter((n) =>
      ['user_id', 'created_by', 'owner_id', 'author_id', 'creator_id', 'uploaded_by', 'submitted_by'].includes(n),
    );
    if (idCols.length) {
      for (const ic of idCols) {
        const r = await client.execute({
          sql: `SELECT COUNT(*) AS cnt FROM ${t} WHERE ${ic} = ?`,
          args: [TOMAS_ID],
        });
        const cnt = Number(r.rows[0]?.cnt ?? 0);
        if (cnt > 0) console.log(`  ${t}.${ic} = ${cnt}`);
      }
    }

    // Campaign-linked rows
    if (campIds.length > 0) {
      const campCol = cols.find((c) => c.name === 'campaign_id' || c.name === 'campana_id');
      if (campCol) {
        const placeholders = campIds.map(() => '?').join(',');
        const r = await client.execute({
          sql: `SELECT COUNT(*) AS cnt FROM ${t} WHERE ${campCol.name} IN (${placeholders})`,
          args: campIds as never,
        });
        const cnt = Number(r.rows[0]?.cnt ?? 0);
        if (cnt > 0) console.log(`  ${t}.${campCol.name} (via tomas campaign) = ${cnt}`);
      }
    }
  }

  console.log('\n=== sample meeting metadata (Tomas mentioned meetings?) ===');
  const meetings = await client.execute({
    sql: `SELECT id, title, user_id, created_at, duration_seconds, speaker_count
          FROM meetings ORDER BY created_at DESC`,
    args: [],
  });
  for (const r of meetings.rows) console.log(JSON.stringify(r));

  console.log('\n=== meeting_speakers (maybe Tomas is a speaker) ===');
  const speakers = await client.execute({
    sql: `SELECT DISTINCT speaker_name FROM meeting_speakers ORDER BY speaker_name`,
    args: [],
  });
  for (const r of speakers.rows) console.log(JSON.stringify(r));

  console.log('\n=== research_documents full text fields for "tomas" ===');
  const rd = await client.execute({
    sql: `SELECT * FROM research_documents LIMIT 5`,
  });
  for (const r of rd.rows) console.log(JSON.stringify(r));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
