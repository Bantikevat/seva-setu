/**
 * ENV CONFIG — Worker Service
 */

require('dotenv').config();

const config = {
  port:    parseInt(process.env.PORT) || 3003,
  nodeEnv: process.env.NODE_ENV || 'development',
  isDev:   process.env.NODE_ENV !== 'production',

  jwtSecret:    process.env.JWT_SECRET || 'seva-setu-dev-secret-change-in-prod',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
};

module.exports = config;
