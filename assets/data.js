// Satu Mentawai content. Prices and times come from the sources listed in README.md.
// Change a figure here and every page that shows it updates.

const RATE = 16500; // IDR per US$1, used only to show US$ estimates
const toUsd = n => n / RATE;
const idr = n => "IDR\u00a0" + Math.round(n).toLocaleString("en-US");
const usd = n => "US$" + Math.round(n).toLocaleString("en-US");

const COSTS = {
  ferryOneWay: { Tuapejat: 350000, Siberut: 350000, Sikakap: 450000 },   // IDR, Mentawai Fast
  boardBagFerry: 220000,          // IDR per board bag, each way, up to 15 kg
  surfTax: 2000000,               // IDR per surfer per 15 days
  visa: 500000,                   // IDR, e-VOA or VOA, 30 days
  stayPerNight: { budget: [50, 100], mid: [150, 300], luxury: [400, 700] }, // US$ per person, meals usually included
  charterPerPerson: [2000, 5000], // US$, 11 to 13 nights from Padang
  transferEachWay: [40, 80],      // US$ per person, port or airport to the stay
  padangHotel: [25, 60],          // US$ per room per night
};

const FERRY = [
  { to: "Tuapejat", island: "Sipora", out: "Wed, Fri, Sun 07:00", back: "Same day 15:00", time: "About 3.5 hours", fare: 350000 },
  { to: "Siberut (Maileppet)", island: "Siberut", out: "Tue and Sat 07:00", back: "Same day 14:30", time: "About 4 hours", fare: 350000 },
  { to: "Sikakap", island: "Pagai", out: "Fri 06:00 to 07:00", back: "Fri and Mon about 13:00", time: "About 5 hours", fare: 450000 },
];

const BREAKS = [
  { name: "Macaronis", region: "Pagai", dir: "Left", level: "Intermediate and up", note: "Long, consistent left that most surfers can ride. The best first Mentawai wave." },
  { name: "Lances Right (HTs)", region: "Sipora south", dir: "Right", level: "Advanced", note: "Fast, hollow right over shallow reef." },
  { name: "Lances Left", region: "Sipora south", dir: "Left", level: "Intermediate and up", note: "Works when the right is too big. Across the bay from Pantai Bosua." },
  { name: "Telescopes", region: "Sipora north", dir: "Left", level: "Advanced", note: "World-class left, reachable from land camps near Tuapejat." },
  { name: "Rifles (Kandui Right)", region: "Playgrounds", dir: "Right", level: "Advanced", note: "Long, fast right that fires when the wind goes west." },
  { name: "Kandui Left", region: "Playgrounds", dir: "Left", level: "Advanced", note: "Heavy barrel on a big swell." },
  { name: "Bankvaults", region: "Playgrounds", dir: "Right", level: "Advanced", note: "Steep, hollow take-off on a triangular reef." },
  { name: "Nipussi", region: "Playgrounds", dir: "Right", level: "Intermediate", note: "Mellow right with rides of about 75 metres." },
  { name: "Burgerworld", region: "Playgrounds", dir: "Left and right", level: "Intermediate", note: "The slowest wave in the Playgrounds and the place to warm up." },
  { name: "Beng Bengs", region: "Playgrounds", dir: "Right", level: "Strong beginner on small days", note: "Playful right in front of the Masokut surf camps." },
];

const TRIPS = [
  { id: "sipora-surf", title: "Sipora surf week", img: "cove-reef", nights: 7, island: "Tuapejat", stay: "mid", surf: true,
    who: "Intermediate to advanced surfers", season: "April to October",
    summary: "A land camp on Sipora with boat runs to Telescopes in the north and Lances in the south.",
    days: ["Arrive in Padang and check in near the port", "Mentawai Fast to Tuapejat, transfer to your camp, afternoon surf",
      "Surf days with boat runs to Telescopes and the north Sipora breaks", "Day trip south to Lances Left and Right on a good swell",
      "Last surf in the morning, ferry back to Padang at 15:00", "Fly home from Padang"] },
  { id: "playgrounds", title: "Playgrounds surf camp", img: "islets", nights: 9, island: "Siberut", stay: "mid", surf: true,
    who: "Intermediate surfers", season: "All year, best April to October",
    summary: "Twenty-plus waves within a short boat ride, including the mellower Nipussi and Burgerworld.",
    days: ["Arrive in Padang", "Mentawai Fast to Siberut, speedboat to a Masokut surf camp",
      "Surf twice a day around the Playgrounds: Nipussi, Burgerworld, Beng Bengs", "Rest day: snorkel the reef or visit a village",
      "Speedboat to Siberut and ferry back to Padang", "Fly home"] },
  { id: "pagai-lefts", title: "Pagai lefts", img: "cove-top", nights: 7, island: "Sikakap", stay: "luxury", surf: true,
    who: "Goofy-footers and intermediate surfers", season: "April to October",
    summary: "Seven nights on the lefts of North Pagai, with Macaronis as the main wave.",
    days: ["Arrive in Padang on Thursday", "Friday ferry to Sikakap and speedboat to your resort",
      "Surf Macaronis and the nearby lefts and rights", "Friday ferry back from Sikakap, arriving Padang about 18:30", "Fly home"] },
  { id: "charter", title: "Surf charter", img: "sunset-boat", nights: 12, island: "Charter", stay: "charter", surf: true,
    who: "Groups of 7 to 12 advanced surfers", season: "March to October",
    summary: "Twelve nights on a boat that follows the swell from the Playgrounds to Pagai.",
    days: ["Arrive in Padang, meet the crew", "Overnight crossing to the islands",
      "Surf the best wave for the swell each day, from Rifles to Macaronis", "Overnight crossing back to Padang", "Fly home"] },
  { id: "uma-trek", title: "Siberut uma trek", img: "coast-road", nights: 4, island: "Siberut", stay: "budget", surf: false,
    who: "Travellers who want the culture and the forest", season: "All year, drier April to October",
    summary: "Four nights with a Mentawai family in an uma, the clan longhouse, inside the Siberut forest.",
    days: ["Arrive in Padang and buy the gifts your guide suggests", "Ferry to Siberut, boat upriver, walk to the uma",
      "Days with the family: sago, hunting walks, the sikerei healers", "Walk out and ferry back to Padang", "Fly home"] },
  { id: "land-viewing", title: "Land viewing trip", img: "bosua-plot", nights: 3, island: "Tuapejat", stay: "mid", surf: false,
    who: "Buyers and investors", season: "Any time",
    summary: "See Pantai Bosua and other listings on Sipora, with a Settle consult on ownership.",
    days: ["Fly Padang to Rokot (Susi Air, 07:00) or take the ferry to Tuapejat", "Viewings with the agent and a walk of each plot's boundary",
      "Settle consult: ownership, notary, company setup and building costs", "Ferry or flight back to Padang"] },
];

const LISTINGS = [
  { id: "s1", cat: "Surf", title: "6'4\" Pyzel Ghost, round tail", price: 5500000, island: "Sipora", place: "Tuapejat", cond: "Used, good", handover: "Pickup or ferry freight", seller: "Dodi", days: 2, desc: "Two trips old. Small ding on the rail, fixed. Comes with fins and a day bag." },
  { id: "s2", cat: "Surf", title: "Triple board bag, 6'6\"", price: 1800000, island: "Siberut", place: "Masokut", cond: "Used, good", handover: "Pickup", seller: "Rina", days: 5, desc: "Wheeled coffin bag. All zips work." },
  { id: "s3", cat: "Boats", title: "Fibreglass longboat with 40 hp Yamaha", price: 68000000, island: "Pagai", place: "Sikakap", cond: "Used, fair", handover: "Pickup", seller: "Pak Yohanes", days: 9, desc: "8 metres, seats 10. Engine serviced in August. Papers in order." },
  { id: "s4", cat: "Vehicles", title: "Honda Beat 2021 with surf rack", price: 11500000, island: "Sipora", place: "Tuapejat", cond: "Used, good", handover: "Pickup", seller: "Andi", days: 1, desc: "16,000 km. Side rack fits two boards." },
  { id: "s5", cat: "Rentals", title: "Scooter rental, daily or weekly", price: 100000, unit: "per day", island: "Sipora", place: "Tuapejat", cond: "Service", handover: "Delivered to your stay", seller: "Tuapejat Rentals", days: 3, desc: "Helmet and rack included. Weekly rate on request." },
  { id: "s6", cat: "Dive and fishing", title: "Dive set: BCD, regulator and two tanks", price: 9500000, island: "Sipora", place: "Tuapejat", cond: "Used, good", handover: "Pickup", seller: "Marco", days: 12, desc: "Regulator serviced this year. Tanks in date." },
  { id: "s7", cat: "Building", title: "Ironwood planks, 4 m, 40 pieces", price: 14000000, island: "Siberut", place: "Muara Siberut", cond: "New", handover: "Delivery by boat", seller: "Toko Sinar", days: 6, desc: "Kiln dried. Delivery to the Siberut coast by boat at cost." },
  { id: "s8", cat: "Home", title: "Solar kit: 2 panels, inverter, battery", price: 12500000, island: "Pagai", place: "Sikakap", cond: "Used, good", handover: "Pickup", seller: "Lena", days: 15, desc: "Runs lights, fans and a fridge. Two years old." },
  { id: "s9", cat: "Services", title: "Ding repair, 2 to 3 days", price: 150000, unit: "from", island: "Sipora", place: "Tuapejat", cond: "Service", handover: "Drop off", seller: "Tuapejat Ding Shop", days: 20, desc: "Polyester and epoxy. Price depends on the size of the ding." },
  { id: "s10", cat: "Jobs", title: "Boat captain for surf resort", price: 0, unit: "Salary on interview", island: "Siberut", place: "Masokut", cond: "Job", handover: "Full time", seller: "Resort operator", days: 4, desc: "Needs 3 years on Mentawai waters and a valid licence." },
  { id: "s11", cat: "Surf", title: "Wetsuit top and booties, size M", price: 650000, island: "Sipora", place: "Tuapejat", cond: "Used, good", handover: "Pickup", seller: "Sophie", days: 7, desc: "Reef booties size 42. Leaving the islands and travelling light." },
  { id: "s12", cat: "Home", title: "Teak dining table and 6 chairs", price: 7000000, island: "Sipora", place: "Tuapejat", cond: "Used, good", handover: "Pickup", seller: "Villa owner", days: 10, desc: "Solid teak. Moving out of a villa near Tuapejat." },
];

const CATEGORIES = ["Surf", "Boats", "Vehicles", "Rentals", "Dive and fishing", "Building", "Home", "Services", "Jobs"];

const KB = [
  { id: "getthere", title: "Getting to Mentawai", tags: "get reach arrive fly flight padang route travel transport",
    url: "guide.html#getting-there",
    answer: ["Fly to Padang (PDG) first. There are direct flights from Jakarta and Bali, and international flights from Kuala Lumpur and Singapore.",
      "The Mentawai Fast leaves Muaro port early in the morning, so book a hotel in Padang for the night before. Tuapejat on Sipora is about 3.5 hours away.",
      "Susi Air also flies Padang to Rokot on Sipora in 40 minutes on a small plane, a few times a week."] },
  { id: "ferry", title: "Mentawai Fast ferry", tags: "ferry boat ticket schedule timetable fare tuapejat siberut sikakap muaro",
    url: "guide.html#getting-there",
    answer: ["Tuapejat (Sipora): Wednesday, Friday and Sunday at 07:00. Siberut: Tuesday and Saturday. Sikakap (Pagai): Friday.",
      "One way costs IDR 350,000 to Tuapejat or Siberut and IDR 450,000 to Sikakap. Buy at the port the day before.",
      "The Monday Tuapejat sailing was suspended in October 2026 for maintenance, so check with Mentawai Fast before booking flights around it."] },
  { id: "boards", title: "Surfboards on the ferry", tags: "surfboard board luggage bag ferry weight freight",
    url: "guide.html#getting-there",
    answer: ["Board bags go as freight on the Mentawai Fast for about IDR 220,000 each way, up to 15 kg. Camps on the islands also rent boards."] },
  { id: "visa", title: "Visa for Indonesia", tags: "visa voa evoa entry passport immigration arrival",
    url: "guide.html#entry",
    answer: ["Most visitors use the e-VOA, applied for at evisa.imigrasi.go.id before you fly. It costs IDR 500,000 and gives 30 days, extendable once by 30 days.",
      "Your passport needs 6 months of validity from arrival. ASEAN passports enter visa-free for 30 days.",
      "Immigration proposed raising the e-VOA to IDR 750,000 in August 2026, so check the fee when you apply."] },
  { id: "surftax", title: "Mentawai surf tax", tags: "surf tax levy fee retribusi wristband band permit",
    url: "guide.html#surf-tax",
    answer: ["Every foreign surfer pays the Mentawai surf tax of IDR 2,000,000, valid for 15 days and renewed for each extra 15 days.",
      "Most resorts and charters collect it for you. Ask when you book, since rangers check at the main surf areas."] },
  { id: "money", title: "Cash and ATMs", tags: "money cash atm bank card rupiah pay credit",
    url: "guide.html#money",
    answer: ["Take out the rupiah you need in Padang. Tuapejat has the only working ATMs and a BRI bank, and the rest of the islands run on cash.",
      "Resorts take cards for the bar tab. Ferries, boatmen and warungs want cash."] },
  { id: "health", title: "Malaria and health", tags: "malaria health doctor medicine mosquito dengue sick injury hospital insurance reef cut",
    url: "guide.html#health",
    answer: ["Malaria and dengue are present in the Mentawai Islands. See a travel doctor about tablets before you go and use DEET repellent from dusk.",
      "Reef cuts infect fast in the tropics, so clean every cut the same day.",
      "Serious injuries go to Padang by boat or plane. Buy travel insurance that covers surfing and medical evacuation."] },
  { id: "signal", title: "Phone signal and internet", tags: "phone signal internet wifi sim esim data telkomsel connection",
    url: "guide.html#phone",
    answer: ["Telkomsel has the best coverage. Buy the SIM or eSIM in Padang since shops on the islands are few.",
      "Signal is good in Tuapejat and patchy elsewhere. Most resorts have wifi, and the jungle on Siberut has none."] },
  { id: "season", title: "Best time to go", tags: "season when month weather swell crowd wet dry rain",
    url: "guide.html#seasons",
    answer: ["April to October is the dry season, with the biggest and cleanest swells and the most surfers.",
      "November to March has smaller waves, cleaner mornings and fewer people, which suits intermediates and families."] },
  { id: "beginner", title: "Surfing as a beginner", tags: "beginner learn lesson first time easy level",
    url: "plan.html",
    answer: ["Most Mentawai waves are reef breaks for intermediates and up. Beginners do best on small days from November to March at a camp with coaching, at waves like Beng Bengs in the Playgrounds."] },
  { id: "charter", title: "Surf charter boats", tags: "charter boat trip liveaboard nights surfers",
    url: "plan.html#trips",
    answer: ["Charters leave Padang and run 11 to 13 nights with 7 to 12 surfers on board, from about US$2,000 to US$5,000 per person."] },
  { id: "stay", title: "Places to stay and prices", tags: "stay hotel resort villa homestay camp accommodation room price night",
    url: "plan.html",
    answer: ["Surf camps and guesthouses cost about US$50 to 100 a night with meals. Resorts with boat guiding run US$150 to 300, and the top resorts start at about US$400.",
      "Use the trip planner to match a stay to your dates and level."] },
  { id: "pack", title: "What to pack", tags: "pack packing bring clothes gear list booties helmet sunscreen",
    url: "guide.html#packing",
    answer: ["Reef booties, a rash vest, sunscreen, DEET, a first-aid kit with antiseptic, cash in rupiah and copies of your passport.",
      "The guide has a packing list you can tick off on your phone."] },
  { id: "culture", title: "Visiting a Mentawai uma", tags: "culture tribe uma longhouse sikerei trek trekking jungle village family",
    url: "plan.html#trips",
    answer: ["Treks into the Siberut forest stay with a Mentawai family in an uma, the clan longhouse. Most run 4 or 5 days with the ferry included.",
      "Go with a guide who works with the families, ask before taking photos, and bring the gifts the guide suggests."] },
  { id: "bosua", title: "Pantai Bosua beachfront land", tags: "pantai bosua land property sale buy plot beachfront invest real estate freehold",
    url: "property-pantai-bosua.html",
    answer: ["Pantai Bosua is 2,843 m² of flat beachfront land in a cove on south Sipora, listed at €299,000 (about €105 per m²). It faces Bintang Left."] },
  { id: "foreign", title: "Buying land as a foreigner", tags: "foreigner foreign own land ownership legal title company pt pma lease",
    url: "property-pantai-bosua.html",
    answer: ["Indonesian law limits freehold ownership by foreigners, so settle how you will hold the land before paying a deposit.",
      "A Settle consult covers the ownership options, the notary and the company setup."] },
  { id: "sell", title: "Selling something", tags: "sell selling post list listing advertise market marketplace item board boat scooter gear",
    url: "sell.html",
    answer: ["Post it on the Satu market with photos, a price in rupiah and your island. Buyers message you on WhatsApp."] },
  { id: "buy", title: "Buying in the market", tags: "buy buying market marketplace second hand board boat scooter gear used",
    url: "market.html",
    answer: ["The market has boards, boats, scooters, building materials and services across the islands. Filter by island and message the seller on WhatsApp."] },
];

// Trip cost estimate in US$. Flights to Padang are not included.
// nights = nights on the islands (or on the boat for a charter). Padang nights are added on top.
function estimate({ nights, people = 1, surfers = people, stay = "mid", island = "Tuapejat", bags = 0 }) {
  const charter = stay === "charter" || island === "Charter";
  const padangNights = charter ? 1 : 2;
  const rooms = Math.ceil(people / 2);
  const fare = COSTS.ferryOneWay[island] || 350000;
  const lines = [];
  const add = (label, lo, hi, note = "") => lines.push({ label, lo, hi, note });
  add(`Padang hotel, ${padangNights} night${padangNights > 1 ? "s" : ""}`, rooms * padangNights * COSTS.padangHotel[0], rooms * padangNights * COSTS.padangHotel[1], `${rooms} room${rooms > 1 ? "s" : ""}`);
  if (charter) {
    add(`Charter, ${nights} nights`, people * COSTS.charterPerPerson[0], people * COSTS.charterPerPerson[1], "Meals and boat included");
  } else {
    add("Mentawai Fast, return", toUsd(people * 2 * fare), toUsd(people * 2 * fare), idr(fare) + " each way");
    add("Transfers to your stay, return", people * 2 * COSTS.transferEachWay[0], people * 2 * COSTS.transferEachWay[1], "Speedboat or car");
    const [lo, hi] = COSTS.stayPerNight[stay];
    add(`Stay, ${nights} nights`, people * nights * lo, people * nights * hi, "Per person, meals usually included");
    if (bags) add("Board bags on the ferry", toUsd(bags * 2 * COSTS.boardBagFerry), toUsd(bags * 2 * COSTS.boardBagFerry), idr(COSTS.boardBagFerry) + " each way");
  }
  if (surfers) { const t = Math.ceil(Math.max(nights, 1) / 15); add("Mentawai surf tax", toUsd(surfers * t * COSTS.surfTax), toUsd(surfers * t * COSTS.surfTax), `${idr(COSTS.surfTax)} per surfer per 15 days`); }
  add("Indonesian e-VOA", toUsd(people * COSTS.visa), toUsd(people * COSTS.visa), "Skip if your passport enters visa-free");
  const lo = lines.reduce((s, l) => s + l.lo, 0), hi = lines.reduce((s, l) => s + l.hi, 0);
  return { lines, lo, hi, padangNights };
}
const tripFrom = t => estimate({ nights: t.nights, people: 2, surfers: t.surf ? 2 : 0, stay: t.stay, island: t.island }).lo / 2;
