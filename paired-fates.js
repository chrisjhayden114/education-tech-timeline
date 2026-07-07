/**
 * Paired fate cards — same capability, different control, different fate.
 */
const PairedFates = (function () {
  const DIAL_COLORS = {
    0: '#9aa09a',
    1: '#c4a574',
    2: '#e09545',
    3: '#d05d38',
    4: '#e02020',
    5: '#8b1a1a'
  };

  const CONTROL_LABELS = {
    institution: 'institution',
    adult: 'adult',
    child: 'child'
  };

  const PAIRS = [
    {
      pairId: 'computation',
      cards: [
        {
          id: 'slide-rule-in-schooling',
          displayDial: 1,
          fate: 'Introduced by schools; died unmourned in five years.'
        },
        {
          id: 'pocket-calculator',
          displayDial: 3,
          fate: 'Carried into the exam room by students; the purest learning panic in the set.'
        }
      ]
    },
    {
      pairId: 'projection',
      cards: [
        {
          id: 'filmstrip-and-slide-projectors',
          displayDial: 1,
          fate: 'Teacher-paced, classroom-fit, beloved.'
        },
        {
          id: 'movies',
          displayDial: 3,
          fate: 'The same moving image at the nickelodeon: moral panic and the Payne Fund.'
        }
      ]
    },
    {
      pairId: 'screens',
      cards: [
        {
          id: 'chromebooks-and-cloud-classroom-suites',
          displayDial: 1,
          fate: 'District-managed, filtered, invisible to the public.'
        },
        {
          id: 'smartphones',
          displayDial: 5,
          fate: 'The same-era screen, teen-sovereign: the sharpest policy reversal in modern education.'
        }
      ]
    },
    {
      pairId: 'language',
      cards: [
        {
          id: 'machine-translation-in-the-language-classroom',
          displayDial: 1,
          fate: 'The dress rehearsal: same integrity questions, confined to one subject, professional worry only.'
        },
        {
          id: 'generative-ai',
          displayDial: 5,
          fate: 'Every assessed subject at once: all four engines firing.'
        }
      ]
    }
  ];

  const SINGLE_CARD = {
    id: 'home-video-vhs',
    fate: "One device, two lives: a 'video nasty' in the living room and a model technology in the classroom, in the same years."
  };

  function dialColor(dial) {
    if (typeof DIAL_LEVELS !== 'undefined' && DIAL_LEVELS[dial]?.color) {
      return DIAL_LEVELS[dial].color;
    }
    return DIAL_COLORS[dial] ?? DIAL_COLORS[0];
  }

  function findTech(technologies, id) {
    return technologies.find(t => t.id === id);
  }

  function verifyPairs(technologies) {
    PAIRS.forEach(({ pairId, cards }) => {
      const expectedIds = cards.map(c => c.id).sort();
      const dataIds = technologies
        .filter(t => t.pair === pairId)
        .map(t => t.id)
        .sort();
      if (JSON.stringify(dataIds) !== JSON.stringify(expectedIds)) {
        console.warn(
          `[paired fates] pair "${pairId}" mismatch — expected ids`,
          expectedIds,
          'found',
          dataIds
        );
      }
    });
  }

  function createCard(spec, tech) {
    const dial = spec.displayDial;
    const color = dialColor(dial);
    const control = tech.control || 'child';

    const article = document.createElement('article');
    article.className = `paired-fates__card paired-fates__card--${control}`;
    article.setAttribute('aria-label', `${tech.name}, ${CONTROL_LABELS[control]}-controlled, dial ${dial}. ${spec.fate}`);

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'paired-fates__card-btn';
    btn.innerHTML = `
      <h4 class="paired-fates__name">${tech.name}</h4>
      <div class="paired-fates__badges">
        <span class="paired-fates__control paired-fates__control--${control}">${CONTROL_LABELS[control]}</span>
        <span class="paired-fates__dial" style="--dial-color:${color}">${dial}</span>
      </div>
      <p class="paired-fates__fate">${spec.fate}</p>
    `;

    btn.addEventListener('click', () => {
      if (typeof window.focusTimelineTechnology === 'function') {
        window.focusTimelineTechnology(tech.id);
      }
    });

    article.appendChild(btn);
    return article;
  }

  function createPair(pairSpec, technologies) {
    const row = document.createElement('div');
    row.className = 'paired-fates__pair';
    row.dataset.pair = pairSpec.pairId;

    const [leftSpec, rightSpec] = pairSpec.cards;
    const leftTech = findTech(technologies, leftSpec.id);
    const rightTech = findTech(technologies, rightSpec.id);

    if (!leftTech || !rightTech) {
      console.warn('[paired fates] missing technology for pair', pairSpec.pairId);
      return row;
    }

    row.appendChild(createCard(leftSpec, leftTech));

    const divider = document.createElement('div');
    divider.className = 'paired-fates__divider';
    divider.setAttribute('aria-hidden', 'true');
    divider.innerHTML = '<span class="paired-fates__divider-line"></span><span class="paired-fates__divider-label">same capability</span><span class="paired-fates__divider-line"></span>';
    row.appendChild(divider);

    row.appendChild(createCard(rightSpec, rightTech));
    return row;
  }

  function createSingle(spec, technologies) {
    const tech = findTech(technologies, spec.id);
    const wrap = document.createElement('div');
    wrap.className = 'paired-fates__single';

    if (!tech) {
      console.warn('[paired fates] missing single card technology', spec.id);
      return wrap;
    }

    const article = document.createElement('article');
    article.className = 'paired-fates__card paired-fates__card--wide paired-fates__card--child';
    article.setAttribute('aria-label', `${tech.name}. ${spec.fate}`);

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'paired-fates__card-btn';
    btn.innerHTML = `
      <h4 class="paired-fates__name">${tech.name}</h4>
      <p class="paired-fates__fate paired-fates__fate--wide">${spec.fate}</p>
    `;
    btn.addEventListener('click', () => {
      if (typeof window.focusTimelineTechnology === 'function') {
        window.focusTimelineTechnology(tech.id);
      }
    });

    article.appendChild(btn);
    wrap.appendChild(article);
    return wrap;
  }

  function buildSrList(technologies) {
    const list = document.createElement('ol');
    list.className = 'sr-only';
    PAIRS.forEach(pair => {
      const li = document.createElement('li');
      const pairLabel = pair.cards.map(c => {
        const tech = findTech(technologies, c.id);
        return tech ? `${tech.name} (${tech.control}, dial ${c.displayDial}): ${c.fate}` : '';
      }).filter(Boolean).join(' versus ');
      li.textContent = pairLabel;
      list.appendChild(li);
    });
    const singleTech = findTech(technologies, SINGLE_CARD.id);
    if (singleTech) {
      const li = document.createElement('li');
      li.textContent = `${singleTech.name}: ${SINGLE_CARD.fate}`;
      list.appendChild(li);
    }
    return list;
  }

  function build(container, technologies) {
    if (!container || !technologies?.length) return;

    verifyPairs(technologies);
    container.innerHTML = '';

    const grid = document.createElement('div');
    grid.className = 'paired-fates__grid';

    PAIRS.forEach(pairSpec => {
      grid.appendChild(createPair(pairSpec, technologies));
    });

    grid.appendChild(createSingle(SINGLE_CARD, technologies));
    container.appendChild(grid);

    const closing = document.createElement('p');
    closing.className = 'paired-fates__closing';
    closing.textContent = 'The technology is held constant; only control changes. Control decides.';
    container.appendChild(closing);

    container.appendChild(buildSrList(technologies));
  }

  return { build };
})();
