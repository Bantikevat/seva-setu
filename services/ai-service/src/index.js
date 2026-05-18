/**
 * AI SERVICE â€” Main Entry
 * Port: 3007
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
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'ai-service', time: new Date().toISOString() });
});

app.use('/ai', require('./routes/ai.routes'));

app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route nahi mili: ${req.method} ${req.path}` });
});

app.listen(config.port, async () => {
  await testConnection();
  logger.info(`ðŸ¤– AI Service running on port ${config.port}`);
  logger.info(`ðŸ§  Mode: ${config.isDev ? 'DEV (heuristics)' : 'PROD (Claude API)'}`);
});
