# 🚀 SEVA SETU — Deployment Guide

**From localhost to production in 1 weekend.**

---

## 🎯 What You Need

| Service | Free Tier | Paid From | Use For |
|---------|-----------|-----------|---------|
| **Vercel** | Yes ✅ | ₹0 | Frontend hosting |
| **Railway** | $5 credit | ₹400/mo | Backend services |
| **Supabase** | 500MB DB ✅ | ₹0 | PostgreSQL database |
| **Upstash** | 10k cmds/day ✅ | ₹0 | Redis cache |
| **MSG91** | 25 free SMS ✅ | ₹0.15/SMS | SMS sending |
| **Razorpay** | Test free ✅ | 2% fee | Payments |
| **Cloudflare** | Free ✅ | ₹0 | CDN + DNS |
| **GoDaddy** | — | ₹600/yr | Domain |

**Total starting cost:** ~₹50-1000/month for first 1000 bookings.

---

## 📋 Pre-Deployment Checklist

### Code Changes Needed
- [ ] Replace JSON DB with PostgreSQL
- [ ] Replace memory store with real Redis
- [ ] Add production env variables
- [ ] Enable proper HTTPS only
- [ ] Add rate limiting
- [ ] Set up logging (Winston / Datadog)
- [ ] Error tracking (Sentry)
- [ ] Health check endpoints (already done ✅)

### Security
- [ ] Strong JWT secret (`openssl rand -hex 64`)
- [ ] Razorpay production keys
- [ ] CORS whitelist (no `*` in prod)
- [ ] Helmet.js for headers
- [ ] SQL injection prevention (use parameterized queries)
- [ ] Input sanitization
- [ ] HTTPS only

---

## 🌐 Step-by-Step Deployment

### Step 1 — Database (Supabase)

```bash
1. Sign up: https://supabase.com (use GitHub)
2. New project → name: "seva-setu"
3. Region: Mumbai (ap-south-1)
4. Get connection string:
   Settings → Database → Connection string
5. Run migrations:
   psql DATABASE_URL < database/migrations/001_initial_schema.sql
```

### Step 2 — Redis (Upstash)

```bash
1. Sign up: https://upstash.com
2. Create Redis database
3. Region: Mumbai
4. Copy Redis URL
```

### Step 3 — Frontend (Vercel)

```bash
cd apps/mobile-web

# Push to GitHub first
git init
git remote add origin https://github.com/yourusername/seva-setu.git
git push -u origin main

# Then in Vercel:
1. https://vercel.com → New Project
2. Import your repo
3. Root directory: apps/mobile-web
4. Build command: npm run build
5. Output directory: dist
6. Add env vars:
   VITE_AUTH_URL=https://api.sevasetu.in
   VITE_USER_URL=https://api.sevasetu.in
   ...
7. Deploy!
```

### Step 4 — Backend Services (Railway)

For each service:
```bash
1. Railway → New Project → Deploy from GitHub
2. Select your repo
3. Root directory: services/auth-service
4. Add env vars:
   DATABASE_URL=postgresql://...
   REDIS_URL=redis://...
   JWT_SECRET=your-super-secret-key
   NODE_ENV=production
   ...
5. Custom domain: api-auth.sevasetu.in
```

**OR use a single VPS** (cheaper for production):
```bash
# DigitalOcean droplet ($6/month)
# Install Node.js, PM2, Nginx

# Install PM2 process manager
npm install -g pm2

# Start all services
cd services/auth-service && pm2 start src/index.js --name auth
cd services/user-service && pm2 start src/index.js --name user
# ... repeat for all

# Save and auto-restart on reboot
pm2 save
pm2 startup
```

### Step 5 — Domain & SSL (Cloudflare)

```bash
1. Buy domain on GoDaddy: sevasetu.in (~₹600/yr)
2. Move DNS to Cloudflare (free)
3. Add A records:
   sevasetu.in        → Vercel IP
   www.sevasetu.in    → Vercel IP
   api.sevasetu.in    → Railway / VPS IP
4. Enable SSL (auto via Cloudflare)
```

### Step 6 — Production Razorpay

```bash
1. Sign up: https://dashboard.razorpay.com
2. Complete KYC (PAN, GST, bank account)
3. Activate live mode
4. Get production keys:
   KEY_ID:     rzp_live_xxx
   KEY_SECRET: xxx
5. Add to environment vars
```

### Step 7 — SMS (MSG91)

```bash
1. Sign up: https://msg91.com
2. Get authorization key
3. Approve sender ID: SEVSTU
4. Add templates for OTP, booking events
5. Add MSG91_AUTH_KEY to env
```

### Step 8 — WhatsApp Business

```bash
1. Apply: business.facebook.com → WhatsApp Business API
2. Verify business
3. Get Phone ID + Access Token
4. Submit message templates for approval
5. Add to env: WHATSAPP_TOKEN, WHATSAPP_PHONE_ID
```

---

## 🔐 Production Environment Variables

```env
# Production .env

NODE_ENV=production
PORT=3001  # Per service

# Database
DATABASE_URL=postgresql://postgres:password@db.xxx.supabase.co:5432/postgres
REDIS_URL=rediss://default:xxx@xxx.upstash.io:6379

# JWT
JWT_SECRET=<64 char random string>
JWT_EXPIRES_IN=7d

# Razorpay (PROD)
RAZORPAY_KEY_ID=rzp_live_xxx
RAZORPAY_KEY_SECRET=xxx

# Communications
MSG91_AUTH_KEY=xxx
MSG91_SENDER_ID=SEVSTU
WHATSAPP_TOKEN=xxx
WHATSAPP_PHONE_ID=xxx

# AI
ANTHROPIC_API_KEY=sk-ant-xxx

# CORS (production)
ALLOWED_ORIGINS=https://sevasetu.in,https://www.sevasetu.in
```

---

## 📊 Monitoring Stack

```
Logs:        Datadog / CloudWatch / Papertrail
Errors:      Sentry
Performance: New Relic / Datadog APM
Uptime:      UptimeRobot (free) / Better Uptime
Analytics:   Mixpanel / Amplitude (free tier)
```

---

## 💰 Monthly Cost Breakdown

### Tier 1 — Launch (100 bookings/day)
```
Vercel:        ₹0     (free)
Railway:       ₹400   (single $5 plan)
Supabase:      ₹0     (free tier)
Upstash:       ₹0     (free)
Domain:        ₹50    (₹600/yr)
SMS (300):     ₹45    (₹0.15 × 300)
Razorpay:      ₹2%    (transaction-based)
TOTAL:         ~₹500/month
```

### Tier 2 — Growth (1000 bookings/day)
```
Vercel Pro:    ₹1,600 ($20)
Railway:       ₹3,200 ($40)
Supabase Pro:  ₹2,000 ($25)
SMS:           ₹450
Total:         ~₹8,000/month
```

### Tier 3 — Scale (10,000 bookings/day)
```
AWS / GCP:     ₹50,000+
Postgres prod: ₹15,000
Redis cluster: ₹8,000
SMS+WhatsApp:  ₹15,000+
Engineers:     ₹5,00,000+
Total:         ~₹6 lakh/month
```

---

## 🎯 Launch Checklist (Day Before Going Live)

- [ ] All 7 backend services deployed
- [ ] Frontend deployed to Vercel
- [ ] Custom domain SSL working
- [ ] Database migrations complete
- [ ] Production Razorpay activated
- [ ] SMS templates approved
- [ ] WhatsApp templates approved
- [ ] Test full flow on production
- [ ] Backup strategy in place
- [ ] Monitoring dashboards set up
- [ ] Error tracking active
- [ ] Customer support email ready
- [ ] Privacy Policy + Terms of Service pages
- [ ] Cookie consent banner (GDPR)
- [ ] Refund policy documented

---

## 🚨 First Week Operations

### Day 1
- [ ] Verify all services up via monitoring
- [ ] Watch first real bookings closely
- [ ] Manually call first 10 customers for feedback

### Week 1
- [ ] Daily error report review
- [ ] Customer support response time < 30 min
- [ ] Worker onboarding: 5+ workers/day minimum
- [ ] Track conversion rate (homepage → first booking)

### Month 1
- [ ] 100+ bookings target
- [ ] 50+ verified workers
- [ ] 4.5+ avg rating
- [ ] Bug-free experience

---

## 🆘 Disaster Recovery

### Database Backup
```bash
# Daily backup (Supabase auto-backs up)
# Also custom:
pg_dump $DATABASE_URL > backup-$(date +%Y%m%d).sql
```

### Service Failure
```bash
# Auto-restart configured in PM2/Railway
# Manual restart:
pm2 restart all
# OR
railway up --service auth-service
```

### Rollback
```bash
# Vercel: Click "Promote" on previous deployment
# Railway: railway rollback
# Database: Restore from Supabase point-in-time
```

---

## 📞 Support Contacts

| Issue | Contact |
|-------|---------|
| Vercel | support@vercel.com |
| Railway | help.railway.app |
| Razorpay | support@razorpay.com |
| Supabase | support@supabase.com |
| MSG91 | support@msg91.com |

---

**Good luck with your launch! 🚀**

*"Code is just 10% of a startup. Execution is 90%. Go talk to customers."*
