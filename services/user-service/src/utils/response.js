/**
 * RESPONSE UTILITY
 * Same format as auth-service for consistency.
 */

const response = {
  success: (res, message, data = {}, status = 200) => {
    return res.status(status).json({ success: true, message, data });
  },

  error: (res, message, code = 'UNKNOWN_ERROR', status = 400) => {
    return res.status(status).json({ success: false, message, code });
  },

  serverError: (res, message = 'Kuch gadbad ho gayi. Dobara try karo.') => {
    return res.status(500).json({ success: false, message, code: 'SERVER_ERROR' });
  },

  unauthorized: (res, message = 'Pehle login karo.') => {
    return res.status(401).json({ success: false, message, code: 'UNAUTHORIZED' });
  },

  notFound: (res, message = 'Nahi mila.') => {
    return res.status(404).json({ success: false, message, code: 'NOT_FOUND' });
  },

  forbidden: (res, message = 'Permission nahi hai.') => {
    return res.status(403).json({ success: false, message, code: 'FORBIDDEN' });
  },
};

module.exports = response;
