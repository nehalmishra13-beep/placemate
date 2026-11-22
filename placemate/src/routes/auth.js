const router = require('express').Router();
const { body } = require('express-validator');
const User = require('../models/User');
const { requireAuth } = require('../middleware/auth');
const { ok, asyncH, validate } = require('../middleware/helpers');

const BAD = { success: false, message: 'Invalid email or password.' }; // same message for both cases

router.post(
  '/register',
  body('name').isString().trim().isLength({ min: 1, max: 100 }).withMessage('Name is required (max 100 characters).'),
  body('email').isString().trim().isEmail().withMessage('Enter a valid email address.').normalizeEmail(),
  body('password')
    .isString()
    .isLength({ min: 8, max: 100 }).withMessage('Password must be at least 8 characters.')
    .matches(/[A-Z]/).withMessage('Password needs an uppercase letter.')
    .matches(/\d/).withMessage('Password needs a number.'),
  validate,
  asyncH(async (req, res) => {
    // Only name, email and password are read. A "role" field in the request is ignored.
    const { name, email, password } = req.body;
    if (await User.exists({ email })) return res.status(409).json({ success: false, message: 'That email is already registered.' });
    const user = await User.create({ name, email, passwordHash: await User.hashPassword(password) });
    await new Promise((resolve, reject) => req.session.regenerate((e) => (e ? reject(e) : resolve())));
    req.session.userId = String(user._id);
    ok(res, user.toPublic(), {}, 201);
  })
);

router.post(
  '/login',
  body('email').isString().trim().isEmail().normalizeEmail(),
  body('password').isString().notEmpty(),
  (req, res, next) => {
    // Reject objects such as {"$gt": ""} before they reach the database.
    const { validationResult } = require('express-validator');
    if (!validationResult(req).isEmpty()) return res.status(400).json({ success: false, message: 'Enter your email and password.' });
    next();
  },
  asyncH(async (req, res) => {
    const user = await User.findOne({ email: req.body.email });
    if (!user || !(await user.checkPassword(req.body.password))) return res.status(401).json(BAD);
    await new Promise((resolve, reject) => req.session.regenerate((e) => (e ? reject(e) : resolve())));
    req.session.userId = String(user._id);
    ok(res, user.toPublic());
  })
);

router.post('/logout', (req, res, next) => {
  req.session.destroy((err) => {
    if (err) return next(err);
    res.clearCookie('placemate.sid');
    res.json({ success: true, message: 'Logged out.' });
  });
});

router.get(
  '/me',
  requireAuth,
  asyncH(async (req, res) => {
    const user = await User.findById(req.session.userId);
    if (!user) return res.status(401).json({ success: false, message: 'Please log in first.' });
    ok(res, user.toPublic());
  })
);

module.exports = router;
