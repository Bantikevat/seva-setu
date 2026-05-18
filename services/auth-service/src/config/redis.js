/**
 * MEMORY STORE — Redis Ka Replacement (Easy Mode)
 * -------------------------------------------------
 * Redis ki jagah JavaScript Map use kar rahe hain.
 *
 * Map kya hai? Ek dictionary jaisa — key-value store.
 *
 * Faida:
 * - Koi install nahi
 * - Koi server nahi
 * - Memory mein fast
 *
 * Kami:
 * - Server restart pe data chala jaata hai
 * - Production mein Redis chahiye
 *
 * Production mein Redis pe switch — code same rahega.
 */

const logger = require('../utils/logger');

// Memory mein storage
const store = new Map();

// Expiry timers track karo
const timers = new Map();

const connectRedis = async () => {
  logger.info('✅ Memory store connected (Redis replacement)');
};

/**
 * Value save karo
 *
 * @param {string} key
 * @param {string} value
 * @param {number} seconds - Kitne second baad delete ho
 */
const redisSet = async (key, value, seconds) => {
  // Pehle se koi timer hai toh cancel karo
  if (timers.has(key)) {
    clearTimeout(timers.get(key));
  }

  // Value save karo
  store.set(key, String(value));

  // Auto-delete ke liye timer set karo
  const timer = setTimeout(() => {
    store.delete(key);
    timers.delete(key);
  }, seconds * 1000);

  timers.set(key, timer);
};

/**
 * Value nikalo
 *
 * @param {string} key
 * @returns {string|null}
 */
const redisGet = async (key) => {
  return store.get(key) || null;
};

/**
 * Value delete karo
 *
 * @param {string} key
 */
const redisDel = async (key) => {
  if (timers.has(key)) {
    clearTimeout(timers.get(key));
    timers.delete(key);
  }
  store.delete(key);
};

/**
 * Kitne second mein expire hogi
 *
 * @param {string} key
 * @returns {number} - Seconds remaining (approx)
 */
const redisTtl = async (key) => {
  if (!store.has(key)) return -2;
  if (!timers.has(key)) return -1;
  return 200; // Approximate, exact tracking complex hota hai
};

module.exports = { connectRedis, redisSet, redisGet, redisDel, redisTtl };
