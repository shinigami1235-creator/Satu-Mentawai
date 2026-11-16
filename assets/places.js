// Places and things to do for the Explore companion. Positions are approximate and only used for
// distances and the map. Directions open Google Maps by name, which finds the real spot.
// cat: surf, beach, island, nature, culture, food, essential

const PLACES = [
  // Sipora, north
  { id: "tuapejat-port", name: "Tuapejat port", cat: "essential", island: "Sipora", lat: -2.032, lon: 99.594, q: "Pelabuhan Tuapejat Mentawai",
    access: "In Tuapejat town", desc: "The Mentawai Fast lands here on Wednesday, Friday and Sunday. Ojeks wait at the harbour, and most rooms in town are a 5 to 10 minute walk." },
  { id: "bri-tuapejat", name: "BRI bank and ATM", cat: "essential", island: "Sipora", lat: -2.034, lon: 99.597, q: "Bank BRI Tuapejat Mentawai",
    access: "Tuapejat town centre", desc: "Tuapejat has the only working ATMs on the islands. Take out what you need before heading to the outer islands." },
  { id: "rsud", name: "RSUD Kepulauan Mentawai hospital", cat: "essential", island: "Sipora", lat: -2.058, lon: 99.612, q: "RSUD Kepulauan Mentawai Tuapejat",
    access: "Near Tuapejat by road", desc: "The regency's public hospital. Serious cases are flown or shipped to Padang, so carry insurance with evacuation." },
  { id: "airport", name: "Mentawai Airport (RKI)", cat: "essential", island: "Sipora", lat: -2.1, lon: 99.71, q: "Bandara Mentawai Rokot",
    access: "East Sipora, by road from Tuapejat", desc: "Replaced the old Rokot strip in October 2023 with a 1,500 m runway. Susi Air flies to Padang in 40 minutes a few times a week." },
  { id: "jati", name: "Pantai Jati", cat: "beach", island: "Sipora", lat: -2.037, lon: 99.587, q: "Pantai Jati Tuapejat", forecast: true,
    access: "Walk 700 m along the beach from Tuapejat port", desc: "The town beach, facing Awera, Simakakang and Siburu islands. Snorkel and beginner dive spots sit at 3 to 10 m, and a wave appears at high tide near the full moon. Check currents before swimming." },
  { id: "mapaddegat", name: "Mapaddegat beach", cat: "beach", island: "Sipora", lat: -2.081, lon: 99.6, q: "Pantai Mapaddegat Mentawai",
    access: "6 km from Tuapejat, about 10 minutes by motorbike", desc: "White sand for walking and the best sunset on Sipora. Swimming is poor since muddy rivers run in from the swamp. Homestays and boat taxis sit along the bay." },
  { id: "likat", name: "Likat Mentawai", cat: "food", island: "Sipora", lat: -2.083, lon: 99.598, q: "Likat Mentawai Mapaddegat",
    access: "On the coast at Mapaddegat", desc: "Small café-restaurant by the sea, and the place to book boat taxis, island hopping, coral gardening and waterfall treks." },
  { id: "mapaddegat-village", name: "Mapaddegat tourism village", cat: "culture", island: "Sipora", lat: -2.079, lon: 99.604, q: "Desa Wisata Mapaddegat",
    access: "Mapaddegat Bay, 6 km from Tuapejat", desc: "Cultural centre with occasional Mentawai dances and performances. Ask your stay what is on before going." },
  { id: "sikerei-park", name: "Taman Patung Sikerei", cat: "culture", island: "Sipora", lat: -2.041, lon: 99.601, q: "Taman Patung Sikerei Tuapejat",
    access: "Tuapejat", desc: "Statue park for the sikerei, the healers of Mentawai culture. A short stop when you are in town." },
  { id: "north-islands", name: "Siburu, Silabok and Pototoga", cat: "island", island: "Sipora", lat: -1.975, lon: 99.6, q: null,
    access: "Boat taxi from Tuapejat or Mapaddegat", desc: "Three islands north of Sipora with coconut forest and sandy beaches. Pototoga and Silabok have mangrove lagoons with clear turquoise water." },
  { id: "awera", name: "Awera Island", cat: "island", island: "Sipora", lat: -1.99, lon: 99.562, q: "Pulau Awera Mentawai", forecast: true,
    access: "Boat from Tuapejat", desc: "Calm blue-green water over a lot of coral, the best snorkelling and diving near Tuapejat. Awera resort and small homestays are on the island." },
  { id: "batu-tongga", name: "Batu Tongga islets", cat: "island", island: "Sipora", lat: -1.992, lon: 99.628, q: null,
    access: "Boat taxi, part of most island-hopping trips", desc: "A group of tiny rock islets with good snorkelling. Landing on the rocks is hard, so snorkel from the boat." },
  { id: "pajujurung", name: "Pajujurung waterfall", cat: "nature", island: "Sipora", lat: -2.13, lon: 99.66, q: "Air Terjun Pujujurung Mentawai",
    access: "30 minutes by motorbike south of Tuapejat, 100 m from the Tuapejat to Sioban road", desc: "Waterfall behind big grey clay boulders in Goiso Oinan village. Go with a guide since the trails get muddy." },
  { id: "telescopes", name: "Telescopes", cat: "surf", island: "Sipora", lat: -2.045, lon: 99.49, q: null, forecast: true,
    access: "Boat from the north Sipora camps", desc: "World-class left for advanced surfers. Iceland, Scarecrows and Seven Palms break nearby. Non-surfers can watch from the boat, 1 to 2 km offshore." },
  // Sipora, south
  { id: "lances", name: "Lances Right and Left", cat: "surf", island: "Sipora", lat: -2.385, lon: 99.845, q: null, forecast: true,
    access: "Boat from the Katiet camps in south Sipora", desc: "Lances Right (HTs) is a heavy hollow right for advanced surfers. Lances Left across the bay works when the right is too big." },
  { id: "sioban", name: "Puskesmas Sioban", cat: "essential", island: "Sipora", lat: -2.27, lon: 99.78, q: "Puskesmas Sioban Mentawai",
    access: "Sioban, south Sipora", desc: "Health centre for south Sipora. Go to the Tuapejat hospital or Padang for anything serious." },
  // Siberut
  { id: "maileppet", name: "Maileppet port", cat: "essential", island: "Siberut", lat: -1.574, lon: 99.205, q: "Pelabuhan Maileppet Siberut",
    access: "South Siberut", desc: "Mentawai Fast port for Siberut, Tuesday and Saturday. Treks and the Playgrounds camps start here." },
  { id: "pkm-siberut", name: "Puskesmas Muara Siberut", cat: "essential", island: "Siberut", lat: -1.598, lon: 99.21, q: "Puskesmas Muara Siberut",
    access: "Muara Siberut town", desc: "Health centre for south Siberut, close to the port." },
  { id: "muntei", name: "Muntei village", cat: "culture", island: "Siberut", lat: -1.588, lon: 99.17, q: "Desa Muntei Siberut",
    access: "Short ride from Maileppet port", desc: "Gateway to the Mentawai villages. Many families keep a house here and another deep in the forest at Butui. Canoes up the river leave from here." },
  { id: "kulukubuk", name: "Kulukubuk waterfall", cat: "nature", island: "Siberut", lat: -1.7, lon: 99.08, q: "Air Terjun Kulukubuk Madobag",
    access: "About 3 km into the forest from Madobag village", desc: "Two-tier waterfall about 70 m high with a pool to swim in. Most uma treks stop here on the canoe trip back to Muntei." },
  { id: "national-park", name: "Siberut National Park", cat: "nature", island: "Siberut", lat: -1.35, lon: 98.95, q: "Taman Nasional Siberut",
    access: "Enter with a licensed guide and a park permit", desc: "UNESCO biosphere reserve of about 190,000 hectares and home to four primates found nowhere else: bilou, bokkoi, joja and simakobu." },
  { id: "singunung", name: "Singunung waterfall", cat: "nature", island: "Siberut", lat: -1.12, lon: 98.9, q: "Air Terjun Singunung Malancan",
    access: "Malancan village, North Siberut", desc: "Three-tier waterfall in the north of Siberut. No entrance fee, but the road there is rough." },
  { id: "playgrounds", name: "The Playgrounds", cat: "surf", island: "Siberut", lat: -1.82, lon: 99.31, q: null, forecast: true,
    access: "Boat from the Masokut and Karangmajat camps", desc: "More than 20 waves close together: Rifles and Kandui for experts, Nipussi, Burgerworld and Beng Bengs for intermediates." },
  // Pagai
  { id: "sikakap", name: "Sikakap port", cat: "essential", island: "Pagai", lat: -2.775, lon: 100.22, q: "Pelabuhan Sikakap Mentawai",
    access: "Between North and South Pagai", desc: "Mentawai Fast port for the Pagais, with the Friday sailing. Puskesmas Sikakap is in the village." },
  { id: "macaronis", name: "Macaronis", cat: "surf", island: "Pagai", lat: -2.63, lon: 99.98, q: null, forecast: true,
    access: "Speedboat from Sikakap, about 1 hour", desc: "Long, consistent left and the best first Mentawai wave for intermediates." },
  { id: "silabu", name: "Silabu village", cat: "culture", island: "Pagai", lat: -2.64, lon: 99.995, q: "Silabu Pagai Utara",
    access: "North Pagai, beside Macaronis", desc: "The village whose reef Macaronis breaks on. Resorts collect a daily donation of IDR 30,000 for the village." },
];

const BASES = [
  { id: "tuapejat", name: "Tuapejat, Sipora", lat: -2.034, lon: 99.594 },
  { id: "mapaddegat", name: "Mapaddegat, Sipora", lat: -2.081, lon: 99.6 },
  { id: "katiet", name: "Katiet and Lances, south Sipora", lat: -2.385, lon: 99.84 },
  { id: "airport", name: "Mentawai Airport, Sipora", lat: -2.1, lon: 99.71 },
  { id: "maileppet", name: "Maileppet and Muara Siberut", lat: -1.58, lon: 99.2 },
  { id: "masokut", name: "Playgrounds camps, Siberut", lat: -1.81, lon: 99.29 },
  { id: "sikakap", name: "Sikakap, Pagai", lat: -2.775, lon: 100.22 },
  { id: "silabu", name: "Macaronis, North Pagai", lat: -2.64, lon: 99.99 },
];

const CATS = { all: "All", surf: "Surf", beach: "Beaches", island: "Islands", nature: "Nature", culture: "Culture", food: "Food", essential: "Essentials" };
const CAT_ICONS = { surf: "i-wave", beach: "i-sun", island: "i-island", nature: "i-leaf", culture: "i-house", food: "i-cup", essential: "i-cross", all: "i-pin" };

const ACTIVITIES = [
  { title: "Island hopping and snorkelling", where: "North Sipora islands and Batu Tongga", price: "About IDR 300,000 to 400,000 per person, 4 to 5 hours", how: "Boat taxi through your homestay or Likat Mentawai", req: "Island hopping" },
  { title: "Coral gardening", where: "Mapaddegat, Sipora", price: "Ask Likat Mentawai", how: "Supervised coral restoration run by Likat Mentawai", req: "Coral gardening" },
  { title: "Diving", where: "Awera Island and Pantai Jati", price: "From about IDR 800,000 per person", how: "Only with a qualified operator, since dive facilities are limited", req: "Diving" },
  { title: "Waterfall walk", where: "Pajujurung on Sipora, Kulukubuk on Siberut", price: "Guide fee", how: "Go with a guide since the trails are muddy", req: "Waterfall walk" },
  { title: "Scooter around Sipora", where: "Tuapejat to Mapaddegat, the airport and the south road", price: "About IDR 150,000 per day", how: "Through your homestay or hotel", req: "Scooter rental" },
  { title: "Uma stay and forest trek", where: "Siberut, from Muntei by canoe", price: "3 to 5 day trips with the ferry included", how: "Licensed guide and a Siberut National Park permit", req: "Uma trek" },
  { title: "Watch the surf from the boat", where: "Telescopes, Lances, Macaronis", price: "Boat taxi fare", how: "Ride along with the surf boat from your camp", req: "Boat taxi" },
  { title: "Sunset at Mapaddegat", where: "Mapaddegat beach, Sipora", price: "Free", how: "10 minutes by motorbike from Tuapejat", req: null },
];
