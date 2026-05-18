/**
 * PAYMENT CONTROLLER
 */

const paymentService = require('../services/payment.service');
const db = require('../config/database');
const response = require('../utils/response');
const logger = require('../utils/logger');

const errorMessages = {
  BOOKING_NOT_FOUND: ['Booking nahi mili', 'PAY_001'],
  PAYMENT_NOT_FOUND: ['Payment nahi mila', 'PAY_002'],
  FORBIDDEN:         ['Yeh aapka payment nahi', 'PAY_003'],
  ALREADY_PAID:      ['Payment pehle ho chuka hai', 'PAY_004'],
  SIGNATURE_INVALID: ['Payment verify nahi ho saka — galat signature', 'PAY_005'],
  NOT_CAPTURED:      ['Sirf successful payments refund ho sakte hain', 'PAY_006'],
  NOT_FOUND:         ['Nahi mila', 'PAY_007'],
};

const sendError = (res, code) => {
  const [message, errCode] = errorMessages[code] || ['Error', 'UNKNOWN'];
  return response.error(res, message, errCode);
};

const controller = {
  /**
   * POST /payments/order
   * Body: { bookingId }
   */
  createOrder: async (req, res) => {
    try {
      const { bookingId } = req.body;
      if (!bookingId) return response.error(res, 'bookingId zaroori', 'PAY_001');

      const result = await paymentService.createOrder(bookingId, req.user.userId);
      if (result.error) {
        if (result.error === 'ALREADY_PAID') {
          return response.success(res, 'Pehle se paid hai', result);
        }
        return sendError(res, result.error);
      }
      return response.success(res, 'Order ready! Payment karo', result, 201);
    } catch (error) {
      logger.error('createOrder error:', error.message);
      return response.serverError(res);
    }
  },

  /**
   * POST /payments/verify
   * Body: { razorpay_order_id, razorpay_payment_id, razorpay_signature, method? }
   */
  verifyPayment: async (req, res) => {
    try {
      const result = await paymentService.verifyPayment(req.body);
      if (result.error) return sendError(res, result.error);
      return response.success(res, '✅ Payment successful!', result.payment);
    } catch (error) {
      logger.error('verifyPayment error:', error.message);
      return response.serverError(res);
    }
  },

  /**
   * GET /payments/:id
   */
  getById: async (req, res) => {
    try {
      const result = await paymentService.getPaymentById(req.params.id, req.user.userId);
      if (result.error) return sendError(res, result.error);
      return response.success(res, 'Payment details', result.payment);
    } catch (error) {
      logger.error('getById error:', error.message);
      return response.serverError(res);
    }
  },

  /**
   * GET /payments/history
   */
  getHistory: async (req, res) => {
    try {
      const result = await paymentService.getCustomerPayments(req.user.userId);
      return response.success(res, `${result.count} payments`, result);
    } catch (error) {
      logger.error('getHistory error:', error.message);
      return response.serverError(res);
    }
  },

  /**
   * POST /payments/:id/refund
   */
  refund: async (req, res) => {
    try {
      const { reason } = req.body;
      const result = await paymentService.refundPayment(req.params.id, req.user.userId, reason);
      if (result.error) return sendError(res, result.error);
      return response.success(res, 'Refund processed', result.payment);
    } catch (error) {
      logger.error('refund error:', error.message);
      return response.serverError(res);
    }
  },

  /**
   * GET /payments/worker/earnings
   */
  getWorkerEarnings: async (req, res) => {
    try {
      const worker = db.findWorkerByPhone(req.user.phone);
      if (!worker) return response.notFound(res, 'Aap worker nahi hain');

      const result = await paymentService.getWorkerEarnings(worker.id);
      return response.success(res, 'Earnings', result);
    } catch (error) {
      logger.error('getWorkerEarnings error:', error.message);
      return response.serverError(res);
    }
  },
};

module.exports = controller;
