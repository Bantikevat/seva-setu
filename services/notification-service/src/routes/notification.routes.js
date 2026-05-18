const express = require('express');
const router = express.Router();
const controller = require('../controllers/notification.controller');
const push       = require('../controllers/push.controller');

// Internal API - no auth needed (called by other services)
router.post('/sms',           controller.sendSms);
router.post('/whatsapp',      controller.sendWhatsapp);
router.post('/template',      controller.sendTemplate);
router.post('/booking-event', controller.bookingEvent);

// FCM push notifications
router.post('/fcm/register',     push.register);
router.post('/fcm/unregister',   push.unregister);
router.post('/push',             push.send);
router.get( '/history',          push.history);
router.post('/history/:id/read', push.markRead);

module.exports = router;
