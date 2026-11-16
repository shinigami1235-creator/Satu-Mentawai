// Seller page: photos resized in the browser, a live preview card, and listings kept in this browser.
const sf = $("#sell");
const photoRow = $("#photos");
let photos = [];
let editing = null;
$("#s-cat").innerHTML = CATEGORIES.map(c => `<option>${esc(c)}</option>`).join("");

/* Photos: resized to 900 px JPEG so several fit in the browser's storage */
function resize(file) {
  return new Promise((res, rej) => {
    const img = new Image();
    img.onload = () => {
      const s = Math.min(1, 900 / Math.max(img.width, img.height));
      const c = document.createElement("canvas");
      c.width = Math.round(img.width * s); c.height = Math.round(img.height * s);
      c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
      URL.revokeObjectURL(img.src);
      res(c.toDataURL("image/jpeg", 0.72));
    };
    img.onerror = rej;
    img.src = URL.createObjectURL(file);
  });
}
async function addFiles(list) {
  for (const f of [...list].filter(f => f.type.startsWith("image/"))) {
    if (photos.length >= 6) { toast("6 photos is the limit"); break; }
    try { photos.push(await resize(f)); } catch { toast(`${f.name} could not be opened`); }
  }
  drawPhotos(); preview();
}
function drawPhotos() {
  photoRow.innerHTML = photos.map((p, i) => `<figure><img src="${p}" alt="Photo ${i + 1}">${i === 0 ? "<figcaption>Cover</figcaption>" : ""}<button type="button" data-rm="${i}" aria-label="Remove photo ${i + 1}">Remove</button></figure>`).join("");
}
$("#files").addEventListener("change", e => { addFiles(e.target.files); e.target.value = ""; });
photoRow.addEventListener("click", e => { const b = e.target.closest("[data-rm]"); if (b) { photos.splice(+b.dataset.rm, 1); drawPhotos(); preview(); } });
const drop = $("#drop");
["dragenter", "dragover"].forEach(t => drop.addEventListener(t, e => { e.preventDefault(); drop.classList.add("over"); }));
["dragleave", "drop"].forEach(t => drop.addEventListener(t, e => { e.preventDefault(); drop.classList.remove("over"); }));
drop.addEventListener("drop", e => addFiles(e.dataTransfer.files));

/* Live preview */
function draft() {
  const v = Object.fromEntries(new FormData(sf));
  return {
    id: editing || "draft", cat: v.cat, title: v.title.trim() || "Your title", price: +v.price || 0, unit: v.unit || "",
    island: v.island, place: v.place.trim() || "Town", cond: v.cond, handover: v.handover, seller: v.seller.trim() || "You",
    phone: v.phone.replace(/\D/g, ""), desc: v.desc.trim(), photos: [...photos],
  };
}
function preview() { $("#preview").innerHTML = itemCard({ ...draft(), mine: true, created: Date.now() }, new Set()); }
sf.addEventListener("input", preview);

/* Your listings */
function drawMine() {
  const mine = myListings();
  $("#mine").innerHTML = mine.length ? mine.map(l => `
    <li>
      <span class="thumb">${l.photos?.[0] ? `<img src="${l.photos[0]}" alt="">` : `<svg class="ic" aria-hidden="true"><use href="#${CAT_ICON[l.cat]}"/></svg>`}</span>
      <span><strong>${esc(l.title)}</strong><br><span class="small">${l.sold ? "Sold" : l.price ? idr(l.price) : esc(l.unit)}</span></span>
      <span class="actions">
        <button class="link-btn small" type="button" data-edit="${l.id}">Edit</button>
        <button class="link-btn small" type="button" data-sold="${l.id}">${l.sold ? "Relist" : "Mark sold"}</button>
        <button class="link-btn small" type="button" data-del="${l.id}">Delete</button>
      </span>
    </li>`).join("") : `<li style="display:block;border:0;padding:0" class="small">Nothing posted yet.</li>`;
}
$("#mine").addEventListener("click", e => {
  const mine = myListings();
  const t = e.target;
  if (t.dataset.sold) { const l = mine.find(x => x.id === t.dataset.sold); l.sold = !l.sold; store.set("mine", mine); drawMine(); toast(l.sold ? "Marked sold" : "Back in the market"); }
  if (t.dataset.del) {
    if (t.textContent !== "Delete for good?") { t.textContent = "Delete for good?"; return; }
    store.set("mine", mine.filter(x => x.id !== t.dataset.del)); drawMine(); toast("Listing deleted");
  }
  if (t.dataset.edit) {
    const l = mine.find(x => x.id === t.dataset.edit);
    editing = l.id; photos = [...(l.photos || [])];
    for (const [k, v] of Object.entries(l)) {
      const el = sf.elements[k];
      if (!el || k === "photos") continue;
      if (el instanceof RadioNodeList) { const r = sf.querySelector(`[name=${k}][value="${CSS.escape(v)}"]`); if (r) r.checked = true; }
      else el.value = k === "price" && !v ? "" : v;
    }
    $("#s-submit").textContent = "Save changes"; $("#s-cancel").hidden = false;
    drawPhotos(); preview(); sf.scrollIntoView({ behavior: reduceMotion.matches ? "auto" : "smooth" });
  }
});
function resetForm() {
  sf.reset(); photos = []; editing = null; drawPhotos(); preview();
  $("#s-submit").textContent = "Post listing"; $("#s-cancel").hidden = true; $("#s-error").hidden = true;
}
$("#s-cancel").addEventListener("click", resetForm);

/* Post */
sf.addEventListener("submit", e => {
  e.preventDefault();
  const err = $("#s-error");
  const d = draft();
  const fail = msg => { err.textContent = msg; err.style.color = ""; err.hidden = false; err.scrollIntoView({ block: "center" }); };
  if (!sf.elements.title.value.trim()) return fail("Add a title.");
  if (!sf.elements.place.value.trim()) return fail("Add the town or village.");
  if (!sf.elements.seller.value.trim()) return fail("Add your name.");
  if (d.phone.length < 9) return fail("Add a WhatsApp number with the country code, such as +62 812 3456 7890.");
  if (!$("#s-rules").checked) return fail("Tick the box to confirm the item follows the market rules.");
  err.hidden = true;
  const mine = myListings();
  if (editing) {
    const i = mine.findIndex(x => x.id === editing);
    mine[i] = { ...mine[i], ...d, id: editing };
  } else {
    mine.unshift({ ...d, id: "m" + Date.now(), created: Date.now() });
  }
  if (!store.set("mine", mine)) return fail("This browser is out of space for photos. Remove a photo and post again.");
  const wasEdit = !!editing;
  resetForm(); drawMine();
  toast(wasEdit ? "Changes saved" : "Posted to the market");
  const id = wasEdit ? d.id : mine[0].id;
  err.hidden = false; err.style.color = "var(--palm)";
  err.innerHTML = `${wasEdit ? "Saved." : "Posted."} <a href="market.html#${id}">See it in the market</a>`;
});

drawMine(); preview();
