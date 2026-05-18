/**
 * AUTH VALIDATOR
 * -------------------------------------------------
 * Controller se pehle yeh chalega.
 * User ne jo data bheja — sahi hai ya nahi check karo.
 *
 * Rule: Controller mein KABHI validation mat likho.
 * Alag rakh — clean code ka principle hai yeh.
 *
 * Example:
 *   POST /auth/send-otp → validateSendOtp middleware chalega pehle
 *   Agar phone galat hai → automatically error return
 *   Agar phone sahi hai → controller chalega
 */

const response = require('../utils/response');

const authValidator = {
  /**
   * OTP bhejne se pehle validate karo
   * Check karta hai: phone number 10 digit ka valid Indian number hai?
   */
  validateSendOtp: (req, res, next) => {
    const { phone } = req.body;

    // Phone aaya hi nahi
    if (!phone) {
      return response.error(res, 'Phone number zaroori hai', 'AUTH_001');
    }

    // String bana do (agar number bheja ho)
    const phoneStr = String(phone).trim();

    // Exactly 10 digits hona chahiye
    if (!/^\d{10}$/.test(phoneStr)) {
      return response.error(
        res,
        'Phone number 10 digit ka hona chahiye',
        'AUTH_001'
      );
    }

    // Indian numbers 6, 7, 8, 9 se shuru hote hain
    if (!/^[6-9]/.test(phoneStr)) {
      return response.error(
        res,
        'Valid Indian phone number daalein',
        'AUTH_001'
      );
    }

    // Sab theek hai — cleaned phone save karo aur aage badho
    req.body.phone = phoneStr;
    next();
  },

  /**
   * OTP verify karne se pehle validate karo
   * Check karta hai: phone aur OTP dono aaye?
   */
  validateVerifyOtp: (req, res, next) => {
    const { phone, otp } = req.body;

    if (!phone) {
      return response.error(res, 'Phone number zaroori hai', 'AUTH_001');
    }

    if (!otp) {
      return response.error(res, 'OTP zaroori hai', 'AUTH_003');
    }

    const phoneStr = String(phone).trim();
    const otpStr   = String(otp).trim();

    // Phone validate
    if (!/^\d{10}$/.test(phoneStr)) {
      return response.error(res, 'Phone number 10 digit ka hona chahiye', 'AUTH_001');
    }

    // OTP 4 ya 6 digit ka hona chahiye
    if (!/^\d{4,6}$/.test(otpStr)) {
      return response.error(res, 'OTP 4-6 digit ka hona chahiye', 'AUTH_003');
    }

    // Cleaned values save karo
    req.body.phone = phoneStr;
    req.body.otp   = otpStr;
    next();
  },
};

module.exports = authValidator;
