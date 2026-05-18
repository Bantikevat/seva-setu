/**
 * Firebase Cloud Messaging Service Worker
 * -------------------------------------------------
 * Handles push notifications when the app is in background or closed.
 *
 * Config is loaded from /firebase-config.json (read at install time)
 * so we don't bundle secrets. If config is missing, SW does nothing.
 */

importScripts('https://www.gstatic.com/firebasejs/10.13.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.13.0/firebase-messaging-compat.js');

self.addEventListener('install', (e) => {
  e.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', (e) => {
  e.waitUntil(self.clients.claim());
});

// Load config dynamically (set by main thread postMessage on first registration)
let initialized = false;
const initFirebase = (config) => {
  if (initialized) return;
  if (!config?.apiKey || !config?.projectId) return;
  firebase.initializeApp(config);
  const messaging = firebase.messaging();

  messaging.onBackgroundMessage((payload) => {
    const title = payload.notification?.title || 'Seva Setu';
    const body  = payload.notification?.body  || '';
    const data  = payload.data || {};

    self.registration.showNotification(title, {
      body,
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      data,
      actions: data.type === 'chat' ? [{ action: 'reply', title: 'Reply' }] : undefined,
    });
  });
  initialized = true;
};

// Listen for config message from main thread
self.addEventListener('message', (event) => {
  if (event.data?.type === 'INIT_FIREBASE') {
    initFirebase(event.data.config);
  }
});

// Click → focus / open relevant app URL
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const data = event.notification.data || {};
  const url  = data.click_action || data.url || '/';

  event.waitUntil(
    self.clients.matchAll({ type: 'window' }).then((clientsArr) => {
      const existing = clientsArr.find((c) => c.url.includes(self.location.origin));
      if (existing) {
        existing.focus();
        existing.postMessage({ type: 'PUSH_CLICK', url, data });
      } else {
        self.clients.openWindow(url);
      }
    })
  );
});
