let DATA = null;

async function init() {
  await Comments.init();
  const res = await fetch(`data.json?v=${Date.now()}`, { cache: 'no-cache' });
  DATA = await res.json();

  renderReferences(DATA.references);
  renderTechMap(DATA.technologies);
  bindSearch();

  if (location.hash) {
    const el = document.getElementById(location.hash.slice(1));
    if (el) {
      el.classList.add('highlight');
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }
}

function renderReferences(refs) {
  const list = document.getElementById('refs-list');
  list.innerHTML = refs.map(ref => {
    const inner = ref.url
      ? `<a href="${ref.url}" target="_blank" rel="noopener noreferrer" class="ref-link">${ref.text}<span class="ref-external" aria-hidden="true"> ↗</span></a>`
      : ref.text;
    const commentSlot = `<div class="comment-slot" id="comment-slot-${ref.id}"></div>`;
    return `<li id="${ref.id}" data-text="${escapeAttr(ref.text.toLowerCase())}">${inner}${commentSlot}</li>`;
  }).join('');

  refs.forEach(ref => {
    const slot = document.getElementById(`comment-slot-${ref.id}`);
    if (slot) Comments.mount(slot, 'reference', ref.id, ref.text.slice(0, 60), 'compact');
  });

  updateCount(refs.length);
}

function renderTechMap(technologies) {
  const container = document.getElementById('tech-ref-map');
  container.innerHTML = technologies
    .filter(t => t.references.length > 0)
    .map(t => `
      <div class="tech-ref-row">
        <strong>${t.name}</strong>
        ${t.references.map(r => {
          const ref = DATA.references.find(x => x.id === r.id);
          const href = ref?.url || `#${r.id}`;
          const external = ref?.url ? ' target="_blank" rel="noopener noreferrer"' : '';
          return `<a href="${href}"${external}>${r.short}${ref?.url ? ' ↗' : ''}</a>`;
        }).join('')}
      </div>
    `).join('');

  container.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      e.preventDefault();
      const id = a.getAttribute('href').slice(1);
      document.querySelectorAll('.refs-list li').forEach(li => li.classList.remove('highlight'));
      const el = document.getElementById(id);
      if (el) {
        el.classList.add('highlight');
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        history.replaceState(null, '', `#${id}`);
      }
    });
  });
}

function bindSearch() {
  const input = document.getElementById('ref-search');
  input.addEventListener('input', () => {
    const q = input.value.toLowerCase().trim();
    let visible = 0;
    document.querySelectorAll('.refs-list li').forEach(li => {
      const match = !q || li.dataset.text.includes(q);
      li.style.display = match ? '' : 'none';
      if (match) visible++;
    });
    updateCount(visible);
  });
}

function updateCount(n) {
  document.getElementById('ref-count').textContent =
    `Showing ${n} reference${n !== 1 ? 's' : ''} — click to open, expand to comment`;
}

function escapeAttr(s) {
  return s.replace(/"/g, '&quot;');
}

init();
