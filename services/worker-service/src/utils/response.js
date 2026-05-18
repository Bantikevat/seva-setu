/**
 * RESPONSE — Standard API responses
 */

module.exports = {
  success: (res, message, data = {}, status = 200) =>
    res.status(status).json({ success: true, message, data }),

  error: (res, message, code = 'UNKNOWN_ERROR', status = 400) =>
    res.status(status).json({ success: false, message, code }),

  serverError: (res, message = 'Kuch gadbad ho gayi') =>
    res.status(500).json({ success: false, message, code: 'SERVER_ERROR' }),

  unauthorized: (res, message = 'Pehle login karo') =>
    res.status(401).json({ success: false, message, code: 'UNAUTHORIZED' }),

  notFound: (res, message = 'Nahi mila') =>
    res.status(404).json({ success: false, message, code: 'NOT_FOUND' }),

  forbidden: (res, message = 'Permission nahi hai') =>
    res.status(403).json({ success: false, message, code: 'FORBIDDEN' }),
};
