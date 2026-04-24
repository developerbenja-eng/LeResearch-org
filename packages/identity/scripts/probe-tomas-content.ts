import { createClient } from '@libsql/client';

async function main() {
  const c = createClient({
    url: process.env.TURSO_LEPULSE_DB_URL!,
    authToken: process.env.TURSO_LEPULSE_DB_TOKEN!,
  });

  console.log('=== meetings ===');
  const m = await c.execute('SELECT id, title, created_at FROM meetings ORDER BY created_at DESC LIMIT 5');
  for (const r of m.rows) console.log(JSON.stringify(r));

  console.log('\n=== meeting speakers ===');
  const s = await c.execute("SELECT DISTINCT speaker_name FROM meeting_speakers ORDER BY speaker_name");
  for (const r of s.rows) console.log(JSON.stringify(r));

  console.log('\n=== counts ===');
  for (const t of ['academia_papers', 'news_articles', 'metricool_stats', 'meetings', 'meeting_segments', 'social_accounts', 'social_posts', 'campaigns', 'campaign_designs']) {
    const r = await c.execute(`SELECT COUNT(*) as cnt FROM ${t}`);
    console.log(`  ${t.padEnd(24)} ${(r.rows[0] as { cnt: number }).cnt}`);
  }
}

main().catch((e) => { console.error(e); process.exit(1); });
