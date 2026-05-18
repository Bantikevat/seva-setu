const config = require('../config/env');
const colors = { reset: '\x1b[0m', green: '\x1b[32m', red: '\x1b[31m', yellow: '\x1b[33m', gray: '\x1b[90m', cyan: '\x1b[36m' };
const ts = () => new Date().toISOString().replace('T', ' ').substring(0, 19);

module.exports = {
  info:  (...a) => console.log(`${colors.green}[INFO]${colors.reset}`, `${colors.gray}${ts()}${colors.reset}`, ...a),
  error: (...a) => console.error(`${colors.red}[ERROR]${colors.reset}`, `${colors.gray}${ts()}${colors.reset}`, ...a),
  warn:  (...a) => console.warn(`${colors.yellow}[WARN]${colors.reset}`, `${colors.gray}${ts()}${colors.reset}`, ...a),
  debug: (...a) => { if (config.isDev) console.log(`${colors.gray}[DEBUG] ${ts()}`, ...a, colors.reset); },
  payment: (...a) => console.log(`${colors.cyan}[💳 PAYMENT]${colors.reset}`, `${colors.gray}${ts()}${colors.reset}`, ...a),
};
