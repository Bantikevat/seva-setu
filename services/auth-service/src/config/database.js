/**
 * AUTH SERVICE — Database config
 * Auto-switches: JSON (dev) ↔ PostgreSQL when DATABASE_URL is set
 */
const path = require('path');
const shared = require('../../../../services/shared/config/database');

const DATA_DIR = path.join(__dirname, '../../data');

// Re-export with this service's data directory bound in
module.exports = {
  ...shared,
  readDb:  () => shared.readDb(DATA_DIR),
  writeDb: (data) => shared.writeDb(data, DATA_DIR),
  testConnection: () => shared.testConnection(DATA_DIR),
};
