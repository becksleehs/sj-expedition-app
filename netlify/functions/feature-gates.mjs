import { getStore } from '@netlify/blobs';
import { createHash } from 'node:crypto';
const headers={'content-type':'application/json; charset=utf-8','cache-control':'no-store'};
const clean=v=>String(v??'').trim();
const FALLBACK_TEACHER_PIN_SHA256='df4865fca1f159162557359ef967f9502087f57527b0e030e139933e54f3061e';
function validTeacherPin(pin){const entered=clean(pin);if(!/^\d{4}$/.test(entered))return false;const configured=clean(process.env.TEACHER_PIN);if(configured)return entered===configured;return createHash('sha256').update(entered).digest('hex')===FALLBACK_TEACHER_PIN_SHA256;}
async function addNotice(title,body){const ns=getStore({name:'sj-expedition-notices',consistency:'strong'});const now=Date.now();await ns.setJSON(`notice/${String(now).padStart(13,'0')}-system`,{title,body,time:now,system:true});}
function defaults(){return {history:{open:false,version:0,updatedAt:0},quiz:{open:false,version:0,updatedAt:0}}}
export default async(req)=>{
  const store=getStore({name:'sj-expedition-gates',consistency:'strong'});
  if(req.method==='GET'){
    const state=Object.assign(defaults(),await store.get('state',{type:'json',consistency:'strong'})||{});
    return new Response(JSON.stringify({ok:true,state}),{headers});
  }
  if(req.method!=='POST')return new Response(JSON.stringify({error:'method'}),{status:405,headers});
  let body={};try{body=await req.json()}catch{}
  if(!validTeacherPin(body.teacherPin))return new Response(JSON.stringify({error:'교사 PIN이 맞지 않습니다.'}),{status:403,headers});
  const feature=clean(body.feature);if(!['history','quiz'].includes(feature))return new Response(JSON.stringify({error:'feature'}),{status:400,headers});
  const state=Object.assign(defaults(),await store.get('state',{type:'json',consistency:'strong'})||{});
  const now=Date.now();const open=!!body.open;const prev=state[feature]||{open:false,version:0};
  state[feature]={open,version:(Number(prev.version)||0)+1,updatedAt:now};
  await store.setJSON('state',state);
  if(open){
    if(feature==='history')await addNotice('📖 역사 이야기가 열렸어요!','지금 울릉도·독도 역사 이야기를 읽고 자료까지 확인하면 이야기마다 +5 XP를 받을 수 있어요.');
    else await addNotice('🚌 버스 역사 퀴즈가 열렸어요!','역사 이야기를 떠올리며 버스 퀴즈에 도전하고 경험치를 획득하세요.');
  }
  return new Response(JSON.stringify({ok:true,state}),{headers});
};
