const router = require('express').Router();
const User = require('../models/User');
const Company = require('../models/Company');
const Question = require('../models/Question');
const { ok, asyncH } = require('../middleware/helpers');

// Public numbers for the landing page, counted from the database.
router.get(
  '/',
  asyncH(async (req, res) => {
    const [companies, questions, reported, users] = await Promise.all([
      Company.countDocuments({ isActive: true }),
      Question.countDocuments({ isActive: true }),
      Question.countDocuments({ isActive: true, verificationStatus: { $ne: 'practice' } }),
      User.countDocuments(),
    ]);
    ok(res, { companies, questions, reportedQuestions: reported, practiceQuestions: questions - reported, users });
  })
);
module.exports = router;
