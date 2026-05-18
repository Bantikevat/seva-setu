/**
 * LOGGER UTILITY
 * Same as auth-service. Timestamp + colors.
 */

const config = require('../config/env');

const colors = {
  reset:  '\x1b[0m',
  green:  '\x1b[32m',
  red:    '\x1b[31m',
  yellow: '\x1b[33m',
  gray:   '\x1b[90m',
};

const getTimestamp = () => {
  return new Date().toISOString().replace('T', ' ').substring(0, 19);
};

const logger = {
  info:  (...args) => console.log(`${colors.green}[INFO]${colors.reset}`,  `${colors.gray}${getTimestamp()}${colors.reset}`, ...args),
  error: (...args) => console.error(`${colors.red}[ERROR]${colors.reset}`, `${colors.gray}${getTimestamp()}${colors.reset}`, ...args),
  warn:  (...args) => console.warn(`${colors.yellow}[WARN]${colors.reset}`, `${colors.gray}${getTimestamp()}${colors.reset}`, ...args),
  debug: (...args) => { if (config.isDev) console.log(`${colors.gray}[DEBUG] ${getTimestamp()}`, ...args, colors.reset); },
};

module.exports = logger;
