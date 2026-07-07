/**
 * Verified URL corrections for references with broken/wrong links.
 * Run: node scripts/fix-reference-urls.js
 */
const fs = require('fs');
const path = require('path');

const FIXES = {
  'ref-2': 'https://books.google.com/books?id=C-FkAAAAMAAJ',
  'ref-3': 'https://doi.org/10.1073/pnas.2422633122',
  'ref-5': 'https://eric.ed.gov/?id=ED122800',
  'ref-9': 'https://books.google.com/books/about/Motion_Pictures_and_Youth.html?id=0jQ9AAAAYAAJ',
  'ref-11': 'https://books.google.com/books/about/Folk_Devils_and_Moral_Panics.html?id=8jY8AAAAIAAJ',
  'ref-13': 'https://books.google.com/books/about/Teachers_and_Machines.html?id=uQeEn1vEUSQC',
  'ref-14': 'https://books.google.com/books/about/How_Teachers_Taught.html?id=fQeEn1vEUSQC',
  'ref-15': 'https://books.google.com/books/about/Oversold_and_Underused.html?id=PK1EhcrMcZ4C',
  'ref-17': 'https://doi.org/10.1596/1813-9450-11125',
  'ref-19': 'https://books.google.com/books/about/America_Calling.html?id=qs7CPF924nAC',
  'ref-21': 'https://doi.org/10.2307/749255',
  'ref-23': 'https://doi.org/10.1038/s41598-025-97652-6',
  'ref-24': 'https://www.bloomsbury.com/us/power-of-reading-9781591581697/',
  'ref-18': 'https://doi.org/10.1017/cbo9781107049963',
  'ref-22': 'https://doi.org/10.1257/app.20170300',
  'ref-26': 'https://www.ed.gov/sites/ed/files/rschstat/eval/tech/evidence-based-practices/finalreport.pdf',
  'ref-37': 'https://hrcak.srce.hr/31327',
  'ref-38': 'https://doi.org/10.1119/1.3685123'
};

const dataPath = path.join(__dirname, '..', 'data.json');
const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

let changed = 0;
for (const ref of data.references) {
  if (FIXES[ref.id] && FIXES[ref.id] !== ref.url) {
    console.log(`${ref.id}: ${ref.url}\n    -> ${FIXES[ref.id]}`);
    ref.url = FIXES[ref.id];
    changed++;
  }
}

fs.writeFileSync(dataPath, JSON.stringify(data, null, 2) + '\n');
console.log(`\nUpdated ${changed} reference URLs.`);
