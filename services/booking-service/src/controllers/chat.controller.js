/**
 * CHAT CONTROLLER — REST endpoints (for history fetch + send fallback)
 * Live messaging happens via Socket.io (see ../sockets/chat.socket.js)
 */

const chatService = require('../services/chat.service');
const response    = require('../utils/response');
const logger      = require('../utils/logger');

const sendError = (res, code) => {
  const map = {
    INVALID_TYPE:    [400, 'Invalid message type'],
    EMPTY_MESSAGE:   [400, 'Message khali nahi ho sakta'],
    MEDIA_REQUIRED:  [400, 'Media URL chahiye'],
    NOT_PARTICIPANT: [403, 'Aap is booking ke participant nahi hai'],
    NOT_FOUND:       [404, 'Booking nahi mila'],
  };
  const [status, msg] = map[code] || [500, 'Server error'];
  return res.status(status).json({ success: false, message: msg, code });
};

const chatController = {
  /**
   * GET /chat/:bookingId/history
   */
  history: async (req, res) => {
    try {
      const { bookingId } = req.params;
      const role = await chatService.participantRole(bookingId, req.user.userId);
      if (!role) return sendError(res, 'NOT_PARTICIPANT');

      const messages = await chatService.history(bookingId, {
        limit: req.query.limit ? Number(req.query.limit) : 100,
      });

      // Auto-mark messages as read on history fetch
      await chatService.markRead(bookingId, role);

      return response.success(res, 'History', { messages, role });
    } catch (err) {
      logger.error('history error:', err.message);
      return response.serverError(res);
    }
  },

  /**
   * POST /chat/:bookingId/send  (fallback when socket unavailable)
   * Body: { messageType, content?, mediaUrl? }
   */
  send: async (req, res) => {
    try {
      const { bookingId } = req.params;
      const role = await chatService.participantRole(bookingId, req.user.userId);
      if (!role) return sendError(res, 'NOT_PARTICIPANT');

      const result = await chatService.send({
        bookingId,
        senderId:    req.user.userId,
        senderType:  role,
        messageType: req.body.messageType,
        content:     req.body.content,
        mediaUrl:    req.body.mediaUrl,
      });
      if (result.error) return sendError(res, result.error);

      // Broadcast via socket if available (set in app.locals by index.js)
      const io = req.app.locals.io;
      if (io) io.to(`booking:${bookingId}`).emit('chat:message', result.message);

      return response.success(res, 'Sent', result.message);
    } catch (err) {
      logger.error('send error:', err.message);
      return response.serverError(res);
    }
  },

  /**
   * GET /chat/unread-count
   */
  unreadCount: async (req, res) => {
    try {
      // Auto-detect role — try customer first, then worker
      const customer = await require('../config/database').findBookingsByCustomerId?.(req.user.userId);
      const role = customer && customer.length > 0 ? 'customer' : 'worker';
      const count = await chatService.unreadCount(req.user.userId, role);
      return response.success(res, 'Unread', { count, role });
    } catch (err) {
      logger.error('unreadCount error:', err.message);
      return response.serverError(res);
    }
  },
};

module.exports = chatController;
