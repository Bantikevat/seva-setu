/**
 * BOOKING SERVICE — Core Business Logic
 * -------------------------------------------------
 * Yeh poori app ka asli dimaag hai.
 *
 * Functions:
 * - createBooking() : Customer book karta hai
 * - getBookings()   : List nikalo (customer/worker view)
 * - changeStatus()  : Status transitions (state machine)
 * - cancelBooking() : Cancel logic
 * - rateBooking()   : Rating + review
 */

const db = require('../config/database');
const config = require('../config/env');
const { v4: uuidv4 } = require('uuid');
const logger = require('../utils/logger');
const { notifyBookingEvent, sendPush } = require('./notify.client');

// ─────────────────────────────────────────
//  STATUS STATE MACHINE
// ─────────────────────────────────────────
const STATUS = {
  PENDING:      'pending',
  CONFIRMED:    'confirmed',
  ON_THE_WAY:   'on_the_way',
  IN_PROGRESS:  'in_progress',
  COMPLETED:    'completed',
  CANCELLED:    'cancelled',
  REJECTED:     'rejected',
};

// Allowed transitions
const TRANSITIONS = {
  pending:     ['confirmed', 'rejected', 'cancelled'],
  confirmed:   ['on_the_way', 'cancelled'],
  on_the_way:  ['in_progress', 'cancelled'],
  in_progress: ['completed'],
  completed:   [],   // Final
  cancelled:   [],   // Final
  rejected:    [],   // Final
};

const canTransition = (from, to) => TRANSITIONS[from]?.includes(to);

// ─────────────────────────────────────────
//  BOOKING NUMBER GENERATOR
// ─────────────────────────────────────────
const generateBookingNumber = () => {
  const year = new Date().getFullYear();
  const count = db.countBookings() + 1;
  const padded = String(count).padStart(6, '0');
  return `SEV-${year}-${padded}`;
};

// ─────────────────────────────────────────
//  PRICING CALCULATOR
// ─────────────────────────────────────────
const calculatePricing = (basePrice) => {
  const platformFee  = Math.round(basePrice * config.platformFeePercent / 100);
  const workerPayout = Math.round(basePrice * config.workerPayoutPercent / 100);
  const totalAmount  = basePrice + platformFee;

  return { basePrice, platformFee, workerPayout, totalAmount };
};

// ─────────────────────────────────────────
//  FORMAT BOOKING FOR RESPONSE
// ─────────────────────────────────────────
const formatBooking = (booking) => ({
  id:             booking.id,
  bookingNumber:  booking.booking_number,

  customerId:     booking.customer_id,
  workerId:       booking.worker_id,
  workerName:     booking.worker_name,
  workerPhone:    booking.worker_phone,

  categoryId:     booking.category_id,
  categoryName:   booking.category_name,
  categoryEmoji:  booking.category_emoji,

  scheduledAt:    booking.scheduled_at,
  startedAt:      booking.started_at,
  completedAt:    booking.completed_at,
  cancelledAt:    booking.cancelled_at,

  fullAddress:    booking.full_address,
  latitude:       booking.latitude,
  longitude:      booking.longitude,

  basePrice:      booking.base_price,
  platformFee:    booking.platform_fee,
  totalAmount:    booking.total_amount,
  workerPayout:   booking.worker_payout,
  paymentStatus:  booking.payment_status,

  status:         booking.status,
  notes:          booking.notes,
  rating:         booking.rating,
  review:         booking.review,
  cancellationReason: booking.cancellation_reason,
  cancelledBy:    booking.cancelled_by,

  createdAt:      booking.created_at,
  updatedAt:      booking.updated_at,
});

// ─────────────────────────────────────────
//  MAIN SERVICE METHODS
// ─────────────────────────────────────────
const bookingService = {
  /**
   * CREATE BOOKING
   *
   * Steps:
   * 1. Validate worker exists + available
   * 2. Validate category exists
   * 3. Validate address belongs to customer
   * 4. Validate scheduled time is future
   * 5. Calculate pricing
   * 6. Generate booking number
   * 7. Save booking
   */
  createBooking: async (customerId, data) => {
    const { workerId, categoryId, addressId, scheduledAt, notes } = data;

    // 1. Worker check
    const worker = db.findWorkerById(workerId);
    if (!worker)              return { error: 'WORKER_NOT_FOUND' };
    if (!worker.is_active)    return { error: 'WORKER_INACTIVE' };
    if (!worker.is_available) return { error: 'WORKER_UNAVAILABLE' };

    // 2. Category check
    const category = db.findCategoryById(categoryId);
    if (!category) return { error: 'CATEGORY_NOT_FOUND' };

    // 3. Address check
    const address = db.findAddressById(addressId);
    if (!address)                       return { error: 'ADDRESS_NOT_FOUND' };
    if (address.user_id !== customerId) return { error: 'ADDRESS_NOT_YOURS' };

    // 4. Time check
    const scheduled = new Date(scheduledAt);
    if (isNaN(scheduled.getTime())) return { error: 'INVALID_TIME' };
    if (scheduled <= new Date())    return { error: 'TIME_IN_PAST' };

    // 5. Pricing
    const pricing = calculatePricing(category.base_price);

    // 6. Booking number
    const bookingNumber = generateBookingNumber();

    // 7. Create
    const booking = {
      id:             uuidv4(),
      booking_number: bookingNumber,

      customer_id:    customerId,
      worker_id:      worker.id,
      worker_name:    worker.name,
      worker_phone:   worker.phone,

      category_id:    category.id,
      category_name:  category.name,
      category_emoji: category.emoji,

      scheduled_at:   scheduled.toISOString(),
      started_at:     null,
      completed_at:   null,
      cancelled_at:   null,

      address_id:     address.id,
      full_address:   address.full_address,
      latitude:       address.latitude,
      longitude:      address.longitude,

      base_price:     pricing.basePrice,
      platform_fee:   pricing.platformFee,
      total_amount:   pricing.totalAmount,
      worker_payout:  pricing.workerPayout,
      payment_status: 'pending',

      status:         STATUS.PENDING,
      notes:          notes || null,
      rating:         null,
      review:         null,
      cancellation_reason: null,
      cancelled_by:   null,

      created_at:     new Date().toISOString(),
      updated_at:     new Date().toISOString(),
    };

    db.createBooking(booking);
    logger.info(`Booking created: ${bookingNumber} (customer: ${customerId} → worker: ${worker.id})`);

    // 🔔 Trigger notifications
    const customer = db.findUserById(customerId);
    notifyBookingEvent(
      formatBooking(booking),
      'created',
      customer?.phone,
      worker.phone
    );

    // 🔔 FCM push to worker — new job
    sendPush({
      userId:      worker.id,
      userType:    'worker',
      title:       '🆕 New booking request',
      body:        `${booking.category_name} · ₹${booking.worker_payout}`,
      data:        { bookingId: booking.id, type: 'new_booking' },
      clickAction: `/worker-mode`,
    });

    return { booking: formatBooking(booking) };
  },

  /**
   * GET BOOKING DETAILS
   */
  getBookingById: async (bookingId, requesterId, requesterType) => {
    const booking = db.findBookingById(bookingId);
    if (!booking) return { error: 'NOT_FOUND' };

    // Ownership check
    if (requesterType === 'customer' && booking.customer_id !== requesterId) {
      return { error: 'FORBIDDEN' };
    }
    if (requesterType === 'worker' && booking.worker_id !== requesterId) {
      return { error: 'FORBIDDEN' };
    }

    return { booking: formatBooking(booking) };
  },

  /**
   * CUSTOMER'S BOOKINGS LIST
   */
  getCustomerBookings: async (customerId, statusFilter = null) => {
    let bookings = db.findBookingsByCustomer(customerId);
    if (statusFilter) {
      bookings = bookings.filter((b) => b.status === statusFilter);
    }
    return { bookings: bookings.map(formatBooking), count: bookings.length };
  },

  /**
   * WORKER'S JOBS LIST
   */
  getWorkerJobs: async (workerId, statusFilter = null) => {
    let bookings = db.findBookingsByWorker(workerId);
    if (statusFilter) {
      bookings = bookings.filter((b) => b.status === statusFilter);
    }
    return { bookings: bookings.map(formatBooking), count: bookings.length };
  },

  /**
   * CHANGE BOOKING STATUS — State Machine
   */
  changeStatus: async (bookingId, newStatus, requesterId, requesterType) => {
    const booking = db.findBookingById(bookingId);
    if (!booking) return { error: 'NOT_FOUND' };

    // Permission check
    if (requesterType === 'worker' && booking.worker_id !== requesterId) {
      return { error: 'FORBIDDEN' };
    }
    if (requesterType === 'customer' && booking.customer_id !== requesterId) {
      return { error: 'FORBIDDEN' };
    }

    // State transition check
    if (!canTransition(booking.status, newStatus)) {
      return {
        error: 'INVALID_TRANSITION',
        message: `${booking.status} → ${newStatus} allowed nahi hai`,
      };
    }

    // Status-specific updates
    const updates = { status: newStatus };

    if (newStatus === STATUS.IN_PROGRESS) {
      updates.started_at = new Date().toISOString();
    }
    if (newStatus === STATUS.COMPLETED) {
      updates.completed_at = new Date().toISOString();
      // Worker ke total_jobs badao
      db.incrementWorkerJobs(booking.worker_id);
    }

    const updated = db.updateBooking(bookingId, updates);
    logger.info(`Booking ${booking.booking_number}: ${booking.status} → ${newStatus}`);

    // 🔔 Trigger notifications
    const eventMap = {
      confirmed:   'accepted',
      on_the_way:  'on_the_way',
      in_progress: 'arrived',
      completed:   'completed',
    };
    const event = eventMap[newStatus];
    if (event) {
      const customer = db.findUserById(booking.customer_id);
      notifyBookingEvent(formatBooking(updated), event, customer?.phone, booking.worker_phone);

      // 🔔 FCM push to customer
      const pushTitles = {
        accepted:   '✅ Booking confirmed',
        on_the_way: '🚗 Worker is on the way',
        arrived:    '📍 Worker has arrived',
        completed:  '✨ Service completed',
      };
      sendPush({
        userId:      booking.customer_id,
        userType:    'user',
        title:       pushTitles[event] || 'Booking update',
        body:        `${booking.worker_name} — ${booking.booking_number}`,
        data:        { bookingId, type: 'booking_status', status: newStatus },
        clickAction: `/booking/${bookingId}`,
      });
    }

    return { booking: formatBooking(updated) };
  },

  /**
   * CANCEL BOOKING
   */
  cancelBooking: async (bookingId, requesterId, requesterType, reason) => {
    const booking = db.findBookingById(bookingId);
    if (!booking) return { error: 'NOT_FOUND' };

    // Already cancelled?
    if (booking.status === STATUS.CANCELLED) {
      return { error: 'ALREADY_CANCELLED' };
    }

    // Already completed?
    if (booking.status === STATUS.COMPLETED) {
      return { error: 'CANNOT_CANCEL_COMPLETED' };
    }

    // Permission check
    if (requesterType === 'customer' && booking.customer_id !== requesterId) {
      return { error: 'FORBIDDEN' };
    }
    if (requesterType === 'worker' && booking.worker_id !== requesterId) {
      return { error: 'FORBIDDEN' };
    }

    const updated = db.updateBooking(bookingId, {
      status: STATUS.CANCELLED,
      cancelled_at: new Date().toISOString(),
      cancellation_reason: reason || 'No reason provided',
      cancelled_by: requesterType,
    });

    logger.info(`Booking ${booking.booking_number} cancelled by ${requesterType}`);

    // 🔔 Trigger notification
    const customer = db.findUserById(booking.customer_id);
    notifyBookingEvent(formatBooking(updated), 'cancelled', customer?.phone, booking.worker_phone);

    return { booking: formatBooking(updated) };
  },

  /**
   * RESCHEDULE BOOKING
   */
  rescheduleBooking: async (bookingId, customerId, newScheduledAt) => {
    const booking = db.findBookingById(bookingId);
    if (!booking) return { error: 'NOT_FOUND' };
    if (booking.customer_id !== customerId) return { error: 'FORBIDDEN' };

    // Sirf pending/confirmed reschedule ho sakta hai
    if (!['pending', 'confirmed'].includes(booking.status)) {
      return { error: 'CANNOT_RESCHEDULE' };
    }

    const newTime = new Date(newScheduledAt);
    if (isNaN(newTime.getTime()))   return { error: 'INVALID_TIME' };
    if (newTime <= new Date())      return { error: 'TIME_IN_PAST' };

    const updated = db.updateBooking(bookingId, {
      scheduled_at: newTime.toISOString(),
    });

    logger.info(`Booking ${booking.booking_number} rescheduled to ${newTime}`);
    return { booking: formatBooking(updated) };
  },

  /**
   * RATE BOOKING — Customer reviews worker
   */
  rateBooking: async (bookingId, customerId, rating, review, photoUrls = []) => {
    const booking = db.findBookingById(bookingId);
    if (!booking) return { error: 'NOT_FOUND' };
    if (booking.customer_id !== customerId) return { error: 'FORBIDDEN' };

    // Sirf completed bookings rate ho sakti hain
    if (booking.status !== STATUS.COMPLETED) {
      return { error: 'NOT_COMPLETED' };
    }

    if (booking.rating) {
      return { error: 'ALREADY_RATED' };
    }

    if (rating < 1 || rating > 5) {
      return { error: 'INVALID_RATING' };
    }

    // Booking row update (backward compat — old API consumers expect this)
    const updated = db.updateBooking(bookingId, {
      rating,
      review: review || null,
    });

    // Reviews table mein bhi save karo (photo reviews + worker reply support)
    const reviewService = require('./review.service');
    const reviewResult = await reviewService.create({
      bookingId,
      customerId,
      workerId:  booking.worker_id,
      rating,
      comment:   review,
      photoUrls,
    });

    logger.info(`Booking ${booking.booking_number} rated ${rating}⭐ (${(photoUrls || []).length} photos)`);
    return {
      booking: formatBooking(updated),
      review:  reviewResult.review || null,
    };
  },
};

module.exports = { ...bookingService, STATUS, formatBooking };
