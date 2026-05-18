/**
 * CHAT ROUTES — mounted at /chat
 */

const express = require('express');
const router  = express.Router();
const controller     = require('../controllers/chat.controller');
const authMiddleware = require('../middleware/auth.middleware');

router.use(authMiddleware);

router.get( '/unread-count',         controller.unreadCount);
router.get( '/:bookingId/history',   controller.history);
router.post('/:bookingId/send',      controller.send);

module.exports = router;
