// Offline copy of the site. Pages come from the network first; files with a content hash never change, so they come from the cache first.
const CACHE = "satu-9207b833";
const SHELL = ["explore.html", "guide.html", "index.html", "market.html", "plan.html", "property-pantai-bosua.html", "sell.html", "assets/data.js?v=7cc226ce", "assets/explore.js?v=bf2a6761", "assets/guide.js?v=6552dd67", "assets/home.js?v=53e0194a", "assets/land.js?v=e40f8193", "assets/leaflet/leaflet.css?v=c02c12fe", "assets/leaflet/leaflet.js?v=35b48eb9", "assets/market.js?v=4c6b80fb", "assets/places.js?v=c8dde885", "assets/plan.js?v=ae6bfef9", "assets/sell.js?v=7f3bb700", "assets/site.css?v=784c2532", "assets/site.js?v=03382fbc", "assets/archivo.woff2", "img/icon-192.png", "img/contours.svg", "img/contours-light.svg"];
self.addEventListener("install", e => e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting())));
self.addEventListener("activate", e => e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())));
const keep = (req, r) => { if (r.ok) { const copy = r.clone(); caches.open(CACHE).then(c => c.put(req, copy)); } return r; };
self.addEventListener("fetch", e => {
  const url = new URL(e.request.url);
  if (e.request.method !== "GET" || url.origin !== location.origin) return;
  const fixed = url.searchParams.has("v") || /\.(woff2|webp|png|svg)$/.test(url.pathname);
  if (fixed) e.respondWith(caches.match(e.request).then(hit => hit || fetch(e.request).then(r => keep(e.request, r))));
  else e.respondWith(fetch(e.request).then(r => keep(e.request, r)).catch(() => caches.match(e.request, { ignoreSearch: true })));
});
