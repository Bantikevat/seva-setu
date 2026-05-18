/**
 * PUSH SERVICE — Token registry + notification logging + dispatch
 *
 * Token storage: `fcm_tokens` table in shared DB (lazy-created if missing)
 * Notification log: `notifications` table (already in schema)
 */

const sharedDb = require('../../../shared/db');
const fcm      = require('./fcm.service');
const logger   = require('../utils/logger');

// Ensure JSON DB has the fcm_tokens array (auto-init in JSON mode)
const ensureFcmTokens = async () => {
  if (sharedDb.USE_PG) return;
  const fs   = require('fs');
  const path = require('path');
  const dbPath = path.join(__dirname, '../../../auth-service/data/database.json');
  try {
    const db = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
    if (!db.fcm_tokens) {
      db.fcm_tokens = [];
      fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
    }
  } catch {}
};
ensureFcmTokens();

const pushService = {
  /**
   * Register / update FCM token for a user
   */
  registerToken: async ({ userId, userType, token, platform = 'web' }) => {
    if (!userId || !token) return { error: 'INVALID_PARAMS' };

    // Check if token already exists
    const existing = await sharedDb.findOne('fcm_tokens', { token });
    if (existing) {
      if (existing.user_id !== userId) {
        await sharedDb.update('fcm_tokens', { token }, { user_id: userId, user_type: userType, platform });
      }
      return { success: true, action: 'updated' };
    }

    await sharedDb.insert('fcm_tokens', {
      user_id:   userId,
      user_type: userType || 'user',
      token,
      platform,
    });
    return { success: true, action: 'created' };
  },

  /**
   * Remove a token (logout / token invalidated)
   */
  unregisterToken: async (token) => {
    const removed = await sharedDb.delete('fcm_tokens', { token });
    return { success: removed > 0 };
  },

  /**
   * Get all FCM tokens for a user (multi-device)
   */
  getTokensForUser: async (userId) => {
    const rows = await sharedDb.find('fcm_tokens', { user_id: userId });
    return rows.map((r) => r.token);
  },

  /**
   * Send push to a user (all their devices) + log to notifications table
   */
  sendToUser: async ({ userId, userType, title, body, data = {}, clickAction }) => {
    const tokens = await pushService.getTokensForUser(userId);

    // Always log the notification regardless of FCM
    await sharedDb.insert('notifications', {
      user_id:   userId,
      user_type: userType || 'user',
      title,
      body:      body || null,
      data:      sharedDb.USE_PG ? JSON.stringify(data) : data,
      fcm_token: tokens[0] || null,
      is_read:   false,
    });

    if (tokens.length === 0) {
      logger.debug(`No FCM tokens for user ${userId} — push skipped (logged in-app only)`);
      return { success: true, sentCount: 0, loggedOnly: true };
    }

    const res = await fcm.send(tokens, { title, body, data, click_action: clickAction });
    return { success: res.success, sentCount: tokens.length, fcm: res };
  },

  /**
   * Recent notifications history for a user
   */
  listForUser: async (userId, { limit = 50 } = {}) => {
    if (sharedDb.USE_PG) {
      const rows = await sharedDb.raw(
        'SELECT * FROM notifications WHERE user_id = $1 ORDER BY sent_at DESC LIMIT $2',
        [userId, limit]
      );
      return rows.map((r) => ({
        id: r.id, title: r.title, body: r.body, data: r.data, isRead: r.is_read, sentAt: r.sent_at,
      }));
    }
    const all = await sharedDb.find('notifications', { user_id: userId });
    all.sort((a, b) => new Date(b.sent_at) - new Date(a.sent_at));
    return all.slice(0, limit).map((r) => ({
      id: r.id, title: r.title, body: r.body, data: r.data, isRead: r.is_read, sentAt: r.sent_at,
    }));
  },

  /**
   * Mark notification as read
   */
  markRead: async (id, userId) => {
    const n = await sharedDb.findOne('notifications', { id });
    if (!n || n.user_id !== userId) return { error: 'NOT_FOUND' };
    await sharedDb.update('notifications', { id }, { is_read: true });
    return { success: true };
  },
};

module.exports = pushService;
