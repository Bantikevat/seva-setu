/**
 * NOTIFICATION SERVICE â€” Main Entry
 * Port: 3005
 */

require('dotenv').config();
const express = require('express');
const { applySecurity } = require('../../shared/middleware/security');
const config = require('./config/env');
const logger = require('./utils/logger');

const app = express();
app.set('trust proxy', 1);

applySecurity(app);  // helmet + CORS + rate limit

app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'notification-service', time: new Date().toISOString() });
});

app.use('/notify', require('./routes/notification.routes'));

app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route nahi mili: ${req.method} ${req.path}` });
});

app.use((err, req, res, next) => {
  logger.error('Unhandled:', err.message);
  res.status(500).json({ success: false, message: 'Server error' });
});

const fcm   = require('./services/fcm.service');
const email = require('./services/email.service');

app.listen(config.port, () => {
  logger.info(`ðŸš€ Notification Service running on port ${config.port}`);
  logger.info(`ðŸ“± SMS:      Dev mode (console)`);
  logger.info(`ðŸ’¬ WhatsApp: Dev mode (console)`);
  logger.info(`ðŸ”” FCM:      ${fcm.isConfigured()   ? 'Configured âœ“' : 'Dev mode (console)'}`);
  logger.info(`ðŸ“§ Email:    ${email.isConfigured() ? 'Gmail SMTP âœ“' : 'Dev mode (console)'}`);
});
