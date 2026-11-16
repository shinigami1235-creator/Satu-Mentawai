// Satu Mentawai sample site. Everything runs in the browser and nothing is sent to a server.
// Set the business WhatsApp number here once it exists, digits only with the country code, e.g. "6281234567890".
const CONFIG = { whatsapp: "" };

const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];

/* Header turns solid once the page scrolls past the hero (or straight away on inner pages) */
const header = $(".site-header");
const hero = $(".hero");
function updateHeader() {
  header.classList.toggle("solid", !hero || window.scrollY > hero.offsetHeight - 80);
}

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
  // panels take turns once the gap is open
  const idx = p < 0.42 ? -1 : Math.min(panels.length - 1, Math.floor((p - 0.42) / (0.58 / panels.length)));
  panels.forEach((el, i) => el.classList.toggle("on", i === idx));
}
addEventListener("scroll", () => {
  updateHeader();
  if (!ticking) { ticking = true; requestAnimationFrame(updateHero); }
}, { passive: true });
addEventListener("resize", updateHero);
updateHeader(); updateHero();

/* Mobile menu */
const mnav = $("#mobile-nav");
$(".menu-btn")?.addEventListener("click", () => mnav.showModal());
$$("#mobile-nav a").forEach(a => a.addEventListener("click", () => mnav.close()));

/* What Satu Mentawai knows. The search box and Ask Satu both read from this list. */
const KB = [
  { id: "getthere", title: "Getting to Mentawai", tags: "get there travel how to reach arrive fly flight padang ferry boat route",
    url: "index.html#get-there",
    answer: ["Fly to Padang (PDG) first. There are direct flights from Jakarta and Bali, and international flights from Kuala Lumpur and Singapore.",
      "The Mentawai Fast ferry leaves Muaro port in Padang early in the morning, so book a hotel in Padang for the night before. It reaches Tuapejat on Sipora in about 3.5 hours.",
      "You can also fly from Padang to Rokot Airport on Sipora in about 40 minutes."] },
  { id: "ferry", title: "Mentawai Fast ferry", tags: "ferry fast boat ticket schedule timetable price cost tuapejat siberut sikakap muaro",
    url: "index.html#get-there",
    answer: ["The Mentawai Fast runs from Muaro port in Padang to Tuapejat (Sipora), Siberut and Sikakap (Pagai). The crossing takes 3 to 6 hours depending on the island.",
      "A one-way ticket costs about IDR 350,000 to 450,000. Buy it at the port the day before since the queue on departure morning is long.",
      "Some sailings ran on a temporary timetable in October 2026 because of vessel maintenance. Check mentawaifast.com before you book flights around it."] },
  { id: "boards", title: "Surfboards on the ferry", tags: "surfboard board luggage bag ferry weight",
    url: "index.html#get-there",
    answer: ["Surfboards are allowed on the Mentawai Fast and are charged by weight at the port."] },
  { id: "season", title: "Best time to surf", tags: "season when best time month weather swell crowd surf",
    url: "index.html#map",
    answer: ["The main surf season runs with the dry season from March to October.",
      "December to February has the fewest crowds and smaller waves, which suits intermediate surfers."] },
  { id: "beginner", title: "Surfing as a beginner", tags: "beginner learn lesson first time easy surf level",
    url: "index.html#visit",
    answer: ["A few resorts sit next to mellow waves and run lessons, including Aloita and Macaronis. Most Mentawai breaks are reef breaks for intermediate surfers and up, so tell us your level and we match the stay to it."] },
  { id: "charter", title: "Surf charter boats", tags: "charter boat trip liveaboard cost price nights surfers",
    url: "index.html#visit",
    answer: ["Charter trips leave from Padang and run 11 to 13 nights with 8 to 12 surfers on board.",
      "Prices run from about US$2,000 to US$5,000 per person depending on the boat."] },
  { id: "bosua", title: "Pantai Bosua beachfront land", tags: "pantai bosua land property sale buy plot beachfront sipora invest real estate freehold",
    url: "property-pantai-bosua.html",
    answer: ["Pantai Bosua is 2,843 m² of flat beachfront land in a U-shaped cove on Sipora, listed at €299,000 (about €105 per m²).",
      "It faces Bintang Left, with about 18 waves within 10 minutes. Rokot Airport is a 1-hour drive away."] },
  { id: "foreign", title: "Buying land as a foreigner", tags: "foreigner foreign buy own land ownership legal title visa company pt pma lease",
    url: "index.html#live",
    answer: ["Indonesian law limits freehold ownership by foreigners, so the way you hold the land matters before any deposit is paid.",
      "Book a Settle consult and we go through the ownership options, the notary and the company setup with you."] },
  { id: "islands", title: "About the Mentawai Islands", tags: "where mentawai islands about location how many siberut sipora pagai capital",
    url: "index.html#map",
    answer: ["The Mentawai Islands are a chain of about 70 islands roughly 150 km off the west coast of Sumatra, in West Sumatra province.",
      "The four main islands are Siberut, Sipora, North Pagai and South Pagai. The regency capital is Tuapejat on Sipora."] },
  { id: "culture", title: "Visiting a Mentawai uma", tags: "culture tribe uma longhouse sikerei trek trekking jungle siberut village",
    url: "index.html#visit",
    answer: ["Treks into the Siberut forest stay with Mentawai families in an uma, the traditional longhouse at the centre of village life.",
      "Trips run from 3 to 5 days and include the ferry from Padang to Siberut. Ask us and we book a guide who works with the families directly."] },
  { id: "stay", title: "Places to stay", tags: "stay hotel resort villa homestay accommodation room surf camp",
    url: "index.html#visit", answer: null },
  { id: "dive", title: "Diving and snorkelling", tags: "dive diving snorkel snorkelling reef coral fish", url: "index.html#visit", answer: null },
  { id: "eat", title: "Restaurants and warungs", tags: "eat food restaurant warung cafe drink", url: "index.html#visit", answer: null },
  { id: "market", title: "Buy and sell in Mentawai", tags: "market buy sell second hand board boat scooter motorbike gear job", url: "index.html#live", answer: null },
  { id: "settle", title: "Visas, company setup and staff", tags: "visa company business setup permit staff bank banking builder contractor settle move live", url: "index.html#live", answer: null },
];

/* Word matching shared by search and Ask Satu. Common words are skipped so "is there wifi" doesn't match "get there". */
const STOP = new Set("the and for are you can how what when where who why does there their this that with from have has any about into need want get got is it in on of to do a an my me we our your i".split(" "));
const words = q => q.toLowerCase().split(/[^a-z0-9]+/).filter(w => w.length > 2 && !STOP.has(w));
function score(item, ws) {
  const hay = new Set(words(item.title + " " + item.tags));
  let s = 0;
  for (const w of ws) for (const h of hay) if (h === w || (w.length > 3 && h.length > 3 && (h.startsWith(w) || w.startsWith(h)))) { s++; break; }
  return s;
}

/* Search */
const finder = $("#finder-form");
if (finder) {
  let scope = "all";
  $$(".tab").forEach(t => t.addEventListener("click", () => {
    $$(".tab").forEach(x => x.setAttribute("aria-pressed", String(x === t)));
    scope = t.dataset.scope;
    $("#q").placeholder = t.dataset.hint;
    run();
  }));
  const scopes = { stay: ["stay", "beginner", "culture"], surf: ["season", "beginner", "charter", "boards"], get: ["getthere", "ferry", "boards"],
    property: ["bosua", "foreign"], market: ["market"], settle: ["settle", "foreign"] };
  function run(e) {
    e?.preventDefault();
    const ws = words($("#q").value);
    let pool = scope === "all" ? KB : KB.filter(k => scopes[scope].includes(k.id));
    let hits = ws.length ? pool.map(k => [score(k, ws), k]).filter(([s]) => s > 0).sort((a, b) => b[0] - a[0]).map(([, k]) => k) : (scope === "all" ? [] : pool);
    const out = $("#results");
    if (!ws.length && scope === "all") { out.innerHTML = ""; return; }
    if (!hits.length) {
      out.innerHTML = `<p>No page matches "${escapeHtml($("#q").value)}" yet. <button class="btn btn-line" type="button" data-ask>Ask Satu</button></p>`;
      return;
    }
    out.innerHTML = `<ul>${hits.slice(0, 6).map(k => `<li><a href="${k.url}"><strong>${k.title}</strong><span>${k.answer ? escapeHtml(k.answer[0]) : "Listings open with the first operators."}</span></a></li>`).join("")}</ul>`;
  }
  finder.addEventListener("submit", run);
}

function escapeHtml(s) { return s.replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])); }

/* Map layers */
$$(".layers input").forEach(cb => cb.addEventListener("change", () => {
  $$(`.map-svg [data-layer="${cb.value}"]`).forEach(el => el.toggleAttribute("hidden", !cb.checked));
}));

/* Ask Satu: answers from the list above, and hands anything else to the team on WhatsApp */
const ask = $("#ask");
const log = $("#chat-log");
function say(who, html) {
  const d = document.createElement("div");
  d.className = "msg msg-" + who;
  d.innerHTML = html;
  log.append(d);
  log.scrollTop = log.scrollHeight;
}
function answer(q) {
  const best = KB.filter(k => k.answer).map(k => [score(k, words(q)), k]).sort((a, b) => b[0] - a[0])[0];
  if (!best || best[0] === 0) {
    return `<p>I don't have that one yet. The Satu team answers on WhatsApp.</p><p><a href="${waLink("Hi Satu Mentawai, " + q)}" target="_blank" rel="noopener">Ask the team on WhatsApp</a></p>`;
  }
  const k = best[1];
  const more = k.url.startsWith("property") ? `<a href="${k.url}">See the listing</a>` : `<a href="${k.url}">${k.title}</a>`;
  return k.answer.map(p => `<p>${escapeHtml(p)}</p>`).join("") + `<span class="src">${more}</span>`;
}
function openAsk(prefill) {
  if (!ask) return;
  if (!log.children.length) say("bot", "<p>Ask me about getting here, surf, places to stay, property or moving to Mentawai.</p>");
  ask.showModal();
  if (prefill) send(prefill); else $("#chat-q").focus();
}
function send(q) {
  say("me", `<p>${escapeHtml(q)}</p>`);
  const t = document.createElement("div");
  t.className = "typing"; t.textContent = "Satu is writing";
  log.append(t);
  setTimeout(() => { t.remove(); say("bot", answer(q)); }, 450);
}
$("#chat-form")?.addEventListener("submit", e => {
  e.preventDefault();
  const q = $("#chat-q").value.trim();
  if (!q) return;
  $("#chat-q").value = "";
  send(q);
});
$$(".chip").forEach(c => c.addEventListener("click", () => send(c.textContent)));
document.addEventListener("click", e => {
  const a = e.target.closest("[data-ask]");
  if (a) { e.preventDefault(); openAsk(a.dataset.ask || ""); }
  const r = e.target.closest("[data-request]");
  if (r) { e.preventDefault(); openRequest(r.dataset.request); }
  const c = e.target.closest("[data-close]");
  if (c) c.closest("dialog").close();
});

/* Request form: builds a WhatsApp message with the details filled in */
function waLink(text) {
  return CONFIG.whatsapp ? `https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(text)}` : `https://wa.me/?text=${encodeURIComponent(text)}`;
}
const req = $("#request");
function openRequest(service) {
  if (!req) return;
  const sel = $("#req-service");
  if (service) sel.value = service;
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
  const lines = [
    `Request: ${v("service")}`,
    `Name: ${v("name")}`,
    v("dates") && `Dates: ${v("dates")}`,
    `People: ${v("people")}`,
    v("message") && `Details: ${v("message")}`,
  ].filter(Boolean);
  const text = lines.join("\n");
  const done = $("#req-done");
  $("#req-text").textContent = text;
  $("#req-wa").href = waLink(text);
  f.hidden = true; done.hidden = false;
  $("#req-wa").focus();
});
$("#req-copy")?.addEventListener("click", async e => {
  try { await navigator.clipboard.writeText($("#req-text").textContent); e.target.textContent = "Copied"; }
  catch { e.target.textContent = "Select the text above to copy it"; }
});
$("#request")?.addEventListener("close", () => {
  $("#req-form").hidden = false; $("#req-done").hidden = true; $("#req-copy").textContent = "Copy message";
});

/* Photo viewer on the property page */
const pv = $("#photo");
$$(".gallery button").forEach(b => b.addEventListener("click", () => {
  const img = $("img", pv);
  img.src = b.dataset.full; img.alt = $("img", b).alt;
  $("#photo-title").textContent = $("img", b).alt;
  pv.showModal();
}));
