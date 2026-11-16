# Satu Mentawai

Sample website and phone app for Satu Mentawai, a one-stop shop for the Mentawai Islands in West Sumatra, Indonesia. A first-time visitor plans the trip and reads what to sort before flying, people on the islands buy and sell in the market, and buyers view land for sale.

The site is plain HTML, CSS and JavaScript with no build step, so it runs from any static host, including GitHub Pages. On a phone it installs as an app and keeps the guide, the saved plan and the packing list offline.

## Pages

| File | Page |
|---|---|
| `index.html` | Home: split-word hero, quick trip planner, search, curated trips, ferry days, six things to sort, island map, market preview, property |
| `explore.html` | Explore, the on-island companion: nearest places from the phone's location or a chosen base, numbered map, directions, a day plan with a Google Maps route, live swell and wind from Open-Meteo, and things to do |
| `plan.html` | Trip planner: dates, group, focus, surf level and stay give a day-by-day plan on the real ferry days with a cost estimate, plus six curated trips |
| `guide.html` | Before you go: visa, surf tax, ferry and flights, money, health, phone, seasons, wave guide, respect, packing checklist |
| `market.html` | Buyer page: categories, island, price and condition filters, saved items, listing detail, WhatsApp message and offer |
| `sell.html` | Seller page: photos resized in the browser, details, handover, contact, live preview, edit, mark sold and delete |
| `property-pantai-bosua.html` | Pantai Bosua listing: 2,843 m² freehold beachfront on Sipora, €299,000 |
| `assets/data.js` | Every price, ferry day, wave, trip, sample listing and Ask Satu answer. Change a figure here and every page updates |
| `assets/places.js` | The 26 places, 8 bases and 8 activities that Explore shows. Positions are approximate and only used for distances and the map; directions search Google Maps by name |
| `assets/explore.js` | Explore page script |
| `assets/site.js` | Header, phone tab bar, Ask Satu, request form, map, market cards and offline setup |
| `assets/site.css` | Colours, type sizes, spacing and every style on the site |
| `manifest.webmanifest`, `sw.js` | Phone app install and offline cache |

## Before launch

1. Put the business WhatsApp number in `CONFIG.whatsapp` at the top of `assets/site.js`, digits only with the country code. Until then requests open WhatsApp without a contact picked.
2. Add the registered company name and address to the footer of each page.
3. Write the privacy policy, terms of service, booking and refund policy and market rules, and have a lawyer sign them off.
4. Confirm who took the drone photos and that the site may use them.
5. The market keeps listings in the seller's own browser. The live market needs a server and a database so every visitor sees every listing, with moderation for the market rules.
6. Remove the 12 sample listings in `LISTINGS` in `assets/data.js` once real sellers post.
7. Walk or ride to each place in `assets/places.js` with a phone and replace the approximate positions with the real ones.
8. Check the ferry days in `FERRY` and the prices in `COSTS` with Mentawai Fast and the stays before launch, and again every season.
9. The Explore map loads street tiles from the OpenStreetMap servers, which are free for light use only. Before launch, sign up with a tile provider such as MapTiler or Stadia Maps and put its tile address and key in the `L.tileLayer` line of `assets/explore.js`.

## Ask Satu

Ask Satu answers from the `KB` list in `assets/data.js`. Each entry has a title, the words people search with, the page it links to and the answer. Anything it can't answer goes to the team on WhatsApp. A live AI agent replaces this list later and keeps the same chat window.

## Sources for the facts on the site

- Pantai Bosua, Rokot Airport and the price comparison: the seller's investment deck (Pantai_Bosua_V4_INVESTMENT.pdf).
- Visa: Directorate General of Immigration figures as reported by Voice of Indonesia (RRI), VisasNews and Issa Compass, 2026.
- Surf tax, hotel tax and village donation: Macaronis Resort and The Jakarta Post.
- Ferry days, fares and board freight: Mentawai Fast schedules as quoted by Kali Villas, Journey Beyond Horizon, Macaronis Resort, Backindo and Bucketlistly, 2024 to 2026.
- Susi Air Padang to Rokot: FlightConnections and Traveloka, 2026.
- ATMs, malaria and signal: Backindo, Macaronis Resort and Mentawai surf camp guides.
- Stay prices: Indonesian Surf Guide. Charter prices: Perfect Wave Travel and Surf Indonesia.
- Waves: Surf Camp Sumatra, Indosurf, Surfertoday, Stoked for Travel and Indonesian Surf Guide.
- Places and activities: Journey Beyond Horizon (Sipora for non-surfers), Antara, Popbela, the Pantai Jati entry in the Indonesian encyclopedia, Direktori Pariwisata (Pajujurung), Authentic Indonesia and RRI (Kulukubuk), Backindo (Muntei), Indonesia Juara (Siberut National Park), Travelingyuk (Singunung) and indonesia.travel (diving prices).
- Swell and wind: Open-Meteo marine and weather forecast APIs, free with no key. The forecast needs internet, and the last one is kept on the phone.
- Island outlines: Natural Earth 1:10m land, public domain, on the home page. The Explore map uses OpenStreetMap tiles and an OpenStreetMap coastline (geo-maps earth-lands-100m), ODbL, through Leaflet 1.9.4 (BSD-2, in `assets/leaflet`).
- Padang hotel and transfer ranges in `COSTS` are planning estimates, not quotes.
