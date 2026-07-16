(() => {
  const step = document.querySelector('.onboarding-step[data-step="1"]');
  const date = document.querySelector('#welcome-dates');
  date.type = 'date';
  date.value = '2026-06-12';
  date.parentElement.childNodes[0].textContent = 'Departure date';
  const extra = document.createElement('div');
  extra.className = 'trip-preferences';
  extra.innerHTML = `<label>Return date<input id="welcome-return-date" type="date" value="2026-06-16" /></label><div class="preference-row"><label>Travelers<input id="welcome-travelers" type="number" min="1" max="12" value="2" /></label><label>Budget per person<input id="welcome-budget" type="number" min="0" value="4000" placeholder="e.g. 4000" /></label></div><label>Where would you like to stay?</label><div class="stay-options"><button type="button" class="stay-option selected" data-stay="hotel"><span>⌂</span><b>Hotel</b></button><button type="button" class="stay-option" data-stay="homestay"><span>⌘</span><b>Homestay</b></button><button type="button" class="stay-option" data-stay="hostel"><span>◌</span><b>Hostel</b></button></div>`;
  step.insertBefore(extra, step.querySelector('.onboarding-next'));
  let accommodation = 'hotel';
  document.querySelectorAll('.stay-option').forEach(button => button.onclick = () => { accommodation = button.dataset.stay; document.querySelectorAll('.stay-option').forEach(item => item.classList.toggle('selected', item === button)); });
  window.wayfarePreferences = () => ({
    travelers: Number(document.querySelector('#welcome-travelers').value || 2),
    budget: Number(document.querySelector('#welcome-budget').value || 0),
    returnDate: document.querySelector('#welcome-return-date').value,
    accommodation
  });
})();
