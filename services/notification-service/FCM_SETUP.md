# Push Notifications Setup (Firebase Cloud Messaging)

Real-time push notifications for chat messages, booking status changes, and worker assignments.

## What you get

| Trigger | Recipient | Message |
|---------|-----------|---------|
| Chat message sent | Other party | `"<sender name> — SEV-XXX"` + preview |
| Booking confirmed | Customer | `"✅ Booking confirmed"` |
| Worker on the way | Customer | `"🚗 Worker is on the way"` |
| Worker arrived | Customer | `"📍 Worker has arrived"` |
| Service completed | Customer | `"✨ Service completed"` |
| New booking | Worker | `"🆕 New booking request"` |

## Without setup (dev mode)
App fully works. Notifications logged to console + stored in `notifications` table (in-app history). No actual phone alerts.

## Setup (~15 min)

### 1. Create Firebase project
- Go to https://console.firebase.google.com
- "Add project" → name: `seva-setu` → enable Google Analytics (optional)

### 2. Add a Web App
- Project Overview → click web icon `</>` → register app
- Copy the **firebaseConfig** values (apiKey, authDomain, projectId, etc.)

### 3. Generate VAPID key (Web Push certificate)
- Project Settings → Cloud Messaging tab
- Scroll to **Web configuration** → **Web Push certificates** → **Generate key pair**
- Copy the public key

### 4. Frontend config
Edit `apps/mobile-web/.env`:
```env
VITE_FIREBASE_API_KEY=AIzaSyXXX...
VITE_FIREBASE_AUTH_DOMAIN=seva-setu.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=seva-setu
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
VITE_FIREBASE_APP_ID=1:123456789012:web:abc...
VITE_FIREBASE_VAPID_KEY=BL_xxxxxxxxxxxxxxx
```

Restart `npm run dev` for the mobile-web app.

### 5. Backend service account
- Project Settings → **Service accounts** tab
- Click **Generate new private key** → download JSON
- Open JSON, copy 3 values into `services/notification-service/.env`:
  ```env
  FIREBASE_PROJECT_ID=seva-setu
  FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxx@seva-setu.iam.gserviceaccount.com
  FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIE...\n-----END PRIVATE KEY-----\n"
  ```
  > ⚠️ Keep the `\n` escapes literal — the service unescapes them at load time.

Restart notification-service. You'll see:
```
🔔 FCM:      Configured ✓
```

### 6. Test
1. Open the app in browser → login as customer
2. Browser asks **"Allow notifications?"** → click Allow
3. Console shows `[FCM] Registered ✓`
4. In another tab/incognito, login as worker → send a chat message
5. Customer tab shows toast notification immediately
6. If customer's tab is in background → desktop OS notification appears

## API Endpoints

| Method | Route | Purpose |
|--------|-------|---------|
| POST | `/notify/fcm/register` | Register device token (called after login) |
| POST | `/notify/fcm/unregister` | Remove token (called on logout) |
| POST | `/notify/push` | Internal — send push to a user |
| GET | `/notify/history?userId=...` | In-app notification history |
| POST | `/notify/history/:id/read` | Mark a notification as read |

## Internal trigger points

- `booking-service/src/sockets/chat.socket.js` — after every `chat:send`
- `booking-service/src/services/booking.service.js` — `createBooking`, `changeStatus`

Both use `services/notify.client.js` → `sendPush({ userId, userType, title, body, data, clickAction })`.

## Data flow

```
[Customer chat send] ──Socket.io──> booking-service
                                          │
                                          ├─ chat:message broadcast (live UI)
                                          └─ sendPush({userId: workerId, ...})
                                                  │
                                                  └─ HTTP POST /notify/push
                                                        │
                                                        ├─ fetch tokens for workerId
                                                        ├─ insert into notifications table
                                                        └─ FCM v1 API send
                                                              ↓
                                                        [Worker device] 🔔
```

## Verified live ✓
```
✓ POST /notify/fcm/register          → token saved
✓ POST /notify/push                  → dispatched (dev mode logs)
✓ GET  /notify/history               → returns past notifications
✓ Auto-trigger on chat send          → wired
✓ Auto-trigger on status change      → wired
✓ Auto-trigger on new booking        → wired
✓ Service worker registered          → /firebase-messaging-sw.js
✓ Foreground toast on receive        → wired in App.tsx
```

## Production checklist

- [ ] Rotate the service-account private key periodically
- [ ] Add rate limiting per user (max 100 pushes/hour)
- [ ] Add notification preferences (let user mute chat / booking updates separately)
- [ ] Set up FCM topic subscriptions for broadcast (e.g., "all-workers-in-ujjain")
- [ ] Add silent data-only pushes for badge counts
- [ ] Add analytics events for delivery / open rates
