/**
 * PUSH CONTROLLER — FCM token registry + push send + history
 */

const pushService = require('../services/push.service');
const response    = require('../utils/response');
const logger      = require('../utils/logger');

module.exports = {
  /**
   * POST /notify/fcm/register
   * Body: { userId, userType, token, platform }
   */
  register: async (req, res) => {
    try {
      const { userId, userType, token, platform } = req.body;
      if (!userId || !token) return response.error(res, 'userId aur token zaroori');

      const result = await pushService.registerToken({ userId, userType, token, platform });
      if (result.error) return response.error(res, result.error);
      return response.success(res, `Token ${result.action}`, result);
    } catch (err) {
      logger.error('fcm.register error:', err.message);
      return response.serverError(res);
    }
  },

  /**
   * POST /notify/fcm/unregister
   * Body: { token }
   */
  unregister: async (req, res) => {
    try {
      const { token } = req.body;
      if (!token) return response.error(res, 'token zaroori');
      const result = await pushService.unregisterToken(token);
      return response.success(res, 'Token removed', result);
    } catch (err) {
      logger.error('fcm.unregister error:', err.message);
      return response.serverError(res);
    }
  },

  /**
   * POST /notify/push  (INTERNAL — called by other services)
   * Body: { userId, userType, title, body, data, clickAction }
   */
  send: async (req, res) => {
    try {
      const { userId, userType, title, body, data, clickAction } = req.body;
      if (!userId || !title) return response.error(res, 'userId aur title zaroori');

      const result = await pushService.sendToUser({ userId, userType, title, body, data, clickAction });
      return response.success(res, 'Push dispatched', result);
    } catch (err) {
      logger.error('push.send error:', err.message);
      return response.serverError(res);
    }
  },

  /**
   * GET /notify/history?userId=...&limit=...
   */
  history: async (req, res) => {
    try {
      const { userId, limit } = req.query;
      if (!userId) return response.error(res, 'userId zaroori');
      const items = await pushService.listForUser(userId, { limit: limit ? Number(limit) : 50 });
      return response.success(res, 'History', { items });
    } catch (err) {
      logger.error('push.history error:', err.message);
      return response.serverError(res);
    }
  },

  /**
   * POST /notify/history/:id/read
   * Body: { userId }
   */
  markRead: async (req, res) => {
    try {
      const { userId } = req.body;
      if (!userId) return response.error(res, 'userId zaroori');
      const result = await pushService.markRead(req.params.id, userId);
      if (result.error) return response.error(res, result.error);
      return response.success(res, 'Read', result);
    } catch (err) {
      logger.error('push.markRead error:', err.message);
      return response.serverError(res);
    }
  },
};
