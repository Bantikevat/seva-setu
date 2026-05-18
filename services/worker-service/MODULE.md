# WORKER MODULE — Complete Documentation
**Service:** worker-service
**Port:** 3003
**Status:** Module 3 of 8
**Depends on:** Database (shared with auth + user)

---

## YEH MODULE KYA KARTA HAI?

Workers = Plumber, Electrician, Carpenter, etc.

Iske bina koi booking nahi ho sakti — yeh CORE module hai.

```
Customer ko chahiye:
  "Mere pas plumber bhejo"
       ↓
Worker module:
  - Plumbers list dena
  - Sabki ratings, distance, price
  - Available hai ya nahi
  - Verified hai ya nahi
       ↓
Customer book kar sake
```

---

## API ENDPOINTS

### Public (No auth required)
```
🟢 GET  /workers/categories       → All service categories
🟢 GET  /workers/search           → Search workers (filter, sort)
🟢 GET  /workers/:id              → Worker public profile
🟢 GET  /workers/:id/reviews      → Worker's reviews
```

### Worker Self (Auth required)
```
🔐 POST /workers/register         → New worker registration
🔐 GET  /workers/me               → Mera worker profile
🔐 PUT  /workers/me               → Update profile
🔐 PUT  /workers/me/availability  → Available/Busy toggle
🔐 POST /workers/me/skills        → Add skill
🔐 DELETE /workers/me/skills/:id  → Remove skill
```

### Admin (Future)
```
🔒 POST /admin/workers/:id/verify → Verify worker
🔒 PUT  /admin/workers/:id/active → Activate/Suspend
```

---

## DATA MODEL

### Workers Table
```javascript
{
  id:             "uuid",
  phone:          "9999988888",
  name:           "Rajesh Kumar",
  profile_photo:  "https://...",
  bio:            "8 years experience in plumbing",
  city_id:        "uuid",
  latitude:       26.9124,
  longitude:      75.7873,
  is_verified:    true,
  is_available:   true,        // Online/Busy toggle
  is_active:      true,        // Banned/Active
  rating_average: 4.8,
  total_jobs:     234,
  total_earnings: 1500000,     // Total earned
  joined_at:      "2026-01-01"
}
```

### Categories Table
```javascript
{
  id:          "uuid",
  name:        "Plumber",
  name_hindi:  "प्लंबर",
  emoji:       "🔧",
  base_price:  299,
  is_active:   true
}
```

### Worker Skills Table (junction)
```javascript
{
  id:               "uuid",
  worker_id:        "uuid",
  category_id:      "uuid",
  experience_years: 8,
  is_primary:       true     // Main skill
}
```

---

## SEARCH LOGIC

User searches: `GET /workers/search?category=plumber&city=jaipur&sort=rating`

### Filters supported:
- `category`     → "plumber", "electrician", etc.
- `city`         → city slug
- `min_rating`   → 4.5 (only 4.5+ rated)
- `available`    → true (only available workers)
- `verified`     → true (only verified)
- `max_price`    → 500
- `lat` + `lng`  → Sort by distance

### Sort options:
- `rating`    → Top rated first
- `distance`  → Nearest first
- `price`     → Cheapest first
- `jobs`      → Most experienced first

### Returns:
```javascript
{
  success: true,
  data: {
    workers: [
      {
        id, name, photo, rating, totalJobs,
        skill, pricePerVisit, distanceKm,
        isVerified, isAvailable
      },
      ...
    ],
    count: 12,
    filters: { ... }
  }
}
```

---

## DISTANCE CALCULATION

Customer aur Worker ke beech distance — Haversine formula:

```javascript
function getDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2)² + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon/2)²;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}
```

---

## SECURITY RULES

```
✅ Worker apna hi profile edit kar sakta hai
✅ Worker apna hi availability toggle kar sakta hai
✅ Skills sirf valid categories se add hon
✅ Phone unique — ek phone ek worker
✅ Verification baad mein admin kar sakta hai
```

---

## SAMPLE DATA (Seed)

Module start hote hi 8 categories + 6 sample workers create honge:

**Categories:**
- 🔧 Plumber          ₹299
- ⚡ Electrician      ₹349
- ❄️ AC Repair        ₹499
- 🧹 Cleaning         ₹249
- 🪚 Carpenter        ₹399
- 👨‍🍳 Cook            ₹499
- 💆 Beauty           ₹599
- 🎨 Painter          ₹699

**Workers:**
- Rajesh Kumar (Plumber, 4.9⭐, 234 jobs)
- Sunita Devi (Cleaner, 4.8⭐, 189 jobs)
- Mohan Singh (Electrician, 5.0⭐, 312 jobs)
- Ramesh Sharma (Carpenter, 4.7⭐, 156 jobs)
- Priya Nair (Beauty, 4.9⭐, 278 jobs)
- Vijay Patel (Painter, 4.6⭐, 98 jobs)
