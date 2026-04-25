/**
 * LeResearch /ai visual sweep.
 * For each route × viewport: navigate, wait for paint, capture full-page
 * screenshot, log console errors and any horizontal-scroll on body.
 */
import { chromium } from 'playwright';
import { mkdirSync, writeFileSync } from 'node:fs';

const BASE = 'http://localhost:3399';
const OUT = '/tmp/leresearch-screenshots';
mkdirSync(OUT, { recursive: true });

const ROUTES = [
  { path: '/ai',             slug: 'ai-index' },
  { path: '/ai/definitions', slug: 'definitions' },
  { path: '/ai/environment', slug: 'environment' },
  { path: '/ai/tracking',    slug: 'tracking' },
  { path: '/ai/real-problem',slug: 'real-problem' },
  { path: '/ai/methodology', slug: 'methodology' },
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
      const resp = await page.goto(url, { waitUntil: 'networkidle', timeout: 20000 });
      status = resp ? resp.status() : 'noresp';
    } catch (e) {
      status = 'ERR ' + String(e).slice(0, 80);
    }

    // Wait a touch longer so SMIL + canvas paint
    await page.waitForTimeout(800);

    // Measure body layout: any horizontal overflow?
    const layout = await page.evaluate(() => ({
      docW: document.documentElement.scrollWidth,
      docH: document.documentElement.scrollHeight,
      vpW: window.innerWidth,
      vpH: window.innerHeight,
      bodyOverflowX: document.documentElement.scrollWidth > window.innerWidth + 1,
    }));

    const file = `${OUT}/${vp.name}__${r.slug}.png`;
    try {
      await page.screenshot({ path: file, fullPage: true });
    } catch (e) {
      // fallback to viewport-only
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
      sampleErr: [...pageErrors, ...consoleErrors].slice(0, 2),
    });
    await page.close();
  }
  await ctx.close();
}

await browser.close();

writeFileSync(`${OUT}/summary.json`, JSON.stringify(summary, null, 2));

// Pretty print
const w = (s, n) => String(s).padEnd(n);
console.log(w('vp', 9) + w('route', 22) + w('status', 8) + w('docW×H', 14) + w('hOvf', 6) + w('cErr', 6) + 'pErr');
console.log('-'.repeat(70));
for (const s of summary) {
  console.log(
    w(s.vp, 9) + w(s.route, 22) + w(s.status, 8) +
    w(`${s.docW}×${s.docH}`, 14) +
    w(s.hOverflow ? 'YES' : '·', 6) +
    w(s.consoleErrors, 6) + s.pageErrors,
  );
  if (s.sampleErr?.length) for (const e of s.sampleErr) console.log('   · ' + e);
}
