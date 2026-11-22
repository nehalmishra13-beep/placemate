(function () {
  const { el, api, clear, errorBox, safeUrl, evidenceBadge, diffBadge, badge, lastSegment, toast } = PM;
  const root = document.getElementById('root');
  const id = lastSegment();

  async function init() {
    await PM.ready;
    let q;
    try { q = (await api('/questions/' + encodeURIComponent(id))).data; }
    catch (e) {
      clear(root).append(el('div', { class: 'empty' }, el('h1', { text: e.status === 404 ? 'Question not found' : 'Could not load this question' }),
        el('p', { text: e.status === 404 ? '' : e.message }), el('a', { class: 'btn', href: '/questions.html', text: 'Back to the question bank' })));
      return;
    }
    document.title = q.title + ' - PlaceMate';
    const evNote = {
      'candidate-reported': 'A public candidate account says this was asked. The wording below is our own rewrite; follow the source link for the original account.',
      'source-verified': 'Supported by an identifiable official source.',
      practice: 'Practice question: not verified as asked in a real interview.',
    }[q.verificationStatus];

    clear(root).append(
      el('p', { class: 'small' }, el('a', { href: '/questions.html', text: 'Question bank' }), q.company ? [' / ', el('a', { href: '/company/' + q.company.slug, text: q.company.name })] : ''),
      el('h1', { text: q.title }),
      el('div', { class: 'tags' }, evidenceBadge(q.verificationStatus), diffBadge(q.difficulty), badge('b-cat', q.category), q.round ? badge('b-cat', q.round) : null, q.role ? badge('b-cat', q.role) : null),
      el('div', { class: 'notice' + (q.verificationStatus === 'practice' ? ' warn' : '') }, evNote),
      el('h2', { text: 'Question' }), el('p', { text: q.statement }),
      q.notes ? el('p', { class: 'muted', text: 'Note: ' + q.notes }) : null,
      sourcesBlock(q),
      el('h2', { text: 'Your progress' }), progressBlock(q),
      el('h2', { text: 'Explanation (our own, not from the source)' }),
      el('p', { text: q.approach || 'No explanation written yet.' }),
      q.complexity ? el('p', {}, el('b', { text: 'Complexity: ' }), q.complexity) : null,
      q.solutionCode ? el('div', {}, el('h3', { text: 'Solution (JavaScript, tested)' }), el('pre', {}, el('code', { text: q.solutionCode }))) : null,
      el('h2', { text: 'Your private note' }), noteBlock(q),
      q.related && q.related.length ? el('div', {}, el('h2', { text: 'Related questions' }), el('ul', {}, q.related.map((r) => el('li', {}, el('a', { href: '/question/' + r._id, text: r.title }), ' ', diffBadge(r.difficulty))))) : null,
      reportBlock(q));
  }

  function sourcesBlock(q) {
    if (!q.sources || !q.sources.length) return el('p', { class: 'muted', text: 'No source: this is a practice question.' });
    return el('div', {}, el('h2', { text: 'Sources' }), el('ul', {}, q.sources.map((s) => el('li', {},
      safeUrl(s.url) ? el('a', { href: s.url, target: '_blank', rel: 'noopener noreferrer', text: s.title }) : s.title,
      el('span', { class: 'muted small', text: ` (${s.sourceType}${s.sourceDate ? ', page last updated ' + s.sourceDate : ''}, read ${s.accessedDate})` })))));
  }

  function loginPrompt(text) {
    return el('p', { class: 'muted' }, el('a', { href: '/login.html?next=' + encodeURIComponent(location.pathname), text: 'Log in' }), ' ' + text);
  }

  function progressBlock(q) {
    if (!PM.user) return loginPrompt('to track progress and bookmark questions.');
    const status = el('span', { class: 'muted', text: label() });
    function label() { return q.userStatus ? 'Status: ' + q.userStatus : 'Not started'; }
    const mark = (s, btnText) => el('button', { class: 'btn ghost sm', type: 'button', text: btnText, onclick: async () => {
      try { await api('/progress', { method: 'POST', body: { questionId: q._id, status: s } }); if (s === 'solved' || !q.userStatus) q.userStatus = s; status.textContent = label(); toast('Saved'); }
      catch (e) { toast(e.message); }
    } });
    const bm = el('button', { class: 'btn ghost sm' + (q.isBookmarked ? ' on' : ''), type: 'button', text: q.isBookmarked ? 'Bookmarked' : 'Bookmark', onclick: async () => {
      try {
        if (q.isBookmarked) await api('/bookmarks/' + q._id, { method: 'DELETE' }); else await api('/bookmarks', { method: 'POST', body: { questionId: q._id } });
        q.isBookmarked = !q.isBookmarked; bm.textContent = q.isBookmarked ? 'Bookmarked' : 'Bookmark'; bm.classList.toggle('on', q.isBookmarked);
      } catch (e) { toast(e.message); }
    } });
    const reset = el('button', { class: 'btn ghost sm', type: 'button', text: 'Reset', onclick: async () => {
      try { await api('/progress/' + q._id, { method: 'DELETE' }); q.userStatus = null; status.textContent = label(); } catch (e) { toast(e.message); }
    } });
    return el('div', { class: 'actions' }, mark('attempted', 'Mark attempted'), mark('solved', 'Mark solved'), bm, reset, status);
  }

  function noteBlock(q) {
    if (!PM.user) return loginPrompt('to keep private notes.');
    const ta = el('textarea', { rows: 4, maxlength: 5000, 'aria-label': 'Your private note' });
    ta.value = q.userNote || '';
    return el('div', {}, ta, el('p', {}, el('button', { class: 'btn sm', type: 'button', text: 'Save note', onclick: async () => {
      try { await api('/notes/' + q._id, { method: 'PUT', body: { content: ta.value } }); toast('Note saved'); } catch (e) { toast(e.message); }
    } })));
  }

  function reportBlock(q) {
    if (!PM.user) return null;
    const reason = el('select', { id: 'rp-reason' }, [['incorrect-information', 'Incorrect information'], ['wrong-source', 'Wrong or misleading source'], ['duplicate', 'Duplicate'], ['inappropriate', 'Inappropriate'], ['other', 'Other']].map(([v, t]) => el('option', { value: v, text: t })));
    const desc = el('textarea', { id: 'rp-desc', rows: 2, maxlength: 1000, placeholder: 'Optional details' });
    const box = el('details', {}, el('summary', { text: 'Report a problem with this question or its source' }),
      el('label', { for: 'rp-reason', text: 'Reason' }), reason, el('label', { for: 'rp-desc', text: 'Details' }), desc,
      el('p', {}, el('button', { class: 'btn ghost sm', type: 'button', text: 'Send report', onclick: async () => {
        try { await api('/reports', { method: 'POST', body: { targetType: 'question', targetId: q._id, reason: reason.value, description: desc.value } }); desc.value = ''; toast('Thanks, report sent'); box.open = false; }
        catch (e) { toast(e.message); }
      } })));
    return el('div', { style: 'margin-top:28px' }, box);
  }
  init();
})();
