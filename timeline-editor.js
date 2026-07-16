(() => {
  const api = window.wayfareTimeline;
  const timeline = document.querySelector('#timeline');
  if (!api || !timeline) return;
  const money = value => { const number = Number(String(value || '').replace(/[^0-9.]/g, '')); return Number.isFinite(number) ? number : 0; };
  const activeItems = () => api.trips[api.activeDay].items;

  function renderSummary() {
    document.querySelector('.daily-spend')?.remove();
    const total = activeItems().reduce((sum, entry) => sum + money(entry[5]), 0);
    const summary = document.createElement('div');
    summary.className = 'daily-spend';
    summary.innerHTML = `<span>DAY ${String(api.activeDay + 1).padStart(2, '0')} SPEND</span><b>¥${total.toLocaleString()}</b><small>Based on the costs you entered</small>`;
    timeline.insertAdjacentElement('afterend', summary);
  }
  function enhance() {
    timeline.querySelectorAll('.item').forEach((row, index) => {
      if (row.dataset.enhanced) return;
      row.dataset.enhanced = 'true'; row.dataset.index = index; row.draggable = true;
      const card = row.querySelector('.event-card');
      const button = document.createElement('button');
      button.className = 'edit-timeline-item'; button.type = 'button'; button.title = 'Edit this plan'; button.textContent = '✎';
      button.onclick = event => { event.stopPropagation(); openEdit(index); };
      card.append(button);
      row.addEventListener('dragstart', event => { row.classList.add('dragging'); event.dataTransfer.setData('text/plain', index); });
      row.addEventListener('dragend', () => row.classList.remove('dragging'));
      row.addEventListener('dragover', event => event.preventDefault());
      row.addEventListener('drop', event => { event.preventDefault(); const from = Number(event.dataTransfer.getData('text/plain')); const to = Number(row.dataset.index); if (from === to || !Number.isInteger(from)) return; const items = activeItems(); const [moved] = items.splice(from, 1); items.splice(to, 0, moved); api.render(); api.toast('Timeline order updated'); });
    });
    renderSummary();
  }
  function openEdit(index) {
    const entry = activeItems()[index];
    const safe = value => String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    const modal = document.createElement('div');
    modal.className = 'crew-modal-backdrop';
    modal.innerHTML = `<form class="crew-modal edit-item-modal"><button type="button" class="close" aria-label="Close">×</button><p class="eyebrow">EDIT TIMELINE ITEM</p><h2>Make it yours</h2><label>Time<input name="time" value="${safe(entry[0])}" required /></label><label>Plan name<input name="title" value="${safe(entry[3])}" required /></label><label>Place or note<input name="detail" value="${safe(entry[4])}" /></label><label>Actual cost<input name="price" value="${entry[5] === '—' ? '' : safe(entry[5])}" placeholder="e.g. ¥240" /></label><button class="plan-button" type="submit">Save changes <span>→</span></button><button class="delete-item" type="button">Remove from timeline</button></form>`;
    document.body.append(modal);
    modal.querySelector('.close').onclick = () => modal.remove();
    modal.onclick = event => { if (event.target === modal) modal.remove(); };
    modal.querySelector('.delete-item').onclick = () => { activeItems().splice(index, 1); modal.remove(); api.render(); api.toast('Item removed from timeline'); };
    modal.querySelector('form').onsubmit = event => { event.preventDefault(); const data = new FormData(event.target); entry[0] = data.get('time'); entry[3] = data.get('title'); entry[4] = data.get('detail'); entry[5] = data.get('price') || '—'; modal.remove(); api.render(); api.toast('Timeline item updated'); };
  }
  new MutationObserver(enhance).observe(timeline, { childList: true, subtree: true });
  enhance();
})();
