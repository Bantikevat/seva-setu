# In-App Chat Feature

Real-time 1-on-1 messaging between **customer ↔ worker**, scoped per booking.

## Architecture

```
[ChatScreen] ──websocket──> [booking-service:3004]
                                    │
                                    ├─ HTTP REST  (history, send fallback, unread count)
                                    └─ Socket.io  (live messages, typing, read receipts)
                                            │
                                            └──> chat_messages table (shared DB)
```

## REST Endpoints (auth required)

```
GET  /chat/:bookingId/history       → returns up to 100 oldest→newest messages + role
POST /chat/:bookingId/send          → fallback when socket down
GET  /chat/unread-count             → total unread across user's bookings
```

## Socket.io Events

Connect with JWT in `auth.token`:
```js
const socket = io('http://localhost:3004', { auth: { token } });
```

### Client → Server
| Event | Payload | Effect |
|-------|---------|--------|
| `chat:join` | `{ bookingId }` | Joins booking room (auth check) |
| `chat:send` | `{ bookingId, messageType: 'text'\|'image'\|'voice', content?, mediaUrl? }` | Persists + broadcasts |
| `chat:typing` | `{ bookingId, isTyping }` | Broadcasts to other party |
| `chat:read` | `{ bookingId }` | Marks other party's unread as read |

### Server → Client
| Event | Payload | When |
|-------|---------|------|
| `chat:joined` | `{ bookingId, role }` | After successful join |
| `chat:message` | `<full message>` | On send (broadcast to room) |
| `chat:typing` | `{ senderType, isTyping }` | Other party started/stopped typing |
| `chat:read` | `{ byType, count }` | Other party read your messages |
| `chat:error` | `{ code, message }` | Permission denied or invalid input |

## Message Types

| Type | Content field | MediaUrl field |
|------|---------------|----------------|
| `text` | text content | null |
| `image` | optional caption | Cloudinary CDN URL |
| `voice` | null | inline data URL (audio/webm), capped 800KB |

> ⚠️ **Voice notes** are currently stored as base64 data URLs. For production-scale, add a dedicated Cloudinary `video/upload` endpoint with `resource_type: 'video'` (it supports audio too).

## Frontend Components

| File | Purpose |
|------|---------|
| `hooks/useChat.ts` | Socket lifecycle + state |
| `screens/ChatScreen.tsx` | Full UI: header, bubbles, input, voice recorder, lightbox |
| `services/api.ts` (chat namespace) | REST endpoints |

### Route
```
/chat/:bookingId  →  ChatScreen
```

Entry: tap the **MessageCircle** icon on `BookingDetailScreen` header (shown only for active bookings).

## Verified live ✓
```
✓ GET  /chat/:id/history   → 200 OK (role detected)
✓ POST /chat/:id/send      → message persisted, broadcasts
✓ WebSocket auth via JWT   → works in handshake
✓ Auto-fallback to REST    → if socket unavailable
```

## Test flow

1. Login as customer A (`9876543210`)
2. Open a booking → tap the chat icon
3. In another tab/browser, login as worker (`9000000001`) → open same booking → chat icon
4. Send text → instantly appears on the other side
5. Type → "typing..." indicator on other side
6. Send image → Cloudinary CDN URL, lightbox on tap
7. Hold mic → voice note → playback inline

## Production checklist

- [ ] Move voice notes to Cloudinary `video/upload`
- [ ] Add server-side rate limiting (10 msg/min)
- [ ] Add message deletion (soft delete with `deleted_at`)
- [ ] Add typing indicator debouncing (already 3s server-side)
- [ ] Add push notification when message arrives offline (Phase 6)
