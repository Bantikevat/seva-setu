/**
 * CHAT SERVICE — Booking-scoped 1-on-1 messaging
 *
 * Each booking creates a chat thread between customer ↔ worker.
 * Message types: text | image | voice
 *
 * Storage: shared `chat_messages` table
 */

const sharedDb = require('../../../shared/db');
const logger   = require('../utils/logger');

const formatMessage = (m) => ({
  id:          m.id,
  bookingId:   m.booking_id,
  senderType:  m.sender_type,           // 'customer' | 'worker'
  senderId:    m.sender_id,
  messageType: m.message_type,          // 'text' | 'image' | 'voice'
  content:     m.content,
  mediaUrl:    m.media_url,
  isRead:      !!m.is_read,
  createdAt:   m.created_at,
});

const chatService = {
  /**
   * Check if user is participant of the booking thread
   * @returns 'customer' | 'worker' | null
   */
  participantRole: async (bookingId, userId) => {
    const booking = await sharedDb.findOne('bookings', { id: bookingId });
    if (!booking) return null;
    if (booking.customer_id === userId) return 'customer';
    if (booking.worker_id   === userId) return 'worker';
    return null;
  },

  /**
   * Send a message (persists to DB, returns formatted message)
   */
  send: async ({ bookingId, senderId, senderType, messageType = 'text', content, mediaUrl }) => {
    if (!['text', 'image', 'voice'].includes(messageType)) {
      return { error: 'INVALID_TYPE' };
    }
    if (messageType === 'text' && (!content || !content.trim())) {
      return { error: 'EMPTY_MESSAGE' };
    }
    if (['image', 'voice'].includes(messageType) && !mediaUrl) {
      return { error: 'MEDIA_REQUIRED' };
    }

    const message = await sharedDb.insert('chat_messages', {
      booking_id:   bookingId,
      sender_type:  senderType,
      sender_id:    senderId,
      message_type: messageType,
      content:      content?.trim() || null,
      media_url:    mediaUrl || null,
      is_read:      false,
    });

    return { message: formatMessage(message) };
  },

  /**
   * Get message history for a booking (oldest → newest)
   */
  history: async (bookingId, { limit = 100, before } = {}) => {
    if (sharedDb.USE_PG) {
      let sql = 'SELECT * FROM chat_messages WHERE booking_id = $1';
      const params = [bookingId];
      if (before) { sql += ' AND created_at < $2'; params.push(before); }
      sql += ' ORDER BY created_at DESC LIMIT $' + (params.length + 1);
      params.push(limit);
      const rows = await sharedDb.raw(sql, params);
      return rows.map(formatMessage).reverse();
    }
    let rows = await sharedDb.find('chat_messages', { booking_id: bookingId });
    if (before) rows = rows.filter((r) => new Date(r.created_at) < new Date(before));
    rows.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
    return rows.slice(-limit).map(formatMessage);
  },

  /**
   * Mark messages as read by recipient
   */
  markRead: async (bookingId, recipientType) => {
    // recipient reads messages from the OTHER party
    const senderType = recipientType === 'customer' ? 'worker' : 'customer';
    if (sharedDb.USE_PG) {
      const res = await sharedDb.raw(
        `UPDATE chat_messages SET is_read = true
         WHERE booking_id = $1 AND sender_type = $2 AND is_read = false
         RETURNING id`,
        [bookingId, senderType]
      );
      return res.length;
    }
    const rows = await sharedDb.find('chat_messages', { booking_id: bookingId, sender_type: senderType });
    let updated = 0;
    for (const r of rows) {
      if (!r.is_read) {
        await sharedDb.update('chat_messages', { id: r.id }, { is_read: true });
        updated++;
      }
    }
    return updated;
  },

  /**
   * Unread count for a user across all their bookings
   */
  unreadCount: async (userId, role) => {
    const bookings = await sharedDb.find('bookings', role === 'customer' ? { customer_id: userId } : { worker_id: userId });
    const otherType = role === 'customer' ? 'worker' : 'customer';
    let total = 0;
    for (const b of bookings) {
      const msgs = await sharedDb.find('chat_messages', { booking_id: b.id, sender_type: otherType });
      total += msgs.filter((m) => !m.is_read).length;
    }
    return total;
  },
};

module.exports = { ...chatService, formatMessage };
