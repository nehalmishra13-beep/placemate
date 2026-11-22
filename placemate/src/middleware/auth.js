const User = require('../models/User');

const fail = (res, code, message) => res.status(code).json({ success: false, message });

function requireAuth(req, res, next) {
  if (!req.session || !req.session.userId) return fail(res, 401, 'Please log in first.');
  next();
}

async function requireAdmin(req, res, next) {
  if (!req.session || !req.session.userId) return fail(res, 401, 'Please log in first.');
  try {
    const user = await User.findById(req.session.userId).select('role');
    if (!user || user.role !== 'admin') return fail(res, 403, 'Admin access only.');
    next();
  } catch (e) {
    next(e);
  }
}

module.exports = { requireAuth, requireAdmin };
