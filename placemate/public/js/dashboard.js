(function () {
  const { el, api, clear, errorBox, diffBadge } = PM;
  const root = document.getElementById('root');

  PM.ready.then(async () => {
    if (!PM.user) { location.href = '/login.html?next=' + encodeURIComponent('/dashboard.html'); return; }
    try { render((await api('/dashboard')).data); } catch (e) { clear(root).append(errorBox(e.message)); }
  });

  function bars(rows, empty) {
    if (!rows.length) return el('p', { class: 'muted', text: empty });
    return el('div', {}, rows.map((r) => el('div', {},
      el('div', { class: 'small' }, el('b', { text: r.name }), ` - ${r.solved} solved / ${r.attempted} attempted`),
      el('div', { class: 'bar', role: 'img', 'aria-label': `${r.name}: ${r.solved} of ${r.attempted} solved` }, el('i', { class: 's', style: `width:${Math.round((r.solved / r.attempted) * 100)}%` })))));
  }

  function render(d) {
    const s = d.stats;
    clear(root);
    root.append(el('p', { class: 'lead', text: `Welcome, ${PM.user.name}.` }));
    if (!s.attempted && !s.bookmarks) {
      root.append(el('div', { class: 'card empty' }, el('h3', { text: 'Nothing here yet' }), el('p', { text: 'Mark a question as attempted or solved and your progress will show up here.' }), el('a', { class: 'btn', href: '/questions.html', text: 'Start practising' })));
    }
    root.append(el('div', { class: 'stats' },
      [[s.attempted, 'attempted'], [s.solved, 'solved'], [s.accuracy + '%', 'solved / attempted'], [s.bookmarks, 'bookmarked']].map(([n, l]) => el('div', { class: 'stat' }, el('b', { text: n }), l))));

    const max = Math.max(1, ...d.weeklyActivity.map((w) => w.count));
    root.append(el('div', { class: 'grid', style: 'grid-template-columns:repeat(auto-fit,minmax(300px,1fr))' },
      el('div', { class: 'card' }, el('h3', { text: 'Last 7 days' }), el('div', { class: 'week', role: 'img', 'aria-label': 'Questions attempted per day, last 7 days' },
        d.weeklyActivity.map((w) => el('div', {}, el('span', { style: `height:${Math.round((w.count / max) * 90)}px`, title: w.count + ' on ' + w.date }), w.date.slice(5))))),
      el('div', { class: 'card' }, el('h3', { text: 'By topic' }), bars(d.topicProgress, 'No topic data yet.')),
      el('div', { class: 'card' }, el('h3', { text: 'By company' }), bars(d.companyProgress, 'No company data yet.')),
      el('div', { class: 'card' }, el('h3', { text: 'Recently attempted' }),
        d.recent.length ? el('ul', {}, d.recent.map((r) => el('li', {}, el('a', { href: '/question/' + r.id, text: r.title }), el('span', { class: 'muted small', text: ' - ' + r.status })))) : el('p', { class: 'muted', text: 'Nothing yet.' }))));

    const bmBox = el('div', { class: 'card', style: 'margin-top:16px' }, el('h3', { text: 'Bookmarks' }), el('p', { class: 'muted', text: 'Loading...' }));
    root.append(bmBox);
    api('/bookmarks').then((r) => {
      const body = r.data.length ? el('ul', {}, r.data.map((b) => el('li', {}, el('a', { href: '/question/' + b.question._id, text: b.question.title }), ' ', diffBadge(b.question.difficulty), el('span', { class: 'muted small', text: ' ' + (b.question.company ? b.question.company.name : 'General') })))) : el('p', { class: 'muted', text: 'No bookmarks yet.' });
      bmBox.lastChild.replaceWith(body);
    }).catch((e) => bmBox.lastChild.replaceWith(errorBox(e.message)));
  }
})();
