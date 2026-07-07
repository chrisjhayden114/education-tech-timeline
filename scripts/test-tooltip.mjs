#!/usr/bin/env node
/**
 * Smoke-test timeline hover tooltips in a headless browser.
 */
import { chromium } from 'playwright';

const BASE = 'http://localhost:8765/index.html';

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });
await page.goto(BASE, { waitUntil: 'networkidle' });
await page.waitForSelector('.tech-node');

const nodes = await page.$$('.tech-node');
console.log(`Found ${nodes.length} tech nodes`);

const failures = [];
const samples = ['generative-ai', 'rock-and-roll', 'television', 'video-games'];

for (const id of samples) {
  const node = await page.$(`.tech-node[data-id="${id}"]`);
  if (!node) {
    failures.push(`${id}: node not found`);
    continue;
  }

  await node.scrollIntoViewIfNeeded();
  const box = await node.boundingBox();
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.waitForTimeout(300);

  const tooltip = await page.$('#timeline-tooltip:not([hidden])');
  if (!tooltip) {
    failures.push(`${id}: tooltip did not appear`);
    continue;
  }

  const tbox = await tooltip.boundingBox();
  const visible = await tooltip.evaluate(el => {
    const r = el.getBoundingClientRect();
    const style = getComputedStyle(el);
    return (
      style.visibility !== 'hidden' &&
      parseFloat(style.opacity) > 0.5 &&
      r.width > 0 &&
      r.height > 0 &&
      r.top >= 0 &&
      r.left >= 0 &&
      r.bottom <= window.innerHeight &&
      r.right <= window.innerWidth
    );
  });

  if (!visible) {
    failures.push(`${id}: tooltip not fully visible (${JSON.stringify(tbox)})`);
  } else {
    const hasDial = await tooltip.$('.fear-dial-card');
    const hasBtn = await tooltip.$('.tech-node__explore');
    if (!hasDial || !hasBtn) failures.push(`${id}: tooltip missing dial or button`);
    else console.log(`OK ${id}: tooltip at (${Math.round(tbox.x)}, ${Math.round(tbox.y)})`);
  }

  await page.mouse.move(0, 0);
  await page.waitForTimeout(150);
}

// Test modal citation links for generative AI
await page.click('.tech-node[data-id="generative-ai"] .tech-node__trigger');
await page.waitForSelector('#detail-modal[open], #detail-modal:not([hidden])', { timeout: 3000 }).catch(() => null);
const modalOpen = await page.evaluate(() => {
  const m = document.getElementById('detail-modal');
  return m?.open || getComputedStyle(m).display !== 'none';
});
if (modalOpen) {
  const refLinks = await page.$$('#modal-content a.ref-badge[href^="http"]');
  console.log(`Modal has ${refLinks.length} external citation links`);
  for (const link of refLinks.slice(0, 3)) {
    const href = await link.getAttribute('href');
    console.log(`  citation: ${href}`);
  }
} else {
  failures.push('generative-ai modal did not open');
}

await browser.close();

if (failures.length) {
  console.error('\nFailures:');
  failures.forEach(f => console.error(' -', f));
  process.exit(1);
}
console.log('\nAll tooltip tests passed.');
