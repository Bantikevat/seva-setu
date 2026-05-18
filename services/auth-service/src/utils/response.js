/**
 * RESPONSE UTILITY
 * -------------------------------------------------
 * Poori app mein har API ka response ek jaisa hoga.
 * Yeh consistency bahut zaroori hai — frontend wala
 * exactly jaanta hai kya aayega.
 *
 * SUCCESS format:
 * {
 *   "success": true,
 *   "message": "OTP sent successfully",
 *   "data": { ... }
 * }
 *
 * ERROR format:
 * {
 *   "success": false,
 *   "message": "Invalid phone number",
 *   "code": "AUTH_001"
 * }
 */

const response = {
  /**
   * Success response bhejo
   *
   * @param {Object} res      - Express response object
   * @param {string} message  - Success message (Hindi ya English)
   * @param {Object} data     - Response data (optional)
   * @param {number} status   - HTTP status code (default: 200)
   *
   * Example:
   *   response.success(res, 'OTP sent', { phone: '98765xxxxx' });
   */
  success: (res, message, data = {}, status = 200) => {
    return res.status(status).json({
      success: true,
      message,
      data,
    });
  },

  /**
   * Error response bhejo
   *
   * @param {Object} res      - Express response object
   * @param {string} message  - Error message
   * @param {string} code     - Error code (e.g., 'AUTH_001')
   * @param {number} status   - HTTP status code (default: 400)
   *
   * Example:
   *   response.error(res, 'Phone number invalid', 'AUTH_001', 400);
   */
  error: (res, message, code = 'UNKNOWN_ERROR', status = 400) => {
    return res.status(status).json({
      success: false,
      message,
      code,
    });
  },

  /**
   * Server error — jab kuch unexpected ho jaaye
   * User ko details nahi dikhate — security reason
   *
   * Example:
   *   response.serverError(res);
   */
  serverError: (res, message = 'Kuch gadbad ho gayi. Dobara try karo.') => {
    return res.status(500).json({
      success: false,
      message,
      code: 'SERVER_ERROR',
    });
  },

  /**
   * 401 Unauthorized — token nahi hai ya galat hai
   *
   * Example:
   *   response.unauthorized(res);
   */
  unauthorized: (res, message = 'Pehle login karo.') => {
    return res.status(401).json({
      success: false,
      message,
      code: 'UNAUTHORIZED',
    });
  },

  /**
   * 404 Not Found
   *
   * Example:
   *   response.notFound(res, 'User nahi mila');
   */
  notFound: (res, message = 'Nahi mila.') => {
    return res.status(404).json({
      success: false,
      message,
      code: 'NOT_FOUND',
    });
  },
};

module.exports = response;
