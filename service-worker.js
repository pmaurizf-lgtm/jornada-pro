const CACHE_NAME = "jornada-pro-v1.1.0";

const ASSETS = [
  "./",
  "./index.html",
  "./styles.css",
  "./app.js",
  "./manifest.json",

  // CORE
  "./core/storage.js",
  "./core/state.js",
  "./core/calculations.js",
  "./core/bank.js",
  "./core/holidays.js",
  "./core/notifications.js",

  // UI
  "./ui/theme.js",
  "./ui/charts.js",

  // ICONOS
  "./icons/icon-192.png",
  "./icons/icon-512.png"
];

// INSTALACIÓN
self.addEventListener("install", event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(ASSETS);
    })
  );
});

// ACTIVACIÓN
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      )
    )
  );
  self.clients.claim();
});

// FETCH
self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});
