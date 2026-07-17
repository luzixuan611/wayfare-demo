(() => {
  const panel = document.querySelector('.side-panel');
  const api = window.wayfareTimeline;
  if (!panel || !api) return;
  const escape = value => String(value).replace(/[&<>"']/g, char => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[char]));
  const people = () => window.wayfareCrew?.members?.() || [{ name:'You', avatar:'✦', color:'#d85d47', owner:true }];
  const key = type => `wayfare-${type}-${(document.querySelector('#destination')?.value || 'trip').toLowerCase()}`;
  const get = type => { try { return JSON.parse(localStorage.getItem(key(type)) || '{}'); } catch { return {}; } };
  const save = (type, value) => localStorage.setItem(key(type), JSON.stringify(value));
  const card = document.createElement('section');
  card.className = 'trip-tools-card';
  card.innerHTML = `<div class="card-title"><span>Trip tools</span><span>✦</span></div><p>Optional helpers for your group.</p><button class="tool-toggle" data-tool="votes"><span>♡</span><b>Group picks</b><small>Vote on today’s stops</small></button><button class="tool-toggle" data-tool="checklist"><span>✓</span><b>Travel checklist</b><small>Keep the essentials together</small></button><div class="tool-drawer" hidden></div>`;
  panel.append(card);
  const drawer = card.querySelector('.tool-drawer');

  const voteId = entry => `${api.activeDay}-${entry[0]}-${entry[3]}`;
  function renderVotes() {
    const votes = get('votes'); const candidates = api.trips[api.activeDay].items.filter(entry => ['food','sight'].includes(entry[1]));
    drawer.innerHTML = `<div class="tool-heading"><button class="tool-back" type="button">←</button><div><b>Group picks</b><small>Vote as a travel crew member</small></div></div><label class="tool-label">Voting as<select id="vote-person">${people().map(person => `<option value="${escape(person.name)}">${escape(person.avatar)} ${escape(person.name)}</option>`).join('')}</select></label><div class="vote-list">${candidates.length ? candidates.map(entry => { const id = voteId(entry), entries = votes[id] || []; const faces = entries.map(name => people().find(person => person.name === name)?.avatar || '✦').join(''); return `<div class="vote-row"><div><b>${escape(entry[3])}</b><small>${entries.length ? `${faces} ${entries.length} vote${entries.length === 1 ? '' : 's'}` : 'No votes yet'}</small></div><button type="button" data-vote="${escape(id)}">♡ Vote</button></div>`; }).join('') : '<p class="tool-empty">Add a food stop or place to explore, then let the group vote.</p>'}</div><small class="tool-note">Demo votes are saved in this browser.</small>`;
    drawer.querySelector('.tool-back').onclick = close;
    drawer.querySelectorAll('[data-vote]').forEach(button => button.onclick = () => { const voter = drawer.querySelector('#vote-person').value; const id = button.dataset.vote; const next = get('votes'); const list = next[id] || []; next[id] = list.includes(voter) ? list.filter(name => name !== voter) : [...list, voter]; save('votes', next); renderVotes(); });
  }
  function checklistItems() {
    const accommodation = window.wayfareTripMeta?.accommodation || 'hotel';
    return [
      `Confirm your ${accommodation} booking`, 'Save flight or train tickets', 'Check passport / visa requirements', 'Pack charger and power bank', 'Check the weather before you leave', 'Share the final timeline with the crew'
    ];
  }
  function renderChecklist() {
    const checked = get('checklist'); const list = checklistItems(); const done = list.filter(item => checked[item]).length;
    drawer.innerHTML = `<div class="tool-heading"><button class="tool-back" type="button">←</button><div><b>Travel checklist</b><small>${done}/${list.length} ready</small></div></div><div class="check-list">${list.map(item => `<label><input type="checkbox" data-check="${escape(item)}" ${checked[item] ? 'checked' : ''}/><span>${escape(item)}</span></label>`).join('')}</div><small class="tool-note">Personal checklist saved in this browser.</small>`;
    drawer.querySelector('.tool-back').onclick = close;
    drawer.querySelectorAll('[data-check]').forEach(input => input.onchange = () => { const next = get('checklist'); next[input.dataset.check] = input.checked; save('checklist', next); renderChecklist(); });
  }
  function close() { drawer.hidden = true; card.querySelectorAll('.tool-toggle').forEach(button => button.classList.remove('active')); }
  card.querySelectorAll('.tool-toggle').forEach(button => button.onclick = () => { drawer.hidden = false; card.querySelectorAll('.tool-toggle').forEach(item => item.classList.toggle('active', item === button)); button.dataset.tool === 'votes' ? renderVotes() : renderChecklist(); });
  new MutationObserver(() => { if (!drawer.hidden && card.querySelector('.tool-toggle.active')?.dataset.tool === 'votes') renderVotes(); }).observe(document.querySelector('#timeline'), { childList:true });
})();
