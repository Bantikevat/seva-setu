/**
 * PAYMENT SERVICE — Business Logic
 * -------------------------------------------------
 * Order create → Verify → Update booking → Trigger payout
 */

const db = require('../config/database');
const razorpay = require('./razorpay.service');
const { v4: uuidv4 } = require('uuid');
const logger = require('../utils/logger');

const PAYMENT_STATUS = {
  PENDING:    'pending',
  PROCESSING: 'processing',
  CAPTURED:   'captured',
  FAILED:     'failed',
  REFUNDED:   'refunded',
};

const formatPayment = (p) => ({
  id:                 p.id,
  bookingId:          p.booking_id,
  bookingNumber:      p.booking_number,
  customerId:         p.customer_id,
  workerId:           p.worker_id,
  razorpayOrderId:    p.razorpay_order_id,
  razorpayPaymentId:  p.razorpay_payment_id,
  amount:             p.amount,
  baseAmount:         p.base_amount,
  platformFee:        p.platform_fee,
  workerPayout:       p.worker_payout,
  currency:           p.currency,
  status:             p.status,
  paymentMethod:      p.payment_method,
  refundAmount:       p.refund_amount,
  refundReason:       p.refund_reason,
  refundedAt:         p.refunded_at,
  createdAt:          p.created_at,
  capturedAt:         p.captured_at,
});

const paymentService = {
  /**
   * CREATE PAYMENT ORDER
   *
   * Step 1: Booking validate karo
   * Step 2: Razorpay pe order create karo
   * Step 3: Database mein payment record banao
   * Step 4: Razorpay order details return karo
   */
  createOrder: async (bookingId, customerId) => {
    // 1. Booking exists?
    const booking = db.findBookingById(bookingId);
    if (!booking) return { error: 'BOOKING_NOT_FOUND' };

    // 2. Customer ka hi hai?
    if (booking.customer_id !== customerId) return { error: 'FORBIDDEN' };

    // 3. Already paid?
    const existingPayment = db.findPaymentByBookingId(bookingId);
    if (existingPayment && existingPayment.status === PAYMENT_STATUS.CAPTURED) {
      return { error: 'ALREADY_PAID', payment: formatPayment(existingPayment) };
    }

    // 4. Razorpay order create karo
    const order = await razorpay.createOrder(booking.total_amount, booking.booking_number);

    // 5. DB mein payment record banao
    const payment = {
      id:                  uuidv4(),
      booking_id:          booking.id,
      booking_number:      booking.booking_number,
      customer_id:         booking.customer_id,
      worker_id:           booking.worker_id,

      razorpay_order_id:   order.id,
      razorpay_payment_id: null,
      razorpay_signature:  null,

      amount:              booking.total_amount,
      base_amount:         booking.base_price,
      platform_fee:        booking.platform_fee,
      worker_payout:       booking.worker_payout,
      currency:            'INR',

      status:              PAYMENT_STATUS.PENDING,
      payment_method:      null,

      refund_amount:       null,
      refund_reason:       null,
      refunded_at:         null,

      created_at:          new Date().toISOString(),
      captured_at:         null,
    };

    db.createPayment(payment);
    logger.payment(`Order created: ${order.id} for booking ${booking.booking_number} (₹${booking.total_amount})`);

    return {
      payment: formatPayment(payment),
      razorpayOrder: {
        id:       order.id,
        amount:   order.amount,
        currency: order.currency,
        keyId:    require('../config/env').razorpayKeyId,
      },
    };
  },

  /**
   * VERIFY PAYMENT
   *
   * Razorpay webhook/callback se aata hai:
   * - razorpay_order_id
   * - razorpay_payment_id
   * - razorpay_signature
   */
  verifyPayment: async (data) => {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = data;

    // 1. Payment record find karo
    const payment = db.findPaymentByOrderId(razorpay_order_id);
    if (!payment) return { error: 'PAYMENT_NOT_FOUND' };

    // 2. Already verified?
    if (payment.status === PAYMENT_STATUS.CAPTURED) {
      return { payment: formatPayment(payment), alreadyVerified: true };
    }

    // 3. Signature verify
    const isValid = razorpay.verifySignature(
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    );

    if (!isValid) {
      db.updatePayment(payment.id, { status: PAYMENT_STATUS.FAILED });
      return { error: 'SIGNATURE_INVALID' };
    }

    // 4. Update payment as captured
    const updated = db.updatePayment(payment.id, {
      razorpay_payment_id,
      razorpay_signature,
      status:         PAYMENT_STATUS.CAPTURED,
      payment_method: data.method || 'upi',
      captured_at:    new Date().toISOString(),
    });

    // 5. Update booking payment status
    db.updateBooking(payment.booking_id, {
      payment_status: 'paid',
    });

    logger.payment(`✅ Payment captured: ₹${payment.amount} for booking ${payment.booking_number}`);

    return { payment: formatPayment(updated) };
  },

  /**
   * GET PAYMENT BY ID
   */
  getPaymentById: async (paymentId, requesterId) => {
    const payment = db.findPaymentById(paymentId);
    if (!payment) return { error: 'NOT_FOUND' };
    if (payment.customer_id !== requesterId) return { error: 'FORBIDDEN' };
    return { payment: formatPayment(payment) };
  },

  /**
   * CUSTOMER'S PAYMENT HISTORY
   */
  getCustomerPayments: async (customerId) => {
    const payments = db.findPaymentsByCustomer(customerId);
    return {
      payments: payments.map(formatPayment),
      count:    payments.length,
      totalSpent: payments
        .filter((p) => p.status === PAYMENT_STATUS.CAPTURED)
        .reduce((sum, p) => sum + p.amount, 0),
    };
  },

  /**
   * WORKER'S EARNINGS
   */
  getWorkerEarnings: async (workerId) => {
    const payments = db.findPaymentsByWorker(workerId);

    const captured = payments.filter((p) => p.status === PAYMENT_STATUS.CAPTURED);
    const totalEarned = captured.reduce((sum, p) => sum + p.worker_payout, 0);

    return {
      totalEarned,
      totalJobs:  captured.length,
      pendingPayout: totalEarned, // Simplified — actual would subtract paid-out
      paidOut:    0,
      recentPayments: captured.slice(0, 10).map(formatPayment),
    };
  },

  /**
   * REFUND PAYMENT
   */
  refundPayment: async (paymentId, customerId, reason) => {
    const payment = db.findPaymentById(paymentId);
    if (!payment) return { error: 'NOT_FOUND' };
    if (payment.customer_id !== customerId) return { error: 'FORBIDDEN' };

    if (payment.status !== PAYMENT_STATUS.CAPTURED) {
      return { error: 'NOT_CAPTURED' };
    }

    // Refund via Razorpay
    const refund = await razorpay.refundPayment(
      payment.razorpay_payment_id,
      payment.amount,
      reason
    );

    // Update payment
    const updated = db.updatePayment(paymentId, {
      status:        PAYMENT_STATUS.REFUNDED,
      refund_amount: payment.amount,
      refund_reason: reason,
      refunded_at:   new Date().toISOString(),
    });

    // Update booking
    db.updateBooking(payment.booking_id, { payment_status: 'refunded' });

    logger.payment(`Refunded: ₹${payment.amount} for ${payment.booking_number}`);
    return { payment: formatPayment(updated) };
  },
};

module.exports = { ...paymentService, PAYMENT_STATUS };
