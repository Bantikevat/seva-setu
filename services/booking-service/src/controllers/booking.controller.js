/**
 * BOOKING CONTROLLER
 */

const bookingService = require('../services/booking.service');
const couponService  = require('../services/coupon.service');
const db = require('../config/database');
const response = require('../utils/response');
const logger = require('../utils/logger');

// Error message map
const errorMessages = {
  WORKER_NOT_FOUND:        ['Worker nahi mila', 'BOOK_001'],
  WORKER_INACTIVE:         ['Yeh worker active nahi hai', 'BOOK_001'],
  WORKER_UNAVAILABLE:      ['Worker abhi available nahi hai', 'BOOK_002'],
  CATEGORY_NOT_FOUND:      ['Category nahi mili', 'BOOK_004'],
  ADDRESS_NOT_FOUND:       ['Address nahi mila', 'BOOK_004'],
  ADDRESS_NOT_YOURS:       ['Yeh aapka address nahi hai', 'BOOK_006'],
  INVALID_TIME:            ['Time format galat hai', 'BOOK_003'],
  TIME_IN_PAST:            ['Future time daalo', 'BOOK_003'],
  NOT_FOUND:               ['Booking nahi mili', 'BOOK_005'],
  FORBIDDEN:               ['Yeh aapki booking nahi', 'BOOK_006'],
  INVALID_TRANSITION:      ['Yeh status change allowed nahi hai', 'BOOK_007'],
  ALREADY_CANCELLED:       ['Already cancelled hai', 'BOOK_008'],
  CANNOT_CANCEL_COMPLETED: ['Completed booking cancel nahi hoti', 'BOOK_008'],
  CANNOT_RESCHEDULE:       ['Is stage par reschedule nahi ho sakti', 'BOOK_007'],
  NOT_COMPLETED:           ['Pehle booking complete ho jaaye', 'BOOK_007'],
  ALREADY_RATED:           ['Aap pehle hi rate kar chuke hain', 'BOOK_007'],
  INVALID_RATING:          ['Rating 1-5 ke beech', 'BOOK_009'],
};

const sendError = (res, errorCode, customMessage) => {
  const [message, code] = errorMessages[errorCode] || ['Error', 'UNKNOWN'];
  return response.error(res, customMessage || message, code, 400);
};

const controller = {
  // ─── COUPONS ───

  /**
   * GET /bookings/coupons
   */
  listCoupons: async (req, res) => {
    try {
      const coupons = couponService.listActive();
      return response.success(res, 'Active coupons', { coupons, count: coupons.length });
    } catch (error) {
      logger.error('listCoupons error:', error.message);
      return response.serverError(res);
    }
  },

  /**
   * POST /bookings/apply-coupon
   * Body: { code, amount, category }
   */
  applyCoupon: async (req, res) => {
    try {
      const { code, amount, category } = req.body;
      if (!code || !amount) return response.error(res, 'code aur amount zaroori');

      const result = couponService.applyCoupon(code, amount, req.user.userId, category);

      if (result.error === 'INVALID_COUPON') return response.error(res, 'Invalid coupon code');
      if (result.error === 'MIN_ORDER_NOT_MET') return response.error(res, `Min order ₹${result.minOrder} required`);
      if (result.error === 'CATEGORY_MISMATCH') return response.error(res, `Coupon only for ${result.validFor}`);
      if (result.error === 'NOT_FIRST_TIME') return response.error(res, 'Only for first-time customers');

      return response.success(res, `Coupon applied! Saved ₹${result.discount}`, result);
    } catch (error) {
      logger.error('applyCoupon error:', error.message);
      return response.serverError(res);
    }
  },

  // ─────────────────────────────────────────
  //  CUSTOMER ENDPOINTS
  // ─────────────────────────────────────────

  /**
   * POST /bookings
   */
  create: async (req, res) => {
    try {
      const result = await bookingService.createBooking(req.user.userId, req.body);

      if (result.error) return sendError(res, result.error);

      return response.success(res, 'Booking ho gayi!', result.booking, 201);
    } catch (error) {
      logger.error('create error:', error.message);
      return response.serverError(res);
    }
  },

  /**
   * GET /bookings/my
   */
  getMyBookings: async (req, res) => {
    try {
      const { status } = req.query;
      const result = await bookingService.getCustomerBookings(req.user.userId, status);
      return response.success(res, `${result.count} bookings mili`, result);
    } catch (error) {
      logger.error('getMyBookings error:', error.message);
      return response.serverError(res);
    }
  },

  /**
   * GET /bookings/:id
   */
  getById: async (req, res) => {
    try {
      // Try as customer first
      let result = await bookingService.getBookingById(req.params.id, req.user.userId, 'customer');

      // Agar customer ki nahi hai, worker ki ho sakti hai
      if (result.error === 'FORBIDDEN') {
        const worker = db.findWorkerByPhone(req.user.phone);
        if (worker) {
          result = await bookingService.getBookingById(req.params.id, worker.id, 'worker');
        }
      }

      if (result.error) return sendError(res, result.error);
      return response.success(res, 'Booking details', result.booking);
    } catch (error) {
      logger.error('getById error:', error.message);
      return response.serverError(res);
    }
  },

  /**
   * PUT /bookings/:id/cancel
   */
  cancel: async (req, res) => {
    try {
      const { reason } = req.body;

      // Try as customer first
      let result = await bookingService.cancelBooking(req.params.id, req.user.userId, 'customer', reason);

      // If forbidden, try as worker
      if (result.error === 'FORBIDDEN') {
        const worker = db.findWorkerByPhone(req.user.phone);
        if (worker) {
          result = await bookingService.cancelBooking(req.params.id, worker.id, 'worker', reason);
        }
      }

      if (result.error) return sendError(res, result.error);
      return response.success(res, 'Booking cancel ho gayi', result.booking);
    } catch (error) {
      logger.error('cancel error:', error.message);
      return response.serverError(res);
    }
  },

  /**
   * PUT /bookings/:id/reschedule
   */
  reschedule: async (req, res) => {
    try {
      const { scheduledAt } = req.body;
      if (!scheduledAt) return response.error(res, 'scheduledAt zaroori hai', 'BOOK_003');

      const result = await bookingService.rescheduleBooking(req.params.id, req.user.userId, scheduledAt);
      if (result.error) return sendError(res, result.error);
      return response.success(res, 'Time change ho gaya', result.booking);
    } catch (error) {
      logger.error('reschedule error:', error.message);
      return response.serverError(res);
    }
  },

  /**
   * POST /bookings/:id/rate
   */
  rate: async (req, res) => {
    try {
      const { rating, review, photoUrls } = req.body;
      const result = await bookingService.rateBooking(
        req.params.id,
        req.user.userId,
        Number(rating),
        review,
        Array.isArray(photoUrls) ? photoUrls : []
      );
      if (result.error) return sendError(res, result.error);
      return response.success(res, 'Review save ho gaya. Thank you!', { booking: result.booking, review: result.review });
    } catch (error) {
      logger.error('rate error:', error.message);
      return response.serverError(res);
    }
  },

  // ─────────────────────────────────────────
  //  WORKER ENDPOINTS
  // ─────────────────────────────────────────

  /**
   * GET /bookings/worker/jobs
   */
  getWorkerJobs: async (req, res) => {
    try {
      const worker = db.findWorkerByPhone(req.user.phone);
      if (!worker) return response.notFound(res, 'Aap worker nahi hain');

      const { status } = req.query;
      const result = await bookingService.getWorkerJobs(worker.id, status);
      return response.success(res, `${result.count} jobs mili`, result);
    } catch (error) {
      logger.error('getWorkerJobs error:', error.message);
      return response.serverError(res);
    }
  },

  /**
   * Generic status changer
   */
  changeStatus: (newStatus) => async (req, res) => {
    try {
      const worker = db.findWorkerByPhone(req.user.phone);
      if (!worker) return response.notFound(res, 'Aap worker nahi hain');

      const result = await bookingService.changeStatus(
        req.params.id,
        newStatus,
        worker.id,
        'worker'
      );

      if (result.error) return sendError(res, result.error, result.message);

      const successMsg = {
        confirmed:   'Booking confirm ho gayi!',
        on_the_way:  'Customer ko bata diya — aap aa rahe hain',
        in_progress: 'Kaam shuru!',
        completed:   'Kaam complete! Payment ready.',
        rejected:    'Booking reject ho gayi',
      };

      return response.success(res, successMsg[newStatus] || 'Status updated', result.booking);
    } catch (error) {
      logger.error('changeStatus error:', error.message);
      return response.serverError(res);
    }
  },
};

module.exports = controller;
