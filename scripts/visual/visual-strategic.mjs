/**
 * Strategic viewport-only captures for threads pages.
 * Goal: produce manageable PNGs (one viewport each) at strategic scroll
 * positions so a reviewer can verify rendering without paging through
 * 30K-pixel-tall full-page screenshots.
 */
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';

const BASE = 'http://localhost:3399';
const OUT = '/tmp/leresearch-strategic';
mkdirSync(OUT, { recursive: true });

// Each capture: { route, vp, positions } where positions are Y-offsets to scroll
// Use 'top' / 'mid' / 'bottom' as named positions; the script translates
// 'mid' to 50% of doc height and 'bottom' to (docH - vpH).
const CAPTURES = [
  // /philosophy: header + new diagrams region + a deep section
  { route: '/philosophy', vp: 'mobile',  positions: ['top', 'mid', 'bottom'] },
  { route: '/philosophy', vp: 'desktop', positions: ['top'] },

  // /philosophy/threads: header + cluster transitions + a card with deeperHref
  { route: '/philosophy/threads', vp: 'mobile',  positions: ['top', 'mid', 'bottom'] },
  { route: '/philosophy/threads', vp: 'desktop', positions: ['top'] },

  // Castoriadis: header + ConceptList (§3) + temporal sub-sections (§4) + open-questions (§7)
  { route: '/philosophy/threads/castoriadis', vp: 'mobile',  positions: ['top', 'mid', 'bottom'] },
  { route: '/philosophy/threads/castoriadis', vp: 'desktop', positions: ['top'] },

  // Pauly: §4 has H3 sub-sections under a Section, worth verifying spacing
  { route: '/philosophy/threads/pauly', vp: 'mobile',  positions: ['mid'] },

  // Bourdieu: BorrowItem renders should be checked at desktop
  { route: '/philosophy/threads/bourdieu', vp: 'desktop', positions: ['mid'] },

  // Klein: deep page with the deeperHref CTA at end
  { route: '/philosophy/threads/klein', vp: 'mobile', positions: ['bottom'] },
];

const VP = {
  mobile:  { width: 390,  height: 844 },
  tablet:  { width: 820,  height: 1180 },
  desktop: { width: 1440, height: 900 },
};

const browser = await chromium.launch({ headless: true });

for (const cap of CAPTURES) {
  const v = VP[cap.vp];
  const ctx = await browser.newContext({
    viewport: { width: v.width, height: v.height },
    deviceScaleFactor: 1,
    reducedMotion: 'reduce',
  });
  const page = await ctx.newPage();
  await page.goto(BASE + cap.route, { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(500);

  const docH = await page.evaluate(() => document.documentElement.scrollHeight);
  const vpH = v.height;

  for (const pos of cap.positions) {
    let y;
    if (pos === 'top') y = 0;
    else if (pos === 'bottom') y = Math.max(0, docH - vpH);
    else if (pos === 'mid') y = Math.max(0, Math.floor(docH / 2 - vpH / 2));
    else y = Number(pos);

    await page.evaluate((y) => window.scrollTo(0, y), y);
    await page.waitForTimeout(300);

    const slug = cap.route.replace(/^\/philosophy\/threads\//, 't-').replace(/^\/philosophy\/threads/, 'threads-index').replace(/^\/philosophy/, 'philosophy').replace(/\//g, '_');
    const file = `${OUT}/${cap.vp}__${slug}__${pos}.png`;
    await page.screenshot({ path: file, fullPage: false });
    const sizeKB = await page.evaluate(() => 0); // placeholder
    console.log(`✓ ${file}`);
  }
  await page.close();
  await ctx.close();
}

await browser.close();
console.log('\nDone. Output in:', OUT);
