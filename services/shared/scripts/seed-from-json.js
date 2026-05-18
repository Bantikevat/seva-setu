/**
 * SEED FROM JSON — One-shot migration of dev JSON DB to Postgres
 *
 * Usage:
 *   DATABASE_URL=postgresql://... node scripts/seed-from-json.js
 *
 * Idempotent — uses ON CONFLICT DO NOTHING. Re-running is safe.
 */

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

const fs   = require('fs');
const path = require('path');
const { Pool } = require('pg');

const JSON_PATH = path.join(__dirname, '../../auth-service/data/database.json');

const TABLE_ORDER = [
  'categories',
  'users',
  'addresses',
  'workers',
  'worker_skills',
  'bookings',
  'payments',
  'payouts',
  'reviews',
  'coupons',
  'rewards',
];

// Per-table conflict resolution
const CONFLICT_COL = {
  users:        'phone',
  workers:      'phone',
  categories:   'name',
  coupons:      'code',
  rewards:      'referral_code',
  // others: primary key id
};

// Camel/snake fixups for misc inconsistencies in JSON dev data
const sanitize = (table, row) => {
  const out = { ...row };
  // coupons in dev JSON had camelCase
  if (table === 'coupons') {
    if (out.maxDiscount    !== undefined) { out.max_discount    = out.maxDiscount;    delete out.maxDiscount; }
    if (out.minOrder       !== undefined) { out.min_order       = out.minOrder;       delete out.minOrder; }
    if (out.firstTimeOnly  !== undefined) { out.first_time_only = out.firstTimeOnly;  delete out.firstTimeOnly; }
  }
  // Strip undefined values
  for (const k of Object.keys(out)) if (out[k] === undefined) delete out[k];
  return out;
};

(async () => {
  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL env var not set');
    process.exit(1);
  }

  const data = JSON.parse(fs.readFileSync(JSON_PATH, 'utf-8'));

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

  for (const table of TABLE_ORDER) {
    const rows = data[table] || [];
    if (rows.length === 0) {
      console.log(`  ${table}: 0 rows (skip)`);
      continue;
    }

    let inserted = 0;
    let skipped  = 0;

    for (const raw of rows) {
      const row    = sanitize(table, raw);
      const keys   = Object.keys(row);
      const values = Object.values(row);
      const cols   = keys.map((k) => `"${k}"`).join(', ');
      const params = keys.map((_, i) => `$${i + 1}`).join(', ');
      const conflict = CONFLICT_COL[table] || 'id';
      const sql = `INSERT INTO "${table}" (${cols}) VALUES (${params}) ON CONFLICT ("${conflict}") DO NOTHING`;

      try {
        const res = await pool.query(sql, values);
        if (res.rowCount > 0) inserted++; else skipped++;
      } catch (err) {
        console.error(`  ✗ ${table}[${raw.id || raw.code || raw.phone}]:`, err.message);
        skipped++;
      }
    }

    console.log(`  ${table}: ${inserted} inserted, ${skipped} skipped/duplicate`);
  }

  console.log('\n✓ Seed complete');
  await pool.end();
})();
