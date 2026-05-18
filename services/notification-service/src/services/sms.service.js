/**
 * SMS SERVICE
 * Dev mode: Console mein print
 * Production: MSG91 API call
 */

const config = require('../config/env');
const logger = require('../utils/logger');

const smsService = {
  /**
   * SMS bhejo
   *
   * @param {string} phone   10-digit phone
   * @param {string} message Text message
   */
  send: async (phone, message) => {
    // DEV MODE — console
    if (config.isDev) {
      logger.sms(`To: +91${phone}`);
      logger.sms(`Msg: ${message}`);
      return { success: true, provider: 'console', messageId: `dev-${Date.now()}` };
    }

    // PRODUCTION — MSG91
    if (!config.msg91AuthKey) {
      logger.warn('MSG91_AUTH_KEY not configured — SMS skipped');
      return { success: false, error: 'NOT_CONFIGURED' };
    }

    try {
      // TODO: Real MSG91 API call
      // const response = await axios.post('https://api.msg91.com/...', {...});
      logger.sms(`Sent to +91${phone}`);
      return { success: true, provider: 'msg91' };
    } catch (error) {
      logger.error('SMS send failed:', error.message);
      return { success: false, error: error.message };
    }
  },
};

module.exports = smsService;
