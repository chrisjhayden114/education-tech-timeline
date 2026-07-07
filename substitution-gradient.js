/**
 * Substitution gradient — step chart of assessment centrality vs fear dial.
 */
const SubstitutionGradient = (function () {
  const DIAL_COLORS = {
    0: '#9aa09a',
    1: '#c4a574',
    2: '#e09545',
    3: '#d05d38',
    4: '#e02020',
    5: '#8b1a1a'
  };

  const STEPS = [
    {
      id: 'gps-navigation',
      skill: 'wayfinding',
      status: 'never assessed',
      displayDial: 1
    },
    {
      id: 'phonograph-and-player-piano',
      skill: 'music-making',
      status: 'semi-curricular',
      displayDial: 2
    },
    {
      id: 'pocket-calculator',
      skill: 'arithmetic',
      status: 'an assessed subject',
      displayDial: 3
    },
    {
      id: 'generative-ai',
      skill: 'writing and problem-solving',
      status: 'every assessed subject at once',
      displayDial: 5
    }
  ];

  const EXTRA_DOTS = [
    { id: 'handwriting-technologies-slates-to-ballpoints-typewriter', displayDial: 2, x: 0.18 },
    { id: 'search-engines', displayDial: 2, x: 0.38 },
    { id: 'texting-and-instant-messaging', displayDial: 3, x: 0.62 },
    { id: 'machine-translation-in-the-language-classroom', displayDial: 1, x: 0.08 },
    { id: 'smart-speakers-and-voice-assistants', displayDial: 1, x: 0.28 }
  ];

  function dialColor(dial) {
    if (typeof DIAL_LEVELS !== 'undefined' && DIAL_LEVELS[dial]?.color) {
      return DIAL_LEVELS[dial].color;
    }
    return DIAL_COLORS[dial] ?? DIAL_COLORS[0];
  }

  function findTech(technologies, id) {
    return technologies.find(t => t.id === id);
  }

  function stepBlock(step, tech) {
    const dial = step.displayDial;
    const color = dialColor(dial);
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'sub-gradient__step';
    btn.style.setProperty('--step-dial', String(dial));
    btn.style.setProperty('--step-color', color);
    btn.setAttribute('aria-label', PatternTooltips.accessibleLabel(tech));
    btn.setAttribute('aria-expanded', 'false');
    btn.innerHTML = `
      <span class="sub-gradient__step-inner">
        <span class="sub-gradient__step-name">${tech.name}</span>
        <span class="sub-gradient__step-skill">${step.skill}</span>
        <span class="sub-gradient__step-status">${step.status}</span>
        <span class="sub-gradient__dial-badge" style="--badge-color:${color}">${dial}</span>
      </span>
    `;
    PatternTooltips.bind(btn, tech, {
      onActivate: item => {
        if (typeof window.focusTimelineTechnology === 'function') {
          window.focusTimelineTechnology(item.id);
        }
      }
    });
    return btn;
  }

  function extraDot(spec, tech) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'sub-gradient__extra-dot';
    btn.style.setProperty('--dot-y', `${(spec.displayDial / 5) * 100}%`);
    btn.style.setProperty('--dot-x', `${spec.x * 100}%`);
    btn.style.setProperty('--dot-color', dialColor(spec.displayDial));
    btn.setAttribute('aria-label', PatternTooltips.accessibleLabel(tech));
    btn.setAttribute('aria-expanded', 'false');
    btn.title = tech.name;
    PatternTooltips.bind(btn, tech, {
      onActivate: item => {
        if (typeof window.focusTimelineTechnology === 'function') {
          window.focusTimelineTechnology(item.id);
        }
      }
    });
    return btn;
  }

  function build(container, technologies) {
    if (!container || !technologies?.length) return;

    container.innerHTML = '';

    const intro = document.createElement('p');
    intro.className = 'sub-gradient__intro section-desc';
    intro.textContent =
      'Within the substitution engine, panic intensity scales with how central the substituted skill is to assessment. Substitute a skill nobody grades and nobody marches; substitute the skill every exam measures and the dial maxes out.';

    const layout = document.createElement('div');
    layout.className = 'sub-gradient__layout';

    const annotation = document.createElement('aside');
    annotation.className = 'sub-gradient__annotation';
    annotation.setAttribute('aria-label', 'Historical note on writing and substitution');
    annotation.innerHTML = `
      <p class="sub-gradient__annotation-text">
        <strong>The ancient precedent:</strong> writing substituted memory, effectively the assessed skill of oral education.
        Its recorded dial of 2 reflects the tiny reach of a literate elite, not low intensity; the dial measures intensity times reach.
      </p>
    `;

    const figure = document.createElement('figure');
    figure.className = 'sub-gradient__figure';
    figure.setAttribute('role', 'group');
    figure.setAttribute('aria-labelledby', 'sub-gradient-heading');

    const yLabel = document.createElement('div');
    yLabel.className = 'sub-gradient__y-label text-muted';
    yLabel.textContent = 'fear dial';

    const plotWrap = document.createElement('div');
    plotWrap.className = 'sub-gradient__plot-wrap';

    const plot = document.createElement('div');
    plot.className = 'sub-gradient__plot';

    const grid = document.createElement('div');
    grid.className = 'sub-gradient__grid';
    grid.setAttribute('aria-hidden', 'true');
    for (let dial = 5; dial >= 1; dial -= 1) {
      const line = document.createElement('div');
      line.className = 'sub-gradient__gridline';
      line.style.setProperty('--grid-y', `${(1 - dial / 5) * 100}%`);
      const label = document.createElement('span');
      label.className = 'sub-gradient__grid-label';
      label.textContent = String(dial);
      line.appendChild(label);
      grid.appendChild(line);
    }
    plot.appendChild(grid);

    const extrasLayer = document.createElement('div');
    extrasLayer.className = 'sub-gradient__extras';
    EXTRA_DOTS.forEach(spec => {
      const tech = findTech(technologies, spec.id);
      if (tech) extrasLayer.appendChild(extraDot(spec, tech));
    });
    plot.appendChild(extrasLayer);

    const stepsEl = document.createElement('div');
    stepsEl.className = 'sub-gradient__steps';
    STEPS.forEach(step => {
      const tech = findTech(technologies, step.id);
      if (tech) stepsEl.appendChild(stepBlock(step, tech));
    });
    plot.appendChild(stepsEl);

    plotWrap.appendChild(plot);

    const xLabel = document.createElement('div');
    xLabel.className = 'sub-gradient__x-label text-muted';
    xLabel.innerHTML = 'assessment centrality of the substituted skill <span aria-hidden="true">→</span>';

    figure.appendChild(yLabel);
    figure.appendChild(plotWrap);
    figure.appendChild(xLabel);

    layout.appendChild(annotation);
    layout.appendChild(figure);

    const srList = document.createElement('ol');
    srList.className = 'sr-only';
    STEPS.forEach(step => {
      const tech = findTech(technologies, step.id);
      if (!tech) return;
      const li = document.createElement('li');
      li.textContent = `${tech.name}: substituted skill ${step.skill}, ${step.status}, dial ${step.displayDial}`;
      srList.appendChild(li);
    });

    container.appendChild(intro);
    container.appendChild(layout);
    container.appendChild(srList);

    PatternTooltips.bindGlobalDismiss(container);
  }

  return { build };
})();
