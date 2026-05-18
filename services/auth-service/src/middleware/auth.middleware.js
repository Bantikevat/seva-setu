/**
 * AUTH MIDDLEWARE
 * -------------------------------------------------
 * Yeh ek "security guard" hai API ke darwaze pe.
 *
 * Kaam:
 * - Har protected route pe yeh pehle chalta hai
 * - Header mein token hai? Verify karo.
 * - Valid hai → req.user set karo, aage jaane do
 * - Invalid hai → 401 error do, aage mat jaane do
 *
 * Usage in routes:
 *   router.get('/me', authMiddleware, controller.getMe);
 *   //                ↑ Pehle yeh chalega
 *
 * Token format:
 *   Authorization: Bearer eyJhbGciOiJIUzI1NiJ9...
 */

const jwtService = require('../services/jwt.service');
const response   = require('../utils/response');
const logger     = require('../utils/logger');

/**
 * Protected routes ke liye — token verify karo
 */
const authMiddleware = async (req, res, next) => {
  try {
    // Step 1: Header se token nikalo
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return response.unauthorized(res, 'Token nahi mila. Pehle login karo.');
    }

    // Format: "Bearer eyJ..."
    // Split karo — "Bearer" aur actual token
    const parts = authHeader.split(' ');

    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return response.unauthorized(res, 'Token format galat hai. "Bearer <token>" chahiye.');
    }

    const token = parts[1];

    // Step 2: Token verify karo
    const result = await jwtService.verifyToken(token);

    if (!result.valid) {
      return response.unauthorized(res, result.reason);
    }

    // Step 3: User info request mein set karo
    // Ab controller mein req.user available hoga
    req.user = {
      userId:  result.payload.userId,
      phone:   result.payload.phone,
      role:    result.payload.role,
      tokenId: result.payload.tokenId,
    };

    logger.debug(`Authenticated: ${result.payload.userId}`);

    // Step 4: Aage jaane do
    next();

  } catch (error) {
    logger.error('Auth middleware error:', error.message);
    return response.serverError(res);
  }
};

module.exports = authMiddleware;
