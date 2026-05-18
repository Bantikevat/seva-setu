/**
 * USER SERVICE
 * -------------------------------------------------
 * Database mein user ke saath kaam — sari logic yahan.
 */

const db     = require('../config/database');
const { v4: uuidv4 } = require('uuid');
const logger = require('../utils/logger');

const userService = {
  /**
   * Phone se user dhundho
   */
  findByPhone: async (phone) => {
    const result = await db.query(
      'SELECT id, phone, name, profile_photo, city_id, is_active, created_at FROM users WHERE phone = $1',
      [phone]
    );

    return result.rows[0] || null;
  },

  /**
   * Naya user banao
   */
  createUser: async (phone) => {
    const id = uuidv4();

    // SQLite mein RETURNING ke saath INSERT
    await db.query(
      `INSERT INTO users (id, phone) VALUES ($1, $2)`,
      [id, phone]
    );

    // Phir nikal ke do
    const newUser = await userService.findByPhone(phone);
    logger.info(`New user created: ${newUser.id}`);
    return newUser;
  },

  /**
   * User dhundho ya banao
   */
  findOrCreate: async (phone) => {
    let user = await userService.findByPhone(phone);

    if (user) {
      return { user, isNewUser: false };
    }

    user = await userService.createUser(phone);
    return { user, isNewUser: true };
  },

  /**
   * Profile update karo
   */
  updateProfile: async (userId, updates) => {
    const { name, email, profile_photo } = updates;

    await db.query(
      `UPDATE users
       SET name = COALESCE($1, name),
           email = COALESCE($2, email),
           profile_photo = COALESCE($3, profile_photo),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $4`,
      [name, email, profile_photo, userId]
    );

    const result = await db.query(
      'SELECT id, phone, name, email, profile_photo, city_id FROM users WHERE id = $1',
      [userId]
    );

    return result.rows[0];
  },
};

module.exports = userService;
