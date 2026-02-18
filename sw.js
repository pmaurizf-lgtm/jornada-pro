
const CACHE="jornada-pro-v4-1-prod";
self.addEventListener("install",e=>{
  e.waitUntil(caches.open(CACHE).then(c=>c.addAll([
    "./","index.html","styles.css","app.js"
  ])));
});
self.addEventListener("fetch",e=>{
  e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request)));
});
