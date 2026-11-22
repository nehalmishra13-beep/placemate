const router = require('express').Router();
const Company = require('../models/Company');
const Question = require('../models/Question');
const { Progress, Bookmark, Note } = require('../models/UserData');
const { ok, asyncH, str, isId, escapeRegex, pageParams } = require('../middleware/helpers');

router.get(
  '/filters',
  asyncH(async (req, res) => {
    const match = { isActive: true };
    const [categories, difficulties, rounds, evidence, companies] = await Promise.all([
      Question.distinct('category', match),
      Question.distinct('difficulty', match),
      Question.distinct('round', match),
      Question.distinct('verificationStatus', match),
      Company.find({ isActive: true }).select('slug name').sort({ name: 1 }).lean(),
    ]);
    ok(res, { categories: categories.sort(), difficulties, rounds: rounds.filter(Boolean).sort(), evidence, companies });
  })
);

router.get(
  '/',
  asyncH(async (req, res) => {
    const { page, limit, skip } = pageParams(req);
    const filter = { isActive: true };

    const company = str(req.query.company);
    if (company === 'general') filter.company = null;
    else if (company) {
      const c = await Company.findOne({ slug: company.toLowerCase() }).select('_id');
      if (!c) return ok(res, [], { pagination: { total: 0, page, limit, totalPages: 0 } });
      filter.company = c._id;
    }
    for (const [param, field] of [['category', 'category'], ['difficulty', 'difficulty'], ['round', 'round'], ['evidence', 'verificationStatus']]) {
      const v = str(req.query[param]);
      if (v) filter[field] = v;
    }
    const search = str(req.query.search);
    if (search) {
      const rx = new RegExp(escapeRegex(search.slice(0, 80)), 'i');
      filter.$or = [{ title: rx }, { statement: rx }, { tags: rx }];
    }

    const [total, items] = await Promise.all([
      Question.countDocuments(filter),
      Question.find(filter)
        .select('-solutionCode -approach -complexity -notes')
        .populate('company', 'name slug')
        .sort({ title: 1 })
        .skip(skip)
        .limit(limit)
        .lean(),
    ]);

    if (req.session.userId && items.length) {
      const ids = items.map((q) => q._id);
      const [prog, marks] = await Promise.all([
        Progress.find({ user: req.session.userId, question: { $in: ids } }).lean(),
        Bookmark.find({ user: req.session.userId, question: { $in: ids } }).lean(),
      ]);
      const pm = new Map(prog.map((p) => [String(p.question), p.status]));
      const bm = new Set(marks.map((b) => String(b.question)));
      items.forEach((q) => {
        q.userStatus = pm.get(String(q._id)) || null;
        q.isBookmarked = bm.has(String(q._id));
      });
    }
    ok(res, items, { pagination: { total, page, limit, totalPages: Math.ceil(total / limit) } });
  })
);

router.get(
  '/:id',
  asyncH(async (req, res) => {
    if (!isId(req.params.id)) return res.status(404).json({ success: false, message: 'Question not found.' });
    const q = await Question.findOne({ _id: req.params.id, isActive: true }).populate('company', 'name slug').lean();
    if (!q) return res.status(404).json({ success: false, message: 'Question not found.' });

    const related = await Question.find({ isActive: true, _id: { $ne: q._id }, company: q.company ? q.company._id : null, category: q.category })
      .select('title difficulty verificationStatus')
      .limit(4)
      .lean();
    q.related = related;
    q.userStatus = null;
    q.isBookmarked = false;
    q.userNote = null;
    if (req.session.userId) {
      const user = req.session.userId;
      const [p, b, n] = await Promise.all([
        Progress.findOne({ user, question: q._id }).lean(),
        Bookmark.exists({ user, question: q._id }),
        Note.findOne({ user, question: q._id }).lean(),
      ]);
      q.userStatus = p ? p.status : null;
      q.isBookmarked = !!b;
      q.userNote = n ? n.content : null;
    }
    ok(res, q);
  })
);

module.exports = router;
