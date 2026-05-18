# PAYMENT MODULE
**Service:** payment-service
**Port:** 3006
**Status:** Module 7 of 8 — **MONEY = LIFEBLOOD**

---

## YEH MODULE KYA KARTA HAI?

```
Customer paisa deta hai → Yeh module handle karta hai → Worker ko paisa milta hai
```

**Bina payment ke startup nahi chalti.**

---

## PAYMENT FLOW — Step by Step

```
1. Customer booking confirm karta hai (₹329)
        ↓
2. Frontend → Payment Service ko bolta hai "order banao"
        ↓
3. Payment Service → Razorpay pe order create karta hai
        ↓
4. Customer Razorpay popup mein UPI/Card daalta hai
        ↓
5. Razorpay → Payment success ka signal deta hai
        ↓
6. Payment Service → Signature verify karta hai (security)
        ↓
7. Booking status update: payment_status = 'paid'
        ↓
8. Worker payout queue mein add hota hai (weekly settle)
        ↓
9. Notification jaata hai: "Payment received ₹329"
```

---

## API ENDPOINTS

### Customer
```
🔐 POST /payments/order            → Razorpay order banao
🔐 POST /payments/verify           → Payment verify karo
🔐 GET  /payments/history          → Mere payments
🔐 GET  /payments/:id              → Payment details
🔐 POST /payments/:id/refund       → Refund mango
```

### Worker
```
🔐 GET  /payments/worker/earnings  → Total earnings
🔐 GET  /payments/worker/payouts   → Payout history
🔐 GET  /payments/worker/pending   → Pending amount
```

### Admin (Future)
```
🔒 POST /admin/payouts/process     → Process weekly payouts
🔒 GET  /admin/payments/all        → All transactions
```

---

## DATA MODEL — Payment Object

```javascript
{
  id:                   "uuid",
  booking_id:           "uuid",
  customer_id:          "uuid",
  worker_id:            "uuid",

  // Razorpay fields
  razorpay_order_id:    "order_xxx",
  razorpay_payment_id:  "pay_xxx",
  razorpay_signature:   "abc123...",

  // Money
  amount:               329,
  base_amount:          299,
  platform_fee:         30,
  worker_payout:        269,
  currency:             "INR",

  // Status
  status:               "pending",
  // pending, processing, captured, failed, refunded
  payment_method:       "upi",
  // upi, card, netbanking, wallet, cash

  // Refund
  refund_amount:        null,
  refund_reason:        null,
  refunded_at:          null,

  created_at:           "...",
  captured_at:          "..."
}
```

## DATA MODEL — Worker Payout

```javascript
{
  id:              "uuid",
  worker_id:       "uuid",
  amount:          269,
  status:          "pending",  // pending, processing, paid
  bookings:        ["booking_id_1", "booking_id_2"],
  upi_id:          "rajesh@paytm",
  bank_account:    null,
  scheduled_for:   "next Monday",
  paid_at:         null
}
```

---

## DEV MODE — Real Money Save

```
DEV:
- "Razorpay" simulate karta hai
- Order ID dummy generate hota hai
- Verify automatically pass ho jaata hai
- Console mein log

PRODUCTION:
- Real Razorpay API
- Real signature verification
- Real UPI/Card processing
```

---

## SIGNATURE VERIFICATION (Production)

Razorpay sends a signature — hum HMAC verify karte hain:

```javascript
const expectedSig = crypto
  .createHmac('sha256', RAZORPAY_KEY_SECRET)
  .update(order_id + '|' + payment_id)
  .digest('hex');

if (expectedSig === received_signature) {
  // Payment is genuine
}
```

---

## REVENUE MODEL

```
Customer pays:     ₹329
├── Razorpay fee:  ₹6.50 (2%)
├── Worker gets:   ₹269 (82%)
└── Tera profit:   ₹53.50 (16%)

100 bookings/day = ₹5,350/day profit
                = ₹1,60,500/month
                = ₹19+ LAKH/year
```
