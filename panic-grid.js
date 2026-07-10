/**
 * Panic Grid — categorical dot grid by control × fear dial.
 */
const PanicGrid = (function () {
  const CONTROL_COLUMNS = [
    { key: 'institution', label: 'Institution-controlled', count: 27 },
    { key: 'adult', label: 'Adult consumer', count: 10 },
    { key: 'child', label: 'Child-controlled', count: 30 }
  ];

  const DIAL_LEVELS = [5, 4, 3, 2, 1, 0];
  const DOT_PITCH = 24;
  const DOT_R = 7.5;
  const HIT_R = 18;
  /** Wide enough that the chart fills the same content width as the timeline. */
  const COL_WIDTH = 360;
  const MARGIN = { top: 96, right: 40, bottom: 68, left: 56 };

  const LEARNING_FILL = {
    Yes: '#c41e1e',
    Partial: '#d97706',
    No: '#94a3b8'
  };

  /**
   * Dial-5 dots sort alphabetically: Generative AI (left), Smartphones (right).
   * Offset labels outward so they stay over the correct dots.
   */
  const DIRECT_LABELS = {
    'Generative AI': { dx: -12, dy: -16, anchor: 'end' },
    Smartphones: { dx: 12, dy: -16, anchor: 'start' },
    Television: { dx: 0, dy: -16, anchor: 'middle' }
  };

  function learningColor(tech) {
    return LEARNING_FILL[tech.fears?.Learning] || LEARNING_FILL.No;
  }

  function layoutCell(items, width) {
    if (!items.length) return [];
    const perRow = Math.max(1, Math.floor(width / DOT_PITCH));
    return items.map((item, index) => {
      const row = Math.floor(index / perRow);
      const col = index % perRow;
      const rowCount = Math.min(perRow, items.length - row * perRow);
      const rowWidth = rowCount * DOT_PITCH;
      const x = (width - rowWidth) / 2 + col * DOT_PITCH + DOT_PITCH / 2;
      const y = row * DOT_PITCH + DOT_PITCH / 2;
      return { ...item, localX: x, localY: y };
    });
  }

  function bandHeight(count) {
    if (!count) return 28;
    const perRow = Math.max(1, Math.floor(COL_WIDTH / DOT_PITCH));
    const rows = Math.ceil(count / perRow);
    return Math.max(28, rows * DOT_PITCH + 8);
  }

  function buildLayout(technologies) {
    const cells = new Map();
    CONTROL_COLUMNS.forEach(col => {
      DIAL_LEVELS.forEach(dial => cells.set(`${col.key}|${dial}`, []));
    });

    technologies.forEach(tech => {
      const dial = Math.max(0, Math.min(5, tech.dial ?? 0));
      const key = `${tech.control}|${dial}`;
      if (cells.has(key)) cells.get(key).push(tech);
    });

    cells.forEach(list => list.sort((a, b) => a.name.localeCompare(b.name)));

    const rowHeights = DIAL_LEVELS.map(dial => {
      let max = 28;
      CONTROL_COLUMNS.forEach(col => {
        max = Math.max(max, bandHeight(cells.get(`${col.key}|${dial}`).length));
      });
      return max;
    });

    const chartHeight = MARGIN.top + rowHeights.reduce((a, b) => a + b, 0) + MARGIN.bottom;
    const chartWidth = MARGIN.left + COL_WIDTH * CONTROL_COLUMNS.length + MARGIN.right;

    const dots = [];
    CONTROL_COLUMNS.forEach((col, colIndex) => {
      const colX = MARGIN.left + colIndex * COL_WIDTH;
      let bandTop = MARGIN.top;
      DIAL_LEVELS.forEach((dial, dialIndex) => {
        const cellKey = `${col.key}|${dial}`;
        const items = layoutCell(cells.get(cellKey), COL_WIDTH);
        items.forEach(item => {
          dots.push({
            tech: item,
            x: colX + item.localX,
            y: bandTop + item.localY,
            dial,
            colKey: col.key
          });
        });
        bandTop += rowHeights[dialIndex];
      });
    });

    return { dots, rowHeights, chartWidth, chartHeight };
  }

  function boundaryBetweenDials(upperDial, rowHeights) {
    const idx = DIAL_LEVELS.indexOf(upperDial);
    let top = MARGIN.top;
    for (let i = 0; i <= idx; i++) top += rowHeights[i];
    return top;
  }

  function renderSvg(layout) {
    const { dots, rowHeights, chartWidth, chartHeight } = layout;
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', `0 0 ${chartWidth} ${chartHeight}`);
    svg.setAttribute('width', '100%');
    svg.setAttribute('role', 'img');
    svg.setAttribute('aria-label', 'Panic grid: fear dial by who controls the technology');
    svg.style.height = 'auto';
    svg.style.aspectRatio = `${chartWidth} / ${chartHeight}`;
    svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');

    const ns = 'http://www.w3.org/2000/svg';

    const plotBg = document.createElementNS(ns, 'rect');
    plotBg.setAttribute('x', String(MARGIN.left));
    plotBg.setAttribute('y', String(MARGIN.top));
    plotBg.setAttribute('width', String(COL_WIDTH * CONTROL_COLUMNS.length));
    plotBg.setAttribute('height', String(chartHeight - MARGIN.top - MARGIN.bottom));
    plotBg.setAttribute('fill', 'rgba(255,255,255,0.55)');
    plotBg.setAttribute('rx', '8');
    svg.appendChild(plotBg);

    let bandTop = MARGIN.top;
    DIAL_LEVELS.forEach((dial, index) => {
      if (dial >= 1) {
        const line = document.createElementNS(ns, 'line');
        line.setAttribute('x1', String(MARGIN.left));
        line.setAttribute('x2', String(MARGIN.left + COL_WIDTH * CONTROL_COLUMNS.length));
        line.setAttribute('y1', String(bandTop));
        line.setAttribute('y2', String(bandTop));
        line.setAttribute('stroke', 'rgba(15,23,42,0.1)');
        line.setAttribute('stroke-width', '1');
        svg.appendChild(line);

        const label = document.createElementNS(ns, 'text');
        label.setAttribute('x', String(MARGIN.left - 10));
        label.setAttribute('y', String(bandTop + 4));
        label.setAttribute('text-anchor', 'end');
        label.setAttribute('class', 'panic-grid__axis-label');
        label.textContent = String(dial);
        svg.appendChild(label);
      }
      bandTop += rowHeights[index];
    });

    CONTROL_COLUMNS.forEach((col, index) => {
      const x = MARGIN.left + index * COL_WIDTH + COL_WIDTH / 2;
      const label = document.createElementNS(ns, 'text');
      label.setAttribute('x', String(x));
      label.setAttribute('y', String(chartHeight - 28));
      label.setAttribute('text-anchor', 'middle');
      label.setAttribute('class', 'panic-grid__col-label');
      label.innerHTML = '';
      const tspan1 = document.createElementNS(ns, 'tspan');
      tspan1.setAttribute('x', String(x));
      tspan1.setAttribute('dy', '0');
      tspan1.textContent = col.label;
      const tspan2 = document.createElementNS(ns, 'tspan');
      tspan2.setAttribute('x', String(x));
      tspan2.setAttribute('dy', '1.35em');
      tspan2.setAttribute('class', 'panic-grid__col-count');
      tspan2.textContent = `(${col.count})`;
      label.appendChild(tspan1);
      label.appendChild(tspan2);
      svg.appendChild(label);

      if (index > 0) {
        const divider = document.createElementNS(ns, 'line');
        divider.setAttribute('x1', String(MARGIN.left + index * COL_WIDTH));
        divider.setAttribute('x2', String(MARGIN.left + index * COL_WIDTH));
        divider.setAttribute('y1', String(MARGIN.top));
        divider.setAttribute('y2', String(chartHeight - MARGIN.bottom));
        divider.setAttribute('stroke', 'rgba(15,23,42,0.08)');
        divider.setAttribute('stroke-width', '1');
        svg.appendChild(divider);
      }
    });

    const ceilingY = boundaryBetweenDials(3, rowHeights);
    const ceiling = document.createElementNS(ns, 'line');
    ceiling.setAttribute('x1', String(MARGIN.left));
    ceiling.setAttribute('x2', String(MARGIN.left + COL_WIDTH * 2));
    ceiling.setAttribute('y1', String(ceilingY));
    ceiling.setAttribute('y2', String(ceilingY));
    ceiling.setAttribute('stroke', '#64748b');
    ceiling.setAttribute('stroke-width', '1.5');
    ceiling.setAttribute('stroke-dasharray', '6 5');
    ceiling.setAttribute('class', 'panic-grid__ceiling');
    svg.appendChild(ceiling);

    const ceilingLabel = document.createElementNS(ns, 'text');
    ceilingLabel.setAttribute('x', String(MARGIN.left + COL_WIDTH));
    ceilingLabel.setAttribute('y', String(ceilingY - 8));
    ceilingLabel.setAttribute('text-anchor', 'middle');
    ceilingLabel.setAttribute('class', 'panic-grid__annotation');
    ceilingLabel.textContent = 'The dial-2 ceiling: no institutional or adult technology has ever exceeded a 2';
    svg.appendChild(ceilingLabel);

    const childCaptionX = MARGIN.left + COL_WIDTH * 2.5;
    const childCaption = document.createElementNS(ns, 'text');
    childCaption.setAttribute('x', String(childCaptionX));
    childCaption.setAttribute('y', String(MARGIN.top - 22));
    childCaption.setAttribute('text-anchor', 'middle');
    childCaption.setAttribute('class', 'panic-grid__caption');
    childCaption.textContent = 'All 12 technologies at dial 3+ are child-controlled';
    svg.appendChild(childCaption);

    const dotsLayer = document.createElementNS(ns, 'g');
    dotsLayer.setAttribute('class', 'panic-grid__dots');

    const tabOrder = [...dots].sort((a, b) => {
      const colA = CONTROL_COLUMNS.findIndex(c => c.key === a.colKey);
      const colB = CONTROL_COLUMNS.findIndex(c => c.key === b.colKey);
      if (colA !== colB) return colA - colB;
      if (a.dial !== b.dial) return b.dial - a.dial;
      return a.tech.name.localeCompare(b.tech.name);
    });

    tabOrder.forEach((dot, tabIndex) => {
      const { tech, x, y } = dot;
      const g = document.createElementNS(ns, 'g');
      g.setAttribute('class', 'panic-grid__dot');
      g.setAttribute('tabindex', '0');
      g.setAttribute('role', 'button');
      g.setAttribute('aria-label', PatternTooltips.accessibleLabel(tech));
      g.setAttribute('aria-expanded', 'false');
      g.dataset.techId = tech.id;
      g.style.setProperty('--dot-fill', learningColor(tech));

      const hit = document.createElementNS(ns, 'circle');
      hit.setAttribute('cx', String(x));
      hit.setAttribute('cy', String(y));
      hit.setAttribute('r', String(HIT_R));
      hit.setAttribute('fill', 'transparent');
      hit.setAttribute('class', 'panic-grid__hit');

      const visible = document.createElementNS(ns, 'circle');
      visible.setAttribute('cx', String(x));
      visible.setAttribute('cy', String(y));
      visible.setAttribute('r', String(DOT_R));
      visible.setAttribute('fill', learningColor(tech));
      visible.setAttribute('class', 'panic-grid__visible');

      g.appendChild(hit);
      g.appendChild(visible);
      PatternTooltips.bind(g, tech, {
        onActivate: item => {
          if (typeof window.focusTimelineTechnology === 'function') {
            window.focusTimelineTechnology(item.id);
          }
        }
      });
      dotsLayer.appendChild(g);

      if (DIRECT_LABELS[tech.name]) {
        const meta = DIRECT_LABELS[tech.name];
        const nameLabel = document.createElementNS(ns, 'text');
        nameLabel.setAttribute('x', String(x + meta.dx));
        nameLabel.setAttribute('y', String(y + meta.dy));
        nameLabel.setAttribute('text-anchor', meta.anchor);
        nameLabel.setAttribute('class', 'panic-grid__dot-label');
        nameLabel.textContent = tech.name;
        dotsLayer.appendChild(nameLabel);
      }
    });

    svg.appendChild(dotsLayer);
    return svg;
  }

  function bindGlobalDismiss(root) {
    PatternTooltips.bindGlobalDismiss(root);
  }

  function build(container, technologies) {
    if (!container || !technologies?.length) return;

    const layout = buildLayout(technologies);
    container.innerHTML = '';

    const wrap = document.createElement('div');
    wrap.className = 'panic-grid__scroll';

    const figure = document.createElement('figure');
    figure.className = 'panic-grid__figure';
    figure.setAttribute(
      'aria-label',
      'Panic grid of 67 technologies by who controls use and fear dial intensity. Every technology at dial 3 or higher is child-controlled; no institution-controlled or adult consumer technology exceeds dial 2.'
    );
    figure.setAttribute('role', 'img');

    const svg = renderSvg(layout);
    figure.appendChild(svg);

    const legend = document.createElement('div');
    legend.className = 'panic-grid__legend';
    legend.setAttribute('aria-hidden', 'true');
    legend.innerHTML = `
      <span class="panic-grid__legend-title">Learning fear</span>
      <span class="panic-grid__legend-item"><span class="panic-grid__swatch panic-grid__swatch--yes"></span>Yes</span>
      <span class="panic-grid__legend-item"><span class="panic-grid__swatch panic-grid__swatch--partial"></span>Partial</span>
      <span class="panic-grid__legend-item"><span class="panic-grid__swatch panic-grid__swatch--no"></span>No</span>
    `;

    wrap.appendChild(figure);
    container.appendChild(wrap);
    container.appendChild(legend);
    bindGlobalDismiss(container);
  }

  return { build };
})();
