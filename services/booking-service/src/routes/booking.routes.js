/**
 * BOOKING ROUTES
 */

const express = require('express');
const router  = express.Router();
const controller     = require('../controllers/booking.controller');
const authMiddleware = require('../middleware/auth.middleware');
const validator      = require('../validators/booking.validator');

// All routes require auth
router.use(authMiddleware);

// ─── COUPONS ───
router.get('/coupons',          controller.listCoupons);
router.post('/apply-coupon',    controller.applyCoupon);

// ─── CUSTOMER ENDPOINTS ───
router.post(  '/',                    validator.validateCreate, controller.create);
router.get(   '/my',                  controller.getMyBookings);

// ─── WORKER ENDPOINTS ───
// (worker/jobs MUST be before /:id to not conflict)
router.get(   '/worker/jobs',         controller.getWorkerJobs);

// Worker status transitions
router.put(   '/:id/accept',          controller.changeStatus('confirmed'));
router.put(   '/:id/reject',          controller.changeStatus('rejected'));
router.put(   '/:id/start',           controller.changeStatus('on_the_way'));
router.put(   '/:id/arrived',         controller.changeStatus('in_progress'));
router.put(   '/:id/complete',        controller.changeStatus('completed'));

// ─── COMMON (Customer + Worker) ───
router.put(   '/:id/cancel',          controller.cancel);
router.put(   '/:id/reschedule',      controller.reschedule);
router.post(  '/:id/rate',            validator.validateRating, controller.rate);

// ─── DETAILS (must be LAST) ───
router.get(   '/:id',                 controller.getById);

module.exports = router;
