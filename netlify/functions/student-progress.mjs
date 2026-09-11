import { getStore } from '@netlify/blobs';
import { createHash } from 'node:crypto';

const headers={'content-type':'application/json; charset=utf-8','cache-control':'no-store'};
const STUDENTS=new Set(['s01','s02','s03','s04','s05','s06','s07','s08','s09','s10','s11','s12','s13']);
const clean=v=>String(v??'').trim();
const tokenKey=t=>createHash('sha256').update(t).digest('hex');
const FALLBACK_TEACHER_PIN_SHA256='df4865fca1f159162557359ef967f9502087f57527b0e030e139933e54f3061e';
function validTeacherPin(pin){const entered=clean(pin);if(!/^\d{4}$/.test(entered))return false;const configured=clean(process.env.TEACHER_PIN);if(configured)return entered===configured;return createHash('sha256').update(entered).digest('hex')===FALLBACK_TEACHER_PIN_SHA256;}
const clamp=(n,a,b)=>Math.max(a,Math.min(b,Number(n)||0));
async function validSession(studentId,token){
  if(!STUDENTS.has(studentId)||!token)return false;
  const auth=getStore({name:'sj-expedition-auth',consistency:'strong'});
  const session=await auth.get(`session/${tokenKey(token)}`,{type:'json',consistency:'strong'});
  const cred=await auth.get(`student/${studentId}`,{type:'json',consistency:'strong'});
  return !!(session&&cred&&session.studentId===studentId&&session.credVersion===cred.credVersion&&session.expiresAt>Date.now());
}
function normalized(p){return {xp:Math.max(0,Math.round(Number(p?.xp)||0)),growthLevel:clamp(p?.growthLevel||1,1,5),updatedAt:Number(p?.updatedAt)||Date.now()};}
export default async(req)=>{
  const store=getStore({name:'sj-expedition-progress',consistency:'strong'});
  if(req.method==='GET'){
    const u=new URL(req.url),studentId=clean(u.searchParams.get('studentId')),token=clean(u.searchParams.get('token'));
    if(!await validSession(studentId,token))return new Response(JSON.stringify({error:'인증이 필요합니다.'}),{status:401,headers});
    const progress=normalized(await store.get(`progress/${studentId}`,{type:'json',consistency:'strong'}));
    return new Response(JSON.stringify({ok:true,progress}),{headers});
  }
  if(req.method!=='POST')return new Response(JSON.stringify({error:'method'}),{status:405,headers});
  let body={};try{body=await req.json()}catch{}
  const action=clean(body.action),studentId=clean(body.studentId);
  if(!STUDENTS.has(studentId))return new Response(JSON.stringify({error:'학생 정보가 올바르지 않습니다.'}),{status:400,headers});
  if(action==='teacher-add-xp'){
    if(!validTeacherPin(body.teacherPin))return new Response(JSON.stringify({error:'교사 PIN이 맞지 않습니다.'}),{status:403,headers});
    const old=normalized(await store.get(`progress/${studentId}`,{type:'json',consistency:'strong'}));
    const amount=clamp(body.amount,-10000,10000),progress={...old,xp:Math.max(0,old.xp+amount),updatedAt:Date.now()};
    await store.setJSON(`progress/${studentId}`,progress);
    return new Response(JSON.stringify({ok:true,progress}),{headers});
  }
  if(action==='save'){
    const token=clean(body.token);if(!await validSession(studentId,token))return new Response(JSON.stringify({error:'인증이 필요합니다.'}),{status:401,headers});
    const progress={xp:clamp(body.xp,0,99999),growthLevel:clamp(body.growthLevel,1,5),updatedAt:Date.now()};
    await store.setJSON(`progress/${studentId}`,progress);
    return new Response(JSON.stringify({ok:true,progress}),{headers});
  }
  return new Response(JSON.stringify({error:'action'}),{status:400,headers});
};
