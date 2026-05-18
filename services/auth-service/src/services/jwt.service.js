/**
 * JWT SERVICE
 * -------------------------------------------------
 * JSON Web Token — yeh ek "digital pass" hai.
 *
 * Kaise kaam karta hai:
 * 1. Login hone ke baad hum ek token generate karte hain
 * 2. User yeh token har request mein bhejta hai
 * 3. Hum token verify karte hain — sahi hai toh request aage jaati hai
 *
 * Token structure (3 parts, dot se alag):
 *   eyJhbGciOiJIUzI1NiJ9  ← Header (algorithm)
 *   .eyJ1c2VySWQiOiIxMjMifQ ← Payload (data)
 *   .SflKxwRJSMeKKF2QT4fwpMeJf ← Signature (verify ke liye)
 *
 * Payload mein kya hota hai:
 *   { userId, phone, role, tokenId }
 */

const jwt    = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const { redisSet, redisGet, redisDel } = require('../config/redis');
const config = require('../config/env');
const logger = require('../utils/logger');

const jwtService = {
  /**
   * Naya JWT token banao
   *
   * @param {Object} payload - Token mein kya store karein
   *   @param {string} payload.userId  - User ka unique ID
   *   @param {string} payload.phone   - User ka phone
   *   @param {string} payload.role    - 'user' ya 'worker' ya 'admin'
   *
   * @returns {string} - JWT token string
   *
   * Example:
   *   const token = await jwtService.generateToken({
   *     userId: 'abc-123',
   *     phone:  '9876543210',
   *     role:   'user'
   *   });
   */
  generateToken: async ({ userId, phone, role = 'user' }) => {
    // Har token ka ek unique ID — logout ke liye zaroori
    const tokenId = uuidv4();

    // Token mein yeh data store hoga
    const payload = { userId, phone, role, tokenId };

    // Token sign karo — secret key se
    const token = jwt.sign(payload, config.jwtSecret, {
      expiresIn: config.jwtExpiresIn, // Default: 7 days
    });

    // Token ID Redis mein save karo — logout pe delete karenge
    // Key: "jwt_token:{userId}:{tokenId}"
    const redisKey = `jwt_token:${userId}:${tokenId}`;
    const sevenDaysInSeconds = 7 * 24 * 60 * 60;
    await redisSet(redisKey, '1', sevenDaysInSeconds);

    logger.debug(`Token generated for userId: ${userId}`);
    return token;
  },

  /**
   * Token verify karo
   *
   * @param {string} token - JWT token
   * @returns {{ valid: boolean, payload: Object, reason: string }}
   *
   * Example:
   *   const result = await jwtService.verifyToken('eyJ...');
   *   if (result.valid) {
   *     console.log(result.payload.userId);
   *   }
   */
  verifyToken: async (token) => {
    try {
      // Step 1: JWT signature verify karo
      const payload = jwt.verify(token, config.jwtSecret);

      // Step 2: Redis mein check karo — logout toh nahi kiya?
      const redisKey  = `jwt_token:${payload.userId}:${payload.tokenId}`;
      const isValid   = await redisGet(redisKey);

      if (!isValid) {
        return {
          valid:  false,
          reason: 'Token invalid hai. Dobara login karo.',
        };
      }

      return { valid: true, payload };

    } catch (error) {
      // JWT library khud error throw karta hai
      if (error.name === 'TokenExpiredError') {
        return { valid: false, reason: 'Session expire ho gaya. Dobara login karo.' };
      }
      if (error.name === 'JsonWebTokenError') {
        return { valid: false, reason: 'Token galat hai.' };
      }

      logger.error('Token verification error:', error.message);
      return { valid: false, reason: 'Token verify nahi ho saka.' };
    }
  },

  /**
   * Token invalidate karo — logout pe use karo
   *
   * @param {string} userId
   * @param {string} tokenId
   */
  invalidateToken: async (userId, tokenId) => {
    const redisKey = `jwt_token:${userId}:${tokenId}`;
    await redisDel(redisKey);
    logger.debug(`Token invalidated for userId: ${userId}`);
  },
};

module.exports = jwtService;
