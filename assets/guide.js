// Guide page: ferry and wave tables, the packing checklist and the contents highlight.
$("#ferry-table tbody").innerHTML = FERRY.map(f => `<tr><td><strong>${esc(f.to)}</strong><br><span class="small">${esc(f.island)}</span></td><td>${esc(f.out)}</td><td>${esc(f.back)}</td><td>${esc(f.time)}</td><td>${idr(f.fare)}</td></tr>`).join("");
$("#break-table tbody").innerHTML = BREAKS.map(b => `<tr><td><strong>${esc(b.name)}</strong></td><td>${esc(b.region)}</td><td>${esc(b.dir)}</td><td>${esc(b.level)}</td><td>${esc(b.note)}</td></tr>`).join("");

const PACK = [
  "Passport with 6 months left, and 2 photocopies", "e-VOA approval on your phone", "Travel insurance with surfing and evacuation",
  "Rupiah in cash from Padang", "Visa or Mastercard for the resort tab", "Telkomsel SIM or eSIM",
  "Malaria tablets if your doctor advises them", "DEET insect repellent", "First-aid kit with antiseptic and dressings",
  "Prescription medicine", "Reef-safe sunscreen, hat and sunglasses", "Rash vest or long-sleeve surf top",
  "Reef booties", "Surf helmet for shallow waves", "Boards, fins, leashes and wax", "Ding repair kit",
  "Long sleeves and pants for the evenings", "Sandals and one pair of shoes", "Refillable water bottle",
  "Dry bag for the boat", "Power bank and charger", "Head torch",
];
const done = new Set(store.get("pack", []));
const list = $("#packlist");
list.innerHTML = PACK.map((p, i) => `<li><label><input type="checkbox" data-i="${i}" ${done.has(i) ? "checked" : ""}><span>${esc(p)}</span></label></li>`).join("");
const progress = () => { $("#pack-progress").textContent = `${done.size} of ${PACK.length} packed`; };
list.addEventListener("change", e => {
  const i = +e.target.dataset.i;
  e.target.checked ? done.add(i) : done.delete(i);
  store.set("pack", [...done]); progress();
});
$("#pack-reset").addEventListener("click", () => { done.clear(); store.set("pack", []); $$("input", list).forEach(c => (c.checked = false)); progress(); });
progress();

// Highlight the section in view
const links = new Map($$(".toc a").map(a => [a.getAttribute("href").slice(1), a]));
const io = new IntersectionObserver(entries => {
  for (const en of entries) if (en.isIntersecting) { links.forEach(a => a.classList.remove("on")); links.get(en.target.id)?.classList.add("on"); }
}, { rootMargin: "-30% 0px -60% 0px" });
$$(".guide-sec").forEach(s => io.observe(s));
