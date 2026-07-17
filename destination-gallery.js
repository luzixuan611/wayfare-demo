(() => {
  const chip = document.querySelector('.trip-chip');
  if (!chip) return;
  const escape = value => String(value).replace(/[&<>"']/g, char => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[char]));
  const city = () => (document.querySelector('#destination')?.value || 'Tokyo').split(',')[0].trim() || 'Your destination';
  const photo = (tag, lock) => `https://loremflickr.com/480/320/${encodeURIComponent(city())},${tag}?lock=${lock}`;
  const gallery = document.createElement('section');
  gallery.className = 'destination-gallery'; gallery.hidden = true;
  chip.append(gallery);
  function render() {
    const name = city();
    gallery.innerHTML = `<div class="gallery-head"><div><span class="eyebrow">LOCAL MOODBOARD</span><b>${escape(name)} in little moments</b></div><button type="button" aria-label="Close">×</button></div><div class="gallery-grid">${[['landscape','Landscape'],['architecture','Culture'],['food','Taste']].map(([tag,label],index) => `<figure><img src="${photo(tag,index + 17)}" alt="${escape(name)} ${label}" referrerpolicy="no-referrer"/><figcaption>${label}</figcaption></figure>`).join('')}</div><small>Fresh visual inspiration for your itinerary.</small>`;
    gallery.querySelector('.gallery-head button').onclick = close;
    gallery.querySelectorAll('img').forEach(image => image.onerror = () => { image.closest('figure').classList.add('photo-fallback'); image.remove(); });
  }
  function close() { gallery.hidden = true; chip.classList.remove('gallery-open'); }
  function toggle() { const open = gallery.hidden; if (open) { render(); gallery.hidden = false; chip.classList.add('gallery-open'); } else close(); }
  chip.querySelector('button').onclick = event => { event.preventDefault(); event.stopPropagation(); toggle(); };
  document.addEventListener('click', event => { if (!chip.contains(event.target)) close(); });
  document.addEventListener('click', event => { if (event.target.closest('#plan-button')) setTimeout(() => { if (!gallery.hidden) render(); }, 0); });
})();
