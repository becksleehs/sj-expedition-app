import {test,beforeEach} from 'node:test';import assert from 'node:assert/strict';import {registerHooks} from 'node:module';import {createHash} from 'node:crypto';import {readFile} from 'node:fs/promises';import vm from 'node:vm';
const mockUrl=new URL('./mock-blobs.mjs',import.meta.url).href;
registerHooks({resolve(s,c,next){return s==='@netlify/blobs'?{url:mockUrl,shortCircuit:true}:next(s,c);}});
const {getStore,reset}=await import('./mock-blobs.mjs');
const names=['quiz','feature-gates','field-missions','student-progress','media','album','room-admin','notices','chat','groups'];const api={};for(const name of names)api[name]=(await import(`../netlify/functions/${name}.mjs`)).default;
process.env.TEACHER_PIN='1234';const pin={teacherPin:'1234'},auth=id=>({studentId:id,token:'token-'+id}),students=Array.from({length:13},(_,i)=>'s'+String(i+1).padStart(2,'0'));
const groups=[{name:'1조',members:['s01','s03','s09','s12']},{name:'2조',members:['s02','s04','s08','s10']},{name:'3조',members:['s05','s06','s07','s11','s13']}];
async function call(name,body,method='POST',query=''){const r=await api[name](new Request('https://example.test/.netlify/functions/'+name+query,{method,...(method==='POST'?{headers:{'content-type':'application/json'},body:JSON.stringify(body)}:{})}));let data;try{data=await r.json()}catch{}return {status:r.status,data};}
const store=n=>getStore({name:'sj-expedition-'+n});
async function publish(){await store('groups').setJSON('current',{groups,version:1});}
async function start(ids){const r=await call('field-missions',{...pin,action:'start',ids});assert.equal(r.status,200,JSON.stringify(r.data));}
async function xp(id){return (await call('student-progress',null,'GET','?'+new URLSearchParams(auth(id)))).data.progress.xp;}
beforeEach(async()=>{reset();for(const id of students){await store('auth').setJSON('student/'+id,{credVersion:1});await store('auth').setJSON('session/'+createHash('sha256').update('token-'+id).digest('hex'),{studentId:id,credVersion:1,expiresAt:Date.now()+86400000});}});
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
test('Concurrent team submissions, retry, and a parallel quiz give each member XP exactly once',async()=>{
 await publish();await start(['lotte-group']);
 await call('feature-gates',{...pin,feature:'quiz_ulleung',open:true});
 const b={...auth('s01'),action:'submit',id:'lotte-group',image:'data:image/jpeg;base64,/9j/'};
 const results=await Promise.all([...Array.from({length:5},()=>call('field-missions',b)),call('quiz',{...auth('s01'),island:'ulleung',id:'quiz_u1',choice:1})]);assert(results.every(r=>r.status===200));
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
 await call('media',{...auth('s01'),action:'complete',id});const album=await call('album',null,'GET');assert.equal(album.data.items.length,1);assert.equal(album.data.items[0].kind,'video');assert.equal(await xp('s01'),0);
 assert.equal((await call('room-admin',{...auth('s01'),area:'album',action:'delete',id})).status,403);
 await call('room-admin',{...pin,area:'album',action:'delete',id});assert.equal((await api.media(new Request('https://example.test'+media.url))).status,404);
});
test('Mission media is separate from album, only its owner can submit it, grade XP reaches the whole grade',async()=>{
 const {id}=await makeVideo('mission');assert.equal((await call('album',null,'GET')).data.items.length,0);await publish();await start(['lotte-grade']);
 assert.equal((await call('field-missions',{...auth('s02'),action:'submit',id:'lotte-grade',mediaId:id})).status,403);
 assert.equal((await call('field-missions',{...auth('s01'),action:'submit',id:'lotte-grade',mediaId:id})).status,200);assert.equal(await xp('s01'),20);assert.equal(await xp('s02'),20);assert.equal(await xp('s03'),0);
});
test('Notices seed once, retain posts, allow admin deletion; chat authenticates and cleaning keeps pinned text',async()=>{
 let notices=await call('notices',null,'GET');assert.equal(notices.data.notices.length,1);
 await call('room-admin',{...pin,area:'notices',action:'delete',id:'notice/default'});assert.equal((await call('notices',null,'GET')).data.notices.length,0);
 await call('room-admin',{...pin,area:'notices',action:'reset'});assert.equal((await call('notices',null,'GET')).data.notices.length,1);
 assert.equal((await call('chat',{student:'김서하',text:'spoof'})).status,401);
 assert.equal((await call('chat',{...auth('s01'),text:'안녕'})).status,200);
 await call('room-admin',{...pin,area:'chat',action:'pin',text:'10시 집합'});await call('room-admin',{...pin,area:'chat',action:'reset'});
 const chat=await call('chat',null,'GET');assert.equal(chat.data.messages.length,0);assert.equal(chat.data.pinned,'10시 집합');
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
test('Schedule highlights Korean-time active slots including overnight crossings',async()=>{
 const rows=[{raw:'23:00~06:00',classes:new Set(),querySelector(){return {textContent:this.raw}},classList:{toggle(){}},setAttribute(){},removeAttribute(){}},{raw:'12:00~17:00',classes:new Set(),querySelector(){return {textContent:this.raw}},classList:{toggle(){}},setAttribute(){},removeAttribute(){}}];
 for(const r of rows)r.classList={toggle:(key,on)=>on?r.classes.add(key):r.classes.delete(key)};
 const clock={},document={createElement:()=>clock,querySelector:s=>s==='.schedule-head-v35'?{append(){}}:{click(){}},querySelectorAll:()=>[{querySelectorAll:()=>rows}]};
 class FixedDate extends Date{static now(){return Date.parse('2026-10-15T01:00:00+09:00')}}
 const ctx={document,Date:FixedDate,setInterval:()=>{}};vm.createContext(ctx);vm.runInContext(await readFile(new URL('../js/schedule-live.js',import.meta.url),'utf8'),ctx);assert(rows[0].classes.has('schedule-now'));assert(!rows[1].classes.has('schedule-now'));assert(clock.textContent.includes('한국 시간'));
});
test('Island gates are independent; five questions hide keys and first wrong answer survives retries',async()=>{
 const a=auth('s01');
 assert.equal((await call('quiz',{...a,island:'ulleung',id:'quiz_u1',choice:1})).status,403);
 assert.equal((await call('feature-gates',{feature:'quiz_ulleung',open:true})).status,403);
 await call('feature-gates',{...pin,feature:'quiz_ulleung',open:true});
 assert.equal((await call('quiz',{...a,island:'dokdo',id:'quiz_d1',choice:0})).status,403);
 const get=()=>call('quiz',null,'GET','?'+new URLSearchParams({...a,island:'ulleung'}));
 const first=(await get()).data;assert.equal(first.items.length,5);assert(!('answer' in first.items[0]));assert(!('why' in first.items[0]));
 assert.equal((await call('quiz',{...a,island:'ulleung',id:'quiz_u1',choice:0})).data.attempt.correct,false);
 const retry=await call('quiz',{...a,island:'ulleung',id:'quiz_u1',choice:1});assert.equal(retry.data.attempt.choice,0);assert.equal(retry.data.amount,0);assert.equal(await xp('s01'),0);
 assert.equal((await get()).data.items[0].attempt.correct,false);
 assert.equal((await call('student-progress',{...a,action:'claim-reward',rewardId:'quiz_u1'})).status,400);
 assert.equal((await call('student-progress',{...a,action:'claim-reward',rewardId:'quiz_all_bonus'})).status,400);
 await Promise.all(Array.from({length:6},()=>call('quiz',{...a,island:'ulleung',id:'quiz_u2',choice:0})));assert.equal(await xp('s01'),10);
 await call('feature-gates',{...pin,feature:'quiz_ulleung',open:false});assert.equal((await get()).status,403);
 await call('feature-gates',{...pin,feature:'quiz_ulleung',open:true});assert.equal((await get()).data.items[0].attempt.choice,0);
 await call('feature-gates',{...pin,feature:'quiz_dokdo',open:true});assert.equal((await call('quiz',null,'GET','?'+new URLSearchParams({...a,island:'dokdo'}))).data.items.length,5);
});
test('Story gates, simultaneous teacher changes and prior quiz awards migrate without duplicate XP',async()=>{
 await Promise.all(['history_ulleung','quiz_dokdo'].map(feature=>call('feature-gates',{...pin,feature,open:true})));
 const gates=(await call('feature-gates',null,'GET')).data.state;assert(gates.history_ulleung.open&&gates.quiz_dokdo.open);assert(!gates.quiz_ulleung.open&&!gates.history_dokdo.open);
 assert.equal((await call('student-progress',{...auth('s01'),action:'claim-reward',rewardId:'history_u5'})).data.amount,5);
 assert.equal((await call('student-progress',{...auth('s01'),action:'claim-reward',rewardId:'history_d5'})).status,403);
 await store('progress').setJSON('progress/s02',{xp:10,growthLevel:1});await store('progress').setJSON('reward/s02/quiz_d1',{amount:10});
 const result=await call('quiz',{...auth('s02'),island:'dokdo',id:'quiz_d1',choice:2});assert.equal(result.data.amount,0);assert(result.data.attempt.legacy);assert.equal(await xp('s02'),10);
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
