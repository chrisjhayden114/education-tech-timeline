/**
 * Per-component visitor comments via Supabase (optional).
 * Falls back to localStorage when Supabase is not configured.
 *
 * Delete: this browser can delete comments it posted (ids stored locally).
 * Public delete policy allows the API call; the UI only offers Delete for owned ids.
 */
const Comments = (() => {
  let client = null;
  let ready = false;
  const cache = new Map();
  const OWNED_IDS_KEY = 'comments:owned-ids';

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
    'section-fear-dial': 'Does this Fear Dial coding method feel clear and fair? What would you change?',
    'section-timeline': 'Which technology on the timeline most surprises you - and why?',
    'section-pattern-primer': 'Which variable (control, dial, or engines) do you find most useful for explaining panics?',
    'section-pattern': 'Does the Pattern story (child control vs institution control) match what you have seen in schools?',
    'section-panic-grid': 'What stands out to you in the Panic Grid?',
    'section-panic-fork': 'Does the split between cognitive and non-cognitive panics ring true?',
    'section-engines-matrix': 'Which anxiety engine feels most active in schools right now?',
    'section-substitution': 'Where have you seen skill substitution fears play out in classrooms?',
    'section-paired-fates': 'Which paired comparison (same capability, different control) is most illuminating?',
    'section-panic-flow': 'Does this sequence of how an education panic unfolds match your experience?',
    'section-statistics': 'Which number on this page most challenges your prior assumptions?',
    'section-legend': 'Is any definition here unclear or missing an example you would add?',
    legend: section =>
      `Questions about "${section}"? Add a clarification or classroom example.`,
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
    return PROMPTS[itemId] || (label
      ? `Your thoughts on "${label}" are welcome.`
      : 'Your perspective is welcome - share a thought.');
  }

  function cacheKey(type, id) {
    return `${type}:${id}`;
  }

  function localKey(type, id) {
    return `comments:${type}:${id}`;
  }

  function readOwnedIds() {
    try {
      return new Set(JSON.parse(localStorage.getItem(OWNED_IDS_KEY) || '[]'));
    } catch {
      return new Set();
    }
  }

  function rememberOwnedId(id) {
    const owned = readOwnedIds();
    owned.add(String(id));
    localStorage.setItem(OWNED_IDS_KEY, JSON.stringify([...owned]));
  }

  function forgetOwnedId(id) {
    const owned = readOwnedIds();
    owned.delete(String(id));
    localStorage.setItem(OWNED_IDS_KEY, JSON.stringify([...owned]));
  }

  function isOwned(id) {
    return readOwnedIds().has(String(id));
  }

  async function fetchComments(itemType, itemId, { force = false } = {}) {
    const key = cacheKey(itemType, itemId);
    if (!force && cache.has(key)) return cache.get(key);

    let list = [];
    if (ready && client) {
      const { data, error } = await client
        .from('comments')
        .select('id, author_name, content, created_at')
        .eq('item_type', itemType)
        .eq('item_id', itemId)
        .order('created_at', { ascending: false })
        .limit(50);
      if (error) throw error;
      if (data) list = data;
    } else {
      try {
        list = JSON.parse(localStorage.getItem(localKey(itemType, itemId)) || '[]');
      } catch {
        list = [];
      }
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
        .insert({
          item_type: itemType,
          item_id: itemId,
          author_name: entry.author_name,
          content: entry.content
        })
        .select()
        .single();
      if (error) throw error;
      entry.id = data.id;
      entry.created_at = data.created_at;
      const key = cacheKey(itemType, itemId);
      const cached = cache.get(key) || [];
      cached.unshift(entry);
      cache.set(key, cached);
    } else {
      const key = cacheKey(itemType, itemId);
      const list = await fetchComments(itemType, itemId);
      list.unshift(entry);
      localStorage.setItem(localKey(itemType, itemId), JSON.stringify(list.slice(0, 50)));
      cache.set(key, list);
    }

    rememberOwnedId(entry.id);
    return entry;
  }

  async function deleteComment(itemType, itemId, commentId) {
    if (!isOwned(commentId)) {
      throw new Error('You can only delete comments you posted from this browser.');
    }

    if (ready && client) {
      const { error } = await client.from('comments').delete().eq('id', commentId);
      if (error) throw error;
    } else {
      const list = (await fetchComments(itemType, itemId)).filter(c => c.id !== commentId);
      localStorage.setItem(localKey(itemType, itemId), JSON.stringify(list));
      cache.set(cacheKey(itemType, itemId), list);
      forgetOwnedId(commentId);
      return list;
    }

    const key = cacheKey(itemType, itemId);
    const next = (cache.get(key) || []).filter(c => c.id !== commentId);
    cache.set(key, next);
    forgetOwnedId(commentId);
    return next;
  }

  function formatDate(iso) {
    return new Date(iso).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  }

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function renderList(list) {
    if (!list.length) {
      return '<p class="comment-empty">No comments yet - yours could be first.</p>';
    }
    return `<ul class="comment-list">${list
      .map(c => {
        const owned = isOwned(c.id);
        return `<li class="comment-item" data-comment-id="${escapeHtml(c.id)}">
        <div class="comment-item__meta">
          <span><strong>${escapeHtml(c.author_name)}</strong> · ${formatDate(c.created_at)}</span>
          ${
            owned
              ? `<button type="button" class="comment-delete" data-delete-id="${escapeHtml(c.id)}" aria-label="Delete your comment">Delete</button>`
              : ''
          }
        </div>
        <p class="comment-item__body">${escapeHtml(c.content)}</p>
      </li>`;
      })
      .join('')}</ul>`;
  }

  function updateCountDisplay(container, n) {
    let cnt = container.querySelector('.comment-count');
    if (n > 0) {
      if (!cnt) {
        const invite = container.querySelector('.comment-widget__invite');
        invite.insertAdjacentHTML(
          'afterend',
          `<span class="comment-count">${n} comment${n !== 1 ? 's' : ''}</span>`
        );
      } else {
        cnt.textContent = `${n} comment${n !== 1 ? 's' : ''}`;
      }
    } else if (cnt) {
      cnt.remove();
    }
  }

  function bindListActions(container, listWrap, itemType, itemId, toggle) {
    listWrap.querySelectorAll('.comment-delete').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.getAttribute('data-delete-id');
        if (!id) return;
        if (!confirm('Delete this comment? This cannot be undone.')) return;
        btn.disabled = true;
        try {
          const updated = await deleteComment(itemType, itemId, id);
          listWrap.innerHTML = renderList(updated);
          bindListActions(container, listWrap, itemType, itemId, toggle);
          updateCountDisplay(container, updated.length);
          if (toggle) {
            const panel = container.querySelector('.comment-panel');
            toggle.textContent =
              panel && !panel.hidden
                ? 'Hide comments'
                : updated.length
                  ? 'View & add comments'
                  : 'Add your thoughts';
          }
        } catch (err) {
          console.warn(err);
          btn.disabled = false;
          alert(err.message || 'Could not delete comment. Please try again.');
        }
      });
    });
  }

  /**
   * @param {HTMLElement} container
   * @param {'technology'|'stat'|'legend'|'reference'|'section'} itemType
   * @param {string} itemId
   * @param {string} [label]
   * @param {'compact'|'full'} [mode]
   */
  async function mount(container, itemType, itemId, label = '', mode = 'compact') {
    const prompt = promptFor(itemType, itemId, label);
    const list = await fetchComments(itemType, itemId);
    const count = list.length;
    const storageNote = ready
      ? ''
      : '<p class="comment-storage-note">Demo mode: comments save in your browser until Supabase is connected.</p>';
    const safeFormId = String(itemId).replace(/[^a-zA-Z0-9_-]/g, '-');

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
          <label class="sr-only" for="comment-name-${safeFormId}">Your name</label>
          <input type="text" id="comment-name-${safeFormId}" name="author" placeholder="Your name (first name is fine)" required maxlength="80" autocomplete="name">
          <label class="sr-only" for="comment-body-${safeFormId}">Your comment</label>
          <textarea id="comment-body-${safeFormId}" name="content" rows="3" placeholder="Share a thought, classroom story, or connection…" required maxlength="2000"></textarea>
          <button type="submit" class="btn-primary btn-sm">Post comment</button>
        </form>
      </div>
    `;

    const toggle = container.querySelector('.comment-toggle');
    const panel = container.querySelector('.comment-panel');
    const form = container.querySelector('.comment-form');
    const listWrap = container.querySelector('.comment-list-wrap');

    bindListActions(container, listWrap, itemType, itemId, toggle);

    toggle.addEventListener('click', async () => {
      const open = panel.hidden;
      panel.hidden = !open;
      toggle.setAttribute('aria-expanded', String(open));
      const n =
        (await fetchComments(itemType, itemId, { force: open && ready }).catch(() => list))
          .length;
      toggle.textContent = open
        ? 'Hide comments'
        : n
          ? 'View & add comments'
          : 'Add your thoughts';
      if (open && ready) {
        try {
          const fresh = await fetchComments(itemType, itemId, { force: true });
          listWrap.innerHTML = renderList(fresh);
          bindListActions(container, listWrap, itemType, itemId, toggle);
          updateCountDisplay(container, fresh.length);
        } catch (err) {
          console.warn('Could not refresh comments:', err);
        }
      }
    });

    form.addEventListener('submit', async e => {
      e.preventDefault();
      const btn = form.querySelector('button[type="submit"]');
      btn.disabled = true;
      const fd = new FormData(form);
      try {
        await postComment(itemType, itemId, fd.get('author'), fd.get('content'));
        const updated = await fetchComments(itemType, itemId, { force: ready });
        listWrap.innerHTML = renderList(updated);
        bindListActions(container, listWrap, itemType, itemId, toggle);
        updateCountDisplay(container, updated.length);
        form.reset();
        btn.textContent = 'Posted!';
        setTimeout(() => {
          btn.textContent = 'Post comment';
          btn.disabled = false;
        }, 1500);
      } catch (err) {
        console.warn(err);
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
