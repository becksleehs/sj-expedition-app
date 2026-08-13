const CACHE='sj-expedition-v2.2.0';
const ASSETS=[
'./','./index.html','./student.html','./equipment.html','./admin-login.html','./admin.html','./quiz.html',
'./css/app.css','./js/data.js','./js/home.js','./js/quiz-data.js','./js/quiz.js','./js/app.js','./js/equipment.js','./js/admin.js',
'./manifest.json','./icons/icon.svg',
'./assets/characters/male-1.svg','./assets/characters/male-2.svg','./assets/characters/male-3.svg','./assets/characters/female-1.svg','./assets/characters/female-2.svg','./assets/characters/female-3.svg',
'./assets/items/outfit.svg','./assets/items/backpack.svg','./assets/items/hat.svg','./assets/items/scarf.svg','./assets/items/camera.svg','./assets/items/compass.svg','./assets/items/badge.svg','./assets/items/telescope.svg'
];
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{if(e.request.method!=='GET')return;e.respondWith(fetch(e.request).then(res=>{const copy=res.clone();caches.open(CACHE).then(c=>c.put(e.request,copy));return res}).catch(()=>caches.match(e.request).then(r=>r||caches.match('./index.html'))))});
