/**
 * Capture frames of the two new philosophy diagrams.
 */
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';

const BASE = 'http://localhost:3399';
const OUT = '/tmp/leresearch-screenshots/philo';
mkdirSync(OUT, { recursive: true });

const VIEWS = [
  { label: 'normalization-gradient', scrollTo: '#normalization-gradient' },
  { label: 'open-threads',           scrollTo: '#open-threads' },
];

const VIEWPORTS = [
  { name: 'desk', width: 1440, height: 900 },
  { name: 'mob',  width: 390,  height: 844 },
];

const browser = await chromium.launch({ headless: true });
for (const vp of VIEWPORTS) {
  const ctx = await browser.newContext({ viewport: { width: vp.width, height: vp.height }, reducedMotion: 'reduce' });
  for (const v of VIEWS) {
    const page = await ctx.newPage();
    await page.goto(BASE + '/philosophy', { waitUntil: 'networkidle', timeout: 25000 });
    await page.waitForTimeout(400);
    await page.evaluate((sel) => document.querySelector(sel)?.scrollIntoView({ block: 'start' }), v.scrollTo);
    await page.waitForTimeout(800);
    // For NormalizationGradient — wait for SMIL to settle, then advance scroll a bit so figure is fully visible
    if (v.label === 'normalization-gradient') {
      await page.evaluate(() => window.scrollBy(0, 500));
      await page.waitForTimeout(900);
    } else {
      await page.evaluate(() => window.scrollBy(0, 300));
      await page.waitForTimeout(400);
    }
    await page.screenshot({ path: `${OUT}/${vp.name}__${v.label}.png` });
    await page.close();
  }
  await ctx.close();
}
await browser.close();
console.log('done');
