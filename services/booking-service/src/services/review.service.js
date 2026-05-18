/**
 * REVIEW SERVICE
 * -------------------------------------------------
 * Photo reviews + worker reply + helpful votes
 *
 * Source of truth: shared `reviews` table
 * Booking ke `rating` / `review` columns backward-compat ke liye rakhe hai
 *
 * Worker rating average automatically update hota hai jab naya review create hota hai
 */

const sharedDb = require('../../../shared/db');
const logger   = require('../utils/logger');

const formatReview = (r) => ({
  id:            r.id,
  bookingId:     r.booking_id,
  customerId:    r.customer_id,
  workerId:      r.worker_id,
  rating:        r.rating,
  comment:       r.comment,
  photoUrls:     Array.isArray(r.photo_urls) ? r.photo_urls : (r.photo_urls ? JSON.parse(r.photo_urls) : []),
  workerReply:   r.worker_reply,
  workerReplyAt: r.worker_reply_at,
  isVerified:    r.is_verified,
  helpfulCount:  r.helpful_count || 0,
  createdAt:     r.created_at,
  // enrich with denormalized data (joins done by caller)
  customerName:  r.customer_name || null,
  customerPhoto: r.customer_photo || null,
});

const reviewService = {
  /**
   * CREATE a review for a completed booking
   *
   * @param {object} args
   * @param {string} args.bookingId
   * @param {string} args.customerId
   * @param {string} args.workerId
   * @param {number} args.rating       1-5
   * @param {string} args.comment      optional text
   * @param {string[]} args.photoUrls  optional array of Cloudinary URLs
   */
  create: async ({ bookingId, customerId, workerId, rating, comment, photoUrls = [] }) => {
    if (!rating || rating < 1 || rating > 5) {
      return { error: 'INVALID_RATING' };
    }

    // Already reviewed?
    const existing = await sharedDb.findOne('reviews', { booking_id: bookingId });
    if (existing) return { error: 'ALREADY_REVIEWED' };

    // Validate photo URLs (max 5, must be http(s))
    const cleanUrls = (photoUrls || [])
      .filter((u) => typeof u === 'string' && /^https?:\/\//.test(u))
      .slice(0, 5);

    const review = await sharedDb.insert('reviews', {
      booking_id:    bookingId,
      customer_id:   customerId,
      worker_id:     workerId,
      rating,
      comment:       comment || null,
      photo_urls:    sharedDb.USE_PG ? JSON.stringify(cleanUrls) : cleanUrls,
      is_verified:   true,    // came from real booking → verified
      helpful_count: 0,
    });

    // Refresh worker's aggregate rating
    await reviewService._refreshWorkerRating(workerId);

    logger.info(`Review created for booking ${bookingId} (${rating}⭐, ${cleanUrls.length} photos)`);
    return { review: formatReview(review) };
  },

  /**
   * LIST reviews for a worker (with filters)
   * @param {object} opts { workerId, rating?, withPhotos?, limit?, offset? }
   */
  listForWorker: async ({ workerId, rating, withPhotos, limit = 20, offset = 0 }) => {
    if (sharedDb.USE_PG) {
      let sql = `
        SELECT r.*, u.name AS customer_name, u.profile_photo AS customer_photo
        FROM reviews r
        LEFT JOIN users u ON u.id = r.customer_id
        WHERE r.worker_id = $1
      `;
      const params = [workerId];
      let p = 2;
      if (rating) { sql += ` AND r.rating = $${p++}`; params.push(rating); }
      if (withPhotos) { sql += ` AND jsonb_array_length(r.photo_urls) > 0`; }
      sql += ` ORDER BY r.created_at DESC LIMIT $${p++} OFFSET $${p++}`;
      params.push(limit, offset);
      const rows = await sharedDb.raw(sql, params);
      return rows.map(formatReview);
    }

    // JSON mode — manual join
    let rows = await sharedDb.find('reviews', { worker_id: workerId });
    if (rating)     rows = rows.filter((r) => r.rating === Number(rating));
    if (withPhotos) rows = rows.filter((r) => (r.photo_urls || []).length > 0);
    rows.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    const users = await sharedDb.find('users');
    const userMap = new Map(users.map((u) => [u.id, u]));

    return rows.slice(offset, offset + limit).map((r) => {
      const u = userMap.get(r.customer_id);
      return formatReview({
        ...r,
        customer_name:  u?.name || 'Customer',
        customer_photo: u?.profile_photo || null,
      });
    });
  },

  /**
   * Get summary for a worker — average + count per star
   */
  getWorkerSummary: async (workerId) => {
    if (sharedDb.USE_PG) {
      const rows = await sharedDb.raw(
        `SELECT
           rating,
           COUNT(*)::int AS count
         FROM reviews
         WHERE worker_id = $1
         GROUP BY rating
         ORDER BY rating DESC`,
        [workerId]
      );
      const counts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
      let total = 0, sum = 0;
      for (const r of rows) { counts[r.rating] = r.count; total += r.count; sum += r.rating * r.count; }
      return { average: total ? +(sum / total).toFixed(2) : 0, total, counts };
    }
    const rows = await sharedDb.find('reviews', { worker_id: workerId });
    const counts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    let sum = 0;
    for (const r of rows) { counts[r.rating] = (counts[r.rating] || 0) + 1; sum += r.rating; }
    return { average: rows.length ? +(sum / rows.length).toFixed(2) : 0, total: rows.length, counts };
  },

  /**
   * Worker replies to a review (once only)
   */
  workerReply: async ({ reviewId, workerId, reply }) => {
    if (!reply || reply.trim().length < 2) return { error: 'INVALID_REPLY' };

    const review = await sharedDb.findOne('reviews', { id: reviewId });
    if (!review) return { error: 'NOT_FOUND' };
    if (review.worker_id !== workerId) return { error: 'FORBIDDEN' };
    if (review.worker_reply) return { error: 'ALREADY_REPLIED' };

    await sharedDb.update('reviews', { id: reviewId }, {
      worker_reply:    reply.trim(),
      worker_reply_at: new Date().toISOString(),
    });

    const updated = await sharedDb.findOne('reviews', { id: reviewId });
    return { review: formatReview(updated) };
  },

  /**
   * Customer/visitor marks a review as helpful
   */
  markHelpful: async (reviewId) => {
    const r = await sharedDb.findOne('reviews', { id: reviewId });
    if (!r) return { error: 'NOT_FOUND' };
    await sharedDb.update('reviews', { id: reviewId }, {
      helpful_count: (r.helpful_count || 0) + 1,
    });
    return { success: true };
  },

  /**
   * Recompute worker.rating_average from all reviews
   */
  _refreshWorkerRating: async (workerId) => {
    const summary = await reviewService.getWorkerSummary(workerId);
    await sharedDb.update('workers', { id: workerId }, {
      rating_average: summary.average,
    });
  },
};

module.exports = reviewService;
