importScripts('https://www.gstatic.com/firebasejs/10.13.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.13.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: '__NEXT_PUBLIC_FIREBASE_API_KEY__',
  authDomain: '__NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN__',
  projectId: '__NEXT_PUBLIC_FIREBASE_PROJECT_ID__',
  storageBucket: '__NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET__',
  messagingSenderId: '__NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID__',
  appId: '__NEXT_PUBLIC_FIREBASE_APP_ID__',
});

// Bypass firebase-messaging-compat's internal push parsing (it silently drops
// payloads that don't match its expected wire format) and handle the raw
// push event ourselves so we always show something.
self.addEventListener('push', (event) => {
  console.log('[sw] push event received, has data:', !!event.data);

  let payload = {};
  try {
    payload = event.data ? event.data.json() : {};
  } catch (err) {
    console.log('[sw] push payload parse failed:', err.message, 'raw text:', event.data ? event.data.text() : null);
    payload = {};
  }

  console.log('[sw] parsed payload:', JSON.stringify(payload));

  const notification = payload.notification ?? {};
  const data = payload.data ?? {};
  const title = notification.title ?? data.title ?? 'MediHug';
  const body  = notification.body  ?? data.message ?? '';

  event.waitUntil(
    self.registration.showNotification(title, {
      body,
      icon: '/medihug-logo.png',
      badge: '/medihug-logo.png',
      data,
    }).then(() => console.log('[sw] showNotification resolved'))
      .catch((err) => console.log('[sw] showNotification failed:', err.message))
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = event.notification.data?.actionUrl ?? '/patient/dashboard';
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientsArr) => {
      const existing = clientsArr.find((c) => c.url.includes(url));
      if (existing) return existing.focus();
      return self.clients.openWindow(url);
    })
  );
});
