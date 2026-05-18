/**
 * REVIEW ROUTES — mounted at /reviews
 */

const express = require('express');
const router  = express.Router();
const controller     = require('../controllers/review.controller');
const authMiddleware = require('../middleware/auth.middleware');

// Public-ish: viewing reviews + summary needs auth (any logged-in user)
router.get('/worker/:workerId',         authMiddleware, controller.listForWorker);
router.get('/worker/:workerId/summary', authMiddleware, controller.workerSummary);

// Actions
router.post('/:id/helpful',             authMiddleware, controller.markHelpful);
router.post('/:id/reply',               authMiddleware, controller.workerReply);

module.exports = router;
