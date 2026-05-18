# NOTIFICATION MODULE
**Service:** notification-service
**Port:** 3005
**Status:** Module 6 of 8

---

## YEH MODULE KYA KARTA HAI?

Sab tarah ke messages bhejta hai:
- 📱 **SMS**     — OTP, booking confirmations
- 💬 **WhatsApp** — Order updates (cheaper than SMS)
- 🔔 **Push**    — In-app notifications
- 📧 **Email**   — Receipts, reports

```
Booking pending  → Worker ko notification: "Naya kaam mila"
Worker accepts  → Customer: "Rajesh accept kiya"
On the way      → Customer: "Worker 15 min mein"
Completed       → Customer: "Kaam done — review do"
```

---

## API ENDPOINTS

```
POST /notify/sms       → SMS bhejo
POST /notify/whatsapp  → WhatsApp bhejo
POST /notify/push      → Push notification
POST /notify/email     → Email bhejo

POST /notify/booking-event   → All channels at once
GET  /notify/history/:userId → User ki history
```

---

## TEMPLATES SYSTEM

Templates use karte hain — variable replace ho jaata hai:

```javascript
'booking_created' → "Booking confirmed! {{workerName}} {{time}} pe aayega."
'worker_assigned' → "{{workerName}} ne aapka kaam accept kiya. Phone: {{phone}}"
'on_the_way'      → "{{workerName}} aapke ghar aa raha hai. ETA: {{eta}}"
'completed'       → "Kaam pura ho gaya. Please review {{workerName}}."
```

---

## DEV MODE

Development mein **real SMS nahi bhejte** — paise bachao!

```
DEV:        Console mein print karo
PRODUCTION: Real provider (MSG91, WhatsApp Business API)
```
