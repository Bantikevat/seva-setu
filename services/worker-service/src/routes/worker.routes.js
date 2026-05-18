/**
 * WORKER ROUTES
 */

const express = require('express');
const router  = express.Router();
const controller     = require('../controllers/worker.controller');
const authMiddleware = require('../middleware/auth.middleware');
const validator      = require('../validators/worker.validator');

// ─── PUBLIC ───
router.get('/categories',        controller.getCategories);
router.get('/search',            controller.search);

// ─── WORKER SELF (Protected — BEFORE /:id routes) ───
router.post('/register',         authMiddleware, validator.validateRegister, controller.register);
router.get('/me',                authMiddleware, controller.getMyProfile);
router.put('/me',                authMiddleware, controller.updateMyProfile);
router.put('/me/availability',   authMiddleware, controller.toggleAvailability);
router.post('/me/skills',        authMiddleware, validator.validateSkill, controller.addSkill);
router.delete('/me/skills/:id',  authMiddleware, controller.removeSkill);
router.get('/me/schedule',       authMiddleware, controller.getSchedule);
router.put('/me/schedule',       authMiddleware, controller.updateSchedule);

// ─── PUBLIC (Worker ID routes — LAST so they don't match /me) ───
router.get('/:id',               controller.getProfile);
router.get('/:id/reviews',       controller.getReviews);

module.exports = router;
