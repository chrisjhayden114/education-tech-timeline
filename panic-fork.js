/**
 * Fork diagram — moral vs cognitive panic among child-controlled technologies.
 */
const PanicFork = (function () {
  const ENGINE_ORDER = ['substitution', 'displacement', 'integrity', 'contamination'];
  const ENGINE_LABELS = {
    substitution: 'Substitution',
    displacement: 'Displacement',
    integrity: 'Integrity',
    contamination: 'Contamination'
  };

  const EXPECTED_MORAL_NAMES = [
    'Rock and roll',
    'Home video (VHS)',
    'Dungeons and Dragons',
    'Pagers',
    'Virtual reality'
  ];

  function moralBranch(technologies) {
    return technologies
      .filter(t =>
        t.control === 'child' &&
        (!t.engines || t.engines.length === 0) &&
        t.fears?.Learning !== 'Yes'
      )
      .sort((a, b) => (a.dial ?? 0) - (b.dial ?? 0) || a.name.localeCompare(b.name));
  }

  function cognitiveBranch(technologies) {
    return technologies.filter(t =>
      t.control === 'child' &&
      Array.isArray(t.engines) &&
      t.engines.length > 0
    );
  }

  function verifyMoralBranch(branch) {
    const actual = branch.map(t => t.name).sort();
    const expected = [...EXPECTED_MORAL_NAMES].sort();
    if (JSON.stringify(actual) !== JSON.stringify(expected)) {
      console.warn('[panic fork] moral branch mismatch — expected exactly:', EXPECTED_MORAL_NAMES, 'got:', branch.map(t => t.name));
    }
  }

  function createTechChip(tech) {
    const chip = document.createElement('button');
    chip.type = 'button';
    chip.className = 'panic-fork__chip panic-fork__chip--tech';
    chip.setAttribute('aria-label', PatternTooltips.accessibleLabel(tech));
    chip.setAttribute('aria-expanded', 'false');

    const partial = tech.fears?.Learning === 'Partial'
      ? ' <span class="panic-fork__partial">(partial)</span>'
      : '';

    chip.innerHTML = `
      <span class="panic-fork__chip-name">${tech.name}</span>
      <span class="panic-fork__dial" aria-hidden="true">${tech.dial ?? 0}</span>
      ${partial}
    `;

    PatternTooltips.bind(chip, tech, {
      onActivate: techItem => {
        if (typeof window.focusTimelineTechnology === 'function') {
          window.focusTimelineTechnology(techItem.id);
        }
      }
    });

    return chip;
  }

  function createEngineChip(engineKey) {
    const chip = document.createElement('span');
    chip.className = 'panic-fork__chip panic-fork__chip--engine';
    chip.textContent = ENGINE_LABELS[engineKey] || engineKey;
    return chip;
  }

  function buildSrList(rootLabel, moralTechs, cognitiveTechs) {
    const list = document.createElement('ol');
    list.className = 'sr-only';

    const rootItem = document.createElement('li');
    rootItem.textContent = rootLabel;
    const branches = document.createElement('ol');

    const noBranch = document.createElement('li');
    noBranch.textContent = 'No — moral panic';
    const noList = document.createElement('ul');
    moralTechs.forEach(tech => {
      const li = document.createElement('li');
      li.textContent = `${tech.name}, dial ${tech.dial ?? 0}`;
      noList.appendChild(li);
    });
    noBranch.appendChild(noList);
    branches.appendChild(noBranch);

    const yesBranch = document.createElement('li');
    yesBranch.textContent = 'Yes — cognitive panic';
    const yesList = document.createElement('ul');
    cognitiveTechs.forEach(tech => {
      const li = document.createElement('li');
      const engines = (tech.engines || []).join(', ');
      li.textContent = `${tech.name}, dial ${tech.dial ?? 0}${engines ? `, engines: ${engines}` : ''}`;
      yesList.appendChild(li);
    });
    yesBranch.appendChild(yesList);
    branches.appendChild(yesBranch);

    rootItem.appendChild(branches);
    list.appendChild(rootItem);
    return list;
  }

  function build(container, technologies) {
    if (!container || !technologies?.length) return;

    const childCount = technologies.filter(t => t.control === 'child').length;
    const moralTechs = moralBranch(technologies);
    const cognitiveTechs = cognitiveBranch(technologies);

    verifyMoralBranch(moralTechs);

    container.innerHTML = '';

    const intro = document.createElement('p');
    intro.className = 'panic-fork__intro section-desc';
    intro.textContent =
      'Autonomy decides whether a panic fires; the engines decide what kind. Child-controlled technologies that fired no cognitive engine still produced panics, but moral ones: outrage, bans, and folk devils, with no learning claim. The panic becomes cognitive, and climbs the dial, only when at least one engine engages.';

    const diagram = document.createElement('div');
    diagram.className = 'panic-fork__diagram';
    diagram.setAttribute('role', 'group');
    diagram.setAttribute('aria-labelledby', 'panic-fork-heading');

    const root = document.createElement('div');
    root.className = 'panic-fork__root';
    root.innerHTML = `
      <span class="panic-fork__root-title">Child-controlled technology</span>
      <span class="panic-fork__badge">${childCount} of 67</span>
    `;

    const decision = document.createElement('div');
    decision.className = 'panic-fork__decision';
    decision.innerHTML = `
      <span class="panic-fork__connector panic-fork__connector--down" aria-hidden="true"></span>
      <span class="panic-fork__decision-label">Does it fire a cognitive engine?</span>
      <span class="panic-fork__connector panic-fork__connector--fork" aria-hidden="true"></span>
    `;

    const branches = document.createElement('div');
    branches.className = 'panic-fork__branches';

    const noBranch = document.createElement('div');
    noBranch.className = 'panic-fork__branch panic-fork__branch--no';
    noBranch.innerHTML = `
      <span class="panic-fork__branch-label">No</span>
      <div class="panic-fork__card">
        <h4 class="panic-fork__card-title">Moral panic</h4>
        <div class="panic-fork__chips"></div>
        <p class="panic-fork__caption">Autonomy alone produces a moral panic. None of these exceeded dial 2.</p>
      </div>
    `;
    const noChips = noBranch.querySelector('.panic-fork__chips');
    moralTechs.forEach(tech => noChips.appendChild(createTechChip(tech)));

    const yesBranch = document.createElement('div');
    yesBranch.className = 'panic-fork__branch panic-fork__branch--yes';
    yesBranch.innerHTML = `
      <span class="panic-fork__branch-label">Yes</span>
      <div class="panic-fork__card">
        <h4 class="panic-fork__card-title">Cognitive panic</h4>
        <div class="panic-fork__chips panic-fork__chips--engines"></div>
        <p class="panic-fork__caption">All 12 technologies at dial 3 or higher sit in this branch.</p>
      </div>
    `;
    const yesChips = yesBranch.querySelector('.panic-fork__chips');
    ENGINE_ORDER.forEach(key => yesChips.appendChild(createEngineChip(key)));

    branches.appendChild(noBranch);
    branches.appendChild(yesBranch);

    diagram.appendChild(root);
    diagram.appendChild(decision);
    diagram.appendChild(branches);

    const footnote = document.createElement('p');
    footnote.className = 'panic-fork__footnote text-muted';
    footnote.textContent =
      "Personal computer is the dataset's one special case: a learning fear driven by exclusion (fear of not having it) rather than any engine, so it sits in neither branch cleanly.";

    const srList = buildSrList(
      `Child-controlled technology, ${childCount} of 67. Does it fire a cognitive engine?`,
      moralTechs,
      cognitiveTechs
    );

    container.appendChild(intro);
    container.appendChild(diagram);
    container.appendChild(footnote);
    container.appendChild(srList);

    PatternTooltips.bindGlobalDismiss(container);
  }

  return { build, moralBranch, cognitiveBranch };
})();
