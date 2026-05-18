/**
 * ENV CONFIG — Easy Mode (No External DB)
 * -------------------------------------------------
 * Easy mode mein DATABASE_URL aur REDIS_URL ki zaroorat nahi.
 * Sab kuch local file aur memory mein chalega.
 *
 * Production mein dobara enable kar denge.
 */

require('dotenv').config();

const config = {
  // Server
  port:    parseInt(process.env.PORT) || 3001,
  nodeEnv: process.env.NODE_ENV || 'development',
  isDev:   process.env.NODE_ENV !== 'production',

  // JWT — agar .env mein nahi hai toh default use karo
  jwtSecret:    process.env.JWT_SECRET || 'seva-setu-dev-secret-change-in-prod',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',

  // OTP settings
  otpExpireSeconds: 5 * 60,    // 5 minute
  otpMaxAttempts:   3,         // 3 baar galat → block
  otpBlockSeconds:  15 * 60,   // 15 min block

  // MSG91 SMS (https://msg91.com — ~₹0.20/SMS)
  // Agar yeh keys set hain to real SMS jaayega (dev mein bhi)
  // Nahi to OTP console mein print hoga
  msg91AuthKey:    process.env.MSG91_AUTH_KEY,
  msg91TemplateId: process.env.MSG91_TEMPLATE_ID,
  msg91SenderId:   process.env.MSG91_SENDER_ID || 'SEVSTU',
};

module.exports = config;
