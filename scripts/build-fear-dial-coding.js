#!/usr/bin/env node
/**
 * Build data/fear-dial-coding.csv from data.json + curated checklist coding.
 *
 * Existing fields (fears, dial, control, engines, etc.) are authoritative from data.json.
 * Checklist columns (claim_clarity … learning_centrality) and dial_justification are
 * retrospective codes applying the on-site Fear Dial protocol to each technology's
 * documented evidence — they were not in the original matrix.
 *
 * Run: node scripts/build-fear-dial-coding.js
 */
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const data = JSON.parse(fs.readFileSync(path.join(root, 'data.json'), 'utf8'));

const CODING_NOTE =
  'Checklist components coded retrospectively from site evidence using the Fear Dial protocol; final dial matches data.json.';

/**
 * Per-technology checklist: claim_clarity, public_reach, duration,
 * institutional_response, learning_centrality → Low | Mid | High
 * plus one-sentence dial_justification.
 */
const CHECKLIST = {
  writing: {
    claim_clarity: 'High',
    public_reach: 'Mid',
    duration: 'High',
    institutional_response: 'Low',
    learning_centrality: 'High',
    dial_justification:
      'Plato’s memory-atrophy claim is explicit and enduring, but historically elite rather than a mass school panic → dial 2.'
  },
  'printing-press': {
    claim_clarity: 'Mid',
    public_reach: 'Mid',
    duration: 'Mid',
    institutional_response: 'Mid',
    learning_centrality: 'Mid',
    dial_justification:
      'Learning worries about vulgar literacy mixed with morality/order claims; documented but not a modern-scale school panic → dial 2.'
  },
  novels: {
    claim_clarity: 'High',
    public_reach: 'High',
    duration: 'High',
    institutional_response: 'Mid',
    learning_centrality: 'High',
    dial_justification:
      'Clear public “reading mania” / displacement claims with schooling stakes → dial 3.'
  },
  railways: {
    claim_clarity: 'Low',
    public_reach: 'High',
    duration: 'Mid',
    institutional_response: 'Mid',
    learning_centrality: 'Low',
    dial_justification:
      'Panic centered on health and public order, not cognitive harm to schooling → dial 0.'
  },
  telegraph: {
    claim_clarity: 'Low',
    public_reach: 'Mid',
    duration: 'Mid',
    institutional_response: 'Low',
    learning_centrality: 'Low',
    dial_justification:
      'Social/health unease without a core learning panic → dial 0.'
  },
  telephone: {
    claim_clarity: 'Low',
    public_reach: 'Mid',
    duration: 'Mid',
    institutional_response: 'Low',
    learning_centrality: 'Low',
    dial_justification:
      'Morality and etiquette fears dominated; learning claims absent at scale → dial 0.'
  },
  movies: {
    claim_clarity: 'High',
    public_reach: 'High',
    duration: 'High',
    institutional_response: 'High',
    learning_centrality: 'High',
    dial_justification:
      'Payne Fund–era claims about young minds plus broad public and institutional response → dial 3.'
  },
  radio: {
    claim_clarity: 'Mid',
    public_reach: 'High',
    duration: 'Mid',
    institutional_response: 'Mid',
    learning_centrality: 'Mid',
    dial_justification:
      'Documented learning/contamination worries with wide reach, but weaker lasting school settlement than TV → dial 2.'
  },
  'comic-books': {
    claim_clarity: 'High',
    public_reach: 'High',
    duration: 'High',
    institutional_response: 'High',
    learning_centrality: 'High',
    dial_justification:
      'Wertham-era literacy and “young minds” panic with hearings, bans, and Comics Code → dial 3.'
  },
  television: {
    claim_clarity: 'High',
    public_reach: 'High',
    duration: 'High',
    institutional_response: 'High',
    learning_centrality: 'High',
    dial_justification:
      'National, multi-decade displacement/contamination panic entering family life and school policy → dial 4.'
  },
  'rock-and-roll': {
    claim_clarity: 'Low',
    public_reach: 'High',
    duration: 'Mid',
    institutional_response: 'Mid',
    learning_centrality: 'Low',
    dial_justification:
      'Morality and order panic without a sustained learning/cognitive core → dial 0.'
  },
  'pocket-calculator': {
    claim_clarity: 'High',
    public_reach: 'High',
    duration: 'High',
    institutional_response: 'High',
    learning_centrality: 'High',
    dial_justification:
      'Explicit classroom skill-substitution panic (mental arithmetic) with school policy fights → dial 3.'
  },
  'home-video-vhs': {
    claim_clarity: 'Low',
    public_reach: 'High',
    duration: 'Mid',
    institutional_response: 'Mid',
    learning_centrality: 'Low',
    dial_justification:
      'Home morality panic; school use was often framed as instructional, not cognitive ruin → dial 0.'
  },
  'personal-computer': {
    claim_clarity: 'Mid',
    public_reach: 'Mid',
    duration: 'Mid',
    institutional_response: 'Mid',
    learning_centrality: 'Mid',
    dial_justification:
      'Learning fears present but often about access/exclusion as much as cognitive harm; limited peak settlement → dial 2.'
  },
  'dungeons-and-dragons': {
    claim_clarity: 'Low',
    public_reach: 'High',
    duration: 'High',
    institutional_response: 'Mid',
    learning_centrality: 'Low',
    dial_justification:
      'Classic morality/occult panic; learning/cognitive claims not the core → dial 0.'
  },
  'video-games': {
    claim_clarity: 'High',
    public_reach: 'High',
    duration: 'High',
    institutional_response: 'High',
    learning_centrality: 'High',
    dial_justification:
      'Sustained public displacement/contamination claims about attention and young minds → dial 3.'
  },
  internet: {
    claim_clarity: 'High',
    public_reach: 'High',
    duration: 'High',
    institutional_response: 'High',
    learning_centrality: 'High',
    dial_justification:
      'Broad learning, integrity, and contamination panic across schools and households → dial 3.'
  },
  'social-media': {
    claim_clarity: 'High',
    public_reach: 'High',
    duration: 'High',
    institutional_response: 'High',
    learning_centrality: 'High',
    dial_justification:
      'Ongoing public attention/learning panic with parental and school responses → dial 3.'
  },
  smartphones: {
    claim_clarity: 'High',
    public_reach: 'High',
    duration: 'High',
    institutional_response: 'High',
    learning_centrality: 'High',
    dial_justification:
      'Mass, multi-institution panic over attention and young minds with bans and lasting policy struggle → dial 5.'
  },
  'generative-ai': {
    claim_clarity: 'High',
    public_reach: 'High',
    duration: 'High',
    institutional_response: 'High',
    learning_centrality: 'High',
    dial_justification:
      'System-wide substitution/integrity panic framed as ruin of student thinking and assessment → dial 5.'
  },
  paper: {
    claim_clarity: 'Low',
    public_reach: 'Low',
    duration: 'Mid',
    institutional_response: 'Mid',
    learning_centrality: 'Low',
    dial_justification:
      'Durability/record fears, not learning panic → dial 0.'
  },
  'hindu-arabic-numerals': {
    claim_clarity: 'Low',
    public_reach: 'Low',
    duration: 'Mid',
    institutional_response: 'Mid',
    learning_centrality: 'Low',
    dial_justification:
      'Forgery/public-order concerns in ledgers, not cognitive harm to schooling → dial 0.'
  },
  'handwriting-technologies-slates-to-ballpoints-typewriter': {
    claim_clarity: 'Mid',
    public_reach: 'Mid',
    duration: 'Mid',
    institutional_response: 'Mid',
    learning_centrality: 'High',
    dial_justification:
      'Documented skill-substitution worries (handwriting, carelessness) with limited mass panic → dial 2.'
  },
  chess: {
    claim_clarity: 'Mid',
    public_reach: 'Low',
    duration: 'Low',
    institutional_response: 'Low',
    learning_centrality: 'Mid',
    dial_justification:
      'Learning/displacement claims exist but niche reach and weak institutional schooling panic → dial 0.'
  },
  'penny-dreadfuls-and-dime-novels': {
    claim_clarity: 'Mid',
    public_reach: 'High',
    duration: 'Mid',
    institutional_response: 'Mid',
    learning_centrality: 'Mid',
    dial_justification:
      'Partial learning claims amid stronger morality/order panic; documented but not peak comic-book scale → dial 2.'
  },
  'phonograph-and-player-piano': {
    claim_clarity: 'Mid',
    public_reach: 'Mid',
    duration: 'Mid',
    institutional_response: 'Low',
    learning_centrality: 'High',
    dial_justification:
      'Substitution fears about musical skill with limited school-wide settlement → dial 2.'
  },
  'sunday-comic-strips': {
    claim_clarity: 'Mid',
    public_reach: 'Mid',
    duration: 'Mid',
    institutional_response: 'Low',
    learning_centrality: 'Mid',
    dial_justification:
      'Partial literacy/contamination worries; precursor intensity below comic-book Code era → dial 2.'
  },
  'crossword-puzzles': {
    claim_clarity: 'Mid',
    public_reach: 'Mid',
    duration: 'Low',
    institutional_response: 'Low',
    learning_centrality: 'Mid',
    dial_justification:
      'Brief public displacement/time-wasting claims without lasting school panic → dial 2.'
  },
  'automation-cybernation': {
    claim_clarity: 'Mid',
    public_reach: 'Mid',
    duration: 'Mid',
    institutional_response: 'Mid',
    learning_centrality: 'Mid',
    dial_justification:
      'Partial learning/skills-obsolescence framing mixed with labor-order panic → dial 2.'
  },
  photocopier: {
    claim_clarity: 'Mid',
    public_reach: 'Mid',
    duration: 'Mid',
    institutional_response: 'Mid',
    learning_centrality: 'Mid',
    dial_justification:
      'Integrity/copying worries in schools with limited cognitive-ruin rhetoric → dial 2.'
  },
  walkman: {
    claim_clarity: 'Mid',
    public_reach: 'Mid',
    duration: 'Mid',
    institutional_response: 'Mid',
    learning_centrality: 'Mid',
    dial_justification:
      'Classroom distraction/displacement claims at moderate public scale → dial 2.'
  },
  pagers: {
    claim_clarity: 'Low',
    public_reach: 'High',
    duration: 'Mid',
    institutional_response: 'High',
    learning_centrality: 'Low',
    dial_justification:
      'School bans driven mainly by order/drug-dealer framing; learning claims secondary → dial 2 (partial learning).'
  },
  'mobile-phone-wi-fi-and-5g-radiation': {
    claim_clarity: 'Low',
    public_reach: 'High',
    duration: 'High',
    institutional_response: 'Mid',
    learning_centrality: 'Low',
    dial_justification:
      'Primarily health panic; learning coded Partial at most → dial 2.'
  },
  'virtual-reality': {
    claim_clarity: 'Mid',
    public_reach: 'Mid',
    duration: 'Mid',
    institutional_response: 'Low',
    learning_centrality: 'Mid',
    dial_justification:
      'Emerging developmental/learning worries without mass school settlement → dial 2.'
  },
  'texting-and-instant-messaging': {
    claim_clarity: 'High',
    public_reach: 'High',
    duration: 'High',
    institutional_response: 'Mid',
    learning_centrality: 'High',
    dial_justification:
      'Public literacy/substitution panic (“textisms ruin writing”) at clear scale → dial 3.'
  },
  wikipedia: {
    claim_clarity: 'High',
    public_reach: 'High',
    duration: 'High',
    institutional_response: 'High',
    learning_centrality: 'High',
    dial_justification:
      'School integrity and knowledge-quality panic with widespread classroom bans → dial 3.'
  },
  'gps-navigation': {
    claim_clarity: 'Mid',
    public_reach: 'Low',
    duration: 'Low',
    institutional_response: 'Low',
    learning_centrality: 'Mid',
    dial_justification:
      'Substitution claims about spatial skill exist but remain niche, not a school mass panic → dial 0.'
  },
  'search-engines': {
    claim_clarity: 'High',
    public_reach: 'Mid',
    duration: 'Mid',
    institutional_response: 'Mid',
    learning_centrality: 'High',
    dial_justification:
      'Explicit memory/substitution claims (“Google effect”) with moderate institutional schooling heat → dial 2.'
  },
  '3d-printing': {
    claim_clarity: 'Low',
    public_reach: 'Low',
    duration: 'Low',
    institutional_response: 'Low',
    learning_centrality: 'Low',
    dial_justification:
      'Order/safety framing dominates; no meaningful learning panic → dial 0.'
  },
  'smart-speakers-and-voice-assistants': {
    claim_clarity: 'Mid',
    public_reach: 'Low',
    duration: 'Low',
    institutional_response: 'Low',
    learning_centrality: 'Mid',
    dial_justification:
      'Partial substitution worries without sustained public school panic → dial 0.'
  },
  'fidget-spinners': {
    claim_clarity: 'Mid',
    public_reach: 'Mid',
    duration: 'Low',
    institutional_response: 'Mid',
    learning_centrality: 'Mid',
    dial_justification:
      'Short classroom distraction panic with school bans; limited duration → dial 2.'
  },
  spectacles: {
    claim_clarity: 'Low',
    public_reach: 'Low',
    duration: 'Low',
    institutional_response: 'Low',
    learning_centrality: 'Low',
    dial_justification:
      'Quiet transformer; no documented learning panic → dial 0.'
  },
  'blackboard-and-chalk': {
    claim_clarity: 'Low',
    public_reach: 'Low',
    duration: 'Low',
    institutional_response: 'Low',
    learning_centrality: 'Low',
    dial_justification:
      'Institutional quiet transformer; no learning panic → dial 0.'
  },
  braille: {
    claim_clarity: 'Low',
    public_reach: 'Low',
    duration: 'Low',
    institutional_response: 'Low',
    learning_centrality: 'Low',
    dial_justification:
      'Accessibility technology without learning panic → dial 0.'
  },
  'penny-post-and-correspondence-education': {
    claim_clarity: 'Low',
    public_reach: 'Low',
    duration: 'Low',
    institutional_response: 'Low',
    learning_centrality: 'Low',
    dial_justification:
      'Quiet transformer of distance education; order concerns peripheral → dial 0.'
  },
  'pencil-with-attached-eraser': {
    claim_clarity: 'Low',
    public_reach: 'Low',
    duration: 'Low',
    institutional_response: 'Low',
    learning_centrality: 'Low',
    dial_justification:
      'Trace of carelessness worry never scaled to panic → dial 0.'
  },
  'the-school-science-laboratory': {
    claim_clarity: 'Low',
    public_reach: 'Low',
    duration: 'Low',
    institutional_response: 'Low',
    learning_centrality: 'Low',
    dial_justification:
      'Quiet institutional transformer; no learning panic → dial 0.'
  },
  'mimeograph-and-spirit-duplicators': {
    claim_clarity: 'Low',
    public_reach: 'Low',
    duration: 'Low',
    institutional_response: 'Low',
    learning_centrality: 'Low',
    dial_justification:
      'Quiet school reproduction tech; no learning panic → dial 0.'
  },
  'electric-school-clocks-and-bells': {
    claim_clarity: 'Low',
    public_reach: 'Low',
    duration: 'Low',
    institutional_response: 'Low',
    learning_centrality: 'Low',
    dial_justification:
      'Quiet institutional infrastructure; no learning panic → dial 0.'
  },
  'slide-rule-in-schooling': {
    claim_clarity: 'Low',
    public_reach: 'Low',
    duration: 'Low',
    institutional_response: 'Low',
    learning_centrality: 'Low',
    dial_justification:
      'Accepted school tool; no learning panic (contrast pocket calculator) → dial 0.'
  },
  'school-building-services-lighting-heating-cooling': {
    claim_clarity: 'Low',
    public_reach: 'Low',
    duration: 'Low',
    institutional_response: 'Low',
    learning_centrality: 'Low',
    dial_justification:
      'Quiet building services; no learning panic → dial 0.'
  },
  'filmstrip-and-slide-projectors': {
    claim_clarity: 'Low',
    public_reach: 'Low',
    duration: 'Low',
    institutional_response: 'Low',
    learning_centrality: 'Low',
    dial_justification:
      'Teacher-controlled AV; no learning panic → dial 0.'
  },
  'machine-test-scoring-ibm-805-to-scantron': {
    claim_clarity: 'Low',
    public_reach: 'Low',
    duration: 'Low',
    institutional_response: 'Low',
    learning_centrality: 'Low',
    dial_justification:
      'Quiet assessment infrastructure; no learning panic → dial 0.'
  },
  'the-yellow-school-bus': {
    claim_clarity: 'Low',
    public_reach: 'Low',
    duration: 'Low',
    institutional_response: 'Low',
    learning_centrality: 'Low',
    dial_justification:
      'Quiet logistics transformer; no learning panic → dial 0.'
  },
  'overhead-projector': {
    claim_clarity: 'Low',
    public_reach: 'Low',
    duration: 'Low',
    institutional_response: 'Low',
    learning_centrality: 'Low',
    dial_justification:
      'Teacher-controlled display; no learning panic → dial 0.'
  },
  'language-laboratory': {
    claim_clarity: 'Low',
    public_reach: 'Low',
    duration: 'Low',
    institutional_response: 'Low',
    learning_centrality: 'Low',
    dial_justification:
      'Institutional language tech; no learning panic → dial 0.'
  },
  'educational-programming-environments-logo-to-scratch': {
    claim_clarity: 'Low',
    public_reach: 'Low',
    duration: 'Low',
    institutional_response: 'Low',
    learning_centrality: 'Low',
    dial_justification:
      'Promoted as cognitive gain more than fear object; dial 0.'
  },
  'assistive-and-accessibility-technologies': {
    claim_clarity: 'Low',
    public_reach: 'Low',
    duration: 'Low',
    institutional_response: 'Low',
    learning_centrality: 'Low',
    dial_justification:
      'Access technologies; no learning panic → dial 0.'
  },
  'probeware-and-microcomputer-based-labs': {
    claim_clarity: 'Low',
    public_reach: 'Low',
    duration: 'Low',
    institutional_response: 'Low',
    learning_centrality: 'Low',
    dial_justification:
      'Lab instrumentation quiet transformer → dial 0.'
  },
  'classroom-response-systems-clickers-to-kahoot': {
    claim_clarity: 'Low',
    public_reach: 'Low',
    duration: 'Low',
    institutional_response: 'Low',
    learning_centrality: 'Low',
    dial_justification:
      'Teacher-controlled engagement tools; no learning panic → dial 0.'
  },
  'interactive-whiteboards': {
    claim_clarity: 'Low',
    public_reach: 'Low',
    duration: 'Low',
    institutional_response: 'Low',
    learning_centrality: 'Low',
    dial_justification:
      'Institutional display tech; no learning panic → dial 0.'
  },
  'learning-management-systems': {
    claim_clarity: 'Low',
    public_reach: 'Low',
    duration: 'Low',
    institutional_response: 'Low',
    learning_centrality: 'Low',
    dial_justification:
      'Administrative/pedagogical platform; no learning panic → dial 0.'
  },
  'plagiarism-detection-services': {
    claim_clarity: 'Low',
    public_reach: 'Low',
    duration: 'Low',
    institutional_response: 'Low',
    learning_centrality: 'Low',
    dial_justification:
      'Integrity enforcement tool, not a panic object → dial 0.'
  },
  'interactive-science-simulations-phet': {
    claim_clarity: 'Low',
    public_reach: 'Low',
    duration: 'Low',
    institutional_response: 'Low',
    learning_centrality: 'Low',
    dial_justification:
      'Quiet instructional simulation suite → dial 0.'
  },
  'chromebooks-and-cloud-classroom-suites': {
    claim_clarity: 'Low',
    public_reach: 'Low',
    duration: 'Low',
    institutional_response: 'Low',
    learning_centrality: 'Low',
    dial_justification:
      'Institutional adoption wave; residual order concerns not a learning panic → dial 0.'
  },
  'machine-translation-in-the-language-classroom': {
    claim_clarity: 'Mid',
    public_reach: 'Low',
    duration: 'Mid',
    institutional_response: 'Low',
    learning_centrality: 'Mid',
    dial_justification:
      'Partial substitution/integrity worries in language classes without mass panic → dial 0.'
  },
  'videoconferencing-and-emergency-remote-teaching': {
    claim_clarity: 'Mid',
    public_reach: 'High',
    duration: 'Mid',
    institutional_response: 'High',
    learning_centrality: 'Mid',
    dial_justification:
      'Partial learning-quality fears during emergency remote teaching at high institutional scale → dial 2.'
  }
};

const LEVELS = new Set(['Low', 'Mid', 'High']);
const CHECK_KEYS = [
  'claim_clarity',
  'public_reach',
  'duration',
  'institutional_response',
  'learning_centrality'
];

function csvEscape(value) {
  const s = value == null ? '' : String(value);
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

function rowToCsv(cols, row) {
  return cols.map(c => csvEscape(row[c])).join(',');
}

const missing = [];
const bad = [];

for (const t of data.technologies) {
  const c = CHECKLIST[t.id];
  if (!c) {
    missing.push(t.id);
    continue;
  }
  for (const k of CHECK_KEYS) {
    if (!LEVELS.has(c[k])) bad.push(`${t.id}.${k}=${c[k]}`);
  }
  if (!c.dial_justification) bad.push(`${t.id}.dial_justification`);
}

if (missing.length || bad.length) {
  console.error('Checklist incomplete:', { missing, bad });
  process.exit(1);
}

if (Object.keys(CHECKLIST).length !== data.technologies.length) {
  const extra = Object.keys(CHECKLIST).filter(
    id => !data.technologies.some(t => t.id === id)
  );
  if (extra.length) {
    console.error('Extra checklist ids not in data.json:', extra);
    process.exit(1);
  }
}

const cols = [
  'id',
  'name',
  'era',
  'origin_year',
  'impact_year',
  'learning',
  'morality',
  'health',
  'public_order',
  'dial',
  'control',
  'engines',
  'transformed',
  'has_panic',
  'is_quiet_transformer',
  'is_added',
  'claim_clarity',
  'public_reach',
  'duration',
  'institutional_response',
  'learning_centrality',
  'dial_justification',
  'coding_note'
];

const rows = data.technologies.map(t => {
  const c = CHECKLIST[t.id];
  // Consistency guards
  if (t.fears.Learning === 'No' && c.learning_centrality === 'High') {
    console.error(`Inconsistent: ${t.id} Learning=No but learning_centrality=High`);
    process.exit(1);
  }
  return {
    id: t.id,
    name: t.name,
    era: t.era,
    origin_year: t.originYear,
    impact_year: t.impactYear,
    learning: t.fears.Learning,
    morality: t.fears.Morality,
    health: t.fears.Health,
    public_order: t.fears['Public order'],
    dial: t.dial,
    control: t.control || '',
    engines: (t.engines || []).join('; '),
    transformed: t.transformed,
    has_panic: t.hasPanic ? 'Yes' : 'No',
    is_quiet_transformer: t.isQuietTransformer ? 'Yes' : 'No',
    is_added: t.isAdded ? 'Yes' : 'No',
    claim_clarity: c.claim_clarity,
    public_reach: c.public_reach,
    duration: c.duration,
    institutional_response: c.institutional_response,
    learning_centrality: c.learning_centrality,
    dial_justification: c.dial_justification,
    coding_note: CODING_NOTE
  };
});

const outDir = path.join(root, 'data');
const csvPath = path.join(outDir, 'fear-dial-coding.csv');
const csv = [cols.join(','), ...rows.map(r => rowToCsv(cols, r))].join('\n') + '\n';
fs.writeFileSync(csvPath, csv);

const readme = `Fear Dial coding spreadsheet
============================

File: fear-dial-coding.csv
Technologies: ${rows.length}
Generated by: scripts/build-fear-dial-coding.js

WHAT IS AUTHORITATIVE (from data.json)
--------------------------------------
id, name, era, origin_year, impact_year
learning, morality, health, public_order   — Yes / Partial / No fear-type codes
dial                                       — final Fear Dial 0, 2, 3, 4, or 5 (learning/cognitive only)
control                                    — child / adult / institution
engines                                    — substitution; displacement; integrity; contamination
transformed, has_panic, is_quiet_transformer, is_added

WHAT WAS CODED RETROSPECTIVELY
------------------------------
claim_clarity, public_reach, duration, institutional_response, learning_centrality
  Levels: Low | Mid | High  (see on-site Fear Dial checklist)
dial_justification
  One sentence linking the checklist profile to the final dial
coding_note
  States that checklist columns are retrospective protocol applications

IMPORTANT
---------
The Fear Dial measures learning / cognitive-development panic only.
Morality, health, and public-order fears are tracked in separate columns and
do not by themselves raise the dial.

Scale used on this site: 0, 2, 3, 4, 5 (1 is unused).

Regenerate after editing CHECKLIST in the build script or data.json:
  node scripts/build-fear-dial-coding.js
`;

fs.writeFileSync(path.join(outDir, 'fear-dial-coding-README.txt'), readme);

console.log(`Wrote ${rows.length} rows → ${path.relative(root, csvPath)}`);
