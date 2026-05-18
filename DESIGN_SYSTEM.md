# SEVA SETU — Complete Design System
### "10 Crore+ Valuation Ready UI"
**Version:** 1.0 | **Date:** 2026-05-13

---

# 1. BRAND IDENTITY

## App Name & Tagline
```
Name:    SEVA SETU
Hindi:   सेवा सेतु
Tagline: "Ghar Ki Har Zaroorat, Ek App Mein"
         "घर की हर ज़रूरत, एक ऐप में"
```

## Brand Personality
```
Trustworthy   →  Log trust karein workers pe
Warm          →  Indian family jaisi feeling
Modern        →  Instagram jaisi smoothness
Reliable      →  Blinkit jaisi speed
Premium       →  Apple jaisi quality
```

---

# 2. COLOR SYSTEM

## Primary Brand Colors
```css
/* MAIN BRAND COLOR — Deep Saffron (Indian + Modern) */
--primary-500: #FF6B35;      /* Main buttons, CTAs */
--primary-400: #FF8555;      /* Hover states */
--primary-300: #FFA07A;      /* Light accents */
--primary-200: #FFCBB5;      /* Backgrounds */
--primary-100: #FFF0EB;      /* Very light bg */
--primary-600: #E5501A;      /* Pressed state */
--primary-700: #CC3D0D;      /* Dark variant */
```

## Secondary Colors
```css
/* TRUST COLOR — Deep Blue */
--secondary-500: #1A3C5E;    /* Headers, important text */
--secondary-400: #2D5A8E;    /* Secondary buttons */
--secondary-300: #4A7AB0;    /* Links */
--secondary-200: #A8C5E0;    /* Borders */
--secondary-100: #EBF3FB;    /* Light backgrounds */
```

## Accent Colors
```css
/* SUCCESS — Fresh Green */
--success-500: #22C55E;
--success-400: #4ADE80;
--success-100: #DCFCE7;

/* WARNING — Warm Yellow */
--warning-500: #F59E0B;
--warning-400: #FCD34D;
--warning-100: #FEF3C7;

/* ERROR — Soft Red */
--error-500: #EF4444;
--error-400: #F87171;
--error-100: #FEE2E2;

/* INFO — Sky Blue */
--info-500: #3B82F6;
--info-400: #60A5FA;
--info-100: #DBEAFE;
```

## Neutral Colors (Most Used)
```css
/* GRAYS — For text, borders, backgrounds */
--gray-900: #111827;    /* Primary text */
--gray-800: #1F2937;    /* Secondary text */
--gray-700: #374151;    /* Body text */
--gray-600: #4B5563;    /* Muted text */
--gray-500: #6B7280;    /* Placeholder */
--gray-400: #9CA3AF;    /* Disabled */
--gray-300: #D1D5DB;    /* Borders */
--gray-200: #E5E7EB;    /* Dividers */
--gray-100: #F3F4F6;    /* Card backgrounds */
--gray-50:  #F9FAFB;    /* Page background */
--white:    #FFFFFF;
```

## Dark Mode Colors
```css
/* DARK MODE — Raat ko aankhon ko aaram */
--dark-bg-primary:   #0F0F0F;
--dark-bg-secondary: #1A1A1A;
--dark-bg-card:      #242424;
--dark-bg-elevated:  #2E2E2E;
--dark-text-primary: #F5F5F5;
--dark-text-secondary: #A3A3A3;
--dark-border:       #333333;
```

## Color Usage Rules
```
✅ Primary Orange  →  Buttons, CTAs, Active states, Icons
✅ Secondary Blue  →  Headers, Trust elements, Worker badges
✅ Success Green   →  Booking confirmed, Payment success
✅ Warning Yellow  →  Pending, Waiting
✅ Error Red       →  Failed, Cancelled
✅ Grays           →  Everything else (text, borders, bg)

❌ KABHI MAT KARO:
   - 2 bright colors ek saath mat use karo
   - Text pe light color mat use karo (contrast low)
   - Random colors mat add karo — sirf yahi palette
```

---

# 3. TYPOGRAPHY SYSTEM

## Font Family
```css
/* PRIMARY FONT — Poppins (Modern, Clean, Indian apps mein popular) */
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&display=swap');

/* HINDI FONT — Hind (Beautiful Hindi rendering) */
@import url('https://fonts.googleapis.com/css2?family=Hind:wght@300;400;500;600;700&display=swap');

/* CODE/NUMBERS — JetBrains Mono */
@import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600&display=swap');

font-family-primary:  'Poppins', sans-serif;
font-family-hindi:    'Hind', 'Poppins', sans-serif;
font-family-mono:     'JetBrains Mono', monospace;
```

## Type Scale
```css
/* DISPLAY — Hero sections, splash screens */
--text-display-2xl: 4.5rem;   /* 72px — App name, hero */
--text-display-xl:  3.75rem;  /* 60px — Landing page */
--text-display-lg:  3rem;     /* 48px — Section hero */

/* HEADINGS */
--text-4xl: 2.25rem;   /* 36px — Page titles */
--text-3xl: 1.875rem;  /* 30px — Section titles */
--text-2xl: 1.5rem;    /* 24px — Card titles */
--text-xl:  1.25rem;   /* 20px — Sub-headings */
--text-lg:  1.125rem;  /* 18px — Large body */

/* BODY */
--text-base: 1rem;      /* 16px — Default body text */
--text-sm:   0.875rem;  /* 14px — Secondary text */
--text-xs:   0.75rem;   /* 12px — Captions, labels */

/* FONT WEIGHTS */
--font-light:    300;
--font-regular:  400;
--font-medium:   500;
--font-semibold: 600;
--font-bold:     700;
--font-extrabold: 800;

/* LINE HEIGHTS */
--leading-tight:  1.25;
--leading-normal: 1.5;
--leading-relaxed: 1.75;
```

## Typography Usage
```
App Name/Logo:    Poppins 800, Primary Orange
Page Titles:      Poppins 700, Gray-900
Section Titles:   Poppins 600, Gray-800
Card Titles:      Poppins 600, Gray-800
Body Text:        Poppins 400, Gray-700
Captions:         Poppins 400, Gray-500
Prices:           Poppins 700, Gray-900 (₹ bold)
CTA Buttons:      Poppins 600, White
Hindi Text:       Hind 400/500, same colors
```

---

# 4. SPACING SYSTEM

```css
/* 8px BASE GRID — Sab kuch 8 ka multiple */
--space-1:  0.25rem;   /* 4px  — Tiny gaps */
--space-2:  0.5rem;    /* 8px  — Small gaps */
--space-3:  0.75rem;   /* 12px — */
--space-4:  1rem;      /* 16px — Default padding */
--space-5:  1.25rem;   /* 20px — */
--space-6:  1.5rem;    /* 24px — Card padding */
--space-8:  2rem;      /* 32px — Section gaps */
--space-10: 2.5rem;    /* 40px — */
--space-12: 3rem;      /* 48px — Large sections */
--space-16: 4rem;      /* 64px — Page sections */
--space-20: 5rem;      /* 80px — Hero sections */
--space-24: 6rem;      /* 96px — */
```

---

# 5. BORDER RADIUS

```css
--radius-sm:   0.25rem;   /* 4px  — Badges, tags */
--radius-md:   0.5rem;    /* 8px  — Inputs, small cards */
--radius-lg:   0.75rem;   /* 12px — Cards */
--radius-xl:   1rem;      /* 16px — Large cards */
--radius-2xl:  1.5rem;    /* 24px — Modals, bottom sheets */
--radius-3xl:  2rem;      /* 32px — Featured cards */
--radius-full: 9999px;    /* Pills, avatars, buttons */
```

---

# 6. SHADOW SYSTEM

```css
/* ELEVATION LEVELS — Depth dikhane ke liye */
--shadow-xs:  0 1px 2px rgba(0,0,0,0.05);
--shadow-sm:  0 2px 4px rgba(0,0,0,0.08);
--shadow-md:  0 4px 12px rgba(0,0,0,0.10);
--shadow-lg:  0 8px 24px rgba(0,0,0,0.12);
--shadow-xl:  0 16px 48px rgba(0,0,0,0.15);

/* COLORED SHADOWS — Premium feel ke liye */
--shadow-primary: 0 8px 24px rgba(255,107,53,0.25);
--shadow-success: 0 8px 24px rgba(34,197,94,0.25);
```

---

# 7. COMPONENT LIBRARY

## BUTTONS
```css
/* PRIMARY BUTTON — Main CTA */
.btn-primary {
  background: #FF6B35;
  color: white;
  padding: 14px 28px;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  border: none;
  box-shadow: 0 4px 14px rgba(255,107,53,0.35);
  transition: all 0.2s ease;
}
.btn-primary:hover {
  background: #E5501A;
  transform: translateY(-1px);
  box-shadow: 0 6px 20px rgba(255,107,53,0.45);
}
.btn-primary:active {
  transform: translateY(0);
  box-shadow: 0 2px 8px rgba(255,107,53,0.3);
}

/* SECONDARY BUTTON */
.btn-secondary {
  background: white;
  color: #FF6B35;
  border: 2px solid #FF6B35;
  padding: 12px 28px;
  border-radius: 12px;
  font-weight: 600;
}

/* GHOST BUTTON */
.btn-ghost {
  background: transparent;
  color: #4B5563;
  padding: 12px 20px;
  border-radius: 12px;
}

/* ICON BUTTON */
.btn-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: #FFF0EB;
  color: #FF6B35;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* FULL WIDTH BUTTON (Mobile) */
.btn-full {
  width: 100%;
  padding: 16px;
  border-radius: 16px;
  font-size: 17px;
}

/* SIZES */
.btn-sm  { padding: 8px 16px;  font-size: 14px; border-radius: 8px; }
.btn-md  { padding: 12px 24px; font-size: 15px; border-radius: 10px; }
.btn-lg  { padding: 16px 32px; font-size: 17px; border-radius: 14px; }
.btn-xl  { padding: 18px 40px; font-size: 18px; border-radius: 16px; }
```

## CARDS
```css
/* SERVICE CARD — Category cards */
.card-service {
  background: white;
  border-radius: 20px;
  padding: 20px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
  border: 1px solid #F3F4F6;
  transition: all 0.25s ease;
}
.card-service:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 32px rgba(0,0,0,0.12);
}

/* WORKER CARD */
.card-worker {
  background: white;
  border-radius: 20px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
  display: flex;
  gap: 12px;
  align-items: center;
}

/* BOOKING CARD */
.card-booking {
  background: white;
  border-radius: 16px;
  padding: 16px;
  border-left: 4px solid #FF6B35;  /* Status color yahan */
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
}

/* STATS CARD (Admin) */
.card-stats {
  background: linear-gradient(135deg, #FF6B35, #FF8555);
  color: white;
  border-radius: 20px;
  padding: 24px;
}
```

## INPUT FIELDS
```css
/* TEXT INPUT */
.input-field {
  width: 100%;
  padding: 14px 16px;
  border: 2px solid #E5E7EB;
  border-radius: 12px;
  font-size: 16px;
  color: #111827;
  background: white;
  transition: border-color 0.2s;
  outline: none;
}
.input-field:focus {
  border-color: #FF6B35;
  box-shadow: 0 0 0 3px rgba(255,107,53,0.15);
}
.input-field::placeholder {
  color: #9CA3AF;
}
.input-field.error {
  border-color: #EF4444;
  box-shadow: 0 0 0 3px rgba(239,68,68,0.15);
}

/* PHONE INPUT (India) */
.input-phone {
  display: flex;
  align-items: center;
  border: 2px solid #E5E7EB;
  border-radius: 12px;
  overflow: hidden;
}
.input-phone .prefix {
  padding: 14px 16px;
  background: #F9FAFB;
  color: #374151;
  font-weight: 600;
  border-right: 2px solid #E5E7EB;
}
```

## BADGES & TAGS
```css
/* VERIFIED BADGE */
.badge-verified {
  background: #DCFCE7;
  color: #16A34A;
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

/* STATUS BADGES */
.badge-pending   { background: #FEF3C7; color: #D97706; }
.badge-confirmed { background: #DBEAFE; color: #1D4ED8; }
.badge-progress  { background: #FFF0EB; color: #FF6B35; }
.badge-complete  { background: #DCFCE7; color: #16A34A; }
.badge-cancelled { background: #FEE2E2; color: #DC2626; }

/* CATEGORY TAG */
.tag-category {
  background: #FFF0EB;
  color: #FF6B35;
  padding: 6px 14px;
  border-radius: 999px;
  font-size: 13px;
  font-weight: 500;
}
```

## RATING STARS
```css
.rating-stars {
  display: flex;
  gap: 2px;
}
.star-filled { color: #F59E0B; font-size: 16px; }
.star-empty  { color: #D1D5DB; font-size: 16px; }

.rating-display {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  font-weight: 600;
  color: #111827;
}
```

---

# 8. SCREEN DESIGNS

## MOBILE APP SCREENS

### Screen 1 — Splash / Onboarding
```
Background: Linear gradient #FF6B35 → #FF8555
Center:     Logo (white) + App name
Bottom:     "Shuru Karen" button (white, full width)

Onboarding 3 screens:
1. "Ghar mein koi kaam?"     → Illustration: house repair
2. "Verified workers"         → Illustration: worker badge
3. "60 min mein at home"     → Illustration: clock + worker
```

### Screen 2 — Login / OTP
```
Top:        Back arrow + "Login" title
Center:
  - "Apna phone number daalo" (Hindi)
  - Phone input (+91 | 10 digit)
  - "OTP Bhejo" button (Primary, full width)

Below input:
  - "Worker ho? Yahan login karo" (link)

Design notes:
  - Clean white background
  - Subtle orange wave at bottom
  - Keyboard automatically opens
```

### Screen 3 — Home Screen
```
TOP BAR:
  Left:   Location pin + "Jaipur, Rajasthan" (dropdown)
  Right:  Notification bell + Profile avatar

SEARCH BAR:
  "Kya chahiye? (plumber, maid...)"
  Mic icon on right (voice search)

BANNER (Horizontal scroll):
  Promotional cards — rounded, colorful

CATEGORIES (2x4 grid):
  Each: Icon + Name (Hindi + English)
  🔧 Plumber     | ⚡ Electrician
  🪚 Carpenter   | 🧹 Cleaning
  👨‍🍳 Cook       | 💆 Beauty
  📚 Tutor       | 🚗 Mechanic

NEARBY WORKERS:
  "Aapke Aas-Paas" section
  Horizontal scroll cards
  Worker photo, name, rating, distance, price

RECENT BOOKINGS:
  Last 2-3 bookings
  Quick "Dobara Book Karo" button
```

### Screen 4 — Category / Search
```
TOP: Search bar + Filter button
FILTER CHIPS (horizontal scroll):
  Rating 4+  |  Available Now  |  Under ₹500  |  Verified

WORKER LIST (vertical):
  Each card:
    - Worker photo (circle, 60px)
    - Name + Verified badge
    - Rating (stars + number)
    - "0.5 km away"
    - Skills: "Plumber • 8 years"
    - Price: "₹300 / visit"
    - "Book Karo" button
```

### Screen 5 — Worker Profile
```
TOP: Full width cover photo / gradient
     Worker photo (large circle, centered)
     Name + Verified badge

STATS ROW:
  4.8 ⭐  |  234 jobs  |  8 years  |  0.5 km

ACTION BUTTONS:
  [Book Karo]  [Call Karo]  [Message]

ABOUT: Hindi mein description

SKILLS: Tag chips

REVIEWS: Recent 5 reviews

GALLERY: Work photos (before/after)
```

### Screen 6 — Booking Screen
```
SERVICE:  Plumbing - Pipe Repair

DATE/TIME PICKER:
  "Kab chahiye?" 
  Calendar (today highlighted orange)
  Time slots: Morning | Afternoon | Evening

ADDRESS:
  "Kahan?" 
  Saved addresses list
  + Add New Address

PRICE BREAKDOWN:
  Service charge:    ₹300
  Platform fee:      ₹30
  ─────────────────────
  Total:             ₹330

BOTTOM:
  [Pay ₹330 — Book Confirm Karo]
  (Full width, orange gradient button)
```

### Screen 7 — Live Tracking
```
TOP HALF: Google Maps
  - User location (home icon)
  - Worker location (moving dot)
  - Route line (orange)

BOTTOM HALF: White card (bottom sheet)
  Worker photo + name
  "Raju 2.3 km door hain, ~12 min"
  Progress bar: Confirmed → On Way → Arrived → Done
  
  [Call Worker]  [Cancel]
```

### Screen 8 — Booking Complete
```
BIG CHECKMARK: Animated, green circle
"Kaam Ho Gaya!" in bold

Summary:
  Service, Worker, Duration, Amount paid

"Review Do Raju Ko" section:
  5 star selector
  Text input: "Kuch batana chahte hain?"
  [Review Bhejo]

[Ghar Jaao] button
```

---

# 9. RESPONSIVE DESIGN RULES

## Breakpoints
```css
/* MOBILE FIRST APPROACH */
--screen-xs:  320px;   /* Small phones */
--screen-sm:  375px;   /* iPhone SE, normal phones */
--screen-md:  428px;   /* Large phones, iPhone Plus */
--screen-lg:  768px;   /* Tablets */
--screen-xl:  1024px;  /* Laptops */
--screen-2xl: 1280px;  /* Desktop */
--screen-3xl: 1536px;  /* Large desktop */
```

## Layout Rules
```
MOBILE (320-768px):
  - Single column layout
  - Full width buttons
  - Bottom navigation bar
  - Large touch targets (min 48px)
  - Font size min 16px (zoom prevent)

TABLET (768-1024px):
  - 2 column grid for cards
  - Side navigation drawer
  - Larger images

DESKTOP (1024px+):
  - 3-4 column grid
  - Sidebar navigation
  - Hover states active
  - Admin panel layout
```

## Touch Targets (Mobile)
```
Min tap area:   48x48px (Google Material standard)
Buttons:        Min 48px height
Icons:          44px touch area minimum
List items:     Min 56px height
Bottom nav:     Min 64px height
```

---

# 10. ANIMATION & TRANSITIONS

```css
/* TIMING FUNCTIONS */
--ease-smooth: cubic-bezier(0.4, 0, 0.2, 1);   /* General */
--ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1); /* Bouncy */
--ease-enter:  cubic-bezier(0, 0, 0.2, 1);       /* Enter */
--ease-exit:   cubic-bezier(0.4, 0, 1, 1);        /* Exit */

/* DURATIONS */
--duration-fast:   150ms;   /* Micro interactions */
--duration-normal: 250ms;   /* Most transitions */
--duration-slow:   400ms;   /* Page transitions */
--duration-slower: 600ms;   /* Complex animations */

/* COMMON ANIMATIONS */

/* Button press */
button:active {
  transform: scale(0.97);
  transition: transform 150ms ease;
}

/* Card hover */
.card:hover {
  transform: translateY(-4px);
  transition: all 250ms ease;
}

/* Page enter */
.page-enter {
  animation: slideUp 300ms ease forwards;
}
@keyframes slideUp {
  from { opacity: 0; transform: translateY(20px); }
  to   { opacity: 1; transform: translateY(0); }
}

/* Skeleton loading */
.skeleton {
  background: linear-gradient(90deg, #F3F4F6 25%, #E5E7EB 50%, #F3F4F6 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}
@keyframes shimmer {
  from { background-position: 200% 0; }
  to   { background-position: -200% 0; }
}
```

---

# 11. ICONS SYSTEM

```
Icon Library: Lucide Icons (free, beautiful, consistent)
npm install lucide-react lucide-react-native

Common icons:
Home:         <Home />
Search:       <Search />
Booking:      <Calendar />
Profile:      <User />
Worker:       <HardHat />
Plumber:      <Wrench />
Electrician:  <Zap />
Cleaning:     <Sparkles />
Location:     <MapPin />
Phone:        <Phone />
Rating:       <Star />
Verified:     <BadgeCheck />
Payment:      <CreditCard />
Notification: <Bell />
Settings:     <Settings />
Back:         <ArrowLeft />
Menu:         <Menu />

ICON SIZES:
--icon-xs:  16px
--icon-sm:  20px
--icon-md:  24px   (default)
--icon-lg:  32px
--icon-xl:  48px
```

---

# 12. BOTTOM NAVIGATION (Mobile App)

```
5 tabs:
[🏠 Home] [🔍 Dhundho] [📋 Bookings] [💬 Chat] [👤 Profile]

Active tab:   Orange icon + orange dot indicator
Inactive tab: Gray icon
Height:       64px + safe area
Background:   White + top border 1px #E5E7EB
```

---

# 13. LOADING STATES

```
1. SKELETON SCREENS  — Real content shape mein gray shimmer
   (Never use spinner for main content)

2. BUTTON LOADING    — Spinner inside button, text "Loading..."

3. PULL TO REFRESH   — Orange spinner at top

4. INFINITE SCROLL   — Bottom mein small spinner

5. PAGE LOADING      — Full screen logo animation (app open pe)
```

---

# 14. ERROR STATES

```
EMPTY STATE:
  Illustration (friendly, colorful)
  Hindi message: "Koi worker nahi mila"
  Sub text: "Filter hata ke dobara try karo"
  Button: "Filter Hatao"

ERROR STATE:
  Illustration (connection error etc)
  Hindi: "Kuch gadbad ho gayi"
  Button: "Dobara Try Karo"

OFFLINE STATE:
  Banner at top: "Internet nahi hai" (yellow)
  App still shows cached data
```

---

# 15. FINAL DESIGN CHECKLIST

```
BEFORE LAUNCH — Yeh sab check karo:

VISUAL:
[ ] Sab colors brand palette se hain
[ ] Font sirf Poppins + Hind
[ ] Consistent border radius
[ ] Consistent spacing (8px grid)
[ ] Shadows properly layered

TYPOGRAPHY:
[ ] Hindi text properly render ho raha hai
[ ] Font size mobile pe min 16px
[ ] Line height readable hai
[ ] Contrast ratio 4.5:1 minimum

MOBILE:
[ ] Touch targets 48px minimum
[ ] No horizontal scroll unexpected
[ ] Keyboard screen push karta hai properly
[ ] Safe area (notch, home bar) handle
[ ] Both Android aur iOS test karo

PERFORMANCE:
[ ] Images compressed (WebP format)
[ ] Lazy loading implemented
[ ] Skeleton screens hain
[ ] Animations 60fps pe chalti hain

ACCESSIBILITY:
[ ] Screen reader labels hain
[ ] Color sirf information ke liye nahi
[ ] Error states clearly communicated
```

---

# 16. DESIGN INSPIRATION BREAKDOWN

```
BLINKIT  se lo:   Speed feeling, category grid, quick CTA
FLIPKART se lo:   Trust badges, review system, price display
AMAZON   se lo:   Search UX, product detail layout
INSTAGRAM se lo:  Story format, smooth animations, profile grid
SWIGGY   se lo:   Live tracking UI, order card design
URBAN CO se lo:   Worker profile card, booking flow

TERA UNIQUE:
- Hindi-first throughout
- Warm orange brand (Indian, trustworthy)
- Worker welfare visible in UI
- Community reviews (neighbor verified)
- Simple enough for Tier-2 users
```

---

**10 Crore+ Valuation ke liye:**
> Ek bhi screen random mat banana — sab design system follow kare.
> Consistency = Professionalism = Investor confidence.

**Design Owner:** Founder
**Last Updated:** 2026-05-13
