// Builds the shared header/footer and finds out who is logged in. Page scripts wait on PM.ready.
(function () {
  const { el, api } = PM;
  const page = location.pathname.replace(/\/$/, '') || '/';
  const link = (href, text, match) => el('a', { href, text, 'aria-current': match.test(page) ? 'page' : null });

  PM.ready = api('/auth/me')
    .then((r) => { PM.user = r.data; })
    .catch(() => { PM.user = null; })
    .then(() => {
      const nav = el('nav', { class: 'main', 'aria-label': 'Main' },
        link('/companies.html', 'Companies', /^\/(companies\.html|company\/)/),
        link('/questions.html', 'Question Bank', /^\/(questions\.html|question\/)/));
      if (PM.user) {
        nav.append(link('/dashboard.html', 'Dashboard', /dashboard/));
        if (PM.user.role === 'admin') nav.append(link('/admin.html', 'Admin', /admin/));
        nav.append(el('button', { class: 'btn ghost sm', type: 'button', text: 'Log out', onclick: async () => {
          try { await api('/auth/logout', { method: 'POST' }); } catch (e) { /* ignore */ }
          location.href = '/';
        } }));
      } else {
        nav.append(el('a', { class: 'btn sm', href: '/login.html', text: 'Log in' }));
      }
      const h = document.getElementById('site-header');
      if (h) h.replaceWith(el('header', { class: 'site' }, el('div', { class: 'wrap' }, el('a', { class: 'logo', href: '/', text: 'PlaceMate' }), nav)));
      const f = document.getElementById('site-footer');
      if (f) f.replaceWith(el('footer', { class: 'site' }, el('div', { class: 'wrap' },
        el('p', {}, el('b', { text: 'PlaceMate' }), ' - your companion for placement prep.'),
        el('p', { text: 'Source policy: every question is labelled Candidate-reported (a public candidate account says it was asked; wording is rewritten and the source is linked), Source-verified (an official source) or Practice question (not verified as asked). Hiring processes change by role, campus and year.' }))));
    });
})();
