import { getStore } from '@netlify/blobs';
import { createHash } from 'node:crypto';
const headers={'content-type':'application/json; charset=utf-8','cache-control':'no-store'};
const clean=v=>String(v??'').trim();
const FALLBACK_TEACHER_PIN_SHA256='df4865fca1f159162557359ef967f9502087f57527b0e030e139933e54f3061e';
function validTeacherPin(pin){const entered=clean(pin);if(!/^\d{4}$/.test(entered))return false;const configured=clean(process.env.TEACHER_PIN);if(configured)return entered===configured;return createHash('sha256').update(entered).digest('hex')===FALLBACK_TEACHER_PIN_SHA256;}
async function addNotice(title,body){const ns=getStore({name:'sj-expedition-notices',consistency:'strong'});const now=Date.now();await ns.setJSON(`notice/${String(now).padStart(13,'0')}-system`,{title,body,time:now,system:true});}
const names={history_ulleung:'울릉도 역사 이야기',history_dokdo:'독도 역사 이야기',quiz_ulleung:'울릉도 역사 퀴즈',quiz_dokdo:'독도 역사 퀴즈'};
function defaults(){return Object.fromEntries(Object.keys(names).map(k=>[k,{open:false,version:0,updatedAt:0}]))}
export default async(req)=>{
  const store=getStore({name:'sj-expedition-gates',consistency:'strong'});
  if(req.method==='GET'){
    const state=Object.assign(defaults(),await store.get('state',{type:'json',consistency:'strong'})||{});
    return new Response(JSON.stringify({ok:true,state}),{headers});
  }
  if(req.method!=='POST')return new Response(JSON.stringify({error:'method'}),{status:405,headers});
  let body={};try{body=await req.json()}catch{}
  if(!validTeacherPin(body.teacherPin))return new Response(JSON.stringify({error:'교사 PIN이 맞지 않습니다.'}),{status:403,headers});
  const feature=clean(body.feature);if(!Object.hasOwn(names,feature))return new Response(JSON.stringify({error:'feature'}),{status:400,headers});
  let state;
  const now=Date.now(),open=!!body.open;
  for(let attempt=0;attempt<12;attempt++){
    const entry=await store.getWithMetadata('state',{type:'json',consistency:'strong'});
    state=Object.assign(defaults(),entry?.data||{});
    state[feature]={open,version:(Number(state[feature]?.version)||0)+1,updatedAt:now};
    const result=await store.setJSON('state',state,entry?{onlyIfMatch:entry.etag}:{onlyIfNew:true});
    if(result.modified)break;
    if(attempt===11)return new Response(JSON.stringify({error:'다시 시도해주세요.'}),{status:503,headers});
  }
  if(open)await addNotice('📖 '+names[feature]+'가 열렸어요!',names[feature]+' 탭에서 참여하세요.');
  return new Response(JSON.stringify({ok:true,state}),{headers});
};
