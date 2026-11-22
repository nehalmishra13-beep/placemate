(function () {
  const { el, api, clear, errorBox, toast } = PM;
  const root = document.getElementById('root');

  PM.ready.then(async () => {
    if (!PM.user) { location.href = '/login.html?next=' + encodeURIComponent('/admin.html'); return; }
    if (PM.user.role !== 'admin') { clear(root).append(errorBox('This page is for admins only.')); return; }
    clear(root);
    const stats = el('div', { class: 'stats' });
    const reports = el('div', {});
    root.append(stats, el('h2', { text: 'Pending reports' }), reports);
    await loadStats(stats); await loadReports(reports, stats);
  });

  async function loadStats(box) {
    try {
      const d = (await api('/admin/stats')).data;
      clear(box).append(...[[d.users, 'users'], [d.companies, 'companies'], [d.questions, 'live questions'], [d.hiddenQuestions, 'hidden questions'], [d.pendingReports, 'pending reports']]
        .map(([n, l]) => el('div', { class: 'stat' }, el('b', { text: n }), l)));
    } catch (e) { clear(box).append(errorBox(e.message)); }
  }

  async function loadReports(box, stats) {
    try {
      const r = (await api('/admin/reports?status=pending')).data;
      clear(box);
      if (!r.length) return box.append(el('div', { class: 'empty', text: 'No pending reports.' }));
      r.forEach((rep) => {
        const note = el('input', { type: 'text', maxlength: 500, placeholder: 'Admin note (optional)', 'aria-label': 'Admin note' });
        const act = (status) => async () => {
          try { await api('/admin/reports/' + rep._id, { method: 'PATCH', body: { status, adminNote: note.value } }); toast('Report ' + status); await loadReports(box, stats); await loadStats(stats); }
          catch (e) { toast(e.message); }
        };
        const q = rep.question;
        const hide = q ? el('button', { class: 'btn ghost sm', type: 'button', text: q.isActive ? 'Hide question' : 'Restore question', onclick: async () => {
          try { await api('/admin/questions/' + q._id, { method: 'PATCH', body: { isActive: !q.isActive } }); toast('Updated'); await loadReports(box, stats); await loadStats(stats); }
          catch (e) { toast(e.message); }
        } }) : null;
        box.append(el('div', { class: 'card', style: 'margin-bottom:12px' },
          el('p', {}, el('b', { text: rep.reason }), ` on ${rep.targetType}: `, q ? el('a', { href: '/question/' + q._id, text: q.title }) : String(rep.targetId)),
          rep.description ? el('p', { text: rep.description }) : null,
          el('p', { class: 'muted small', text: `Reported by ${rep.reporter ? rep.reporter.email : 'unknown'} on ${new Date(rep.createdAt).toLocaleDateString()}` }),
          note, el('div', { class: 'actions', style: 'margin-top:8px' }, el('button', { class: 'btn sm', type: 'button', text: 'Resolve', onclick: act('resolved') }), el('button', { class: 'btn ghost sm', type: 'button', text: 'Dismiss', onclick: act('dismissed') }), hide)));
      });
    } catch (e) { clear(box).append(errorBox(e.message)); }
  }
})();
