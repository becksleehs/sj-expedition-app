import {student as validStudent} from './lib/mission-auth.mjs';
import { getStore } from '@netlify/blobs';

const headers={'content-type':'application/json; charset=utf-8','cache-control':'no-store'};
const clean=s=>String(s??'').replace(/[<>]/g,'').trim();
const STUDENTS=new Set(['김서하','조현정','김주안','위준민','정범수','양하율','박현제','양서현','위지현','이사랑','이희주','송승아','오예린']);

export default async (req) => {
  const store=getStore({name:'sj-expedition-chat',consistency:'strong'});
  if(req.method==='GET'){
    const {blobs}=await store.list({prefix:'msg/'});
    const keys=blobs.map(b=>b.key).sort().slice(-100);
    const messages=[];
    for(const key of keys){ const v=await store.get(key,{type:'json',consistency:'strong'}); if(v) messages.push(v); }
    const pinned=await store.get('pinned',{type:'json'});
    return new Response(JSON.stringify({messages,pinned:pinned?.text||''}),{headers});
  }
  if(req.method==='POST'){
    let body={}; try{body=await req.json();}catch{}
    if(!await validStudent(body.studentId,body.token))return new Response(JSON.stringify({error:'학생 로그인이 필요합니다.'}),{status:401,headers});
 const index=Number(body.studentId.slice(1))-1,student=[...STUDENTS][index],text=clean(body.text).slice(0,120),grade=index<2?'1':index<7?'2':'3';
    if(!student||!text||!STUDENTS.has(student)) return new Response(JSON.stringify({error:'invalid student or message'}),{status:400,headers});
    const time=Date.now(), id=crypto.randomUUID();
    const msg={id,student,grade,text,time};
    await store.setJSON(`msg/${String(time).padStart(13,'0')}-${id}`,msg);
    const {blobs}=await store.list({prefix:'msg/'});
    if(blobs.length>220){ const old=blobs.map(b=>b.key).sort().slice(0,blobs.length-200); await Promise.all(old.map(k=>store.delete(k))); }
    return new Response(JSON.stringify({ok:true,message:msg}),{headers});
  }
  return new Response(JSON.stringify({error:'method'}),{status:405,headers});
};
