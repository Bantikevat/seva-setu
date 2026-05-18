/**
 * BOOKING SERVICE â€” Main Entry
 * Port: 3004
 */

const express = require('express');
const { applySecurity } = require('../../shared/middleware/security');
const http    = require('http');
const { Server: SocketIOServer } = require('socket.io');
const config  = require('./config/env');
const logger  = require('./utils/logger');
const { testConnection } = require('./config/database');
const attachChat = require('./sockets/chat.socket');

const app    = express();
app.set('trust proxy', 1);
const server = http.createServer(app);
const io     = new SocketIOServer(server, {
  cors: { origin: '*', methods: ['GET', 'POST'] },
});
app.locals.io = io;
attachChat(io);

applySecurity(app);  // helmet + CORS + rate limit

app.use(express.json());

// Request logger
app.use((req, res, next) => {
  if (config.isDev) logger.debug(`${req.method} ${req.path}`);
  next();
});

// Health
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'booking-service', time: new Date().toISOString() });
});

// Routes
app.use('/bookings', require('./routes/booking.routes'));
app.use('/reviews',  require('./routes/review.routes'));
app.use('/chat',     require('./routes/chat.routes'));
app.use('/tracking', require('./routes/tracking.routes'));

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
    server.listen(config.port, () => {
      logger.info(`ðŸš€ Booking Service running on port ${config.port}`);
      logger.info(`ðŸŒ Health: http://localhost:${config.port}/health`);
      logger.info(`ðŸ’¬ Chat WebSocket: ws://localhost:${config.port}`);
      logger.info(`ðŸ’¼ Platform fee: ${config.platformFeePercent}% | Worker payout: ${config.workerPayoutPercent}%`);
    });
  } catch (error) {
    logger.error('Start failed:', error.message);
    process.exit(1);
  }
};

startServer();
