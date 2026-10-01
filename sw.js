self.addEventListener('install',()=>self.skipWaiting());
self.addEventListener('activate',e=>e.waitUntil(self.clients.claim()));
self.addEventListener('notificationclick',event=>{
  event.notification.close();
  const url=(event.notification.data&&event.notification.data.url)||'index.html';
  event.waitUntil(self.clients.matchAll({type:'window',includeUncontrolled:true}).then(clients=>{for(const c of clients){if('focus'in c){c.navigate(url);return c.focus();}}return self.clients.openWindow(url);}));
});

self.addEventListener('fetch',event=>{if(event.request.mode!=='navigate')return;event.respondWith(fetch(event.request).catch(()=>new Response('<!doctype html><html lang="ko"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>연결 확인</title><body style="font:18px sans-serif;padding:30px"><h1>인터넷 연결을 확인해주세요</h1><p>승주 원정대는 연결 후 이용할 수 있어요.</p><button onclick="location.reload()">다시 연결</button></body></html>',{headers:{'content-type':'text/html; charset=utf-8'}})));});
