/**
 * BULKSMSINDIA SERVICE — Real SMS via BulkSMSIndia gateway
 * -------------------------------------------------
 * Gateway: https://sms.bulksmsind.in/v2/sendSMS
 *
 * DLT-compliant transactional SMS for India.
 * Template MUST exactly match what was registered with DLT.
 *
 * Setup .env:
 *   BULKSMSIND_USERNAME=amanshivhare
 *   BULKSMSIND_APIKEY=ad7c2f00-...
 *   BULKSMSIND_SENDER_ID=FANTCL
 *   BULKSMSIND_PEID=1201161743317422401
 *   BULKSMSIND_TEMPLATE_ID=1707171819116477152
 *   BULKSMSIND_TEMPLATE="Hello, Your OTP to Login is {OTP} Thanks Fanatical Technologies"
 *
 * The {OTP} placeholder gets replaced with the actual 6-digit OTP.
 */

const logger = require('../utils/logger');

const GATEWAY = 'https://sms.bulksmsind.in/v2/sendSMS';

const cfg = () => ({
  username:   process.env.BULKSMSIND_USERNAME,
  apikey:     process.env.BULKSMSIND_APIKEY,
  sender:     process.env.BULKSMSIND_SENDER_ID || 'FANTCL',
  peid:       process.env.BULKSMSIND_PEID,
  templateId: process.env.BULKSMSIND_TEMPLATE_ID,
  template:   process.env.BULKSMSIND_TEMPLATE || 'Hello, Your OTP to Login is {OTP} Thanks Fanatical Technologies',
  smstype:    process.env.BULKSMSIND_SMSTYPE || 'TRANS',
});

const bulkSmsIndService = {
  isConfigured: () => {
    const c = cfg();
    return !!(c.username && c.apikey && c.peid && c.templateId);
  },

  /**
   * Send OTP SMS via BulkSMSIndia
   *
   * @param {string} phone  - 10 digit (without +91)
   * @param {string} otp    - 6 digit
   * @returns {Promise<{success, error?}>}
   */
  sendOtpSms: async (phone, otp) => {
    const c = cfg();
    if (!bulkSmsIndService.isConfigured()) {
      return { success: false, error: 'NOT_CONFIGURED' };
    }

    // Substitute OTP into the registered DLT template
    const message = c.template.replace(/\{OTP\}/g, otp).replace(/##OTP##/g, otp);

    // Build query parameters
    const params = new URLSearchParams({
      username:   c.username,
      apikey:     c.apikey,
      sendername: c.sender,
      smstype:    c.smstype,
      numbers:    phone,
      message,
      peid:       c.peid,
      templateid: c.templateId,
    });

    const url = `${GATEWAY}?${params.toString()}`;

    try {
      const res = await fetch(url, { method: 'GET' });
      const text = await res.text();

      // Gateway returns plain text. Success indicators vary — usually contains "submitted"/"success"/numeric id.
      // Failure indicators: "error", "invalid", "fail"
      const lower = text.toLowerCase();

      if (lower.includes('error') || lower.includes('invalid') || lower.includes('fail') || lower.includes('insufficient')) {
        logger.error(`BulkSMSIndia error for ${phone.substring(0, 5)}XXXXX: ${text}`);
        return { success: false, error: text.trim() };
      }

      logger.info(`✓ BulkSMSIndia OTP sent to ${phone.substring(0, 5)}XXXXX (resp: ${text.trim().substring(0, 60)})`);
      return { success: true, response: text.trim() };
    } catch (err) {
      logger.error('BulkSMSIndia exception:', err.message);
      return { success: false, error: err.message };
    }
  },
};

module.exports = bulkSmsIndService;
