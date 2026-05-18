/**
 * ADDRESS SERVICE
 * -------------------------------------------------
 * User ke address ki CRUD operations.
 *
 * CRUD = Create, Read, Update, Delete
 *
 * Important rules:
 * - Ek user ke multiple addresses ho sakte hain
 * - Sirf ek address default ho sakta hai
 * - Default address change pe baki sab false hote hain
 * - User apne hi addresses dekh/edit kar sakta hai (ownership check)
 */

const db     = require('../config/database');
const { v4: uuidv4 } = require('uuid');
const logger = require('../utils/logger');

const addressService = {
  /**
   * User ke saare addresses dekho
   *
   * @param {string} userId
   * @returns {Array} - Addresses list
   */
  getAll: async (userId) => {
    const addresses = await db.findAddressesByUserId(userId);

    // Default address pehle aaye
    return addresses
      .sort((a, b) => (b.is_default ? 1 : 0) - (a.is_default ? 1 : 0))
      .map((a) => ({
        id:          a.id,
        label:       a.label,
        fullAddress: a.full_address,
        latitude:    a.latitude,
        longitude:   a.longitude,
        cityId:      a.city_id,
        isDefault:   a.is_default,
        createdAt:   a.created_at,
      }));
  },

  /**
   * Naya address create karo
   *
   * @param {string} userId
   * @param {Object} data - { label, fullAddress, latitude, longitude, cityId }
   * @returns {Object} - Created address
   */
  create: async (userId, data) => {
    const existingAddresses = await db.findAddressesByUserId(userId);

    // Agar pehla address hai → automatically default banao
    const isFirstAddress = existingAddresses.length === 0;

    const newAddress = {
      id:           uuidv4(),
      user_id:      userId,
      label:        data.label || 'Home',
      full_address: data.fullAddress,
      latitude:     data.latitude,
      longitude:    data.longitude,
      city_id:      data.cityId || null,
      is_default:   isFirstAddress,
      created_at:   new Date().toISOString(),
      updated_at:   new Date().toISOString(),
    };

    await db.createAddress(newAddress);
    logger.info(`New address created for user: ${userId}`);

    return {
      id:          newAddress.id,
      label:       newAddress.label,
      fullAddress: newAddress.full_address,
      latitude:    newAddress.latitude,
      longitude:   newAddress.longitude,
      cityId:      newAddress.city_id,
      isDefault:   newAddress.is_default,
    };
  },

  /**
   * Address update karo
   *
   * @param {string} addressId
   * @param {string} userId  - Ownership check ke liye
   * @param {Object} updates
   * @returns {Object|null}
   */
  update: async (addressId, userId, updates) => {
    // Pehle check karo address user ka hi hai
    const address = await db.findAddressById(addressId);

    if (!address) return { error: 'NOT_FOUND' };
    if (address.user_id !== userId) return { error: 'FORBIDDEN' };

    // Snake_case mein convert karo
    const dbUpdates = {
      label:        updates.label,
      full_address: updates.fullAddress,
      latitude:     updates.latitude,
      longitude:    updates.longitude,
      city_id:      updates.cityId,
    };

    const updated = await db.updateAddress(addressId, dbUpdates);

    return {
      id:          updated.id,
      label:       updated.label,
      fullAddress: updated.full_address,
      latitude:    updated.latitude,
      longitude:   updated.longitude,
      cityId:      updated.city_id,
      isDefault:   updated.is_default,
    };
  },

  /**
   * Address delete karo
   *
   * @param {string} addressId
   * @param {string} userId - Ownership check
   * @returns {Object} - { success, error }
   */
  delete: async (addressId, userId) => {
    const address = await db.findAddressById(addressId);

    if (!address) return { error: 'NOT_FOUND' };
    if (address.user_id !== userId) return { error: 'FORBIDDEN' };

    const wasDefault = address.is_default;
    await db.deleteAddress(addressId);

    // Agar default address delete hua → kisi aur ko default banao
    if (wasDefault) {
      const remaining = await db.findAddressesByUserId(userId);
      if (remaining.length > 0) {
        await db.updateAddress(remaining[0].id, { is_default: true });
      }
    }

    logger.info(`Address deleted: ${addressId}`);
    return { success: true };
  },

  /**
   * Default address set karo
   *
   * @param {string} addressId
   * @param {string} userId
   * @returns {Object}
   */
  setDefault: async (addressId, userId) => {
    const address = await db.findAddressById(addressId);

    if (!address) return { error: 'NOT_FOUND' };
    if (address.user_id !== userId) return { error: 'FORBIDDEN' };

    // Pehle baki sab false karo
    await db.unsetAllDefaults(userId);

    // Phir is wale ko true karo
    await db.updateAddress(addressId, { is_default: true });

    logger.info(`Default address set: ${addressId}`);
    return { success: true };
  },
};

module.exports = addressService;
