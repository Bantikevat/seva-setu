/**
 * NOTIFY CLIENT — Calls notification service
 */

const logger = require('../utils/logger');

const NOTIFY_URL = 'http://localhost:3005';

const notifyBookingEvent = async (booking, event, customerPhone, workerPhone) => {
  try {
    // Use fetch (Node 18+) — simpler than http module
    const res = await fetch(`${NOTIFY_URL}/notify/booking-event`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ booking, event, customerPhone, workerPhone }),
    });

    if (res.ok) {
      logger.debug(`Notification sent: ${event} for ${booking.bookingNumber}`);
    }
  } catch (err) {
    // Silent fail — booking flow nahi rukni chahiye
    logger.debug(`Notification skipped: ${err.message}`);
  }
};

/**
 * Send push notification to a user (FCM via notification-service)
 *
 * @param {object} args
 * @param {string} args.userId
 * @param {'user'|'worker'} args.userType
 * @param {string} args.title
 * @param {string} [args.body]
 * @param {object} [args.data]      Custom data (strings only — gets JSON-stringified)
 * @param {string} [args.clickAction]  URL to open on tap
 */
const sendPush = async ({ userId, userType, title, body, data, clickAction }) => {
  try {
    const res = await fetch(`${NOTIFY_URL}/notify/push`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, userType, title, body, data, clickAction }),
    });
    if (res.ok) logger.debug(`Push sent to ${userId}: ${title}`);
  } catch (err) {
    logger.debug(`Push skipped: ${err.message}`);
  }
};

module.exports = { notifyBookingEvent, sendPush };
