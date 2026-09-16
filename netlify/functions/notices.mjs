import { getStore } from '@netlify/blobs';
import { createHash } from 'node:crypto';
const headers={'content-type':'application/json; charset=utf-8','cache-control':'no-store'};
export default async (req)=>{
  const store=getStore({name:'sj-expedition-notices',consistency:'strong'});
  if(req.method==='GET'){
 if(!await store.get('seeded-v318')){const initial=await store.list({prefix:'notice/'});if(!initial.blobs.length)await store.setJSON('notice/default',{title:'승주 원정대에 오신 것을 환영합니다!',body:'집합 시간과 준비물은 선생님의 안내를 확인하세요. 안전하게 함께 이동하고 친구를 배려하며 즐거운 추억을 만들어 봅시다.',time:Date.now(),system:false},{onlyIfNew:true});await store.set('seeded-v318','1');}

    const {blobs}=await store.list({prefix:'notice/'}); const keys=blobs.map(b=>b.key); const notices=[];
    for(const key of keys){const v=await store.get(key,{type:'json',consistency:'strong'});if(v)notices.push({...v,id:key})}
    notices.sort((a,b)=>Number(b.time)-Number(a.time));
    return new Response(JSON.stringify({notices}),{headers});
  }
  if(req.method==='POST'){
    let d;try{d=await req.json()}catch{return new Response('{}',{status:400,headers})}
    const pin=String(d.teacherPin||'').trim(),configured=String(process.env.TEACHER_PIN||'').trim();
    const valid=/^\d{4}$/.test(pin)&&(configured?pin===configured:createHash('sha256').update(pin).digest('hex')==='df4865fca1f159162557359ef967f9502087f57527b0e030e139933e54f3061e');
    if(!valid)return new Response(JSON.stringify({error:'교사 PIN이 맞지 않습니다.'}),{status:403,headers});
    const title=String(d.title||'').trim(),body=String(d.body||'').trim(),id=String(d.id||'');
    if(!title||title.length>100||!body||body.length>5000||!/^\d{13}-[a-f0-9-]{36}$/.test(id))return new Response(JSON.stringify({error:'제목과 내용을 확인해주세요.'}),{status:400,headers});
    const key=`notice/${id}`;
    if(!await store.get(key))await store.setJSON(key,{title,body,time:Date.now(),system:false});
    return new Response(JSON.stringify({ok:true}),{headers});
  }
  return new Response(JSON.stringify({error:'method'}),{status:405,headers});
};
