// Satu Mentawai shared script: header, menus, Ask Satu, the request form, map and helpers.
// Set the business WhatsApp number once it exists, digits only with the country code, e.g. "6281234567890".
const CONFIG = { whatsapp: "" };

const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const waLink = text => CONFIG.whatsapp ? `https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(text)}` : `https://wa.me/?text=${encodeURIComponent(text)}`;
const store = {
  get(k, d) { try { const v = localStorage.getItem("satu:" + k); return v ? JSON.parse(v) : d; } catch { return d; } },
  set(k, v) { try { localStorage.setItem("satu:" + k, JSON.stringify(v)); return true; } catch { return false; } },
};
function toast(text) {
  const t = document.createElement("div");
  t.className = "toast"; t.setAttribute("role", "status"); t.textContent = text;
  document.body.append(t);
  setTimeout(() => t.remove(), 2600);
}

/* Start each new page at the top, or at its #section. Some viewers, such as the Claude artifact frame,
   carry the scroll position over from the page before. Back and forward keep the browser's own position. */
(function startPosition() {
  const nav = performance.getEntriesByType("navigation")[0];
  if (nav && nav.type === "back_forward") return;
  const place = () => {
    const target = location.hash.length > 1 && document.getElementById(decodeURIComponent(location.hash.slice(1)));
    if (target) target.scrollIntoView({ block: "start" }); else window.scrollTo(0, 0);
  };
  place();
  addEventListener("load", () => { place(); setTimeout(place, 60); }, { once: true });
})();

/* Header: transparent over the home hero, solid everywhere else */
const header = $(".site-header");
const hero = $(".hero");
function updateHeader() { header.classList.toggle("solid", !hero || scrollY > hero.offsetHeight - 80); }

/* Hero progress: 0 at the top, 1 once the words have split. CSS reads --p. */
const panels = hero ? $$(".panel", hero) : [];
const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)");
let ticking = false;
function updateHero() {
  ticking = false;
  if (!hero || reduceMotion.matches) return;
  const run = hero.offsetHeight - innerHeight;
  const p = Math.min(1, Math.max(0, -hero.getBoundingClientRect().top / run));
  hero.style.setProperty("--p", Math.min(1, p * 1.6).toFixed(4));
  const idx = p < 0.42 ? -1 : Math.min(panels.length - 1, Math.floor((p - 0.42) / (0.58 / panels.length)));
  panels.forEach((el, i) => el.classList.toggle("on", i === idx));
}
addEventListener("scroll", () => { updateHeader(); if (!ticking) { ticking = true; requestAnimationFrame(updateHero); } }, { passive: true });
addEventListener("resize", updateHero);
updateHeader(); updateHero();

/* Mobile menu */
const mnav = $("#mobile-nav");
$(".menu-btn")?.addEventListener("click", () => mnav.showModal());
$$("#mobile-nav a").forEach(a => a.addEventListener("click", () => mnav.close()));

/* Word matching for search and Ask Satu. Common words are skipped so "is there wifi" doesn't match "get there". */
const STOP = new Set("the and for are you can how what when where who why does there their this that with from have has any about into need want get got is it in on of to do a an my me we our your i".split(" "));
const words = q => String(q).toLowerCase().split(/[^a-z0-9]+/).filter(w => w.length > 2 && !STOP.has(w));
function score(text, ws) {
  const hay = new Set(words(text));
  let s = 0;
  for (const w of ws) for (const h of hay) if (h === w || (w.length > 3 && h.length > 3 && (h.startsWith(w) || w.startsWith(h)))) { s++; break; }
  return s;
}

/* Ask Satu: answers from KB in data.js, and hands anything else to the team on WhatsApp */
const ask = $("#ask");
const log = $("#chat-log");
function say(who, html) {
  const d = document.createElement("div");
  d.className = "msg msg-" + who; d.innerHTML = html;
  log.append(d); log.scrollTop = log.scrollHeight;
}
function answer(q) {
  const ws = words(q);
  const best = KB.map(k => [score(k.title + " " + k.tags, ws), k]).sort((a, b) => b[0] - a[0])[0];
  if (!best || best[0] === 0) {
    return `<p>I don't have that one yet. The Satu team answers on WhatsApp.</p><p><a href="${waLink("Hi Satu Mentawai, " + q)}" target="_blank" rel="noopener">Ask the team on WhatsApp</a></p>`;
  }
  const k = best[1];
  return k.answer.map(p => `<p>${esc(p)}</p>`).join("") + `<a class="src" href="${k.url}">${esc(k.title)}</a>`;
}
function openAsk(prefill) {
  if (!ask) return;
  if (!log.children.length) say("bot", "<p>Ask me about getting here, visas, surf, money, health, the market or buying land.</p>");
  ask.showModal();
  if (prefill) send(prefill); else $("#chat-q").focus();
}
function send(q) {
  say("me", `<p>${esc(q)}</p>`);
  const t = document.createElement("div");
  t.className = "typing"; t.textContent = "Satu is writing";
  log.append(t);
  setTimeout(() => { t.remove(); say("bot", answer(q)); }, 450);
}
$("#chat-form")?.addEventListener("submit", e => {
  e.preventDefault();
  const q = $("#chat-q").value.trim();
  if (!q) return;
  $("#chat-q").value = ""; send(q);
});
$$(".chip").forEach(c => c.addEventListener("click", () => send(c.textContent)));

/* Request form: writes a WhatsApp message with the details filled in */
const req = $("#request");
function openRequest(service, message) {
  if (!req) return;
  if (service) {
    const sel = $("#req-service");
    if (![...sel.options].some(o => o.value === service)) sel.add(new Option(service));
    sel.value = service;
  }
  if (message) $("#req-form").elements.message.value = message;
  $("#req-error").hidden = true;
  req.showModal();
  $("#req-name").focus();
}
$("#req-form")?.addEventListener("submit", e => {
  e.preventDefault();
  const f = e.target;
  if (!f.reportValidity()) return;
  if (!$("#req-consent").checked) { const er = $("#req-error"); er.textContent = "Tick the privacy box to send."; er.hidden = false; return; }
  const v = n => f.elements[n].value.trim();
  const text = [`Request: ${v("service")}`, `Name: ${v("name")}`, v("dates") && `Dates: ${v("dates")}`, `People: ${v("people")}`, v("message") && `Details: ${v("message")}`].filter(Boolean).join("\n");
  $("#req-text").textContent = text;
  $("#req-wa").href = waLink(text);
  f.hidden = true; $("#req-done").hidden = false;
  $("#req-wa").focus();
});
$("#req-copy")?.addEventListener("click", async e => {
  try { await navigator.clipboard.writeText($("#req-text").textContent); e.target.textContent = "Copied"; }
  catch { e.target.textContent = "Select the text above to copy it"; }
});
req?.addEventListener("close", () => { $("#req-form").hidden = false; $("#req-done").hidden = true; $("#req-copy").textContent = "Copy message"; });

/* One click handler for every page */
document.addEventListener("click", e => {
  const a = e.target.closest("[data-ask]");
  if (a) { e.preventDefault(); openAsk(a.dataset.ask || ""); return; }
  const r = e.target.closest("[data-request]");
  if (r) { e.preventDefault(); openRequest(r.dataset.request, r.dataset.message); return; }
  const c = e.target.closest("[data-close]");
  if (c) c.closest("dialog").close();
});
// Clicking the backdrop closes a dialog
$$("dialog").forEach(d => d.addEventListener("click", e => { if (e.target === d) d.close(); }));

/* Map: layer toggles and a detail panel for each pin */
$$(".layers input").forEach(cb => cb.addEventListener("change", () => {
  $$(`.map-svg:not(.mini) [data-layer="${cb.value}"]`).forEach(el => el.toggleAttribute("hidden", !cb.checked));
}));
const info = $("#map-info");
if (info) {
  const PINS = {
    "Padang": ["Muaro port and Minangkabau airport (PDG). Every trip starts here with a night in town.", "guide.html#getting-there", "Ferry and flights"],
    "Tuapejat": ["Regency capital on Sipora. Mentawai Fast lands here on Wednesday, Friday and Sunday. ATMs and a BRI bank.", "plan.html#trips", "Sipora trips"],
    "Muara Siberut": ["Ferry port for Siberut, the Playgrounds surf camps and treks to the uma.", "plan.html#trips", "Siberut trips"],
    "Sikakap": ["Ferry port between North and South Pagai. The Friday ferry serves the Pagai resorts.", "plan.html#trips", "Pagai trips"],
    "Rokot Airport": ["Susi Air flies here from Padang in 40 minutes on a small plane, a few times a week.", "guide.html#getting-there", "Flights"],
    "Playgrounds": ["More than 20 waves off south Siberut, from Rifles and Kandui to the mellow Nipussi and Burgerworld.", "guide.html#waves", "Wave guide"],
    "Sipora breaks": ["Lances Right (HTs) and Lances Left in the south of Sipora.", "guide.html#waves", "Wave guide"],
    "Pagai breaks": ["Macaronis and the lefts of North Pagai.", "guide.html#waves", "Wave guide"],
    "Pantai Bosua": ["2,843 m² of beachfront land for sale, facing Bintang Left. €299,000.", "property-pantai-bosua.html", "View the land"],
  };
  $$(".map-svg:not(.mini) .pin").forEach(g => {
    const name = $(".pin-name", g).textContent;
    g.setAttribute("tabindex", "0"); g.setAttribute("role", "button"); g.setAttribute("aria-label", name);
    const show = () => {
      $$(".pin.sel").forEach(x => x.classList.remove("sel")); g.classList.add("sel");
      const [text, url, label] = PINS[name] || ["", "#", ""];
      info.innerHTML = `<h3>${esc(name)}</h3><p>${esc(text)}</p><a href="${url}">${esc(label)}</a>`;
    };
    g.addEventListener("click", show);
    g.addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); show(); } });
  });
}

/* Photo viewer on the property page */
const pv = $("#photo");
$$(".gallery button").forEach(b => b.addEventListener("click", () => {
  const img = $("img", pv);
  img.src = b.dataset.full; img.alt = $("img", b).alt;
  $("#photo-title").textContent = $("img", b).alt;
  pv.showModal();
}));

/* Offline: saves the guide and planner on the phone once visited. Ignored where service workers are blocked. */
if ("serviceWorker" in navigator && location.protocol === "https:" && !location.hostname.endsWith("claude.ai")) {
  navigator.serviceWorker.register("sw.js").catch(() => {});
}

/* Market listings shared by the home page, the market and the sell page */
const CAT_ICON = { Surf: "i-surf", Boats: "i-boat", Vehicles: "i-vehicle", Rentals: "i-key", "Dive and fishing": "i-fish", Building: "i-build", Home: "i-house", Services: "i-tool", Jobs: "i-job" };
const myListings = () => store.get("mine", []);
const allListings = () => [...myListings().filter(l => !l.sold).map(l => ({ ...l, mine: true })), ...LISTINGS.map(l => ({ ...l, sample: true }))];
const savedIds = () => new Set(store.get("saved", []));
function priceHtml(l) {
  if (!l.price) return `<span class="item-price">${esc(l.unit || "Ask the seller")}</span>`;
  const p = idr(l.price);
  return `<span class="item-price num">${p}${l.unit ? ` <small>${esc(l.unit)}</small>` : ""}</span>`;
}
function ago(days) { return days === 0 ? "Today" : days === 1 ? "Yesterday" : `${days} days ago`; }
function itemCard(l, saved = savedIds()) {
  const photo = l.photos?.length ? `<img src="${l.photos[0]}" alt="">` : `<svg class="ic" aria-hidden="true"><use href="#${CAT_ICON[l.cat] || "i-market"}"/></svg>`;
  const tag = l.sold ? `<span class="tag sold">Sold</span>` : l.mine ? `<span class="tag mine">Yours</span>` : l.sample ? `<span class="tag">Sample</span>` : "";
  const days = l.created ? Math.floor((Date.now() - l.created) / 864e5) : l.days;
  return `<article class="item">${tag}
    <button class="save-btn" type="button" data-save="${l.id}" aria-pressed="${saved.has(l.id)}" aria-label="Save ${esc(l.title)}"><svg class="ic"><use href="#i-heart"/></svg></button>
    <div class="item-photo">${photo}</div>
    <div class="item-body">${priceHtml(l)}
      <h3 class="item-title"><button type="button" data-item="${l.id}">${esc(l.title)}</button></h3>
      <p class="item-meta"><svg class="ic"><use href="#i-pin"/></svg>${esc(l.place)}, ${esc(l.island)} <span aria-hidden="true">&nbsp;</span>${ago(days)}</p>
    </div></article>`;
}
document.addEventListener("click", e => {
  const b = e.target.closest("[data-save]");
  if (!b) return;
  const ids = savedIds(); const id = b.dataset.save;
  ids.has(id) ? ids.delete(id) : ids.add(id);
  store.set("saved", [...ids]);
  $$(`[data-save="${CSS.escape(id)}"]`).forEach(x => x.setAttribute("aria-pressed", String(ids.has(id))));
  document.dispatchEvent(new CustomEvent("saved-change"));
  toast(ids.has(id) ? "Saved" : "Removed from saved");
});
