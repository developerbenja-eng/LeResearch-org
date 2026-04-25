import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';
const OUT = '/tmp/leresearch-screenshots/philo2';
mkdirSync(OUT, { recursive: true });

const b = await chromium.launch({ headless: true });
const ctx = await b.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });

const VIEWS = [
  { route: '/philosophy', sel: '#ai-labor',  name: 'philo-labor' },
  { route: '/philosophy', sel: '#tension',   name: 'philo-tension' },
  { route: '/philosophy', sel: '#principles',name: 'philo-principles' },
  { route: '/philosophy/threads', sel: '#castoriadis',  name: 'th-castoriadis' },
  { route: '/philosophy/threads', sel: '#anderson',     name: 'th-anderson' },
  { route: '/philosophy/threads', sel: '#searle',       name: 'th-searle' },
  { route: '/philosophy/threads', sel: '#berger-luckmann', name: 'th-berger' },
  { route: '/philosophy/threads', sel: '#bourdieu',     name: 'th-bourdieu' },
  { route: '/philosophy/threads', sel: '#harari',       name: 'th-harari' },
  { route: '/philosophy/threads', sel: '#pauly',        name: 'th-pauly' },
  { route: '/philosophy/threads', sel: '#kuhn',         name: 'th-kuhn' },
  { route: '/philosophy/threads', sel: '#klein',        name: 'th-klein' },
  { route: '/philosophy/threads', sel: '#schmachtenberger', name: 'th-schmach' },
  { route: '/philosophy/threads', sel: '#graeber-bullshit-jobs', name: 'th-graeber-bsj' },
  { route: '/philosophy/threads', sel: '#graeber-debt', name: 'th-graeber-debt' },
  { route: '/philosophy/threads', sel: '#zuboff',       name: 'th-zuboff' },
];

for (const v of VIEWS) {
  const p = await ctx.newPage();
  await p.goto('http://localhost:3399' + v.route, { waitUntil: 'networkidle', timeout: 25000 });
  await p.waitForTimeout(500);
  await p.evaluate((sel) => document.querySelector(sel)?.scrollIntoView({ block: 'start' }), v.sel);
  await p.waitForTimeout(500);
  await p.evaluate(() => window.scrollBy(0, 400));
  await p.waitForTimeout(700);
  await p.screenshot({ path: `${OUT}/${v.name}.png` });
  await p.close();
}
await b.close();
console.log('done');
