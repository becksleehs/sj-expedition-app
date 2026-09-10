import { getStore } from '@netlify/blobs';
import { createHash, randomUUID } from 'node:crypto';
const headers={'content-type':'application/json; charset=utf-8','cache-control':'no-store'};
const clean=v=>String(v??'').replace(/[<>]/g,'').trim();
const validPin=v=>/^\d{4}$/.test(clean(v));
const FALLBACK_TEACHER_PIN_SHA256='df4865fca1f159162557359ef967f9502087f57527b0e030e139933e54f3061e';
function validTeacherPin(pin){const entered=clean(pin);if(!validPin(entered))return false;const configured=clean(process.env.TEACHER_PIN);if(configured)return entered===configured;return createHash('sha256').update(entered).digest('hex')===FALLBACK_TEACHER_PIN_SHA256;}
export default async req=>{
  const store=getStore({name:'sj-expedition-special-mission',consistency:'strong'});
  if(req.method==='GET'){
    const mission=await store.get('current',{type:'json',consistency:'strong'});
    return new Response(JSON.stringify({mission:mission||null}),{headers});
  }
  if(req.method!=='POST')return new Response(JSON.stringify({error:'method'}),{status:405,headers});
  let body={};try{body=await req.json();}catch{}
  if(!validTeacherPin(body.teacherPin))return new Response(JSON.stringify({error:'교사 PIN이 맞지 않습니다.'}),{status:403,headers});
  const action=clean(body.action);
  if(action==='publish'){
    const text=clean(body.text).slice(0,180);
    if(!text)return new Response(JSON.stringify({error:'스페셜 미션 내용을 입력해주세요.'}),{status:400,headers});
    const mission={id:`${Date.now()}-${randomUUID()}`,text,createdAt:Date.now()};
    await store.setJSON('current',mission);
    return new Response(JSON.stringify({ok:true,mission}),{headers});
  }
  if(action==='clear'){
    await store.delete('current');
    return new Response(JSON.stringify({ok:true,mission:null}),{headers});
  }
  return new Response(JSON.stringify({error:'action'}),{status:400,headers});
};
