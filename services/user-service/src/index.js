/**
 * USER SERVICE â€” MAIN ENTRY
 * -------------------------------------------------
 * Port: 3002
 */

const express = require('express');
const { applySecurity } = require('../../shared/middleware/security');
const config  = require('./config/env');
const logger  = require('./utils/logger');
const { testConnection } = require('./config/database');

const app = express();
app.set('trust proxy', 1);

applySecurity(app);  // helmet + CORS + rate limit

// JSON parser (10MB limit for image uploads)
app.use(express.json({ limit: '10mb' }));

// Request logger
app.use((req, res, next) => {
  if (config.isDev) {
    logger.debug(`${req.method} ${req.path}`);
  }
  next();
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    status:  'ok',
    service: 'user-service',
    time:    new Date().toISOString(),
  });
});

// User routes
app.use('/users', require('./routes/user.routes'));

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route nahi mili: ${req.method} ${req.path}`,
  });
});

// Global error handler
app.use((err, req, res, next) => {
  logger.error('Unhandled error:', err.message);
  res.status(500).json({ success: false, message: 'Kuch gadbad ho gayi.' });
});

const startServer = async () => {
  try {
    await testConnection();

    app.listen(config.port, () => {
      logger.info(`ðŸš€ User Service running on port ${config.port}`);
      logger.info(`ðŸ“ Environment: ${config.nodeEnv}`);
      logger.info(`ðŸŒ Health: http://localhost:${config.port}/health`);
    });

  } catch (error) {
    logger.error('Server start failed:', error.message);
    process.exit(1);
  }
};

startServer();
