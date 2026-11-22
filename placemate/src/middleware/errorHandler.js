function notFound(req, res) {
  if (req.path.startsWith('/api')) return res.status(404).json({ success: false, message: 'Not found.' });
  res.status(404).send('Page not found.');
}

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  if (err.code === 11000) return res.status(409).json({ success: false, message: 'That record already exists.' });
  if (err.name === 'ValidationError') return res.status(400).json({ success: false, message: 'Invalid data.' });
  if (err.name === 'CastError') return res.status(400).json({ success: false, message: 'Invalid value.' });
  if (err.type === 'entity.parse.failed') return res.status(400).json({ success: false, message: 'Invalid JSON.' });
  if (process.env.NODE_ENV !== 'test') console.error(err);
  res.status(500).json({ success: false, message: 'Something went wrong on the server.' }); // never leak details
}
module.exports = { notFound, errorHandler };
