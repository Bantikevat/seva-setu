const express = require('express');
const router = express.Router();
const controller = require('../controllers/payment.controller');
const authMiddleware = require('../middleware/auth.middleware');

router.use(authMiddleware);

// Customer
router.post('/order',          controller.createOrder);
router.post('/verify',         controller.verifyPayment);
router.get('/history',         controller.getHistory);
router.post('/:id/refund',     controller.refund);

// Worker (must be before /:id)
router.get('/worker/earnings', controller.getWorkerEarnings);

// Customer (LAST so /:id doesn't catch others)
router.get('/:id',             controller.getById);

module.exports = router;
