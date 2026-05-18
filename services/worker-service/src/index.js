/**
 * WORKER SERVICE â€” Main Entry
 * Port: 3003
 */

const express = require('express');
const { applySecurity } = require('../../shared/middleware/security');
const config  = require('./config/env');
const logger  = require('./utils/logger');
const { testConnection } = require('./config/database');
const { seedDatabase } = require('./config/seed');

const app = express();
app.set('trust proxy', 1);

applySecurity(app);  // helmet + CORS + rate limit

app.use(express.json());

// Request logger
app.use((req, res, next) => {
  if (config.isDev) logger.debug(`${req.method} ${req.path}`);
  next();
});

// Health
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'worker-service', time: new Date().toISOString() });
});

// Routes
app.use('/workers', require('./routes/worker.routes'));

// 404
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route nahi mili: ${req.method} ${req.path}` });
});

// Error handler
app.use((err, req, res, next) => {
  logger.error('Unhandled:', err.message);
  res.status(500).json({ success: false, message: 'Kuch gadbad ho gayi.' });
});

const startServer = async () => {
  try {
    await testConnection();
    await seedDatabase();

    app.listen(config.port, () => {
      logger.info(`ðŸš€ Worker Service running on port ${config.port}`);
      logger.info(`ðŸŒ Health: http://localhost:${config.port}/health`);
      logger.info(`ðŸ” Search: http://localhost:${config.port}/workers/search?category=Plumber`);
    });
  } catch (error) {
    logger.error('Start failed:', error.message);
    process.exit(1);
  }
};

startServer();
