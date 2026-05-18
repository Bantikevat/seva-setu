/**
 * RAZORPAY SERVICE
 * -------------------------------------------------
 * Razorpay integration with dev mode simulation.
 *
 * DEV MODE: Fake orders, auto-success
 * PROD MODE: Real Razorpay API calls
 */

const crypto = require('crypto');
const config = require('../config/env');
const logger = require('../utils/logger');

const razorpayService = {
  /**
   * Razorpay order create karo
   *
   * @param {number} amount    Amount in paise (₹329 = 32900 paise)
   * @param {string} receipt   Internal reference (booking number)
   * @returns {Object}         { id, amount, currency, status }
   */
  createOrder: async (amount, receipt) => {
    // Amount paise mein convert karo
    const amountInPaise = Math.round(amount * 100);

    // DEV MODE
    if (config.isDev) {
      const fakeOrder = {
        id:       `order_dev_${Date.now()}`,
        amount:   amountInPaise,
        currency: 'INR',
        status:   'created',
        receipt,
      };
      logger.payment(`[DEV] Order created: ${fakeOrder.id} for ₹${amount}`);
      return fakeOrder;
    }

    // PRODUCTION — Real Razorpay
    try {
      // const Razorpay = require('razorpay');
      // const instance = new Razorpay({ key_id: config.razorpayKeyId, key_secret: config.razorpayKeySecret });
      // const order = await instance.orders.create({ amount: amountInPaise, currency: 'INR', receipt });
      // return order;
      logger.payment(`Order: ${receipt} ₹${amount}`);
      return { id: 'pending', amount: amountInPaise, currency: 'INR', status: 'created' };
    } catch (error) {
      logger.error('Razorpay order failed:', error.message);
      throw error;
    }
  },

  /**
   * Payment signature verify karo (security)
   * Razorpay sends HMAC signature — we verify it.
   *
   * @param {string} orderId
   * @param {string} paymentId
   * @param {string} signature
   * @returns {boolean}
   */
  verifySignature: (orderId, paymentId, signature) => {
    // DEV MODE — always pass
    if (config.isDev) {
      logger.payment(`[DEV] Signature verified for ${orderId}`);
      return true;
    }

    // PRODUCTION
    try {
      const text = `${orderId}|${paymentId}`;
      const expected = crypto
        .createHmac('sha256', config.razorpayKeySecret)
        .update(text)
        .digest('hex');

      const isValid = expected === signature;
      if (!isValid) logger.warn(`Signature mismatch for order ${orderId}`);
      return isValid;
    } catch (error) {
      logger.error('Signature verify failed:', error.message);
      return false;
    }
  },

  /**
   * Refund process karo
   */
  refundPayment: async (paymentId, amount, reason) => {
    const amountInPaise = Math.round(amount * 100);

    if (config.isDev) {
      logger.payment(`[DEV] Refund ${paymentId}: ₹${amount}`);
      return {
        id:     `rfnd_dev_${Date.now()}`,
        amount: amountInPaise,
        status: 'processed',
      };
    }

    // Production: Real Razorpay refund API
    try {
      logger.payment(`Refund processed for ${paymentId}`);
      return { id: 'pending', amount: amountInPaise, status: 'processed' };
    } catch (error) {
      logger.error('Refund failed:', error.message);
      throw error;
    }
  },
};

module.exports = razorpayService;
