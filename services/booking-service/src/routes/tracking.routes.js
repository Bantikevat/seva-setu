/**
 * TRACKING ROUTES — mounted at /tracking
 */

const express = require('express');
const router  = express.Router();
const controller     = require('../controllers/tracking.controller');
const authMiddleware = require('../middleware/auth.middleware');

router.use(authMiddleware);

router.get('/:bookingId/latest', controller.latest);
router.get('/:bookingId/trail',  controller.trail);

module.exports = router;
