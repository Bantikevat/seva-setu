/**
 * NOTIFICATION ORCHESTRATOR
 * -------------------------------------------------
 * High-level API — automatically multiple channels handle karta hai.
 */

const sms      = require('./sms.service');
const whatsapp = require('./whatsapp.service');
const email    = require('./email.service');
const { render } = require('../templates');
const logger = require('../utils/logger');

const notificationService = {
  /**
   * Send notification using template — multi-channel
   *
   * @param {string} phone     Recipient phone
   * @param {string} template  Template key (e.g., 'booking_created_customer')
   * @param {Object} vars      Variables
   * @param {Array}  channels  ['sms', 'whatsapp']
   */
  sendTemplated: async (phone, template, vars = {}, channels = ['sms', 'whatsapp']) => {
    const results = {};

    for (const channel of channels) {
      const message = render(template, channel, vars);
      if (!message) {
        results[channel] = { success: false, error: 'TEMPLATE_NOT_FOUND' };
        continue;
      }

      if (channel === 'sms') {
        results.sms = await sms.send(phone, message);
      } else if (channel === 'whatsapp') {
        results.whatsapp = await whatsapp.send(phone, message);
      }
    }

    return results;
  },

  /**
   * Notify customer about booking event
   */
  notifyBookingEvent: async (booking, event) => {
    const eventToTemplate = {
      'created':       'booking_created_customer',
      'accepted':      'worker_accepted',
      'on_the_way':    'worker_on_the_way',
      'arrived':       'worker_arrived',
      'completed':     'booking_completed',
      'cancelled':     'booking_cancelled',
    };

    const template = eventToTemplate[event];
    if (!template) {
      logger.warn(`No template for event: ${event}`);
      return null;
    }

    const vars = {
      bookingNumber: booking.bookingNumber,
      workerName:    booking.workerName,
      workerPhone:   booking.workerPhone,
      categoryName:  booking.categoryName,
      scheduledAt:   new Date(booking.scheduledAt).toLocaleString('en-IN'),
      totalAmount:   booking.totalAmount,
      workerPayout:  booking.workerPayout,
      location:      booking.fullAddress,
      reason:        booking.cancellationReason || 'N/A',
      bookingId:     booking.id,
    };

    const results = await notificationService.sendTemplated(
      booking.customerPhone || '0000000000',
      template,
      vars,
      ['sms', 'whatsapp']
    );

    // Email (if customer email available)
    if (booking.customerEmail && event === 'created') {
      email.sendBookingConfirmation({
        to:           booking.customerEmail,
        customerName: booking.customerName,
        booking,
      }).catch((e) => logger.error('Booking email failed:', e.message));
    }

    return results;
  },

  /**
   * Notify worker about new job
   */
  notifyNewJob: async (booking, workerPhone) => {
    const vars = {
      bookingNumber: booking.bookingNumber,
      categoryName:  booking.categoryName,
      scheduledAt:   new Date(booking.scheduledAt).toLocaleString('en-IN'),
      workerPayout:  booking.workerPayout,
      location:      booking.fullAddress,
      bookingId:     booking.id,
    };

    const results = await notificationService.sendTemplated(
      workerPhone,
      'new_job_worker',
      vars,
      ['sms', 'whatsapp']
    );

    // Email to worker (if available)
    if (booking.workerEmail) {
      email.sendNewJobAlert({
        to:         booking.workerEmail,
        workerName: booking.workerName,
        booking,
      }).catch((e) => logger.error('Worker job email failed:', e.message));
    }

    return results;
  },
};

module.exports = notificationService;
