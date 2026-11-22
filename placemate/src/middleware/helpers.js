const { validationResult } = require('express-validator');

const ID_RE = /^[a-f\d]{24}$/i;
const isId = (v) => typeof v === 'string' && ID_RE.test(v);
const str = (v) => (typeof v === 'string' ? v.trim() : undefined); // ignores arrays/objects from query strings
const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const ok = (res, data, extra = {}, status = 200) => res.status(status).json({ success: true, data, ...extra });
const asyncH = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

function validate(req, res, next) {
  const errors = validationResult(req);
  if (errors.isEmpty()) return next();
  return res.status(400).json({ success: false, message: errors.array()[0].msg });
}

function pageParams(req, defLimit = 12) {
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || defLimit, 1), 50);
  return { page, limit, skip: (page - 1) * limit };
}

module.exports = { isId, str, escapeRegex, ok, asyncH, validate, pageParams };
