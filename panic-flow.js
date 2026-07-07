/**
 * Four-stage flow — how an education panic runs.
 */
const PanicFlow = (function () {
  const ENGINE_CHIPS = ['substitution', 'displacement', 'integrity', 'contamination'];

  const STAGES = [
    {
      title: 'Ignition',
      body: 'A commercially supplied technology hands young people autonomous, adult-opaque control over cognitive time or an assessed skill, faster than adults gain fluency.'
    },
    {
      title: 'Engines',
      body: null,
      chips: true,
      sub: 'The engines fired determine whether the panic is moral or cognitive.'
    },
    {
      title: 'Intensity',
      body: 'Scales with the number of engines and how central the substituted skill is to assessment.'
    },
    {
      title: 'Resolution',
      body: 'Not when evidence arrives, but when institutions retake control of the classroom form.',
      sub: 'calculator and non-calculator papers, phone bans, managed Chromebooks, AI guardrails'
    }
  ];

  function buildStage(stage, index) {
    const li = document.createElement('li');
    li.className = 'panic-flow__stage';

    const card = document.createElement('article');
    card.className = 'panic-flow__card';

    const heading = document.createElement('h4');
    heading.className = 'panic-flow__stage-title';
    heading.textContent = stage.title;
    card.appendChild(heading);

    if (stage.body) {
      const p = document.createElement('p');
      p.className = 'panic-flow__body';
      p.textContent = stage.body;
      card.appendChild(p);
    }

    if (stage.chips) {
      const chips = document.createElement('div');
      chips.className = 'panic-flow__chips';
      chips.setAttribute('aria-label', 'Cognitive panic engines');
      ENGINE_CHIPS.forEach(name => {
        const chip = document.createElement('span');
        chip.className = 'panic-flow__chip';
        chip.textContent = name;
        chips.appendChild(chip);
      });
      card.appendChild(chips);
    }

    if (stage.sub) {
      const sub = document.createElement('p');
      sub.className = 'panic-flow__sub';
      sub.textContent = stage.sub;
      card.appendChild(sub);
    }

    li.appendChild(card);
    li.setAttribute('aria-label', `Stage ${index + 1}: ${stage.title}`);
    return li;
  }

  function buildArrow() {
    const li = document.createElement('li');
    li.className = 'panic-flow__arrow';
    li.setAttribute('aria-hidden', 'true');
    li.innerHTML = '<span class="panic-flow__arrow-icon">→</span>';
    return li;
  }

  function build(container) {
    if (!container) return;

    container.innerHTML = '';

    const list = document.createElement('ol');
    list.className = 'panic-flow__stages';

    STAGES.forEach((stage, index) => {
      list.appendChild(buildStage(stage, index));
      if (index < STAGES.length - 1) {
        list.appendChild(buildArrow());
      }
    });

    container.appendChild(list);

    const footer = document.createElement('div');
    footer.className = 'pattern-section__footer';
    footer.innerHTML = '<a href="references.html" class="pattern-section__refs-link">View full reference list →</a>';
    container.appendChild(footer);
  }

  return { build };
})();
