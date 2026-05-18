/**
 * USER VALIDATOR
 * -------------------------------------------------
 * User aur address inputs ko validate karta hai.
 */

const response = require('../utils/response');

const userValidator = {
  /**
   * Profile update validate karo
   */
  validateUpdateProfile: (req, res, next) => {
    const { name, email } = req.body;

    if (name !== undefined && (typeof name !== 'string' || name.trim().length < 2)) {
      return response.error(res, 'Naam kam se kam 2 letter ka hona chahiye', 'USR_001');
    }

    if (email !== undefined && email !== null && email !== '') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return response.error(res, 'Email galat hai', 'USR_002');
      }
    }

    next();
  },

  /**
   * Address create validate karo
   */
  validateCreateAddress: (req, res, next) => {
    const { label, fullAddress, latitude, longitude } = req.body;

    if (!fullAddress || fullAddress.trim().length < 10) {
      return response.error(res, 'Address kam se kam 10 letter ka hona chahiye', 'USR_003');
    }

    if (latitude !== undefined && (latitude < -90 || latitude > 90)) {
      return response.error(res, 'Latitude galat hai', 'USR_004');
    }

    if (longitude !== undefined && (longitude < -180 || longitude > 180)) {
      return response.error(res, 'Longitude galat hai', 'USR_005');
    }

    if (label !== undefined && label.length > 50) {
      return response.error(res, 'Label 50 letter se kam hona chahiye', 'USR_006');
    }

    next();
  },

  /**
   * Address ID validate karo (URL params mein)
   */
  validateAddressId: (req, res, next) => {
    const { id } = req.params;

    if (!id || id.length < 10) {
      return response.error(res, 'Address ID galat hai', 'USR_007');
    }

    next();
  },
};

module.exports = userValidator;
