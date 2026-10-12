import {test,beforeEach} from 'node:test';import assert from 'node:assert/strict';import {registerHooks} from 'node:module';import {createHash} from 'node:crypto';import {readFile} from 'node:fs/promises';import vm from 'node:vm';
const mockUrl=new URL('./mock-blobs.mjs',import.meta.url).href;
const webPushUrl=new URL('./mock-web-push.mjs',import.meta.url).href;
registerHooks({resolve(s,c,next){return s==='@netlify/blobs'?{url:mockUrl,shortCircuit:true}:s==='web-push'?{url:webPushUrl,shortCircuit:true}:next(s,c);}});
const {getStore,reset}=await import('./mock-blobs.mjs');
const {sent,clearSent}=await import('./mock-web-push.mjs');
const names=['quiz','feature-gates','field-missions','student-progress','media','album','room-admin','notices','chat','groups','special-mission','push-subscriptions'];const api={};for(const name of names)api[name]=(await import(`../netlify/functions/${name}.mjs`)).default;
process.env.TEACHER_PIN='1234';const pin={teacherPin:'1234'},auth=id=>({studentId:id,token:'token-'+id}),students=Array.from({length:13},(_,i)=>'s'+String(i+1).padStart(2,'0'));
const groups=[{name:'1조',members:['s01','s03','s09','s12']},{name:'2조',members:['s02','s04','s08','s10']},{name:'3조',members:['s05','s06','s07','s11','s13']}];
async function call(name,body,method='POST',query=''){const r=await api[name](new Request('https://example.test/.netlify/functions/'+name+query,{method,...(method==='POST'?{headers:{'content-type':'application/json'},body:JSON.stringify(body)}:{})}));let data;try{data=await r.json()}catch{}return {status:r.status,data};}
const store=n=>getStore({name:'sj-expedition-'+n});
async function publish(){await store('groups').setJSON('current',{groups,version:1});}
async function start(ids){const r=await call('field-missions',{...pin,action:'start',ids});assert.equal(r.status,200,JSON.stringify(r.data));}
async function xp(id){return (await call('student-progress',null,'GET','?'+new URLSearchParams(auth(id)))).data.progress.xp;}
beforeEach(async()=>{reset();clearSent();for(const id of students){await store('auth').setJSON('student/'+id,{credVersion:1});await store('auth').setJSON('session/'+createHash('sha256').update('token-'+id).digest('hex'),{studentId:id,credVersion:1,expiresAt:Date.now()+86400000});}});
const sub=who=>({endpoint:'https://fcm.googleapis.com/fcm/send/'+who,keys:{p256dh:'a'.repeat(87),auth:'b'.repeat(22)}});
test('Student device subscriptions authenticate, mission and notice pushes target registered devices once',async()=>{
 const key=await call('push-subscriptions',null,'GET');assert.equal(key.data.publicKey,'mock-public-key');assert(!JSON.stringify(key.data).includes('private'));
 assert.equal((await call('push-subscriptions',{...auth('s01'),action:'subscribe',subscription:{endpoint:'http://localhost/'}})).status,400);
 assert.equal((await call('push-subscriptions',{studentId:'s01',token:'bad',action:'subscribe',subscription:sub('1')})).status,401);
 await publish();for(const id of ['s01','s09','s10'])assert.equal((await call('push-subscriptions',{...auth(id),action:'subscribe',subscription:sub(id)})).status,200);
 await start(['senior-letter']);assert.equal(sent.length,2);assert(sent.every(x=>['s09','s10'].some(id=>x.subscription.endpoint.endsWith('/'+id))));assert(sent.every(x=>x.payload.url==='missions.html'));
 await start(['senior-letter']);assert.equal(sent.length,2);
 const id='1710000000000-123e4567-e89b-42d3-a456-426614174000';
 await call('notices',{...pin,title:'내일 출발',body:'아침 7시에 만나요',id});assert.equal(sent.length,5);assert.equal(sent[4].payload.url,'notices.html');
 await call('notices',{...pin,title:'내일 출발',body:'아침 7시에 만나요',id});assert.equal(sent.length,5);
 assert.equal((await call('push-subscriptions',{...auth('s01'),action:'unsubscribe',subscription:sub('s09')})).status,200);
 assert.equal((await store('push').list({prefix:'subscription/'})).blobs.length,3);
 await call('push-subscriptions',{...auth('s09'),action:'unsubscribe',subscription:sub('s09')});assert.equal((await store('push').list({prefix:'subscription/'})).blobs.length,2);
});
test('Group, history quiz, and surprise mission releases also reach enrolled devices',async()=>{
 await call('push-subscriptions',{...auth('s01'),action:'subscribe',subscription:sub('s01')});
 await publish();assert.equal(sent.length,0); // publish helper writes its snapshot directly
 await call('groups',{...pin,action:'publish',groups});assert.equal(sent.at(-1).payload.url,'groups.html');
 await call('feature-gates',{...pin,feature:'quiz_dokdo',open:true});assert.equal(sent.at(-1).payload.url,'quiz.html?island=dokdo');
 const previous=sent.length;await call('feature-gates',{...pin,feature:'quiz_dokdo',open:true});assert.equal(sent.length,previous);
 await call('special-mission',{...pin,action:'publish',text:'깜짝 미션!'});assert.equal(sent.at(-1).payload.url,'missions.html');
});
test('Service worker displays a background push and routes a tap to its page',async()=>{
 const listeners={},shown=[],opened=[];
 const self={registration:{scope:'https://example.test/',showNotification:async(...args)=>shown.push(args)},clients:{matchAll:async()=>[],openWindow:async url=>opened.push(url)},skipWaiting(){},addEventListener:(type,handler)=>{listeners[type]=handler}};
 vm.runInNewContext(await readFile(new URL('../sw.js',import.meta.url),'utf8'),{self,URL,Response,fetch:async()=>{},console});
 let waited;listeners.push({data:{json:()=>({title:'미션 공개',body:'확인해요',url:'missions.html',tag:'mission'})},waitUntil:p=>{waited=p}});await waited;
 assert.equal(shown[0][0],'미션 공개');assert.equal(shown[0][1].data.url,'https://example.test/missions.html');
 listeners.notificationclick({notification:{data:shown[0][1].data,close(){}},waitUntil:p=>{waited=p}});await waited;assert.deepEqual(opened,['https://example.test/missions.html']);
});
test('Student tap grants permission, subscribes and registers the device; disabling unregisters it',async()=>{
 const requests=[];let subscription=null,permissionCalls=0;
 const pushManager={getSubscription:async()=>subscription,subscribe:async options=>{assert.equal(options.userVisibleOnly,true);subscription={toJSON:()=>sub('s01'),unsubscribe:async()=>{subscription=null}};return subscription;}};
 const reg={pushManager},Notification={permission:'default',requestPermission:async()=>{permissionCalls++;Notification.permission='granted';return 'granted'}};
 const window={isSecureContext:true,PushManager:function(){},Notification};
 const fetch=async(_url,options)=>{if(!options?.method)return Response.json({publicKey:Buffer.alloc(65,1).toString('base64url')});requests.push(JSON.parse(options.body));return Response.json({ok:true});};
 const ctx={window,navigator:{userAgent:'Android',serviceWorker:{register:async()=>reg,ready:Promise.resolve(reg)}},PushManager:window.PushManager,Notification,SJ:{load:()=>({studentId:'s01',authToken:'token-s01'})},fetch,Response,Uint8Array,atob,matchMedia:()=>({matches:false})};
 vm.runInNewContext(await readFile(new URL('../js/push-client.js',import.meta.url),'utf8'),ctx);
 assert.equal(await window.SJPush.enable(),true);assert.equal(permissionCalls,1);assert.equal(requests[0].action,'subscribe');assert.equal(requests[0].studentId,'s01');
 assert.equal(await window.SJPush.sync(),true);assert.equal(requests.length,2);
 await window.SJPush.disable();assert.equal(requests[2].action,'unsubscribe');assert.equal(subscription,null);
});
test('Waiting missions stay private; only administrator starts; batch preflight prevents partial start',async()=>{
 assert.equal((await call('field-missions',{action:'list'})).data.missions.length,0);
 assert.equal((await call('field-missions',{...auth('s01'),action:'start',ids:['lotte-group']})).status,403);
 assert.equal((await call('field-missions',{...pin,action:'start',ids:['lotte-group']})).status,400);
 await store('groups').setJSON('current',{groups:[{name:'1조',members:['s01','s03']}]});
 assert.equal((await call('field-missions',{...pin,action:'start',ids:['lotte-group','senior-letter']})).status,400);
 assert.equal(await store('field-missions').get('state/lotte-group'),null);
 await publish();await start(['lotte-group']);assert.equal((await call('field-missions',{action:'list'})).data.missions.length,1);
 await call('field-missions',{...pin,action:'close',ids:['lotte-group']});assert.equal((await call('field-missions',{action:'list'})).data.missions.length,0);
});
test('Previously open missions begin closed until teacher checks and starts them again',async()=>{
 await publish();await store('field-missions').setJSON('state/lotte-group',{status:'open',groups,attendees:students,startedAt:Date.now(),letters:{}});
 assert.equal((await call('field-missions',{...auth('s01'),action:'list'})).data.missions.length,0);
 const adminList=await call('field-missions',{...pin,action:'list'});assert.equal(adminList.data.missions.find(m=>m.id==='lotte-group').status,'closed');
 assert.equal((await call('field-missions',{...auth('s01'),action:'submit',id:'lotte-group',image:'data:image/jpeg;base64,/9j/'})).status,403);
 await start(['lotte-group']);assert.equal((await call('field-missions',{...auth('s01'),action:'list'})).data.missions[0].status,'open');
});
test('Concurrent team submissions, retry, and a parallel quiz give each member XP exactly once',async()=>{
 await publish();await start(['lotte-group']);
 await call('feature-gates',{...pin,feature:'quiz_ulleung',open:true});
 const b={...auth('s01'),action:'submit',id:'lotte-group',image:'data:image/jpeg;base64,/9j/'};
 const results=await Promise.all([...Array.from({length:5},()=>call('field-missions',b)),call('quiz',{...auth('s01'),island:'ulleung',id:'quiz_v327_u1',choice:0})]);assert(results.every(r=>r.status===200));
 assert.equal(await xp('s01'),30);for(const id of ['s03','s09','s12'])assert.equal(await xp(id),20);assert.equal(await xp('s02'),0);
 assert.equal((await store('field-missions').list({prefix:'submission/'})).blobs.length,1);
 await call('field-missions',b);assert.equal(await xp('s01'),30);
 await call('student-progress',{...auth('s01'),action:'save',xp:99999,growthLevel:5});assert.equal(await xp('s01'),30);
});
test('Saved submission recovers pending rewards on next sync; legacy rewards do not duplicate',async()=>{
 await store('progress').setJSON('progress/s01',{xp:25,growthLevel:1});await store('progress').setJSON('reward/s01/field_lotte-group',{amount:20});
 await store('field-missions').setJSON('submission/lotte-group/group0',{id:'lotte-group',members:['s01','s03']});
 assert.equal(await xp('s01'),25);assert.equal(await xp('s03'),20);assert.equal(await xp('s03'),20);
});
test('Three-year letters are a derangement and submissions remain private; closed mission cannot accept new work',async()=>{
 await publish();await start(['senior-letter']);const state=await store('field-missions').get('state/senior-letter');assert.equal(new Set(Object.values(state.letters)).size,6);for(const [a,b] of Object.entries(state.letters))assert.notEqual(a,b);
 assert.equal((await call('field-missions',{...auth('s01'),action:'submit',id:'senior-letter',text:'편지'})).status,403);
 assert.equal((await call('field-missions',{...auth('s08'),action:'submit',id:'senior-letter',text:'미래의 친구에게\n함께한 원정을 기억하자.'})).status,200);
 assert.equal((await call('field-missions',{...auth('s09'),action:'submissions'})).data.items.length,0);
 assert.equal((await call('field-missions',{...pin,action:'submissions'})).data.items.length,1);
 await call('field-missions',{...pin,action:'close',ids:['senior-letter']});assert.equal((await call('field-missions',{...auth('s09'),action:'submit',id:'senior-letter',text:'편지'})).status,403);
});
test('Group reset preserves mission participant snapshot and rewards',async()=>{
 await publish();await start(['lotte-group']);await call('groups',{...pin,action:'reset'});assert.equal(await store('groups').get('current'),null);
 await call('field-missions',{...auth('s01'),action:'submit',id:'lotte-group',image:'data:image/jpeg;base64,/9j/'});assert.equal(await xp('s12'),20);
});
test('Teacher can publish a custom three-group assignment and reset the student view',async()=>{
 const custom=[{name:'임의 명칭',members:['s01','s13']},{name:'2조',members:['s02','s03']},{name:'3조',members:['s04','s05','s06']}];
 assert.equal((await call('groups',{...auth('s01'),action:'publish',groups:custom})).status,403);
 assert.equal((await call('groups',{...pin,action:'publish',groups:[custom[0],custom[1],{name:'3조',members:[]}]})).status,400);
 assert.equal((await call('groups',{...pin,action:'publish',groups:[custom[0],custom[1],{name:'3조',members:['s01']}]})).status,400);
 const published=await call('groups',{...pin,action:'publish',groups:custom});assert.equal(published.status,200);
 assert.deepEqual(published.data.current.groups.map(g=>g.name),['1조','2조','3조']);
 assert.deepEqual((await call('groups',null,'GET')).data.current.groups[2].members,['s04','s05','s06']);
 assert.equal((await call('groups',{...pin,action:'reset'})).status,200);
 assert.equal((await call('groups',null,'GET')).data.current,null);
});
async function makeVideo(purpose='album'){
 const size=1024*1024+33;const init=await call('media',{...auth('s01'),action:'init',size,mime:'video/mp4',duration:179,purpose,caption:'원정 영상'});assert.equal(init.status,200);const id=init.data.id;
 assert.equal((await call('media',{...auth('s01'),action:'complete',id})).status,409);
 const bytes=Buffer.alloc(size,7);bytes.write('ftyp',4);for(let index=0;index<2;index++){const r=await api.media(new Request(`https://example.test/.netlify/functions/media?action=chunk&id=${id}&index=${index}`,{method:'PUT',headers:{'x-student-id':'s01','x-student-token':'token-s01'},body:bytes.subarray(index*1024*1024,(index+1)*1024*1024)}));assert.equal(r.status,200);}
 const done=await call('media',{...auth('s01'),action:'complete',id});assert.equal(done.status,200);return {id,media:done.data.media,bytes};
}
test('Chunk upload, immutable retry, byte ranges, file limits, album routing and administrator deletion',async()=>{
 assert.equal((await call('media',{...auth('s01'),action:'init',size:160*1024*1024,mime:'video/mp4',duration:180})).status,400);
 assert.equal((await call('media',{...auth('s01'),action:'init',size:1024,mime:'video/mp4',duration:181})).status,400);
 const {id,media,bytes}=await makeVideo();const range=await api.media(new Request('https://example.test'+media.url,{headers:{range:'bytes=1048560-1048600'}}));assert.equal(range.status,206);assert.equal(range.headers.get('content-range'),'bytes 1048560-1048600/1048609');assert.deepEqual(Buffer.from(await range.arrayBuffer()),bytes.subarray(1048560,1048601));
 const head=await api.media(new Request('https://example.test'+media.url,{method:'HEAD'}));assert.equal(head.headers.get('content-length'),String(bytes.length));
 assert.equal((await api.media(new Request('https://example.test'+media.url,{headers:{range:'bytes=9999999-'}}))).status,416);
 assert.equal((await call('media',{...auth('s02'),action:'complete',id})).status,404);
 await call('media',{...auth('s01'),action:'complete',id});const album=await call('album',null,'GET');assert.equal(album.data.items.length,1);assert.equal(album.data.items[0].kind,'video');assert.equal(album.data.items[0].studentId,'s01');assert.equal(await xp('s01'),0);
 assert.equal((await call('room-admin',{...auth('s01'),area:'album',action:'delete',id})).status,403);
 await call('room-admin',{...pin,area:'album',action:'delete',id});assert.equal((await api.media(new Request('https://example.test'+media.url))).status,404);
});
test('Mission media is separate from album, only its owner can submit it, grade XP reaches the whole grade',async()=>{
 const {id}=await makeVideo('mission');assert.equal((await call('album',null,'GET')).data.items.length,0);await publish();await start(['lotte-grade']);
 assert.equal((await call('field-missions',{...auth('s02'),action:'submit',id:'lotte-grade',mediaId:id})).status,403);
 assert.equal((await call('field-missions',{...auth('s01'),action:'submit',id:'lotte-grade',mediaId:id})).status,200);assert.equal(await xp('s01'),20);assert.equal(await xp('s02'),20);assert.equal(await xp('s03'),0);
});
test('A converted JPEG can be uploaded in chunks and submitted to a photo mission',async()=>{
 await publish();await start(['lotte-group']);const bytes=Buffer.from([255,216,255,217]);
 const init=await call('media',{...auth('s01'),action:'init',size:bytes.length,mime:'image/jpeg',purpose:'mission'});assert.equal(init.status,200);
 const id=init.data.id;
 const chunk=await api.media(new Request(`https://example.test/.netlify/functions/media?action=chunk&id=${id}&index=0`,{method:'PUT',headers:{'x-student-id':'s01','x-student-token':'token-s01'},body:bytes}));assert.equal(chunk.status,200);
 assert.equal((await call('media',{...auth('s01'),action:'complete',id})).status,200);
 assert.equal((await call('field-missions',{...auth('s01'),action:'submit',id:'lotte-group',mediaId:id})).status,200);
 const submissions=(await call('field-missions',{...pin,action:'submissions'})).data.items;assert.equal(submissions.length,1);assert.equal(submissions[0].media.kind,'photo');
 assert.equal((await call('album',null,'GET')).data.items.length,0);assert.equal(await xp('s01'),20);
});
test('Notices seed once, retain posts, allow admin deletion; chat authenticates and cleaning keeps pinned text',async()=>{
 let notices=await call('notices',null,'GET');assert.equal(notices.data.notices.length,1);
 await call('room-admin',{...pin,area:'notices',action:'delete',id:'notice/default'});assert.equal((await call('notices',null,'GET')).data.notices.length,0);
 await call('room-admin',{...pin,area:'notices',action:'reset'});assert.equal((await call('notices',null,'GET')).data.notices.length,1);
 assert.equal((await call('chat',{student:'김서하',text:'spoof'})).status,401);
 const sent=await call('chat',{...auth('s01'),text:'안녕'});assert.equal(sent.status,200);assert.equal(sent.data.message.studentId,'s01');assert.equal((await call('chat',null,'GET')).data.messages[0].student,'김서하');
 await call('room-admin',{...pin,area:'chat',action:'pin',text:'10시 집합'});await call('room-admin',{...pin,area:'chat',action:'reset'});
 const chat=await call('chat',null,'GET');assert.equal(chat.data.messages.length,0);assert.equal(chat.data.pinned,'10시 집합');
});
test('Students share converted photos in chat; ownership and chat reset govern attached media',async()=>{
 const bytes=Buffer.from([255,216,255,217]);
 assert.equal((await call('media',{...auth('s01'),action:'init',size:bytes.length,mime:'video/mp4',duration:2,purpose:'chat'})).status,400);
 const init=await call('media',{...auth('s01'),action:'init',size:bytes.length,mime:'image/jpeg',purpose:'chat'});assert.equal(init.status,200);
 const id=init.data.id;
 const chunk=await api.media(new Request(`https://example.test/.netlify/functions/media?action=chunk&id=${id}&index=0`,{method:'PUT',headers:{'x-student-id':'s01','x-student-token':'token-s01'},body:bytes}));assert.equal(chunk.status,200);
 const completed=await call('media',{...auth('s01'),action:'complete',id});assert.equal(completed.status,200);
 assert.equal((await call('album',null,'GET')).data.items.length,0);
 assert.equal((await call('chat',{...auth('s02'),mediaId:id})).status,403);
 assert.equal((await call('chat',{...auth('s01'),text:'',mediaId:id})).status,200);
 const messages=(await call('chat',null,'GET')).data.messages;assert.equal(messages.length,1);assert.equal(messages[0].mediaId,id);assert.equal(messages[0].media.kind,'photo');
 const image=await api.media(new Request('https://example.test'+messages[0].media.url));assert.deepEqual(Buffer.from(await image.arrayBuffer()),bytes);
 await call('room-admin',{...pin,area:'chat',action:'reset'});
 assert.equal((await call('chat',null,'GET')).data.messages.length,0);
 assert.equal((await api.media(new Request('https://example.test'+completed.data.media.url))).status,404);
});
test('Reflection rewards once daily and growth upgrades cannot overwrite newer XP',async()=>{
 const r=await call('student-progress',{...auth('s01'),action:'journal-save',text:'좋은 하루\n친구와 함께 배웠다'});assert.equal(r.status,200);
 await Promise.all(Array.from({length:4},()=>call('student-progress',{...auth('s01'),action:'claim-reward',rewardId:r.data.rewardId})));assert.equal(await xp('s01'),10);
 await call('student-progress',{...pin,action:'teacher-add-xp',studentId:'s01',amount:100,requestId:'a'});await call('student-progress',{...pin,action:'teacher-add-xp',studentId:'s01',amount:100,requestId:'a'});
 const saved=await call('student-progress',{...auth('s01'),action:'save',xp:10,growthLevel:2});assert.equal(saved.data.progress.xp,110);assert.equal(saved.data.progress.growthLevel,2);
});
test('Guest role persists across page scripts and ignores stale student selection',async()=>{
 const values=new Map([['sj2026_role_v31','guest'],['sj2026_fresh_v1',JSON.stringify({studentId:'s01',authToken:'old',avatar:'s01'})]]),localStorage={getItem:k=>values.get(k)||null,setItem:(k,v)=>values.set(k,v),removeItem:k=>values.delete(k)};
 function page(){const ctx={window:{},localStorage,sessionStorage:{getItem:()=>true},navigator:{}};vm.createContext(ctx);vm.runInContext(awaitSource,ctx);return ctx.window.SJ;}
 const awaitSource=await readFile(new URL('../js/app.js',import.meta.url),'utf8');for(let i=0;i<5;i++){const sj=page();assert.equal(sj.getRole(),'guest');assert.equal(sj.current(),null);assert.equal(sj.entryUrl(),'index.html');}
 const select=await readFile(new URL('../select-student.html',import.meta.url),'utf8');const script=[...select.matchAll(/<script>([\s\S]*?)<\/script>/g)][0][1];const ctx={SJ:page(),URLSearchParams,location:{search:'',replace:path=>ctx.redirect=path}};vm.createContext(ctx);vm.runInContext(script,ctx);assert.equal(ctx.redirect,'index.html');assert.equal(values.get('sj2026_role_v31'),'guest');
});
test('Browser uploader retries from last completed chunk without creating a second upload',async()=>{
 const counts=new Map();let fail=true,inits=0;const fakeFetch=async(url,options)=>{
  if(options.method==='POST'){const b=JSON.parse(options.body);if(b.action==='init'){inits++;return Response.json({id:'upload-test',chunkSize:4,chunks:2});}return Response.json({media:{id:'upload-test',kind:'video'}});}
  const index=new URL(url,'https://example.test').searchParams.get('index');counts.set(index,(counts.get(index)||0)+1);if(index==='1'&&fail)return Response.json({error:'connection lost'},{status:503});return Response.json({ok:true});
 };
 const ctx={window:{},SJ:{load:()=>auth('s01'),getRole:()=> 'student'},fetch:fakeFetch,setTimeout:fn=>{fn();},URL};ctx.SJ.load=()=>({studentId:'s01',authToken:'token-s01'});vm.createContext(ctx);vm.runInContext(await readFile(new URL('../js/media-upload.js',import.meta.url),'utf8'),ctx);
 const job={prepared:{blob:new Blob(['abcdefgh']),mime:'video/mp4',duration:1,kind:'video',name:'test.mp4'},id:null,next:0,ready:null};
 await assert.rejects(()=>ctx.window.SJMedia.upload(job));assert.equal(job.next,1);fail=false;await ctx.window.SJMedia.upload(job);assert.equal(inits,1);assert.equal(counts.get('0'),1);assert.equal(counts.get('1'),4);assert.equal(job.ready.id,'upload-test');
});
test('Oversize videos are prepared before upload, while the three-minute limit remains enforced',async()=>{
 let compressed=0,revoked=0;
 const createVideo=()=>({duration:120,videoWidth:3840,videoHeight:2160,load(){},removeAttribute(){},set src(value){if(value)setTimeout(()=>this.onloadedmetadata?.(),0)}});
 const ctx={window:{SJVideoCompression:{compress:async(file,{duration,onProgress})=>{compressed++;assert.equal(duration,120);onProgress('영상 자동 압축 중');return {blob:new Blob(['compressed'],{type:'video/mp4'}),mime:'video/mp4'};}}},SJ:{},document:{createElement:tag=>{assert.equal(tag,'video');return createVideo();}},URL:{createObjectURL:()=> 'blob:test',revokeObjectURL:()=>revoked++},setTimeout,clearTimeout,Blob};
 vm.createContext(ctx);vm.runInContext(await readFile(new URL('../js/media-upload.js',import.meta.url),'utf8'),ctx);
 const messages=[],file={size:170*1024*1024,type:'video/mp4',name:'phone.mp4'};
 const job=await ctx.window.SJMedia.createJob(file,{onProgress:s=>messages.push(s)});
 assert.equal(compressed,1);assert.equal(job.prepared.mime,'video/mp4');assert.equal(job.prepared.duration,120);assert.equal(job.prepared.blob.size,10);assert(messages.includes('영상 자동 압축 중'));assert.equal(revoked,1);
 ctx.document.createElement=()=>{const v=createVideo();v.duration=181;return v;};
 await assert.rejects(()=>ctx.window.SJMedia.createJob(file),/3분 이내/);assert.equal(compressed,1);
});
test('Every mission-sized video is compressed before upload when the browser can do it',async()=>{
 let calls=0;const order=[];const session={audio:{state:'running',async close(){order.push('close');this.state='closed';}}};
 const video=()=>({duration:18,load(){},removeAttribute(){},set src(value){if(value){order.push('metadata requested');queueMicrotask(()=>this.onloadedmetadata?.());}}});
 const ctx={window:{SJVideoCompression:{prime(){order.push('prime');return session;},compress:async(file,{duration,onProgress,session:used})=>{calls++;assert.equal(used,session);assert.equal(duration,18);onProgress('영상 자동 압축 중');return {blob:new Blob(['smaller'],{type:'video/mp4'}),mime:'video/mp4'};}}},SJ:{},document:{createElement:()=>video()},URL:{createObjectURL:()=> 'blob:clip',revokeObjectURL(){}},setTimeout,clearTimeout,Blob};
 vm.createContext(ctx);vm.runInContext(await readFile(new URL('../js/media-upload.js',import.meta.url),'utf8'),ctx);
 const messages=[],original={size:45*1024*1024,type:'video/mp4',name:'mission.mp4'};
 const job=await ctx.window.SJMedia.createJob(original,{onProgress:s=>messages.push(s)});
 assert.equal(calls,1);assert.equal(job.prepared.blob.size,7);assert.equal(job.prepared.mime,'video/mp4');assert(messages.includes('영상 자동 압축 중'));assert.deepEqual(order,['prime','metadata requested','close']);
});
test('A small uncompressible video still uploads; an oversize one needs real reduction',async()=>{
 let calls=0,chunks=0;
 const video=()=>({duration:70,load(){},removeAttribute(){},set src(value){if(value)queueMicrotask(()=>this.onloadedmetadata?.());}});
 const fetch=async(url,options)=>{if(options.method==='PUT'){chunks++;return Response.json({ok:true});}const body=JSON.parse(options.body);return body.action==='init'?Response.json({id:'fallback',chunks:2,chunkSize:1024*1024}):Response.json({media:{id:'fallback',kind:'video'}});};
 const ctx={window:{SJVideoCompression:{compress:async()=>{calls++;throw Error('지원하지 않는 브라우저');}}},SJ:{load:()=>({studentId:'s01',authToken:'token-s01'}),getRole:()=> 'student'},fetch,document:{createElement:()=>video()},URL:{createObjectURL:()=> 'blob:clip',revokeObjectURL(){}},setTimeout,clearTimeout};
 vm.createContext(ctx);vm.runInContext(await readFile(new URL('../js/media-upload.js',import.meta.url),'utf8'),ctx);
 const updates=[],small=new Blob([Buffer.alloc(2*1024*1024)],{type:'video/mp4'});small.name='a.mp4';
 const job=await ctx.window.SJMedia.createJob(small,{onProgress:s=>updates.push(s)});
 assert.equal(job.prepared.blob,small);assert(updates.some(s=>s.includes('원본으로 제출')));
 assert.equal((await ctx.window.SJMedia.upload(job,{purpose:'mission'})).id,'fallback');assert.equal(chunks,2);
 await assert.rejects(()=>ctx.window.SJMedia.createJob({size:180*1024*1024,type:'video/mp4',name:'oversize.mp4'}),/지원 형식·크기로 줄이지 못했습니다/);
 assert.equal(calls,2);
});
test('Large photos are retried at smaller dimensions and saved as JPEG',async()=>{
 const sizes=[5*1024*1024,1*1024*1024],dimensions=[];
 class Picture{naturalWidth=4000;naturalHeight=3000;async decode(){}}
 const canvas={width:0,height:0,getContext(){return {set fillStyle(v){},fillRect(){},drawImage(){dimensions.push([canvas.width,canvas.height]);}}},toBlob(fn){fn({size:sizes.shift()});}};
 const ctx={window:{},SJ:{},document:{createElement:tag=>{assert.equal(tag,'canvas');return canvas;}},URL:{createObjectURL:()=> 'blob:photo',revokeObjectURL:()=>{}},Image:Picture};
 vm.createContext(ctx);vm.runInContext(await readFile(new URL('../js/media-upload.js',import.meta.url),'utf8'),ctx);
 const job=await ctx.window.SJMedia.createJob({size:12*1024*1024,type:'image/heic',name:'photo.heic'});
 assert.equal(job.prepared.mime,'image/jpeg');assert.equal(job.prepared.blob.size,1024*1024);assert.deepEqual(dimensions,[[1600,1200],[1280,960]]);
});
test('Mission file selection prepares media before submit and reuses the compressed job',async()=>{
 class El{constructor(tag){this.tag=tag;this.children=[];this.files=[];this.classList={add(){},remove(){}};this.value='';}append(...items){this.children.push(...items)}prepend(item){this.children.unshift(item)}replaceChildren(...items){this.children=[...items]}setAttribute(){}querySelectorAll(){return []}get childNodes(){return this.children}}
 const host=new El('main'),made=[];let prepared=0,uploaded=0,finish;
 const document={getElementById:id=>id==='fieldMissions'?host:null,createElement:tag=>{const el=new El(tag);made.push(el);return el},addEventListener(){},hidden:false};
 const mission={id:'test-photo',title:'사진 미션',place:'울릉도',scope:'individual',type:'photo',status:'open',eligible:true,done:false,description:'사진을 올려요',xp:0};
 const fetch=async(_url,options)=>{const body=JSON.parse(options.body);return Response.json(body.action==='list'?{missions:[mission]}:{ok:true})};
 const context={document,window:{addEventListener(){}},fetch,Response,Set,SJ:{students:[],getRole:()=> 'student'},SJMedia:{credentials:()=>({studentId:'s01',token:'token'}),sizeLabel:n=>`${n}B`,createJob:()=>{prepared++;return new Promise(resolve=>finish=resolve)},upload:async()=>{uploaded++;return {id:'media-id'}}},SJGrowth:{pull:async()=>{},checkUpgradePrompt(){}},setInterval(){},setTimeout(){}};
 vm.createContext(context);vm.runInContext(await readFile(new URL('../js/field-missions.js',import.meta.url),'utf8'),context);await new Promise(resolve=>setImmediate(resolve));
 const file=made.find(x=>x.tag==='input'&&x.type==='file'),form=made.find(x=>x.tag==='form'),submit=form.children.find(x=>x.tag==='button');assert(file&&form&&submit);
 file.files=[{size:9000000,name:'photo.jpg',type:'image/jpeg'}];const preparing=file.onchange();assert.equal(submit.disabled,true);assert.equal(prepared,1);
 finish({prepared:{blob:new Blob(['small']),kind:'photo'}});await preparing;assert.equal(submit.disabled,false);assert.match(form.children.at(-1).textContent,/자동 압축 완료/);
 await form.onsubmit({preventDefault(){}});assert.equal(prepared,1);assert.equal(uploaded,1);
});
test('Unsupported browser stops automatic video conversion with a useful fallback',async()=>{
 const ctx={window:{},HTMLCanvasElement:class Canvas{}};vm.createContext(ctx);
 vm.runInContext(await readFile(new URL('../js/media-compression.js',import.meta.url),'utf8'),ctx);
 await assert.rejects(()=>ctx.window.SJVideoCompression.compress({size:160*1024*1024},{duration:120}),/갤러리에서 필요한 부분만 자르거나/);
});
test('Video preparation retains an audio track, checks the output format, and cleans up',async()=>{
 const tracks=[{stop(){this.stopped=true;}},{stop(){this.stopped=true;}}],updates=[];let includedAudio=false,removed=false;
 const video={videoWidth:1920,videoHeight:1080,currentTime:0,readyState:2,ended:false,style:{},listeners:{},set src(value){if(value)queueMicrotask(()=>this.onloadedmetadata?.());},addEventListener(name,fn){this.listeners[name]=fn;},removeEventListener(name){delete this.listeners[name];},async play(){this.currentTime=2;this.ended=true;queueMicrotask(()=>this.listeners.ended?.());},pause(){},removeAttribute(){},load(){},remove(){removed=true;}};
 class Canvas{width=0;height=0;getContext(){return {drawImage(){}};}captureStream(){return {getVideoTracks:()=>[tracks[0]]};}}
 class Stream{constructor(all){this.all=all;}getVideoTracks(){return this.all.filter(x=>x===tracks[0]);}getAudioTracks(){return this.all.filter(x=>x===tracks[1]);}getTracks(){return this.all;}}
 class Audio{state='running';createMediaElementSource(){return {connect(){}};}createMediaStreamDestination(){return {stream:{getAudioTracks:()=>[tracks[1]]}};}async resume(){}async close(){}}
 class Recorder{static isTypeSupported(t){return t.startsWith('video/mp4');}constructor(stream){includedAudio=stream.getAudioTracks().length===1;this.state='inactive';this.mimeType='video/mp4';}start(){this.state='recording';}stop(){this.state='inactive';queueMicrotask(()=>{this.ondataavailable({data:new Blob([Buffer.from([0,0,0,12,102,116,121,112,0,0,0,0])])});this.onstop();});}}
 const ctx={window:{AudioContext:Audio},HTMLCanvasElement:Canvas,MediaStream:Stream,MediaRecorder:Recorder,Blob,Uint8Array,String,URL:{createObjectURL:()=> 'blob:video',revokeObjectURL(){}},document:{body:{append(){}},addEventListener(){},removeEventListener(){},createElement:tag=>tag==='canvas'?new Canvas():video,hidden:false},navigator:{},setTimeout,clearTimeout,setInterval,clearInterval,requestAnimationFrame:()=>1,cancelAnimationFrame(){}};
 vm.createContext(ctx);vm.runInContext(await readFile(new URL('../js/media-compression.js',import.meta.url),'utf8'),ctx);
 const result=await ctx.window.SJVideoCompression.compress({size:170*1024*1024},{duration:2,onProgress:s=>updates.push(s)});
 assert.equal(result.mime,'video/mp4');assert(includedAudio);assert(tracks.every(x=>x.stopped));assert(removed);assert(updates.some(x=>x.includes('압축 완료')));
});
test('Schedule highlights Korean-time active slots including overnight crossings',async()=>{
 const rows=[{raw:'23:00~06:00',classes:new Set(),querySelector(){return {textContent:this.raw}},classList:{toggle(){}},setAttribute(){},removeAttribute(){}},{raw:'12:00~17:00',classes:new Set(),querySelector(){return {textContent:this.raw}},classList:{toggle(){}},setAttribute(){},removeAttribute(){}}];
 for(const r of rows)r.classList={toggle:(key,on)=>on?r.classes.add(key):r.classes.delete(key)};
 const clock={},document={createElement:()=>clock,querySelector:s=>s==='.schedule-head-v35'?{append(){}}:{click(){}},querySelectorAll:()=>[{querySelectorAll:()=>rows}]};
 class FixedDate extends Date{static now(){return Date.parse('2026-10-15T01:00:00+09:00')}}
 const ctx={document,Date:FixedDate,setInterval:()=>{}};vm.createContext(ctx);vm.runInContext(await readFile(new URL('../js/schedule-live.js',import.meta.url),'utf8'),ctx);assert(rows[0].classes.has('schedule-now'));assert(!rows[1].classes.has('schedule-now'));assert(clock.textContent.includes('한국 시간'));
});
test('Island gates are independent; ten questions hide keys and first wrong answer survives retries',async()=>{
 const a=auth('s01');
 assert.equal((await call('quiz',{...a,island:'ulleung',id:'quiz_v327_u1',choice:1})).status,403);
 assert.equal((await call('feature-gates',{feature:'quiz_ulleung',open:true})).status,403);
 await call('feature-gates',{...pin,feature:'quiz_ulleung',open:true});
 assert.equal((await call('quiz',{...a,island:'dokdo',id:'quiz_v327_d1',choice:0})).status,403);
 const get=()=>call('quiz',null,'GET','?'+new URLSearchParams({...a,island:'ulleung'}));
 const first=(await get()).data;assert.equal(first.items.length,10);assert(!('answer' in first.items[0]));assert(!('why' in first.items[0]));
 assert.equal((await call('quiz',{...a,island:'ulleung',id:'quiz_v327_u1',choice:1})).data.attempt.correct,false);
 const retry=await call('quiz',{...a,island:'ulleung',id:'quiz_v327_u1',choice:0});assert.equal(retry.data.attempt.choice,1);assert.equal(retry.data.amount,0);assert.equal(await xp('s01'),0);
 assert.equal((await get()).data.items[0].attempt.correct,false);
 assert.equal((await call('student-progress',{...a,action:'claim-reward',rewardId:'quiz_v327_u1'})).status,400);
 assert.equal((await call('student-progress',{...a,action:'claim-reward',rewardId:'quiz_all_bonus'})).status,400);
 await Promise.all(Array.from({length:6},()=>call('quiz',{...a,island:'ulleung',id:'quiz_v327_u2',choice:2})));assert.equal(await xp('s01'),10);
 await call('feature-gates',{...pin,feature:'quiz_ulleung',open:false});assert.equal((await get()).status,403);
 await call('feature-gates',{...pin,feature:'quiz_ulleung',open:true});assert.equal((await get()).data.items[0].attempt.choice,1);
 await call('feature-gates',{...pin,feature:'quiz_dokdo',open:true});assert.equal((await call('quiz',null,'GET','?'+new URLSearchParams({...a,island:'dokdo'}))).data.items.length,10);
});
test('Story gates, simultaneous teacher changes and prior quiz awards migrate without duplicate XP',async()=>{
 await Promise.all(['history_ulleung','quiz_dokdo'].map(feature=>call('feature-gates',{...pin,feature,open:true})));
 const gates=(await call('feature-gates',null,'GET')).data.state;assert(gates.history_ulleung.open&&gates.quiz_dokdo.open);assert(!gates.quiz_ulleung.open&&!gates.history_dokdo.open);
 assert.equal((await call('student-progress',{...auth('s01'),action:'claim-reward',rewardId:'history_u5'})).data.amount,5);
 assert.equal((await call('student-progress',{...auth('s01'),action:'claim-reward',rewardId:'history_d6'})).status,403);
 await store('progress').setJSON('progress/s02',{xp:10,growthLevel:1});await store('progress').setJSON('reward/s02/quiz_v327_d1',{amount:10});
 const result=await call('quiz',{...auth('s02'),island:'dokdo',id:'quiz_v327_d1',choice:2});assert.equal(result.data.amount,0);assert(result.data.attempt.legacy);assert.equal(await xp('s02'),10);
});
test('Choosing an unlocked appearance preserves earned level and XP and persists through sync',async()=>{
 const a=auth('s01');await call('student-progress',{...pin,studentId:'s01',action:'teacher-add-xp',amount:300});
 await call('student-progress',{...a,action:'save',growthLevel:3});
 const picked=await call('student-progress',{...a,action:'select-avatar',avatarLevel:1});assert.equal(picked.data.progress.avatarLevel,1);assert.equal(picked.data.progress.growthLevel,3);assert.equal(picked.data.progress.xp,300);
 assert.equal((await call('student-progress',{...a,action:'select-avatar',avatarLevel:4})).status,403);
 const fetched=await call('student-progress',null,'GET','?'+new URLSearchParams(a));assert.equal(fetched.data.progress.avatarLevel,1);
});
test('Automatic upgrade prompts cannot appear on quiz, album or character pages',async()=>{
 const source=await readFile(new URL('../js/growth.js',import.meta.url),'utf8');
 for(const pathname of ['/quiz.html','/album.html','/equipment.html','/missions.html']){
  const context={location:{pathname},window:{},SJ:{load(){throw Error('Non-home prompt must stop before state or DOM access');}},document:{}};vm.createContext(context);vm.runInContext(source,context);assert.equal(await context.window.SJGrowth.checkUpgradePrompt(true),false);
 }
});
test('Friends and gull surprise mission gives no XP on submit, retry or progress sync',async()=>{
 await publish();await start(['dokdo-friends-gull']);
 const list=(await call('field-missions',{...auth('s01'),action:'list'})).data.missions;
 const m=list.find(m=>m.id==='dokdo-friends-gull');assert.equal(m.place,'돌발 미션');assert.equal(m.xp,0);
 const b={...auth('s01'),action:'submit',id:m.id,image:'data:image/jpeg;base64,/9j/'};
 assert.equal((await call('field-missions',b)).status,200);
 assert.equal((await call('field-missions',b)).status,200);
 assert.equal(await xp('s01'),0);assert.equal(await xp('s01'),0);
 assert.equal((await call('student-progress',{...auth('s01'),action:'claim-reward',rewardId:'field_'+m.id})).status,400);
});
test('Home card independently follows teacher start and close and shows connection errors',async()=>{
 const text={textContent:''},sub={textContent:''};let tick,fail=false;const events={};
 const context={document:{hidden:false,getElementById:id=>id==='specialMissionCardText'?text:sub,addEventListener:(name,fn)=>events[name]=fn},setInterval:fn=>{tick=fn;},fetch:async()=>{if(fail)return {ok:false};const r=await api['field-missions'](new Request('https://example.test/.netlify/functions/field-missions?action=list'));return r;}};
 vm.createContext(context);vm.runInContext(await readFile(new URL('../js/home-missions.js',import.meta.url),'utf8'),context);await new Promise(r=>setImmediate(r));assert.match(text.textContent,/아직 열린/);
 await publish();await start(['lotte-group']);tick();await new Promise(r=>setImmediate(r));assert.match(text.textContent,/1개/);
 const studentList=await call('field-missions',{...auth('s01'),action:'list'});assert(studentList.data.missions[0].eligible);
 await call('field-missions',{...pin,action:'close',ids:['lotte-group']});events.visibilitychange();await new Promise(r=>setImmediate(r));assert.match(text.textContent,/아직 열린/);
 fail=true;tick();await new Promise(r=>setImmediate(r));assert.match(text.textContent,/확인하지 못/);
});
test('Replacement bank preserves old XP without attaching old answers; all twenty questions reward exactly once',async()=>{
 const {questions}=await import('../netlify/functions/lib/quiz-data.mjs');
 await store('progress').setJSON('progress/s01',{xp:40,growthLevel:1,quizAnswers:{quiz_v326_u1:{choice:1,correct:true}},rewardIds:['quiz_v326_d1']});
 const expected={ulleung:[0,2,1,3,1,2,0,1,3,2],dokdo:[2,0,3,1,0,2,1,3,2,0]};
 for(const island of ['ulleung','dokdo']){
  await call('feature-gates',{...pin,feature:'quiz_'+island,open:true});
  const initial=(await call('quiz',null,'GET','?'+new URLSearchParams({...auth('s01'),island}))).data.items;
  assert.equal(initial.length,10);assert(initial.every(q=>q.attempt===null&&!('answer'in q)&&!('why'in q)));
  assert.deepEqual(questions[island].map(q=>q.answer),expected[island]);
  for(const q of questions[island]){assert.equal(q.choices.length,4);const b={...auth('s01'),island,id:q.id,choice:q.answer};assert.equal((await call('quiz',b)).data.amount,10);assert.equal((await call('quiz',b)).data.amount,0);}
 }
 assert.equal(await xp('s01'),240);
 assert.equal((await call('quiz',{...auth('s01'),island:'ulleung',id:'quiz_v326_u1',choice:1})).status,400);
});
test('Ten-question student navigation reaches final question and wraps with correct totals',async()=>{
 const elements={};const el=id=>elements[id]||(elements[id]={hidden:false,textContent:'',innerHTML:'',querySelectorAll:()=>[],querySelector:()=>el('heading')});
 const tabs=['ulleung','dokdo'].map(tab=>({dataset:{tab},classList:{toggle(){}}}));
 const document={getElementById:el,querySelector:s=>el(s),querySelectorAll:()=>tabs};
 const items=Array.from({length:10},(_,i)=>({id:'q'+i,q:'Question '+(i+1),choices:['A','B','C','D'],attempt:i===0?{correct:true,choice:0,answer:0,why:'explanation'}:null}));
 const ctx={document,location:{search:''},URLSearchParams,SJ:{load:()=>auth('s01')},fetch:async()=>({ok:true,json:async()=>({items})})};vm.createContext(ctx);
 vm.runInContext(await readFile(new URL('../js/quiz-history.js',import.meta.url),'utf8'),ctx);await new Promise(resolve=>setImmediate(resolve));
 assert.equal(el('quizSolved').textContent,'1 / 10 제출');assert.equal(el('quizXp').textContent,'10 / 100 XP');
 for(let n=1;n<10;n++)el('quizNext').onclick();assert(el('quizStage').innerHTML.includes('Question 10'));assert(el('quizStage').innerHTML.includes('처음으로'));
 el('quizNext').onclick();assert(el('quizStage').innerHTML.includes('Question 1</h2>'));
});
test('Expenses use the approved 4,919,000 / 8,000,000 split and persist teacher records',async()=>{
 const handle=(await import('../netlify/functions/expenses.mjs')).default;
 const req=async b=>{const r=await handle(new Request('https://example.test/.netlify/functions/expenses',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(b)}));return {status:r.status,data:await r.json()};};
 assert.equal((await req({action:'list'})).status,403);
 assert.equal((await req({...auth('s01'),action:'update',id:'exp01',done:true,revision:0})).status,403);
 const list=(await req({...pin,action:'list'})).data.items;assert.equal(list.length,22);assert.equal(list.reduce((s,i)=>s+i.amount,0),12919000);assert(list.every(x=>!x.done));
 const school=new Map([['exp03',3196000],['exp05',515000],['exp07',460000],['exp14',500000],['exp15',218000],['exp21',30000]]);
 assert.deepEqual(list.filter(x=>x.fund==='학교자율').map(x=>x.id),[...school.keys()]);
 for(const row of list)assert.equal(row.fund,school.has(row.id)?'학교자율':'수자원',row.id);
 for(const [id,amount] of school)assert.equal(list.find(x=>x.id===id).amount,amount,id);
 assert.equal(list.filter(x=>x.fund==='학교자율').reduce((s,x)=>s+x.amount,0),4919000);
 assert.equal(list.filter(x=>x.fund==='수자원').reduce((s,x)=>s+x.amount,0),8000000);
 assert(list.every(x=>!x.note.includes('수자원:')));
 assert.equal((await req({...pin,action:'update',id:'exp01',revision:0,done:true})).status,200);
 assert.equal((await req({...pin,action:'update',id:'exp01',revision:0,memo:'stale'})).status,409);
 await req({...pin,action:'update',id:'exp01',revision:1,memo:'카드 결제 완료\n영수증 보관'});
 let row=(await req({...pin,action:'list'})).data.items[0];assert(row.done);assert(row.doneAt);assert.equal(row.memo,'카드 결제 완료\n영수증 보관');
 await req({...pin,action:'update',id:'exp01',revision:2,done:false});row=(await req({...pin,action:'list'})).data.items[0];assert(!row.done);assert.equal(row.doneAt,null);assert.equal(row.memo,'카드 결제 완료\n영수증 보관');
 const parallel=await Promise.all([true,false].map(done=>req({...pin,action:'update',id:'exp02',revision:0,done})));assert.equal(parallel.filter(x=>x.status===200).length,1);
 assert.equal((await req({...pin,action:'update',id:'exp01',revision:3,memo:'x'.repeat(2001)})).status,400);
 await store('expenses').setJSON('item/exp03',{done:true,memo:'기존 결제 메모',revision:1});
 const updated=(await req({...pin,action:'list'})).data.items.find(x=>x.id==='exp03');
 assert.equal(updated.fund,'학교자율');assert.equal(updated.amount,3196000);
 assert.equal(updated.done,true);assert.equal(updated.memo,'기존 결제 메모');
});
test('Full reset requires teacher confirmation and clears every expedition store, including student media',async()=>{
 await publish();await start(['senior-letter']);
 await store('progress').setJSON('progress/s01',{xp:120,growthLevel:2,quizAnswers:{quiz_v327_u1:{choice:1,correct:true}}});
 await store('progress').setJSON('journal/s01/2026-10-01',{text:'원정 기록'});
 await store('expenses').setJSON('item/exp01',{done:true,memo:'결제 완료',revision:1});
 await store('chat').setJSON('msg/sample',{text:'안녕'});
 await store('notices').setJSON('notice/sample',{title:'출발'});
 await call('push-subscriptions',{...auth('s01'),action:'subscribe',subscription:sub('s01')});
 await store('album').setJSON('meta/sample',{caption:'사진'});
 await store('special-mission').setJSON('current',{text:'돌발'});
 await store('gates').setJSON('state',{quiz_ulleung:{open:true}});
 const {media}=await makeVideo();
 assert.equal((await call('room-admin',{...auth('s01'),action:'full-reset',confirmation:'전체 초기화'})).status,403);
 assert.equal((await call('room-admin',{...pin,action:'full-reset',confirmation:'잘못 입력'})).status,400);
 assert.equal((await call('room-admin',{...pin,action:'full-reset',confirmation:'전체 초기화'})).status,200);
 for(const name of ['auth','progress','groups','gates','special-mission','field-missions','chat','notices','album','media','expenses','push'])assert.equal((await store(name).list()).blobs.length,0,name);
 assert.equal((await call('student-progress',null,'GET','?'+new URLSearchParams(auth('s01')))).status,401);
 assert.equal((await call('student-progress',{...pin,action:'teacher-roster'})).data.roster.s01,0);
 assert.equal((await api.media(new Request('https://example.test'+media.url))).status,404);
 assert.equal((await call('room-admin',{...pin,action:'full-reset',confirmation:'전체 초기화'})).status,200);
});
test('A revoked student session clears device growth and history marks before returning to login',async()=>{
 let saved={studentId:'s01',authToken:'old',xp:450,growthLevel:3,avatarLevel:3};
 const localStorage={sj2026_history_done_s01_history_u1:'1',sj2026_history_source_s01_history_u1:'1'};
 Object.defineProperties(localStorage,{removeItem:{value:key=>delete localStorage[key]},getItem:{value:key=>localStorage[key]??null}});
 const location={pathname:'/index.html',replace(url){this.next=url}};
 const ctx={window:{},SJ:{load:()=>({...saved}),save:s=>{saved={...s}},students:[{id:'s01',name:'학생'}]},localStorage,location,URLSearchParams,fetch:async()=>new Response('{}',{status:401})};
 vm.createContext(ctx);vm.runInContext(await readFile(new URL('../js/growth.js',import.meta.url),'utf8'),ctx);
 await ctx.window.SJGrowth.pull();
 assert.equal(saved.xp,0);assert.equal(saved.growthLevel,1);assert.equal(saved.avatarLevel,1);assert.equal(saved.authToken,undefined);
 assert.equal(localStorage.sj2026_history_done_s01_history_u1,undefined);
 assert.equal(localStorage.sj2026_history_source_s01_history_u1,undefined);
 assert.equal(location.next,'select-student.html?force=1&student=s01');
});
