/**
 * SOCKET.IO — Real-time chat
 *
 * Events:
 *   ── client → server ──
 *   chat:join         { bookingId }
 *   chat:send         { bookingId, messageType, content?, mediaUrl? }
 *   chat:typing       { bookingId, isTyping }
 *   chat:read         { bookingId }
 *
 *   ── server → client ──
 *   chat:message      <full message object>
 *   chat:typing       { senderType, isTyping }
 *   chat:read         { byType, count }
 *   chat:error        { code, message }
 *
 * Rooms: every booking has a room `booking:<bookingId>`.
 * Only participants (customer + worker) join the room.
 */

const jwt          = require('jsonwebtoken');
const config       = require('../config/env');
const chatService  = require('../services/chat.service');
const { sendPush } = require('../services/notify.client');
const sharedDb     = require('../../../shared/db');
const logger       = require('../utils/logger');

const attachChat = (io) => {
  // Authentication middleware — JWT in handshake
  io.use((socket, next) => {
    const token =
      socket.handshake.auth?.token ||
      socket.handshake.headers?.authorization?.replace('Bearer ', '');
    if (!token) return next(new Error('no token'));

    try {
      const decoded = jwt.verify(token, config.jwtSecret);
      socket.userId = decoded.userId;
      socket.phone  = decoded.phone;
      next();
    } catch (err) {
      next(new Error('invalid token'));
    }
  });

  io.on('connection', (socket) => {
    logger.debug(`socket connect ${socket.id} (user ${socket.userId})`);

    // ── Join booking room ──────────────────────────────
    socket.on('chat:join', async ({ bookingId }) => {
      try {
        const role = await chatService.participantRole(bookingId, socket.userId);
        if (!role) {
          socket.emit('chat:error', { code: 'NOT_PARTICIPANT', message: 'Aap is chat ke part nahi hai' });
          return;
        }
        socket.join(`booking:${bookingId}`);
        socket.data.bookingId = bookingId;
        socket.data.role      = role;
        socket.emit('chat:joined', { bookingId, role });
        logger.debug(`user ${socket.userId} joined booking:${bookingId} as ${role}`);
      } catch (err) {
        socket.emit('chat:error', { code: 'JOIN_FAILED', message: err.message });
      }
    });

    // ── Send a message ─────────────────────────────────
    socket.on('chat:send', async (payload) => {
      try {
        const { bookingId, messageType = 'text', content, mediaUrl } = payload || {};
        const role = await chatService.participantRole(bookingId, socket.userId);
        if (!role) {
          socket.emit('chat:error', { code: 'NOT_PARTICIPANT' });
          return;
        }

        const result = await chatService.send({
          bookingId,
          senderId:    socket.userId,
          senderType:  role,
          messageType,
          content,
          mediaUrl,
        });
        if (result.error) {
          socket.emit('chat:error', { code: result.error });
          return;
        }

        // Broadcast to everyone in the room (including sender for confirmation)
        io.to(`booking:${bookingId}`).emit('chat:message', result.message);

        // Push notification to the OTHER party (fire-and-forget)
        try {
          const booking = await sharedDb.findOne('bookings', { id: bookingId });
          if (booking) {
            const recipientId = role === 'customer' ? booking.worker_id : booking.customer_id;
            const recipientType = role === 'customer' ? 'worker' : 'user';
            const senderName = role === 'customer' ? 'Customer' : booking.worker_name;
            const preview = messageType === 'text' ? (content || '').slice(0, 100) :
                            messageType === 'image' ? '📷 Photo' :
                            messageType === 'voice' ? '🎤 Voice note' : 'New message';
            sendPush({
              userId:      recipientId,
              userType:    recipientType,
              title:       `${senderName} — ${booking.booking_number}`,
              body:        preview,
              data:        { bookingId, type: 'chat' },
              clickAction: `/chat/${bookingId}`,
            });
          }
        } catch {}
      } catch (err) {
        logger.error('chat:send error:', err.message);
        socket.emit('chat:error', { code: 'SEND_FAILED', message: err.message });
      }
    });

    // ── Typing indicator ───────────────────────────────
    socket.on('chat:typing', ({ bookingId, isTyping }) => {
      if (!socket.data.role || socket.data.bookingId !== bookingId) return;
      socket.to(`booking:${bookingId}`).emit('chat:typing', {
        senderType: socket.data.role,
        isTyping:   !!isTyping,
      });
    });

    // ── Read receipt ───────────────────────────────────
    socket.on('chat:read', async ({ bookingId }) => {
      try {
        if (!socket.data.role || socket.data.bookingId !== bookingId) return;
        const count = await chatService.markRead(bookingId, socket.data.role);
        if (count > 0) {
          socket.to(`booking:${bookingId}`).emit('chat:read', {
            byType: socket.data.role,
            count,
          });
        }
      } catch (err) {
        logger.error('chat:read error:', err.message);
      }
    });

    // ═══ TRACKING — worker live location ═══

    /**
     * Worker pings their location. We:
     *   1. Verify they are the worker on this booking
     *   2. Save to worker_locations table (history)
     *   3. Broadcast to room as 'tracking:location' for customer
     */
    socket.on('tracking:update', async ({ bookingId, latitude, longitude }) => {
      try {
        if (typeof latitude !== 'number' || typeof longitude !== 'number') return;
        const sharedDb = require('../../../shared/db');
        const role = await chatService.participantRole(bookingId, socket.userId);
        if (role !== 'worker') {
          socket.emit('tracking:error', { code: 'NOT_WORKER' });
          return;
        }

        // Persist location ping (for history / ETA calc later)
        await sharedDb.insert('worker_locations', {
          worker_id:   socket.userId,
          booking_id:  bookingId,
          latitude,
          longitude,
          recorded_at: new Date().toISOString(),
        });

        // Live update worker.latitude / .longitude (current position)
        await sharedDb.update('workers', { id: socket.userId }, { latitude, longitude });

        const payload = {
          bookingId,
          latitude,
          longitude,
          timestamp: new Date().toISOString(),
        };

        // Broadcast to room (customer receives)
        io.to(`booking:${bookingId}`).emit('tracking:location', payload);
      } catch (err) {
        logger.error('tracking:update error:', err.message);
      }
    });

    socket.on('disconnect', () => {
      logger.debug(`socket disconnect ${socket.id}`);
    });
  });
};

module.exports = attachChat;
