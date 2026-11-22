(function () {
  const { el, api, errorBox } = PM;
  document.getElementById('home-search').addEventListener('submit', (e) => {
    e.preventDefault();
    const v = document.getElementById('q').value.trim();
    location.href = '/questions.html' + (v ? '?search=' + encodeURIComponent(v) : '');
  });
  api('/stats').then((r) => {
    const d = r.data;
    const s = document.getElementById('stats');
    [[d.companies, 'companies'], [d.reportedQuestions, 'candidate-reported questions'], [d.practiceQuestions, 'practice questions'], [d.users, 'registered students']]
      .forEach(([n, l]) => s.append(el('div', { class: 'stat' }, el('b', { text: n }), l)));
  }).catch(() => {});
  api('/companies').then((r) => {
    const box = document.getElementById('companies');
    r.data.forEach((c) => box.append(companyCard(c)));
  }).catch((e) => document.getElementById('companies').append(errorBox(e.message)));

  function companyCard(c) {
    return el('a', { class: 'card', href: '/company/' + encodeURIComponent(c.slug) },
      el('h3', { text: c.name }),
      el('p', { class: 'muted small', text: (c.roles || []).join(', ') }),
      el('p', { class: 'small' }, `${c.reportedCount} candidate-reported, ${c.questionCount - c.reportedCount} practice`));
  }
})();
