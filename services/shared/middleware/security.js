/**
 * SECURITY MIDDLEWARE — helmet, rate limit, CORS
 * Sab services use karein.
 */
const helmet    = require('helmet');
const rateLimit = require('express-rate-limit');

const CORS_ORIGINS = (process.env.CORS_ORIGINS || '*')
  .split(',').map(s => s.trim());

const cors = (req, res, next) => {
  const origin = req.headers.origin;
  const allow  = CORS_ORIGINS.includes('*') ? '*'
               : (CORS_ORIGINS.includes(origin) ? origin : CORS_ORIGINS[0] || '*');

  res.header('Access-Control-Allow-Origin',      allow);
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods',     'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers',     'Content-Type, Authorization, X-Requested-With');
  res.header('Access-Control-Max-Age',           '86400');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
};

// Standard rate limiter — 100 req per 15 min per IP
const standardLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Bahut zyada requests — thoda ruko' },
});

// Strict rate limiter — for auth/OTP endpoints (5 per 5 min)
const authLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Bahut OTP attempts — 5 minute baad try karo' },
});

const applySecurity = (app) => {
  app.use(helmet({
    contentSecurityPolicy: false,
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  }));
  app.use(cors);
  app.use(standardLimiter);
};

module.exports = { applySecurity, cors, standardLimiter, authLimiter };
