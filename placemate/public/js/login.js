(function () {
  const { el, api, qs, toast } = PM;
  let mode = 'login';
  const form = document.getElementById('auth-form');
  const msg = document.getElementById('auth-msg');
  const tabs = document.querySelectorAll('[data-tab]');
  const extra = document.getElementById('name-row');

  function setMode(m) {
    mode = m;
    tabs.forEach((t) => t.setAttribute('aria-selected', String(t.dataset.tab === m)));
    extra.hidden = m !== 'register';
    document.getElementById('name').required = m === 'register';
    document.getElementById('password').autocomplete = m === 'login' ? 'current-password' : 'new-password';
    document.getElementById('submit').textContent = m === 'login' ? 'Log in' : 'Create account';
    document.getElementById('pw-hint').hidden = m !== 'register';
    msg.replaceChildren();
  }
  tabs.forEach((t) => t.addEventListener('click', () => setMode(t.dataset.tab)));

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = document.getElementById('submit');
    btn.disabled = true;
    msg.replaceChildren();
    try {
      const body = { email: document.getElementById('email').value, password: document.getElementById('password').value };
      if (mode === 'register') body.name = document.getElementById('name').value;
      await api('/auth/' + mode, { method: 'POST', body });
      const next = qs('next');
      location.href = next && next.startsWith('/') && !next.startsWith('//') ? next : '/dashboard.html';
    } catch (err) {
      msg.append(el('div', { class: 'notice err', role: 'alert', text: err.message }));
      btn.disabled = false;
    }
  });
  PM.ready.then(() => { if (PM.user) location.href = '/dashboard.html'; });
  if (qs('mode') === 'register') setMode('register');
})();
