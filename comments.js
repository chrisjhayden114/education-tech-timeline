/**
 * Per-component visitor comments via Supabase (optional).
 * Falls back to localStorage when Supabase is not configured.
 */
const Comments = (() => {
  let client = null;
  let ready = false;
  const cache = new Map();

  const PROMPTS = {
    technology: name =>
      `When ${name} was new, people worried it would harm education. What parallels do you see today?`,
    'stat-total': 'Which technology panic surprised you most - and why?',
    'stat-transformed': 'Can you think of a technology that changed schooling in ways fear-mongers didn\'t predict?',
    'stat-dial': 'Does the fear intensity dial match your own experience or memory of these debates?',
    'stat-refs': 'Which source on this site would you recommend to a colleague?',
    'stat-fear-learning': 'Have you heard learning fears about a new technology in your school or community?',
    'stat-fear-morality': 'When do morality panics about technology feel justified to you - if ever?',
    'stat-fear-health': 'What health claims about screens or devices have you encountered as an educator?',
    'stat-fear-order': 'Have public-order fears about technology ever affected policy where you teach?',
    'stat-transformed-col': 'Did any technology transform education in ways this site understates?',
    'stat-dial-dist': 'Where would you place today\'s biggest education-tech fear on the 0–5 dial?',
    legend: section =>
      `Questions about “${section}”? Add a clarification or classroom example.`,
    reference: id =>
      `Thoughts on this source? Agree, disagree, or suggest a complementary reading.`
  };

  async function init() {
    const url = window.SUPABASE_URL;
    const key = window.SUPABASE_ANON_KEY;
    if (url && key) {
      try {
        const { createClient } = await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.49.1/+esm');
        client = createClient(url, key);
        ready = true;
      } catch (e) {
        console.warn('Supabase init failed:', e);
      }
    }
  }

  function promptFor(itemType, itemId, label) {
    if (itemType === 'technology') return PROMPTS.technology(label || itemId);
    if (itemType === 'legend') return PROMPTS.legend(label || itemId);
    if (itemType === 'reference') return PROMPTS.reference(itemId);
    return PROMPTS[itemId] || 'Your perspective is welcome - share a thought.';
  }

  function cacheKey(type, id) {
    return `${type}:${id}`;
  }

  function localKey(type, id) {
    return `comments:${type}:${id}`;
  }

  async function fetchComments(itemType, itemId) {
    const key = cacheKey(itemType, itemId);
    if (cache.has(key)) return cache.get(key);

    let list = [];
    if (ready && client) {
      const { data, error } = await client
        .from('comments')
        .select('id, author_name, content, created_at')
        .eq('item_type', itemType)
        .eq('item_id', itemId)
        .order('created_at', { ascending: false })
        .limit(50);
      if (!error && data) list = data;
    } else {
      try {
        list = JSON.parse(localStorage.getItem(localKey(itemType, itemId)) || '[]');
      } catch { list = []; }
    }
    cache.set(key, list);
    return list;
  }

  async function postComment(itemType, itemId, authorName, content) {
    const entry = {
      id: crypto.randomUUID(),
      author_name: authorName.trim(),
      content: content.trim(),
      created_at: new Date().toISOString()
    };

    if (ready && client) {
      const { data, error } = await client
        .from('comments')
        .insert({ item_type: itemType, item_id: itemId, author_name: entry.author_name, content: entry.content })
        .select()
        .single();
      if (error) throw error;
      entry.id = data.id;
      entry.created_at = data.created_at;
    } else {
      const list = await fetchComments(itemType, itemId);
      list.unshift(entry);
      localStorage.setItem(localKey(itemType, itemId), JSON.stringify(list.slice(0, 50)));
    }

    const key = cacheKey(itemType, itemId);
    const cached = cache.get(key) || [];
    cached.unshift(entry);
    cache.set(key, cached);
    return entry;
  }

  function formatDate(iso) {
    return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  }

  function renderList(list) {
    if (!list.length) {
      return '<p class="comment-empty">No comments yet - yours could be first.</p>';
    }
    return `<ul class="comment-list">${list.map(c => `
      <li class="comment-item">
        <div class="comment-item__meta"><strong>${escapeHtml(c.author_name)}</strong> · ${formatDate(c.created_at)}</div>
        <p class="comment-item__body">${escapeHtml(c.content)}</p>
      </li>`).join('')}</ul>`;
  }

  function escapeHtml(s) {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  /**
   * @param {HTMLElement} container
   * @param {'technology'|'stat'|'legend'|'reference'} itemType
   * @param {string} itemId
   * @param {string} [label] - display name for prompts
   * @param {'compact'|'full'} [mode]
   */
  async function mount(container, itemType, itemId, label = '', mode = 'compact') {
    const prompt = promptFor(itemType, itemId, label);
    const list = await fetchComments(itemType, itemId);
    const count = list.length;
    const storageNote = ready ? '' : '<p class="comment-storage-note">Demo mode: comments save in your browser until Supabase is connected.</p>';

    container.className = `comment-widget comment-widget--${mode}`;
    container.innerHTML = `
      <div class="comment-widget__header">
        <span class="comment-widget__icon" aria-hidden="true">💬</span>
        <div>
          <p class="comment-widget__invite">${escapeHtml(prompt)}</p>
          ${count ? `<span class="comment-count">${count} comment${count !== 1 ? 's' : ''}</span>` : ''}
        </div>
      </div>
      <button type="button" class="comment-toggle btn-secondary btn-sm" aria-expanded="false">
        ${count ? 'View & add comments' : 'Add your thoughts'}
      </button>
      <div class="comment-panel" hidden>
        ${storageNote}
        <div class="comment-list-wrap">${renderList(list)}</div>
        <form class="comment-form">
          <label class="sr-only" for="comment-name-${itemId}">Your name</label>
          <input type="text" id="comment-name-${itemId}" name="author" placeholder="Your name (first name is fine)" required maxlength="80" autocomplete="name">
          <label class="sr-only" for="comment-body-${itemId}">Your comment</label>
          <textarea id="comment-body-${itemId}" name="content" rows="3" placeholder="Share a thought, classroom story, or connection…" required maxlength="2000"></textarea>
          <button type="submit" class="btn-primary btn-sm">Post comment</button>
        </form>
      </div>
    `;

    const toggle = container.querySelector('.comment-toggle');
    const panel = container.querySelector('.comment-panel');
    const form = container.querySelector('.comment-form');
    const listWrap = container.querySelector('.comment-list-wrap');

    toggle.addEventListener('click', () => {
      const open = panel.hidden;
      panel.hidden = !open;
      toggle.setAttribute('aria-expanded', String(open));
      toggle.textContent = open ? 'Hide comments' : (count ? 'View & add comments' : 'Add your thoughts');
    });

    form.addEventListener('submit', async e => {
      e.preventDefault();
      const btn = form.querySelector('button[type="submit"]');
      btn.disabled = true;
      const fd = new FormData(form);
      try {
        await postComment(itemType, itemId, fd.get('author'), fd.get('content'));
        const updated = await fetchComments(itemType, itemId);
        listWrap.innerHTML = renderList(updated);
        const cnt = container.querySelector('.comment-count');
        if (cnt) cnt.textContent = `${updated.length} comment${updated.length !== 1 ? 's' : ''}`;
        else if (updated.length) {
          const invite = container.querySelector('.comment-widget__invite');
          invite.insertAdjacentHTML('afterend', `<span class="comment-count">${updated.length} comments</span>`);
        }
        form.reset();
        btn.textContent = 'Posted!';
        setTimeout(() => { btn.textContent = 'Post comment'; btn.disabled = false; }, 1500);
      } catch (err) {
        btn.disabled = false;
        alert('Could not post comment. Please try again.');
      }
    });
  }

  async function refreshCount(itemType, itemId) {
    const list = await fetchComments(itemType, itemId);
    return list.length;
  }

  return { init, mount, fetchComments, promptFor, refreshCount };
})();

window.Comments = Comments;
