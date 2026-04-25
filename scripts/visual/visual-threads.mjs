/**
 * LeResearch /philosophy + /philosophy/threads visual sweep.
 * For each route × viewport: navigate, wait for paint, capture full-page
 * screenshot, log console errors and any horizontal-scroll on body.
 *
 * Mirrors visual-sweep.mjs but for the philosophy/threads tree.
 */
import { chromium } from 'playwright';
import { mkdirSync, writeFileSync } from 'node:fs';

const BASE = 'http://localhost:3399';
const OUT = '/tmp/leresearch-threads-screenshots';
mkdirSync(OUT, { recursive: true });

const ROUTES = [
  { path: '/philosophy',                                slug: 'philosophy' },
  { path: '/philosophy/threads',                        slug: 'threads-index' },
  { path: '/philosophy/threads/castoriadis',            slug: 'castoriadis' },
  { path: '/philosophy/threads/anderson',               slug: 'anderson' },
  { path: '/philosophy/threads/searle',                 slug: 'searle' },
  { path: '/philosophy/threads/berger-luckmann',        slug: 'berger-luckmann' },
  { path: '/philosophy/threads/bourdieu',               slug: 'bourdieu' },
  { path: '/philosophy/threads/harari',                 slug: 'harari' },
  { path: '/philosophy/threads/pauly',                  slug: 'pauly' },
  { path: '/philosophy/threads/kuhn',                   slug: 'kuhn' },
  { path: '/philosophy/threads/klein',                  slug: 'klein' },
  { path: '/philosophy/threads/schmachtenberger',       slug: 'schmachtenberger' },
  { path: '/philosophy/threads/graeber-bullshit-jobs',  slug: 'graeber-bsj' },
  { path: '/philosophy/threads/graeber-debt',           slug: 'graeber-debt' },
  { path: '/philosophy/threads/zuboff',                 slug: 'zuboff' },
];

const VIEWPORTS = [
  { name: 'mobile',  width: 390,  height: 844 },
  { name: 'tablet',  width: 820,  height: 1180 },
  { name: 'desktop', width: 1440, height: 900 },
];

const browser = await chromium.launch({ headless: true });
const summary = [];

for (const vp of VIEWPORTS) {
  const ctx = await browser.newContext({
    viewport: { width: vp.width, height: vp.height },
    deviceScaleFactor: 1,
    reducedMotion: 'reduce',
  });
  for (const r of ROUTES) {
    const page = await ctx.newPage();
    const consoleErrors = [];
    const pageErrors = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') consoleErrors.push(msg.text().slice(0, 200));
    });
    page.on('pageerror', (err) => pageErrors.push(String(err).slice(0, 200)));

    const url = BASE + r.path;
    let status = '?';
    try {
      const resp = await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
      status = resp ? resp.status() : 'noresp';
    } catch (e) {
      status = 'ERR ' + String(e).slice(0, 80);
    }

    await page.waitForTimeout(800);

    const layout = await page.evaluate(() => {
      // Find any element wider than viewport (helps localize horizontal overflow)
      const offenders = [];
      const w = window.innerWidth;
      const all = document.querySelectorAll('*');
      for (const el of all) {
        const r = el.getBoundingClientRect();
        if (r.right > w + 1 || r.width > w + 1) {
          offenders.push({
            tag: el.tagName,
            cls: (el.className && typeof el.className === 'string') ? el.className.slice(0, 80) : '',
            w: Math.round(r.width),
            right: Math.round(r.right),
          });
          if (offenders.length >= 6) break;
        }
      }
      return {
        docW: document.documentElement.scrollWidth,
        docH: document.documentElement.scrollHeight,
        vpW: window.innerWidth,
        vpH: window.innerHeight,
        bodyOverflowX: document.documentElement.scrollWidth > window.innerWidth + 1,
        offenders,
      };
    });

    const file = `${OUT}/${vp.name}__${r.slug}.png`;
    try {
      await page.screenshot({ path: file, fullPage: true });
    } catch {
      try { await page.screenshot({ path: file }); } catch {}
    }

    summary.push({
      vp: vp.name,
      route: r.path,
      status,
      docW: layout.docW,
      docH: layout.docH,
      hOverflow: layout.bodyOverflowX,
      consoleErrors: consoleErrors.length,
      pageErrors: pageErrors.length,
      offenders: layout.offenders,
      sampleErr: [...pageErrors, ...consoleErrors].slice(0, 2),
    });
    await page.close();
  }
  await ctx.close();
}

await browser.close();

writeFileSync(`${OUT}/summary.json`, JSON.stringify(summary, null, 2));

const w = (s, n) => String(s).padEnd(n);
console.log(w('vp', 9) + w('route', 42) + w('status', 8) + w('docW×H', 14) + w('hOvf', 6) + w('cErr', 6) + 'pErr');
console.log('-'.repeat(95));
for (const s of summary) {
  console.log(
    w(s.vp, 9) + w(s.route, 42) + w(s.status, 8) +
    w(`${s.docW}×${s.docH}`, 14) +
    w(s.hOverflow ? 'YES' : '·', 6) +
    w(s.consoleErrors, 6) + s.pageErrors,
  );
  if (s.hOverflow && s.offenders?.length) {
    for (const o of s.offenders.slice(0, 3)) {
      console.log(`   ↳ ${o.tag} w=${o.w} right=${o.right} class="${o.cls}"`);
    }
  }
  if (s.sampleErr?.length) for (const e of s.sampleErr) console.log('   · ' + e);
}

const issues = summary.filter((s) => s.hOverflow || s.consoleErrors > 0 || s.pageErrors > 0 || (typeof s.status === 'number' && s.status >= 400) || (typeof s.status === 'string' && s.status.startsWith('ERR')));
console.log('\n' + '='.repeat(95));
console.log(`Issues: ${issues.length}/${summary.length} captures had overflow, errors, or non-2xx status`);
