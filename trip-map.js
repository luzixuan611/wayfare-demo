(() => {
  const itinerary = window.wayfareTimeline;
  const panel = document.querySelector('.timeline-panel');
  if (!itinerary || !panel) return;
  const card = document.createElement('section');
  card.className = 'trip-map-card';
  card.innerHTML = '<div class="map-heading"><div><span class="eyebrow">DAY ROUTE</span><b>See your day at a glance</b></div><span class="route-state">Open map</span></div><div id="trip-map"><div class="map-empty">Loading your lightweight map…</div></div>';
  panel.insertBefore(card, panel.querySelector('.timeline-toolbar'));
  const state = card.querySelector('.route-state'); const mapNode = card.querySelector('#trip-map');
  let map; let leafletReady; let lastSignature = ''; let renderTimer; let rendering = false;
  const cityCenters = { tokyo:[35.6762,139.6503], hangzhou:[30.2741,120.1551], shanghai:[31.2304,121.4737], beijing:[39.9042,116.4074], seoul:[37.5665,126.978], kyoto:[35.0116,135.7681], paris:[48.8566,2.3522], london:[51.5072,-.1276], berlin:[52.52,13.405], rome:[41.9028,12.4964], newyork:[40.7128,-74.006], 'new york':[40.7128,-74.006] };
  const stops = () => (itinerary.trips[itinerary.activeDay]?.items || []).map(entry => ({ title:entry[3], point:entry[7] })).filter(stop => stop.point && Number.isFinite(Number(stop.point.lat)) && Number.isFinite(Number(stop.point.lng)));
  const cityCenter = () => { const city = (document.querySelector('#destination')?.value || 'Tokyo').split(',')[0].trim().toLowerCase(); return cityCenters[city] || cityCenters.tokyo; };
  const signature = dayStops => `${itinerary.activeDay}|${dayStops.map(stop => `${stop.title}:${stop.point.lat},${stop.point.lng}`).join('|')}`;
  async function loadLeaflet() {
    if (window.L) return true;
    if (!leafletReady) leafletReady = new Promise((resolve, reject) => { const script = document.createElement('script'); script.src='https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'; script.integrity='sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo='; script.crossOrigin=''; script.onload=resolve; script.onerror=reject; document.head.append(script); });
    await leafletReady; return true;
  }
  async function renderMap() {
    if (rendering || mapNode.offsetWidth === 0) { if (mapNode.offsetWidth === 0) scheduleRender(250); return; }
    const dayStops = stops(); const nextSignature = signature(dayStops);
    if (map && nextSignature === lastSignature) { requestAnimationFrame(() => map.invalidateSize({ pan:false })); return; }
    rendering = true;
    try {
      await loadLeaflet();
      if (mapNode.offsetWidth === 0) { rendering = false; scheduleRender(250); return; }
      const center = dayStops[0]?.point ? [Number(dayStops[0].point.lat), Number(dayStops[0].point.lng)] : cityCenter();
      if (map) map.remove();
      mapNode.innerHTML='';
      map = L.map(mapNode,{zoomControl:false,attributionControl:true,preferCanvas:true}).setView(center, dayStops.length ? 13 : 11);
      L.control.zoom({position:'bottomright'}).addTo(map);
      // Use a single, consistent light basemap so slow/missing OSM subdomain tiles
      // do not leave large blank columns in the route preview.
      L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',{subdomains:'abcd',maxZoom:18,updateWhenIdle:true,updateWhenZooming:false,keepBuffer:4,attribution:'© OpenStreetMap contributors © CARTO'}).addTo(map);
      if (!dayStops.length) { L.marker(center).addTo(map).bindPopup('City center preview').openPopup(); state.textContent='City preview'; lastSignature=nextSignature; return; }
      const points = dayStops.map((stop,index) => { const point=[Number(stop.point.lat),Number(stop.point.lng)]; L.marker(point,{icon:L.divIcon({className:'route-pin',html:`<span>${index+1}</span>`,iconSize:[25,25],iconAnchor:[12,12]})}).addTo(map).bindPopup(stop.title); return point; });
      if (points.length>1) map.fitBounds(L.latLngBounds(points),{padding:[32,32],maxZoom:14});
      else map.setView(points[0],14);
      state.textContent=`${points.length} mapped stops`; lastSignature=nextSignature;
      requestAnimationFrame(() => map?.invalidateSize({ pan:false }));
    } catch { mapNode.innerHTML='<div class="map-empty">Map could not load. Check your connection and try again.</div>'; state.textContent='Map unavailable'; }
    finally { rendering=false; }
  }
  function scheduleRender(delay=100){clearTimeout(renderTimer);renderTimer=setTimeout(renderMap,delay)}
  new MutationObserver(() => scheduleRender(180)).observe(document.querySelector('#timeline'),{childList:true,subtree:true});
  if (window.ResizeObserver) new ResizeObserver(() => { if (map) map.invalidateSize({pan:false}); else scheduleRender(120); }).observe(mapNode);
  scheduleRender(0);
})();
