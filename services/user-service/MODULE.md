# USER MODULE — Complete Documentation
**Service:** user-service  
**Port:** 3002  
**Status:** Module 2 of 8  
**Depends on:** auth-service (JWT verification)

---

## YEH MODULE KYA KARTA HAI?

Auth module ne user banaya — sirf phone aur ID.
**User module se woh user app use karta hai:**

```
User module = "Profile + Address" manager

Use cases:
- Apna naam, email, photo set karo
- Ghar ka address add karo
- Office ka address add karo  
- Kaunsa address default hai woh batao
- Address edit karo
- Address delete karo
```

---

## API ENDPOINTS

```
🟢 GET    /users/me              → Mera profile dekho
🟢 PUT    /users/me              → Profile update karo

🟢 GET    /users/addresses       → Mere saare addresses
🟢 POST   /users/addresses       → Naya address add karo
🟢 PUT    /users/addresses/:id   → Address update karo
🟢 DELETE /users/addresses/:id   → Address delete karo
🟢 PUT    /users/addresses/:id/default → Yeh address default banao
```

**Saare endpoints PROTECTED hain — JWT token chahiye.**

---

## FOLDER STRUCTURE

```
user-service/
├── src/
│   ├── config/
│   │   ├── database.js     ← Same JSON DB (shared with auth)
│   │   └── env.js
│   ├── utils/
│   │   ├── logger.js
│   │   └── response.js
│   ├── validators/
│   │   └── user.validator.js
│   ├── services/
│   │   ├── user.service.js     ← Profile DB operations
│   │   └── address.service.js  ← Address DB operations
│   ├── middleware/
│   │   └── auth.middleware.js  ← JWT verify (auth se copy)
│   ├── controllers/
│   │   └── user.controller.js
│   ├── routes/
│   │   └── user.routes.js
│   └── index.js
├── package.json
└── MODULE.md
```

---

## DATA FLOW EXAMPLE — Address Add Karna

```
1. User login hai → JWT token hai
2. POST /users/addresses
   Headers: Authorization: Bearer <token>
   Body: {
     "label": "Ghar",
     "fullAddress": "123, Vijay Nagar, Jaipur",
     "latitude": 26.9124,
     "longitude": 75.7873
   }
        ↓
3. auth.middleware → Token verify → req.user set
        ↓
4. user.validator → Address sahi format mein hai?
        ↓
5. controller → address.service.create() bulao
        ↓
6. address.service → DB mein save karo
        ↓
7. Response: { success: true, data: { address... } }
```

---

## SHARED CODE STRATEGY

User module mein bahut sa code Auth se same hai:
- logger.js
- response.js  
- env.js
- auth.middleware.js
- database.js (same JSON file)

**Future Plan:** `packages/shared` mein move karenge yeh sab.  
**Abhi:** Copy karke kaam chala lenge — simple rakh.
