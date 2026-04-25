/**
 * Capture focused viewport-sized screenshots for review:
 *   - top of page (hero + TLDR)
 *   - the first major figure on each act
 * At desktop 1440 (where layout is fully expressed) AND mobile 390
 * (where breaks first appear).
 */
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';

const BASE = 'http://localhost:3399';
const OUT = '/tmp/leresearch-screenshots/frames';
mkdirSync(OUT, { recursive: true });

const VIEWS = [
  // route, label, scrollSelector (or null = top), waitFor (extra ms)
  { path: '/ai',              label: 'index',                   scrollTo: null },
  { path: '/ai/definitions',  label: 'definitions-top',         scrollTo: null },
  { path: '/ai/definitions',  label: 'definitions-matrix',      scrollTo: '#matrix' },
  { path: '/ai/definitions',  label: 'definitions-effect',      scrollTo: '#effect' },
  { path: '/ai/environment',  label: 'environment-top',         scrollTo: null },
  { path: '/ai/environment',  label: 'environment-scaleladder', scrollTo: '#per-query' },
  { path: '/ai/environment',  label: 'environment-spectrum',    scrollTo: '#spectrum' },
  { path: '/ai/environment',  label: 'environment-whopays',     scrollTo: '#system' },
  { path: '/ai/tracking',     label: 'tracking-top',            scrollTo: null },
  { path: '/ai/tracking',     label: 'tracking-map',            scrollTo: '#map' },
  { path: '/ai/tracking',     label: 'tracking-climb',          scrollTo: '#climb' },
  { path: '/ai/real-problem', label: 'real-problem-top',        scrollTo: null },
  { path: '/ai/real-problem', label: 'real-problem-pincer',     scrollTo: '#thesis' },
  { path: '/ai/real-problem', label: 'real-problem-doom',       scrollTo: '#doom' },
  { path: '/ai/real-problem', label: 'real-problem-displaced',  scrollTo: '#displaced' },
  { path: '/ai/real-problem', label: 'real-problem-fear-gap',   scrollTo: '#public-vs-elite' },
  { path: '/ai/methodology',  label: 'methodology',             scrollTo: null },
];

const VIEWPORTS = [
  { name: 'desk',   width: 1440, height: 900 },
  { name: 'mob',    width: 390,  height: 844 },
];

const browser = await chromium.launch({ headless: true });

for (const vp of VIEWPORTS) {
  const ctx = await browser.newContext({
    viewport: { width: vp.width, height: vp.height },
    reducedMotion: 'reduce',
  });
  for (const v of VIEWS) {
    const page = await ctx.newPage();
    await page.goto(BASE + v.path, { waitUntil: 'networkidle', timeout: 20000 });
    await page.waitForTimeout(500);

    if (v.scrollTo) {
      await page.evaluate((sel) => {
        const el = document.querySelector(sel);
        if (el) el.scrollIntoView({ block: 'start' });
      }, v.scrollTo);
      await page.waitForTimeout(400);
    }

    await page.screenshot({
      path: `${OUT}/${vp.name}__${v.label}.png`,
      // viewport-only (default)
    });
    await page.close();
  }
  await ctx.close();
}

await browser.close();
console.log('done');
