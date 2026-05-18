/**
 * AUTH MIDDLEWARE — User Service
 * -------------------------------------------------
 * JWT token verify karne ka logic.
 *
 * NOTE: Yeh middleware simple version hai.
 * Auth service ke saath SAME secret use karta hai.
 * Token same secret se sign hua tha, isliye yahan verify ho jayega.
 *
 * Production mein:
 * - Sab services SAME secret use karenge
 * - OR Auth service ek /verify endpoint dega
 *   jise sab services call karenge
 */

const jwt = require('jsonwebtoken');
const config   = require('../config/env');
const response = require('../utils/response');
const logger   = require('../utils/logger');

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return response.unauthorized(res, 'Token nahi mila. Pehle login karo.');
    }

    const parts = authHeader.split(' ');

    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return response.unauthorized(res, 'Token format galat hai.');
    }

    const token = parts[1];

    try {
      // Same secret se verify — auth service ne ise sign kiya tha
      const payload = jwt.verify(token, config.jwtSecret);

      req.user = {
        userId:  payload.userId,
        phone:   payload.phone,
        role:    payload.role,
        tokenId: payload.tokenId,
      };

      logger.debug(`Authenticated: ${payload.userId}`);
      next();

    } catch (jwtError) {
      if (jwtError.name === 'TokenExpiredError') {
        return response.unauthorized(res, 'Session expire ho gaya. Dobara login karo.');
      }
      return response.unauthorized(res, 'Token galat hai.');
    }

  } catch (error) {
    logger.error('Auth middleware error:', error.message);
    return response.serverError(res);
  }
};

module.exports = authMiddleware;
