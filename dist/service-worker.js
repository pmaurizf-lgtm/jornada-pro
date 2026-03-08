// ===============================
// CACHE CONFIG (offline-first en móvil)
// ===============================

const CACHE_NAME = "jornada-pro-v2";

const urlsToCache = [
  "./",
  "./index.html",
  "./styles.css",
  "./app.js",
  "./manifest.json",
  "./core/storage.js",
  "./core/state.js",
  "./core/calculations.js",
  "./core/bank.js",
  "./core/holidays.js",
  "./core/validation.js",
  "./core/notifications.js",
  "./ui/theme.js",
  "./ui/charts.js",
  "./icons/logo-navantia.png",
  "./icons/icon-192.png",
  "./icons/icon-512.png"
];

// ===============================
// INSTALL
// ===============================

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
      .catch(() => { /* fallback si algún recurso falla en install */ })
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
  const url = new URL(event.request.url);
  const sameOrigin = url.origin === self.location.origin;

  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;
      return fetch(event.request).then(response => {
        if (!response || response.status !== 200 || response.type === "opaque") return response;
        if (sameOrigin || url.hostname === "cdn.jsdelivr.net") {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        }
        return response;
      }).catch(() => {
        if (event.request.mode === "navigate") {
          return caches.match("./index.html").then(r => r || new Response("Sin conexión", { status: 503 }));
        }
        return new Response("", { status: 503 });
      });
    })
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
