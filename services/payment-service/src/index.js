/**
 * PAYMENT SERVICE â€” Main Entry
 * Port: 3006
 */

const express = require('express');
const { applySecurity } = require('../../shared/middleware/security');
const config = require('./config/env');
const logger = require('./utils/logger');
const { testConnection } = require('./config/database');

const app = express();
app.set('trust proxy', 1);

applySecurity(app);  // helmet + CORS + rate limit

app.use(express.json());

app.use((req, res, next) => {
  if (config.isDev) logger.debug(`${req.method} ${req.path}`);
  next();
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'payment-service', time: new Date().toISOString() });
});

app.use('/payments', require('./routes/payment.routes'));

app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route nahi mili: ${req.method} ${req.path}` });
});

app.use((err, req, res, next) => {
  logger.error('Unhandled:', err.message);
  res.status(500).json({ success: false, message: 'Server error' });
});

const startServer = async () => {
  await testConnection();
  app.listen(config.port, () => {
    logger.info(`ðŸš€ Payment Service running on port ${config.port}`);
    logger.info(`ðŸ’³ Razorpay: ${config.isDev ? 'DEV MODE (simulated)' : 'PRODUCTION'}`);
  });
};

startServer();
