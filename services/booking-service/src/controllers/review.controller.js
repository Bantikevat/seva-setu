/**
 * REVIEW CONTROLLER
 */

const reviewService = require('../services/review.service');
const response      = require('../utils/response');
const logger        = require('../utils/logger');

const sendError = (res, code) => {
  const map = {
    INVALID_RATING:    [400, 'Rating 1 se 5 ke beech hona chahiye'],
    INVALID_REPLY:     [400, 'Reply bahut chhota hai'],
    ALREADY_REVIEWED:  [400, 'Iska review pehle se hai'],
    ALREADY_REPLIED:   [400, 'Aap is review par pehle reply kar chuke hai'],
    NOT_FOUND:         [404, 'Review nahi mila'],
    FORBIDDEN:         [403, 'Sirf is worker ka review reply ho sakta hai'],
  };
  const [status, msg] = map[code] || [500, 'Server error'];
  return res.status(status).json({ success: false, message: msg, code });
};

const reviewController = {
  /**
   * GET /reviews/worker/:workerId
   * Query: ?rating=5&withPhotos=true&limit=20&offset=0
   */
  listForWorker: async (req, res) => {
    try {
      const { rating, withPhotos, limit, offset } = req.query;
      const reviews = await reviewService.listForWorker({
        workerId:   req.params.workerId,
        rating:     rating ? Number(rating) : undefined,
        withPhotos: withPhotos === 'true',
        limit:      limit ? Number(limit) : 20,
        offset:     offset ? Number(offset) : 0,
      });
      const summary = await reviewService.getWorkerSummary(req.params.workerId);
      return response.success(res, 'Reviews', { reviews, summary });
    } catch (err) {
      logger.error('listForWorker error:', err.message);
      return response.serverError(res);
    }
  },

  /**
   * GET /reviews/worker/:workerId/summary
   */
  workerSummary: async (req, res) => {
    try {
      const summary = await reviewService.getWorkerSummary(req.params.workerId);
      return response.success(res, 'Summary', summary);
    } catch (err) {
      logger.error('workerSummary error:', err.message);
      return response.serverError(res);
    }
  },

  /**
   * POST /reviews/:id/reply  (worker only)
   * Body: { reply }
   */
  workerReply: async (req, res) => {
    try {
      const { reply } = req.body;
      const result = await reviewService.workerReply({
        reviewId: req.params.id,
        workerId: req.user.userId,   // assume worker is authenticated
        reply,
      });
      if (result.error) return sendError(res, result.error);
      return response.success(res, 'Reply posted', result.review);
    } catch (err) {
      logger.error('workerReply error:', err.message);
      return response.serverError(res);
    }
  },

  /**
   * POST /reviews/:id/helpful
   */
  markHelpful: async (req, res) => {
    try {
      const result = await reviewService.markHelpful(req.params.id);
      if (result.error) return sendError(res, result.error);
      return response.success(res, 'Marked helpful', result);
    } catch (err) {
      logger.error('markHelpful error:', err.message);
      return response.serverError(res);
    }
  },
};

module.exports = reviewController;
