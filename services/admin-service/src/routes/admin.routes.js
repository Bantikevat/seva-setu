const express = require('express');
const router = express.Router();
const config = require('../config/env');
const c = require('../controllers/admin.controller');

// Simple admin auth — header: X-Admin-Pass
router.use((req, res, next) => {
  const pass = req.headers['x-admin-pass'];
  if (pass !== config.adminPassword) {
    return res.status(401).json({ success: false, message: 'Admin password galat hai' });
  }
  next();
});

// Dashboard
router.get('/dashboard',           c.dashboard);

// Users
router.get('/users',               c.listUsers);
router.put('/users/:id',           c.updateUser);

// Workers
router.get('/workers',             c.listWorkers);
router.put('/workers/:id/verify',  c.verifyWorker);
router.put('/workers/:id/toggle-active', c.toggleWorkerActive);

// Bookings
router.get('/bookings',            c.listBookings);

// Payments
router.get('/payments',            c.listPayments);

// Coupons
router.get('/coupons',             c.listCoupons);
router.post('/coupons',            c.createCoupon);
router.put('/coupons/:code/toggle', c.toggleCoupon);

module.exports = router;
