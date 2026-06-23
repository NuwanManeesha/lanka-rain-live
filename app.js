const popularPlaces = [
  ['කොළඹ','Colombo',6.9271,79.8612],['ගම්පහ','Gampaha',7.0873,79.9990],['කළුතර','Kalutara',6.5854,79.9607],
  ['මහනුවර','Kandy',7.2906,80.6337],['මාතලේ','Matale',7.4675,80.6234],['නුවරඑළිය','Nuwara Eliya',6.9497,80.7891],
  ['ගාල්ල','Galle',6.0535,80.2210],['මාතර','Matara',5.9549,80.5550],['හම්බන්තොට','Hambantota',6.1241,81.1185],
  ['යාපනය','Jaffna',9.6615,80.0255],['ත්‍රිකුණාමලය','Trincomalee',8.5874,81.2152],['මඩකලපුව','Batticaloa',7.7102,81.6924],
  ['කුරුණෑගල','Kurunegala',7.4863,80.3623],['අනුරාධපුර','Anuradhapura',8.3114,80.4037],['බදුල්ල','Badulla',6.9934,81.0550],
  ['රත්නපුර','Ratnapura',6.6828,80.3992],['කෑගල්ල','Kegalle',7.2513,80.3464],['ජා ඇල','Ja-Ela',7.0744,79.8919],
  ['මොරටුව','Moratuwa',6.7730,79.8816],['නෙගොම්බෝ','Negombo',7.2083,79.8358],['බණ්ඩාරවෙල','Bandarawela',6.8289,80.9914],
  ['ඇල්ල','Ella',6.8667,81.0466],['හපුතලේ','Haputale',6.7667,80.9667],['පොළොන්නරුව','Polonnaruwa',7.9403,81.0188]
];

const $ = id => document.getElementById(id);
const datalist = $('cityList');
const optionValues = new Set();
popularPlaces.forEach(p => addOption(`${p[0]} / ${p[1]}`));

let currentPlace = popularPlaces[0];
let searchTimer;
function addOption(value){
  const clean = (value || '').replace(/\s+/g, ' ').trim();
  // Same place can come from Open-Meteo in 2-3 admin formats. Keep only one visible suggestion.
  const mainName = clean.split('/')[0].trim();
  const key = mainName.toLowerCase();
  if(!clean || optionValues.has(key)) return;
  optionValues.add(key);
  const opt = document.createElement('option');
  opt.value = clean;
  datalist.appendChild(opt);
}
function setStatus(msg){ $('status').textContent = msg; $('status').classList.toggle('hidden', !msg); }
function round(n){ return Number.isFinite(n) ? Math.round(n) : 0; }
function placeTitle(place){ return place[0] === place[1] ? place[0] : `${place[0]} (${place[1]})`; }

function findPopularPlace(q){
  q=(q||'').toLowerCase().trim();
  return popularPlaces.find(p => p[0].toLowerCase().includes(q) || p[1].toLowerCase().includes(q));
}

function friendlyWeatherText({prob, mm, temp, hum, cloud, wind}){
  if (mm >= 8 || prob >= 85) return ['අද හොඳටම වහිනවා. එළියට යනවනම් කුඩයක් අනිවාර්යෙන් ගන්න.', 'තද වැසි', 'var(--danger)', '⛈️'];
  if (mm >= 3 || prob >= 65) return ['අද තදින් වහින්න පුළුවන්. ගමන් බිමන් වලදී ටිකක් සැලකිලිමත් වෙන්න.', 'වැසි වැඩියි', 'var(--danger)', '🌧️'];
  if (mm >= 0.8 || prob >= 40) return ['අද වහින්න පුළුවන්. කුඩයක් ළඟ තියාගත්තොත් හොඳයි.', 'වැසි පුළුවන්', 'var(--warn)', '🌦️'];
  if (prob < 25 && mm < 0.3 && temp >= 31 && cloud < 55) return ['අද හොඳටම අව්වයි. වතුර බොන්න, direct sun එකෙන් පරිස්සම් වෙන්න.', 'අව්ව වැඩියි', 'var(--hot)', '☀️'];
  if (temp <= 22 && hum >= 75) return ['අද හොඳටම සීතලයි. උදේ/රෑ වෙලාවට වැඩි සීතලක් දැනෙන්න පුළුවන්.', 'සීතලයි', 'var(--cool)', '🥶'];
  if (prob < 25 && mm < 0.3) return ['අද වහින්නේ නැති වගේ. කාලගුණය සාමාන්‍යයෙන් හොඳයි.', 'වැසි අඩුයි', 'var(--safe)', '🌤️'];
  return ['අද කාලගුණය වෙනස් වෙන්න පුළුවන්. අහස ටිකක් බලලා ගමන් කරන්න.', 'සාමාන්‍යයි', 'var(--safe)', '☁️'];
}


function sinhalaHourPhrase(dateValue, mode='from'){
  const d = dateValue instanceof Date ? dateValue : new Date(dateValue);
  let h = d.getHours();
  const m = d.getMinutes();
  const hour12 = h % 12 || 12;
  const fromNames = {
    1:'එකේ', 2:'දෙකේ', 3:'තුනේ', 4:'හතරේ', 5:'පහේ', 6:'හයේ',
    7:'හතේ', 8:'අටේ', 9:'නවයේ', 10:'දහයේ', 11:'එකොළහේ', 12:'දොළහේ'
  };
  const toNames = {
    1:'එක', 2:'දෙක', 3:'තුන', 4:'හතර', 5:'පහ', 6:'හය',
    7:'හත', 8:'අට', 9:'නවය', 10:'දහය', 11:'එකොළහ', 12:'දොළහ'
  };
  let period = 'උදේ';
  if(h === 0) return `රෑ දොළහ${m === 0 ? '' : ` ${String(m).padStart(2,'0')}`}`;
  else if(h < 12) period = 'උදේ';
  else if(h === 12) period = 'දවල්';
  else if(h < 17) period = 'දවල්';
  else if(h < 19) period = 'හවස';
  else period = 'රෑ';

  const names = mode === 'to' ? toNames : fromNames;
  const min = m === 0 ? '' : ` ${String(m).padStart(2,'0')}`;
  return `${period} ${names[hour12] || hour12}${min}`;
}

function rainTimeText(times, probs, rains, startIndex){
  const today = new Date().toLocaleDateString('en-CA', {timeZone:'Asia/Colombo'});
  const rainy = [];
  for(let idx = startIndex; idx < times.length; idx++){
    const d = new Date(times[idx]);
    const day = d.toLocaleDateString('en-CA', {timeZone:'Asia/Colombo'});
    if(day !== today) break;
    const p = probs[idx] ?? 0;
    const r = rains[idx] ?? 0;
    if(p >= 45 || r >= 0.4) rainy.push(idx);
  }
  if(!rainy.length) return 'අද ඉතිරි වෙලාවේ වහින ලකුණු අඩුයි.';

  let bestStart = rainy[0], bestEnd = rainy[0], curStart = rainy[0], curEnd = rainy[0];
  for(let k=1;k<rainy.length;k++){
    if(rainy[k] === curEnd + 1) curEnd = rainy[k];
    else{
      if((curEnd-curStart) > (bestEnd-bestStart)){ bestStart=curStart; bestEnd=curEnd; }
      curStart = curEnd = rainy[k];
    }
  }
  if((curEnd-curStart) > (bestEnd-bestStart)){ bestStart=curStart; bestEnd=curEnd; }
  const from = sinhalaHourPhrase(times[bestStart]);
  const toDate = new Date(times[bestEnd]);
  toDate.setHours(toDate.getHours()+1);
  const to = sinhalaHourPhrase(toDate, 'to');
  return `${from} ඉඳන් ${to} වෙනකන්ම වහින ලකුණු තියෙනවා.`;
}

function nearestHourIndex(times){
  const now = new Date(); let best = 0, diff = Infinity;
  times.forEach((t,i)=>{ const d = Math.abs(new Date(t)-now); if(d<diff){diff=d; best=i;} });
  return best;
}


function cleanSearchText(query){
  return (query || '')
    .replace(/Sri Lanka/ig, '')
    .replace(/,/g, ' ')
    .split('/')[0]
    .replace(/\s+/g, ' ')
    .trim();
}

function isInsideSriLanka(lat, lon){
  return lat >= 5.7 && lat <= 10.2 && lon >= 79.3 && lon <= 82.2;
}

async function openMeteoSearch(q){
  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(q)}&count=10&language=en&format=json&countryCode=LK`;
  const res = await fetch(url);
  if(!res.ok) return null;
  const data = await res.json();
  const result = (data.results || []).find(r => r.country_code === 'LK') || null;
  if(!result) return null;
  const admin = [result.admin2, result.admin1].filter(Boolean).join(', ');
  return [result.name, admin ? `${result.name}, ${admin}` : result.name, result.latitude, result.longitude];
}

async function nominatimSearch(q){
  // OpenStreetMap/Nominatim fallback: map එකේ තියෙන පොඩි ගම්/නගරත් හොයාගන්න.
  const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=5&addressdetails=1&countrycodes=lk&q=${encodeURIComponent(q + ', Sri Lanka')}`;
  const res = await fetch(url, { headers: { 'Accept': 'application/json' }});
  if(!res.ok) return null;
  const data = await res.json();
  const result = (data || []).find(r => isInsideSriLanka(Number(r.lat), Number(r.lon))) || null;
  if(!result) return null;
  const a = result.address || {};
  const name = a.city || a.town || a.village || a.hamlet || a.suburb || a.county || q;
  const admin = [a.county || a.state_district, a.state].filter(Boolean).join(', ');
  return [name, admin ? `${name}, ${admin}` : (result.display_name || name), Number(result.lat), Number(result.lon)];
}

async function searchSriLankaPlace(query){
  const raw = (query || '').trim();
  const q = cleanSearchText(raw);
  if(q.length < 2) return null;
  const found = findPopularPlace(q) || findPopularPlace(raw);
  if(found) return found;

  setStatus('Map එකෙන් ඔයා දාපු ප්‍රදේශය හොයනවා...');

  // 1) Try full text, 2) try cleaned first place name, 3) OpenStreetMap fallback.
  let place = await openMeteoSearch(raw) || await openMeteoSearch(q) || await nominatimSearch(raw) || await nominatimSearch(q);
  if(!place) return null;

  addOption(`${place[0]} / ${place[1]}`);
  return place;
}

async function loadWeather(place=currentPlace){
  currentPlace = place; setStatus('Weather update එක ගන්නවා...');
  try{
    const [, en, lat, lon] = place;
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,precipitation,cloud_cover,wind_speed_10m&hourly=precipitation_probability,precipitation,temperature_2m,relative_humidity_2m,cloud_cover,wind_speed_10m&timezone=Asia%2FColombo&forecast_days=2`;
    const res = await fetch(url); if(!res.ok) throw new Error('API error');
    const data = await res.json();
    const i = nearestHourIndex(data.hourly.time);
    const prob = data.hourly.precipitation_probability[i] ?? 0;
    const mm = data.hourly.precipitation[i] ?? data.current.precipitation ?? 0;
    const temp = data.current.temperature_2m ?? data.hourly.temperature_2m[i];
    const hum = data.current.relative_humidity_2m ?? data.hourly.relative_humidity_2m[i];
    const cloud = data.current.cloud_cover ?? data.hourly.cloud_cover[i];
    const wind = data.current.wind_speed_10m ?? data.hourly.wind_speed_10m[i];
    const [summary,badge,color,emoji] = friendlyWeatherText({prob, mm, temp, hum, cloud, wind});
    $('placeName').textContent = placeTitle(place);
    $('weatherEmoji').textContent = emoji;
    $('rainBadge').textContent = badge; $('rainBadge').style.background = color;
    $('rainMeterFill').style.width = `${Math.min(100, Math.max(prob, mm * 10))}%`; $('rainSummary').textContent = summary;
    $('rainTime').textContent = rainTimeText(data.hourly.time, data.hourly.precipitation_probability, data.hourly.precipitation, i);
    $('rainProb').textContent = `${round(prob)}%`; $('rainMm').textContent = `${Number(mm).toFixed(1)} mm`; $('temp').textContent = `${round(temp)}°C`;
    $('cloud').textContent = `${round(cloud)}%`; $('humidity').textContent = `${round(hum)}%`; $('wind').textContent = `${round(wind)} km/h`;
    $('lastUpdated').textContent = `අවසන් update: ${new Date().toLocaleString('si-LK', { timeZone:'Asia/Colombo' })}`;
    const list = $('hourlyList'); list.innerHTML='';
    for(let n=0;n<12;n++){
      const idx = i+n; const p = data.hourly.precipitation_probability[idx] ?? 0; const rain = data.hourly.precipitation[idx] ?? 0; const t = data.hourly.temperature_2m[idx] ?? temp;
      const div = document.createElement('div'); div.className='hour';
      const icon = p>=65 || rain>=2 ? '🌧️' : p>=35 ? '🌦️' : t>=31 ? '☀️' : '☁️';
      div.innerHTML = `<b>${new Date(data.hourly.time[idx]).toLocaleTimeString('si-LK',{hour:'2-digit',minute:'2-digit'})}</b><span>${icon}</span><small>${round(p)}%</small><br><small>${Number(rain).toFixed(1)} mm</small>`;
      list.appendChild(div);
    }
    setStatus('');
  }catch(e){ setStatus('දත්ත ගන්න බැරි වුණා. Internet connection එක බලලා නැවත උත්සාහ කරන්න.'); }
}

$('citySearch').addEventListener('input', e => {
  clearTimeout(searchTimer);
  const q = e.target.value.trim();
  searchTimer = setTimeout(async () => {
    if(q.length < 3) return;
    try{
      const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(q)}&count=5&language=en&format=json&countryCode=LK`;
      const res = await fetch(url); if(!res.ok) return;
      const data = await res.json();
      const unique = [];
      const seen = new Set();
      (data.results || []).filter(r => r.country_code === 'LK').forEach(r => {
        const admin = [r.admin2, r.admin1].filter(Boolean).join(', ');
        const key = `${r.name}`.toLowerCase();
        if(!seen.has(key)){ seen.add(key); unique.push(`${r.name} / ${admin}`); }
      });
      unique.forEach(v => addOption(v));
      setStatus('');
    }catch{}
  }, 450);
});

$('searchBtn').onclick = async () => {
  try{
    const p = await searchSriLankaPlace($('citySearch').value);
    if(p) loadWeather(p); else setStatus('මේ නම map එකෙන් හම්බවුණේ නැහැ. ළඟම town එකේ English spelling එක දාලා try කරන්න.');
  }catch{ setStatus('Search කරන්න බැරි වුණා. Internet connection එක පරීක්ෂා කරන්න.'); }
};
$('citySearch').addEventListener('keydown', e => { if(e.key === 'Enter') $('searchBtn').click(); });
$('citySearch').addEventListener('change', async e => { const p = await searchSriLankaPlace(e.target.value); if(p) loadWeather(p); });
$('refreshBtn').onclick = () => loadWeather();
$('colomboBtn').onclick = () => loadWeather(popularPlaces[0]); $('kandyBtn').onclick = () => loadWeather(popularPlaces[3]);
$('useLocationBtn').onclick = () => {
  if(!navigator.geolocation) return setStatus('ඔයාගේ browser එක location support කරන්නේ නැහැ.');
  setStatus('ඔයාගේ location එක ගන්නවා...');
  navigator.geolocation.getCurrentPosition(pos => loadWeather(['මගේ ස්ථානය','My Location',pos.coords.latitude,pos.coords.longitude]), () => setStatus('Location permission allow කරන්න.'));
};
if('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js');
loadWeather(); setInterval(()=>loadWeather(), 10*60*1000);
