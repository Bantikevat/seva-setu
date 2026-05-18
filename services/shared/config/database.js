/**
 * UNIVERSAL DATABASE — JSON file (dev) ↔ PostgreSQL (production)
 * ─────────────────────────────────────────────────────────────
 * Har service yahi file use karegi.
 * DATABASE_URL nahi hai → JSON file
 * DATABASE_URL set hai  → Supabase/Neon Postgres
 *
 * API same rahega — zero controller changes needed:
 *   const { readDb, writeDb, query, testConnection } = require('@seva-setu/shared/config/database');
 */

require('dotenv').config();
const fs     = require('fs');
const path   = require('path');
const crypto = require('crypto');

const DATABASE_URL = process.env.DATABASE_URL;
const USE_PG = !!DATABASE_URL;

// ─── Shared logger (safe fallback if service logger not available) ───
const log = {
  info:  (...a) => console.log('[DB]', ...a),
  error: (...a) => console.error('[DB ERROR]', ...a),
};

// ═══════════════════════════════════════════════════════
// POSTGRES MODE
// ═══════════════════════════════════════════════════════
let pgPool = null;

const initPg = async () => {
  if (pgPool) return pgPool;
  const { Pool } = require('pg');
  pgPool = new Pool({
    connectionString: DATABASE_URL,
    ssl: DATABASE_URL.includes('supabase') || DATABASE_URL.includes('neon')
      ? { rejectUnauthorized: false }
      : false,
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
  });
  await pgPool.query('SELECT 1');
  return pgPool;
};

// Raw SQL query (Postgres only)
const query = async (text, params = []) => {
  if (!USE_PG) {
    log.error('query() called in JSON mode — use readDb/writeDb instead');
    return { rows: [], rowCount: 0 };
  }
  const pool = await initPg();
  return pool.query(text, params);
};

// ═══════════════════════════════════════════════════════
// JSON MODE
// ═══════════════════════════════════════════════════════
const getJsonPath = (serviceDataDir) => {
  // Each service passes its own data directory
  if (serviceDataDir) return path.join(serviceDataDir, 'database.json');
  // Default: walk up to find auth-service data (legacy single-db mode)
  return path.join(__dirname, '../../auth-service/data/database.json');
};

const readDb = (serviceDataDir) => {
  const dbPath = getJsonPath(serviceDataDir);
  if (!fs.existsSync(dbPath)) {
    fs.mkdirSync(path.dirname(dbPath), { recursive: true });
    fs.writeFileSync(dbPath, JSON.stringify({ users: [], workers: [], bookings: [], categories: [], addresses: [], rewards: [], reviews: [] }, null, 2));
  }
  return JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
};

const writeDb = (data, serviceDataDir) => {
  const dbPath = getJsonPath(serviceDataDir);
  fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
};

// ═══════════════════════════════════════════════════════
// UNIVERSAL CRUD (works in both modes)
// ═══════════════════════════════════════════════════════
const db = {
  // Find many rows
  find: async (table, where = {}, opts = {}) => {
    if (USE_PG) {
      const pool = await initPg();
      const keys   = Object.keys(where);
      const vals   = Object.values(where);
      const clause = keys.length
        ? 'WHERE ' + keys.map((k, i) => `"${k}" = $${i + 1}`).join(' AND ')
        : '';
      const order = opts.orderBy ? `ORDER BY ${opts.orderBy}` : '';
      const limit  = opts.limit  ? `LIMIT ${opts.limit}` : '';
      const res = await pool.query(`SELECT * FROM "${table}" ${clause} ${order} ${limit}`, vals);
      return res.rows;
    }
    const data = readDb(opts.dataDir);
    const rows  = data[table] || [];
    if (!Object.keys(where).length) return rows;
    return rows.filter((r) => Object.entries(where).every(([k, v]) => r[k] === v));
  },

  // Find one row
  findOne: async (table, where, opts = {}) => {
    const rows = await db.find(table, where, { ...opts, limit: 1 });
    return rows[0] || null;
  },

  // Insert a row — returns inserted row
  insert: async (table, row, opts = {}) => {
    const newRow = {
      id:         row.id         || crypto.randomUUID(),
      created_at: row.created_at || new Date().toISOString(),
      updated_at: row.updated_at || new Date().toISOString(),
      ...row,
    };
    if (USE_PG) {
      const pool = await initPg();
      const keys   = Object.keys(newRow);
      const vals   = Object.values(newRow);
      const cols   = keys.map((k) => `"${k}"`).join(', ');
      const params = keys.map((_, i) => `$${i + 1}`).join(', ');
      const res = await pool.query(`INSERT INTO "${table}" (${cols}) VALUES (${params}) RETURNING *`, vals);
      return res.rows[0];
    }
    const data = readDb(opts.dataDir);
    if (!data[table]) data[table] = [];
    data[table].push(newRow);
    writeDb(data, opts.dataDir);
    return newRow;
  },

  // Update rows matching where — returns rowCount
  update: async (table, where, patch, opts = {}) => {
    const updated = { ...patch, updated_at: new Date().toISOString() };
    if (USE_PG) {
      const pool = await initPg();
      const pKeys = Object.keys(updated);
      const pVals = Object.values(updated);
      const set   = pKeys.map((k, i) => `"${k}" = $${i + 1}`).join(', ');
      const wKeys = Object.keys(where);
      const wVals = Object.values(where);
      const clause = wKeys.map((k, i) => `"${k}" = $${pKeys.length + i + 1}`).join(' AND ');
      const res = await pool.query(
        `UPDATE "${table}" SET ${set} WHERE ${clause}`,
        [...pVals, ...wVals]
      );
      return res.rowCount;
    }
    const data = readDb(opts.dataDir);
    let count = 0;
    for (let i = 0; i < (data[table] || []).length; i++) {
      const match = Object.entries(where).every(([k, v]) => data[table][i][k] === v);
      if (match) { data[table][i] = { ...data[table][i], ...updated }; count++; }
    }
    if (count > 0) writeDb(data, opts.dataDir);
    return count;
  },

  // Delete rows
  delete: async (table, where, opts = {}) => {
    if (USE_PG) {
      const pool = await initPg();
      const keys   = Object.keys(where);
      const vals   = Object.values(where);
      const clause = keys.map((k, i) => `"${k}" = $${i + 1}`).join(' AND ');
      const res = await pool.query(`DELETE FROM "${table}" WHERE ${clause}`, vals);
      return res.rowCount;
    }
    const data = readDb(opts.dataDir);
    const before = (data[table] || []).length;
    data[table]  = (data[table] || []).filter(
      (r) => !Object.entries(where).every(([k, v]) => r[k] === v)
    );
    const removed = before - data[table].length;
    if (removed > 0) writeDb(data, opts.dataDir);
    return removed;
  },

  // Raw SQL — only works in Postgres mode
  raw: async (sql, params = []) => {
    if (!USE_PG) throw new Error('raw() requires DATABASE_URL (Postgres mode)');
    return query(sql, params);
  },
};

// ═══════════════════════════════════════════════════════
// CONNECTION TEST — called on service startup
// ═══════════════════════════════════════════════════════
const testConnection = async (serviceDataDir) => {
  if (USE_PG) {
    try {
      await initPg();
      log.info('✅ PostgreSQL connected (Supabase)');
    } catch (err) {
      log.error('❌ PostgreSQL connection failed:', err.message);
      log.error('   → Check DATABASE_URL in .env');
      process.exit(1);
    }
  } else {
    // JSON mode — just ensure file exists
    try {
      readDb(serviceDataDir);
      log.info('✅ JSON database ready (dev mode)');
    } catch (err) {
      log.error('❌ JSON database init failed:', err.message);
      process.exit(1);
    }
  }
};

const closePool = async () => {
  if (pgPool) await pgPool.end();
};

module.exports = {
  USE_PG,
  readDb,
  writeDb,
  query,
  testConnection,
  closePool,
  ...db,  // find, findOne, insert, update, delete, raw
};
