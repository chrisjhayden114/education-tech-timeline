#!/usr/bin/env node
const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  await page.setViewport({ width: 1400, height: 900 });
  await page.goto('http://localhost:8765/index.html', { waitUntil: 'networkidle0' });
  await page.waitForSelector('.tech-node');

  const failures = [];
  const samples = ['generative-ai', 'rock-and-roll', 'television', 'video-games'];

  for (const id of samples) {
    const sel = `.tech-node[data-id="${id}"]`;
    await page.evaluate(s => document.querySelector(s)?.scrollIntoView({ block: 'center', inline: 'center' }), sel);
    await page.hover(`${sel} .tech-node__trigger`);
    await new Promise(r => setTimeout(r, 350));

    const result = await page.evaluate(() => {
      const tip = document.getElementById('timeline-tooltip');
      if (!tip || tip.hidden) return { ok: false, reason: 'no tooltip' };
      const r = tip.getBoundingClientRect();
      const style = getComputedStyle(tip);
      const ok =
        style.visibility !== 'hidden' &&
        parseFloat(style.opacity) > 0.4 &&
        r.width > 100 &&
        r.height > 80 &&
        r.top >= 0 &&
        r.left >= 0 &&
        r.bottom <= window.innerHeight + 1 &&
        r.right <= window.innerWidth + 1 &&
        tip.querySelector('.fear-dial-card') &&
        tip.querySelector('.tech-node__explore');
      return {
        ok: !!ok,
        rect: { x: r.x, y: r.y, w: r.width, h: r.height },
        opacity: style.opacity
      };
    });

    if (!result.ok) failures.push(`${id}: ${JSON.stringify(result)}`);
    else console.log(`OK ${id}: tooltip ${Math.round(result.rect.x)},${Math.round(result.rect.y)}`);

    await page.mouse.move(10, 10);
    await new Promise(r => setTimeout(r, 150));
  }

  await page.click('.tech-node[data-id="generative-ai"] .tech-node__trigger');
  await new Promise(r => setTimeout(r, 400));
  const modal = await page.evaluate(() => {
    const m = document.getElementById('detail-modal');
    const links = [...document.querySelectorAll('#modal-content a.ref-badge')].map(a => a.href);
    return { open: m?.open, links };
  });
  if (!modal.open) failures.push('modal did not open');
  else console.log('Modal links:', modal.links.slice(0, 3));

  await browser.close();
  if (failures.length) {
    console.error('Failures:', failures);
    process.exit(1);
  }
  console.log('All tests passed');
})();
