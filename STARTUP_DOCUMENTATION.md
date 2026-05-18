# SEVA SETU — Complete Startup Documentation
### "Bharat Ka Apna Services Super App"
**Version:** 1.0  
**Date:** 2026-05-13  
**Status:** MVP Planning Phase

---

## TABLE OF CONTENTS
1. [Project Vision](#1-project-vision)
2. [Business Model](#2-business-model)
3. [Complete Module List](#3-complete-module-list)
4. [City Expansion Plan](#4-city-expansion-plan)
5. [MNC-Level Folder Structure](#5-mnc-level-folder-structure)
6. [Database Schema](#6-database-schema)
7. [API Architecture](#7-api-architecture)
8. [Tech Stack Final](#8-tech-stack-final)
9. [Phase-wise Roadmap](#9-phase-wise-roadmap)
10. [Team Structure (Future)](#10-team-structure-future)

---

## 1. PROJECT VISION

### Problem Statement
India ka unorganized services sector = $500 BILLION+
Lekin koi ek trusted, verified platform nahi hai jahan:
- Plumber, electrician, carpenter, maid, cook, tutor
- Sab ek jagah milein — verified, rated, insured

### Solution
**SEVA SETU** — Ek super app jahan har ghar ki zaroorat poori ho.
- 60 minute mein worker aaye
- Background verified
- Fixed price, no bargaining
- UPI payment, digital receipt

### Vision 2030
> "India ke har sheher mein, har ghar mein — SEVA SETU ka naam ho.
>  Jaise Google for search, SEVA SETU for home services."

### Target Market
- **Primary:** Tier 2 & Tier 3 cities (completely untouched)
- **Secondary:** Tier 1 cities premium segment
- **Users:** Working couples, elderly, NRI families, housing societies

---

## 2. BUSINESS MODEL

### Revenue Streams
```
1. Commission Model     →  Har booking pe 20-25% cut
2. Worker Subscription  →  ₹299/month verified badge
3. Premium Listing      →  Worker featured placement ₹99/month
4. B2B Contracts        →  Housing societies monthly AMC
5. Insurance Upsell     →  Work guarantee insurance ₹49/booking
6. Ads                  →  Hardware shops, material suppliers advertise
```

### Unit Economics (Per Booking)
```
Average booking value    = ₹500
Platform commission 20%  = ₹100
Payment gateway fee 2%   = ₹10
SMS/Notification cost    = ₹2
NET PROFIT per booking   = ₹88

Target: 100 bookings/day = ₹8,800/day = ₹2,64,000/month
```

---

## 3. COMPLETE MODULE LIST

### PHASE 1 — MVP (Ek City, Core Services)
Yeh modules pehle banao. Baki baad mein.

```
MODULE 1: AUTH MODULE
├── User Registration (Phone + OTP)
├── Worker Registration
├── Admin Login
├── JWT Token Management
└── Session Handling

MODULE 2: USER MODULE
├── Profile Management
├── Address Management (Multiple addresses)
├── Booking History
├── Reviews & Ratings
└── Wallet / Credits

MODULE 3: WORKER MODULE
├── Worker Profile
├── Skills & Categories
├── Availability Management (Calendar)
├── Earnings Dashboard
├── Document Upload (Aadhaar, Photo)
└── Background Verification Status

MODULE 4: BOOKING MODULE  ← CORE MODULE
├── Service Category Browse
├── Worker Search (by location + skill)
├── Real-time Worker Availability
├── Booking Creation
├── Booking Confirmation (SMS + Push)
├── Live Tracking
├── Booking Completion
├── Cancellation & Refund
└── Reschedule

MODULE 5: PAYMENT MODULE
├── Razorpay Integration
├── UPI Payment
├── Cash on Service option
├── Invoice Generation (PDF)
├── Refund Management
└── Worker Payout (weekly)

MODULE 6: NOTIFICATION MODULE
├── SMS Notifications (booking confirm, OTP)
├── Push Notifications (app)
├── WhatsApp Updates
└── Email Receipts

MODULE 7: ADMIN PANEL MODULE
├── Dashboard (bookings, revenue, workers)
├── Worker Verification & Approval
├── Booking Management
├── Dispute Resolution
├── Payout Management
└── Reports & Analytics
```

---

### PHASE 2 — Growth (3-6 Months)

```
MODULE 8: SEARCH & DISCOVERY
├── Elasticsearch Integration
├── Filter by: price, rating, distance, availability
├── Voice Search (Hindi support)
└── Nearby Workers Map View

MODULE 9: REVIEW & TRUST MODULE
├── Post-service Rating (1-5 stars)
├── Photo Upload (before/after work)
├── Worker Response to Reviews
├── Verified Review Badge
└── Report Fake Review

MODULE 10: SUBSCRIPTION MODULE
├── Monthly Home Care Plans
├── Annual AMC (Annual Maintenance Contract)
├── Society Bulk Plans
└── Corporate Plans

MODULE 11: REFERRAL & LOYALTY
├── Refer a Friend (₹100 credit)
├── Worker Referral Program
├── Loyalty Points System
└── Streak Rewards

MODULE 12: WORKER TRAINING MODULE
├── Video Training Content
├── Skill Tests & Certification
├── Safety Guidelines
└── App Usage Training
```

---

### PHASE 3 — Scale (6-18 Months)

```
MODULE 13: AI MODULE
├── Smart Worker Matching (ML)
├── Price Prediction
├── Demand Forecasting
├── Fraud Detection
├── AI Customer Support Bot
└── Worker Performance Scoring

MODULE 14: MULTI-CITY MODULE
├── City Onboarding System
├── City Manager Dashboard
├── Local Pricing Configuration
├── City-wise Analytics
└── Franchise Management

MODULE 15: B2B MODULE
├── Housing Society Portal
├── Corporate Account
├── Bulk Booking API
├── Monthly Invoice
└── Dedicated Account Manager

MODULE 16: INSURANCE MODULE
├── Work Quality Guarantee
├── Worker Accident Insurance
├── Property Damage Coverage
└── Claim Management

MODULE 17: ANALYTICS & BI MODULE
├── Real-time Dashboard
├── Revenue Reports
├── Worker Performance Reports
├── City-wise Growth Reports
└── Investor Reports (MIS)
```

---

## 4. CITY EXPANSION PLAN

### Strategy: "Nail it, then Scale it"
Ek city mein perfect karo, phir agla sheher.

---

### PHASE 1 — ONE CITY (Month 1-6)
```
Target: Apna hometown / nearest Tier-2 city
Goal:   500 bookings/month
Team:   Sirf TU (founder)

Kya karein:
✅ 50 workers onboard karo (manually WhatsApp se)
✅ 3 categories sirf: Plumber, Electrician, Carpenter
✅ WhatsApp se booking lena shuru karo
✅ Google Form = Booking form (free)
✅ Paise: Cash on service, phir UPI
✅ Har worker ko personally train karo
✅ Har customer se personally baat karo

Success Metrics:
- 100 bookings complete
- 4.0+ average rating
- 20 repeat customers
- ₹50,000+ monthly GMV
```

---

### PHASE 2 — CITY 2 & 3 (Month 6-12)
```
Target: 2 nearby cities
Goal:   2000 bookings/month total
Team:   1 city manager per city (local hire)

Kya karein:
✅ App properly launch karo (MVP ready hoga tab tak)
✅ City Manager hire karo (₹15,000-20,000/month)
✅ Worker count: 100+ per city
✅ Categories expand: + Maid, Cook, Beautician
✅ Razorpay full integration
✅ Basic marketing: Facebook/Instagram ads

Success Metrics:
- 2000 bookings/month
- ₹10 lakh monthly GMV
- 200+ active workers
- First ₹1 lakh revenue month
```

---

### PHASE 3 — STATE LEVEL (Month 12-24)
```
Target: 10 cities in 1 state
Goal:   20,000 bookings/month
Team:   State Head + City Managers

Fundraise: ₹50 lakh - 1 crore (Angel round)
Kaise: 2000 bookings data dikhao investor ko

Kya karein:
✅ Full tech team hire karo
✅ All 10+ service categories
✅ AI matching system
✅ B2B housing society contracts
✅ PR & media coverage

Success Metrics:
- ₹1 crore monthly GMV
- Seed funding closed
- 1000+ active workers
```

---

### PHASE 4 — NATIONAL (Year 2-4)
```
Target: 50 cities across India
Goal:   5 lakh bookings/month
Funding: Series A ₹20-50 crore

Tab hoga:
- Full tech team (50+ engineers)
- Marketing team
- Ops team per city
- Franchise model
- IPO planning start (Year 5-7)
```

---

### City Priority List (Suggested)
```
Tier 2 cities to target first:
1.  Jaipur, Rajasthan        (30 lakh population)
2.  Lucknow, UP              (35 lakh population)
3.  Indore, MP               (35 lakh population)
4.  Bhopal, MP               (25 lakh population)
5.  Nagpur, Maharashtra      (30 lakh population)
6.  Surat, Gujarat           (60 lakh population)
7.  Patna, Bihar             (25 lakh population)
8.  Coimbatore, Tamil Nadu   (22 lakh population)
9.  Visakhapatnam, AP        (22 lakh population)
10. Chandigarh               (12 lakh population)
```

---

## 5. MNC-LEVEL FOLDER STRUCTURE

### Monorepo Structure (Sab ek jagah)
```
seva-setu/
├── apps/
│   ├── mobile/              # React Native App
│   │   ├── src/
│   │   │   ├── screens/     # All screens
│   │   │   ├── components/  # Reusable UI components
│   │   │   ├── navigation/  # App navigation
│   │   │   ├── hooks/       # Custom hooks
│   │   │   ├── store/       # State management (Zustand)
│   │   │   ├── services/    # API calls
│   │   │   ├── utils/       # Helper functions
│   │   │   └── assets/      # Images, fonts
│   │   └── package.json
│   │
│   ├── web/                 # Next.js Web App
│   │   ├── src/
│   │   │   ├── app/         # Next.js 15 App Router
│   │   │   ├── components/
│   │   │   ├── hooks/
│   │   │   ├── lib/
│   │   │   └── styles/
│   │   └── package.json
│   │
│   └── admin/               # Admin Dashboard
│       ├── src/
│       │   ├── pages/
│       │   ├── components/
│       │   └── api/
│       └── package.json
│
├── services/                # Backend Microservices
│   ├── auth-service/        # Login, OTP, JWT
│   │   ├── src/
│   │   │   ├── controllers/
│   │   │   ├── models/
│   │   │   ├── routes/
│   │   │   ├── middleware/
│   │   │   └── utils/
│   │   ├── Dockerfile
│   │   └── package.json
│   │
│   ├── user-service/        # User management
│   ├── worker-service/      # Worker management
│   ├── booking-service/     # Core booking logic
│   ├── payment-service/     # Razorpay, payouts
│   ├── notification-service/# SMS, push, WhatsApp
│   ├── search-service/      # Elasticsearch
│   ├── analytics-service/   # Reports, BI
│   └── ai-service/          # ML models, AI features
│
├── packages/                # Shared code
│   ├── ui/                  # Shared UI components
│   ├── types/               # TypeScript types
│   ├── utils/               # Shared utilities
│   ├── constants/           # App constants
│   └── config/              # Shared config
│
├── infrastructure/          # DevOps
│   ├── docker/
│   │   └── docker-compose.yml
│   ├── kubernetes/
│   │   ├── deployments/
│   │   └── services/
│   └── terraform/           # AWS infrastructure as code
│
├── docs/                    # Documentation
│   ├── api/                 # API docs
│   ├── architecture/        # System design docs
│   └── runbooks/            # Operations guides
│
├── scripts/                 # Utility scripts
├── .github/
│   └── workflows/           # CI/CD pipelines
├── package.json             # Root package.json
└── README.md
```

---

## 6. DATABASE SCHEMA

### Core Tables

```sql
-- USERS TABLE
CREATE TABLE users (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phone           VARCHAR(10) UNIQUE NOT NULL,
    name            VARCHAR(100),
    email           VARCHAR(100),
    profile_photo   TEXT,
    city_id         UUID REFERENCES cities(id),
    is_active       BOOLEAN DEFAULT true,
    created_at      TIMESTAMP DEFAULT NOW(),
    updated_at      TIMESTAMP DEFAULT NOW()
);

-- WORKERS TABLE
CREATE TABLE workers (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phone               VARCHAR(10) UNIQUE NOT NULL,
    name                VARCHAR(100) NOT NULL,
    profile_photo       TEXT,
    aadhaar_number      VARCHAR(12),
    city_id             UUID REFERENCES cities(id),
    is_verified         BOOLEAN DEFAULT false,
    is_available        BOOLEAN DEFAULT true,
    rating_average      DECIMAL(3,2) DEFAULT 0,
    total_jobs          INTEGER DEFAULT 0,
    account_number      VARCHAR(20),
    ifsc_code           VARCHAR(11),
    created_at          TIMESTAMP DEFAULT NOW()
);

-- WORKER SKILLS TABLE
CREATE TABLE worker_skills (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    worker_id       UUID REFERENCES workers(id),
    category_id     UUID REFERENCES categories(id),
    experience_years INTEGER,
    is_primary      BOOLEAN DEFAULT false
);

-- CATEGORIES TABLE
CREATE TABLE categories (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name        VARCHAR(100) NOT NULL,   -- "Plumber"
    name_hindi  VARCHAR(100),            -- "नल वाला"
    icon        TEXT,
    base_price  DECIMAL(10,2),
    is_active   BOOLEAN DEFAULT true
);

-- BOOKINGS TABLE (Most Important)
CREATE TABLE bookings (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_number  VARCHAR(20) UNIQUE NOT NULL,  -- SEV-2026-000001
    user_id         UUID REFERENCES users(id),
    worker_id       UUID REFERENCES workers(id),
    category_id     UUID REFERENCES categories(id),
    status          VARCHAR(20) DEFAULT 'pending',
    -- Status: pending → confirmed → worker_assigned →
    --         in_progress → completed → cancelled
    address_id      UUID REFERENCES addresses(id),
    scheduled_at    TIMESTAMP NOT NULL,
    started_at      TIMESTAMP,
    completed_at    TIMESTAMP,
    amount          DECIMAL(10,2),
    platform_fee    DECIMAL(10,2),
    worker_payout   DECIMAL(10,2),
    notes           TEXT,
    city_id         UUID REFERENCES cities(id),
    created_at      TIMESTAMP DEFAULT NOW()
);

-- PAYMENTS TABLE
CREATE TABLE payments (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id          UUID REFERENCES bookings(id),
    razorpay_order_id   VARCHAR(100),
    razorpay_payment_id VARCHAR(100),
    amount              DECIMAL(10,2),
    status              VARCHAR(20),  -- pending, success, failed, refunded
    payment_method      VARCHAR(20),  -- upi, card, cash
    created_at          TIMESTAMP DEFAULT NOW()
);

-- REVIEWS TABLE
CREATE TABLE reviews (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id  UUID REFERENCES bookings(id) UNIQUE,
    user_id     UUID REFERENCES users(id),
    worker_id   UUID REFERENCES workers(id),
    rating      INTEGER CHECK (rating BETWEEN 1 AND 5),
    comment     TEXT,
    photos      TEXT[],
    created_at  TIMESTAMP DEFAULT NOW()
);

-- CITIES TABLE
CREATE TABLE cities (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name        VARCHAR(100) NOT NULL,
    state       VARCHAR(100),
    is_active   BOOLEAN DEFAULT false,   -- false jab tak launch nahi hua
    launched_at TIMESTAMP
);

-- ADDRESSES TABLE
CREATE TABLE addresses (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID REFERENCES users(id),
    label       VARCHAR(50),    -- "Home", "Office"
    full_address TEXT,
    latitude    DECIMAL(10,8),
    longitude   DECIMAL(11,8),
    city_id     UUID REFERENCES cities(id),
    is_default  BOOLEAN DEFAULT false
);
```

---

## 7. API ARCHITECTURE

### API Design Rules (REST + JSON)
```
Base URL: https://api.sevasetu.in/v1/

Authentication: Bearer JWT Token in header
Rate Limiting: 100 requests/minute per user
Response Format:
{
  "success": true,
  "data": { ... },
  "message": "Booking confirmed",
  "timestamp": "2026-05-13T10:00:00Z"
}
```

### Core API Endpoints

```
AUTH SERVICE
POST   /auth/send-otp          # Phone pe OTP bhejo
POST   /auth/verify-otp        # OTP verify karo, JWT do
POST   /auth/refresh-token     # Token refresh
POST   /auth/logout

USER SERVICE
GET    /users/me               # Mera profile
PUT    /users/me               # Profile update
POST   /users/addresses        # Address add karo
GET    /users/addresses        # Mere addresses
DELETE /users/addresses/:id    # Address delete

WORKER SERVICE
GET    /workers/search         # ?city=jaipur&category=plumber&lat=&lng=
GET    /workers/:id            # Worker profile
GET    /workers/:id/reviews    # Worker ke reviews
POST   /workers/register       # Worker registration
PUT    /workers/availability   # Available/busy toggle

BOOKING SERVICE
POST   /bookings               # Naya booking banao
GET    /bookings               # Meri bookings list
GET    /bookings/:id           # Booking details
PUT    /bookings/:id/cancel    # Cancel karo
PUT    /bookings/:id/complete  # Complete mark karo
POST   /bookings/:id/review    # Review do

PAYMENT SERVICE
POST   /payments/create-order  # Razorpay order banao
POST   /payments/verify        # Payment verify karo
GET    /payments/:bookingId    # Payment status

CATEGORIES SERVICE
GET    /categories             # Sab categories
GET    /categories/:id/workers # Is category ke workers
```

---

## 8. TECH STACK FINAL

```
════════════════════════════════════════════════════
            SEVA SETU — FINAL TECH STACK
════════════════════════════════════════════════════

FRONTEND & MOBILE
├── Mobile App      →  React Native 0.74+ (TypeScript)
├── Web App         →  Next.js 15 (TypeScript)
├── Admin Panel     →  Next.js + shadcn/ui
├── State Mgmt      →  Zustand (simple, powerful)
└── UI Library      →  NativeWind (mobile), Tailwind (web)

BACKEND SERVICES
├── Primary         →  Node.js + Express (TypeScript)
├── AI/ML Service   →  Python + FastAPI
├── Real-time       →  Socket.io (live tracking)
└── API Gateway     →  Kong (baad mein scale pe)

DATABASES
├── Main DB         →  PostgreSQL 16
├── Cache           →  Redis 7
├── Search          →  Elasticsearch 8
└── Analytics       →  ClickHouse

CLOUD & INFRA (AWS)
├── Compute         →  EC2 (MVP), ECS (scale pe)
├── Database        →  RDS PostgreSQL
├── Cache           →  ElastiCache Redis
├── Storage         →  S3 (photos, documents)
├── CDN             →  CloudFront
└── DNS             →  Route53

DEVOPS
├── Container       →  Docker
├── Orchestration   →  Kubernetes (EKS) — scale pe
├── CI/CD           →  GitHub Actions
├── Monitoring      →  Grafana + Prometheus
└── Logs            →  CloudWatch

THIRD-PARTY INTEGRATIONS
├── Payment         →  Razorpay
├── SMS             →  Twilio / MSG91
├── Maps            →  Google Maps API
├── Push Notify     →  Firebase FCM
├── WhatsApp        →  WhatsApp Business API
├── Email           →  SendGrid
├── AI              →  Claude API (Anthropic)
├── Video KYC       →  HyperVerge / Digilocker
└── Face Match      →  AWS Rekognition

════════════════════════════════════════════════════
```

---

## 9. PHASE-WISE ROADMAP

```
MONTH 1-2: FOUNDATION
├── ✅ Idea validation (50 WhatsApp surveys)
├── ✅ 20 workers manually onboard
├── ✅ WhatsApp booking system (free)
├── ✅ First 10 bookings manually handle
└── ✅ DB schema design final

MONTH 2-4: MVP DEVELOPMENT
├── Auth service (OTP login)
├── Basic booking flow
├── Worker app (React Native)
├── User app (React Native)
├── Razorpay payment integration
├── SMS notifications
└── Basic admin panel

MONTH 4-6: LAUNCH
├── Beta test with 100 users
├── Bug fixes
├── 50 verified workers ready
├── Official app launch
├── Instagram/Facebook marketing
└── Target: 500 bookings

MONTH 6-12: GROWTH
├── 3 cities launch
├── All major service categories
├── Review system
├── Referral program
├── ₹1 crore GMV milestone
└── Angel funding raise

YEAR 2: SCALE
├── 10 cities
├── AI matching system
├── B2B segment
├── Series A funding
└── 50,000 bookings/month

YEAR 3-5: DOMINANCE
├── 50+ cities
├── IPO planning
├── International expansion (SE Asia)
└── Unicorn status target
```

---

## 10. TEAM STRUCTURE (FUTURE)

### Year 1 — Founder Solo
```
YOU (Founder + Developer + Everything)
```

### Year 1-2 — First Hires (After first revenue)
```
CTO / Co-founder (if needed)     — Equity share
1 City Manager                   — ₹15,000-20,000/month
1 Customer Support               — ₹10,000-12,000/month
1 Sales (Worker Onboarding)      — ₹12,000 + incentive
```

### Year 2-3 — After Seed Funding
```
Engineering (5 people)
├── Backend Engineer x2
├── Frontend/Mobile x2
└── DevOps x1

Product (2 people)
├── Product Manager x1
└── UI/UX Designer x1

Operations (3 people/city)
├── City Manager x1
├── Worker Relations x1
└── Customer Support x1

Marketing (2 people)
├── Digital Marketing x1
└── Content Creator x1
```

---

## QUICK START COMMANDS

```bash
# Repository setup
git clone https://github.com/yourusername/seva-setu
cd seva-setu

# Install dependencies
npm install

# Database setup
docker-compose up -d postgres redis

# Run migrations
npm run db:migrate

# Start development
npm run dev

# Start mobile app
cd apps/mobile
npx expo start

# Start backend
cd services/auth-service
npm run dev
```

---

## ENVIRONMENT VARIABLES (.env)

```env
# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/sevasetu
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=your-super-secret-key-here
JWT_EXPIRES_IN=7d

# Razorpay
RAZORPAY_KEY_ID=rzp_test_xxxxx
RAZORPAY_KEY_SECRET=xxxxx

# Firebase
FIREBASE_SERVER_KEY=xxxxx

# Google Maps
GOOGLE_MAPS_API_KEY=xxxxx

# SMS (MSG91)
MSG91_AUTH_KEY=xxxxx
MSG91_SENDER_ID=SEVSTU

# AWS
AWS_ACCESS_KEY_ID=xxxxx
AWS_SECRET_ACCESS_KEY=xxxxx
AWS_REGION=ap-south-1
AWS_S3_BUCKET=seva-setu-uploads

# Claude AI
ANTHROPIC_API_KEY=xxxxx

# WhatsApp Business
WHATSAPP_API_KEY=xxxxx
WHATSAPP_PHONE_ID=xxxxx
```

---

## IMPORTANT NOTES

```
1. SECURITY FIRST
   - Aadhaar data kabhi plain text mein store mat karo
   - Payments sirf Razorpay ke through
   - Worker location data user ke alawa kisi ko mat do
   - HTTPS everywhere, HTTP kabhi nahi

2. INDIA-FIRST DESIGN
   - Hindi language support from day 1
   - 2G/3G pe bhi kaam kare (light app)
   - Offline mode for workers (no internet areas)
   - UPI as primary payment

3. TRUST IS EVERYTHING
   - Worker verification = your biggest asset
   - Ek bhi bad incident = brand damage
   - Insurance se shuru karo

4. START SIMPLE
   - WhatsApp → Basic App → Full App
   - 1 city → 3 cities → 10 cities
   - 3 categories → 10 categories → 20+ categories
   - Iterate fast, break things (but not trust)
```

---

**Document Owner:** Founder  
**Last Updated:** 2026-05-13  
**Next Review:** 2026-06-13

---
*"Jo pehle shuru karega, woh jeetega. Shuru karo aaj."*
