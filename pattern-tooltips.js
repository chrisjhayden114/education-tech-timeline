/**
 * Shared hover/focus tooltips for Pattern section visualizations.
 */
const PatternTooltips = (function () {
  let tooltipEl = null;
  let activeEl = null;
  let touchPinned = false;

  function controlLabel(control) {
    if (control === 'child') return 'child-controlled';
    if (control === 'adult') return 'adult-controlled';
    return 'institution-controlled';
  }

  function accessibleLabel(tech) {
    const engines = (tech.engines || []).join(', ');
    const base = `${tech.name}. ${tech.era}. Dial ${tech.dial ?? 0}. ${controlLabel(tech.control)}.`;
    return engines ? `${base} Engines: ${engines}.` : base;
  }

  function tooltipHtml(tech) {
    const engines = (tech.engines || []).filter(Boolean);
    const enginesLine = engines.length
      ? `<div class="panic-grid-tooltip__engines">Engines: ${engines.join(', ')}</div>`
      : '';
    return `
      <div class="panic-grid-tooltip__name">${tech.name}</div>
      <div class="panic-grid-tooltip__meta">${tech.era} / dial ${tech.dial ?? 0} / ${controlLabel(tech.control)}</div>
      ${enginesLine}
    `;
  }

  function ensureTooltip() {
    if (tooltipEl) return tooltipEl;
    tooltipEl = document.createElement('div');
    tooltipEl.id = 'panic-grid-tooltip';
    tooltipEl.className = 'panic-grid-tooltip';
    tooltipEl.setAttribute('role', 'tooltip');
    tooltipEl.hidden = true;
    document.body.appendChild(tooltipEl);
    return tooltipEl;
  }

  function positionTooltip(el) {
    const tip = ensureTooltip();
    const rect = el.getBoundingClientRect();
    tip.style.left = '-9999px';
    tip.style.top = '0';
    tip.hidden = false;

    const pw = tip.offsetWidth;
    const ph = tip.offsetHeight;
    const pad = 10;
    let left = rect.left + rect.width / 2 - pw / 2;
    let top = rect.top - ph - pad;

    if (top < pad) top = rect.bottom + pad;

    left = Math.max(pad, Math.min(left, window.innerWidth - pw - pad));
    tip.style.left = `${left}px`;
    tip.style.top = `${top}px`;
  }

  function hide() {
    if (!tooltipEl) return;
    tooltipEl.hidden = true;
    tooltipEl.innerHTML = '';
    if (activeEl) {
      activeEl.classList.remove('is-active');
      activeEl.setAttribute('aria-expanded', 'false');
      activeEl = null;
    }
    touchPinned = false;
  }

  function show(el, tech) {
    const tip = ensureTooltip();
    if (activeEl && activeEl !== el) {
      activeEl.classList.remove('is-active');
      activeEl.setAttribute('aria-expanded', 'false');
    }
    activeEl = el;
    el.classList.add('is-active');
    el.setAttribute('aria-expanded', 'true');
    tip.innerHTML = tooltipHtml(tech);
    tip.hidden = false;
    positionTooltip(el);
  }

  function bind(el, tech, options = {}) {
    const { onActivate } = options;

    el.addEventListener('mouseenter', () => show(el, tech));
    el.addEventListener('mouseleave', () => {
      if (!touchPinned) hide();
    });
    el.addEventListener('focus', () => show(el, tech));
    el.addEventListener('blur', () => {
      if (!touchPinned) hide();
    });
    el.addEventListener('keydown', e => {
      if (e.key === 'Escape') {
        hide();
        el.blur();
        return;
      }
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        if (onActivate) onActivate(tech);
      }
    });
    el.addEventListener('click', e => {
      if (window.matchMedia('(hover: none)').matches) {
        e.preventDefault();
        if (activeEl === el && touchPinned) {
          hide();
        } else {
          touchPinned = true;
          show(el, tech);
        }
        return;
      }
      if (onActivate) onActivate(tech);
    });
  }

  function bindGlobalDismiss(root) {
    document.addEventListener('click', e => {
      if (!touchPinned) return;
      if (root?.contains(e.target) || tooltipEl?.contains(e.target)) return;
      hide();
    });
    window.addEventListener('scroll', () => {
      if (activeEl && !tooltipEl?.hidden) positionTooltip(activeEl);
    }, { passive: true });
    window.addEventListener('resize', () => {
      if (activeEl && !tooltipEl?.hidden) positionTooltip(activeEl);
    });
  }

  return {
    bind,
    bindGlobalDismiss,
    accessibleLabel,
    controlLabel,
    hide
  };
})();
