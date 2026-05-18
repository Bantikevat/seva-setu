/**
 * ENV CONFIG — Booking Service
 */

require('dotenv').config();

module.exports = {
  port:    parseInt(process.env.PORT) || 3004,
  nodeEnv: process.env.NODE_ENV || 'development',
  isDev:   process.env.NODE_ENV !== 'production',

  jwtSecret:    process.env.JWT_SECRET || 'seva-setu-dev-secret-change-in-prod',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',

  // Pricing config
  platformFeePercent: 10,   // 10% platform fee
  workerPayoutPercent: 90,  // 90% to worker
};
