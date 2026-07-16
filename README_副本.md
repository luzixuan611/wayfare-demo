# Wayfare

## Open travel recommendations

Deploy this folder to Vercel. The **Build my trip** button calls `/api/plan`, which uses Nominatim and Overpass/OpenStreetMap to find a city center, restaurants, attractions, parks, and accommodation. It needs no API key or payment method. Use **Must-visit place** to lock a user-supplied location into Day 1 as a priority stop.

This is suitable for a low-volume hackathon demo. Public OpenStreetMap services are shared infrastructure: keep requests small, cache results, and replace them with a managed provider or self-hosted instance before scaling.

## Interactive map

The map uses Leaflet and OpenStreetMap tiles, so it does not need a Google Maps API key or a billing account. It is intentionally a lightweight route preview. Upgrade later if you need live traffic, precise transit directions, and ETA.

## Add flights and live hotel prices

Create an Amadeus for Developers account and add `AMADEUS_CLIENT_ID` and `AMADEUS_CLIENT_SECRET` as Vercel environment variables. Use their Flight Offers Search API for flight options and Hotel List + Hotel Search for pricing. Keep those requests in `api/plan.js`; do not call them from `app.js`.
