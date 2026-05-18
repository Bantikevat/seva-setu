-- ═══════════════════════════════════════════════════════════
-- SEVA SETU — PostgreSQL Schema (Supabase / Neon compatible)
-- ═══════════════════════════════════════════════════════════
-- Run this entire file in Supabase SQL Editor once.
-- All 11 tables, indexes, constraints, and triggers.
-- ═══════════════════════════════════════════════════════════

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ═══ Trigger function for auto-updating updated_at ═══
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ═══════════════════════════════════════════════════════════
-- 1. USERS (customers)
-- ═══════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS users (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  phone           VARCHAR(15) UNIQUE NOT NULL,
  name            VARCHAR(120),
  email           VARCHAR(160),
  profile_photo   TEXT,                          -- Cloudinary URL
  profile_photo_public_id  VARCHAR(255),         -- for deletion
  city_id         UUID,
  is_active       SMALLINT DEFAULT 1,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);
DROP TRIGGER IF EXISTS trg_users_updated ON users;
CREATE TRIGGER trg_users_updated BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ═══════════════════════════════════════════════════════════
-- 2. ADDRESSES
-- ═══════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS addresses (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  label           VARCHAR(40) NOT NULL,          -- 'Ghar', 'Office', 'Other'
  full_address    TEXT NOT NULL,
  latitude        DOUBLE PRECISION,
  longitude       DOUBLE PRECISION,
  city_id         UUID,
  is_default      BOOLEAN DEFAULT false,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_addresses_user ON addresses(user_id);
DROP TRIGGER IF EXISTS trg_addresses_updated ON addresses;
CREATE TRIGGER trg_addresses_updated BEFORE UPDATE ON addresses
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ═══════════════════════════════════════════════════════════
-- 3. CATEGORIES
-- ═══════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS categories (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name            VARCHAR(80) UNIQUE NOT NULL,
  name_hindi      VARCHAR(80),
  emoji           VARCHAR(8),
  base_price      INTEGER NOT NULL DEFAULT 299,
  is_active       BOOLEAN DEFAULT true,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ═══════════════════════════════════════════════════════════
-- 4. WORKERS
-- ═══════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS workers (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  phone           VARCHAR(15) UNIQUE NOT NULL,
  name            VARCHAR(120) NOT NULL,
  bio             TEXT,
  profile_photo   TEXT,
  profile_photo_public_id  VARCHAR(255),
  latitude        DOUBLE PRECISION,
  longitude       DOUBLE PRECISION,
  city_id         UUID,
  is_verified     BOOLEAN DEFAULT false,
  is_available    BOOLEAN DEFAULT true,
  is_active       BOOLEAN DEFAULT true,
  rating_average  NUMERIC(3,2) DEFAULT 0,
  total_jobs      INTEGER DEFAULT 0,
  total_earnings  INTEGER DEFAULT 0,
  joined_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_workers_available ON workers(is_available, is_verified);
CREATE INDEX IF NOT EXISTS idx_workers_location ON workers(latitude, longitude);
DROP TRIGGER IF EXISTS trg_workers_updated ON workers;
CREATE TRIGGER trg_workers_updated BEFORE UPDATE ON workers
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ═══════════════════════════════════════════════════════════
-- 5. WORKER_SKILLS  (many-to-many between workers and categories)
-- ═══════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS worker_skills (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  worker_id         UUID NOT NULL REFERENCES workers(id) ON DELETE CASCADE,
  category_id       UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  experience_years  INTEGER DEFAULT 0,
  is_primary        BOOLEAN DEFAULT false,
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(worker_id, category_id)
);
CREATE INDEX IF NOT EXISTS idx_skills_worker ON worker_skills(worker_id);
CREATE INDEX IF NOT EXISTS idx_skills_category ON worker_skills(category_id);

-- ═══════════════════════════════════════════════════════════
-- 6. BOOKINGS
-- ═══════════════════════════════════════════════════════════
DO $$ BEGIN
  CREATE TYPE booking_status AS ENUM ('pending','confirmed','on_the_way','in_progress','completed','cancelled','rejected');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE payment_status AS ENUM ('pending','paid','failed','refunded');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS bookings (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_number      VARCHAR(30) UNIQUE NOT NULL,
  customer_id         UUID NOT NULL REFERENCES users(id),
  worker_id           UUID NOT NULL REFERENCES workers(id),
  worker_name         VARCHAR(120),
  worker_phone        VARCHAR(15),
  category_id         UUID REFERENCES categories(id),
  category_name       VARCHAR(80),
  category_emoji      VARCHAR(8),
  scheduled_at        TIMESTAMPTZ,
  started_at          TIMESTAMPTZ,
  completed_at        TIMESTAMPTZ,
  cancelled_at        TIMESTAMPTZ,
  address_id          UUID REFERENCES addresses(id),
  full_address        TEXT,
  latitude            DOUBLE PRECISION,
  longitude           DOUBLE PRECISION,
  base_price          INTEGER NOT NULL,
  platform_fee        INTEGER NOT NULL,
  total_amount        INTEGER NOT NULL,
  worker_payout       INTEGER NOT NULL,
  payment_status      payment_status DEFAULT 'pending',
  status              booking_status DEFAULT 'pending',
  notes               TEXT,
  rating              SMALLINT CHECK (rating BETWEEN 1 AND 5),
  review              TEXT,
  cancellation_reason TEXT,
  cancelled_by        VARCHAR(20),                -- 'customer' | 'worker' | 'admin'
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_bookings_customer ON bookings(customer_id);
CREATE INDEX IF NOT EXISTS idx_bookings_worker   ON bookings(worker_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status   ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_created  ON bookings(created_at DESC);
DROP TRIGGER IF EXISTS trg_bookings_updated ON bookings;
CREATE TRIGGER trg_bookings_updated BEFORE UPDATE ON bookings
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ═══════════════════════════════════════════════════════════
-- 7. PAYMENTS
-- ═══════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS payments (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id            UUID NOT NULL REFERENCES bookings(id),
  booking_number        VARCHAR(30),
  customer_id           UUID NOT NULL REFERENCES users(id),
  worker_id             UUID REFERENCES workers(id),
  razorpay_order_id     VARCHAR(60),
  razorpay_payment_id   VARCHAR(60),
  razorpay_signature    TEXT,
  amount                INTEGER NOT NULL,
  base_amount           INTEGER,
  platform_fee          INTEGER,
  worker_payout         INTEGER,
  status                payment_status DEFAULT 'pending',
  method                VARCHAR(40),               -- 'upi' | 'card' | 'netbanking' | 'wallet'
  failure_reason        TEXT,
  paid_at               TIMESTAMPTZ,
  refunded_at           TIMESTAMPTZ,
  refund_amount         INTEGER,
  created_at            TIMESTAMPTZ DEFAULT NOW(),
  updated_at            TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_payments_booking  ON payments(booking_id);
CREATE INDEX IF NOT EXISTS idx_payments_customer ON payments(customer_id);
DROP TRIGGER IF EXISTS trg_payments_updated ON payments;
CREATE TRIGGER trg_payments_updated BEFORE UPDATE ON payments
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ═══════════════════════════════════════════════════════════
-- 8. PAYOUTS  (money owed to workers)
-- ═══════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS payouts (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  worker_id         UUID NOT NULL REFERENCES workers(id),
  booking_id        UUID REFERENCES bookings(id),
  amount            INTEGER NOT NULL,
  status            VARCHAR(20) DEFAULT 'pending',  -- pending|paid|failed
  payout_method     VARCHAR(40),                    -- upi|bank
  utr               VARCHAR(40),                    -- bank UTR
  paid_at           TIMESTAMPTZ,
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_payouts_worker ON payouts(worker_id, status);
DROP TRIGGER IF EXISTS trg_payouts_updated ON payouts;
CREATE TRIGGER trg_payouts_updated BEFORE UPDATE ON payouts
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ═══════════════════════════════════════════════════════════
-- 9. REVIEWS  (richer than booking.review for photo reviews)
-- ═══════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS reviews (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id      UUID UNIQUE NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  customer_id     UUID NOT NULL REFERENCES users(id),
  worker_id       UUID NOT NULL REFERENCES workers(id),
  rating          SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment         TEXT,
  photo_urls      JSONB DEFAULT '[]',     -- array of Cloudinary URLs
  worker_reply    TEXT,
  worker_reply_at TIMESTAMPTZ,
  is_verified     BOOLEAN DEFAULT true,    -- verified = real booking
  helpful_count   INTEGER DEFAULT 0,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_reviews_worker   ON reviews(worker_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reviews_rating   ON reviews(worker_id, rating);
DROP TRIGGER IF EXISTS trg_reviews_updated ON reviews;
CREATE TRIGGER trg_reviews_updated BEFORE UPDATE ON reviews
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ═══════════════════════════════════════════════════════════
-- 10. COUPONS
-- ═══════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS coupons (
  code              VARCHAR(40) PRIMARY KEY,
  type              VARCHAR(20) NOT NULL,        -- 'percentage' | 'flat'
  value             INTEGER NOT NULL,
  max_discount      INTEGER,
  min_order         INTEGER,
  description       TEXT,
  category_filter   VARCHAR(80),                 -- optional category-specific
  first_time_only   BOOLEAN DEFAULT false,
  active            BOOLEAN DEFAULT true,
  valid_from        TIMESTAMPTZ,
  valid_until       TIMESTAMPTZ,
  usage_count       INTEGER DEFAULT 0,
  usage_limit       INTEGER,
  created_at        TIMESTAMPTZ DEFAULT NOW()
);

-- ═══════════════════════════════════════════════════════════
-- 11. REWARDS  (referral / loyalty points)
-- ═══════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS rewards (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id           UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  referral_code     VARCHAR(20) UNIQUE NOT NULL,
  points            INTEGER DEFAULT 0,
  lifetime_points   INTEGER DEFAULT 0,
  referrals_count   INTEGER DEFAULT 0,
  referred_by       VARCHAR(20),                -- referrer's code
  transactions      JSONB DEFAULT '[]',         -- log of point transactions
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_rewards_user ON rewards(user_id);
CREATE INDEX IF NOT EXISTS idx_rewards_code ON rewards(referral_code);
DROP TRIGGER IF EXISTS trg_rewards_updated ON rewards;
CREATE TRIGGER trg_rewards_updated BEFORE UPDATE ON rewards
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ═══════════════════════════════════════════════════════════
-- 12. CHAT_MESSAGES  (for future in-app chat)
-- ═══════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS chat_messages (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id      UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  sender_type     VARCHAR(10) NOT NULL,        -- 'customer' | 'worker'
  sender_id       UUID NOT NULL,
  message_type    VARCHAR(20) DEFAULT 'text',  -- 'text' | 'image' | 'voice'
  content         TEXT,
  media_url       TEXT,
  is_read         BOOLEAN DEFAULT false,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_chat_booking ON chat_messages(booking_id, created_at);

-- ═══════════════════════════════════════════════════════════
-- 13. NOTIFICATIONS  (for FCM push history)
-- ═══════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS notifications (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL,             -- could be user or worker id
  user_type       VARCHAR(10) NOT NULL,      -- 'user' | 'worker'
  title           VARCHAR(160) NOT NULL,
  body            TEXT,
  data            JSONB DEFAULT '{}',
  fcm_token       VARCHAR(255),
  is_read         BOOLEAN DEFAULT false,
  sent_at         TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_notif_user ON notifications(user_id, sent_at DESC);

-- ═══════════════════════════════════════════════════════════
-- 14. WORKER_LOCATIONS  (real-time tracking history — optional)
-- ═══════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS worker_locations (
  id              BIGSERIAL PRIMARY KEY,
  worker_id       UUID NOT NULL REFERENCES workers(id) ON DELETE CASCADE,
  booking_id      UUID REFERENCES bookings(id),
  latitude        DOUBLE PRECISION NOT NULL,
  longitude       DOUBLE PRECISION NOT NULL,
  recorded_at     TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_loc_worker_time ON worker_locations(worker_id, recorded_at DESC);
CREATE INDEX IF NOT EXISTS idx_loc_booking     ON worker_locations(booking_id, recorded_at);

-- ═══════════════════════════════════════════════════════════
-- 15. COMPLAINTS
-- ═══════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS complaints (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id      UUID NOT NULL REFERENCES bookings(id),
  booking_number  VARCHAR(30),
  customer_id     UUID NOT NULL REFERENCES users(id),
  issue           VARCHAR(255) NOT NULL,
  details         TEXT,
  status          VARCHAR(20) DEFAULT 'open',  -- open|investigating|resolved
  resolved_at     TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_complaints_booking  ON complaints(booking_id);
CREATE INDEX IF NOT EXISTS idx_complaints_customer ON complaints(customer_id);

-- ═══════════════════════════════════════════════════════════
-- ALTER — Add new columns to existing tables
-- (Safe to run multiple times — IF NOT EXISTS guards)
-- ═══════════════════════════════════════════════════════════

-- Workers: gallery, aadhaar, schedule (added in Session 3)
ALTER TABLE workers ADD COLUMN IF NOT EXISTS aadhaar_url      TEXT;
ALTER TABLE workers ADD COLUMN IF NOT EXISTS aadhaar_public_id VARCHAR(255);
ALTER TABLE workers ADD COLUMN IF NOT EXISTS gallery          JSONB DEFAULT '[]';
ALTER TABLE workers ADD COLUMN IF NOT EXISTS schedule         JSONB DEFAULT '{}';
ALTER TABLE workers ADD COLUMN IF NOT EXISTS fcm_token        TEXT;

-- Users: referral code (added in Session 2)
ALTER TABLE users ADD COLUMN IF NOT EXISTS referral_code     VARCHAR(20) UNIQUE;

-- Bookings: proof photos, promo code (added in Session 3)
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS proof_photos    JSONB DEFAULT '[]';
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS promo_code      VARCHAR(40);
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS discount_amount INTEGER DEFAULT 0;

-- ═══════════════════════════════════════════════════════════
-- SEED — Default categories
-- ═══════════════════════════════════════════════════════════
INSERT INTO categories (name, name_hindi, emoji, base_price) VALUES
  ('Plumber',     'प्लंबर',      '🔧', 299),
  ('Electrician', 'इलेक्ट्रीशियन','⚡', 349),
  ('AC Repair',   'एसी मरम्मत',  '❄️', 499),
  ('Cleaning',    'सफाई',        '✨', 249),
  ('Carpenter',   'बढ़ई',        '🪵', 399),
  ('Cook',        'रसोइया',      '👨‍🍳', 499),
  ('Beauty',      'ब्यूटी',      '💄', 599),
  ('Painter',     'पेंटर',       '🎨', 699)
ON CONFLICT (name) DO NOTHING;

-- SEED — Default coupons
INSERT INTO coupons (code, type, value, description, first_time_only, active) VALUES
  ('WELCOME30', 'percentage', 30, 'New user — 30% off first booking', true,  true),
  ('DIWALI50',  'percentage', 50, 'Diwali special — 50% off',          false, true),
  ('UJJAIN10',  'percentage', 10, 'Ujjain local discount — 10% off',   false, true),
  ('REFER200',  'percentage', 20, 'Referral bonus — 20% off',          false, true),
  ('FIRST50',   'percentage', 50, 'First booking — 50% off',           true,  true)
ON CONFLICT (code) DO NOTHING;

-- ═══════════════════════════════════════════════════════════
-- DONE
-- ═══════════════════════════════════════════════════════════
SELECT 'Seva Setu schema ready' AS status;
