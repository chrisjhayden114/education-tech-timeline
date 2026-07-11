/**
 * Verified URL corrections for references with broken/wrong/missing links.
 * Run: node scripts/fix-reference-urls.js
 *
 * Also syncs shorthand duplicate citations to the same URL as their full citation.
 */
const fs = require('fs');
const path = require('path');

const IPARADIGMS =
  'https://www.ca4.uscourts.gov/Opinions/Published/081424.P.pdf';

const FIXES = {
  // Broken / soft-404 existing URLs
  'ref-8': 'https://doi.org/10.1080/15391523.2014.925701',
  'ref-9':
    'https://onlinebooks.library.upenn.edu/webbin/book/lookupid?key=ha001011570',
  'ref-11':
    'https://www.routledge.com/Folk-Devils-and-Moral-Panics/Cohen/p/book/9780415610162',
  'ref-14':
    'https://books.google.com/books/about/How_Teachers_Taught.html?id=cTpORm0xgMoC',
  'ref-15':
    'https://books.google.com/books/about/Oversold_and_Underused.html?id=CG-dAAAAMAAJ',
  'ref-19': 'https://doi.org/10.1525/9780520915008',
  'ref-25': 'https://www.ucpress.edu/books/dangerous-games/paper',
  'ref-26': 'https://eric.ed.gov/?id=ED505824',
  'ref-31':
    'https://www.penguinrandomhouse.com/books/297276/amusing-ourselves-to-death-by-neil-postman/',
  'ref-34':
    'https://books.google.com/books/about/The_Victorian_Internet.html?id=vPVbi6GVodAC',
  'ref-36': 'https://www.hup.harvard.edu/books/9780674637825',
  'ref-60':
    'https://www.nytimes.com/1988/09/25/us/schools-responding-to-beeper-tool-of-today-s-drug-dealer-by-banning-it.html',
  'ref-72':
    'https://www.nytimes.com/1988/09/25/us/schools-responding-to-beeper-tool-of-today-s-drug-dealer-by-banning-it.html',
  'ref-80': IPARADIGMS,
  'ref-113': IPARADIGMS,

  // Previously-null full citations
  'ref-41': 'https://doi.org/10.1016/B978-0-12-809481-5.00009-2',
  'ref-42': 'https://doi.org/10.14361/transcript.9783839423820.203',
  'ref-43': 'https://books.google.com/books?id=pKBnEGwmtZoC',
  'ref-44': 'https://doi.org/10.1038/s41598-020-62877-0',
  'ref-45': 'https://iupress.org/9780253217080/the-puzzle-instinct/',
  'ref-46':
    'https://uk.sagepub.com/en-gb/eur/doing-cultural-studies/book234568',
  'ref-47':
    'https://www.bloomsbury.com/us/plagiarism-in-higher-education-9798216128618/',
  'ref-48': 'https://doi.org/10.1038/438900a',
  'ref-49':
    'https://openlibrary.org/books/OL678932M/Comic_strips_and_consumer_culture_1890-1945',
  'ref-50': 'https://doi.org/10.1177/1087054718770009',
  'ref-51': 'https://www.hup.harvard.edu/books/9780674037984',
  'ref-52': 'https://doi.org/10.5210/fm.v15i3.2830',
  'ref-53':
    'https://publications.iarc.fr/Book-And-Report-Series/Iarc-Monographs-On-The-Identification-Of-Carcinogenic-Hazards-To-Humans/Non-ionizing-Radiation-Part-2-Radiofrequency-Electromagnetic-Fields-2013',
  'ref-54': 'https://www.ucpress.edu/books/capturing-sound/paper',
  'ref-55': 'https://doi.org/10.1080/00221340308978534',
  'ref-56': 'https://books.google.com/books/about/Paper.html?id=v_d1CQAAQBAJ',
  'ref-57': 'https://doi.org/10.1145/3311927.3323150',
  'ref-58':
    'https://openlibrary.org/books/OL1561377M/Number_words_and_number_symbols',
  'ref-59': 'https://doi.org/10.1016/j.compedu.2013.07.033',
  'ref-61': 'https://doi.org/10.1348/026151008X320507',
  'ref-62': 'https://doi.org/10.1016/j.edurev.2016.02.002',
  'ref-63': 'https://doi.org/10.1007/978-1-349-27458-1',
  'ref-64': 'https://eric.ed.gov/?id=EJ853381',
  'ref-65': 'https://doi.org/10.1016/j.atmosenv.2013.06.050',
  'ref-66':
    'https://yalebooks.yale.edu/book/9780300074413/handwriting-in-america/',
  'ref-67':
    'https://books.google.com/books/about/Practical_Mathematics_in_the_italian_Ren.html?id=zWno0QEACAAJ',
  'ref-68':
    'https://www.who.int/news-room/questions-and-answers/item/radiation-electromagnetic-fields/',
  'ref-81': 'https://archive.org/details/blackboardinprim00bums',
  'ref-82': 'https://archive.org/details/historyofideasin0000debo',
  'ref-83': 'https://doi.org/10.1111/flan.12366',
  'ref-84': 'https://doi.org/10.1080/17439880701511040',
  'ref-85':
    'https://er.educause.edu/articles/2020/3/the-difference-between-emergency-remote-teaching-and-online-learning',
  'ref-86':
    'https://books.google.com/books/about/Renaissance_Vision_from_Spectacles_to_Te.html?id=peIL7hVQUmwC',
  'ref-87': 'https://doi.org/10.2307/1315198',
  'ref-88': 'https://doi.org/10.1007/s11528-021-00599-4',
  'ref-89': 'https://openlibrary.org/works/OL29623W/The_Big_Test',
  'ref-90': 'https://openlibrary.org/works/OL3271244W/Peer_Instruction',
  'ref-91': 'https://shop.nbp.org/products/louis-braille-a-touch-of-genius',
  'ref-92': 'https://openlibrary.org/works/OL2145077W/Distance_education',
  'ref-93': 'https://books.google.com/books/about/Mindstorms.html?id=nDjRDwAAQBAJ',
  'ref-94': 'https://doi.org/10.1257/pol.20180612',
  'ref-95': 'https://doi.org/10.1016/0732-118X(84)90018-7',
  'ref-96': 'https://books.google.com/books/about/The_Pencil.html?id=ScgxcEGM_igC',
  'ref-98':
    'https://www.cast.org/resources/teaching-every-student-in-the-digital-age',
  'ref-99': 'https://doi.org/10.1111/0026-7902.00096',
  'ref-100':
    'https://www.nytimes.com/2017/05/13/technology/google-education-chromebooks-schools.html',
  'ref-101': 'https://doi.org/10.1038/scientificamerican0506-80',
  'ref-102': 'https://doi.org/10.1119/1.16350',
  'ref-103': 'https://doi.org/10.1007/s11528-007-0023-y',
  'ref-104': 'https://doi.org/10.1126/science.1161948',

  // Prior verified book/DOI fixes retained from earlier pass
  'ref-2': 'https://books.google.com/books?id=C-FkAAAAMAAJ',
  'ref-3': 'https://doi.org/10.1073/pnas.2422633122',
  'ref-5': 'https://eric.ed.gov/?id=ED122800',
  'ref-13':
    'https://books.google.com/books/about/Teachers_and_Machines.html?id=uQeEn1vEUSQC',
  'ref-17': 'https://doi.org/10.1596/1813-9450-11125',
  'ref-18': 'https://doi.org/10.1017/cbo9781107049963',
  'ref-21': 'https://doi.org/10.2307/749255',
  'ref-22': 'https://doi.org/10.1257/app.20170300',
  'ref-23': 'https://doi.org/10.1038/s41598-025-97652-6',
  'ref-24': 'https://www.bloomsbury.com/us/power-of-reading-9781591581697/',
  'ref-37': 'https://hrcak.srce.hr/31327',
  'ref-38': 'https://doi.org/10.1119/1.3685123'
};

/** Shorthand / duplicate citations → same URL as the matching full citation */
const DUPLICATES = {
  'ref-71': 'ref-46',
  'ref-72': 'ref-60',
  'ref-73': 'ref-68',
  'ref-74': 'ref-59',
  'ref-75': 'ref-61',
  'ref-76': 'ref-33',
  'ref-77': 'ref-65',
  'ref-78': 'ref-57',
  'ref-79': 'ref-50',
  'ref-107': 'ref-94',
  'ref-112': 'ref-84',
  'ref-114': 'ref-104',
  'ref-115': 'ref-88',
  'ref-116': 'ref-85'
};

const dataPath = path.join(__dirname, '..', 'data.json');
const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
const byId = Object.fromEntries(data.references.map((r) => [r.id, r]));

let changed = 0;
for (const ref of data.references) {
  if (FIXES[ref.id] && FIXES[ref.id] !== ref.url) {
    console.log(`${ref.id}: ${ref.url}\n    -> ${FIXES[ref.id]}`);
    ref.url = FIXES[ref.id];
    changed++;
  }
}

for (const [dupId, srcId] of Object.entries(DUPLICATES)) {
  const dup = byId[dupId];
  const src = byId[srcId];
  if (!dup || !src?.url) continue;
  if (dup.url !== src.url) {
    console.log(`${dupId}: ${dup.url}\n    -> ${src.url} (same as ${srcId})`);
    dup.url = src.url;
    changed++;
  }
}

fs.writeFileSync(dataPath, JSON.stringify(data, null, 2) + '\n');
console.log(`\nUpdated ${changed} reference URLs.`);
