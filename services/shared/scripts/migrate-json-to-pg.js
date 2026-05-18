/**
 * MIGRATION — JSON file data → PostgreSQL
 * ─────────────────────────────────────────
 * Ek baar chalao jab Supabase connect karo.
 * Existing dev data (users, workers, bookings) ko Postgres mein le jayega.
 *
 * Run:  node services/shared/scripts/migrate-json-to-pg.js
 *
 * Zaroori: DATABASE_URL .env mein set honi chahiye
 */

require('dotenv').config({ path: require('path').join(__dirname, '../../auth-service/.env') });

const fs   = require('path');
const path = require('path');
const { Pool } = require('pg');

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL not set. Add it to .env first.');
  process.exit(1);
}

const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

const readJson = (file) => {
  try {
    const p = require('path').join(__dirname, '../../auth-service/data', file);
    return JSON.parse(require('fs').readFileSync(p, 'utf-8'));
  } catch { return null; }
};

const migrate = async () => {
  console.log('🚀 Starting migration: JSON → PostgreSQL\n');

  const db = readJson('database.json');
  if (!db) {
    console.log('⚠️  No database.json found — nothing to migrate. Starting fresh!');
    return;
  }

  const client = await pool.connect();
  let migrated = 0;

  try {
    await client.query('BEGIN');

    // ─── Users ───
    if (db.users?.length) {
      console.log(`📦 Migrating ${db.users.length} users...`);
      for (const u of db.users) {
        await client.query(
          `INSERT INTO users (id, phone, name, email, profile_photo, city_id, created_at, updated_at)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
           ON CONFLICT (phone) DO NOTHING`,
          [u.id, u.phone, u.name || null, u.email || null,
           u.profile_photo || null, u.city_id || null,
           u.created_at || new Date(), u.updated_at || new Date()]
        );
        migrated++;
      }
    }

    // ─── Workers ───
    if (db.workers?.length) {
      console.log(`👷 Migrating ${db.workers.length} workers...`);
      for (const w of db.workers) {
        await client.query(
          `INSERT INTO workers (id, phone, name, bio, profile_photo, is_verified, is_available,
            rating_average, total_jobs, total_earnings, joined_at, updated_at)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
           ON CONFLICT (phone) DO NOTHING`,
          [w.id, w.phone, w.name, w.bio || null, w.profile_photo || null,
           w.is_verified || false, w.is_available !== false,
           w.rating_average || 0, w.total_jobs || 0, w.total_earnings || 0,
           w.joined_at || w.created_at || new Date(),
           w.updated_at || new Date()]
        );
        migrated++;
      }
    }

    // ─── Categories ───
    if (db.categories?.length) {
      console.log(`📂 Migrating ${db.categories.length} categories...`);
      for (const c of db.categories) {
        await client.query(
          `INSERT INTO categories (id, name, name_hindi, emoji, base_price)
           VALUES ($1,$2,$3,$4,$5)
           ON CONFLICT (name) DO NOTHING`,
          [c.id, c.name, c.name_hindi || null, c.emoji || null, c.base_price || 299]
        );
        migrated++;
      }
    }

    // ─── Addresses ───
    if (db.addresses?.length) {
      console.log(`📍 Migrating ${db.addresses.length} addresses...`);
      for (const a of db.addresses) {
        await client.query(
          `INSERT INTO addresses (id, user_id, label, full_address, latitude, longitude, is_default, created_at)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
           ON CONFLICT (id) DO NOTHING`,
          [a.id, a.user_id, a.label, a.full_address,
           a.latitude || null, a.longitude || null,
           a.is_default || false, a.created_at || new Date()]
        );
        migrated++;
      }
    }

    // ─── Bookings ───
    if (db.bookings?.length) {
      console.log(`📋 Migrating ${db.bookings.length} bookings...`);
      for (const b of db.bookings) {
        try {
          await client.query(
            `INSERT INTO bookings (id, booking_number, customer_id, worker_id,
              worker_name, worker_phone, category_name, category_emoji,
              scheduled_at, full_address, base_price, platform_fee,
              total_amount, worker_payout, payment_status, status,
              notes, rating, review, created_at, updated_at)
             VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16::booking_status,$17,$18,$19,$20,$21)
             ON CONFLICT (booking_number) DO NOTHING`,
            [b.id, b.booking_number, b.customer_id, b.worker_id,
             b.worker_name || null, b.worker_phone || null,
             b.category_name || null, b.category_emoji || null,
             b.scheduled_at || null, b.full_address || null,
             b.base_price || 0, b.platform_fee || 0,
             b.total_amount || 0, b.worker_payout || 0,
             b.payment_status || 'pending', b.status || 'pending',
             b.notes || null, b.rating || null, b.review || null,
             b.created_at || new Date(), b.updated_at || new Date()]
          );
          migrated++;
        } catch (e) {
          console.warn(`  ⚠️  Booking ${b.booking_number} skip: ${e.message}`);
        }
      }
    }

    await client.query('COMMIT');
    console.log(`\n✅ Migration complete! ${migrated} rows migrated to PostgreSQL.`);
    console.log('🎉 Ab DATABASE_URL set rakhna — services Postgres use karenge.');

  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Migration failed:', err.message);
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
};

migrate().catch((e) => {
  console.error(e);
  process.exit(1);
});
