(function () {
  const { el, api, clear, errorBox, evidenceBadge, diffBadge, badge, qs, toast } = PM;
  const FIELDS = { search: 'f-search', company: 'f-company', category: 'f-category', difficulty: 'f-difficulty', round: 'f-round', evidence: 'f-evidence' };
  const state = { page: 1 };
  Object.keys(FIELDS).forEach((k) => (state[k] = qs(k) || ''));
  const list = document.getElementById('list');
  const EV = { 'candidate-reported': 'Candidate-reported', 'source-verified': 'Source-verified', practice: 'Practice question' };

  function fill(id, label, options, current) {
    const s = document.getElementById(id);
    clear(s).append(el('option', { value: '', text: 'All ' + label }));
    options.forEach(([v, t]) => s.append(el('option', { value: v, text: t, selected: v === current })));
  }

  async function init() {
    try {
      const d = (await api('/questions/filters')).data;
      fill('f-company', 'companies', [['general', 'General practice'], ...d.companies.map((c) => [c.slug, c.name])], state.company);
      fill('f-category', 'topics', d.categories.map((x) => [x, x]), state.category);
      fill('f-difficulty', 'levels', ['Easy', 'Medium', 'Hard'].filter((x) => d.difficulties.includes(x)).map((x) => [x, x]), state.difficulty);
      fill('f-round', 'rounds', d.rounds.map((x) => [x, x]), state.round);
      fill('f-evidence', 'evidence types', d.evidence.map((x) => [x, EV[x] || x]), state.evidence);
    } catch (e) { list.append(errorBox(e.message)); }
    document.getElementById('f-search').value = state.search;
    await PM.ready;
    load();
  }

  let t;
  Object.entries(FIELDS).forEach(([k, id]) => {
    const node = document.getElementById(id);
    node.addEventListener(k === 'search' ? 'input' : 'change', () => {
      state[k] = node.value; state.page = 1;
      clearTimeout(t); t = setTimeout(load, k === 'search' ? 300 : 0);
    });
  });
  document.getElementById('filters').addEventListener('submit', (e) => e.preventDefault());
  document.getElementById('clear').addEventListener('click', () => {
    Object.keys(FIELDS).forEach((k) => { state[k] = ''; document.getElementById(FIELDS[k]).value = ''; });
    state.page = 1; load();
  });

  async function load() {
    const p = new URLSearchParams({ page: state.page, limit: 10 });
    Object.keys(FIELDS).forEach((k) => state[k] && p.set(k, state[k]));
    try {
      const r = await api('/questions?' + p);
      render(r);
    } catch (e) { clear(list).append(errorBox(e.message)); }
  }

  function render(r) {
    clear(list);
    document.getElementById('count').textContent = `${r.pagination.total} question${r.pagination.total === 1 ? '' : 's'} found`;
    if (!r.data.length) list.append(el('div', { class: 'empty', text: 'No questions match these filters. Try clearing some.' }));
    r.data.forEach((q) => list.append(card(q)));
    const pager = clear(document.getElementById('pager'));
    if (r.pagination.totalPages > 1) {
      pager.append(
        el('button', { class: 'btn ghost sm', type: 'button', text: 'Previous', disabled: state.page <= 1, onclick: () => { state.page--; load(); window.scrollTo(0, 0); } }),
        el('span', { class: 'muted', text: `Page ${r.pagination.page} of ${r.pagination.totalPages}` }),
        el('button', { class: 'btn ghost sm', type: 'button', text: 'Next', disabled: state.page >= r.pagination.totalPages, onclick: () => { state.page++; load(); window.scrollTo(0, 0); } }));
    }
  }

  function card(q) {
    const actions = el('div', { class: 'actions' });
    if (PM.user) {
      const bm = el('button', { class: 'btn ghost sm' + (q.isBookmarked ? ' on' : ''), type: 'button', text: q.isBookmarked ? 'Bookmarked' : 'Bookmark' });
      bm.addEventListener('click', async () => {
        try {
          if (q.isBookmarked) await api('/bookmarks/' + q._id, { method: 'DELETE' }); else await api('/bookmarks', { method: 'POST', body: { questionId: q._id } });
          q.isBookmarked = !q.isBookmarked;
          bm.textContent = q.isBookmarked ? 'Bookmarked' : 'Bookmark'; bm.classList.toggle('on', q.isBookmarked);
        } catch (e) { toast(e.message); }
      });
      const sv = el('button', { class: 'btn ghost sm' + (q.userStatus === 'solved' ? ' on' : ''), type: 'button', text: q.userStatus === 'solved' ? 'Solved' : 'Mark solved' });
      sv.addEventListener('click', async () => {
        try { await api('/progress', { method: 'POST', body: { questionId: q._id, status: 'solved' } }); q.userStatus = 'solved'; sv.textContent = 'Solved'; sv.classList.add('on'); }
        catch (e) { toast(e.message); }
      });
      actions.append(bm, sv);
      if (!q.userStatus) {
        const at = el('button', { class: 'btn ghost sm', type: 'button', text: 'Mark attempted' });
        at.addEventListener('click', async () => {
          try { await api('/progress', { method: 'POST', body: { questionId: q._id, status: 'attempted' } }); q.userStatus = 'attempted'; at.textContent = 'Attempted'; at.disabled = true; }
          catch (e) { toast(e.message); }
        });
        actions.append(at);
      } else if (q.userStatus === 'attempted') actions.append(el('span', { class: 'muted small', text: 'Attempted' }));
    } else actions.append(el('a', { class: 'small', href: '/login.html?next=' + encodeURIComponent('/questions.html'), text: 'Log in to track progress' }));

    return el('div', { class: 'card', style: 'margin-bottom:12px' },
      el('div', { class: 'qrow' },
        el('div', {}, el('h3', {}, el('a', { href: '/question/' + q._id, text: q.title })),
          el('p', { class: 'muted small', text: [q.company ? q.company.name : 'General practice', q.round].filter(Boolean).join(' - ') })),
        el('div', { class: 'tags' }, evidenceBadge(q.verificationStatus), diffBadge(q.difficulty), badge('b-cat', q.category))),
      actions);
  }
  init();
})();
