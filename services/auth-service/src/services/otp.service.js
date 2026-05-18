/**
 * OTP SERVICE
 * -------------------------------------------------
 * OTP se related SARI logic yahan hai.
 *
 * Kya karta hai:
 * 1. generateOtp()  → 6 digit random number banao
 * 2. saveOtp()      → Redis mein 5 min ke liye save karo
 * 3. sendOtp()      → MSG91 se SMS bhejo
 * 4. verifyOtp()    → User ka OTP sahi hai check karo
 * 5. deleteOtp()    → Verify hone ke baad delete karo
 *
 * Redis keys format:
 *   otp:{phone}         → Actual OTP value
 *   otp_attempts:{phone} → Kitni baar galat try kiya
 *   otp_block:{phone}   → Block hai to kab tak
 */

const { redisSet, redisGet, redisDel, redisTtl } = require('../config/redis');
const config = require('../config/env');
const logger = require('../utils/logger');
const msg91 = require('./msg91.service');
const bulkSmsInd = require('./bulksmsind.service');

const otpService = {
  /**
   * 6 digit random OTP banao
   *
   * Math.random() se 6 digit secure enough hai OTP ke liye.
   * Bank-level security ke liye crypto module use karein.
   *
   * @returns {string} - e.g. "847291"
   */
  generateOtp: () => {
    // 100000 se 999999 ke beech random number
    const otp = Math.floor(100000 + Math.random() * 900000);
    return String(otp);
  },

  /**
   * OTP Redis mein save karo
   *
   * Key:   "otp:9876543210"
   * Value: "847291"
   * TTL:   300 seconds (5 minutes) — phir automatically delete
   *
   * @param {string} phone
   * @param {string} otp
   */
  saveOtp: async (phone, otp) => {
    const key = `otp:${phone}`;
    await redisSet(key, otp, config.otpExpireSeconds);
    logger.debug(`OTP saved for ${phone.substring(0, 5)}XXXXX`); // Phone mask karo logs mein
  },

  /**
   * SMS bhejo — MSG91 service use karta hai
   *
   * Development mein: Sirf console mein print karo (free)
   * Production mein:  Real SMS bhejo (paid)
   *
   * @param {string} phone
   * @param {string} otp
   * @returns {boolean} - Sms gaya ki nahi
   */
  sendOtp: async (phone, otp) => {
    // Try gateways in priority order: BulkSMSIndia → MSG91 → console fallback

    // 1. BulkSMSIndia (preferred — DLT compliant, cheaper)
    if (bulkSmsInd.isConfigured()) {
      const r = await bulkSmsInd.sendOtpSms(phone, otp);
      if (r.success) return true;
      logger.warn(`BulkSMSIndia failed (${r.error}) — trying next gateway`);
    }

    // 2. MSG91 (secondary)
    if (config.msg91AuthKey) {
      const r = await msg91.sendOtpSms(phone, otp);
      if (r.success) return true;
      logger.warn(`MSG91 failed (${r.error}) — falling back`);
    }

    // 3. Console fallback — works in dev OR when no SMS gateway configured
    const noGateway = !bulkSmsInd.isConfigured() && !config.msg91AuthKey;
    if (config.isDev || noGateway) {
      logger.info(`📱 [CONSOLE OTP] phone=${phone} otp=${otp}  (no SMS gateway configured)`);
      return true;
    }

    logger.error(`All SMS gateways failed for ${phone.substring(0, 5)}XXXXX`);
    return false;
  },

  /**
   * User ka OTP verify karo
   *
   * Steps:
   * 1. Block check — agar 3 baar galat kiya tha → block check karo
   * 2. Redis se saved OTP nikalo
   * 3. Compare karo
   * 4. Galat hai → attempts count badao
   * 5. Sahi hai → OTP delete karo, attempts reset karo
   *
   * @param {string} phone    - User ka phone
   * @param {string} inputOtp - User ne jo OTP diya
   * @returns {{ valid: boolean, reason: string }}
   */
  verifyOtp: async (phone, inputOtp) => {
    // Step 1: Check karo block hai ki nahi
    const blockKey  = `otp_block:${phone}`;
    const isBlocked = await redisGet(blockKey);

    if (isBlocked) {
      const ttl = await redisTtl(blockKey);
      return {
        valid:  false,
        reason: `Bahut zyada galat OTP dala. ${Math.ceil(ttl / 60)} minute baad try karo.`,
        code:   'AUTH_004',
      };
    }

    // Step 2: Redis se saved OTP nikalo
    const otpKey   = `otp:${phone}`;
    const savedOtp = await redisGet(otpKey);

    // OTP mila hi nahi — expire ho gaya ya bheja nahi tha
    if (!savedOtp) {
      return {
        valid:  false,
        reason: 'OTP expire ho gaya. Naya OTP mangao.',
        code:   'AUTH_004',
      };
    }

    // Step 3: Compare karo
    if (savedOtp !== inputOtp) {
      // Step 4: Galat attempt count karo
      const attemptsKey = `otp_attempts:${phone}`;
      const attempts    = await redisGet(attemptsKey);
      const newAttempts = (parseInt(attempts) || 0) + 1;

      if (newAttempts >= config.otpMaxAttempts) {
        // 3 baar galat → block karo
        await redisSet(blockKey, '1', config.otpBlockSeconds);
        await redisDel(otpKey);       // OTP bhi delete
        await redisDel(attemptsKey);  // Attempts reset

        logger.warn(`Phone blocked due to too many OTP attempts: ${phone.substring(0, 5)}XXXXX`);

        return {
          valid:  false,
          reason: `Bahut zyada galat OTP. ${config.otpBlockSeconds / 60} minute ke liye block ho gaya.`,
          code:   'AUTH_004',
        };
      }

      // Attempts save karo (2 minute mein expire)
      await redisSet(attemptsKey, newAttempts, 120);

      const remaining = config.otpMaxAttempts - newAttempts;
      return {
        valid:  false,
        reason: `Galat OTP. ${remaining} aur try kar sakte ho.`,
        code:   'AUTH_003',
      };
    }

    // Step 5: OTP sahi hai — cleanup karo
    await redisDel(otpKey);                    // OTP delete
    await redisDel(`otp_attempts:${phone}`);   // Attempts reset

    return { valid: true };
  },
};

module.exports = otpService;
