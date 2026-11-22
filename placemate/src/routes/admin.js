const router = require('express').Router();
const { body } = require('express-validator');
const User = require('../models/User');
const Company = require('../models/Company');
const Question = require('../models/Question');
const { Report } = require('../models/UserData');
const { requireAdmin } = require('../middleware/auth');
const { ok, asyncH, validate, isId, str } = require('../middleware/helpers');

router.use(requireAdmin);

router.get(
  '/stats',
  asyncH(async (req, res) => {
    const [users, companies, questions, hidden, pending] = await Promise.all([
      User.countDocuments(),
      Company.countDocuments({ isActive: true }),
      Question.countDocuments({ isActive: true }),
      Question.countDocuments({ isActive: false }),
      Report.countDocuments({ status: 'pending' }),
    ]);
    ok(res, { users, companies, questions, hiddenQuestions: hidden, pendingReports: pending });
  })
);

router.get(
  '/reports',
  asyncH(async (req, res) => {
    const status = ['pending', 'resolved', 'dismissed'].includes(str(req.query.status)) ? str(req.query.status) : 'pending';
    const reports = await Report.find({ status }).sort({ createdAt: -1 }).limit(100).populate('reporter', 'name email').lean();
    const qIds = reports.filter((r) => r.targetType === 'question').map((r) => r.targetId);
    const questions = await Question.find({ _id: { $in: qIds } }).select('title isActive').lean();
    const qm = new Map(questions.map((q) => [String(q._id), q]));
    ok(res, reports.map((r) => ({ ...r, question: qm.get(String(r.targetId)) || null })));
  })
);

router.patch(
  '/reports/:id',
  body('status').isIn(['resolved', 'dismissed']).withMessage('Status must be resolved or dismissed.'),
  body('adminNote').optional().isString().isLength({ max: 500 }),
  validate,
  asyncH(async (req, res) => {
    if (!isId(req.params.id)) return res.status(404).json({ success: false, message: 'Report not found.' });
    const r = await Report.findByIdAndUpdate(req.params.id, { status: req.body.status, adminNote: req.body.adminNote || '' }, { new: true });
    if (!r) return res.status(404).json({ success: false, message: 'Report not found.' });
    ok(res, r);
  })
);

// Hide or restore a question (soft delete: user progress is kept).
router.patch(
  '/questions/:id',
  body('isActive').isBoolean().withMessage('isActive must be true or false.'),
  validate,
  asyncH(async (req, res) => {
    if (!isId(req.params.id)) return res.status(404).json({ success: false, message: 'Question not found.' });
    const q = await Question.findByIdAndUpdate(req.params.id, { isActive: req.body.isActive === true || req.body.isActive === 'true' }, { new: true }).select('title isActive');
    if (!q) return res.status(404).json({ success: false, message: 'Question not found.' });
    ok(res, q);
  })
);

module.exports = router;
