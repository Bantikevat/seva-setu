module.exports = {
  success: (res, message, data = {}, status = 200) =>
    res.status(status).json({ success: true, message, data }),
  error: (res, message, code = 'UNKNOWN_ERROR', status = 400) =>
    res.status(status).json({ success: false, message, code }),
  serverError: (res, message = 'Kuch gadbad ho gayi') =>
    res.status(500).json({ success: false, message, code: 'SERVER_ERROR' }),
};
