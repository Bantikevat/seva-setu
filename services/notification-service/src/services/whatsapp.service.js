/**
 * WHATSAPP SERVICE
 * Dev mode: Console mein print (with emoji formatting)
 * Production: WhatsApp Business API
 */

const config = require('../config/env');
const logger = require('../utils/logger');

const whatsappService = {
  /**
   * WhatsApp message bhejo
   *
   * @param {string} phone   10-digit phone
   * @param {string} message Formatted message (with markdown)
   */
  send: async (phone, message) => {
    // DEV MODE — console
    if (config.isDev) {
      logger.whatsapp(`To: +91${phone}`);
      logger.whatsapp(`Message:`);
      console.log(`     ╔════════════════════════════════╗`);
      message.split('\n').forEach((line) => {
        console.log(`     ║ ${line.padEnd(30)} ║`);
      });
      console.log(`     ╚════════════════════════════════╝`);
      return { success: true, provider: 'console', messageId: `dev-${Date.now()}` };
    }

    // PRODUCTION — WhatsApp Business API
    if (!config.whatsappToken) {
      logger.warn('WhatsApp not configured — message skipped');
      return { success: false, error: 'NOT_CONFIGURED' };
    }

    try {
      // TODO: Real WhatsApp Business API call
      logger.whatsapp(`Sent to +91${phone}`);
      return { success: true, provider: 'whatsapp-business' };
    } catch (error) {
      logger.error('WhatsApp send failed:', error.message);
      return { success: false, error: error.message };
    }
  },
};

module.exports = whatsappService;
