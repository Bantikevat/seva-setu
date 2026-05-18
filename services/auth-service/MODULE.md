# AUTH MODULE — Complete Documentation
**Service:** auth-service  
**Port:** 3001  
**Status:** Module 1 of 8

---

## YEH MODULE KYA KARTA HAI?

Auth module poori app ka DARWAZA hai.
Koi bhi user ya worker bina is module ke app use nahi kar sakta.

```
USER → Phone number deta hai
     → OTP aata hai SMS pe
     → OTP verify karta hai
     → JWT Token milta hai
     → Ab poori app use kar sakta hai
```

---

## IS MODULE MEIN KYA KYA HAI?

```
auth-service/
├── src/
│   ├── config/
│   │   ├── database.js      ← PostgreSQL se connection
│   │   ├── redis.js         ← Redis se connection (OTP store)
│   │   └── env.js           ← Environment variables validate
│   │
│   ├── utils/
│   │   ├── response.js      ← Har API ka ek jaisa response format
│   │   └── logger.js        ← Console mein sahi se log karo
│   │
│   ├── validators/
│   │   └── auth.validator.js ← Phone number sahi hai? OTP sahi format?
│   │
│   ├── services/
│   │   ├── otp.service.js   ← OTP banao, bhejo, verify karo
│   │   ├── jwt.service.js   ← Token banao, verify karo
│   │   └── user.service.js  ← Database mein user dhundho ya banao
│   │
│   ├── middleware/
│   │   └── auth.middleware.js ← Token sahi hai ya nahi check karo
│   │
│   ├── controllers/
│   │   └── auth.controller.js ← Request lo, service bulao, response do
│   │
│   ├── routes/
│   │   └── auth.routes.js   ← Konsi URL pe kaunsa controller
│   │
│   └── index.js             ← Server start karo
│
├── tests/
│   ├── otp.service.test.js  ← OTP service ke tests
│   ├── jwt.service.test.js  ← JWT service ke tests
│   └── auth.routes.test.js  ← API endpoints ke tests
│
├── package.json
├── .env.example
└── MODULE.md                ← YEH FILE
```

---

## API ENDPOINTS

| Method | URL | Kya karta hai |
|--------|-----|---------------|
| POST | /auth/send-otp | Phone pe OTP bhejo |
| POST | /auth/verify-otp | OTP verify karo, token do |
| POST | /auth/refresh-token | Purana token se naya lo |
| POST | /auth/logout | Token band karo |
| GET | /auth/me | Mera profile dekho |
| GET | /health | Service chal rahi hai? |

---

## DATA FLOW — REQUEST KA SAFAR

```
1. User POST /auth/send-otp { phone: "9876543210" }
       ↓
2. Validator check karta hai — phone 10 digit hai?
       ↓
3. Controller → OTP Service ko bulata hai
       ↓
4. OTP Service:
   - 6 digit random OTP banata hai
   - Redis mein save karta hai (5 min ke liye)
   - MSG91 se SMS bhejta hai
       ↓
5. Response: { success: true, message: "OTP sent" }

---

6. User POST /auth/verify-otp { phone: "9876543210", otp: "123456" }
       ↓
7. Validator check karta hai
       ↓
8. OTP Service Redis se OTP nikalta hai, compare karta hai
       ↓
9. User Service — User DB mein hai? Nahi hai toh naya banao
       ↓
10. JWT Service — Token banao
       ↓
11. Response: { success: true, token: "eyJ...", user: {...} }
```

---

## ERROR CODES

| Code | Matlab |
|------|--------|
| AUTH_001 | Phone number invalid |
| AUTH_002 | OTP send karne mein problem |
| AUTH_003 | OTP galat hai |
| AUTH_004 | OTP expire ho gaya |
| AUTH_005 | Token invalid |
| AUTH_006 | Token expire ho gaya |
| AUTH_007 | User nahi mila |

---

## TESTING KAISE KAREIN

```bash
# Service start karo
cd services/auth-service
npm run dev

# OTP bhejo (Postman ya curl)
curl -X POST http://localhost:3001/auth/send-otp \
  -H "Content-Type: application/json" \
  -d '{"phone": "9876543210"}'

# OTP verify karo
curl -X POST http://localhost:3001/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{"phone": "9876543210", "otp": "1234"}'

# Automated tests chalao
npm test
```

---

## SECURITY RULES

```
✅ OTP sirf 5 minute valid hoga
✅ 3 baar galat OTP → account 15 min ke liye band
✅ JWT token 7 din valid
✅ Har token ka unique ID hoga (Redis mein)
✅ Logout pe token immediately band hoga
✅ Phone number kabhi logs mein print nahi hoga
✅ OTP kabhi response mein nahi aayega (production)
```
