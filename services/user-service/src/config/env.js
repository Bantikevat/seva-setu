/**
 * ENV CONFIG — User Service
 * -------------------------------------------------
 * User service port 3002 pe chalega.
 * Auth aur User dono same JWT secret use karte hain.
 */

require('dotenv').config();

const config = {
  // Server
  port:    parseInt(process.env.PORT) || 3002,
  nodeEnv: process.env.NODE_ENV || 'development',
  isDev:   process.env.NODE_ENV !== 'production',

  // JWT — SAME as auth-service
  jwtSecret:    process.env.JWT_SECRET || 'seva-setu-dev-secret-change-in-prod',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
};

module.exports = config;
