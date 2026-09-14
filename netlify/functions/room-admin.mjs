import {getStore} from '@netlify/blobs';
import {createHash} from 'node:crypto';
const reply=(d,status=200)=>new Response(JSON.stringify(d),{status,headers:{'content-type':'application/json','cache-control':'no-store'}});
export default async req=>{
 if(req.method!=='POST')return reply({error:'method'},405);
 let b;try{b=await req.json()}catch{return reply({error:'입력 오류'},400)}
 const pin=String(b.teacherPin||''),configured=process.env.TEACHER_PIN;
 if(!/^\d{4}$/.test(pin)||!(configured?pin===configured:createHash('sha256').update(pin).digest('hex')==='df4865fca1f159162557359ef967f9502087f57527b0e030e139933e54f3061e'))return reply({error:'교사 인증이 필요합니다.'},403);
 const names={notices:'sj-expedition-notices',chat:'sj-expedition-chat',album:'sj-expedition-album'};
 if(!names[b.area])return reply({error:'대상 오류'},400);
 const store=getStore({name:names[b.area],consistency:'strong'});
 if(b.action==='reset'){
   const prefixes={notices:['notice/'],chat:['msg/'],album:['meta/','image/']}[b.area];
   for(const prefix of prefixes){const {blobs}=await store.list({prefix});for(const x of blobs)await store.delete(x.key)}
   if(b.area==='notices')await store.setJSON('notice/default',{title:'승주 원정대에 오신 것을 환영합니다!',body:'집합 시간과 준비물은 선생님의 안내를 확인하세요. 안전하게 함께 이동하고 친구를 배려하며 즐거운 추억을 만들어 봅시다.',time:Date.now(),system:false});
   return reply({ok:true});
 }
 if(b.action==='delete'&&b.area==='notices'&&typeof b.id==='string'&&b.id.startsWith('notice/')){await store.delete(b.id);return reply({ok:true})}
 if(b.action==='delete'&&b.area==='album'&&/^[a-f0-9-]{36}$/.test(b.id||'')){await store.delete('meta/'+b.id);await store.delete('image/'+b.id);return reply({ok:true})}
 if(b.action==='pin'&&b.area==='chat') {await store.setJSON('pinned',{text:String(b.text||'').trim().slice(0,500)});return reply({ok:true})}
 if(b.action==='upload'&&b.area==='album'){
   if(typeof b.imageData!=='string'||b.imageData.length>2600000||!/^data:image\/(jpeg|png|webp);base64,/.test(b.imageData))return reply({error:'사진 형식 또는 용량을 확인해주세요.'},400);
   const id=crypto.randomUUID();await store.set('image/'+id,b.imageData);await store.setJSON('meta/'+id,{id,studentId:'teacher',uploadedAt:Date.now(),caption:String(b.caption||'').slice(0,80)});return reply({ok:true});
 }
 return reply({error:'요청 오류'},400);
};
