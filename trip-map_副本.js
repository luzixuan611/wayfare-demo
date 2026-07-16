(() => {
  const itinerary = window.wayfareTimeline;
  const panel = document.querySelector('.timeline-panel');
  if (!itinerary || !panel) return;
  const card = document.createElement('section');
  card.className = 'trip-map-card';
  card.innerHTML = '<div class="map-heading"><div><span class="eyebrow">DAY ROUTE</span><b>See your day at a glance</b></div><span class="route-state">Open map</span></div><div id="trip-map"><div class="map-empty">Loading your lightweight map…</div></div>';
  panel.insertBefore(card, panel.querySelector('.timeline-toolbar'));
  const state = card.querySelector('.route-state'); const mapNode = card.querySelector('#trip-map');
  let map; let leafletReady;
  const cityCenters = { tokyo:[35.6762,139.6503], hangzhou:[30.2741,120.1551], shanghai:[31.2304,121.4737], beijing:[39.9042,116.4074], seoul:[37.5665,126.978], paris:[48.8566,2.3522], london:[51.5072,-.1276], 'new york':[40.7128,-74.006] };
  const stops = () => itinerary.trips[itinerary.activeDay].items.map(entry => ({ title:entry[3], point:entry[7] })).filter(stop => stop.point);
  const cityCenter = () => { const city = (document.querySelector('#destination')?.value || 'Tokyo').split(',')[0].trim().toLowerCase(); return cityCenters[city] || cityCenters.tokyo; };
  async function loadLeaflet() {
    if (window.L) return true;
    if (!leafletReady) leafletReady = new Promise((resolve, reject) => { const script = document.createElement('script'); script.src='https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'; script.integrity='sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo='; script.crossOrigin=''; script.onload=resolve; script.onerror=reject; document.head.append(script); });
    await leafletReady; return true;
  }
  async function renderMap() {
    try {
      await loadLeaflet(); const dayStops = stops(); const center = dayStops[0]?.point ? [dayStops[0].point.lat, dayStops[0].point.lng] : cityCenter();
      if (map) map.remove(); mapNode.innerHTML=''; map = L.map(mapNode,{zoomControl:false,attributionControl:true}).setView(center, dayStops.length ? 13 : 11);
      L.control.zoom({position:'bottomright'}).addTo(map);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,attribution:'© OpenStreetMap contributors'}).addTo(map);
      if (!dayStops.length) { L.marker(center).addTo(map).bindPopup('City center preview').openPopup(); state.textContent='City preview'; return; }
      const points = dayStops.map((stop,index) => { const point=[stop.point.lat,stop.point.lng]; L.marker(point,{icon:L.divIcon({className:'route-pin',html:`<span>${index+1}</span>`,iconSize:[25,25],iconAnchor:[12,12]})}).addTo(map).bindPopup(stop.title); return point; });
      if (points.length>1) { L.polyline(points,{color:'#e47657',weight:3,dashArray:'6 7'}).addTo(map); map.fitBounds(L.latLngBounds(points),{padding:[28,28]}); }
      state.textContent=`${points.length} mapped stops`;
    } catch { mapNode.innerHTML='<div class="map-empty">Map could not load. Check your connection and try again.</div>'; state.textContent='Map unavailable'; }
  }
  new MutationObserver(renderMap).observe(document.querySelector('#timeline'),{childList:true,subtree:true});
  renderMap();
})();
