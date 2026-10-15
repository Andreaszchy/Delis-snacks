// Service Worker for Push Notifications - Delis Snacks
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('push', (event) => {
  let data = {};
  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      data = { title: 'Delis Snacks', body: event.data.text() };
    }
  }

  const title = data.title || 'Delis Snacks';
  const options = {
    body: data.body || data.message || 'Tienes una nueva notificación.',
    icon: data.icon || 'https://images.unsplash.com/photo-1582058091505-f87a2e55a40f?w=192',
    badge: data.badge || 'https://images.unsplash.com/photo-1582058091505-f87a2e55a40f?w=192',
    tag: data.tag || `delissnacks-${Date.now()}`,
    vibrate: [150, 80, 150],
    data: data,
    renotify: true,
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = event.notification.data?.linkUrl || '/';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          return client.focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }
    })
  );
});
