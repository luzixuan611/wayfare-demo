(() => {
  const button=document.querySelector('#pulse-button'); const header=document.querySelector('.topbar'); const api=window.wayfareTimeline;
  if(!button||!header||!api)return;
  const panel=document.createElement('section'); panel.className='trip-pulse'; panel.hidden=true; header.append(panel);
  const key=type=>`wayfare-${type}-${(document.querySelector('#destination')?.value||'trip').toLowerCase()}`;
  const read=type=>{try{return JSON.parse(localStorage.getItem(key(type))||'{}')}catch{return{}}};
  const stayConfirmed=()=>api.trips[0]?.items.some(item=>item[1]==='stay'&&/^Check in:/.test(item[3]||''));
  function render(){const checked=read('checklist'),done=Object.values(checked).filter(Boolean).length,price=document.querySelector('#price-alert'),priceText=price&&!price.hidden?price.textContent:'Your dates look flexible — keep an eye on prices.';panel.innerHTML=`<div class="pulse-head"><div><span class="eyebrow">TRIP PULSE</span><b>Little things to keep moving</b></div><button type="button" aria-label="Close">×</button></div><div class="pulse-item warm"><span>⚠</span><div><b>Price watch</b><small>${priceText}</small></div></div><div class="pulse-item"><span>♡</span><div><b>Pick a restaurant together</b><small>Open Group picks to let the crew vote on dining choices.</small></div></div><div class="pulse-item"><span>${stayConfirmed()?'✓':'⌂'}</span><div><b>${stayConfirmed()?'Stay confirmed':'Accommodation still open'}</b><small>${stayConfirmed()?'Your check-in and check-out are in the timeline.':'Save the final place under Bookings when you are ready.'}</small></div></div><div class="pulse-item"><span>✓</span><div><b>Travel checklist</b><small>${done}/6 essentials completed</small></div></div>`;panel.querySelector('button').onclick=close}
  function close(){panel.hidden=true;button.classList.remove('pulse-open')}
  button.onclick=event=>{event.stopPropagation();if(panel.hidden){render();panel.hidden=false;button.classList.add('pulse-open')}else close()};
  document.addEventListener('click',event=>{if(!panel.contains(event.target)&&event.target!==button)close()});
  new MutationObserver(()=>{if(!panel.hidden)render()}).observe(document.querySelector('#timeline'),{childList:true,subtree:true});
})();
