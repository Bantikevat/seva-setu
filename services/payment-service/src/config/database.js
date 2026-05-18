/**
 * payment-service - Database config
 * JSON mode (Postgres comes later)
 */
const path = require('path');
const shared  = require('../../../../services/shared/config/database');
const helpers = require('../../../../services/shared/config/json-helpers');

const DATA_DIR = path.join(__dirname, '../../data');

module.exports = {
  ...shared,
  ...helpers(DATA_DIR),
  readDb:  () => shared.readDb(DATA_DIR),
  writeDb: (data) => shared.writeDb(data, DATA_DIR),
  testConnection: () => shared.testConnection(DATA_DIR),
};