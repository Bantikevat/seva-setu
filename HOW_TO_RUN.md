# SEVA SETU — LOCAL MEIN KAISE CHALAO

**Sabse Simple Guide — 3 Steps**

---

## STEP 1 — START KARO

```
👉 Project folder kholo: C:\Claude\idea
👉 START.bat file pe double-click karo
```

Yeh hoga:
- 2 windows khulengi (Auth + User services)
- Console mein dikhega "Auth Service running on port 3001"
- Console mein dikhega "User Service running on port 3002"

**Yeh windows BAND mat karna — services chalne ke liye chahiye!**

---

## STEP 2 — TEST KARO

### Easy Way — TEST.bat
```
👉 TEST.bat file pe double-click
```

JSON dikhe — services live hain.

### Browser Se
Browser kholo aur yeh 2 URLs check karo:

```
http://localhost:3001/health
http://localhost:3002/health
```

Dono pe yeh dikhna chahiye:
```json
{ "status": "ok", "service": "auth-service" }
```

---

## STEP 3 — STOP KARO

Kaam ho jaaye to:

```
👉 STOP.bat file pe double-click karo
```

Saari services band ho jayengi.

---

## API TEST — Postman Ya Browser Se

### Pehla OTP Bhejne Ke Liye

**Postman:**
```
POST http://localhost:3001/auth/send-otp
Content-Type: application/json

Body:
{
  "phone": "9876543210"
}
```

**Response:**
```json
{
  "success": true,
  "message": "OTP 98XXXXXXXX pe bhej diya gaya"
}
```

### OTP Dekho Kahan?

OTP terminal mein dikhega (Auth Service wali window mein):
```
[DEV MODE] OTP for 9876543210: 123456
```

### OTP Verify Karo

```
POST http://localhost:3001/auth/verify-otp
Content-Type: application/json

Body:
{
  "phone": "9876543210",
  "otp": "123456"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "token": "eyJ...",
    "user": { ... }
  }
}
```

Token copy kar lo — protected APIs ke liye chahiye.

---

## PROBLEMS — Solutions

### Problem 1: "Port already in use" error
```
👉 STOP.bat double-click karo pehle
👉 Phir START.bat chalao
```

### Problem 2: Windows automatically band ho gayi
Iska matlab service crash hua. Windows ko **manually open** karke chalao:

```
cmd open karo aur yeh chalao:

cd C:\Claude\idea\services\auth-service
node src/index.js
```

Error dikhega — woh mujhe bhej de.

### Problem 3: "node not found" error
Matlab Node.js installed nahi hai. Yahan se install karo:
```
https://nodejs.org/
LTS version download karo
```

### Problem 4: Phone galat aa raha hai
Phone 10 digit ka hona chahiye aur 6/7/8/9 se shuru:
```
✅ Sahi:  9876543210
❌ Galat: 1234567890
❌ Galat: 98765432
```

---

## DAILY USE — Roz Kya Karna

```
Subah:
1. START.bat double-click
2. Code likho

Raat ko:
1. STOP.bat double-click
2. Computer band karo
```

**Bas itna hi.** 

---

## QUICK COMMAND REFERENCE

```
START.bat   →  Saari services chalu karo
STOP.bat    →  Saari services band karo
TEST.bat    →  Services live hain check karo
```

---

**Bhai, kuch bhi problem ho — bata. Solution dunga.** 🚀
