# Satu Mentawai

Sample website for Satu Mentawai, a one-stop shop for the Mentawai Islands in West Sumatra, Indonesia: getting there, stays, surf, property, buying and selling, and setting up a life or a business on the islands.

The site is plain HTML, CSS and JavaScript with no build step, so it runs from any static host, including GitHub Pages.

## Pages

| File | Page |
|---|---|
| `index.html` | Home: split-word hero, search, the trip from Padang, island map, property, Visit and Live here, List with us |
| `property-pantai-bosua.html` | Pantai Bosua listing: 2,843 m² freehold beachfront on Sipora, €299,000 |
| `assets/site.css` | Colours, type sizes, spacing and every style on the site |
| `assets/site.js` | Hero scroll, search, map layers, Ask Satu and the request form |
| `assets/archivo.woff2` | Archivo variable font, served from the site |
| `img/` | Drone photos in two sizes, 1000 px and 2000 px wide |

## Before launch

1. Put the business WhatsApp number in `CONFIG.whatsapp` at the top of `assets/site.js`, digits only with the country code. Until then the request form opens WhatsApp without a contact picked.
2. Add the registered company name and address to the footer in both pages.
3. Write the privacy policy, terms of service and booking and refund policy, and have a lawyer sign them off.
4. Confirm who took the drone photos and that the site may use them.
5. Replace the ferry table with the operator's current days and times.

## Ask Satu

Ask Satu answers from the `KB` list in `assets/site.js`. Each entry has a title, the words people search with, the page it links to and the answer. Anything it can't answer goes to the team on WhatsApp. A live AI agent replaces this list later and keeps the same chat window.

## Sources for the facts on the site

- Pantai Bosua, Rokot Airport and the price comparison: the seller's investment deck (Pantai_Bosua_V4_INVESTMENT.pdf).
- Ferry, flights and surfboards: mentawaifast.com schedules as quoted by Kali Villas, Backindo and Journey Beyond Horizon.
- Surf season, charters and regions: Perfect Wave Travel, Surf Indonesia and Driftwood Mentawai.
- Island outlines: Natural Earth 1:10m land, public domain.
