/**
 * WORKER VALIDATOR
 */

const response = require('../utils/response');

module.exports = {
  validateRegister: (req, res, next) => {
    const { phone, name } = req.body;

    if (!phone || !/^[6-9]\d{9}$/.test(phone)) {
      return response.error(res, 'Valid 10-digit Indian phone number daalo', 'WRK_001');
    }

    if (!name || name.trim().length < 2) {
      return response.error(res, 'Naam kam se kam 2 letter ka hona chahiye', 'WRK_002');
    }

    if (req.body.latitude !== undefined &&
        (req.body.latitude < -90 || req.body.latitude > 90)) {
      return response.error(res, 'Latitude galat hai', 'WRK_003');
    }

    next();
  },

  validateSkill: (req, res, next) => {
    const { categoryId } = req.body;

    if (!categoryId) {
      return response.error(res, 'Category ID zaroori hai', 'WRK_004');
    }

    if (req.body.experienceYears !== undefined &&
        (req.body.experienceYears < 0 || req.body.experienceYears > 60)) {
      return response.error(res, 'Experience 0-60 years ke beech', 'WRK_005');
    }

    next();
  },
};
