// ===============================
// CACHE CONFIG
// ===============================

const CACHE_NAME = "jornada-pro-v1";

const urlsToCache = [
  "./",
  "./index.html",
  "./styles.css",
  "./app.js",
  "./manifest.json"
];

// ===============================
// INSTALL
// ===============================

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
  self.skipWaiting();
});

// ===============================
// ACTIVATE
// ===============================

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(key => key !== CACHE_NAME)
            .map(key => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// ===============================
// FETCH (offline support)
// ===============================

self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
});

// ===============================
// PUSH (notificaciones reales)
// ===============================

self.addEventListener("push", event => {

  const data = event.data
    ? event.data.json()
    : { title: "Jornada Pro", body: "Aviso de jornada" };

  const options = {
    body: data.body,
    icon: "icon-192.png",
    badge: "icon-192.png",
    vibrate: [200, 100, 200],
    data: {
      url: "./"
    }
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// ===============================
// CLICK EN NOTIFICACIÓN
// ===============================

self.addEventListener("notificationclick", event => {

  event.notification.close();

  event.waitUntil(
    clients.matchAll({ type: "window" }).then(clientList => {

      for (const client of clientList) {
        if (client.url === "/" && "focus" in client)
          return client.focus();
      }

      if (clients.openWindow)
        return clients.openWindow("./");
    })
  );
});
