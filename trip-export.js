(() => {
  const button = document.querySelector('#export-trip');
  if (!button) return;

  const colors = { transport: '#d5ed86', stay: '#f7dc99', food: '#f7bda8', sight: '#c4e2d8' };
  const ink = '#173c39', muted = '#667a76', paper = '#fcfaf4';
  const clean = value => String(value || '').replace(/^((Arrive|Depart) by (Flight|Train):|Check in:|Check out:|Breakfast:|Lunch:|Dinner:|Afternoon tea:|Must-visit:)\s*/i, '');

  function wrap(ctx, text, maxWidth) {
    const words = String(text || '').split(/\s+/); const lines = []; let line = '';
    words.forEach(word => { const candidate = line ? `${line} ${word}` : word; if (ctx.measureText(candidate).width > maxWidth && line) { lines.push(line); line = word; } else line = candidate; });
    if (line) lines.push(line); return lines.slice(0, 2);
  }

  function rounded(ctx, x, y, width, height, radius, fill, stroke) {
    ctx.beginPath(); ctx.roundRect(x, y, width, height, radius); if (fill) { ctx.fillStyle = fill; ctx.fill(); } if (stroke) { ctx.strokeStyle = stroke; ctx.stroke(); }
  }

  function download(canvas, name) {
    canvas.toBlob(blob => { if (!blob) return; const url = URL.createObjectURL(blob); const link = document.createElement('a'); link.href = url; link.download = `${name.replace(/[^a-z0-9]+/gi, '-').replace(/(^-|-$)/g, '') || 'wayfare-itinerary'}.png`; link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000); }, 'image/png');
  }

  button.addEventListener('click', () => {
    const itinerary = window.wayfareTimeline;
    if (!itinerary?.trips?.length) return;
    button.disabled = true; button.textContent = 'Preparing…';
    requestAnimationFrame(() => {
      const tripName = document.querySelector('#trip-name')?.textContent || 'Wayfare itinerary';
      const subtitle = document.querySelector('.muted')?.textContent || '';
      const width = 1200, padding = 54, cardWidth = width - padding * 2;
      const cards = itinerary.trips.map(day => 104 + Math.max(1, day.items.length) * 70);
      const height = 184 + cards.reduce((sum, value) => sum + value + 22, 0) + 40;
      const scale = height < 5000 ? Math.min(window.devicePixelRatio || 1, 2) : 1;
      const canvas = document.createElement('canvas'); canvas.width = width * scale; canvas.height = height * scale;
      const ctx = canvas.getContext('2d'); ctx.scale(scale, scale); ctx.fillStyle = paper; ctx.fillRect(0, 0, width, height);

      ctx.fillStyle = ink; ctx.font = '700 22px sans-serif'; ctx.fillText('W', padding, 54);
      ctx.font = '600 18px sans-serif'; ctx.fillText('WAYFARE', padding + 32, 53);
      ctx.fillStyle = '#e76f54'; ctx.font = 'italic 600 40px Georgia, serif'; ctx.fillText(tripName, padding, 111);
      ctx.fillStyle = muted; ctx.font = '16px sans-serif'; ctx.fillText(subtitle, padding, 140);
      ctx.strokeStyle = '#dedbd0'; ctx.beginPath(); ctx.moveTo(padding, 164); ctx.lineTo(width - padding, 164); ctx.stroke();

      let y = 190;
      itinerary.trips.forEach((day, index) => {
        const cardHeight = cards[index]; rounded(ctx, padding, y, cardWidth, cardHeight, 14, '#fffefb', '#dedbd0');
        ctx.fillStyle = '#74857d'; ctx.font = '600 12px monospace'; ctx.fillText(day.label || `DAY ${index + 1}`, padding + 22, y + 29);
        ctx.fillStyle = ink; ctx.font = '600 23px Georgia, serif'; ctx.fillText(day.title || 'A day to explore', padding + 22, y + 60);
        let itemY = y + 88;
        day.items.forEach(item => {
          const [time, type, symbol, title, detail, price] = item;
          ctx.fillStyle = muted; ctx.font = '13px monospace'; ctx.fillText(time, padding + 22, itemY + 17);
          ctx.fillStyle = colors[type] || '#dcece7'; ctx.beginPath(); ctx.arc(padding + 108, itemY + 12, 11, 0, Math.PI * 2); ctx.fill();
          ctx.fillStyle = ink; ctx.font = '12px sans-serif'; ctx.textAlign = 'center'; ctx.fillText(symbol || '•', padding + 108, itemY + 16); ctx.textAlign = 'left';
          ctx.fillStyle = ink; ctx.font = '600 15px sans-serif'; wrap(ctx, clean(title), cardWidth - 285).forEach((line, lineIndex) => ctx.fillText(line, padding + 132, itemY + 8 + lineIndex * 18));
          ctx.fillStyle = muted; ctx.font = '12px sans-serif'; const detailLine = wrap(ctx, detail, cardWidth - 285)[0]; if (detailLine) ctx.fillText(detailLine, padding + 132, itemY + 42);
          ctx.fillStyle = '#536963'; ctx.font = '13px monospace'; ctx.textAlign = 'right'; ctx.fillText(price || '', padding + cardWidth - 22, itemY + 17); ctx.textAlign = 'left';
          itemY += 70;
        });
        y += cardHeight + 22;
      });
      ctx.fillStyle = '#74857d'; ctx.font = '12px sans-serif'; ctx.fillText('Made with Wayfare · a more thoughtful way to travel', padding, height - 18);
      download(canvas, tripName); button.disabled = false; button.textContent = '↓ Export itinerary';
    });
  });
})();
