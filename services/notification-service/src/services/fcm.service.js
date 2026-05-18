/**
 * FCM SERVICE — Firebase Cloud Messaging
 * -------------------------------------------------
 * Sends push notifications using FCM HTTP v1 API.
 *
 * Setup:
 *   1. Firebase Console → project → Project Settings → Service Accounts
 *   2. Generate new private key (JSON file)
 *   3. Open the JSON, copy these 3 values into .env:
 *        FIREBASE_PROJECT_ID=seva-setu-xxx
 *        FIREBASE_CLIENT_EMAIL=firebase-adminsdk-...@seva-setu-xxx.iam.gserviceaccount.com
 *        FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMII...\n-----END PRIVATE KEY-----\n"
 *      (yes, escape newlines as \n)
 *   4. Restart notification-service
 *
 * Without these env vars set, push notifications are logged to console only (dev mode).
 *
 * Flow:
 *   1. Get OAuth2 access token using service account JWT
 *   2. POST to https://fcm.googleapis.com/v1/projects/<id>/messages:send
 *   3. Cache token for 50 min (Google issues 1-hour tokens)
 */

const crypto = require('crypto');
const logger = require('../utils/logger');

const PROJECT_ID   = process.env.FIREBASE_PROJECT_ID;
const CLIENT_EMAIL = process.env.FIREBASE_CLIENT_EMAIL;
const PRIVATE_KEY  = (process.env.FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n');

const isConfigured = () => !!(PROJECT_ID && CLIENT_EMAIL && PRIVATE_KEY);

// ── OAuth2 token cache ──
let cachedToken = null;
let tokenExpiresAt = 0;

const base64url = (input) =>
  Buffer.from(input).toString('base64')
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');

/**
 * Get OAuth2 access token via JWT bearer flow.
 * Caches token for ~55 min.
 */
const getAccessToken = async () => {
  if (cachedToken && Date.now() < tokenExpiresAt) return cachedToken;

  const now = Math.floor(Date.now() / 1000);
  const header  = base64url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  const payload = base64url(JSON.stringify({
    iss:   CLIENT_EMAIL,
    scope: 'https://www.googleapis.com/auth/firebase.messaging',
    aud:   'https://oauth2.googleapis.com/token',
    exp:   now + 3600,
    iat:   now,
  }));
  const signInput = `${header}.${payload}`;
  const signer = crypto.createSign('RSA-SHA256');
  signer.update(signInput);
  const signature = base64url(signer.sign(PRIVATE_KEY));
  const jwt = `${signInput}.${signature}`;

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt,
    }).toString(),
  });

  const data = await res.json();
  if (!data.access_token) {
    logger.error('FCM token fetch failed:', data);
    throw new Error('FCM auth failed: ' + (data.error_description || data.error || 'unknown'));
  }

  cachedToken = data.access_token;
  tokenExpiresAt = Date.now() + 55 * 60 * 1000;
  return cachedToken;
};

const fcmService = {
  isConfigured,

  /**
   * Send a push notification.
   *
   * @param {string|string[]} fcmToken  device token (or array — sends sequentially)
   * @param {object} options
   * @param {string} options.title
   * @param {string} options.body
   * @param {object} [options.data]   Custom data payload (string values only)
   * @param {string} [options.click_action]  URL to open when tapped
   * @returns {Promise<{success, error?, results?}>}
   */
  send: async (fcmToken, { title, body, data = {}, click_action }) => {
    if (!isConfigured()) {
      logger.info(`[FCM dev] Would send to ${typeof fcmToken === 'string' ? fcmToken.slice(0, 20) : fcmToken.length + ' tokens'}: "${title}" — "${body}"`);
      return { success: true, mock: true };
    }

    const tokens = Array.isArray(fcmToken) ? fcmToken : [fcmToken];
    const results = [];

    try {
      const accessToken = await getAccessToken();
      const url = `https://fcm.googleapis.com/v1/projects/${PROJECT_ID}/messages:send`;

      for (const token of tokens) {
        if (!token) continue;
        // Stringify data values (FCM requires strings)
        const stringData = Object.fromEntries(
          Object.entries(data).map(([k, v]) => [k, typeof v === 'string' ? v : JSON.stringify(v)])
        );

        const message = {
          token,
          notification: { title, body },
          data: stringData,
          webpush: click_action ? { fcm_options: { link: click_action } } : undefined,
          android: { priority: 'high', notification: { sound: 'default' } },
          apns: { payload: { aps: { sound: 'default' } } },
        };

        try {
          const res = await fetch(url, {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ message }),
          });
          const json = await res.json();
          if (json.error) {
            logger.error(`FCM send failed (${token.slice(0, 16)}...): ${json.error.message}`);
            results.push({ token: token.slice(0, 16), success: false, error: json.error.message });
          } else {
            results.push({ token: token.slice(0, 16), success: true, name: json.name });
          }
        } catch (err) {
          results.push({ token: token.slice(0, 16), success: false, error: err.message });
        }
      }

      const okCount = results.filter((r) => r.success).length;
      logger.info(`FCM sent: ${okCount}/${tokens.length}`);
      return { success: okCount > 0, results };
    } catch (err) {
      logger.error('FCM error:', err.message);
      return { success: false, error: err.message };
    }
  },
};

module.exports = fcmService;
