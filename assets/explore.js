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

/* Map */
const svg = $("#ex-map");
const pinLayer = document.createElementNS("http://www.w3.org/2000/svg", "g");
svg.append(pinLayer);
function setZoom(mode) {
  zoom = mode;
  $("#zoom-near").setAttribute("aria-pressed", String(mode === "near"));
  $("#zoom-all").setAttribute("aria-pressed", String(mode === "all"));
  if (mode === "all" || !origin) { svg.setAttribute("viewBox", `0 0 ${MAP.w} ${MAP.h}`); svg.classList.remove("zoomed"); return; }
  const [x, y] = P(origin.lon, origin.lat), s = 130;
  const vx = Math.max(0, Math.min(MAP.w - s, x - s / 2)), vy = Math.max(0, Math.min(MAP.h - s, y - s / 2));
  svg.setAttribute("viewBox", `${vx.toFixed(0)} ${vy.toFixed(0)} ${s} ${s}`);
  svg.classList.add("zoomed");
}
$("#zoom-near").addEventListener("click", () => setZoom("near"));
$("#zoom-all").addEventListener("click", () => setZoom("all"));

function drawPins(rows) {
  const ns = "http://www.w3.org/2000/svg";
  pinLayer.innerHTML = "";
  rows.forEach((p, i) => {
    const [x, y] = P(p.lon, p.lat);
    const g = document.createElementNS(ns, "g");
    g.setAttribute("class", `xpin xpin-${p.cat}${p.id === selected ? " sel" : ""}`);
    g.setAttribute("transform", `translate(${x.toFixed(1)} ${y.toFixed(1)})`);
    g.setAttribute("tabindex", "0"); g.setAttribute("role", "button"); g.setAttribute("aria-label", p.name);
    g.dataset.id = p.id;
    g.innerHTML = `<circle r="7"/><text class="num-t">${i + 1}</text><text class="name-t" x="6" y="-5">${esc(p.name)}</text>`;
    pinLayer.append(g);
  });
  if (origin) {
    const [x, y] = P(origin.lon, origin.lat);
    const g = document.createElementNS(ns, "g");
    g.setAttribute("class", "you"); g.setAttribute("transform", `translate(${x.toFixed(1)} ${y.toFixed(1)})`);
    g.innerHTML = `<circle r="11" class="halo"/><circle r="5.5"/><text x="12" y="-8">${origin.gps ? "You" : "Base"}</text>`;
    pinLayer.append(g);
  }
}
pinLayer.addEventListener("click", e => { const g = e.target.closest("[data-id]"); if (g) select(g.dataset.id, true); });
pinLayer.addEventListener("keydown", e => { const g = e.target.closest("[data-id]"); if (g && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); select(g.dataset.id, true); } });

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
  $$(".xpin.sel").forEach(x => x.classList.remove("sel"));
  const pin = $(`.xpin[data-id="${id}"]`);
  if (pin) { pin.classList.add("sel"); pinLayer.append(pin); }
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
