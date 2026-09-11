import { getStore } from '@netlify/blobs';
import { createHash } from 'node:crypto';
const headers={'content-type':'application/json; charset=utf-8','cache-control':'no-store'};
const clean=v=>String(v??'').trim();
const STUDENTS=new Set(['s01','s02','s03','s04','s05','s06','s07','s08','s09','s10','s11','s12','s13']);
const FALLBACK_TEACHER_PIN_SHA256='df4865fca1f159162557359ef967f9502087f57527b0e030e139933e54f3061e';
function validTeacherPin(pin){const entered=clean(pin);if(!/^\d{4}$/.test(entered))return false;const configured=clean(process.env.TEACHER_PIN);if(configured)return entered===configured;return createHash('sha256').update(entered).digest('hex')===FALLBACK_TEACHER_PIN_SHA256;}
async function addNotice(){const ns=getStore({name:'sj-expedition-notices',consistency:'strong'});const now=Date.now();await ns.setJSON(`notice/${String(now).padStart(13,'0')}-groups`,{title:'👥 오늘의 원정대 조편성이 확정되었습니다!',body:'지금 나의 조와 조원을 확인해보세요.',time:now,system:true});}
export default async(req)=>{
  const store=getStore({name:'sj-expedition-groups',consistency:'strong'});
  if(req.method==='GET'){
    const current=await store.get('current',{type:'json',consistency:'strong'});
    return new Response(JSON.stringify({ok:true,current:current||null}),{headers});
  }
  if(req.method!=='POST')return new Response(JSON.stringify({error:'method'}),{status:405,headers});
  let body={};try{body=await req.json()}catch{}
  if(!validTeacherPin(body.teacherPin))return new Response(JSON.stringify({error:'교사 PIN이 맞지 않습니다.'}),{status:403,headers});
  if(clean(body.action)!=='publish')return new Response(JSON.stringify({error:'action'}),{status:400,headers});
  const groups=Array.isArray(body.groups)?body.groups:[];if(groups.length!==3)return new Response(JSON.stringify({error:'3개 조가 필요합니다.'}),{status:400,headers});
  const seen=new Set();for(const g of groups){if(!Array.isArray(g.members))return new Response(JSON.stringify({error:'조 정보 오류'}),{status:400,headers});for(const id of g.members){if(!STUDENTS.has(id)||seen.has(id))return new Response(JSON.stringify({error:'학생 중복 또는 정보 오류'}),{status:400,headers});seen.add(id)}}
  const prev=await store.get('current',{type:'json',consistency:'strong'});const now=Date.now();
  const current={version:(Number(prev?.version)||0)+1,publishedAt:now,groups:groups.map((g,i)=>({name:g.name||`${i+1}조`,members:g.members}))};
  await store.setJSON('current',current);await addNotice();
  return new Response(JSON.stringify({ok:true,current}),{headers});
};
