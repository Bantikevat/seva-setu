/**
 * ADMIN SERVICE
 * Port: 3008
 */

const express = require('express');
const { applySecurity } = require('../../shared/middleware/security');
const config = require('./config/env');
const logger = require('./utils/logger');
const { testConnection } = require('./config/database');

const app = express();
app.set('trust proxy', 1);

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin',  '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Admin-Pass');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

app.use(express.json({ limit: '5mb' }));

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'admin-service', time: new Date().toISOString() });
});

app.use('/admin', require('./routes/admin.routes'));

app.use((req, res) => res.status(404).json({ success: false, message: 'Not found' }));

app.listen(config.port, async () => {
  await testConnection();
  logger.info(`ðŸ‘¨â€ðŸ’¼ Admin Service running on port ${config.port}`);
  logger.info(`ðŸ” Default password: seva-admin-2026`);
});
