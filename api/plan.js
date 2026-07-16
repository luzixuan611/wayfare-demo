const nominatimUrl = 'https://nominatim.openstreetmap.org/search';
const overpassUrl = 'https://overpass-api.de/api/interpreter';
const cache = new Map();

async function geocode(destination) {
  const key = String(destination).trim().toLowerCase();
  const cached = cache.get(key);
  if (cached && Date.now() - cached.created < 300000) return cached.place;
  const url = new URL(nominatimUrl);
  url.searchParams.set('q', destination); url.searchParams.set('format', 'jsonv2'); url.searchParams.set('limit', '1');
  const response = await fetch(url, { headers: { 'User-Agent': 'WayfareHackathon/1.0 (travel-planning-demo)' } });
  if (!response.ok) throw new Error('City lookup failed');
  const [result] = await response.json();
  if (!result) throw new Error('Destination was not found');
  const place = { name: result.display_name.split(',').slice(0, 2).join(','), lat: Number(result.lat), lng: Number(result.lon) };
  cache.set(key, { place, created: Date.now() });
  return place;
}

async function searchOpenPlaces(center) {
  const query = `[out:json][timeout:20];(
    nwr(around:8500,${center.lat},${center.lng})["amenity"="restaurant"]["name"];
    nwr(around:8500,${center.lat},${center.lng})["amenity"="cafe"]["name"];
    nwr(around:8500,${center.lat},${center.lng})["tourism"~"attraction|museum|gallery|zoo|viewpoint|artwork"]["name"];
    nwr(around:8500,${center.lat},${center.lng})["amenity"~"arts_centre|theatre"]["name"];
    nwr(around:8500,${center.lat},${center.lng})["historic"]["name"];
    nwr(around:8500,${center.lat},${center.lng})["leisure"="park"]["name"];
    nwr(around:8500,${center.lat},${center.lng})["tourism"~"hotel|guest_house|hostel"]["name"];
  );out center 120;`;
  const response = await fetch(overpassUrl, { method: 'POST', headers: { 'Content-Type': 'text/plain', 'User-Agent': 'WayfareHackathon/1.0 (travel-planning-demo)' }, body: query });
  if (!response.ok) throw new Error('Open place search failed');
  return (await response.json()).elements.map(element => ({
    id: element.id, osmType: element.type, name: element.tags?.name || 'Local place', tags: element.tags || {},
    point: { lat: element.lat ?? element.center?.lat, lng: element.lon ?? element.center?.lon }
  })).filter(place => Number.isFinite(place.point.lat) && Number.isFinite(place.point.lng));
}

const byTag = (places, predicate) => places.filter(place => predicate(place.tags));
const pick = (places, index = 0, fallback) => places[index] || fallback;
const detail = place => `${place.tags?.['addr:street'] || 'OpenStreetMap listing'} · Open data`;
const item = (time, type, symbol, title, description, price, place) => [time, type, symbol, title, description, price, null, place?.point || null];
const pointPlace = (name, point) => ({ name, tags: {}, point });
const popularCityHighlights = {
  hangzhou: ['West Lake', 'Lingyin Temple', 'Zhejiang Museum', 'China Academy of Art Museum', 'Hefang Street', 'China National Tea Museum', 'Leifeng Pagoda', 'Xixi Wetland Park'],
  tokyo: ['Senso-ji Temple', 'Meiji Jingu', 'Shibuya Crossing', 'Ueno Park'],
  kyoto: ['Fushimi Inari Taisha', 'Kiyomizu-dera', 'Arashiyama Bamboo Grove', 'Nishiki Market'],
  shanghai: ['The Bund', 'Yu Garden', 'Tianzifang', 'Shanghai Museum'],
  beijing: ['Forbidden City', 'Temple of Heaven', 'Summer Palace', '798 Art District'],
  paris: ['Louvre Museum', 'Eiffel Tower', 'Montmartre', 'Musée d’Orsay'],
  london: ['British Museum', 'Tower of London', 'Borough Market', 'Tate Modern'],
  rome: ['Colosseum', 'Trevi Fountain', 'Pantheon', 'Vatican Museums'],
  berlin: ['Museum Island', 'Brandenburg Gate', 'East Side Gallery', 'Pergamon Panorama'],
  newyork: ['Central Park', 'The Metropolitan Museum of Art', 'High Line', 'Brooklyn Bridge'],
  'new york': ['Central Park', 'The Metropolitan Museum of Art', 'High Line', 'Brooklyn Bridge']
};
function fallbackSight(city, center, index) {
  const key = city.toLowerCase().replace(/[^a-z\s]/g, '').trim();
  const names = popularCityHighlights[key] || [`${city} city center`, `${city} old town`, `${city} main museum`, `${city} waterfront`];
  return pointPlace(names[index % names.length], center);
}
function sightScore(place) {
  const tags = place.tags || {};
  return (tags.wikipedia ? 8 : 0) + (tags.wikidata ? 6 : 0) + (tags.website ? 3 : 0) + (tags.tourism === 'attraction' ? 5 : 0) + (tags.tourism === 'museum' ? 5 : 0) + (tags.tourism === 'gallery' ? 5 : 0) + (tags.amenity === 'arts_centre' ? 4 : 0) + (tags.historic ? 3 : 0) + (tags.description ? 1 : 0);
}

function tripDates(range) {
  const values = String(range || '').match(/\d{4}-\d{2}-\d{2}/g) || [];
  if (values.length < 2) return [];
  const start = new Date(`${values[0]}T12:00:00Z`);
  const end = new Date(`${values[1]}T12:00:00Z`);
  const days = Math.floor((end - start) / 86400000) + 1;
  if (!Number.isFinite(days) || days < 1 || days > 21) return [];
  return Array.from({ length: days }, (_, index) => new Date(start.getTime() + index * 86400000));
}

function dayMeta(date, index) {
  const shortDate = new Intl.DateTimeFormat('en-US', { month: 'numeric', day: 'numeric', timeZone: 'UTC' }).format(date);
  const week = new Intl.DateTimeFormat('en-US', { weekday: 'short', timeZone: 'UTC' }).format(date).toUpperCase();
  const longDate = new Intl.DateTimeFormat('en-US', { weekday: 'short', month: 'short', day: 'numeric', timeZone: 'UTC' }).format(date).toUpperCase();
  return { date: shortDate, week, label: `DAY ${String(index + 1).padStart(2, '0')} · ${longDate}` };
}

function distanceKm(from, to) {
  const radians = value => value * Math.PI / 180;
  const dLat = radians(to.lat - from.lat); const dLng = radians(to.lng - from.lng);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(radians(from.lat)) * Math.cos(radians(to.lat)) * Math.sin(dLng / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function travelLeg(from, to) {
  const km = distanceKm(from.point, to.point);
  const distance = km < 1 ? `${Math.round(km * 1000)} m` : `${km.toFixed(1)} km`;
  const [mode, minutes] = km <= 1.2
    ? ['Walk', Math.max(4, Math.round(km * 14))]
    : km <= 6 ? ['Metro or bus + walk', Math.max(12, Math.round(8 + km * 3.5))]
    : ['Taxi', Math.max(12, Math.round(5 + km * 2.2))];
  return item('↳', 'transport', '↔', `${mode} to ${to.name}`, `${distance} from ${from.name} · about ${minutes} min. Time is an open-map estimate; check live transit before leaving.`, `~${minutes} min`, to);
}

function addTravelLegs(items) {
  let previous = null;
  return items.flatMap(event => {
    const place = event[7] ? { name: event[3].replace(/^Check in: |^Must-visit: |^Dinner: |^Lunch: |^Breakfast: /, ''), point: event[7] } : null;
    const leg = previous && place ? [travelLeg(previous, place)] : [];
    if (place) previous = place;
    return [...leg, event];
  });
}

export default async function handler(request, response) {
  if (request.method !== 'POST') return response.status(405).json({ error: 'Use POST.' });
  const { destination, dates, budget, mustVisit, travelStyle = 'sightseeing', travelers = 2, accommodation = 'hotel' } = request.body || {};
  if (!destination) return response.status(400).json({ error: 'Destination is required.' });
  const priceAlert = /\b(jun|jul|aug|dec|jan|feb)\b|-(06|07|08|12|01|02)-/i.test(String(dates)) ? 'Heads up: these dates are in a popular travel period. Flights and hotels may be more expensive, so booking early is a good idea.' : null;
  try {
    const center = await geocode(destination);
    const [places, mustResult] = await Promise.all([searchOpenPlaces(center), mustVisit ? geocode(`${mustVisit}, ${destination}`).catch(() => null) : Promise.resolve(null)]);
    const food = byTag(places, tags => tags.amenity === 'restaurant' || tags.amenity === 'cafe');
    const sights = byTag(places, tags => ['attraction','museum','gallery','zoo','viewpoint','artwork'].includes(tags.tourism) || tags.leisure === 'park' || tags.historic || ['arts_centre','theatre'].includes(tags.amenity)).sort((a, b) => sightScore(b) - sightScore(a));
    const stays = byTag(places, tags => accommodation === 'hostel' ? tags.tourism === 'hostel' : accommodation === 'homestay' ? tags.tourism === 'guest_house' : tags.tourism === 'hotel');
    const hotel = pick(stays, 0, pick(byTag(places, tags => ['hotel','guest_house','hostel'].includes(tags.tourism)), 0, pointPlace('Stay near city center', center)));
    const city = center.name.split(',')[0];
    const lunch = pick(food, 0, pointPlace('Local lunch stop', center)); const dinner = pick(food, 1, lunch);
    const required = mustResult ? pointPlace(mustVisit, mustResult) : null;
    const fallbackSights = Array.from({ length: 8 }, (_, index) => fallbackSight(city, center, index));
    const sightKey = place => String(place.tags?.wikidata || place.tags?.wikipedia || place.name).toLowerCase().replace(/[^a-z0-9\u4e00-\u9fff]/g, '');
    const requiredKey = required ? sightKey(required) : null;
    const sightPool = [...sights, ...fallbackSights].filter((place, index, list) => sightKey(place) !== requiredKey && list.findIndex(other => sightKey(other) === sightKey(place)) === index);
    const selectedDates = tripDates(dates);
    const itineraryDates = selectedDates.length ? selectedDates : [new Date()];
    const trips = itineraryDates.map((date, index) => {
      const meta = dayMeta(date, index);
      const offset = travelStyle === 'recharge' ? 1 : 0;
      const firstDay = index === 0;
      const finalDay = index === itineraryDates.length - 1;
      const slot = firstDay ? 0 : finalDay ? (itineraryDates.length * 2 - 3) : (index * 2 - 1);
      const attraction = sightPool[(slot + offset) % sightPool.length];
      const laterAttraction = sightPool[(slot + offset + 1) % sightPool.length];
      const meal = index % 2 ? lunch : dinner;
      const title = firstDay
        ? (travelStyle === 'food' ? `A first taste of ${city}` : travelStyle === 'recharge' ? `A gentle arrival in ${city}` : `Welcome to ${city}`)
        : finalDay ? `A final easy day in ${city}`
        : (travelStyle === 'food' ? `Eat your way through ${city}` : travelStyle === 'recharge' ? `A slower day in ${city}` : `${city}, at your own pace`);
      const items = firstDay ? [
        item('15:00', 'stay', '⌂', `Check in: ${hotel.name}`, `${detail(hotel)} · ${accommodation}`, 'Set actual cost', hotel),
        ...(required ? [item('17:00', 'sight', '★', `Must-visit: ${required.name}`, 'Priority stop · Open data lookup', 'Priority stop', required)] : []),
        item(required ? '19:00' : '17:30', 'sight', '◉', attraction.name, detail(attraction), 'Open listing', attraction),
        item('20:30', 'food', '♨', `Dinner: ${meal.name}`, detail(meal), 'Set actual cost', meal)
      ] : finalDay ? [
        item('09:30', 'food', '♨', `Breakfast: ${meal.name}`, detail(meal), 'Set actual cost', meal),
        item('11:00', 'sight', '◉', attraction.name, detail(attraction), 'Open listing', attraction),
        item('14:00', 'transport', '↔', 'Leave for your next stop', 'Allow extra time for luggage, traffic, and the airport or station.', '30–60 min')
      ] : [
        item('10:00', 'sight', '◉', attraction.name, detail(attraction), 'Open listing', attraction),
        item('13:00', 'food', '♨', `Lunch: ${meal.name}`, detail(meal), 'Set actual cost', meal),
        item('16:00', 'sight', '◉', laterAttraction.name, `${detail(laterAttraction)} · A popular local highlight to consider.`, 'Open listing', laterAttraction)
      ];
      return { ...meta, title, weather: '✦ Explore', items: addTravelLegs(items) };
    });
    const recommendationPlaces = [...food.slice(0, 2), ...sights.slice(0, 3), ...sightPool].filter((place, index, list) => list.findIndex(other => other.name === place.name) === index).slice(0, 3);
    const recommendations = recommendationPlaces.map((place, index) => [place.tags?.amenity ? '🍜' : '🌿', place.name, place.tags?.['addr:street'] || city, 'OpenStreetMap listing']);
    return response.status(200).json({ city, dates, travelers, accommodation, source: 'open', estimate: budget ? `¥${budget}` : null, trips, recommendations, priceAlert });
  } catch {
    return response.status(502).json({ error: 'Open map data is temporarily unavailable. Please try again.' });
  }
}
