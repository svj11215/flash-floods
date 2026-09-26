// Firebase Cloud Messaging Background Service Worker for RESQ Flood Alerts
/* eslint-disable no-undef */
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js');

// Parse config from query parameters or default placeholders
const urlParams = new URLSearchParams(self.location.search);
const firebaseConfig = {
  apiKey: urlParams.get('apiKey') || '',
  authDomain: urlParams.get('authDomain') || '',
  projectId: urlParams.get('projectId') || '',
  storageBucket: urlParams.get('storageBucket') || '',
  messagingSenderId: urlParams.get('messagingSenderId') || '',
  appId: urlParams.get('appId') || ''
};

// Initialize Firebase in Service Worker if config is present
let messaging = null;
try {
  if (firebaseConfig.projectId) {
    firebase.initializeApp(firebaseConfig);
    messaging = firebase.messaging();
  }
} catch (err) {
  console.warn('[SW] Firebase compat init warning:', err);
}

// Background push notification handler
if (messaging) {
  messaging.onBackgroundMessage((payload) => {
    console.log('[SW] Received background message:', payload);
    const notificationTitle = payload.notification?.title || payload.data?.title || '🚨 FLASH FLOOD WARNING';
    const notificationOptions = {
      body: payload.notification?.body || payload.data?.body || 'Your current location is in a HIGH-RISK flood zone. Move to a safer location immediately.',
      icon: '/favicon.svg',
      badge: '/favicon.svg',
      vibrate: [200, 100, 200, 100, 400],
      tag: 'resq-emergency-flood-alert',
      renotify: true,
      requireInteraction: true,
      data: {
        url: payload.data?.url || '/emergency-alert',
        riskLevel: payload.data?.riskLevel || 'HIGH',
        timestamp: Date.now()
      }
    };

    return self.registration.showNotification(notificationTitle, notificationOptions);
  });
}

// Generic Web Push event fallback
self.addEventListener('push', (event) => {
  if (!event.data) return;
  try {
    const data = event.data.json();
    const title = data.notification?.title || data.title || '🚨 FLASH FLOOD WARNING';
    const options = {
      body: data.notification?.body || data.body || 'Your current location is in a HIGH-RISK flood zone. Move to a safer location immediately.',
      icon: '/favicon.svg',
      badge: '/favicon.svg',
      vibrate: [200, 100, 200, 100, 400],
      tag: 'resq-emergency-flood-alert',
      renotify: true,
      requireInteraction: true,
      data: {
        url: data.data?.url || '/emergency-alert',
        riskLevel: data.data?.riskLevel || 'HIGH'
      }
    };
    event.waitUntil(self.registration.showNotification(title, options));
  } catch (e) {
    // If payload is plain text
    const text = event.data.text();
    event.waitUntil(
      self.registration.showNotification('🚨 FLASH FLOOD WARNING', {
        body: text || 'Your current location is in a HIGH-RISK flood zone. Move to a safer location immediately.',
        icon: '/favicon.svg',
        data: { url: '/emergency-alert' }
      })
    );
  }
});

// Notification click event handler: Focus existing tab or open Emergency Alert page
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetPath = (event.notification.data && event.notification.data.url) || '/emergency-alert';
  const targetUrl = new URL(targetPath.startsWith('/') ? '#' + targetPath.slice(1) : targetPath, self.location.origin).href;

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      // If a window is already open, focus it and dispatch navigation
      for (const client of windowClients) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.postMessage({
            type: 'NAVIGATE_TO_EMERGENCY',
            url: targetPath,
            riskLevel: event.notification.data?.riskLevel || 'HIGH'
          });
          return client.focus();
        }
      }
      // If no window is open, open a new window
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});
