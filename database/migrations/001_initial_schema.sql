-- SEVA SETU — Initial Database Schema
-- Migration: 001
-- Date: 2026-05-13

-- Cities
CREATE TABLE IF NOT EXISTS cities (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name        VARCHAR(100) NOT NULL,
    state       VARCHAR(100),
    is_active   BOOLEAN DEFAULT false,
    launched_at TIMESTAMP,
    created_at  TIMESTAMP DEFAULT NOW()
);

-- Users
CREATE TABLE IF NOT EXISTS users (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phone         VARCHAR(10) UNIQUE NOT NULL,
    name          VARCHAR(100),
    email         VARCHAR(100),
    profile_photo TEXT,
    city_id       UUID REFERENCES cities(id),
    is_active     BOOLEAN DEFAULT true,
    created_at    TIMESTAMP DEFAULT NOW(),
    updated_at    TIMESTAMP DEFAULT NOW()
);

-- Workers
CREATE TABLE IF NOT EXISTS workers (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phone            VARCHAR(10) UNIQUE NOT NULL,
    name             VARCHAR(100) NOT NULL,
    profile_photo    TEXT,
    city_id          UUID REFERENCES cities(id),
    is_verified      BOOLEAN DEFAULT false,
    is_available     BOOLEAN DEFAULT true,
    rating_average   DECIMAL(3,2) DEFAULT 0,
    total_jobs       INTEGER DEFAULT 0,
    account_number   VARCHAR(20),
    ifsc_code        VARCHAR(11),
    created_at       TIMESTAMP DEFAULT NOW()
);

-- Categories
CREATE TABLE IF NOT EXISTS categories (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name        VARCHAR(100) NOT NULL,
    name_hindi  VARCHAR(100),
    icon        TEXT,
    base_price  DECIMAL(10,2),
    is_active   BOOLEAN DEFAULT true
);

-- Worker Skills
CREATE TABLE IF NOT EXISTS worker_skills (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    worker_id        UUID REFERENCES workers(id),
    category_id      UUID REFERENCES categories(id),
    experience_years INTEGER,
    is_primary       BOOLEAN DEFAULT false
);

-- Addresses
CREATE TABLE IF NOT EXISTS addresses (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id      UUID REFERENCES users(id),
    label        VARCHAR(50),
    full_address TEXT,
    latitude     DECIMAL(10,8),
    longitude    DECIMAL(11,8),
    city_id      UUID REFERENCES cities(id),
    is_default   BOOLEAN DEFAULT false
);

-- Bookings
CREATE TABLE IF NOT EXISTS bookings (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_number VARCHAR(20) UNIQUE NOT NULL,
    user_id        UUID REFERENCES users(id),
    worker_id      UUID REFERENCES workers(id),
    category_id    UUID REFERENCES categories(id),
    address_id     UUID REFERENCES addresses(id),
    city_id        UUID REFERENCES cities(id),
    status         VARCHAR(20) DEFAULT 'pending',
    scheduled_at   TIMESTAMP NOT NULL,
    started_at     TIMESTAMP,
    completed_at   TIMESTAMP,
    amount         DECIMAL(10,2),
    platform_fee   DECIMAL(10,2),
    worker_payout  DECIMAL(10,2),
    notes          TEXT,
    created_at     TIMESTAMP DEFAULT NOW()
);

-- Payments
CREATE TABLE IF NOT EXISTS payments (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id          UUID REFERENCES bookings(id),
    razorpay_order_id   VARCHAR(100),
    razorpay_payment_id VARCHAR(100),
    amount              DECIMAL(10,2),
    status              VARCHAR(20),
    payment_method      VARCHAR(20),
    created_at          TIMESTAMP DEFAULT NOW()
);

-- Reviews
CREATE TABLE IF NOT EXISTS reviews (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id  UUID REFERENCES bookings(id) UNIQUE,
    user_id     UUID REFERENCES users(id),
    worker_id   UUID REFERENCES workers(id),
    rating      INTEGER CHECK (rating BETWEEN 1 AND 5),
    comment     TEXT,
    created_at  TIMESTAMP DEFAULT NOW()
);

-- Seed: Default categories
INSERT INTO categories (name, name_hindi, base_price) VALUES
('Plumber',      'प्लंबर',     300),
('Electrician',  'इलेक्ट्रीशियन', 350),
('Carpenter',    'बढ़ई',       400),
('Cleaning',     'सफाई',       250),
('Cook',         'रसोइया',     500),
('Beauty',       'ब्यूटीशियन', 450),
('Tutor',        'ट्यूटर',     400),
('Mechanic',     'मैकेनिक',    500);

-- Seed: Sample city
INSERT INTO cities (name, state, is_active) VALUES
('Jaipur', 'Rajasthan', true);
