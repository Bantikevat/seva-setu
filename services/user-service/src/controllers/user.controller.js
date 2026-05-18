/**
 * USER CONTROLLER
 * -------------------------------------------------
 * Request lo → Service bulao → Response do.
 *
 * Yahan business logic NAHI hoti.
 * Service mein hoti hai.
 */

const userService    = require('../services/user.service');
const addressService = require('../services/address.service');
const photoService   = require('../services/photo.service');
const rewardsService = require('../services/rewards.service');
const cloudinary     = require('../services/cloudinary.service');
const response       = require('../utils/response');
const logger         = require('../utils/logger');

// Allowed upload folders (security — prevent arbitrary uploads)
const ALLOWED_FOLDERS = new Set([
  'reviews',
  'chat',
  'problem-photos',
  'addresses',
  'worker-photos',
  'worker-docs',
]);

const userController = {
  // ─────────────────────────────────────────
  //  PROFILE ENDPOINTS
  // ─────────────────────────────────────────

  /**
   * GET /users/me
   * Mera profile dekho
   */
  getMe: async (req, res) => {
    try {
      const profile = await userService.getProfile(req.user.userId);

      if (!profile) {
        return response.notFound(res, 'User nahi mila');
      }

      return response.success(res, 'Profile mila', profile);
    } catch (error) {
      logger.error('getMe error:', error.message);
      return response.serverError(res);
    }
  },

  /**
   * DELETE /users/me — Account delete (GDPR Right to Erasure)
   * Soft delete: PII clear, account marked inactive
   */
  deleteMe: async (req, res) => {
    try {
      await userService.deleteAccount(req.user.userId);
      return response.success(res, 'Account delete ho gaya. Goodbye!');
    } catch (error) {
      logger.error('deleteMe error:', error.message);
      return response.serverError(res);
    }
  },

  /**
   * GET /users/me/export — Data export (GDPR Right to Portability)
   * Returns user's full data as JSON download
   */
  exportMe: async (req, res) => {
    try {
      const data = await userService.exportData(req.user.userId);
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="seva-setu-data-${req.user.userId}.json"`);
      return res.json(data);
    } catch (error) {
      logger.error('exportMe error:', error.message);
      return response.serverError(res);
    }
  },

  // ─── REWARDS / REFERRAL ───

  /**
   * GET /users/me/rewards
   */
  getRewards: async (req, res) => {
    try {
      const rewards = rewardsService.getUserRewards(req.user.userId, req.user.phone);
      return response.success(res, 'Rewards data', rewards);
    } catch (error) {
      logger.error('getRewards error:', error.message);
      return response.serverError(res);
    }
  },

  /**
   * POST /users/me/apply-referral
   * Body: { code }
   */
  applyReferral: async (req, res) => {
    try {
      const { code } = req.body;
      if (!code) return response.error(res, 'Referral code zaroori');

      const result = rewardsService.applyReferral(req.user.userId, code);
      if (result.error === 'INVALID_CODE') return response.error(res, 'Invalid referral code');
      if (result.error === 'CANNOT_REFER_SELF') return response.error(res, 'Cannot refer yourself');

      return response.success(res, `Got ${result.reward} bonus points!`, result);
    } catch (error) {
      logger.error('applyReferral error:', error.message);
      return response.serverError(res);
    }
  },

  /**
   * POST /users/me/redeem-points
   * Body: { points }
   */
  redeemPoints: async (req, res) => {
    try {
      const { points } = req.body;
      if (!points || points < 10) return response.error(res, 'Min 10 points required');

      const result = rewardsService.redeemPoints(req.user.userId, points);
      if (result.error === 'INSUFFICIENT_POINTS') {
        return response.error(res, `Only ${result.available} points available`);
      }

      return response.success(res, `Redeemed ${result.pointsRedeemed} points for ₹${result.discount}`, result);
    } catch (error) {
      logger.error('redeemPoints error:', error.message);
      return response.serverError(res);
    }
  },

  /**
   * POST /users/me/photo
   * Upload profile photo (base64)
   */
  uploadPhoto: async (req, res) => {
    try {
      const { photo } = req.body;
      if (!photo) return response.error(res, 'Photo required');

      const result = await photoService.saveProfilePhoto(req.user.userId, photo);

      if (result.error === 'INVALID_IMAGE') return response.error(res, 'Invalid image format');
      if (result.error === 'IMAGE_TOO_LARGE') return response.error(res, `Image too large: ${result.sizeKb}KB. Max 1MB`);
      if (result.error === 'USER_NOT_FOUND') return response.notFound(res, 'User not found');

      return response.success(res, 'Photo updated', { url: result.url, sizeKb: result.sizeKb });
    } catch (error) {
      logger.error('uploadPhoto error:', error.message);
      return response.serverError(res);
    }
  },

  /**
   * POST /users/upload-image
   * Body: { photo (base64), folder ('reviews'|'chat'|'problem-photos'|'addresses') }
   * Returns: { url, publicId }
   *
   * Generic image upload — reviews, chat photos, problem AI photos, etc.
   * Cloudinary par jaata hai (configured ho to), else base64 wapas
   */
  uploadImage: async (req, res) => {
    try {
      const { photo, folder = 'misc' } = req.body;
      if (!photo) return response.error(res, 'Photo required');

      if (!ALLOWED_FOLDERS.has(folder)) {
        return response.error(res, `Invalid folder. Allowed: ${[...ALLOWED_FOLDERS].join(', ')}`);
      }

      const sizeKb = Math.round(photo.length / 1024);
      if (sizeKb > 5120) return response.error(res, `Image too large: ${sizeKb}KB. Max 5MB`);

      if (!cloudinary.isConfigured()) {
        // Dev fallback — return base64 as-is so feature still works
        logger.warn('Cloudinary not configured — returning base64');
        return response.success(res, 'Photo received (dev mode — base64)', { url: photo, publicId: null });
      }

      const result = await cloudinary.upload(photo, `seva-setu/${folder}`);
      if (!result.success) return response.error(res, result.error || 'Upload failed');

      return response.success(res, 'Image uploaded', {
        url:      result.url,
        publicId: result.publicId,
        width:    result.width,
        height:   result.height,
        bytes:    result.bytes,
      });
    } catch (error) {
      logger.error('uploadImage error:', error.message);
      return response.serverError(res);
    }
  },

  /**
   * PUT /users/me
   * Profile update karo
   * Body: { name?, email?, profilePhoto?, cityId? }
   */
  updateMe: async (req, res) => {
    try {
      const { name, email, profilePhoto, cityId } = req.body;

      const updated = await userService.updateProfile(req.user.userId, {
        name, email, profilePhoto, cityId,
      });

      if (!updated) {
        return response.notFound(res, 'User nahi mila');
      }

      return response.success(res, 'Profile update ho gaya', updated);
    } catch (error) {
      logger.error('updateMe error:', error.message);
      return response.serverError(res);
    }
  },

  // ─────────────────────────────────────────
  //  ADDRESS ENDPOINTS
  // ─────────────────────────────────────────

  /**
   * GET /users/addresses
   * Mere saare addresses
   */
  getAddresses: async (req, res) => {
    try {
      const addresses = await addressService.getAll(req.user.userId);
      return response.success(res, 'Addresses mile', { addresses, count: addresses.length });
    } catch (error) {
      logger.error('getAddresses error:', error.message);
      return response.serverError(res);
    }
  },

  /**
   * POST /users/addresses
   * Naya address add karo
   * Body: { label, fullAddress, latitude, longitude, cityId? }
   */
  createAddress: async (req, res) => {
    try {
      const newAddress = await addressService.create(req.user.userId, req.body);
      return response.success(res, 'Address add ho gaya', newAddress, 201);
    } catch (error) {
      logger.error('createAddress error:', error.message);
      return response.serverError(res);
    }
  },

  /**
   * PUT /users/addresses/:id
   * Address update karo
   */
  updateAddress: async (req, res) => {
    try {
      const result = await addressService.update(req.params.id, req.user.userId, req.body);

      if (result.error === 'NOT_FOUND') return response.notFound(res, 'Address nahi mila');
      if (result.error === 'FORBIDDEN') return response.forbidden(res, 'Yeh aapka address nahi hai');

      return response.success(res, 'Address update ho gaya', result);
    } catch (error) {
      logger.error('updateAddress error:', error.message);
      return response.serverError(res);
    }
  },

  /**
   * DELETE /users/addresses/:id
   * Address delete karo
   */
  deleteAddress: async (req, res) => {
    try {
      const result = await addressService.delete(req.params.id, req.user.userId);

      if (result.error === 'NOT_FOUND') return response.notFound(res, 'Address nahi mila');
      if (result.error === 'FORBIDDEN') return response.forbidden(res, 'Yeh aapka address nahi hai');

      return response.success(res, 'Address delete ho gaya');
    } catch (error) {
      logger.error('deleteAddress error:', error.message);
      return response.serverError(res);
    }
  },

  /**
   * PUT /users/addresses/:id/default
   * Default address set karo
   */
  setDefaultAddress: async (req, res) => {
    try {
      const result = await addressService.setDefault(req.params.id, req.user.userId);

      if (result.error === 'NOT_FOUND') return response.notFound(res, 'Address nahi mila');
      if (result.error === 'FORBIDDEN') return response.forbidden(res, 'Yeh aapka address nahi hai');

      return response.success(res, 'Default address set ho gaya');
    } catch (error) {
      logger.error('setDefaultAddress error:', error.message);
      return response.serverError(res);
    }
  },
};

module.exports = userController;
