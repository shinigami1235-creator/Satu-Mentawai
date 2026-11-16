// Explore companion: nearest places from your location or a chosen base, a map, a day plan and live swell.
const MAP = { W: 98.45, N: -0.85, sx: 360, w: 810, h: 954 };
const P = (lon, lat) => [(lon - MAP.W) * MAP.sx, (MAP.N - lat) * MAP.sx];
const km = (a, b) => {
  const R = 6371, r = Math.PI / 180;
  const dLat = (b.lat - a.lat) * r, dLon = (b.lon - a.lon) * r;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * r) * Math.cos(b.lat * r) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
};
const dist = d => d < 1 ? `${Math.round(d * 1000 / 50) * 50} m` : `${d < 10 ? d.toFixed(1) : Math.round(d)} km`;
const mapsQ = q => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`;
const COMPASS = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"];
const compass = deg => COMPASS[Math.round(deg / 22.5) % 16];

let cat = new URLSearchParams(location.search).get("c") || "all", origin = null, zoom = "near", selected = null;
if (!CATS[cat]) cat = "all";
let day = store.get("day", []);

/* Where you are */
const baseSel = $("#base");
BASES.forEach(b => baseSel.add(new Option(b.name, b.id)));
const savedBase = store.get("base", "tuapejat");
baseSel.value = BASES.some(b => b.id === savedBase) ? savedBase : "tuapejat";
function setBase(id) {
  const b = BASES.find(x => x.id === id);
  origin = { lat: b.lat, lon: b.lon, label: b.name, gps: false };
  store.set("base", id);
  $("#loc-status").textContent = "";
  render();
}
baseSel.addEventListener("change", () => setBase(baseSel.value));
$("#use-loc").addEventListener("click", () => {
  const st = $("#loc-status");
  if (!("geolocation" in navigator)) { st.textContent = "This browser has no location. Pick where you are instead."; return; }
  st.textContent = "Finding you";
  navigator.geolocation.getCurrentPosition(pos => {
    const here = { lat: pos.coords.latitude, lon: pos.coords.longitude };
    const inIslands = here.lat > -3.6 && here.lat < -0.8 && here.lon > 98.4 && here.lon < 100.8;
    if (!inIslands) {
      const away = km(here, { lat: -2.034, lon: 99.594 });
      st.textContent = `You're ${Math.round(away).toLocaleString("en-US")} km from Tuapejat, so the list uses the place you pick until you're on the islands.`;
      return;
    }
    origin = { ...here, label: "your location", gps: true };
    st.textContent = "Using your location.";
    render();
  }, err => {
    st.textContent = err.code === 1 ? "Location is blocked for this page. Allow it in the browser, or pick where you are." : "Your location could not be found. Pick where you are instead.";
  }, { enableHighAccuracy: true, timeout: 12000, maximumAge: 60000 });
});

/* Category buttons */
$("#ex-cats").innerHTML = Object.entries(CATS).map(([k, v]) =>
  `<button class="cat" type="button" data-c="${k}" aria-pressed="${k === cat}"><svg class="ic" aria-hidden="true"><use href="#${CAT_ICONS[k]}"/></svg>${v}</button>`).join("");
$("#ex-cats").addEventListener("click", e => {
  const b = e.target.closest("[data-c]"); if (!b) return;
  cat = b.dataset.c;
  $$("#ex-cats .cat").forEach(x => x.setAttribute("aria-pressed", String(x === b)));
  render();
});

/* List or map on phones */
$$(".view-switch [data-view]").forEach(b => b.addEventListener("click", () => {
  $("#explore").dataset.view = b.dataset.view;
  $$(".view-switch [data-view]").forEach(x => x.setAttribute("aria-pressed", String(x === b)));
}));

/* Map: OpenStreetMap streets over a drawn coastline, so it still works with no signal */
const PIN_COLOR = { surf: "#0f7c7a", essential: "#b42318", food: "#2d5a3a" };
const map = L.map("ex-map", { zoomSnap: 0.5, scrollWheelZoom: false, attributionControl: true }).setView([-2.0, 99.6], 8);
map.attributionControl.setPrefix(false);
L.polygon(LAND.map(r => [r]), { stroke: true, color: "#7f9a8c", weight: 1, fillColor: "#e9e3d2", fillOpacity: 1, interactive: false }).addTo(map);
const tiles = L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 18, attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> contributors'
}).addTo(map);
let tilesOk = false, offline = false;
tiles.on("tileload", () => { tilesOk = true; $("#map-note").hidden = true; });
setTimeout(() => {
  if (tilesOk) return;
  map.removeLayer(tiles);
  map.attributionControl.addAttribution("Coastline &copy; OpenStreetMap contributors");
  $("#map-note").hidden = false;
  offline = true;
  setZoom(zoom);
}, 6000);
map.on("focus click", () => map.scrollWheelZoom.enable());
map.on("blur mouseout", () => map.scrollWheelZoom.disable());

const pinLayer = L.layerGroup().addTo(map);
const markers = {};
let youMarker = null, shown = [];
const pinIcon = (p, n, sel) => L.divIcon({
  className: "lpin" + (sel ? " sel" : ""),
  html: `<span style="--c:${PIN_COLOR[p.cat] || "#0b3a4a"}">${n}</span>`,
  iconSize: [30, 30], iconAnchor: [15, 15]
});
function drawPins(rows) {
  pinLayer.clearLayers();
  Object.keys(markers).forEach(k => delete markers[k]);
  shown = rows;
  rows.forEach((p, i) => {
    const m = L.marker([p.lat, p.lon], { icon: pinIcon(p, i + 1, p.id === selected), title: p.name, alt: p.name, keyboard: true, riseOnHover: true, zIndexOffset: p.id === selected ? 1000 : 0 })
      .bindTooltip(esc(p.name), { direction: "top", offset: [0, -14] })
      .on("click", () => select(p.id, true));
    m.addTo(pinLayer);
    markers[p.id] = m;
  });
  if (youMarker) map.removeLayer(youMarker);
  youMarker = origin ? L.marker([origin.lat, origin.lon], {
    icon: L.divIcon({ className: "lyou", html: `<span></span><b>${origin.gps ? "You" : "Base"}</b>`, iconSize: [22, 22], iconAnchor: [11, 11] }),
    keyboard: false, interactive: false, zIndexOffset: 500
  }).addTo(map) : null;
}
function setZoom(mode) {
  zoom = mode;
  $("#zoom-near").setAttribute("aria-pressed", String(mode === "near"));
  $("#zoom-all").setAttribute("aria-pressed", String(mode === "all"));
  const pts = (mode === "near" && origin ? shown.slice(0, 5) : shown).map(p => [p.lat, p.lon]);
  if (origin) pts.push([origin.lat, origin.lon]);
  if (!pts.length) return;
  map.invalidateSize();
  map.fitBounds(L.latLngBounds(pts), { padding: [36, 36], maxZoom: mode === "near" ? (offline ? 11 : 15) : 11, animate: false });
}
$("#zoom-near").addEventListener("click", () => setZoom("near"));
$("#zoom-all").addEventListener("click", () => setZoom("all"));
let mapW = 0;
new ResizeObserver(([e]) => {
  const w = e.contentRect.width;
  map.invalidateSize();
  if (!mapW && w) setZoom(zoom);
  mapW = w;
}).observe($("#ex-map"));

/* List */
function placeCard(p, i) {
  const inDay = day.includes(p.id);
  return `<li class="place${p.id === selected ? " sel" : ""}" id="pl-${p.id}">
    <div class="place-ic"><svg class="ic" aria-hidden="true"><use href="#${CAT_ICONS[p.cat]}"/></svg><span class="place-num" title="Number on the map">${i + 1}</span></div>
    <div class="place-body">
      <p class="place-top"><span class="place-dist num">${dist(p.d)}</span><span class="place-cat">${CATS[p.cat]}, ${esc(p.island)}</span></p>
      <h3><button type="button" class="place-name" data-sel="${p.id}">${esc(p.name)}</button></h3>
      <p class="place-access">${esc(p.access)}</p>
      <p class="place-desc">${esc(p.desc)}</p>
      <div class="forecast" id="fc-${p.id}" hidden></div>
      <div class="actions">
        ${p.q ? `<a class="btn btn-sm" href="${mapsQ(p.q)}" target="_blank" rel="noopener">Directions</a>` : `<a class="btn btn-sm" href="#" data-request="Boat taxi" data-message="Boat to ${esc(p.name)}">Book a boat</a>`}
        <button class="btn btn-line btn-sm" type="button" data-day="${p.id}" aria-pressed="${inDay}">${inDay ? "In my day" : "Add to my day"}</button>
        ${p.forecast ? `<button class="link-btn small" type="button" data-fc="${p.id}">Swell and wind</button>` : ""}
      </div>
    </div>
  </li>`;
}
function rows() {
  return PLACES.filter(p => cat === "all" || p.cat === cat).map(p => ({ ...p, d: origin ? km(origin, p) : 0 })).sort((a, b) => a.d - b.d);
}
function render() {
  const r = rows();
  $("#places").innerHTML = r.map((p, i) => placeCard(p, i)).join("");
  $("#ex-count").textContent = `${r.length} place${r.length === 1 ? "" : "s"}, nearest to ${origin ? origin.label : "Tuapejat"} first. Distances are in a straight line.`;
  drawPins(r);
  setZoom(zoom);
  drawDay();
}
$("#places").addEventListener("click", e => {
  const s = e.target.closest("[data-sel]"); if (s) select(s.dataset.sel, false);
  const d = e.target.closest("[data-day]"); if (d) toggleDay(d.dataset.day);
  const f = e.target.closest("[data-fc]"); if (f) forecast(f.dataset.fc);
});

function select(id, fromMap) {
  selected = id;
  const p = PLACES.find(x => x.id === id);
  const d = origin ? km(origin, p) : null;
  shown.forEach((q, i) => markers[q.id]?.setIcon(pinIcon(q, i + 1, q.id === id)).setZIndexOffset(q.id === id ? 1000 : 0));
  if (!fromMap && markers[id]) map.panTo(markers[id].getLatLng(), { animate: !reduceMotion.matches });
  $$(".place.sel").forEach(x => x.classList.remove("sel"));
  $(`#pl-${id}`)?.classList.add("sel");
  $("#ex-info").innerHTML = `<h3>${esc(p.name)}</h3><p class="small">${CATS[p.cat]}, ${esc(p.island)}${d !== null ? `. ${dist(d)} from ${esc(origin.label)}` : ""}</p><p>${esc(p.access)}</p>
    <div class="actions">${p.q ? `<a class="btn btn-sm" href="${mapsQ(p.q)}" target="_blank" rel="noopener">Directions</a>` : ""}<button class="btn btn-line btn-sm" type="button" data-day="${p.id}" aria-pressed="${day.includes(p.id)}">${day.includes(p.id) ? "In my day" : "Add to my day"}</button></div>`;
  if (fromMap) {
    if ($("#explore").dataset.view === "map" && matchMedia("(max-width: 900px)").matches) return;
    $(`#pl-${id}`)?.scrollIntoView({ block: "center", behavior: reduceMotion.matches ? "auto" : "smooth" });
  }
}
$("#ex-info").addEventListener("click", e => { const d = e.target.closest("[data-day]"); if (d) toggleDay(d.dataset.day); });

/* My day */
function toggleDay(id) {
  day = day.includes(id) ? day.filter(x => x !== id) : [...day, id];
  store.set("day", day);
  $$(`[data-day="${id}"]`).forEach(b => { const on = day.includes(id); b.setAttribute("aria-pressed", String(on)); b.textContent = on ? "In my day" : "Add to my day"; });
  toast(day.includes(id) ? "Added to my day" : "Removed from my day");
  drawDay();
}
function drawDay() {
  const bar = $("#day-bar");
  bar.hidden = !day.length;
  $("#day-count").textContent = `My day: ${day.length} stop${day.length === 1 ? "" : "s"}`;
  const stops = day.map(id => PLACES.find(p => p.id === id)).filter(Boolean);
  let prev = origin, total = 0;
  $("#day-list").innerHTML = stops.map((p, i) => {
    const leg = prev ? km(prev, p) : 0; total += leg; prev = p;
    return `<li><span><strong>${esc(p.name)}</strong><br><span class="small">${dist(leg)} from the stop before. ${esc(p.access)}</span></span>
      <span class="day-ctl"><button class="link-btn small" type="button" data-up="${i}" ${i === 0 ? "disabled" : ""} aria-label="Move ${esc(p.name)} up">Up</button>
      <button class="link-btn small" type="button" data-rm="${p.id}">Remove</button></span></li>`;
  }).join("");
  $("#day-total").textContent = stops.length ? `About ${dist(total)} in total from ${origin ? origin.label : "your base"}, in straight lines.` : "";
  const onLand = stops.filter(p => p.q);
  const route = onLand.length ? `https://www.google.com/maps/dir/?api=1${origin ? `&origin=${origin.lat},${origin.lon}` : ""}&destination=${encodeURIComponent(onLand.at(-1).q)}${onLand.length > 1 ? `&waypoints=${encodeURIComponent(onLand.slice(0, -1).map(p => p.q).join("|"))}` : ""}` : null;
  const a = $("#day-route");
  a.hidden = !route; if (route) a.href = route;
  $("#day-book").dataset.message = `My day: ${stops.map(p => p.name).join(", ")}`;
}
$("#day-bar").addEventListener("click", () => $("#day").showModal());
$("#day-list").addEventListener("click", e => {
  const up = e.target.closest("[data-up]"), rm = e.target.closest("[data-rm]");
  if (up) { const i = +up.dataset.up; [day[i - 1], day[i]] = [day[i], day[i - 1]]; store.set("day", day); drawDay(); }
  if (rm) { toggleDay(rm.dataset.rm); if (!day.length) $("#day").close(); }
});
$("#day-clear").addEventListener("click", () => { const ids = [...day]; day = []; store.set("day", day); ids.forEach(id => $$(`[data-day="${id}"]`).forEach(b => { b.setAttribute("aria-pressed", "false"); b.textContent = "Add to my day"; })); drawDay(); $("#day").close(); });

/* Swell and wind from Open-Meteo, kept on the phone for when the signal drops */
async function forecast(id) {
  const p = PLACES.find(x => x.id === id);
  const box = $(`#fc-${id}`);
  box.hidden = false;
  box.innerHTML = `<p class="small">Loading the forecast</p>`;
  const tz = "&timezone=Asia%2FJakarta&forecast_days=3";
  try {
    const [m, w] = await Promise.all([
      fetch(`https://marine-api.open-meteo.com/v1/marine?latitude=${p.lat}&longitude=${p.lon}&hourly=swell_wave_height,swell_wave_period,swell_wave_direction${tz}`).then(r => { if (!r.ok) throw 0; return r.json(); }),
      fetch(`https://api.open-meteo.com/v1/forecast?latitude=${p.lat}&longitude=${p.lon}&hourly=wind_speed_10m,wind_direction_10m${tz}`).then(r => { if (!r.ok) throw 0; return r.json(); }),
    ]);
    const data = { t: m.hourly.time, h: m.hourly.swell_wave_height, per: m.hourly.swell_wave_period, dir: m.hourly.swell_wave_direction,
      ws: w.hourly.wind_speed_10m, wd: w.hourly.wind_direction_10m, at: Date.now() };
    store.set("fc:" + id, data);
    drawForecast(box, data, false);
  } catch {
    const c = store.get("fc:" + id, null);
    if (c) drawForecast(box, c, true);
    else box.innerHTML = `<p class="small">The forecast needs internet. Open it once with signal and it stays on this phone.</p>`;
  }
}
function drawForecast(box, d, old) {
  const now = new Date();
  const key = t => t.slice(0, 13);
  const nowKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}T${String(now.getHours()).padStart(2, "0")}`;
  let i = d.t.findIndex(t => key(t) === nowKey); if (i < 0) i = 0;
  const line = j => `${d.h[j] != null ? d.h[j].toFixed(1) + " m" : "Flat"} at ${Math.round(d.per[j] || 0)} s from ${compass(d.dir[j] || 0)}, wind ${Math.round(d.ws[j])} km/h ${compass(d.wd[j])}`;
  const mornings = d.t.map((t, j) => [t, j]).filter(([t]) => t.endsWith("T06:00"));
  box.innerHTML = `<p><strong>Now:</strong> ${line(i)}</p>
    <ul class="fc-days">${mornings.map(([t, j]) => `<li><span>${new Date(t).toLocaleDateString("en-GB", { weekday: "short" })} 6am</span>${line(j)}</li>`).join("")}</ul>
    <p class="small">${old ? `Saved forecast from ${new Date(d.at).toLocaleString("en-GB", { weekday: "short", hour: "2-digit", minute: "2-digit" })}. ` : ""}Swell and wind from Open-Meteo.</p>`;
}

/* Things to do */
$("#todo-list").innerHTML = ACTIVITIES.map(a => `<li>
  <h3>${esc(a.title)}</h3>
  <p class="todo-where"><svg class="ic" aria-hidden="true"><use href="#i-pin"/></svg>${esc(a.where)}</p>
  <p>${esc(a.how)}</p>
  <p class="todo-price">${esc(a.price)}</p>
  ${a.req ? `<a class="btn btn-sm" href="#" data-request="${esc(a.req)}">Book it</a>` : ""}
</li>`).join("");

setBase(baseSel.value);
