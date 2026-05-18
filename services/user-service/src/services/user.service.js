/**
 * USER SERVICE — Profile Management
 * -------------------------------------------------
 * User ke profile (name, email, photo) se related logic.
 *
 * Yahan database operations ko handle karte hain.
 * Controller is service ko bulata hai.
 */

const db     = require('../config/database');
const logger = require('../utils/logger');

const userService = {
  /**
   * User ID se profile nikalo
   *
   * @param {string} userId
   * @returns {Object|null}
   */
  getProfile: async (userId) => {
    const user = await db.findUserById(userId);

    if (!user) return null;

    // Sensitive fields hata do (security)
    return {
      id:           user.id,
      phone:        user.phone,
      name:         user.name,
      email:        user.email,
      profilePhoto: user.profile_photo,
      cityId:       user.city_id,
      createdAt:    user.created_at,
    };
  },

  /**
   * Profile update karo
   *
   * @param {string} userId
   * @param {Object} updates - { name, email, profile_photo, city_id }
   * @returns {Object|null} - Updated profile
   */
  updateProfile: async (userId, updates) => {
    // Snake_case mein convert karo (DB format)
    const dbUpdates = {
      name:          updates.name,
      email:         updates.email,
      profile_photo: updates.profilePhoto,
      city_id:       updates.cityId,
    };

    const updated = await db.updateUser(userId, dbUpdates);

    if (!updated) {
      return null;
    }

    logger.info(`Profile updated for user: ${userId}`);

    // CamelCase mein return karo (frontend format)
    return {
      id:           updated.id,
      phone:        updated.phone,
      name:         updated.name,
      email:        updated.email,
      profilePhoto: updated.profile_photo,
      cityId:       updated.city_id,
    };
  },

  /**
   * GDPR — Account delete (soft delete: PII clear, status = deleted)
   */
  deleteAccount: async (userId) => {
    await db.updateUser(userId, {
      name:          '[Deleted User]',
      email:         null,
      profile_photo: null,
      is_active:     0,
    });
    logger.info(`Account deleted (soft) for user: ${userId}`);
    return true;
  },

  /**
   * GDPR — Full data export as JSON
   */
  exportData: async (userId) => {
    const user      = await db.findUserById(userId);
    const addresses = await db.findAddressesByUser?.(userId).catch(() => []) || [];
    const bookings  = await db.findBookingsByUser?.(userId).catch(() => [])  || [];
    return {
      exported_at: new Date().toISOString(),
      user,
      addresses,
      bookings,
      note: 'Ye aapka complete Seva Setu data hai. GDPR Article 20.',
    };
  },
};

module.exports = userService;
