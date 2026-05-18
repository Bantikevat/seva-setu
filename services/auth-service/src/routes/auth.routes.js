/**
 * AUTH ROUTES
 * -------------------------------------------------
 * Yahan sirf URLs define hoti hain — kaunsa URL pe kya hoga.
 *
 * Pattern:
 *   router.METHOD('/path', ...middlewares, controller.function)
 *
 * Public routes:    Koi bhi call kar sakta hai (no token needed)
 * Protected routes: Sirf logged-in users call kar sakte hain
 */

const express        = require('express');
const router         = express.Router();
const authController = require('../controllers/auth.controller');
const authMiddleware = require('../middleware/auth.middleware');
const authValidator  = require('../validators/auth.validator');

// ─────────────────────────────────────────
//  PUBLIC ROUTES — Token ki zaroorat nahi
// ─────────────────────────────────────────

/**
 * OTP bhejo
 * 1. validateSendOtp  → phone sahi hai?
 * 2. sendOtp          → OTP generate karo, bhejo
 */
router.post(
  '/send-otp',
  authValidator.validateSendOtp,   // Pehle validate
  authController.sendOtp           // Phir controller
);

/**
 * OTP verify karo
 * 1. validateVerifyOtp → phone aur OTP sahi format mein?
 * 2. verifyOtp         → OTP match karo, token do
 */
router.post(
  '/verify-otp',
  authValidator.validateVerifyOtp,
  authController.verifyOtp
);

// ─────────────────────────────────────────
//  PROTECTED ROUTES — Token zaroori hai
// ─────────────────────────────────────────

/**
 * Logout
 * 1. authMiddleware → token valid?
 * 2. logout         → token delete karo
 */
router.post(
  '/logout',
  authMiddleware,        // Pehle token check
  authController.logout  // Phir logout
);

/**
 * Mera profile
 * 1. authMiddleware → token valid?
 * 2. getMe          → user data return karo
 */
router.get(
  '/me',
  authMiddleware,
  authController.getMe
);

module.exports = router;
