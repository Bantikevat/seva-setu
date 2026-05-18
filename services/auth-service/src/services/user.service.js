/**
 * USER SERVICE
 * -------------------------------------------------
 * Database mein user ke saath kaam — sari logic yahan.
 * Uses universal db API (works in JSON + Postgres modes).
 */

const db     = require('../config/database');
const crypto = require('crypto');
const logger = require('../utils/logger');

const userService = {
  /**
   * Phone se user dhundho
   */
  findByPhone: async (phone) => {
    const user = await db.findOne('users', { phone });
    if (!user) return null;
    return {
      id:            user.id,
      phone:         user.phone,
      name:          user.name,
      profile_photo: user.profile_photo,
      city_id:       user.city_id,
      is_active:     user.is_active ?? 1,
      created_at:    user.created_at,
    };
  },

  /**
   * Naya user banao
   */
  createUser: async (phone) => {
    const id  = crypto.randomUUID();
    const now = new Date().toISOString();
    const newUser = await db.insert('users', {
      id,
      phone,
      name:       null,
      email:      null,
      is_active:  1,
      created_at: now,
      updated_at: now,
    });
    logger.info(`New user created: ${newUser.id}`);
    return await userService.findByPhone(phone);
  },

  /**
   * User dhundho ya banao
   */
  findOrCreate: async (phone) => {
    let user = await userService.findByPhone(phone);
    if (user) return { user, isNewUser: false };
    user = await userService.createUser(phone);
    return { user, isNewUser: true };
  },

  /**
   * Profile update karo
   */
  updateProfile: async (userId, updates) => {
    const patch = {};
    if (updates.name           !== undefined) patch.name           = updates.name;
    if (updates.email          !== undefined) patch.email          = updates.email;
    if (updates.profile_photo  !== undefined) patch.profile_photo  = updates.profile_photo;
    await db.update('users', { id: userId }, patch);
    return await db.findOne('users', { id: userId });
  },
};

module.exports = userService;
