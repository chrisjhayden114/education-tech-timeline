/**
 * Engines matrix — learning-fear technologies × cognitive panic engines.
 */
const EnginesMatrix = (function () {
  const ENGINES = [
    { key: 'substitution', label: 'Substitution', def: 'the skill never forms' },
    { key: 'displacement', label: 'Displacement', def: 'study time crowded out' },
    { key: 'integrity', label: 'Integrity', def: 'whose work is it?' },
    { key: 'contamination', label: 'Contamination', def: 'the wrong content shapes the mind' }
  ];

  const DIAL_COLORS = {
    0: '#9aa09a',
    1: '#c4a574',
    2: '#e09545',
    3: '#d05d38',
    4: '#e02020',
    5: '#8b1a1a'
  };

  const GEN_AI_ID = 'generative-ai';

  function dialColor(dial) {
    if (typeof DIAL_LEVELS !== 'undefined' && DIAL_LEVELS[dial]?.color) {
      return DIAL_LEVELS[dial].color;
    }
    return DIAL_COLORS[dial] ?? DIAL_COLORS[0];
  }

  function learningYesTechnologies(technologies) {
    return technologies
      .filter(t => t.fears?.Learning === 'Yes')
      .sort((a, b) => (b.dial ?? 0) - (a.dial ?? 0) || a.name.localeCompare(b.name));
  }

  function shortColumnName(name) {
    if (name.length <= 14) return name;
    if (name === 'Generative AI') return 'Gen AI';
    if (name === 'Texting and instant messaging') return 'Texting / IM';
    if (name === 'Handwriting technologies (slates to ballpoints; typewriter)') return 'Handwriting';
    if (name === 'Phonograph and player piano') return 'Phonograph';
    if (name === 'Pocket calculator') return 'Calculator';
    if (name.startsWith('Personal computer')) return 'PC';
    return `${name.slice(0, 12).trim()}…`;
  }

  function dialMiniBar(dial) {
    const color = dialColor(dial);
    const segments = Array.from({ length: 5 }, (_, i) => {
      const filled = i < dial;
      return `<span class="engines-matrix__bar-seg${filled ? ' is-filled' : ''}"${filled ? ` style="--seg-color:${color}"` : ''}></span>`;
    }).join('');
    return `
      <span class="engines-matrix__dial-wrap">
        <span class="engines-matrix__dial-bar" aria-hidden="true">${segments}</span>
        <span class="engines-matrix__dial-num" style="color:${color}">${dial}</span>
      </span>
    `;
  }

  function enginesList(tech) {
    return (tech.engines || []).filter(Boolean);
  }

  function columnTooltipLabel(tech) {
    const engines = enginesList(tech);
    const engineText = engines.length ? engines.join(', ') : 'none';
    return `${tech.name} — dial ${tech.dial ?? 0} — engines: ${engineText}`;
  }

  function bindColumnHeader(th, tech) {
    th.setAttribute('aria-label', columnTooltipLabel(tech));
    th.setAttribute('tabindex', '0');
    th.setAttribute('aria-expanded', 'false');
    PatternTooltips.bind(th, tech, {
      onActivate: item => {
        if (typeof window.focusTimelineTechnology === 'function') {
          window.focusTimelineTechnology(item.id);
        }
      }
    });
  }

  function createDotCell(tech, engineKey) {
    const hasEngine = enginesList(tech).includes(engineKey);
    const td = document.createElement('td');
    td.className = 'engines-matrix__cell';
    if (tech.id === GEN_AI_ID) td.classList.add('engines-matrix__cell--highlight');

    if (!hasEngine) {
      td.innerHTML = '<span class="engines-matrix__empty" aria-hidden="true"></span>';
      td.setAttribute('aria-label', `${tech.name}, ${engineKey}: no`);
      return td;
    }

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'engines-matrix__dot';
    btn.setAttribute('aria-label', `${tech.name}, ${engineKey} engine, dial ${tech.dial ?? 0}`);
    btn.setAttribute('aria-expanded', 'false');
    btn.innerHTML = '<span class="engines-matrix__dot-fill" aria-hidden="true"></span>';
    PatternTooltips.bind(btn, tech, {
      onActivate: item => {
        if (typeof window.focusTimelineTechnology === 'function') {
          window.focusTimelineTechnology(item.id);
        }
      }
    });
    td.appendChild(btn);
    return td;
  }

  function build(container, technologies) {
    if (!container || !technologies?.length) return;

    const cols = learningYesTechnologies(technologies);
    container.innerHTML = '';

    const intro = document.createElement('p');
    intro.className = 'engines-matrix__intro section-desc';
    intro.innerHTML =
      'Once a panic is cognitive, <strong>which engines fire</strong> shapes its character. ' +
      'This matrix shows all <strong>23</strong> technologies coded <strong>Yes</strong> for learning fear ' +
      '(the Learning fear-type filter on the timeline), sorted by dial (high → low). ' +
      'A filled red dot means that engine engaged for that technology; an empty ring means it did not. ' +
      'Most panics fire one or two engines — <strong>Generative AI</strong> is the rare case that fires all four.';

    const scroll = document.createElement('div');
    scroll.className = 'engines-matrix__scroll';

    const table = document.createElement('table');
    table.className = 'engines-matrix__table';
    table.setAttribute('aria-describedby', 'engines-matrix-desc');

    const caption = document.createElement('caption');
    caption.className = 'sr-only';
    caption.textContent =
      'Matrix of 23 technologies with learning fear, showing which cognitive panic engines each fired. Rows are substitution, displacement, integrity, and contamination. Columns sorted by fear dial descending.';
    table.appendChild(caption);

    const thead = document.createElement('thead');

    const nameRow = document.createElement('tr');
    const corner = document.createElement('th');
    corner.className = 'engines-matrix__corner engines-matrix__sticky';
    corner.scope = 'col';
    corner.innerHTML = '<span class="sr-only">Engine</span>';
    nameRow.appendChild(corner);

    cols.forEach(tech => {
      const th = document.createElement('th');
      th.scope = 'col';
      th.className = 'engines-matrix__col-header';
      if (tech.id === GEN_AI_ID) th.classList.add('engines-matrix__col-header--highlight');
      th.innerHTML = `<span class="engines-matrix__col-name" title="${tech.name}">${shortColumnName(tech.name)}</span>`;
      bindColumnHeader(th, tech);
      nameRow.appendChild(th);
    });
    thead.appendChild(nameRow);

    const dialRow = document.createElement('tr');
    const dialStub = document.createElement('th');
    dialStub.scope = 'row';
    dialStub.className = 'engines-matrix__stub engines-matrix__sticky';
    dialStub.textContent = 'Dial';
    dialRow.appendChild(dialStub);

    cols.forEach(tech => {
      const th = document.createElement('th');
      th.scope = 'col';
      th.className = 'engines-matrix__dial-header';
      if (tech.id === GEN_AI_ID) th.classList.add('engines-matrix__dial-header--highlight');
      th.innerHTML = dialMiniBar(tech.dial ?? 0);
      bindColumnHeader(th, tech);
      dialRow.appendChild(th);
    });
    thead.appendChild(dialRow);
    table.appendChild(thead);

    const tbody = document.createElement('tbody');
    ENGINES.forEach(engine => {
      const tr = document.createElement('tr');
      const rowLabel = document.createElement('th');
      rowLabel.scope = 'row';
      rowLabel.className = 'engines-matrix__row-label engines-matrix__sticky';
      rowLabel.innerHTML = `
        <span class="engines-matrix__engine">${engine.label}</span>
        <span class="engines-matrix__def">${engine.def}</span>
      `;
      tr.appendChild(rowLabel);

      cols.forEach(tech => {
        tr.appendChild(createDotCell(tech, engine.key));
      });
      tbody.appendChild(tr);
    });
    table.appendChild(tbody);

    scroll.appendChild(table);
    container.appendChild(intro);
    container.appendChild(scroll);

    const genAi = cols.find(t => t.id === GEN_AI_ID);
    if (genAi) {
      const callout = document.createElement('p');
      callout.className = 'engines-matrix__callout';
      callout.id = 'engines-matrix-desc';
      callout.innerHTML =
        '<strong>Generative AI</strong> is the first technology to fire all four engines at once, in every assessed subject, under full student control.';
      container.appendChild(callout);
    }

    const footnote = document.createElement('p');
    footnote.className = 'engines-matrix__footnote text-muted';
    footnote.textContent =
      'Personal computer carries a learning fear but no engine: its fear was exclusion, not exposure.';
    container.appendChild(footnote);

    PatternTooltips.bindGlobalDismiss(container);
  }

  return { build, learningYesTechnologies };
})();
