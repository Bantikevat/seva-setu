/**
 * BOOKING VALIDATOR
 */

const response = require('../utils/response');

module.exports = {
  validateCreate: (req, res, next) => {
    const { workerId, categoryId, addressId, scheduledAt } = req.body;

    if (!workerId)     return response.error(res, 'workerId zaroori hai', 'BOOK_010');
    if (!categoryId)   return response.error(res, 'categoryId zaroori hai', 'BOOK_011');
    if (!addressId)    return response.error(res, 'addressId zaroori hai', 'BOOK_012');
    if (!scheduledAt)  return response.error(res, 'scheduledAt zaroori hai', 'BOOK_013');

    next();
  },

  validateRating: (req, res, next) => {
    const { rating } = req.body;

    if (rating === undefined || rating === null) {
      return response.error(res, 'Rating zaroori hai', 'BOOK_009');
    }

    const num = Number(rating);
    if (isNaN(num) || num < 1 || num > 5) {
      return response.error(res, 'Rating 1-5 ke beech honi chahiye', 'BOOK_009');
    }

    next();
  },
};
