/**
 * NOTIFICATION CONTROLLER
 */

const notificationService = require('../services/notification.service');
const smsService          = require('../services/sms.service');
const whatsappService     = require('../services/whatsapp.service');
const response = require('../utils/response');
const logger   = require('../utils/logger');

module.exports = {
  /**
   * POST /notify/sms
   * Body: { phone, message }
   */
  sendSms: async (req, res) => {
    try {
      const { phone, message } = req.body;
      if (!phone || !message) return response.error(res, 'phone aur message zaroori');

      const result = await smsService.send(phone, message);
      return response.success(res, 'SMS sent', result);
    } catch (error) {
      logger.error('sendSms error:', error.message);
      return response.serverError(res);
    }
  },

  /**
   * POST /notify/whatsapp
   */
  sendWhatsapp: async (req, res) => {
    try {
      const { phone, message } = req.body;
      if (!phone || !message) return response.error(res, 'phone aur message zaroori');

      const result = await whatsappService.send(phone, message);
      return response.success(res, 'WhatsApp sent', result);
    } catch (error) {
      logger.error('sendWhatsapp error:', error.message);
      return response.serverError(res);
    }
  },

  /**
   * POST /notify/template
   * Body: { phone, template, vars, channels }
   */
  sendTemplate: async (req, res) => {
    try {
      const { phone, template, vars, channels } = req.body;
      if (!phone || !template) return response.error(res, 'phone aur template zaroori');

      const result = await notificationService.sendTemplated(phone, template, vars, channels);
      return response.success(res, 'Notifications sent', result);
    } catch (error) {
      logger.error('sendTemplate error:', error.message);
      return response.serverError(res);
    }
  },

  /**
   * POST /notify/booking-event
   * Body: { booking, event, customerPhone, workerPhone }
   */
  bookingEvent: async (req, res) => {
    try {
      const { booking, event, customerPhone, workerPhone } = req.body;

      const results = {};

      // Customer ko notify karo
      if (customerPhone) {
        const customerBooking = { ...booking, customerPhone };
        results.customer = await notificationService.notifyBookingEvent(customerBooking, event);
      }

      // Worker ko notify karo (sirf 'created' event pe)
      if (event === 'created' && workerPhone) {
        results.worker = await notificationService.notifyNewJob(booking, workerPhone);
      }

      return response.success(res, 'Notifications dispatched', results);
    } catch (error) {
      logger.error('bookingEvent error:', error.message);
      return response.serverError(res);
    }
  },
};
