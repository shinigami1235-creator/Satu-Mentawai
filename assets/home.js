// Home page: quick planner months, curated trip rail, ferry table, market preview and search.
const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const ms = $("#quick-month");
const now = new Date();
for (let i = 0; i < 12; i++) {
  const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
  ms.add(new Option(`${months[d.getMonth()]} ${d.getFullYear()}`, `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`));
}
ms.selectedIndex = 1;

$("#trip-rail").innerHTML = TRIPS.map(t => `
  <a class="trip" href="plan.html#${t.id}">
    <img src="img/${t.img}-1000.webp" alt="" width="1000" height="750" loading="lazy">
    <div class="trip-body">
      <h3>${esc(t.title)}</h3>
      <span class="meta">${esc(t.who)}</span>
      <p style="margin:.3rem 0 1rem">${esc(t.summary)}</p>
      <div class="trip-stub">
        <div><b class="num">${t.nights}</b><br><span>nights ${t.stay === "charter" ? "on the boat" : "on the islands"}</span></div>
        <div class="from"><span>from, per person</span><br><b class="num">${usd(tripFrom(t))}</b></div>
      </div>
    </div>
  </a>`).join("");

$("#ferry-table tbody").innerHTML = FERRY.map(f => `<tr><td><b>${esc(f.to)}</b><span>${esc(f.island)}</span></td><td data-l="Leaves Padang"><span class="t">${esc(f.out)}</span></td><td data-l="Back to Padang">${esc(f.back)}</td><td data-l="Crossing">${esc(f.time)}</td><td data-l="One way" class="fare">${idr(f.fare)}</td></tr>`).join("");

function renderHomeItems() { $("#home-items").innerHTML = allListings().slice(0, 4).map(l => itemCard(l)).join(""); }
renderHomeItems();
$("#home-items").addEventListener("click", e => { const b = e.target.closest("[data-item]"); if (b) location.href = "market.html#" + b.dataset.item; });

const SEARCH = [
  ...KB.map(k => ({ title: k.title, text: k.title + " " + k.tags, sub: k.answer[0], url: k.url })),
  ...TRIPS.map(t => ({ title: t.title, text: t.title + " " + t.summary + " trip " + t.island, sub: t.summary, url: "plan.html#" + t.id })),
  ...LISTINGS.map(l => ({ title: l.title, text: l.title + " " + l.cat + " " + l.island + " " + l.place, sub: `${l.price ? idr(l.price) : l.unit}. ${l.place}, ${l.island}`, url: "market.html#" + l.id })),
];
$("#finder-form").addEventListener("submit", e => {
  e.preventDefault();
  const ws = words($("#q").value);
  const out = $("#results");
  if (!ws.length) { out.innerHTML = ""; return; }
  const hits = SEARCH.map(s => [score(s.text, ws), s]).filter(([n]) => n > 0).sort((a, b) => b[0] - a[0]).slice(0, 6).map(([, s]) => s);
  out.innerHTML = hits.length
    ? `<ul>${hits.map(s => `<li><a href="${s.url}"><strong>${esc(s.title)}</strong><span>${esc(s.sub)}</span></a></li>`).join("")}</ul>`
    : `<p>Nothing on the site matches "${esc($("#q").value)}" yet. <button class="btn btn-line btn-sm" type="button" data-ask="${esc($("#q").value)}">Ask Satu</button></p>`;
});
