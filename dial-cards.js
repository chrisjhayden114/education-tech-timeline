/** Fear intensity dial cards — gauge SVG + card markup matching the reference designs. */

const DIAL_LEVELS = {
  0: { label: 'none', color: '#9aa09a' },
  2: { label: 'low', color: '#e09545' },
  3: { label: 'moderate', color: '#d05d38' },
  4: { label: 'high', color: '#e02020' },
  5: { label: 'severe', color: '#8b1a1a' }
};

const DIAL_CARD_COPY = {
  writing: {
    tags: ['Cognitive erosion', 'Hollow learning'],
    summary: 'Socrates feared memory would wither and wisdom would become mere appearance. Profound in content, tiny in reach.'
  },
  'printing-press': {
    tags: ['Lost gatekeeping', 'Cognitive erosion'],
    summary: 'Clerics feared losing control of texts; scholars mourned the memory arts. Not a schooling panic.'
  },
  novels: {
    tags: ['Displacement', 'Conduct/wellbeing'],
    summary: 'The reading rage: fiction would displace serious reading and derange young minds.'
  },
  railways: {
    tags: ['No learning fear'],
    summary: 'Feared for bodies and nerves, never for learning.'
  },
  telegraph: {
    tags: ['No learning fear'],
    summary: 'Overload and triviality; an adult-society fear.'
  },
  telephone: {
    tags: ['No learning fear'],
    summary: 'Home life and laziness; nothing about schooling.'
  },
  movies: {
    tags: ['Conduct/wellbeing', 'Displacement'],
    summary: 'Pupil conduct, sleep and truancy; the Payne Fund measured attitudes and sleep loss.'
  },
  radio: {
    tags: ['Passivity', 'Displacement'],
    summary: 'Child radio addiction claims and homework worries; the bigger fear was propaganda.'
  },
  'comic-books': {
    tags: ['Displacement', 'Conduct/wellbeing'],
    summary: 'Educators ran a literacy panic: picture reading would stunt real reading. Schools held burnings.'
  },
  television: {
    tags: ['Passivity', 'Cognitive erosion', 'Displacement'],
    summary: 'The analog peak: passivity, illiteracy, attention and homework loss.'
  },
  'rock-and-roll': {
    tags: ['No learning fear'],
    summary: 'Morals and manners, not marks; the school response was dress and dance codes.'
  },
  'pocket-calculator': {
    tags: ['Cognitive erosion'],
    summary: 'Marked * on this timeline. The purest learning fear here: arithmetic collapse, settled by assessment redesign.'
  },
  'home-video-vhs': {
    tags: ['No learning fear'],
    summary: 'Video nasties content panic at home; no claim about learning.'
  },
  'personal-computer': {
    tags: ['Cognitive erosion', 'Conduct/wellbeing'],
    summary: 'Marked * on this timeline. The inverted panic: the mass fear was exclusion, not exposure.'
  },
  'dungeons-and-dragons': {
    tags: ['No learning fear'],
    summary: 'Occult fear and loss of reality; no claim about learning.'
  },
  'video-games': {
    tags: ['Displacement', 'Conduct/wellbeing'],
    summary: 'Homework displacement and addiction harming grades; the violence fear was behavioural.'
  },
  internet: {
    tags: ['Integrity', 'Lost gatekeeping'],
    summary: 'Copy-paste plagiarism panic, unfiltered content and misinformation; safety fears dominated.'
  },
  'social-media': {
    tags: ['Cognitive erosion', 'Conduct/wellbeing'],
    summary: 'Attention and wellbeing degrading readiness to learn; the learning harm is mostly indirect.'
  },
  smartphones: {
    tags: ['Cognitive erosion', 'Displacement', 'Lost gatekeeping'],
    summary: 'An education-centred mass panic over distraction, driving classroom bans across most of the world.'
  },
  'generative-ai': {
    tags: ['Integrity', 'Hollow learning', 'Cognitive erosion'],
    summary: 'A cheating apocalypse plus skill non-formation through offloading; the death of the essay.'
  },
  paper: {
    tags: ['Lost gatekeeping'],
    summary: "Marked * on this timeline. Frederick II's decrees barred paper for official documents as impermanent; the fear was record integrity, not learning."
  },
  'hindu-arabic-numerals': {
    tags: ['Lost gatekeeping'],
    summary: "Marked * on this timeline. Florence barred Arabic numerals in bankers' records on forgery grounds; the zero-as-satanic story is a modern myth."
  },
  'handwriting-technologies-slates-to-ballpoints-typewriter': {
    tags: ['Cognitive erosion'],
    summary: "Marked * on this timeline. Documented worry lives in penmanship journals and 1940s–50s ballpoint resistance; many circulating 'teacher complaint' lists are apocryphal."
  },
  chess: {
    tags: ['Cognitive erosion', 'Conduct/wellbeing'],
    summary: "Marked * on this timeline. Scientific American (1859) condemned the chess craze as wasting young minds; devil and saviour claims both failed."
  },
  'penny-dreadfuls-and-dime-novels': {
    tags: ['Displacement', 'Conduct/wellbeing'],
    summary: "Marked * on this timeline. Direct ancestor of the comic-book panic; schools responded with curated 'wholesome reading' lists and youth libraries."
  },
  'phonograph-and-player-piano': {
    tags: ['Cognitive erosion', 'Conduct/wellbeing'],
    summary: "Marked * on this timeline. Sousa's 'Menace of Mechanical Music' (1906): the first clean offloading-of-a-practised-skill panic."
  },
  'sunday-comic-strips': {
    tags: ['Displacement', 'Conduct/wellbeing'],
    summary: "Marked * on this timeline. 'A Crime Against American Children' (1909); the first comics panic, three decades before Wertham."
  },
  'crossword-puzzles': {
    tags: ['Cognitive erosion', 'Conduct/wellbeing'],
    summary: "Marked * on this timeline. NYT editorials (1924) called the puzzle a primitive mental exercise; the Times adopted it in 1942."
  },
  'automation-cybernation': {
    tags: ['Displacement', 'Lost gatekeeping'],
    summary: "Marked * on this timeline. The Triple Revolution memorandum (1964); direct ancestor of the AI-and-jobs framing in education policy."
  },
  photocopier: {
    tags: ['Displacement', 'Lost gatekeeping'],
    summary: "Marked * on this timeline. Copyright fear settled in Williams & Wilkins (1973); Eaton's integrity-panic lineage runs print to photocopier to word processor."
  },
  walkman: {
    tags: ['Displacement', 'Conduct/wellbeing'],
    summary: "Marked * on this timeline. Bloom (1987) made it a symbol of sealed-off youth; ancestor of earbuds-in-class and smartphone isolation fears."
  },
  pagers: {
    tags: ['Displacement', 'Conduct/wellbeing'],
    summary: "Marked * on this timeline. First pocket communication device banned from schools; policy template for later smartphone bans."
  },
  'mobile-phone-wi-fi-and-5g-radiation': {
    tags: ['Displacement', 'Conduct/wellbeing'],
    summary: "Marked * on this timeline. Reynard lawsuit on Larry King Live (1993); school Wi-Fi removal campaigns and 5G arson followed."
  },
  'virtual-reality': {
    tags: ['Displacement', 'Conduct/wellbeing'],
    summary: "Marked * on this timeline. A panic that keeps arriving before the technology: 1990s dissociation fears, then metaverse child-safety alarm (2021–22)."
  },
  'texting-and-instant-messaging': {
    tags: ['Cognitive erosion', 'Conduct/wellbeing'],
    summary: "Marked * on this timeline. The 2003 'exam essay in text-speak' story traces to a single unverified case; treat it as folklore."
  },
  wikipedia: {
    tags: ['Cognitive erosion', 'Lost gatekeeping'],
    summary: "Marked * on this timeline. Middlebury's citation ban (2007); settled into 'start there, don't cite it' — a template for AI-use norms."
  },
  'gps-navigation': {
    tags: ['Cognitive erosion'],
    summary: "Marked * on this timeline. The cleanest single-skill offloading case after the calculator."
  },
  'search-engines': {
    tags: ['Cognitive erosion'],
    summary: "Marked * on this timeline. Carr's 'Is Google Making Us Stupid?' (2008) bridges older media fears to the AI offloading debate."
  },
  '3d-printing': {
    tags: ['Conduct/wellbeing', 'Lost gatekeeping'],
    summary: "Marked * on this timeline. The gun panic never touched classrooms; the education story is makerspaces and practical health notes."
  },
  'smart-speakers-and-voice-assistants': {
    tags: ['Displacement', 'Conduct/wellbeing'],
    summary: "Marked * on this timeline. The 'Alexa generation' manners alarm; Furby restrictions (1999) are the surveillance-fear precedent."
  },
  'fidget-spinners': {
    tags: ['Cognitive erosion', 'Conduct/wellbeing'],
    summary: "Marked * on this timeline. Marketed as an attention aid, banned as an attention destroyer — full cycle inside a year."
  },
  spectacles: {
    tags: ['Quiet transformer', 'No meaningful panic'],
    summary: "Transformed schooling without a meaningful public panic. Mass-market reading glasses enabled the print boom's literacy expansion."
  },
  'blackboard-and-chalk': {
    tags: ['Quiet transformer', 'No meaningful panic'],
    summary: "Transformed schooling without a meaningful public panic. Coulson's last dramatic instructional innovation — adopted c. 1801 without comment."
  },
  braille: {
    tags: ['Quiet transformer', 'No meaningful panic'],
    summary: "Transformed schooling without a meaningful public panic. Invented by a 15-year-old student; assistive technologies attract essentially no panic."
  },
  'penny-post-and-correspondence-education': {
    tags: ['Quiet transformer', 'No meaningful panic'],
    summary: "Transformed schooling without a meaningful public panic. The origin of distance education; every later remote-learning technology inherits its model."
  },
  'pencil-with-attached-eraser': {
    tags: ['Quiet transformer', 'No meaningful panic'],
    summary: "Transformed schooling without a meaningful public panic. Later the required instrument of machine-scored testing — the humble No. 2 pencil."
  },
  'the-school-science-laboratory': {
    tags: ['Quiet transformer', 'No meaningful panic'],
    summary: "Transformed schooling without a meaningful public panic. Hands-on science entered schooling with saviour rhetoric only — no transformation panic."
  },
  'mimeograph-and-spirit-duplicators': {
    tags: ['Quiet transformer', 'No meaningful panic'],
    summary: "Transformed schooling without a meaningful public panic. The purple ditto page ancestor of the photocopied worksheet economy."
  },
  'electric-school-clocks-and-bells': {
    tags: ['Quiet transformer', 'No meaningful panic'],
    summary: "Transformed schooling without a meaningful public panic. Railway time discipline entering the building — adopted without comment."
  },
  'slide-rule-in-schooling': {
    tags: ['Quiet transformer', 'No meaningful panic'],
    summary: "Transformed schooling without a meaningful public panic. No panic at arrival; the panic at its departure attached to its replacement, the calculator."
  },
  'school-building-services-lighting-heating-cooling': {
    tags: ['Quiet transformer', 'No meaningful panic'],
    summary: "Transformed schooling without a meaningful public panic. Infrastructure beats gadgets — and nobody has ever panicked about a boiler."
  },
  'filmstrip-and-slide-projectors': {
    tags: ['Quiet transformer', 'No meaningful panic'],
    summary: "Transformed schooling without a meaningful public panic. Teacher control, low cost, zero panic — Cuban's fit principle embodied."
  },
  'machine-test-scoring-ibm-805-to-scantron': {
    tags: ['Quiet transformer', 'No meaningful panic'],
    summary: "Transformed schooling without a meaningful public panic. Among the most consequential education technologies of the century and among the least feared."
  },
  'the-yellow-school-bus': {
    tags: ['Quiet transformer', 'No meaningful panic'],
    summary: "Transformed schooling without a meaningful public panic. A transformation of access on the railway's scale with none of the railway's dread."
  },
  'overhead-projector': {
    tags: ['Quiet transformer', 'No meaningful panic'],
    summary: "Transformed schooling without a meaningful public panic. Cuban's contrast case: the technology teachers chose rather than the ones chosen for them."
  },
  'language-laboratory': {
    tags: ['Quiet transformer', 'No meaningful panic'],
    summary: "Transformed schooling without a meaningful public panic. A saviour claim that failed quietly — neither devil nor miracle materialized."
  },
  'educational-programming-environments-logo-to-scratch': {
    tags: ['Quiet transformer', 'No meaningful panic'],
    summary: "Transformed schooling without a meaningful public panic. Pure saviour framing for four decades; panic about code arrived only when AI began writing it."
  },
  'assistive-and-accessibility-technologies': {
    tags: ['Quiet transformer', 'No meaningful panic'],
    summary: "Transformed schooling without a meaningful public panic. Technologies framed as access are welcomed; technologies framed as youth leisure are feared."
  },
  'probeware-and-microcomputer-based-labs': {
    tags: ['Quiet transformer', 'No meaningful panic'],
    summary: "Transformed schooling without a meaningful public panic. Teacher-controlled, curriculum-embedded, strong evidence, zero fear."
  },
  'classroom-response-systems-clickers-to-kahoot': {
    tags: ['Quiet transformer', 'No meaningful panic'],
    summary: "Transformed schooling without a meaningful public panic. Formative-assessment machinery adopted through teachers; students never controlled it."
  },
  'interactive-whiteboards': {
    tags: ['Quiet transformer', 'No meaningful panic'],
    summary: "Transformed schooling without a meaningful public panic. Transformation-scale spending with neither panic nor much measured payoff."
  },
  'learning-management-systems': {
    tags: ['Quiet transformer', 'No meaningful panic'],
    summary: "Transformed schooling without a meaningful public panic. Probably the most-used education technology on Earth, almost never discussed outside the profession."
  },
  'plagiarism-detection-services': {
    tags: ['Quiet transformer', 'No meaningful panic'],
    summary: "Transformed schooling without a meaningful public panic. Created in response to a panic but generates none itself — institutions control it."
  },
  'interactive-science-simulations-phet': {
    tags: ['Quiet transformer', 'No meaningful panic'],
    summary: "Transformed schooling without a meaningful public panic. Founded by a Nobel physicist; hundreds of millions of runs a year, not one recorded fear."
  },
  'chromebooks-and-cloud-classroom-suites': {
    tags: ['Quiet transformer', 'No meaningful panic'],
    summary: "Transformed schooling without a meaningful public panic. The largest device transformation since the textbook, arriving to almost no public comment."
  },
  'machine-translation-in-the-language-classroom': {
    tags: ['Quiet transformer', 'No meaningful panic'],
    summary: "Transformed schooling without a meaningful public panic. The quiet dress rehearsal for generative AI in one subject — same integrity questions, no public alarm."
  },
  'videoconferencing-and-emergency-remote-teaching': {
    tags: ['Quiet transformer', 'No meaningful panic'],
    summary: "Transformed schooling without a meaningful public panic. Learning-loss alarm targeted school closure, not videoconferencing itself."
  }
};

function polar(cx, cy, r, deg) {
  const rad = (deg * Math.PI) / 180;
  return [cx + r * Math.cos(rad), cy - r * Math.sin(rad)];
}

function arcPath(cx, cy, r, startDeg, endDeg) {
  const [x1, y1] = polar(cx, cy, r, startDeg);
  const [x2, y2] = polar(cx, cy, r, endDeg);
  const large = Math.abs(startDeg - endDeg) > 180 ? 1 : 0;
  const sweep = startDeg > endDeg ? 1 : 0;
  return `M ${x1} ${y1} A ${r} ${r} 0 ${large} ${sweep} ${x2} ${y2}`;
}

function dialDisplayLevel(level) {
  const n = Math.max(0, Math.min(5, level ?? 0));
  if (n === 0) return { filled: 0, color: DIAL_LEVELS[0].color, needleDeg: 180 - 0.5 * 36 };
  return {
    filled: n,
    color: DIAL_LEVELS[n].color,
    needleDeg: 180 - (n - 0.5) * 36
  };
}

/** Semi-circular 5-segment fear gauge. */
function fearDialSvg(level, size = 'full') {
  const inactive = '#e6e6e6';
  const cx = 100;
  const cy = 98;
  const r = 78;
  const gap = 2.8;
  const span = 180 / 5;
  const strokeW = size === 'compact' || size === 'panel' ? 14 : 18;
  const { filled, color, needleDeg } = dialDisplayLevel(level);

  let segments = '';
  for (let i = 0; i < 5; i++) {
    const start = 180 - i * span - gap / 2;
    const end = start - span + gap;
    const isFilled = i < filled;
    segments += `<path d="${arcPath(cx, cy, r, start, end)}" fill="none" stroke="${isFilled ? color : inactive}" stroke-width="${strokeW}" stroke-linecap="butt"/>`;
  }

  const [nx, ny] = polar(cx, cy, r - strokeW * 0.35, needleDeg);
  const needle = filled === 0
    ? `<circle cx="${cx}" cy="${cy}" r="4" fill="${color}"/>`
    : `<line x1="${cx}" y1="${cy}" x2="${nx}" y2="${ny}" stroke="${color}" stroke-width="2.2" stroke-linecap="round"/>
       <circle cx="${cx}" cy="${cy}" r="4.5" fill="${color}"/>`;

  const sizes = { compact: [120, 68, '40 30 120 78'], panel: [160, 82, '30 24 140 84'], full: [200, 108, '0 0 200 108'] };
  const [w, h, vb] = sizes[size] || sizes.full;

  return `<svg class="fear-dial-svg fear-dial-svg--${size}" width="${w}" height="${h}" viewBox="${vb}" aria-hidden="true">${segments}${needle}</svg>`;
}

function dialLegendHtml(compact = false) {
  const scale = [
    [0, DIAL_LEVELS[0]],
    [2, DIAL_LEVELS[2]],
    [3, DIAL_LEVELS[3]],
    [4, DIAL_LEVELS[4]],
    [5, DIAL_LEVELS[5]]
  ];
  const items = scale.map(([val, { label, color }]) =>
    `<span class="fear-dial-legend__item"><span class="fear-dial-legend__swatch" style="background:${color}"></span>${val} ${label}</span>`
  ).join('');
  return `
    <footer class="fear-dial-card__legend${compact ? ' fear-dial-card__legend--compact' : ''}">
      <p class="fear-dial-card__legend-title">Education-related fear, 0–5 (intensity at historical peak)</p>
      <div class="fear-dial-legend">${items}</div>
    </footer>
  `;
}

function getDialCardCopy(tech) {
  const copy = DIAL_CARD_COPY[tech.id] || {};
  const raw = copy.summary || tech.notes || '';
  const summary = raw.replace(/^Marked \* on this timeline\.\s*/i, '');
  return {
    tags: copy.tags || [],
    summary
  };
}

function renderFearDialCard(tech, opts = {}) {
  const { showLegend = true, compact = false, panel = false, clickable = false, addedBadge = true } = opts;
  const level = tech.dial ?? 0;
  const meta = DIAL_LEVELS[level] || DIAL_LEVELS[0];
  const { label, color } = meta;
  const { tags, summary } = getDialCardCopy(tech);
  const tagHtml = tags.map(t => `<span class="fear-dial-card__tag">${t}</span>`).join('');
  const added = addedBadge && tech.isAdded ? '<span class="added-badge">*</span>' : '';
  const dialSize = panel ? 'panel' : (compact ? 'compact' : 'full');

  return `
    <article class="fear-dial-card fear-dial-card--level-${level}${compact ? ' fear-dial-card--compact' : ''}${panel ? ' fear-dial-card--panel' : ''}${clickable ? ' fear-dial-card--clickable' : ''}"
             data-tech-id="${tech.id}"
             style="--dial-color:${color}">
      <div class="fear-dial-card__gauge-wrap">
        ${fearDialSvg(level, dialSize)}
        <p class="fear-dial-card__score" aria-label="Fear intensity ${level} out of 5, ${label}">
          <span class="fear-dial-card__number">${level}</span>
          <span class="fear-dial-card__label">${label}</span>
        </p>
      </div>
      <h3 class="fear-dial-card__title">${tech.name}${added}</h3>
      <p class="fear-dial-card__era">${tech.era}</p>
      ${tags.length ? `<div class="fear-dial-card__tags">${tagHtml}</div>` : ''}
      <p class="fear-dial-card__summary">${summary}</p>
      ${showLegend ? dialLegendHtml(compact) : ''}
    </article>
  `;
}
