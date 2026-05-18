/**
 * MIGRATE — Run schema.sql against Postgres
 * Usage:
 *   DATABASE_URL=postgresql://... node scripts/migrate.js
 */

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

const fs   = require('fs');
const path = require('path');
const { Pool } = require('pg');

(async () => {
  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL env var not set');
    process.exit(1);
  }

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

  const sql = fs.readFileSync(path.join(__dirname, '../db/schema.sql'), 'utf-8');

  console.log('🔨 Running schema...');
  try {
    await pool.query(sql);
    console.log('✓ Schema created successfully');
  } catch (err) {
    console.error('❌ Migration failed:', err.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
})();
