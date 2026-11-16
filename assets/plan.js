// Trip planner: picks a region from the focus, level and month, lines up the ferry days and estimates the cost.
const form = $("#planner");
const out = $("#result");
const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MON = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const fmt = d => `${DAYS[d.getDay()]} ${d.getDate()} ${MON[d.getMonth()]}`;
const addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
const nextOn = (d, days) => { for (let i = 0; i < 8; i++) { const x = addDays(d, i); if (days.includes(x.getDay())) return x; } return d; };

// Ferry days from data.js FERRY, as weekday numbers
const PORT = {
  Tuapejat: { out: [3, 5, 0], back: [3, 5, 0], leave: "07:00", backTime: "15:00", hours: "about 3.5 hours" },
  Siberut: { out: [2, 6], back: [2, 6], leave: "07:00", backTime: "14:30", hours: "about 4 hours" },
  Sikakap: { out: [5], back: [5, 1], leave: "06:00", backTime: "13:00", hours: "about 5 hours" },
};

const REGIONS = {
  sipora: { name: "Sipora", port: "Tuapejat", days: [
    "Boat runs to the north Sipora breaks, Telescopes on a good swell", "Day trip south to Lances Left and Right", "Rest day: snorkel the reef or ride a scooter to Tuapejat for the market"] },
  playgrounds: { name: "the Playgrounds, Siberut", port: "Siberut", days: [
    "Surf twice a day around the Playgrounds: Nipussi, Burgerworld, Beng Bengs", "Boat run to Rifles or Kandui when the wind goes west", "Rest day: snorkel or visit a Masokut village"] },
  playgroundsLearn: { name: "the Playgrounds, Siberut", port: "Siberut", days: [
    "Coaching session at Beng Bengs or Burgerworld on the small morning tide", "Video review in the afternoon, second session if it is small", "Rest day: snorkel the reef in front of the camp"] },
  pagai: { name: "North Pagai", port: "Sikakap", days: [
    "Surf Macaronis on the morning glass", "Boat run to the nearby lefts and rights", "Rest day: fishing trip or a walk to Silabu village"] },
  siberutUma: { name: "the Siberut forest", port: "Siberut", days: [
    "Boat upriver and walk to the uma with your guide", "Days with the family: sago, forest walks, meeting the sikerei", "Walk out to the river and back to the port"] },
  siporaRest: { name: "Sipora", port: "Tuapejat", days: [
    "Snorkel the house reef and the islets by boat", "Scooter to Tuapejat for the market and a warung lunch", "Beach day and a sunset boat ride"] },
  siporaLand: { name: "Sipora", port: "Tuapejat", days: [
    "Viewing at Pantai Bosua with the agent, walking the boundary", "More listings on Sipora, and the road and the power line to each", "Settle consult: ownership, notary, company setup and building costs"] },
  charter: { name: "a charter boat", port: "Charter", days: [
    "The captain follows the swell, from the Playgrounds to the Pagai lefts", "Two or three sessions a day on the best wave for the conditions", "Afternoons on the boat: fishing, snorkelling, rest"] },
};

let forced = null; // set when a curated trip is used, cleared when the visitor changes a choice
function pickRegion(v, month) {
  if (forced) return forced;
  const dry = month >= 3 && month <= 9; // April to October
  if (v.stay === "charter" && v.focus === "surf") return ["charter", "Charters run best in the dry season from March to October, when the swells are biggest."];
  if (v.focus === "culture") return ["siberutUma", "Siberut has the uma treks, and the drier months from April to October make the forest walks easier."];
  if (v.focus === "property") return ["siporaLand", "Pantai Bosua and most land for sale sit on Sipora, close to Rokot Airport and Tuapejat."];
  if (v.focus === "rest") return ["siporaRest", "Sipora has the most places to eat and the ATMs in Tuapejat, which suits families and non-surfers."];
  if (v.level === "beginner") return ["playgroundsLearn", dry ? "Most Mentawai waves are for intermediates and up. The Playgrounds have the mellowest waves, and small days are more common from November to March." : "November to March brings smaller, cleaner waves, which is the best time to learn here."];
  if (v.level === "intermediate") return dry ? ["pagai", "Macaronis is the best first Mentawai wave for intermediates, and it is most consistent from April to October."] : ["playgrounds", "Outside the dry season the Playgrounds have the most waves within a short boat ride."];
  return dry ? ["sipora", "From April to October Sipora has Telescopes and Lances Right, two of the heaviest waves in the islands."] : ["playgrounds", "In the wet season the Playgrounds give the most options, with Rifles and Kandui on a west wind."];
}

function values() {
  const f = new FormData(form);
  const v = Object.fromEntries(f);
  v.nights = +v.nights; v.people = Math.max(1, +v.people || 1);
  v.surfers = Math.min(v.people, Math.max(0, +v.surfers || 0));
  v.bags = Math.max(0, +v.bags || 0);
  if (v.focus !== "surf") v.surfers = 0;
  return v;
}

function build() {
  const v = values();
  $("#level-set").hidden = v.focus !== "surf";
  if (!v.start) return;
  const arrive = new Date(v.start + "T12:00");
  const [key, why] = pickRegion(v, arrive.getMonth());
  const R = REGIONS[key];
  const charter = R.port === "Charter";
  const rows = [];
  let nights, islandStart, islandEnd;

  if (charter) {
    nights = Math.max(11, v.nights);
    islandStart = addDays(arrive, 1); islandEnd = addDays(islandStart, nights);
    rows.push([fmt(arrive), "Arrive in Padang", "Meet the crew and load the boards. Take out your rupiah here."]);
    rows.push([fmt(islandStart), "Board the charter", "Overnight crossing to the islands."]);
  } else {
    const P = PORT[R.port];
    islandStart = nextOn(addDays(arrive, 1), P.out);
    islandEnd = nextOn(addDays(islandStart, v.nights), P.back);
    nights = Math.round((islandEnd - islandStart) / 864e5);
    const wait = Math.round((islandStart - arrive) / 864e5) - 1;
    rows.push([fmt(arrive), "Arrive in Padang", `Hotel near Muaro port.${wait > 0 ? ` The next ferry to ${R.port} is ${wait} day${wait > 1 ? "s" : ""} later, so you have ${wait > 1 ? "days" : "a day"} in Padang or can arrive later.` : ""}`]);
    rows.push([fmt(islandStart), `Mentawai Fast to ${R.port}, ${P.leave}`, `Crossing takes ${P.hours}. Transfer to your stay and settle in.`]);
  }
  // Middle days, grouped
  const mid = Math.max(0, nights - 1);
  if (mid > 0) {
    const chunks = Math.min(R.days.length, mid);
    let d = 1;
    for (let i = 0; i < chunks; i++) {
      const len = i === chunks - 1 ? mid - (d - 1) : Math.max(1, Math.round(mid / chunks));
      const a = addDays(islandStart, d), b = addDays(islandStart, d + len - 1);
      rows.push([len > 1 ? `${fmt(a)} to ${fmt(b)}` : fmt(a), R.days[i], ""]);
      d += len;
    }
  }
  if (charter) {
    rows.push([fmt(islandEnd), "Back in Padang", "The boat docks in the morning. Fly home the same day or stay a night."]);
  } else {
    const P = PORT[R.port];
    rows.push([fmt(islandEnd), `Ferry back from ${R.port}, about ${P.backTime}`, "Transfer to the port in the morning. Night in Padang."]);
    rows.push([fmt(addDays(islandEnd, 1)), "Fly home from Padang", ""]);
  }

  const est = estimate({ nights, people: v.people, surfers: v.surfers, stay: v.stay === "charter" && !charter ? "mid" : v.stay, island: R.port, bags: v.bags });
  const title = charter ? `${nights} nights on a charter boat` : `${nights} nights in ${R.name}`;
  const adjusted = nights === v.nights ? "" : `<p class="note">${charter ? `Charters run at least 11 nights, so the plan uses ${nights}.` : `Nights changed from ${v.nights} to ${nights} to match the ferry days.`}</p>`;
  const text = [`Trip plan: ${title}`, `Arrive Padang ${fmt(arrive)}, ${v.people} people, ${v.surfers} surfing`, ...rows.map(r => `${r[0]}: ${r[1]}`), `Estimate ${usd(est.lo)} to ${usd(est.hi)} for the group, flights to Padang not included`].join("\n");

  out.innerHTML = `
    <h2>${esc(title)}</h2>
    <p class="result-meta"><span>${v.people} ${v.people > 1 ? "people" : "person"}</span><span>${v.surfers} surfing</span><span>${esc(fmt(arrive))} to ${esc(fmt(addDays(islandEnd, charter ? 0 : 1)))}</span></p>
    <p>${esc(why)}</p>
    ${adjusted}
    <ol class="days">${rows.map(r => `<li><span class="when">${esc(r[0])}</span><div><p>${esc(r[1])}</p>${r[2] ? `<p class="tip">${esc(r[2])}</p>` : ""}</div></li>`).join("")}</ol>
    <div class="table-scroll">
      <table class="tbl fit">
        <caption>Cost estimate for the group</caption>
        <thead><tr><th scope="col">Item</th><th scope="col">Low</th><th scope="col">High</th></tr></thead>
        <tbody>${est.lines.map(l => `<tr><td>${esc(l.label)}<br><span class="small">${esc(l.note)}</span></td><td>${usd(l.lo)}</td><td>${usd(l.hi)}</td></tr>`).join("")}</tbody>
        <tfoot><tr class="cost-total"><th scope="row">Total</th><td>${usd(est.lo)}</td><td>${usd(est.hi)}</td></tr></tfoot>
      </table>
    </div>
    <p class="small">Estimate from published 2026 prices at IDR ${RATE.toLocaleString("en-US")} to US$1. Flights to Padang are not included. Your quote from Satu uses the real price of each booking.</p>
    <div class="actions" style="margin:var(--space-3) 0">
      <a class="btn" href="#" data-request="Plan my trip" data-message="${esc(text)}">Send this plan to Satu</a>
      <button class="btn btn-line" type="button" id="save-plan">Save on this phone</button>
      <button class="btn btn-line" type="button" id="copy-plan">Copy plan</button>
    </div>
    <h3>Sort before you fly</h3>
    <ul class="small" style="padding-left:1.1rem">
      <li><a href="guide.html#entry">e-VOA visa</a>, unless your passport enters visa-free</li>
      ${v.surfers ? `<li><a href="guide.html#surf-tax">Surf tax</a>, if your stay doesn't collect it</li>` : ""}
      <li><a href="guide.html#health">Travel doctor</a> for malaria advice, and insurance with evacuation</li>
      <li><a href="guide.html#money">Cash</a> in rupiah from Padang</li>
      <li><a href="guide.html#packing">Packing list</a></li>
    </ul>`;
  $("#save-plan").onclick = () => { store.set("plan", { v, text, saved: Date.now() }) ? toast("Plan saved on this phone") : toast("This browser blocks saving"); };
  $("#copy-plan").onclick = async e => { try { await navigator.clipboard.writeText(text); e.target.textContent = "Copied"; } catch { e.target.textContent = "Copy blocked here"; } };
}

// Nights select, start date and URL params from the home page
const ns = $("#p-nights");
for (let n = 3; n <= 16; n++) ns.add(new Option(n, n));
ns.value = 7;
const params = new URLSearchParams(location.search);
const saved = store.get("plan", null);
let start = new Date(); start.setDate(start.getDate() + 30);
if (params.get("month")) start = new Date(params.get("month") + "-05T12:00");
$("#p-start").value = start.toISOString().slice(0, 10);
$("#p-start").min = new Date().toISOString().slice(0, 10);
if (params.get("nights")) ns.value = params.get("nights");
if (params.get("focus")) form.querySelector(`[name=focus][value="${params.get("focus")}"]`)?.click();
if (params.get("level") && params.get("level") !== "none") form.querySelector(`[name=level][value="${params.get("level")}"]`)?.click();
if (![...params].length && saved?.v) {
  const v = saved.v;
  for (const [k, val] of Object.entries(v)) {
    const el = form.elements[k];
    if (!el) continue;
    if (el instanceof RadioNodeList) form.querySelector(`[name=${k}][value="${val}"]`)?.click(); else el.value = val;
  }
}
form.addEventListener("input", e => { if (e.isTrusted && e.target.type === "radio") forced = null; build(); });
form.addEventListener("change", build);
build();

// Curated trips with every day listed
$("#trip-list").innerHTML = TRIPS.map(t => `
  <article class="trip-detail" id="${t.id}">
    <img src="img/${t.img}-1000.webp" alt="" width="1000" height="750" loading="lazy">
    <div>
      <h3 style="font-size:var(--step-2)">${esc(t.title)}</h3>
      <p class="result-meta"><span>${t.stay === "charter" ? `${t.nights} nights on the boat` : `${t.nights} nights on the islands`}</span><span>${esc(t.who)}</span><span>${esc(t.season)}</span></p>
      <p>${esc(t.summary)}</p>
      <ol>${t.days.map(d => `<li>${esc(d)}</li>`).join("")}</ol>
      <p><strong class="num">From ${usd(tripFrom(t))} per person</strong> <span class="small">sharing, without flights to Padang</span></p>
      <div class="actions">
        <a class="btn" href="#" data-request="${esc(t.title)}">Book this trip</a>
        <button class="btn btn-line" type="button" data-use="${t.id}">Use in the planner</button>
      </div>
    </div>
  </article>`).join("");
document.addEventListener("click", e => {
  const b = e.target.closest("[data-use]");
  if (!b) return;
  const t = TRIPS.find(x => x.id === b.dataset.use);
  const focus = t.id === "uma-trek" ? "culture" : t.id === "land-viewing" ? "property" : "surf";
  form.querySelector(`[name=focus][value="${focus}"]`).click();
  form.querySelector(`[name=stay][value="${t.stay}"]`).click();
  if (t.id === "pagai-lefts" || t.id === "playgrounds") form.querySelector(`[name=level][value="intermediate"]`).click();
  if (t.id === "sipora-surf") form.querySelector(`[name=level][value="advanced"]`).click();
  ns.value = Math.min(16, Math.max(3, t.nights));
  const KEY = { "sipora-surf": "sipora", playgrounds: "playgrounds", "pagai-lefts": "pagai", charter: "charter", "uma-trek": "siberutUma", "land-viewing": "siporaLand" };
  forced = [KEY[t.id], `${t.summary} Season: ${t.season}.`];
  build();
  form.scrollIntoView({ behavior: reduceMotion.matches ? "auto" : "smooth" });
});
