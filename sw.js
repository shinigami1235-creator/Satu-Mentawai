// Keeps the guide, planner and market working offline once visited. Pages load from the network first.
const CACHE = "satu-v8";
const SHELL = ["index.html", "explore.html", "plan.html", "guide.html", "market.html", "sell.html", "property-pantai-bosua.html",
  "assets/site.css", "assets/data.js", "assets/site.js", "assets/home.js", "assets/places.js", "assets/explore.js", "assets/land.js", "assets/leaflet/leaflet.js", "assets/leaflet/leaflet.css", "assets/plan.js", "assets/guide.js", "assets/market.js", "assets/sell.js",
  "assets/archivo.woff2", "img/icon-192.png", "img/contours.svg", "img/contours-light.svg"];
self.addEventListener("install", e => e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting())));
self.addEventListener("activate", e => e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())));
self.addEventListener("fetch", e => {
  if (e.request.method !== "GET" || new URL(e.request.url).origin !== location.origin) return;
  e.respondWith(fetch(e.request).then(r => {
    const copy = r.clone();
    caches.open(CACHE).then(c => c.put(e.request, copy));
    return r;
  }).catch(() => caches.match(e.request, { ignoreSearch: true })));
});
