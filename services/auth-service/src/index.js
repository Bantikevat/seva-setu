/**
 * AUTH SERVICE — MAIN ENTRY POINT
 * -------------------------------------------------
 * Yahan se server start hota hai.
 *
 * Order:
 * 1. Environment variables load karo
 * 2. Express app setup karo
 * 3. Middleware lagao (JSON parser, security)
 * 4. Routes connect karo
 * 5. Database connect karo
 * 6. Redis connect karo
 * 7. Server start karo
 */

const express  = require('express');
const config   = require('./config/env');       // Pehle env load karo
const logger   = require('./utils/logger');
const { testConnection } = require('./config/database');
const { connectRedis }   = require('./config/redis');
const { applySecurity, authLimiter } = require('../../shared/middleware/security');

// Express app banao
const app = express();
app.set('trust proxy', 1);

// ─────────────────────────────────────────
//  GLOBAL MIDDLEWARE
// ─────────────────────────────────────────
applySecurity(app);  // helmet + CORS + rate limit

// JSON body parse karo
app.use(express.json());

// Request log karo (development mein)
app.use((req, res, next) => {
  if (config.isDev) {
    logger.debug(`${req.method} ${req.path}`);
  }
  next();
});

// ─────────────────────────────────────────
//  ROUTES
// ─────────────────────────────────────────

// Health check — koi bhi dekh sake service chal rahi hai
app.get('/health', (req, res) => {
  res.json({
    status:  'ok',
    service: 'auth-service',
    time:    new Date().toISOString(),
  });
});

// Auth routes — strict rate limit for OTP/login
app.use('/auth', authLimiter, require('./routes/auth.routes'));

// 404 — Koi route nahi mila
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route nahi mili: ${req.method} ${req.path}`,
  });
});

// Global error handler — unexpected errors ke liye
app.use((err, req, res, next) => {
  logger.error('Unhandled error:', err.message);
  res.status(500).json({
    success: false,
    message: 'Kuch gadbad ho gayi.',
  });
});

// ─────────────────────────────────────────
//  SERVER START
// ─────────────────────────────────────────
const startServer = async () => {
  try {
    // Database connect karo
    await testConnection();

    // Redis connect karo
    await connectRedis();

    // Server start karo
    const bulkSmsInd = require('./services/bulksmsind.service');
    const msg91Configured = !!config.msg91AuthKey;

    app.listen(config.port, () => {
      logger.info(`🚀 Auth Service running on port ${config.port}`);
      logger.info(`📍 Environment: ${config.nodeEnv}`);
      logger.info(`🌐 Health: http://localhost:${config.port}/health`);
      logger.info(`📱 SMS gateways:`);
      logger.info(`   ├─ BulkSMSIndia: ${bulkSmsInd.isConfigured() ? '✓ Active (primary)' : '✗ not configured'}`);
      logger.info(`   └─ MSG91:        ${msg91Configured ? '✓ Active (backup)' : '✗ not configured'}`);
      if (!bulkSmsInd.isConfigured() && !msg91Configured) {
        logger.info(`   ⚠  No gateway configured — OTP will print to console`);
      }
    });

  } catch (error) {
    logger.error('Server start failed:', error.message);
    process.exit(1);
  }
};

startServer();
