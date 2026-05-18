# AI MODULE — The Smart Brain
**Service:** ai-service  
**Port:** 3007  
**Status:** Module 8 of 8 — **FINAL MODULE**

---

## YEH MODULE KYA KARTA HAI?

App ko **smart** banata hai — har user ke liye personalized.

```
✨ Smart Worker Matching       (best worker auto-suggest)
✨ Recommendations             (kya book karna chahiye)
✨ Demand Forecasting          (peak times predict)
✨ Fraud Detection             (suspicious bookings flag)
✨ Pricing Optimization        (dynamic pricing)
✨ Chat Bot                    (customer support)
```

---

## API ENDPOINTS

```
🟢 POST /ai/recommend-workers    → Best workers for me
🟢 POST /ai/recommend-services   → Aaj kya book karein
🟢 POST /ai/predict-price        → Smart pricing
🟢 POST /ai/fraud-check          → Booking fraud check
🟢 POST /ai/chat                 → Customer support bot
🟢 GET  /ai/insights/:userId     → User insights
```

---

## DEV MODE

Production mein **Claude API** integrate hoga.
Abhi smart heuristics se demo karenge:

```javascript
// DEV: Simple rule-based smart logic
// PROD: Real ML models + Claude API
```
