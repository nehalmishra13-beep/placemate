require('dotenv').config();
const path = require('path');
const express = require('express');
const helmet = require('helmet');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const mongoSanitize = require('express-mongo-sanitize');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const { notFound, errorHandler } = require('./middleware/errorHandler');

function createApp(mongoUri) {
  const app = express();
  const isProd = process.env.NODE_ENV === 'production';
  const isTest = process.env.NODE_ENV === 'test';
  app.disable('x-powered-by');
  app.set('trust proxy', 1); // needed for secure cookies behind Render/Railway proxies

  // Helmet adds security headers. "upgrade-insecure-requests" is turned off so http://localhost works.
  const directives = { ...helmet.contentSecurityPolicy.getDefaultDirectives(), 'upgrade-insecure-requests': null };
  app.use(helmet({ contentSecurityPolicy: { directives } }));
  if (!isTest) app.use(morgan('dev'));
  app.use(express.json({ limit: '50kb' }));
  app.use(mongoSanitize()); // strips $ and . operators from input (NoSQL injection)

  const store = MongoStore.create({ mongoUrl: mongoUri, collectionName: 'sessions' });
  app.locals.sessionStore = store;
  app.use(
    session({
      name: 'placemate.sid',
      secret: process.env.SESSION_SECRET || 'dev-only-secret',
      resave: false,
      saveUninitialized: false,
      store,
      cookie: { httpOnly: true, sameSite: 'lax', secure: isProd, maxAge: 1000 * 60 * 60 * 24 * 7 },
    })
  );

  if (!isTest) {
    app.use('/api', rateLimit({ windowMs: 15 * 60 * 1000, max: 600, standardHeaders: true, legacyHeaders: false }));
    // Strict limit only on login and register (brute-force protection). /auth/me is called on every page, so it is not limited here.
    const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 30, standardHeaders: true, legacyHeaders: false, message: { success: false, message: 'Too many attempts. Try again later.' } });
    app.use('/api/auth/login', authLimiter);
    app.use('/api/auth/register', authLimiter);
  }

  // CSRF defence: state-changing API calls must carry a custom header that only our own
  // JavaScript sends. Browsers do not let other sites add it to cross-site requests.
  app.use('/api', (req, res, next) => {
    if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) return next();
    if (req.get('X-Requested-With') !== 'PlaceMate') return res.status(403).json({ success: false, message: 'Missing request header.' });
    next();
  });

  app.use('/api/auth', require('./routes/auth'));
  app.use('/api/companies', require('./routes/companies'));
  app.use('/api/questions', require('./routes/questions'));
  app.use('/api/stats', require('./routes/stats'));
  app.use('/api/admin', require('./routes/admin'));
  app.use('/api', require('./routes/user')); // progress, bookmarks, notes, reports, dashboard

  const pub = path.join(__dirname, '..', 'public');
  app.use(express.static(pub));
  app.get('/company/:slug', (req, res) => res.sendFile(path.join(pub, 'company.html')));
  app.get('/question/:id', (req, res) => res.sendFile(path.join(pub, 'question.html')));

  app.use(notFound);
  app.use(errorHandler);
  return app;
}

module.exports = createApp;
