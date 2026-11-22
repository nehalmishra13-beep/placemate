(function () {
  const { el, api, clear, errorBox, safeUrl, evidenceBadge, diffBadge, badge, lastSegment } = PM;
  const root = document.getElementById('root');
  const slug = lastSegment();
  const f = { category: '', difficulty: '', evidence: '' };

  async function init() {
    let c;
    try { c = (await api('/companies/' + encodeURIComponent(slug))).data; }
    catch (e) {
      clear(root).append(el('div', { class: 'empty' }, el('h1', { text: e.status === 404 ? 'Company not found' : 'Could not load this company' }),
        el('p', { text: e.status === 404 ? 'It may not have been researched yet.' : e.message }), el('a', { class: 'btn', href: '/companies.html', text: 'All companies' })));
      return;
    }
    document.title = c.name + ' - PlaceMate';
    const ev = c.evidence;
    clear(root).append(
      el('h1', { text: c.name }),
      el('p', { class: 'lead', text: c.overview }),
      el('div', { class: 'notice warn' }, el('b', { text: 'What data is here: ' }), c.dataNote || 'Limited data.',
        ` Questions: ${ev['candidate-reported']} candidate-reported, ${ev['source-verified']} source-verified, ${ev.practice} practice. Reviewed ${c.lastReviewed || 'n/a'}. Processes change by role, campus and year.`),
      el('p', {}, 'Roles: ', (c.roles || []).map((r) => badge('b-cat', r)).flatMap((b) => [b, ' '])),
      el('h2', { text: 'Hiring rounds (as reported by candidates)' }),
      el('ol', { class: 'timeline' }, (c.hiringProcess || []).map((r) => el('li', {}, el('h3', { text: r.name }), el('div', { class: 'muted', text: r.description })))),
      el('h2', { text: 'Topics to prepare' }),
      el('div', { class: 'tags' }, (c.topics || []).map((t) => badge('b-cat', t))),
      c.prepResources && c.prepResources.length ? el('div', {}, el('h2', { text: 'Preparation resources' }), el('ul', {}, c.prepResources.map((p) => el('li', {}, safeUrl(p.url) ? el('a', { href: p.url, target: '_blank', rel: 'noopener noreferrer', text: p.title }) : p.title, p.note ? ' - ' + p.note : '')))) : null,
      el('h2', { text: 'Sources for the hiring process' }),
      el('ul', {}, (c.hiringSources || []).map((s) => el('li', {}, safeUrl(s.url) ? el('a', { href: s.url, target: '_blank', rel: 'noopener noreferrer', text: s.title }) : s.title, el('span', { class: 'muted small', text: ` (${s.sourceType}, read ${s.accessedDate})` })))),
      el('h2', { text: 'Questions' }),
      el('div', { class: 'card', id: 'qfilters' }, filterRow()),
      el('div', { id: 'qlist', style: 'margin-top:14px' }));
    loadQuestions();
  }

  function sel(id, label, opts) {
    const s = el('select', { id }, el('option', { value: '', text: 'All' }), opts.map((o) => el('option', { value: o, text: o })));
    s.addEventListener('change', () => { f[id.replace('cf-', '')] = s.value; loadQuestions(); });
    return el('div', {}, el('label', { for: id, text: label }), s);
  }
  function filterRow() {
    return el('div', { class: 'grid' },
      sel('cf-category', 'Topic', ['DSA', 'DBMS', 'SQL', 'OOP', 'OS', 'Networks', 'Programming', 'Aptitude', 'HR', 'Behavioral', 'Other']),
      sel('cf-difficulty', 'Difficulty', ['Easy', 'Medium', 'Hard']),
      sel('cf-evidence', 'Evidence', ['candidate-reported', 'source-verified', 'practice']));
  }

  async function loadQuestions() {
    const box = document.getElementById('qlist');
    const p = new URLSearchParams({ company: slug, limit: 50 });
    Object.entries(f).forEach(([k, v]) => v && p.set(k, v));
    try {
      const r = await api('/questions?' + p);
      clear(box);
      if (!r.data.length) return box.append(el('div', { class: 'empty', text: 'No questions match these filters.' }));
      r.data.forEach((q) => box.append(el('a', { class: 'card', style: 'margin-bottom:10px', href: '/question/' + q._id },
        el('div', { class: 'qrow' }, el('h3', { text: q.title }), el('div', { class: 'tags' }, evidenceBadge(q.verificationStatus), diffBadge(q.difficulty), badge('b-cat', q.category))),
        el('p', { class: 'muted small', text: q.round || '' }))));
    } catch (e) { clear(box).append(errorBox(e.message)); }
  }
  init();
})();
