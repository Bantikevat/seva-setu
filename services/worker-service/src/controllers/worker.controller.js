/**
 * WORKER CONTROLLER
 * -------------------------------------------------
 * HTTP requests → service calls → responses
 */

const workerService = require('../services/worker.service');
const response = require('../utils/response');
const logger   = require('../utils/logger');
const db       = require('../config/database');

const defaultSchedule = () => ({
  mon: { active: true,  start: '09:00', end: '18:00' },
  tue: { active: true,  start: '09:00', end: '18:00' },
  wed: { active: true,  start: '09:00', end: '18:00' },
  thu: { active: true,  start: '09:00', end: '18:00' },
  fri: { active: true,  start: '09:00', end: '18:00' },
  sat: { active: false, start: '10:00', end: '14:00' },
  sun: { active: false, start: '10:00', end: '14:00' },
});

const workerController = {
  // ─────────────────────────────────────────
  //  PUBLIC ENDPOINTS
  // ─────────────────────────────────────────

  /**
   * GET /workers/categories
   */
  getCategories: async (req, res) => {
    try {
      const categories = await workerService.getAllCategories();
      return response.success(res, 'Categories mile', { categories, count: categories.length });
    } catch (error) {
      logger.error('getCategories error:', error.message);
      return response.serverError(res);
    }
  },

  /**
   * GET /workers/search?category=plumber&sort=rating&lat=&lng=
   */
  search: async (req, res) => {
    try {
      const {
        category,
        minRating,
        available,
        verified,
        maxPrice,
        sort,
        lat,
        lng,
      } = req.query;

      const filters = {
        category,
        minRating: minRating ? parseFloat(minRating) : null,
        available: available === 'true',
        verified:  verified  === 'true',
        maxPrice:  maxPrice  ? parseFloat(maxPrice) : null,
      };

      const userLocation = {
        lat: lat ? parseFloat(lat) : null,
        lng: lng ? parseFloat(lng) : null,
      };

      const result = await workerService.search(filters, userLocation, sort || 'rating');
      return response.success(res, `${result.count} workers mile`, result);
    } catch (error) {
      logger.error('search error:', error.message);
      return response.serverError(res);
    }
  },

  /**
   * GET /workers/:id
   */
  getProfile: async (req, res) => {
    try {
      const profile = await workerService.getWorkerProfile(req.params.id);
      if (!profile) return response.notFound(res, 'Worker nahi mila');
      return response.success(res, 'Worker profile mila', profile);
    } catch (error) {
      logger.error('getProfile error:', error.message);
      return response.serverError(res);
    }
  },

  /**
   * GET /workers/:id/reviews
   */
  getReviews: async (req, res) => {
    try {
      const worker = db.findWorkerById(req.params.id);
      if (!worker) return response.notFound(res, 'Worker nahi mila');

      const reviews = db.getWorkerReviews(req.params.id);
      return response.success(res, 'Reviews mile', { reviews, count: reviews.length });
    } catch (error) {
      logger.error('getReviews error:', error.message);
      return response.serverError(res);
    }
  },

  // ─────────────────────────────────────────
  //  WORKER SELF (PROTECTED)
  // ─────────────────────────────────────────

  /**
   * POST /workers/register
   * Logged-in user → worker bana
   */
  register: async (req, res) => {
    try {
      const data = {
        phone:     req.user.phone,
        name:      req.body.name,
        bio:       req.body.bio,
        latitude:  req.body.latitude,
        longitude: req.body.longitude,
        cityId:    req.body.cityId,
      };

      const result = await workerService.register(data);

      if (result.error === 'PHONE_EXISTS') {
        return response.error(res, 'Yeh phone se worker pehle se hai', 'WRK_006', 409);
      }

      return response.success(res, 'Worker registration safal! Admin verify karega.', result.worker, 201);
    } catch (error) {
      logger.error('register error:', error.message);
      return response.serverError(res);
    }
  },

  /**
   * GET /workers/me
   */
  getMyProfile: async (req, res) => {
    try {
      const worker = db.findWorkerByPhone(req.user.phone);
      if (!worker) return response.notFound(res, 'Aap worker nahi hain. Pehle register karo.');

      const profile = await workerService.getWorkerProfile(worker.id);
      return response.success(res, 'Profile mila', profile);
    } catch (error) {
      logger.error('getMyProfile error:', error.message);
      return response.serverError(res);
    }
  },

  /**
   * PUT /workers/me
   */
  updateMyProfile: async (req, res) => {
    try {
      const worker = db.findWorkerByPhone(req.user.phone);
      if (!worker) return response.notFound(res, 'Worker nahi mila');

      const updated = await workerService.updateProfile(worker.id, req.body);
      return response.success(res, 'Profile update ho gaya', updated);
    } catch (error) {
      logger.error('updateMyProfile error:', error.message);
      return response.serverError(res);
    }
  },

  /**
   * PUT /workers/me/availability
   * Body: { isAvailable: true/false }
   */
  toggleAvailability: async (req, res) => {
    try {
      const worker = db.findWorkerByPhone(req.user.phone);
      if (!worker) return response.notFound(res, 'Worker nahi mila');

      const result = await workerService.toggleAvailability(worker.id, req.body.isAvailable);
      return response.success(
        res,
        result.isAvailable ? 'Aap available hain' : 'Aap busy hain',
        result
      );
    } catch (error) {
      logger.error('toggleAvailability error:', error.message);
      return response.serverError(res);
    }
  },

  /**
   * POST /workers/me/skills
   */
  addSkill: async (req, res) => {
    try {
      const worker = db.findWorkerByPhone(req.user.phone);
      if (!worker) return response.notFound(res, 'Worker nahi mila');

      const { categoryId, experienceYears, isPrimary } = req.body;
      const result = await workerService.addSkill(worker.id, categoryId, experienceYears, isPrimary);

      if (result.error === 'CATEGORY_NOT_FOUND') {
        return response.error(res, 'Category nahi mili', 'WRK_007');
      }
      if (result.error === 'SKILL_EXISTS') {
        return response.error(res, 'Yeh skill pehle se hai', 'WRK_008');
      }

      return response.success(res, 'Skill add ho gayi', result.skill, 201);
    } catch (error) {
      logger.error('addSkill error:', error.message);
      return response.serverError(res);
    }
  },

  /**
   * GET /workers/me/schedule
   */
  getSchedule: async (req, res) => {
    try {
      const worker = db.findWorkerByPhone(req.user.phone);
      if (!worker) return response.notFound(res, 'Worker nahi mila');
      return response.success(res, 'Schedule mila', {
        schedule: worker.availability_schedule || defaultSchedule(),
      });
    } catch (error) {
      logger.error('getSchedule error:', error.message);
      return response.serverError(res);
    }
  },

  /**
   * PUT /workers/me/schedule
   * Body: { schedule: { mon: { active, start, end }, ... } }
   */
  updateSchedule: async (req, res) => {
    try {
      const worker = db.findWorkerByPhone(req.user.phone);
      if (!worker) return response.notFound(res, 'Worker nahi mila');
      const updated = db.updateWorker(worker.id, { availability_schedule: req.body.schedule });
      return response.success(res, 'Schedule save ho gaya!', {
        schedule: updated.availability_schedule,
      });
    } catch (error) {
      logger.error('updateSchedule error:', error.message);
      return response.serverError(res);
    }
  },

  /**
   * DELETE /workers/me/skills/:id
   */
  removeSkill: async (req, res) => {
    try {
      const worker = db.findWorkerByPhone(req.user.phone);
      if (!worker) return response.notFound(res, 'Worker nahi mila');

      const result = await workerService.removeSkill(worker.id, req.params.id);

      if (result.error === 'NOT_FOUND')  return response.notFound(res, 'Skill nahi mili');
      if (result.error === 'FORBIDDEN')  return response.forbidden(res, 'Yeh aapki skill nahi');

      return response.success(res, 'Skill hata di');
    } catch (error) {
      logger.error('removeSkill error:', error.message);
      return response.serverError(res);
    }
  },
};

module.exports = workerController;
