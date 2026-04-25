/**
 * Capture viewport-sized screenshots (top of page) at mobile to inspect
 * overflow and layout details.
 */
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';

const BASE = 'http://localhost:3399';
const OUT = '/tmp/leresearch-screenshots/detail';
mkdirSync(OUT, { recursive: true });

const ROUTES = [
  '/ai',
  '/ai/definitions',
  '/ai/environment',
  '/ai/tracking',
  '/ai/real-problem',
];

const browser = await chromium.launch({ headless: true });

// Mobile + tablet — viewport-only, then again scrolled
for (const vp of [
  { name: 'mobile-390',  width: 390,  height: 844 },
  { name: 'tablet-820',  width: 820,  height: 1180 },
]) {
  for (const path of ROUTES) {
    const ctx = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      reducedMotion: 'reduce',
    });
    const page = await ctx.newPage();
    await page.goto(BASE + path, { waitUntil: 'networkidle', timeout: 20000 });
    await page.waitForTimeout(500);

    const slug = path.replace(/\W/g, '-').replace(/^-+|-+$/g, '') || 'index';

    // Top of page
    await page.screenshot({ path: `${OUT}/${vp.name}__${slug}__top.png` });

    // Find overflowing elements
    const offenders = await page.evaluate((vpW) => {
      const out = [];
      const els = document.querySelectorAll('body *');
      for (const el of els) {
        const r = el.getBoundingClientRect();
        if (r.right > vpW + 1 && r.width > 40) {
          out.push({
            tag: el.tagName.toLowerCase(),
            cls: el.className && typeof el.className === 'string' ? el.className.slice(0, 80) : '',
            id: el.id,
            right: Math.round(r.right),
            width: Math.round(r.width),
            text: (el.textContent || '').slice(0, 50).trim(),
          });
        }
      }
      // Sort: rightmost first, return top 5
      return out.sort((a, b) => b.right - a.right).slice(0, 5);
    }, vp.width);

    console.log(`\n=== ${vp.name} ${path} (vp=${vp.width}) ===`);
    if (offenders.length === 0) {
      console.log('  no overflow ✓');
    } else {
      for (const o of offenders) {
        console.log(`  ${o.tag}${o.cls ? '.' + o.cls.split(/\s+/).slice(0, 2).join('.') : ''}${o.id ? '#' + o.id : ''}  right=${o.right} w=${o.width}  "${o.text}"`);
      }
    }

    await ctx.close();
  }
}

await browser.close();
