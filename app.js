let DATA = null;

const FEAR_KEYS = ['Learning', 'Morality', 'Health', 'Public order'];
const FEAR_CLASS = {
  Learning: 'learning',
  Morality: 'morality',
  Health: 'health',
  'Public order': 'order'
};

const ANCIENT_THRESHOLD = 1400;
const SCALE_BREAK_1850 = 1850;
const TIMELINE_LAYOUT = {
  ancientMinYear: -3200,
  ancientMaxYear: -400,
  ancientXStart: 50,
  ancientXEnd: 130,
  breakStart: 145,
  breakWidth: 95,
  modernStart: 255,
  modernMinYear: 1450,
  modernMaxYear: 2035,
  /** Compressed scale for 1450–1850 */
  earlyPxPerYear: 1.15,
  /** Expanded scale from 1850 onward (where most entries cluster) */
  densePxPerYear: 18,
  trackHeight: 560,
  trackPadRight: 160,
  laneStep: 118,
  collisionWidth: 108,
  labelMaxWidth: 148,
  labelPad: 14,
  /** Horizontal fan spacing for multiple technologies in the same year */
  sameYearMinSpread: 72,
  sameYearMaxSpread: 100,
  /** Max horizontal nudge from true date when resolving label overlap */
  maxDateNudge: 40
};

let timelineView = {
  panicScale: false,
  zoom: 1
};

function yearToX(year, zoom = timelineView.zoom) {
  if (year == null) return TIMELINE_LAYOUT.modernStart;
  const L = TIMELINE_LAYOUT;

  if (year < ANCIENT_THRESHOLD) {
    const clamped = Math.max(L.ancientMinYear, Math.min(L.ancientMaxYear, year));
    const t = (clamped - L.ancientMinYear) / (L.ancientMaxYear - L.ancientMinYear);
    return L.ancientXStart + t * (L.ancientXEnd - L.ancientXStart);
  }

  if (year < SCALE_BREAK_1850) {
    const clamped = Math.max(L.modernMinYear, Math.min(SCALE_BREAK_1850, year));
    return L.modernStart + (clamped - L.modernMinYear) * L.earlyPxPerYear;
  }

  const x1850 = L.modernStart + (SCALE_BREAK_1850 - L.modernMinYear) * L.earlyPxPerYear;
  const clamped = Math.max(SCALE_BREAK_1850, Math.min(L.modernMaxYear, year));
  return x1850 + (clamped - SCALE_BREAK_1850) * L.densePxPerYear * zoom;
}

function getNodeIconSize(tech) {
  if (!timelineView.panicScale) {
    return { wrap: 52, icon: 26 };
  }
  if (!tech.hasPanic) {
    return { wrap: 38, icon: 19 };
  }
  const dial = tech.dial ?? 0;
  const wrap = 44 + dial * 8;
  return { wrap, icon: Math.round(wrap * 0.5) };
}

function assignLanes(positions, xKey = 'displayX', collisionWidth = TIMELINE_LAYOUT.collisionWidth) {
  const L = TIMELINE_LAYOUT;
  const sideLanes = { above: [], below: [] };

  function findTier(lanes, x) {
    let tier = 0;
    while (tier < lanes.length && x - lanes[tier] < collisionWidth) tier++;
    return tier;
  }

  function occupy(lanes, tier, x) {
    while (lanes.length <= tier) lanes.push(-Infinity);
    lanes[tier] = x;
  }

  const sorted = [...positions].sort((a, b) => a[xKey] - b[xKey]);
  for (const pos of sorted) {
    const x = pos[xKey];
    const primary = pos.above ? 'above' : 'below';
    const alt = pos.above ? 'below' : 'above';
    const tierPrimary = findTier(sideLanes[primary], x);
    const tierAlt = findTier(sideLanes[alt], x);

    if (tierPrimary > 0 && tierAlt < tierPrimary) {
      pos.above = alt === 'above';
      pos.lane = tierAlt;
      occupy(sideLanes[alt], tierAlt, x);
    } else {
      pos.lane = tierPrimary;
      occupy(sideLanes[primary], tierPrimary, x);
    }
  }
}

function estimateLabelWidth(name) {
  const L = TIMELINE_LAYOUT;
  const maxW = L.labelMaxWidth;
  const charW = 7;
  const words = name.split(/\s+/);
  const longestWord = Math.max(...words.map(w => w.length), 1);
  const charsPerLine = Math.max(1, Math.floor(maxW / charW));
  const lines = Math.ceil(name.length / charsPerLine);
  const avgCharsPerLine = Math.min(charsPerLine, Math.max(longestWord, name.length / lines));
  return Math.min(maxW, Math.max(92, avgCharsPerLine * charW));
}

/** Shorter on-timeline label for very long names; full name stays in tooltip/modal. */
function timelineDisplayName(name) {
  if (name.length <= 32) return name;

  const trimPhrases = [
    ' in the language classroom',
    ' and emergency remote teaching',
    ' and voice assistants',
    ' and cloud classroom suites',
    ' (slates to ballpoints; typewriter)',
    ' (clickers to Kahoot)',
    ' (Logo to Scratch)'
  ];
  for (const phrase of trimPhrases) {
    if (name.includes(phrase)) {
      const short = name.replace(phrase, '').trim();
      if (short.length <= 34) return short;
    }
  }

  const beforeAnd = name.split(' and ')[0];
  if (beforeAnd.length >= 10 && beforeAnd.length <= 30) return `${beforeAnd}…`;

  if (name.length > 36) return `${name.slice(0, 34).trim()}…`;
  return name;
}

/** Fan multiple entries at the same year around their true date on the axis. */
function spreadSameYearGroups(positions) {
  const L = TIMELINE_LAYOUT;
  const byYear = new Map();
  positions.forEach(pos => {
    const year = pos.tech.impactYear ?? 0;
    if (!byYear.has(year)) byYear.set(year, []);
    byYear.get(year).push(pos);
  });

  byYear.forEach(group => {
    group.sort((a, b) => a.tech.name.localeCompare(b.tech.name));
    const n = group.length;
    const spread = n > 1
      ? Math.min(L.sameYearMaxSpread, Math.max(L.sameYearMinSpread, L.labelMaxWidth * 0.68))
      : 0;

    group.forEach((pos, index) => {
      pos.anchorX = pos.x;
      pos.labelWidth = estimateLabelWidth(pos.tech.name);
      pos.displayX = n === 1
        ? pos.anchorX
        : pos.anchorX + (index - (n - 1) / 2) * spread;
      pos.shifted = Math.abs(pos.displayX - pos.anchorX) > 4;
    });
  });
}

/** Prefer extra vertical lanes; only then nudge slightly from true date. */
function resolveLabelOverlaps(positions) {
  const L = TIMELINE_LAYOUT;
  const sorted = [...positions].sort((a, b) => a.displayX - b.displayX);

  for (let i = 1; i < sorted.length; i++) {
    const prev = sorted[i - 1];
    const curr = sorted[i];
    const need = (prev.labelWidth + curr.labelWidth) / 2 + L.labelPad;
    let gap = curr.displayX - prev.displayX;

    if (gap >= need) continue;

    if (prev.above === curr.above && prev.lane === curr.lane) {
      curr.lane = prev.lane + 1;
      gap = curr.displayX - prev.displayX;
    }

    if (gap >= need) continue;

    const shortfall = need - gap;
    const half = shortfall / 2;
    const prevRoom = prev.displayX - (prev.anchorX - L.maxDateNudge);
    const currRoom = (curr.anchorX + L.maxDateNudge) - curr.displayX;
    const movePrev = Math.min(half, Math.max(0, prevRoom));
    const moveCurr = Math.min(half, Math.max(0, currRoom));

    if (movePrev > 0.5) {
      prev.displayX -= movePrev;
      prev.shifted = true;
    }
    if (moveCurr > 0.5) {
      curr.displayX += moveCurr;
      curr.shifted = true;
    }
  }
}

/** Year-proportional positions: true date stays on axis; labels may fan or use bent connectors. */
function assignTimelinePositions(technologies) {
  const sorted = [...technologies].sort((a, b) => (a.impactYear ?? 0) - (b.impactYear ?? 0));
  const yearSlot = {};

  const positions = sorted.map(tech => {
    const year = tech.impactYear ?? 0;
    const slot = yearSlot[year] ?? 0;
    yearSlot[year] = slot + 1;
    const x = yearToX(year);
    return {
      tech,
      x,
      anchorX: x,
      displayX: x,
      above: slot % 2 === 0,
      lane: 0,
      shifted: false,
      labelWidth: estimateLabelWidth(tech.name)
    };
  });

  spreadSameYearGroups(positions);

  const maxLabelW = Math.max(
    TIMELINE_LAYOUT.labelMaxWidth,
    ...positions.map(p => p.labelWidth || 0)
  );
  const laneCollision = Math.max(96, maxLabelW * 0.85);
  assignLanes(positions, 'displayX', laneCollision);
  resolveLabelOverlaps(positions);

  const maxAbove = positions.filter(p => p.above).reduce((m, p) => Math.max(m, p.lane), 0);
  const maxBelow = positions.filter(p => !p.above).reduce((m, p) => Math.max(m, p.lane), 0);
  return { positions, maxAbove, maxBelow };
}

function drawTimelineConnectors(svg, positions, axisY) {
  const L = TIMELINE_LAYOUT;
  svg.innerHTML = '';

  const ticksDrawn = new Set();

  positions.forEach(pos => {
    const { displayX, anchorX, above, lane, tech } = pos;
    const panic = tech.hasPanic;
    const stroke = panic ? 'rgba(196, 30, 30, 0.5)' : 'rgba(42, 125, 114, 0.48)';
    const laneOffset = lane * L.laneStep;
    const nodeEdgeY = above ? axisY - laneOffset - 6 : axisY + laneOffset + 6;
    const elbowY = above
      ? axisY - Math.max(18, laneOffset * 0.45)
      : axisY + Math.max(18, laneOffset * 0.45);

    let d;
    if (Math.abs(displayX - anchorX) < 3) {
      d = `M ${displayX} ${nodeEdgeY} L ${anchorX} ${axisY}`;
    } else {
      d = `M ${displayX} ${nodeEdgeY} L ${displayX} ${elbowY} L ${anchorX} ${elbowY} L ${anchorX} ${axisY}`;
    }

    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', d);
    path.setAttribute('stroke', stroke);
    path.setAttribute('stroke-width', '2');
    path.setAttribute('fill', 'none');
    path.setAttribute('stroke-linecap', 'round');
    path.setAttribute('stroke-linejoin', 'round');
    svg.appendChild(path);

    const tickKey = `${Math.round(anchorX)}`;
    if (!ticksDrawn.has(tickKey)) {
      ticksDrawn.add(tickKey);
      const tick = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      tick.setAttribute('cx', String(anchorX));
      tick.setAttribute('cy', String(axisY));
      tick.setAttribute('r', '3.5');
      tick.setAttribute('fill', '#2a7d72');
      tick.setAttribute('opacity', '0.9');
      svg.appendChild(tick);
    }
  });
}

let filters = {
  fears: new Set(),
  transform: 'all',
  dialMin: 0,
  dialMax: 5
};

async function init() {
  await Comments.init();
  const res = await fetch('data.json');
  DATA = await res.json();
  window.__TIMELINE_DATA = DATA;

  document.getElementById('hero-title').textContent = DATA.meta.title;
  document.getElementById('hero-subtitle').textContent = DATA.meta.subtitle;

  buildFearFilters();
  buildTimeline();
  buildStats();
  buildLegend();
  bindControls();
  bindTimelineViewControls();
  bindTimelineScroll();
  updateFilterCount();

  const hash = location.hash.replace('#', '');
  if (hash) {
    const tech = DATA.technologies.find(t => t.id === hash);
    if (tech) openModal(tech);
  }
}

function getRefById(id) {
  return DATA.references.find(r => r.id === id);
}

function getRefUrl(id) {
  const ref = getRefById(id);
  return ref?.url || `references.html#${id}`;
}

function refLinkAttrs(id) {
  const ref = getRefById(id);
  if (ref?.url) {
    return `href="${ref.url}" target="_blank" rel="noopener noreferrer" title="Open source in new tab"`;
  }
  return `href="references.html#${id}"`;
}

function truncate(s, n) {
  if (!s || s.length <= n) return s;
  return s.slice(0, n).trim() + '…';
}

function buildFearFilters() {
  const container = document.getElementById('fear-filters');
  FEAR_KEYS.forEach(key => {
    const btn = document.createElement('button');
    btn.className = `chip chip--${FEAR_CLASS[key]}`;
    btn.dataset.fear = key;
    btn.textContent = key;
    btn.addEventListener('click', () => {
      if (filters.fears.has(key)) {
        filters.fears.delete(key);
        btn.classList.remove('active');
      } else {
        filters.fears.add(key);
        btn.classList.add('active');
      }
      applyFilters();
    });
    container.appendChild(btn);
  });
}

function bindControls() {
  document.querySelectorAll('#transform-filters .chip').forEach(chip => {
    chip.addEventListener('click', () => {
      document.querySelectorAll('#transform-filters .chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      filters.transform = chip.dataset.transform;
      applyFilters();
    });
  });

  const dialMin = document.getElementById('dial-min');
  const dialMax = document.getElementById('dial-max');
  const display = document.getElementById('dial-range-display');

  function updateDial() {
    let min = parseInt(dialMin.value, 10);
    let max = parseInt(dialMax.value, 10);
    if (min > max) [min, max] = [max, min];
    filters.dialMin = min;
    filters.dialMax = max;
    display.textContent = `${min} – ${max}`;
    applyFilters();
  }

  dialMin.addEventListener('input', updateDial);
  dialMax.addEventListener('input', updateDial);

  document.getElementById('reset-filters').addEventListener('click', () => {
    filters.fears.clear();
    filters.transform = 'all';
    filters.dialMin = 0;
    filters.dialMax = 5;
    document.querySelectorAll('#fear-filters .chip').forEach(c => c.classList.remove('active'));
    document.querySelectorAll('#transform-filters .chip').forEach(c => {
      c.classList.toggle('active', c.dataset.transform === 'all');
    });
    dialMin.value = 0;
    dialMax.value = 5;
    display.textContent = '0 – 5';
    applyFilters();
  });

  document.getElementById('modal-close').addEventListener('click', closeModal);
  document.getElementById('detail-modal').addEventListener('click', e => {
    if (e.target === e.currentTarget) closeModal();
  });
}

function bindTimelineViewControls() {
  const panicScale = document.getElementById('panic-scale-view');
  if (panicScale) {
    panicScale.checked = timelineView.panicScale;
    panicScale.addEventListener('change', () => {
      timelineView.panicScale = panicScale.checked;
      hideTimelineTooltip();
      buildTimeline();
    });
  }

  const zoom = document.getElementById('timeline-zoom');
  const zoomLabel = document.getElementById('timeline-zoom-display');
  if (zoom) {
    zoom.value = timelineView.zoom;
    if (zoomLabel) zoomLabel.textContent = `${Math.round(timelineView.zoom * 100)}%`;
    zoom.addEventListener('input', () => {
      timelineView.zoom = parseFloat(zoom.value);
      if (zoomLabel) zoomLabel.textContent = `${Math.round(timelineView.zoom * 100)}%`;
      hideTimelineTooltip();
      buildTimeline();
    });
  }
}

function buildDecadeNavigator(positions) {
  const nav = document.getElementById('timeline-decade-nav');
  if (!nav) return;

  const buckets = new Map();
  positions.forEach(({ tech, displayX }) => {
    const year = tech.impactYear;
    if (year == null || year < 1400) return;
    const decade = Math.floor(year / 10) * 10;
    if (!buckets.has(decade)) buckets.set(decade, { count: 0, x: displayX ?? yearToX(year) });
    const bucket = buckets.get(decade);
    bucket.count += 1;
    bucket.x = Math.min(bucket.x, displayX ?? yearToX(year));
  });

  const dense = [...buckets.entries()]
    .filter(([, bucket]) => bucket.count >= 3)
    .sort((a, b) => a[0] - b[0]);

  nav.innerHTML = '';
  if (!dense.length) {
    nav.hidden = true;
    return;
  }

  nav.hidden = false;
  const label = document.createElement('span');
  label.className = 'timeline-decade-nav__label';
  label.textContent = 'Jump to busy decades:';
  nav.appendChild(label);

  dense.forEach(([decade, bucket]) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'timeline-decade-chip';
    const suffix = decade % 100;
    const era = decade >= 2000 ? `${decade}s` : `${Math.floor(decade / 100)}${String(suffix).padStart(2, '0')}s`;
    btn.textContent = `${era} (${bucket.count})`;
    btn.addEventListener('click', () => {
      const scroller = document.getElementById('timeline-scroll');
      if (!scroller) return;
      scroller.scrollTo({
        left: Math.max(0, bucket.x - scroller.clientWidth * 0.35),
        behavior: 'smooth'
      });
    });
    nav.appendChild(btn);
  });
}

function bindTechNodePanel(node, tech) {
  node.addEventListener('mouseenter', () => showTimelineTooltip(node, tech));
  node.addEventListener('focusin', () => showTimelineTooltip(node, tech));
  node.addEventListener('mouseleave', e => {
    if (timelineTooltipEl?.contains(e.relatedTarget)) return;
    hideTimelineTooltip();
  });
  node.addEventListener('focusout', e => {
    if (timelineTooltipEl?.contains(e.relatedTarget)) return;
    hideTimelineTooltip();
  });
}

let timelineTooltipEl = null;
let timelineTooltipNode = null;

function ensureTimelineTooltip() {
  if (timelineTooltipEl) return timelineTooltipEl;

  timelineTooltipEl = document.createElement('div');
  timelineTooltipEl.id = 'timeline-tooltip';
  timelineTooltipEl.className = 'timeline-tooltip';
  timelineTooltipEl.hidden = true;
  document.body.appendChild(timelineTooltipEl);

  timelineTooltipEl.addEventListener('mouseleave', e => {
    if (timelineTooltipNode?.contains(e.relatedTarget)) return;
    hideTimelineTooltip();
  });
  timelineTooltipEl.addEventListener('mouseenter', () => {
    timelineTooltipEl.classList.add('is-visible');
  });

  const scroller = document.getElementById('timeline-scroll');
  if (scroller) {
    scroller.addEventListener('scroll', () => {
      if (!timelineTooltipEl.hidden) positionTimelineTooltip();
    }, { passive: true });
  }
  window.addEventListener('resize', () => {
    if (!timelineTooltipEl.hidden) positionTimelineTooltip();
  });

  return timelineTooltipEl;
}

function showTimelineTooltip(node, tech) {
  const el = ensureTimelineTooltip();
  el.innerHTML = `
    ${renderFearDialCard(tech, { showLegend: false, panel: true })}
    <button type="button" class="btn-primary btn-sm tech-node__explore">Explore & comment</button>
  `;
  el.querySelector('.tech-node__explore').addEventListener('click', e => {
    e.stopPropagation();
    hideTimelineTooltip();
    openModal(tech);
  });
  timelineTooltipNode = node;
  el.hidden = false;
  el.classList.remove('is-visible');
  el.style.visibility = 'hidden';
  requestAnimationFrame(() => {
    positionTimelineTooltip();
    el.classList.add('is-visible');
  });
}

function positionTimelineTooltip() {
  if (!timelineTooltipEl || timelineTooltipEl.hidden || !timelineTooltipNode) return;

  const trigger = timelineTooltipNode.querySelector('.tech-node__trigger');
  if (!trigger) return;

  const tr = trigger.getBoundingClientRect();
  const margin = 12;
  const gap = 14;
  const vw = window.innerWidth;
  const vh = window.innerHeight;

  const controls = document.querySelector('.controls');
  const topBound = Math.max(margin, (controls?.getBoundingClientRect().bottom ?? 0) + margin);

  timelineTooltipEl.style.left = '-9999px';
  timelineTooltipEl.style.top = '0';
  const pw = timelineTooltipEl.offsetWidth;
  const ph = timelineTooltipEl.offsetHeight;

  let left = tr.left + tr.width / 2;
  left = Math.max(margin + pw / 2, Math.min(vw - margin - pw / 2, left));

  const belowTop = tr.bottom + gap;
  const aboveTop = tr.top - ph - gap;
  const belowFits = belowTop >= topBound && belowTop + ph <= vh - margin;
  const aboveFits = aboveTop >= topBound && aboveTop + ph <= vh - margin;

  let top;
  if (belowFits && !aboveFits) top = belowTop;
  else if (aboveFits && !belowFits) top = aboveTop;
  else if (belowFits && aboveFits) {
    const lane = parseInt(timelineTooltipNode.style.getPropertyValue('--lane') || '0', 10);
    const preferBelow = timelineTooltipNode.classList.contains('tech-node--above') && lane > 0;
    top = preferBelow ? belowTop : aboveTop;
  } else {
    top = belowTop;
    if (top + ph > vh - margin) top = aboveTop;
  }
  top = Math.max(topBound, Math.min(vh - ph - margin, top));

  timelineTooltipEl.style.left = `${left}px`;
  timelineTooltipEl.style.top = `${top}px`;
  timelineTooltipEl.style.visibility = 'visible';
}

function hideTimelineTooltip() {
  if (!timelineTooltipEl) return;
  timelineTooltipEl.hidden = true;
  timelineTooltipEl.classList.remove('is-visible');
  timelineTooltipEl.style.visibility = '';
  timelineTooltipEl.innerHTML = '';
  timelineTooltipNode = null;
}

function createTechNode(tech, pos) {
  const { displayX, above, lane, shifted } = pos;
  const { wrap, icon } = getNodeIconSize(tech);
  const node = document.createElement('div');
  node.className = [
    'tech-node',
    above ? 'tech-node--above' : 'tech-node--below',
    shifted ? 'tech-node--shifted' : '',
    tech.hasPanic ? 'tech-node--panic' : 'tech-node--quiet',
    timelineView.panicScale ? 'tech-node--scaled' : ''
  ].filter(Boolean).join(' ');
  node.dataset.id = tech.id;
  node.style.left = `${displayX}px`;
  node.style.setProperty('--lane', lane);
  node.style.setProperty('--node-size', `${wrap}px`);
  node.style.setProperty('--icon-size', `${icon}px`);

  const addedMarker = tech.isAdded
    ? '<span class="tech-node__added-marker" title="Added to broaden the timeline">*</span>'
    : '';
  const dialBadge = tech.hasPanic && timelineView.panicScale
    ? `<span class="tech-node__dial-badge" title="Fear dial ${tech.dial ?? 0}">${tech.dial ?? 0}</span>`
    : '';
  const displayName = timelineDisplayName(tech.name);

  node.innerHTML = `
    <button type="button" class="tech-node__trigger" aria-label="${tech.name}, ${tech.broadImpact}${tech.isAdded ? ', added entry' : ''}">
      <div class="tech-node__icon-wrap">
        ${addedMarker}
        ${dialBadge}
        ${techIconSvg(tech.id, icon)}
      </div>
      <span class="tech-node__name" title="${tech.name}">${displayName}</span>
      <span class="tech-node__year">${tech.broadImpact}</span>
    </button>
  `;

  node.querySelector('.tech-node__trigger').addEventListener('click', () => openModal(tech));
  node.querySelector('.tech-node__trigger').addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      openModal(tech);
    }
  });

  bindTechNodePanel(node, tech);
  return node;
}

function buildTimelineAxis(trackWidth) {
  const axis = document.getElementById('timeline-axis');
  const L = TIMELINE_LAYOUT;
  const x1850 = yearToX(SCALE_BREAK_1850, 1);

  axis.style.width = `${trackWidth}px`;
  axis.innerHTML = `
    <div class="axis-seg axis-seg--ancient" style="left:40px;width:${L.ancientXEnd - 30}px"></div>
    <div class="axis-break" style="left:${L.breakStart}px;width:${L.breakWidth}px">
      <span class="axis-break__mark">//</span>
      <span class="axis-break__label">~2 millennia</span>
    </div>
    <div class="axis-seg axis-seg--early" style="left:${L.modernStart}px;width:${x1850 - L.modernStart}px"></div>
    <div class="axis-seg axis-seg--dense" style="left:${x1850}px;width:${Math.max(0, trackWidth - x1850 - 40)}px"></div>
  `;

  const yearMarkers = [-500, 1500, 1700, 1800, 1850, 1900, 1950, 2000, 2025];
  yearMarkers.forEach(year => {
    let label = String(year);
    if (year < 0) label = 'Antiquity';
    else if (year >= 2020) label = 'Today';
    else if (year === 1850) label = '1850';
    const el = document.createElement('div');
    el.className = `axis-marker${year < 0 ? ' axis-marker--ancient' : ''}${year >= SCALE_BREAK_1850 ? ' axis-marker--dense' : ''}`;
    el.style.left = `${yearToX(year)}px`;
    el.textContent = label;
    axis.appendChild(el);
  });
}

function ensureTimelineConnectors(track) {
  let svg = document.getElementById('timeline-connectors');
  if (!svg) {
    svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.id = 'timeline-connectors';
    svg.classList.add('timeline-connectors');
    svg.setAttribute('aria-hidden', 'true');
    const nodesEl = document.getElementById('timeline-nodes');
    track.insertBefore(svg, nodesEl);
  }
  return svg;
}

function buildTimeline() {
  const track = document.getElementById('timeline-track');
  const nodesEl = document.getElementById('timeline-nodes');
  const visible = DATA.technologies.filter(matchesFilters);

  const sorted = [...visible].sort((a, b) => (a.impactYear ?? 0) - (b.impactYear ?? 0));
  const { positions, maxAbove, maxBelow } = assignTimelinePositions(sorted);

  const trackWidth = Math.max(
    yearToX(TIMELINE_LAYOUT.modernMaxYear),
    ...positions.flatMap(p => [p.displayX, p.anchorX, p.x])
  ) + TIMELINE_LAYOUT.trackPadRight;

  const lanePad = TIMELINE_LAYOUT.laneStep;
  const maxNodeSize = timelineView.panicScale ? 84 : 52;
  const nodeBlock = maxNodeSize + 72;
  const edgePad = 56;
  const axisY = edgePad + maxAbove * lanePad + nodeBlock;
  const belowH = maxBelow * lanePad + nodeBlock + edgePad;
  const trackHeight = axisY + belowH;

  track.classList.toggle('timeline-track--panic-scale', timelineView.panicScale);
  track.style.width = `${trackWidth}px`;
  track.style.height = `${trackHeight}px`;
  track.style.setProperty('--axis-y', `${axisY}px`);

  const scroller = document.getElementById('timeline-scroll');
  if (scroller) scroller.style.minHeight = `${trackHeight + 160}px`;

  nodesEl.innerHTML = '';

  buildTimelineAxis(trackWidth);
  buildDecadeNavigator(positions);

  const connectorsSvg = ensureTimelineConnectors(track);
  connectorsSvg.setAttribute('width', String(trackWidth));
  connectorsSvg.setAttribute('height', String(trackHeight));
  connectorsSvg.style.width = `${trackWidth}px`;
  connectorsSvg.style.height = `${trackHeight}px`;
  drawTimelineConnectors(connectorsSvg, positions, axisY);

  positions.forEach(pos => {
    nodesEl.appendChild(createTechNode(pos.tech, pos));
  });

  requestAnimationFrame(updateScrollAffordances);
}

function bindTimelineScroll() {
  const scroller = document.getElementById('timeline-scroll');
  const btnLeft = document.getElementById('scroll-left');
  const btnRight = document.getElementById('scroll-right');

  if (!scroller || !btnLeft || !btnRight) return;

  const scrollAmount = () => Math.max(280, scroller.clientWidth * 0.55);

  btnLeft.addEventListener('click', () => {
    scroller.scrollBy({ left: -scrollAmount(), behavior: 'smooth' });
  });

  btnRight.addEventListener('click', () => {
    scroller.scrollBy({ left: scrollAmount(), behavior: 'smooth' });
  });

  scroller.addEventListener('scroll', updateScrollAffordances, { passive: true });
  window.addEventListener('resize', updateScrollAffordances);

  // Drag-to-scroll on desktop
  let dragging = false;
  let startX = 0;
  let startScroll = 0;

  scroller.addEventListener('mousedown', e => {
    if (e.target.closest('button, a')) return;
    hideTimelineTooltip();
    dragging = true;
    startX = e.pageX;
    startScroll = scroller.scrollLeft;
    scroller.classList.add('is-dragging');
  });

  window.addEventListener('mouseup', () => {
    dragging = false;
    scroller.classList.remove('is-dragging');
  });

  window.addEventListener('mousemove', e => {
    if (!dragging) return;
    e.preventDefault();
    scroller.scrollLeft = startScroll - (e.pageX - startX);
  });
}

function updateScrollAffordances() {
  const scroller = document.getElementById('timeline-scroll');
  const btnLeft = document.getElementById('scroll-left');
  const btnRight = document.getElementById('scroll-right');
  const fadeLeft = document.getElementById('fade-left');
  const fadeRight = document.getElementById('fade-right');
  const hint = document.getElementById('timeline-scroll-hint');

  if (!scroller) return;

  const maxScroll = scroller.scrollWidth - scroller.clientWidth;
  const atStart = scroller.scrollLeft <= 8;
  const atEnd = scroller.scrollLeft >= maxScroll - 8;
  const canScroll = maxScroll > 16;

  if (btnLeft) {
    btnLeft.hidden = !canScroll || atStart;
    btnLeft.disabled = atStart;
  }
  if (btnRight) {
    btnRight.hidden = !canScroll || atEnd;
    btnRight.disabled = atEnd;
  }
  if (fadeLeft) fadeLeft.classList.toggle('is-hidden', atStart || !canScroll);
  if (fadeRight) fadeRight.classList.toggle('is-hidden', atEnd || !canScroll);
  if (hint) hint.classList.toggle('is-hidden', !canScroll);
}

function matchesFilters(tech) {
  if (filters.transform !== 'all' && tech.transformed !== filters.transform) return false;
  if (tech.dial < filters.dialMin || tech.dial > filters.dialMax) return false;
  if (filters.fears.size > 0) {
    for (const f of filters.fears) {
      const v = tech.fears[f];
      if (v !== 'Yes' && v !== 'Partial') return false;
    }
  }
  return true;
}

function applyFilters() {
  hideTimelineTooltip();
  buildTimeline();
  updateFilterCount();
}

function updateFilterCount() {
  const visible = DATA.technologies.filter(matchesFilters).length;
  document.getElementById('filter-count').textContent =
    `Showing ${visible} of ${DATA.technologies.length} technologies`;
}

function appendCommentSlot(parent, itemType, itemId, label) {
  const slot = document.createElement('div');
  slot.className = 'comment-slot';
  parent.appendChild(slot);
  Comments.mount(slot, itemType, itemId, label, 'compact');
}

function buildStats() {
  const grid = document.getElementById('stats-grid');
  const s = DATA.stats;

  const summary = [
    { value: s.total, label: 'Technologies tracked', id: 'stat-total' },
    { value: s.transformed.Yes, label: 'Transformed education (Yes)', id: 'stat-transformed' },
    { value: s.avgDial, label: 'Avg. learning/cognitive panic dial (0–5)', id: 'stat-dial' },
    { value: DATA.references.length, label: 'Academic references', id: 'stat-refs' }
  ];

  summary.forEach(c => {
    const el = document.createElement('div');
    el.className = 'stat-card';
    el.innerHTML = `<div class="stat-value">${c.value}</div><div class="stat-label">${c.label}</div>`;
    appendCommentSlot(el, 'stat', c.id, c.label);
    grid.appendChild(el);
  });

  const detail = document.getElementById('stats-detail');

  DATA.fearColumns.forEach(col => {
    const counts = s.fears[col.key];
    const total = counts.Yes + counts.Partial + counts.No;
    const block = document.createElement('div');
    block.className = 'fear-stat-block';
    block.innerHTML = `
      <h3>${col.full}</h3>
      <p class="fear-desc">${col.desc}</p>
      <div class="bar-chart" role="img" aria-label="Fear distribution for ${col.key}">
        ${counts.Yes ? `<div class="bar-segment bar-segment--yes" style="flex:${counts.Yes}">${counts.Yes}</div>` : ''}
        ${counts.Partial ? `<div class="bar-segment bar-segment--partial" style="flex:${counts.Partial}">${counts.Partial}</div>` : ''}
        ${counts.No ? `<div class="bar-segment bar-segment--no" style="flex:${counts.No}">${counts.No}</div>` : ''}
      </div>
      <div class="bar-legend">
        <span class="leg-yes">Yes (${pct(counts.Yes, total)})</span>
        <span class="leg-partial">Partial (${pct(counts.Partial, total)})</span>
        <span class="leg-no">No (${pct(counts.No, total)})</span>
      </div>
    `;
    appendCommentSlot(block, 'stat', `stat-fear-${col.key.toLowerCase().replace(/\s+/g, '-')}`, col.full);
    detail.appendChild(block);
  });

  const t = s.transformed;
  const tTotal = t.Yes + t.Partial + t.No;
  const tBlock = document.createElement('div');
  tBlock.className = 'fear-stat-block';
  tBlock.innerHTML = `
    <h3>Transformed education</h3>
    <p class="fear-desc">Durable structural or pedagogical change to how schooling is organized, taught, or assessed.</p>
    <div class="bar-chart">
      <div class="bar-segment bar-segment--yes" style="flex:${t.Yes}">${t.Yes}</div>
      <div class="bar-segment bar-segment--partial" style="flex:${t.Partial}">${t.Partial}</div>
      <div class="bar-segment bar-segment--no" style="flex:${t.No}">${t.No}</div>
    </div>
    <div class="bar-legend">
      <span class="leg-yes">Yes (${pct(t.Yes, tTotal)})</span>
      <span class="leg-partial">Partial (${pct(t.Partial, tTotal)})</span>
      <span class="leg-no">No (${pct(t.No, tTotal)})</span>
    </div>
  `;
  appendCommentSlot(tBlock, 'stat', 'stat-transformed-col', 'Transformed education');
  detail.appendChild(tBlock);

  const dBlock = document.createElement('div');
  dBlock.className = 'fear-stat-block';
  dBlock.innerHTML = `
    <h3>Learning &amp; cognitive panic dial (0–5)</h3>
    <p class="fear-desc">Peak fear that technologies would erode memory, attention, literacy, or skill formation — scored at historical peak, not for accuracy.</p>
    <div class="bar-chart">
      ${[0, 2, 3, 4, 5].map(n => {
        const c = s.dial[String(n)];
        return c ? `<div class="bar-segment bar-segment--yes" style="flex:${c};opacity:${n === 0 ? 0.35 : 0.45 + n * 0.11}">${n}: ${c}</div>` : '';
      }).join('')}
    </div>
  `;
  appendCommentSlot(dBlock, 'stat', 'stat-dial-dist', 'Fear intensity dial');
  detail.appendChild(dBlock);
}

function pct(n, total) {
  return total ? Math.round((n / total) * 100) + '%' : '0%';
}

function buildLegend() {
  const grid = document.getElementById('legend-grid');
  for (const [section, items] of Object.entries(DATA.legend)) {
    const block = document.createElement('div');
    block.className = 'legend-block';
    block.innerHTML = `<h3>${section}</h3>`;
    const dl = document.createElement('dl');
    items.forEach(item => {
      const dt = document.createElement('dt');
      dt.textContent = item.term;
      const dd = document.createElement('dd');
      dd.textContent = item.definition;
      dl.appendChild(dt);
      dl.appendChild(dd);
    });
    block.appendChild(dl);
    const sectionId = section.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    appendCommentSlot(block, 'legend', sectionId, section);
    grid.appendChild(block);
  }
}

function findRefForCitation(part) {
  const year = part.match(/\d{4}/)?.[0] || '';
  const author = part.split(',')[0].replace(/\s+et al\.?/i, '').trim().toLowerCase();
  return DATA.references.find(r =>
    r.text.toLowerCase().includes(author) && r.text.includes(year)
  );
}

function linkifyCitations(text) {
  if (!text) return '';
  return text.replace(/\(([^)]+)\)/g, (match, inner) => {
    const linked = inner.split(/;\s*/).map(part => {
      const ref = findRefForCitation(part.trim());
      if (ref) {
        const external = ref.url ? ` target="_blank" rel="noopener noreferrer"` : '';
        return `<a href="${getRefUrl(ref.id)}" class="ref-badge"${external}>${part.trim()}</a>`;
      }
      return part.trim();
    });
    return `(${linked.join('; ')})`;
  });
}

function openModal(tech) {
  hideTimelineTooltip();
  const modal = document.getElementById('detail-modal');
  const content = document.getElementById('modal-content');
  const commentsEl = document.getElementById('modal-comments');

  const fearCols = DATA.fearColumns || [];
  const fearCells = fearCols.map(col => {
    const val = tech.fears[col.key] || 'No';
    return `
    <div class="fear-cell fear-cell--${FEAR_CLASS[col.key]}">
      <div class="fear-cell__text">
        <span class="fear-cell__name">${col.full}</span>
        <span class="fear-cell__desc">${col.desc}</span>
      </div>
      <span class="fear-value fear-value--${val.toLowerCase()}" title="${val === 'Yes' ? 'Fear clearly articulated at meaningful scale' : val === 'Partial' ? 'Fear present but marginal or contested' : 'Not a feature of the panic'}">${val}</span>
    </div>`;
  }).join('');

  const refBadges = tech.references.length
    ? tech.references.map(r => {
        const ref = getRefById(r.id);
        return `<a ${refLinkAttrs(r.id)} class="ref-badge">${r.short}${ref?.url ? ' ↗' : ''}</a>`;
      }).join('')
    : '<span class="text-muted">See inline citations below</span>';

  content.innerHTML = `
    ${renderFearDialCard(tech, { showLegend: true, addedBadge: true })}
    <div class="modal-meta-row">
      <span><strong>Impact:</strong> ${tech.broadImpact}</span>
      <span><strong>Transformed:</strong> ${tech.transformed}</span>
    </div>
    <section class="modal-fears-section" aria-labelledby="modal-fears-heading">
      <h3 id="modal-fears-heading">Contemporaries&rsquo; fears</h3>
      <p class="modal-fears-intro">What critics claimed this technology would do to young people or schooling — <em>not</em> whether those fears proved justified. Ratings reflect claims at the historical peak.</p>
      <div class="modal-fears-legend">
        <span><strong>Yes</strong> — articulated at meaningful scale</span>
        <span><strong>Partial</strong> — marginal or contested</span>
        <span><strong>No</strong> — not part of the panic</span>
      </div>
      <div class="modal-fears-grid">${fearCells}</div>
    </section>
    <div class="modal-impact modal-impact--positive">
      <h3>Positive impact on education</h3>
      <p>${linkifyCitations(tech.positive)}</p>
    </div>
    <div class="modal-impact modal-impact--negative">
      <h3>Negative impact on learning</h3>
      <p>${linkifyCitations(tech.negative)}</p>
    </div>
    <div class="modal-notes">
      <h3>Notes</h3>
      <p>${tech.notes}</p>
    </div>
    <div class="modal-refs">
      <h3>References</h3>
      <div class="ref-badges">${refBadges}</div>
    </div>
  `;

  commentsEl.innerHTML = '';
  Comments.mount(commentsEl, 'technology', tech.id, tech.name, 'full');

  history.replaceState(null, '', `#${tech.id}`);
  modal.showModal();
}

function closeModal() {
  document.getElementById('detail-modal').close();
  history.replaceState(null, '', location.pathname);
  hideTimelineTooltip();
}

init();
