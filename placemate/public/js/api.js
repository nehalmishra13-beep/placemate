// Shared helpers. All page text goes through el()/textContent so user data can never run as HTML (XSS-safe).
(function () {
  const HEADERS = { 'Content-Type': 'application/json', 'X-Requested-With': 'PlaceMate' };

  async function api(path, { method = 'GET', body } = {}) {
    const res = await fetch('/api' + path, { method, headers: HEADERS, credentials: 'same-origin', body: body ? JSON.stringify(body) : undefined });
    let json = null;
    try { json = await res.json(); } catch (e) { /* not JSON */ }
    if (!res.ok || !json || json.success === false) {
      const err = new Error((json && json.message) || 'Something went wrong. Please try again.');
      err.status = res.status;
      throw err;
    }
    return json;
  }

  function el(tag, attrs, ...kids) {
    const n = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs || {})) {
      if (v == null || v === false) continue;
      if (k === 'class') n.className = v;
      else if (k === 'text') n.textContent = v;
      else if (k.startsWith('on')) n.addEventListener(k.slice(2), v);
      else n.setAttribute(k, v === true ? '' : v);
    }
    for (const kid of kids.flat()) {
      if (kid == null || kid === false) continue;
      n.append(kid.nodeType ? kid : document.createTextNode(String(kid)));
    }
    return n;
  }

  const safeUrl = (u) => (typeof u === 'string' && /^https?:\/\//i.test(u) ? u : null);
  const EVIDENCE = { 'candidate-reported': 'Candidate-reported', 'source-verified': 'Source-verified', practice: 'Practice question' };
  const badge = (cls, text) => el('span', { class: 'badge ' + cls, text });
  const evidenceBadge = (s) => badge('b-' + s, EVIDENCE[s] || s);
  const diffBadge = (d) => badge('b-' + d, d);

  let timer;
  function toast(msg) {
    let t = document.getElementById('toast');
    if (!t) { t = el('div', { id: 'toast', role: 'status' }); document.body.append(t); }
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(timer);
    timer = setTimeout(() => t.classList.remove('show'), 2600);
  }

  const clear = (node) => { while (node.firstChild) node.removeChild(node.firstChild); return node; };
  const qs = (k) => new URLSearchParams(location.search).get(k);
  const lastSegment = () => decodeURIComponent(location.pathname.split('/').filter(Boolean).pop() || '');
  const errorBox = (msg) => el('div', { class: 'notice err', role: 'alert', text: msg });

  window.PM = { api, el, safeUrl, evidenceBadge, diffBadge, badge, toast, clear, qs, lastSegment, errorBox, user: null };
})();
