/**
 * LOGGER UTILITY
 * -------------------------------------------------
 * console.log ki jagah yeh use karo.
 *
 * Faida:
 * - Timestamp dikhata hai — kab hua pata chalta hai
 * - Level dikhata hai — INFO / ERROR / DEBUG
 * - Production mein DEBUG logs nahi dikhate (performance)
 * - Aage Winston ya Datadog se replace kar sakte hain
 *
 * Levels:
 *   info  → Normal information  (green)
 *   error → Kuch galat hua      (red)
 *   warn  → Warning             (yellow)
 *   debug → Developer ke liye   (gray, sirf development mein)
 */

const config = require('../config/env');

// Colors for terminal — reading easy hota hai
const colors = {
  reset:  '\x1b[0m',
  green:  '\x1b[32m',
  red:    '\x1b[31m',
  yellow: '\x1b[33m',
  gray:   '\x1b[90m',
  blue:   '\x1b[34m',
};

/**
 * Timestamp banao — human readable format
 * Output: "2026-05-13 10:30:45"
 */
const getTimestamp = () => {
  return new Date().toISOString().replace('T', ' ').substring(0, 19);
};

const logger = {
  /**
   * Normal information log
   * Example: logger.info('Server started on port 3001');
   */
  info: (...args) => {
    console.log(
      `${colors.green}[INFO]${colors.reset}`,
      `${colors.gray}${getTimestamp()}${colors.reset}`,
      ...args
    );
  },

  /**
   * Error log — kuch galat hua
   * Example: logger.error('Database connection failed', error.message);
   */
  error: (...args) => {
    console.error(
      `${colors.red}[ERROR]${colors.reset}`,
      `${colors.gray}${getTimestamp()}${colors.reset}`,
      ...args
    );
  },

  /**
   * Warning log
   * Example: logger.warn('OTP attempt limit reaching for phone:', phone);
   */
  warn: (...args) => {
    console.warn(
      `${colors.yellow}[WARN]${colors.reset}`,
      `${colors.gray}${getTimestamp()}${colors.reset}`,
      ...args
    );
  },

  /**
   * Debug log — sirf development mein dikhega
   * Production mein yeh skip ho jaayega
   * Example: logger.debug('Query executed in 45ms');
   */
  debug: (...args) => {
    if (config.isDev) {
      console.log(
        `${colors.gray}[DEBUG] ${getTimestamp()}`,
        ...args,
        colors.reset
      );
    }
  },
};

module.exports = logger;
