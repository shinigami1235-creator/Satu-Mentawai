// Market buyer page: categories, filters, sort, saved items and the listing detail.
const grid = $("#items");
if (matchMedia("(max-width: 900px)").matches) $("#filter-box").open = false;
const fForm = $("#filters");
let cat = "";

$("#cats").innerHTML = [["", "All", "i-market"], ...CATEGORIES.map(c => [c, c, CAT_ICON[c]])]
  .map(([v, t, i]) => `<button class="cat" type="button" data-cat="${esc(v)}" aria-pressed="${v === cat}"><svg class="ic"><use href="#${i}"/></svg>${esc(t)}</button>`).join("");
$("#cats").addEventListener("click", e => {
  const b = e.target.closest("[data-cat]"); if (!b) return;
  cat = b.dataset.cat;
  $$(".cat").forEach(x => x.setAttribute("aria-pressed", String(x === b)));
  render();
});

function condGroup(c) { return c.startsWith("New") ? "New" : c.startsWith("Used") ? "Used" : "Service"; }
function age(l) { return l.created ? (Date.now() - l.created) / 864e5 : l.days; }

function render() {
  const f = new FormData(fForm);
  const conds = f.getAll("cond");
  const min = +f.get("min") || 0, max = +f.get("max") || Infinity;
  const ws = words($("#mq").value);
  const saved = savedIds();
  let rows = allListings().filter(l =>
    (!cat || l.cat === cat) &&
    (!f.get("island") || l.island === f.get("island")) &&
    (!conds.length || conds.includes(condGroup(l.cond))) &&
    (!l.price || (l.price >= min && l.price <= max)) &&
    (!f.get("delivery") || /deliver|freight/i.test(l.handover)) &&
    (!f.get("saved") || saved.has(l.id)) &&
    (!ws.length || score(`${l.title} ${l.cat} ${l.desc} ${l.place} ${l.island}`, ws) > 0));
  const s = $("#sort").value;
  rows.sort(s === "low" ? (a, b) => (a.price || 0) - (b.price || 0) : s === "high" ? (a, b) => (b.price || 0) - (a.price || 0) : (a, b) => age(a) - age(b));
  $("#count").textContent = `${rows.length} listing${rows.length === 1 ? "" : "s"}${cat ? " in " + cat : ""}`;
  grid.innerHTML = rows.length ? rows.map(l => itemCard(l, saved)).join("")
    : `<div class="empty"><p>No listings match. Clear a filter, or post what you need on the sell page.</p><a class="btn btn-line" href="sell.html">Post a listing</a></div>`;
}
fForm.addEventListener("input", render);
fForm.addEventListener("reset", () => setTimeout(render));
$("#sort").addEventListener("change", render);
$("#m-search").addEventListener("submit", e => { e.preventDefault(); render(); });
$("#mq").addEventListener("input", render);
document.addEventListener("saved-change", () => { if (new FormData(fForm).get("saved")) render(); });

/* Listing detail */
const dlg = $("#item");
function openItem(id) {
  const l = allListings().find(x => x.id === id);
  if (!l) return;
  const photos = l.photos || [];
  const ask = `Hi ${l.seller}, is your "${l.title}" on Satu Mentawai still available?`;
  const sellerWa = l.phone ? `https://wa.me/${l.phone}?text=${encodeURIComponent(ask)}` : waLink(ask);
  $("#item-title").textContent = l.title;
  $("#item-body").innerHTML = `
    <div>
      <div class="item-photo" id="big">${photos.length ? `<img src="${photos[0]}" alt="${esc(l.title)}">` : `<svg class="ic" aria-hidden="true"><use href="#${CAT_ICON[l.cat] || "i-market"}"/></svg>`}</div>
      ${photos.length > 1 ? `<div class="thumbs">${photos.map((p, i) => `<button type="button" data-ph="${i}" aria-current="${i === 0}" aria-label="Photo ${i + 1}"><img src="${p}" alt=""></button>`).join("")}</div>` : ""}
      ${l.sample ? `<p class="small" style="margin-top:.6rem">Sample listing for the preview build.</p>` : ""}
    </div>
    <div>
      <p style="margin:0">${priceHtml(l)}</p>
      <dl class="facts-list">
        <dt>Category</dt><dd>${esc(l.cat)}</dd>
        <dt>Condition</dt><dd>${esc(l.cond)}</dd>
        <dt>Where</dt><dd>${esc(l.place)}, ${esc(l.island)}</dd>
        <dt>Handover</dt><dd>${esc(l.handover)}</dd>
        <dt>Seller</dt><dd>${esc(l.seller)}</dd>
        <dt>Listed</dt><dd>${ago(Math.floor(age(l)))}</dd>
      </dl>
      <p>${esc(l.desc)}</p>
      <div class="actions" style="margin-bottom:1rem">
        <a class="btn" href="${sellerWa}" target="_blank" rel="noopener">Message on WhatsApp</a>
        <button class="btn btn-line" type="button" data-save="${l.id}" aria-pressed="${savedIds().has(l.id)}">Save</button>
      </div>
      <form id="offer" class="form-grid" style="grid-template-columns:1fr auto;align-items:end;margin-bottom:1rem">
        <label>Make an offer in IDR<input name="offer" type="number" min="0" step="10000" inputmode="numeric" required placeholder="${l.price ? Math.round(l.price * 0.9) : ""}"></label>
        <button class="btn btn-line" type="submit">Write the offer</button>
      </form>
      <p class="note"><strong>Pay in person.</strong> Check the item and the papers before paying, and never send a deposit to someone you haven't met.</p>
      <button class="link-btn small" type="button" data-request="Report a listing" data-message="Listing: ${esc(l.title)} (${esc(l.id)})">Report this listing</button>
    </div>`;
  $("#offer").addEventListener("submit", e => {
    e.preventDefault();
    const n = +e.target.elements.offer.value;
    if (!n) return;
    const text = `Hi ${l.seller}, I'd like to offer ${idr(n)} for your "${l.title}" on Satu Mentawai.`;
    const href = l.phone ? `https://wa.me/${l.phone}?text=${encodeURIComponent(text)}` : waLink(text);
    let a = $("#offer-go");
    if (!a) { a = document.createElement("a"); a.id = "offer-go"; a.className = "btn"; a.target = "_blank"; a.rel = "noopener"; e.target.after(a); }
    a.href = href; a.textContent = `Send ${idr(n)} offer on WhatsApp`; a.style.marginBottom = "1rem";
    a.focus();
  });
  $$("[data-ph]", dlg).forEach(b => b.addEventListener("click", () => {
    $("#big img").src = photos[+b.dataset.ph];
    $$("[data-ph]", dlg).forEach(x => x.setAttribute("aria-current", String(x === b)));
  }));
  if (!dlg.open) dlg.showModal();
  history.replaceState(null, "", "#" + l.id);
}
grid.addEventListener("click", e => { const b = e.target.closest("[data-item]"); if (b) openItem(b.dataset.item); });
dlg.addEventListener("close", () => history.replaceState(null, "", location.pathname + location.search));

const q = new URLSearchParams(location.search);
if (q.get("cat") && CATEGORIES.includes(q.get("cat"))) $(`[data-cat="${CSS.escape(q.get("cat"))}"]`).click();
render();
if (location.hash.length > 1) openItem(decodeURIComponent(location.hash.slice(1)));
