// Everything here is private to the logged-in user: progress, bookmarks, notes, dashboard.
const router = require('express').Router();
const { body } = require('express-validator');
const Question = require('../models/Question');
const { Progress, Bookmark, Note, Report } = require('../models/UserData');
const { requireAuth } = require('../middleware/auth');
const { ok, asyncH, validate, isId } = require('../middleware/helpers');

router.use(['/progress', '/bookmarks', '/notes', '/reports', '/dashboard'], requireAuth); // other /api paths fall through to 404
const me = (req) => req.session.userId;
const notFound = (res) => res.status(404).json({ success: false, message: 'Question not found.' });
const activeQuestion = (id) => (isId(id) ? Question.exists({ _id: id, isActive: true }) : null);

/* ---------- progress ---------- */
router.post(
  '/progress',
  body('questionId').custom(isId).withMessage('Invalid question.'),
  body('status').isIn(['attempted', 'solved']).withMessage('Status must be attempted or solved.'),
  validate,
  asyncH(async (req, res) => {
    const { questionId, status } = req.body;
    if (!(await activeQuestion(questionId))) return notFound(res);
    const now = new Date();
    let p = await Progress.findOne({ user: me(req), question: questionId });
    if (!p) {
      p = new Progress({ user: me(req), question: questionId, status, attemptCount: 1, lastAttemptAt: now });
    } else {
      p.attemptCount += 1;
      p.lastAttemptAt = now;
      if (status === 'solved') p.status = 'solved';
    }
    if (p.status === 'solved' && !p.solvedAt) p.solvedAt = now;
    await p.save();
    ok(res, p);
  })
);

router.delete(
  '/progress/:questionId',
  asyncH(async (req, res) => {
    if (!isId(req.params.questionId)) return notFound(res);
    await Progress.deleteOne({ user: me(req), question: req.params.questionId });
    ok(res, { removed: true });
  })
);

/* ---------- bookmarks ---------- */
router.get(
  '/bookmarks',
  asyncH(async (req, res) => {
    const marks = await Bookmark.find({ user: me(req) })
      .sort({ createdAt: -1 })
      .populate({ path: 'question', select: 'title difficulty category verificationStatus isActive company', populate: { path: 'company', select: 'name slug' } })
      .lean();
    ok(res, marks.filter((m) => m.question && m.question.isActive));
  })
);

router.post(
  '/bookmarks',
  body('questionId').custom(isId).withMessage('Invalid question.'),
  validate,
  asyncH(async (req, res) => {
    if (!(await activeQuestion(req.body.questionId))) return notFound(res);
    const b = await Bookmark.findOneAndUpdate(
      { user: me(req), question: req.body.questionId },
      { $setOnInsert: { user: me(req), question: req.body.questionId } },
      { upsert: true, new: true }
    );
    ok(res, b, {}, 201);
  })
);

router.delete(
  '/bookmarks/:questionId',
  asyncH(async (req, res) => {
    if (!isId(req.params.questionId)) return notFound(res);
    await Bookmark.deleteOne({ user: me(req), question: req.params.questionId });
    ok(res, { removed: true });
  })
);

/* ---------- notes (always filtered by the session user) ---------- */
router.get(
  '/notes/:questionId',
  asyncH(async (req, res) => {
    if (!isId(req.params.questionId)) return notFound(res);
    const n = await Note.findOne({ user: me(req), question: req.params.questionId }).lean();
    ok(res, n ? { content: n.content, updatedAt: n.updatedAt } : null);
  })
);

router.put(
  '/notes/:questionId',
  body('content').isString().withMessage('Note must be text.').isLength({ max: 5000 }).withMessage('Note is too long (max 5000).'),
  validate,
  asyncH(async (req, res) => {
    if (!(await activeQuestion(req.params.questionId))) return notFound(res);
    const content = req.body.content.trim();
    if (!content) {
      await Note.deleteOne({ user: me(req), question: req.params.questionId });
      return ok(res, null);
    }
    const n = await Note.findOneAndUpdate({ user: me(req), question: req.params.questionId }, { content }, { upsert: true, new: true, setDefaultsOnInsert: true });
    ok(res, { content: n.content, updatedAt: n.updatedAt });
  })
);

router.delete(
  '/notes/:questionId',
  asyncH(async (req, res) => {
    if (!isId(req.params.questionId)) return notFound(res);
    await Note.deleteOne({ user: me(req), question: req.params.questionId });
    ok(res, { removed: true });
  })
);

/* ---------- reports ---------- */
router.post(
  '/reports',
  body('targetType').isIn(['question', 'company']).withMessage('Invalid target.'),
  body('targetId').custom(isId).withMessage('Invalid target.'),
  body('reason').isIn(['incorrect-information', 'wrong-source', 'duplicate', 'inappropriate', 'other']).withMessage('Choose a reason.'),
  body('description').optional({ nullable: true }).isString().isLength({ max: 1000 }).withMessage('Description is too long (max 1000).'),
  validate,
  asyncH(async (req, res) => {
    const r = await Report.create({
      reporter: me(req),
      targetType: req.body.targetType,
      targetId: req.body.targetId,
      reason: req.body.reason,
      description: (req.body.description || '').trim(),
    });
    ok(res, { id: r._id }, {}, 201);
  })
);

/* ---------- dashboard (all numbers come from this user's own records) ---------- */
router.get(
  '/dashboard',
  asyncH(async (req, res) => {
    const user = me(req);
    const [records, bookmarks] = await Promise.all([
      Progress.find({ user })
        .populate({ path: 'question', select: 'title category difficulty company', populate: { path: 'company', select: 'name slug' } })
        .sort({ lastAttemptAt: -1 })
        .lean(),
      Bookmark.countDocuments({ user }),
    ]);
    const valid = records.filter((r) => r.question);
    const attempted = valid.length; // "solved" counts as attempted too
    const solved = valid.filter((r) => r.status === 'solved').length;
    const accuracy = attempted ? Math.round((solved / attempted) * 100) : 0;

    const group = (keyFn) => {
      const m = new Map();
      for (const r of valid) {
        const k = keyFn(r);
        const g = m.get(k) || { name: k, attempted: 0, solved: 0 };
        g.attempted += 1;
        if (r.status === 'solved') g.solved += 1;
        m.set(k, g);
      }
      return [...m.values()].sort((a, b) => b.attempted - a.attempted);
    };

    const weekly = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setUTCDate(d.getUTCDate() - i);
      weekly.push({ date: d.toISOString().slice(0, 10), count: 0 });
    }
    for (const r of valid) {
      const day = new Date(r.lastAttemptAt).toISOString().slice(0, 10);
      const slot = weekly.find((w) => w.date === day);
      if (slot) slot.count += 1;
    }

    ok(res, {
      stats: { attempted, solved, accuracy, bookmarks },
      topicProgress: group((r) => r.question.category),
      companyProgress: group((r) => (r.question.company ? r.question.company.name : 'General practice')),
      weeklyActivity: weekly,
      recent: valid.slice(0, 5).map((r) => ({ id: r.question._id, title: r.question.title, status: r.status, at: r.lastAttemptAt })),
    });
  })
);

module.exports = router;
