/**
 * TRACKING CONTROLLER — REST endpoints for initial fetch / fallback
 */

const trackingService = require('../services/tracking.service');
const chatService     = require('../services/chat.service');
const response        = require('../utils/response');
const logger          = require('../utils/logger');

const trackingController = {
  /**
   * GET /tracking/:bookingId/latest
   */
  latest: async (req, res) => {
    try {
      const role = await chatService.participantRole(req.params.bookingId, req.user.userId);
      if (!role) return res.status(403).json({ success: false, message: 'Not a participant' });

      const location = await trackingService.latestForBooking(req.params.bookingId);
      if (!location) return response.success(res, 'No location yet', null);
      return response.success(res, 'Latest location', location);
    } catch (err) {
      logger.error('tracking.latest error:', err.message);
      return response.serverError(res);
    }
  },

  /**
   * GET /tracking/:bookingId/trail
   */
  trail: async (req, res) => {
    try {
      const role = await chatService.participantRole(req.params.bookingId, req.user.userId);
      if (!role) return res.status(403).json({ success: false, message: 'Not a participant' });

      const points = await trackingService.trailForBooking(req.params.bookingId, 50);
      return response.success(res, 'Trail', { points });
    } catch (err) {
      logger.error('tracking.trail error:', err.message);
      return response.serverError(res);
    }
  },
};

module.exports = trackingController;
