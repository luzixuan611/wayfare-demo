(() => {
  const crewKey = 'wayfare-crew';
  const defaults = [
    { name: 'You', color: '#d85d47', avatar: '✦', owner: true },
    { name: 'Maya', color: '#6371bf', avatar: '☼' }
  ];
  let crew = JSON.parse(localStorage.getItem(crewKey) || 'null') || defaults;
  const sidePanel = document.querySelector('.side-panel');
  const card = document.createElement('section');
  card.className = 'crew-card';
  sidePanel.append(card);

  const escapeHtml = value => String(value).replace(/[&<>'"]/g, char => ({ '&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;' }[char]));
  function save() { localStorage.setItem(crewKey, JSON.stringify(crew)); }
  function renderCrew() {
    card.innerHTML = `<div class="card-title"><span>Travel crew</span><span class="live-pill"><i></i> Live</span></div><p class="crew-sub">Everyone here can shape the itinerary.</p><div class="crew-list">${crew.map(person => `<div class="crew-person"><span class="crew-avatar" style="--avatar-color:${person.color}">${person.avatar}</span><div><b style="color:${person.color}">${escapeHtml(person.name)}${person.owner ? ' <small>you</small>' : ''}</b><span>${person.owner ? 'Planning this trip' : 'Can edit itinerary'}</span></div><i class="presence"></i></div>`).join('')}</div><button class="invite-button" id="invite-button">＋ Invite a friend</button><p class="crew-note">Share the invite link so friends can add ideas and edit the timeline.</p>`;
    document.querySelector('#invite-button').onclick = openInvite;
  }
  function openInvite() {
    const modal = document.createElement('div');
    modal.className = 'crew-modal-backdrop';
    modal.innerHTML = `<form class="crew-modal"><button type="button" class="close" aria-label="Close">×</button><p class="eyebrow">ADD A CO-PLANNER</p><h2>Invite a friend</h2><p>Give each traveler their own tiny identity in the shared itinerary.</p><label>Name<input required maxlength="18" placeholder="e.g. Alex" /></label><label>Text color<input class="color-input" type="color" value="#5b71bf" /></label><label>Avatar style<div class="avatar-picker"><button type="button" class="picked">✦</button><button type="button">☼</button><button type="button">◌</button><button type="button">♧</button><button type="button">♥</button></div></label><button class="plan-button" type="submit">Add to travel crew <span>→</span></button><button type="button" class="copy-link" id="copy-invite">↗ Copy invite link instead</button></form>`;
    document.body.append(modal);
    let avatar = '✦';
    modal.querySelector('.close').onclick = () => modal.remove();
    modal.onclick = event => { if (event.target === modal) modal.remove(); };
    modal.querySelectorAll('.avatar-picker button').forEach(button => button.onclick = () => { avatar = button.textContent; modal.querySelectorAll('.avatar-picker button').forEach(item => item.classList.toggle('picked', item === button)); });
    modal.querySelector('#copy-invite').onclick = async () => { try { await navigator.clipboard.writeText(location.href + '?join=wayfare'); } catch { /* clipboard can be unavailable in local preview */ } modal.remove(); showToast('Invite link copied'); };
    modal.querySelector('form').onsubmit = event => { event.preventDefault(); const [name, color] = modal.querySelectorAll('input'); crew.push({ name: name.value.trim(), color: color.value, avatar }); save(); modal.remove(); renderCrew(); showToast(`${name.value.trim()} can now edit this trip`); };
  }
  function showToast(message) { const toast = document.querySelector('#toast'); toast.textContent = message; toast.classList.add('show'); setTimeout(() => toast.classList.remove('show'), 2200); }
  renderCrew();
})();
