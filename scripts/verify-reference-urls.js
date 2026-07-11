#!/usr/bin/env node
/**
 * Verify all reference URLs in data.json return HTTP 2xx/3xx.
 * Usage: node scripts/verify-reference-urls.js
 */
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const data = JSON.parse(readFileSync(join(root, 'data.json'), 'utf8'));
const refs = data.references || [];

const UA = 'Mozilla/5.0 (compatible; EducationTechTimeline/1.0; +https://github.com/)';

async function checkUrl(ref) {
  const url = ref.url;
  try {
    const res = await fetch(url, {
      method: 'GET',
      redirect: 'follow',
      headers: { 'User-Agent': UA, Accept: 'text/html,*/*' },
      signal: AbortSignal.timeout(20000)
    });
    const ok = res.status >= 200 && res.status < 400;
    const finalUrl = res.url;
    let issue = null;
    const text = ok ? (await res.text()).slice(0, 8000).toLowerCase() : '';
    if (text.includes('doi not found') || text.includes('this doi cannot be found')) {
      issue = 'DOI NOT FOUND page';
    }
    if (text.includes('this document is being processed or is not available')) {
      issue = 'World Bank unavailable page';
    }
    if (text.includes('page not found') && url.includes('eric.ed.gov')) {
      issue = 'ERIC not found';
    }
    return { id: ref.id, url, status: res.status, ok: ok && !issue, issue, finalUrl };
  } catch (err) {
    return { id: ref.id, url, status: 0, ok: false, issue: err.message };
  }
}

const results = [];
for (const ref of refs) {
  results.push(await checkUrl(ref));
  process.stdout.write('.');
}
console.log('\n');

const failed = results.filter(r => !r.ok);
console.log(`Checked ${results.length} URLs - ${failed.length} failed\n`);
for (const r of failed) {
  console.log(`${r.id}: ${r.status} ${r.issue || ''}`);
  console.log(`  ${r.url}`);
  if (r.finalUrl && r.finalUrl !== r.url) console.log(`  → ${r.finalUrl}`);
}

process.exit(failed.length ? 1 : 0);
