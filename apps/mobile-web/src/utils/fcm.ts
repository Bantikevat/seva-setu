/**
 * FCM helpers â€” register device token, listen for foreground messages
 *
 * Setup:
 *   1. Firebase Console â†’ Project Settings â†’ General â†’ "Your apps" â†’ Add Web app
 *   2. Copy the firebaseConfig and put it in apps/mobile-web/.env as:
 *        VITE_FIREBASE_API_KEY=AIzaSy...
 *        VITE_FIREBASE_AUTH_DOMAIN=seva-setu.firebaseapp.com
 *        VITE_FIREBASE_PROJECT_ID=seva-setu
 *        VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
 *        VITE_FIREBASE_APP_ID=1:123456...
 *        VITE_FIREBASE_VAPID_KEY=BL...   (from Cloud Messaging â†’ Web Push certificates)
 *   3. Same project's service-account JSON â†’ backend .env (FIREBASE_PRIVATE_KEY etc.)
 *
 * Without VITE_FIREBASE_* env vars, this module is a no-op (graceful degrade).
 */

import { initializeApp, type FirebaseApp } from 'firebase/app';
import { logger } from '@/utils/logger';
import {
  getMessaging,
  getToken,
  onMessage,
  isSupported,
  type Messaging,
} from 'firebase/messaging';

const env = (import.meta as any).env || {};

const firebaseConfig = {
  apiKey:            env.VITE_FIREBASE_API_KEY,
  authDomain:        env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId:         env.VITE_FIREBASE_PROJECT_ID,
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId:             env.VITE_FIREBASE_APP_ID,
};
const VAPID_KEY = env.VITE_FIREBASE_VAPID_KEY as string | undefined;

const NOTIFY_URL = (env.VITE_NOTIFY_API as string | undefined) || 'http://localhost:3005';

let app: FirebaseApp | null = null;
let messaging: Messaging | null = null;

const isConfigured = () => !!(firebaseConfig.apiKey && firebaseConfig.projectId && VAPID_KEY);

/**
 * Initialize Firebase once. Idempotent.
 */
export const initFcm = async (): Promise<Messaging | null> => {
  if (!isConfigured()) return null;
  if (messaging) return messaging;
  if (!(await isSupported())) {
    logger.warn('[FCM] Browser does not support messaging');
    return null;
  }
  app = initializeApp(firebaseConfig);
  messaging = getMessaging(app);
  return messaging;
};

/**
 * Ask for notification permission + register the device token with backend.
 * Call this after login.
 */
export const registerPush = async (userId: string, userType: 'user' | 'worker' = 'user'): Promise<string | null> => {
  if (!isConfigured()) {
    logger.info('[FCM] Not configured â€” skipping push registration');
    return null;
  }

  try {
    const m = await initFcm();
    if (!m) return null;

    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      logger.info('[FCM] Permission not granted:', permission);
      return null;
    }

    // Register service worker (Vite serves /firebase-messaging-sw.js from public/)
    let swReg: ServiceWorkerRegistration | undefined;
    if ('serviceWorker' in navigator) {
      swReg = await navigator.serviceWorker.register('/firebase-messaging-sw.js', { scope: '/' });
      // Pass config to SW so it can initialize Firebase
      const ready = await navigator.serviceWorker.ready;
      ready.active?.postMessage({ type: 'INIT_FIREBASE', config: firebaseConfig });
    }

    const token = await getToken(m, { vapidKey: VAPID_KEY!, serviceWorkerRegistration: swReg });
    if (!token) {
      logger.warn('[FCM] No token returned');
      return null;
    }

    // Send to backend
    await fetch(`${NOTIFY_URL}/notify/fcm/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, userType, token, platform: 'web' }),
    });

    localStorage.setItem('seva_fcm_token', token);
    logger.info('[FCM] Registered âœ“');
    return token;
  } catch (err) {
    logger.error('[FCM] Registration failed:', err);
    return null;
  }
};

/**
 * Subscribe to foreground messages (called when app is open + focused).
 *   const off = onForegroundMessage((payload) => { ... });
 */
export const onForegroundMessage = (handler: (payload: any) => void): (() => void) => {
  if (!messaging) return () => {};
  return onMessage(messaging, handler);
};

/**
 * Remove token from backend on logout
 */
export const unregisterPush = async (): Promise<void> => {
  const token = localStorage.getItem('seva_fcm_token');
  if (!token) return;
  try {
    await fetch(`${NOTIFY_URL}/notify/fcm/unregister`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    });
  } catch {}
  localStorage.removeItem('seva_fcm_token');
};
