# Supabase / Postgres Setup Guide

App ka data abhi JSON file mein hai (dev mode). Production ke liye Supabase PostgreSQL pe migrate karenge.

## Why Supabase?
- **Free tier**: 500MB database + 2GB bandwidth + 50K MAU
- Managed PostgreSQL (no server maintenance)
- Built-in auth, storage, realtime (optional, we won't use)
- Indian region available (Mumbai)

## Setup (10 minutes)

### 1. Account banao
- Jaao: https://supabase.com
- "Start your project" → Sign up with GitHub/Google
- New project banao:
  - **Name**: `seva-setu-prod`
  - **Database Password**: strong password set karo (yaad rakho!)
  - **Region**: `Asia Pacific (Mumbai)` — lowest latency from India
  - **Plan**: Free

### 2. Connection string copy karo
- Project dashboard → **Project Settings** ⚙️ → **Database**
- Section: **Connection string** → tab **URI**
- Copy karo, looks like:
  ```
  postgresql://postgres.xxxxx:[YOUR-PASSWORD]@aws-0-ap-south-1.pooler.supabase.com:6543/postgres
  ```
- `[YOUR-PASSWORD]` ko apne actual password se replace karo

### 3. Schema migrate karo
Project root mein:
```bash
cd services/shared
cp .env.example .env
# .env mein DATABASE_URL daalo
npm install
npm run migrate:up
```

Output:
```
🔨 Running schema...
✓ Schema created successfully
```

Supabase dashboard → Table Editor mein 13 tables dikhne chahiye.

### 4. Dev JSON data seed karo (optional)
Agar dev mein test data hai jo Postgres pe bhi chahiye:
```bash
npm run migrate:seed
```

Output:
```
categories: 8 inserted, 0 skipped
users: 8 inserted, 0 skipped
addresses: 6 inserted, 0 skipped
workers: 21 inserted, 0 skipped
worker_skills: 21 inserted, 0 skipped
bookings: 7 inserted, 0 skipped
...
✓ Seed complete
```

### 5. Services ko Postgres mode pe chalao
Har service ki `.env` mein add karo:
```env
DATABASE_URL=postgresql://postgres.xxxxx:PASSWORD@aws-0-ap-south-1.pooler.supabase.com:6543/postgres
```

Services restart karo. Console mein dikhega:
```
✅ Database ready (PostgreSQL)
```

JSON mode mein wapas aana ho? `.env` se `DATABASE_URL` hata do — automatic JSON pe fallback.

## How it works internally

Code mein `services/shared/db/index.js` is the magic file:

```js
const db = require('@seva-setu/shared/db');

// Same API, works in both JSON and Postgres mode:
const user  = await db.findOne('users', { phone: '9876543210' });
const users = await db.find('users');
await db.insert('users', { phone, name });
await db.update('users', { id }, { name: 'New' });
await db.delete('users', { id });

// Escape hatch for complex queries (Postgres only):
const top = await db.raw(
  'SELECT * FROM workers WHERE rating_average > $1 ORDER BY total_jobs DESC LIMIT 10',
  [4.5]
);
```

Mode is decided automatically based on `DATABASE_URL` env var.

## Service migration status

| Service | Status |
|---------|--------|
| user-service | ✅ Migrated to shared adapter (config + services) |
| auth-service | ⏳ Pending |
| worker-service | ⏳ Pending |
| booking-service | ⏳ Pending |
| payment-service | ⏳ Pending |
| notification-service | ⏳ Pending |
| ai-service | ⏳ Pending |
| admin-service | ⏳ Pending |
| search-service | ⏳ Pending |

**Migration recipe** (per service, ~15 min each):

1. Open `src/config/database.js`
2. Replace JSON read/write with `sharedDb.find/findOne/insert/update/delete`
3. Make functions async, return Promises
4. In each `.service.js`, add `await` to all `db.xxx()` calls

Pattern follows user-service exactly — copy that as reference.

## Cost estimate (Supabase free tier)

- 500MB DB → ~500K booking records ✓ plenty
- 2GB bandwidth/month → ~200K API calls/day ✓ plenty
- 50K monthly active users free → upgrade to Pro ($25/mo) at ~10K paid users

For ₹0 to ₹0.5 lakh/month revenue range: **stay on free tier**.

## Backup strategy

Supabase auto-backups daily on free tier. Also export weekly to your own storage:
```bash
pg_dump $DATABASE_URL > backup-$(date +%Y%m%d).sql
```
