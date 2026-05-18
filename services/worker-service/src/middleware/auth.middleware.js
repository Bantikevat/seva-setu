/**
 * AUTH MIDDLEWARE — Worker Service
 * Same JWT verification as user-service.
 */

const jwt = require('jsonwebtoken');
const config = require('../config/env');
const response = require('../utils/response');

module.exports = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return response.unauthorized(res, 'Token nahi mila');

    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return response.unauthorized(res, 'Token format galat hai');
    }

    const payload = jwt.verify(parts[1], config.jwtSecret);

    req.user = {
      userId:  payload.userId,
      phone:   payload.phone,
      role:    payload.role,
      tokenId: payload.tokenId,
    };

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return response.unauthorized(res, 'Session expire ho gaya');
    }
    return response.unauthorized(res, 'Token galat hai');
  }
};
