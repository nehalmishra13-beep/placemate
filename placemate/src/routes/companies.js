const router = require('express').Router();
const Company = require('../models/Company');
const Question = require('../models/Question');
const { ok, asyncH, str, escapeRegex } = require('../middleware/helpers');

router.get(
  '/',
  asyncH(async (req, res) => {
    const filter = { isActive: true };
    const search = str(req.query.search);
    if (search) filter.name = new RegExp(escapeRegex(search), 'i');
    const companies = await Company.find(filter).sort({ name: 1 }).lean();
    const counts = await Question.aggregate([
      { $match: { isActive: true, company: { $ne: null } } },
      { $group: { _id: { c: '$company', e: '$verificationStatus' }, n: { $sum: 1 } } },
    ]);
    const byCompany = {};
    for (const r of counts) {
      const k = String(r._id.c);
      byCompany[k] = byCompany[k] || { total: 0, reported: 0 };
      byCompany[k].total += r.n;
      if (r._id.e !== 'practice') byCompany[k].reported += r.n;
    }
    ok(
      res,
      companies.map((c) => ({
        _id: c._id,
        slug: c.slug,
        name: c.name,
        roles: c.roles,
        roundCount: (c.hiringProcess || []).length,
        questionCount: (byCompany[String(c._id)] || {}).total || 0,
        reportedCount: (byCompany[String(c._id)] || {}).reported || 0,
      }))
    );
  })
);

router.get(
  '/:slug',
  asyncH(async (req, res) => {
    const company = await Company.findOne({ slug: String(req.params.slug).toLowerCase(), isActive: true }).lean();
    if (!company) return res.status(404).json({ success: false, message: 'Company not found.' });
    const groups = await Question.aggregate([
      { $match: { company: company._id, isActive: true } },
      { $group: { _id: '$verificationStatus', n: { $sum: 1 } } },
    ]);
    const evidence = { 'source-verified': 0, 'candidate-reported': 0, practice: 0 };
    groups.forEach((g) => (evidence[g._id] = g.n));
    ok(res, { ...company, evidence });
  })
);

module.exports = router;
