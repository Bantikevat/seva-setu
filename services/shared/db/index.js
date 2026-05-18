/**
 * SHARED DB LAYER — JSON file ↔ PostgreSQL adapter
 * -------------------------------------------------
 * Services use this instead of reading JSON directly.
 *
 * Mode selected automatically by DATABASE_URL env var:
 *   - DATABASE_URL set    → PostgreSQL (production)
 *   - DATABASE_URL blank  → JSON file (dev)
 *
 * API surface (compatible with old readDb / writeDb):
 *   const db = require('@seva-setu/shared-db');
 *   await db.init();
 *   const users = await db.find('users');
 *   const user  = await db.findOne('users', { phone: '9876543210' });
 *   await db.insert('users', { phone, name });
 *   await db.update('users', { id }, { name: 'New name' });
 *   await db.delete('users', { id });
 *
 * For complex queries use db.raw() with a Postgres client.
 */

const fs   = require('fs');
const path = require('path');

const JSON_PATH = path.join(__dirname, '../../auth-service/data/database.json');
const USE_PG   = !!process.env.DATABASE_URL;

let pgPool = null;

// ═══ JSON ADAPTER ═══
const jsonAdapter = {
  _read:  () => JSON.parse(fs.readFileSync(JSON_PATH, 'utf-8')),
  _write: (data) => fs.writeFileSync(JSON_PATH, JSON.stringify(data, null, 2)),

  find: async (table, where = {}) => {
    const db = jsonAdapter._read();
    const rows = db[table] || [];
    if (Object.keys(where).length === 0) return rows;
    return rows.filter((r) =>
      Object.entries(where).every(([k, v]) => r[k] === v)
    );
  },

  findOne: async (table, where) => {
    const rows = await jsonAdapter.find(table, where);
    return rows[0] || null;
  },

  insert: async (table, row) => {
    const db = jsonAdapter._read();
    if (!db[table]) db[table] = [];
    const newRow = {
      ...row,
      id:         row.id         || require('crypto').randomUUID(),
      created_at: row.created_at || new Date().toISOString(),
      updated_at: row.updated_at || new Date().toISOString(),
    };
    db[table].push(newRow);
    jsonAdapter._write(db);
    return newRow;
  },

  update: async (table, where, patch) => {
    const db = jsonAdapter._read();
    const rows = db[table] || [];
    let updated = 0;
    for (let i = 0; i < rows.length; i++) {
      const match = Object.entries(where).every(([k, v]) => rows[i][k] === v);
      if (match) {
        rows[i] = { ...rows[i], ...patch, updated_at: new Date().toISOString() };
        updated++;
      }
    }
    if (updated > 0) jsonAdapter._write(db);
    return updated;
  },

  delete: async (table, where) => {
    const db = jsonAdapter._read();
    const before = (db[table] || []).length;
    db[table] = (db[table] || []).filter((r) =>
      !Object.entries(where).every(([k, v]) => r[k] === v)
    );
    const removed = before - db[table].length;
    if (removed > 0) jsonAdapter._write(db);
    return removed;
  },

  raw: async () => {
    throw new Error('raw() only works in Postgres mode. Set DATABASE_URL.');
  },
};

// ═══ POSTGRES ADAPTER ═══
const pgAdapter = {
  init: async () => {
    const { Pool } = require('pg');
    pgPool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.DATABASE_URL?.includes('supabase') || process.env.DATABASE_URL?.includes('neon')
        ? { rejectUnauthorized: false }
        : false,
      max: 10,
      idleTimeoutMillis: 30000,
    });
    await pgPool.query('SELECT 1');  // health check
    return pgPool;
  },

  /**
   * Build WHERE clause from object
   * { id: '...', is_active: 1 } → "WHERE id = $1 AND is_active = $2"
   */
  _buildWhere: (where, paramOffset = 0) => {
    const keys   = Object.keys(where);
    const values = Object.values(where);
    const clause = keys.length
      ? 'WHERE ' + keys.map((k, i) => `"${k}" = $${i + 1 + paramOffset}`).join(' AND ')
      : '';
    return { clause, values };
  },

  find: async (table, where = {}) => {
    const { clause, values } = pgAdapter._buildWhere(where);
    const sql = `SELECT * FROM "${table}" ${clause}`;
    const res = await pgPool.query(sql, values);
    return res.rows;
  },

  findOne: async (table, where) => {
    const rows = await pgAdapter.find(table, where);
    return rows[0] || null;
  },

  insert: async (table, row) => {
    const keys   = Object.keys(row);
    const values = Object.values(row);
    const cols   = keys.map((k) => `"${k}"`).join(', ');
    const params = keys.map((_, i) => `$${i + 1}`).join(', ');
    const sql    = `INSERT INTO "${table}" (${cols}) VALUES (${params}) RETURNING *`;
    const res    = await pgPool.query(sql, values);
    return res.rows[0];
  },

  update: async (table, where, patch) => {
    const patchKeys = Object.keys(patch);
    const patchVals = Object.values(patch);
    const setClause = patchKeys.map((k, i) => `"${k}" = $${i + 1}`).join(', ');
    const { clause, values: whereVals } = pgAdapter._buildWhere(where, patchKeys.length);
    const sql = `UPDATE "${table}" SET ${setClause} ${clause}`;
    const res = await pgPool.query(sql, [...patchVals, ...whereVals]);
    return res.rowCount;
  },

  delete: async (table, where) => {
    const { clause, values } = pgAdapter._buildWhere(where);
    const sql = `DELETE FROM "${table}" ${clause}`;
    const res = await pgPool.query(sql, values);
    return res.rowCount;
  },

  /**
   * Escape hatch — raw SQL for complex queries
   *   await db.raw('SELECT * FROM workers WHERE rating_average > $1', [4.5]);
   */
  raw: async (sql, params = []) => {
    const res = await pgPool.query(sql, params);
    return res.rows;
  },

  close: async () => {
    if (pgPool) await pgPool.end();
  },
};

// ═══ EXPORTED API ═══
const db = USE_PG ? pgAdapter : jsonAdapter;

module.exports = {
  ...db,
  USE_PG,
  init: async () => {
    if (USE_PG && !pgPool) await pgAdapter.init();
    return true;
  },
};
