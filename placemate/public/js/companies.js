(function () {
  const { el, api, clear, errorBox } = PM;
  const list = document.getElementById('list');
  const input = document.getElementById('cq');
  let t;
  async function load() {
    try {
      const r = await api('/companies?search=' + encodeURIComponent(input.value.trim()));
      clear(list);
      if (!r.data.length) return list.append(el('div', { class: 'empty', text: 'No companies match your search.' }));
      r.data.forEach((c) => list.append(el('a', { class: 'card', href: '/company/' + encodeURIComponent(c.slug) },
        el('h3', { text: c.name }),
        el('p', { class: 'muted small', text: (c.roles || []).join(', ') }),
        el('p', { class: 'small', text: `${c.roundCount} rounds described` }),
        el('p', { class: 'small', text: `${c.reportedCount} candidate-reported / ${c.questionCount - c.reportedCount} practice questions` }))));
    } catch (e) { clear(list).append(errorBox(e.message)); }
  }
  document.getElementById('cform').addEventListener('submit', (e) => e.preventDefault());
  input.addEventListener('input', () => { clearTimeout(t); t = setTimeout(load, 250); });
  load();
})();
