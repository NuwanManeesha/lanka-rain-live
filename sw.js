const CACHE='lanka-rain-live-v1';
const ASSETS=['./','./index.html','./styles.css','./app.js','./manifest.json','./icon.svg'];
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS))));
self.addEventListener('fetch',e=>{ if(e.request.url.includes('api.open-meteo.com')) return; e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request))); });
