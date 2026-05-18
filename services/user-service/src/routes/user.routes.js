/**
 * USER ROUTES
 * -------------------------------------------------
 * Saare routes PROTECTED hain — JWT token chahiye.
 */

const express  = require('express');
const router   = express.Router();
const controller     = require('../controllers/user.controller');
const authMiddleware = require('../middleware/auth.middleware');
const validator      = require('../validators/user.validator');

// ─── PROFILE ROUTES ───

router.get(
  '/me',
  authMiddleware,
  controller.getMe
);

router.put(
  '/me',
  authMiddleware,
  validator.validateUpdateProfile,
  controller.updateMe
);

router.post(
  '/me/photo',
  authMiddleware,
  controller.uploadPhoto
);

// GDPR endpoints
router.delete('/me',        authMiddleware, controller.deleteMe);
router.get   ('/me/export', authMiddleware, controller.exportMe);

// Generic image upload (reviews, chat, problem photos, addresses)
router.post(
  '/upload-image',
  authMiddleware,
  controller.uploadImage
);

// Rewards / Referrals
router.get('/me/rewards',          authMiddleware, controller.getRewards);
router.post('/me/apply-referral',  authMiddleware, controller.applyReferral);
router.post('/me/redeem-points',   authMiddleware, controller.redeemPoints);

// ─── ADDRESS ROUTES ───

router.get(
  '/addresses',
  authMiddleware,
  controller.getAddresses
);

router.post(
  '/addresses',
  authMiddleware,
  validator.validateCreateAddress,
  controller.createAddress
);

router.put(
  '/addresses/:id',
  authMiddleware,
  validator.validateAddressId,
  controller.updateAddress
);

router.delete(
  '/addresses/:id',
  authMiddleware,
  validator.validateAddressId,
  controller.deleteAddress
);

router.put(
  '/addresses/:id/default',
  authMiddleware,
  validator.validateAddressId,
  controller.setDefaultAddress
);

module.exports = router;
