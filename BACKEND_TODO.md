# Backend TODO — Wayfare

This list separates the minimum work for a convincing hackathon demo from the work needed for a real multi-user product.

## Already implemented

- [x] `POST /api/plan` — searches OpenStreetMap data for restaurants, attractions, and accommodation.
- [ ] Replace public Nominatim/Overpass with a managed or self-hosted provider before scaling.
- [x] Preference payload — destination, dates, budget, must-visit place, travel style, travelers, and accommodation type.
- [x] Demo fallback — the UI remains usable without an API key.

## Demo-ready: do these first

- [ ] Deploy the project to Vercel.
- [ ] Test three destinations, including a city with non-Latin place names.
- [ ] Show a clear “live data” versus “demo data” badge in the UI.

## More accurate itinerary data

- [x] Add coordinate-based walking, metro/bus, and taxi suggestions with estimated distance and duration between timeline places.
- [x] Convert the selected destination into a city center / latitude-longitude point before searching places.
- [ ] Use an open routing service or self-hosted routing engine between consecutive places to return real walking, metro, bus, or taxi duration and distance.
- [ ] Use opening hours and travel time to reject impossible timeline placements.
- [x] Make the number of itinerary days match the selected departure and return dates (up to 21 days; includes a client-side demo fallback).
- [ ] Calculate a real estimated total from selected hotel, activity, transit, and flight prices.
- [ ] Add country-specific public holiday and major-event data for a better high-demand warning.

## Flights and stays with real prices

- [x] Add an optional departure-city field to the onboarding flow.
- [x] Add outbound Google Flights and Booking.com searches using the selected route, dates, and group size; payments stay with the booking partner.
- [ ] Add `AMADEUS_CLIENT_ID` and `AMADEUS_CLIENT_SECRET` to Vercel.
- [ ] Exchange the Amadeus credentials for a server-side access token; cache it until expiry.
- [ ] Call Amadeus Flight Offers Search with IATA origin/destination, ISO dates, and traveler count.
- [ ] Resolve the destination to an IATA city code for Amadeus flight and hotel searches.
- [ ] Call Amadeus Hotel List followed by Hotel Search for eligible stay options.
- [ ] Confirm final price and availability before presenting any “book” action.
- [ ] Add outbound booking / affiliate links; do not process bookings until you have the required commercial agreement.

## Reviews and recommendations

- [x] Add a live review-search link to every recommended restaurant, attraction, and stay. The itinerary uses open place data instead of scraping review sites.
- [ ] Use a licensed review/places API if star ratings or review excerpts must appear directly in the timeline.

## Shared trips and persistence

- [ ] Add authentication (Supabase Auth, Clerk, or Firebase Auth).
- [ ] Store trips, timeline items, members, colors, and avatars in a database.
- [ ] Replace browser-only `localStorage` crew data with a `trip_members` table.
- [ ] Give each trip a shareable ID and signed invitation token.
- [ ] Add role checks: owner, editor, viewer.
- [ ] Add real-time synchronization for timeline edits and collaborator presence.
- [ ] Record edit history so collaborators can see who changed an item and undo it.

## Production hardening

- [ ] Validate and rate-limit all `/api/*` inputs.
- [ ] Cache permitted OpenStreetMap results and honor provider usage policies.
- [ ] Add structured error logging and monitoring.
- [ ] Add service-specific credentials only when moving to managed data providers.
- [ ] Add privacy policy, terms, and user data deletion flow before public launch.
