const CACHE='sj-expedition-v2.3-character-fix';
const ASSETS=['./equipment.html','./assets/characters-v23/m1.svg','./assets/characters-v23/m2.svg','./assets/characters-v23/m3.svg','./assets/characters-v23/f1.svg','./assets/characters-v23/f2.svg','./assets/characters-v23/f3.svg','./assets/equipment-v23/backpack.svg','./assets/equipment-v23/outfit.svg','./assets/equipment-v23/hat.svg','./assets/equipment-v23/scarf.svg','./assets/equipment-v23/camera.svg','./assets/equipment-v23/compass.svg','./assets/equipment-v23/badge.svg','./assets/equipment-v23/telescope.svg',
'./','./index.html','./student.html','./admin-login.html','./admin.html',
'./css/app.css','./js/data.js','./js/home.js','./quiz.html','./js/quiz-data.js','./js/quiz.js','./js/app.js','./js/admin.js',
'./manifest.json','./icons/icon.svg',
'./assets/avatars/m1.png','./assets/avatars/m2.png','./assets/avatars/m3.png',
'./assets/avatars/f1.png','./assets/avatars/f2.png','./assets/avatars/f3.png'
];
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET')return;
  e.respondWith(fetch(e.request).then(res=>{
    const copy=res.clone();caches.open(CACHE).then(c=>c.put(e.request,copy));return res;
  }).catch(()=>caches.match(e.request).then(r=>r||caches.match('./index.html'))));
});