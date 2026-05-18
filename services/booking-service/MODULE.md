# BOOKING MODULE — Complete Documentation
**Service:** booking-service
**Port:** 3004
**Status:** Module 4 of 8 — **THE CORE BUSINESS**
**Depends on:** Auth + User + Worker services

---

## YEH MODULE KYA KARTA HAI?

**Yeh app ka asli business hai!**

Customer worker book karta hai → Worker kaam karta hai → Payment hota hai

```
WITHOUT THIS MODULE = APP USELESS
WITH THIS MODULE    = ASLI STARTUP
```

---

## BOOKING LIFECYCLE — Status Flow

```
   ┌──────────┐
   │ PENDING  │  ← Customer created booking
   └─────┬────┘
         │ Worker accepts
   ┌─────▼─────┐
   │ CONFIRMED │  ← Worker confirmed
   └─────┬─────┘
         │ Worker on the way
   ┌─────▼────────┐
   │  ON_THE_WAY  │  ← Worker travel start
   └─────┬────────┘
         │ Worker arrived, work started
   ┌─────▼──────┐
   │IN_PROGRESS │  ← Kaam chal raha
   └─────┬──────┘
         │ Work done
   ┌─────▼──────┐
   │ COMPLETED  │  ← Done! Payment ready
   └────────────┘

   At any stage:
   ┌──────────┐
   │CANCELLED │ ← Customer/Worker cancel
   └──────────┘
```

---

## API ENDPOINTS

### Customer APIs (Auth required)
```
🔐 POST   /bookings                 → Create booking
🔐 GET    /bookings/my              → Mere bookings (customer)
🔐 GET    /bookings/:id             → Booking details
🔐 PUT    /bookings/:id/cancel      → Cancel karo
🔐 PUT    /bookings/:id/reschedule  → Time change karo
🔐 POST   /bookings/:id/rate        → Rating + review do
```

### Worker APIs (Auth required)
```
🔐 GET    /bookings/worker/jobs     → Mere kaam (worker)
🔐 PUT    /bookings/:id/accept      → Accept karo
🔐 PUT    /bookings/:id/reject      → Reject karo
🔐 PUT    /bookings/:id/start       → On the way / Arrived
🔐 PUT    /bookings/:id/complete    → Kaam pura ho gaya
```

---

## DATA MODEL

### Booking Object
```javascript
{
  id:             "uuid",
  booking_number: "SEV-2026-000001",   // Human readable

  // Who
  customer_id:    "uuid",  // User ID
  worker_id:      "uuid",  // Worker ID

  // What
  category_id:    "uuid",  // Service type
  category_name:  "Plumber",
  category_emoji: "🔧",

  // When
  scheduled_at:   "2026-05-15T10:00:00Z",
  started_at:     null,
  completed_at:   null,
  cancelled_at:   null,

  // Where
  address_id:     "uuid",
  full_address:   "123, Vijay Nagar, Jaipur",
  latitude:       26.9124,
  longitude:      75.7873,

  // Money
  base_price:     299,
  platform_fee:   30,
  total_amount:   329,
  worker_payout:  269,  // 90% of base
  payment_status: "pending",  // pending, paid, refunded

  // Status
  status:         "pending",
  cancellation_reason: null,
  cancelled_by:   null,  // 'customer' or 'worker'

  // Extras
  notes:          "Bathroom mein pipe leak hai",
  rating:         null,
  review:         null,

  created_at:     "2026-05-14T10:00:00Z",
  updated_at:     "2026-05-14T10:00:00Z"
}
```

---

## CREATING A BOOKING — Step by Step

```
1. Customer sends:
   POST /bookings
   {
     workerId,      // jo book karna hai
     categoryId,    // kaunsa service
     scheduledAt,   // kab chahiye
     addressId,     // kahan chahiye
     notes          // koi extra info
   }

2. Backend validates:
   ✅ Worker exists?
   ✅ Worker available?
   ✅ Category match karta hai worker se?
   ✅ Address user ka hai?
   ✅ Time future mein hai?

3. Backend calculates:
   - base_price = category.base_price
   - platform_fee = base_price * 0.10
   - worker_payout = base_price * 0.90
   - total_amount = base_price + platform_fee

4. Generate booking_number:
   - Format: SEV-{YEAR}-{6_DIGIT}
   - Example: SEV-2026-000001

5. Create booking, status = "pending"

6. Notify worker (future: push notification)

7. Return booking object
```

---

## PRICING FORMULA

```
base_price     = Category base price (e.g., ₹299 for Plumber)
platform_fee   = base_price × 10%        = ₹30
worker_payout  = base_price × 90%        = ₹269
total_amount   = base_price + platform_fee = ₹329

Yeh customer dega:    ₹329
Yeh worker ko milega:  ₹269
Tera profit:           ₹60  (₹30 platform + ₹30 from worker side)
```

---

## STATUS RULES — Who Can Change What

```
STATUS         CUSTOMER CAN      WORKER CAN
─────────────────────────────────────────────
pending        Cancel            Accept, Reject
confirmed      Cancel            Start
on_the_way     —                 Mark Arrived
in_progress    —                 Complete
completed      Rate              —
cancelled      —                 —
```

---

## SAMPLE ERROR CODES

```
BOOK_001 → Worker nahi mila
BOOK_002 → Worker available nahi hai
BOOK_003 → Time future mein hona chahiye
BOOK_004 → Address nahi mila
BOOK_005 → Booking nahi mili
BOOK_006 → Aap is booking ke owner nahi
BOOK_007 → Status change allowed nahi
BOOK_008 → Already cancelled
BOOK_009 → Rating 1-5 ke beech hona chahiye
```
