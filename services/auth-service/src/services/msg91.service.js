/**
 * MSG91 SERVICE — Real SMS sending
 * -------------------------------------------------
 * MSG91 documentation: https://docs.msg91.com/
 *
 * Setup karne ke steps:
 * 1. https://msg91.com par account banao (free trial milta hai)
 * 2. Auth Key copy karo dashboard se
 * 3. Sender ID register karo (6 letters, e.g. "SEVSTU")
 * 4. DLT registration karwao (India ke liye TRAI rule)
 * 5. Template approve karwao — text:
 *      "Your Seva Setu OTP is ##OTP##. Valid for 5 min. Do not share."
 * 6. .env file mein add karo:
 *      MSG91_AUTH_KEY=your-key-here
 *      MSG91_TEMPLATE_ID=your-template-id
 *      MSG91_SENDER_ID=SEVSTU
 *
 * Cost: ~₹0.18-0.25 per SMS (transactional)
 */

const config = require('../config/env');
const logger = require('../utils/logger');

const MSG91_BASE = 'https://control.msg91.com/api/v5';

const msg91Service = {
  /**
   * OTP SMS bhejo via MSG91 Flow API
   *
   * @param {string} phone - 10 digit (without +91)
   * @param {string} otp   - 6 digit
   * @returns {Promise<{success: boolean, requestId?: string, error?: string}>}
   */
  sendOtpSms: async (phone, otp) => {
    if (!config.msg91AuthKey) {
      logger.warn('MSG91_AUTH_KEY missing — SMS skip kar rahe hain');
      return { success: false, error: 'MSG91 not configured' };
    }

    if (!config.msg91TemplateId) {
      logger.warn('MSG91_TEMPLATE_ID missing — SMS skip kar rahe hain');
      return { success: false, error: 'Template ID not set' };
    }

    try {
      const url = `${MSG91_BASE}/flow/`;
      const body = {
        template_id: config.msg91TemplateId,
        short_url:   '0',
        recipients: [
          {
            mobiles: `91${phone}`, // India country code
            OTP:     otp,          // Variable name as per template
          },
        ],
      };

      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          authkey:        config.msg91AuthKey,
        },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (data.type === 'success') {
        logger.info(`SMS sent to ${phone.substring(0, 5)}XXXXX (req: ${data.request_id})`);
        return { success: true, requestId: data.request_id };
      }

      logger.error('MSG91 error:', data);
      return { success: false, error: data.message || 'SMS failed' };
    } catch (err) {
      logger.error('MSG91 exception:', err.message);
      return { success: false, error: err.message };
    }
  },

  /**
   * Verify the OTP using MSG91's built-in verification
   * (alternative — agar apne Redis verify nahi karna ho)
   */
  verifyOtpViaMsg91: async (phone, otp) => {
    if (!config.msg91AuthKey) return { valid: false };

    try {
      const url = `${MSG91_BASE}/otp/verify?mobile=91${phone}&otp=${otp}`;
      const res = await fetch(url, {
        method: 'GET',
        headers: { authkey: config.msg91AuthKey },
      });
      const data = await res.json();
      return { valid: data.type === 'success' };
    } catch (err) {
      logger.error('MSG91 verify error:', err.message);
      return { valid: false };
    }
  },
};

module.exports = msg91Service;
