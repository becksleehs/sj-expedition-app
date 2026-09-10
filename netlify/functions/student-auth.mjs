import { getStore } from '@netlify/blobs';
import { randomBytes, scryptSync, timingSafeEqual, createHash, randomUUID } from 'node:crypto';

const headers={'content-type':'application/json; charset=utf-8','cache-control':'no-store'};
const STUDENTS=new Set(['s01','s02','s03','s04','s05','s06','s07','s08','s09','s10','s11','s12','s13']);
const clean=v=>String(v??'').trim();
const validPin=v=>/^\d{4}$/.test(clean(v));
const hashPassword=(pw,salt)=>scryptSync(pw,salt,32).toString('hex');
const tokenKey=t=>createHash('sha256').update(t).digest('hex');

export default async (req) => {
  const store=getStore({name:'sj-expedition-auth',consistency:'strong'});
  if(req.method==='GET'){
    const u=new URL(req.url), studentId=clean(u.searchParams.get('studentId'));
    if(!STUDENTS.has(studentId)) return new Response(JSON.stringify({registered:false}),{status:400,headers});
    const cred=await store.get(`student/${studentId}`,{type:'json',consistency:'strong'});
    return new Response(JSON.stringify({registered:!!cred}),{headers});
  }
  if(req.method!=='POST') return new Response(JSON.stringify({error:'method'}),{status:405,headers});
  let body={}; try{body=await req.json();}catch{}
  const action=clean(body.action), studentId=clean(body.studentId);
  if(!STUDENTS.has(studentId)) return new Response(JSON.stringify({error:'학생 정보가 올바르지 않습니다.'}),{status:400,headers});

  if(action==='register'){
    const password=clean(body.password);
    if(!validPin(password)) return new Response(JSON.stringify({error:'비밀번호는 숫자 4자리로 설정해주세요.'}),{status:400,headers});
    const old=await store.get(`student/${studentId}`,{type:'json',consistency:'strong'});
    if(old) return new Response(JSON.stringify({error:'이미 비밀번호가 설정된 학생입니다.'}),{status:409,headers});
    const salt=randomBytes(16).toString('hex'), credVersion=randomUUID();
    await store.setJSON(`student/${studentId}`,{salt,hash:hashPassword(password,salt),credVersion,createdAt:Date.now()});
    const token=randomBytes(32).toString('hex');
    await store.setJSON(`session/${tokenKey(token)}`,{studentId,credVersion,expiresAt:Date.now()+1000*60*60*24*120});
    return new Response(JSON.stringify({ok:true,token}),{headers});
  }

  if(action==='login'){
    const password=clean(body.password);
    const cred=await store.get(`student/${studentId}`,{type:'json',consistency:'strong'});
    if(!cred) return new Response(JSON.stringify({error:'아직 비밀번호가 설정되지 않았습니다.',unregistered:true}),{status:404,headers});
    const a=Buffer.from(hashPassword(password,cred.salt),'hex'), b=Buffer.from(cred.hash,'hex');
    if(a.length!==b.length || !timingSafeEqual(a,b)) return new Response(JSON.stringify({error:'비밀번호가 맞지 않습니다.'}),{status:401,headers});
    const token=randomBytes(32).toString('hex');
    await store.setJSON(`session/${tokenKey(token)}`,{studentId,credVersion:cred.credVersion,expiresAt:Date.now()+1000*60*60*24*120});
    return new Response(JSON.stringify({ok:true,token}),{headers});
  }

  if(action==='verify'){
    const token=clean(body.token);
    if(!token) return new Response(JSON.stringify({ok:false}),{status:401,headers});
    const session=await store.get(`session/${tokenKey(token)}`,{type:'json',consistency:'strong'});
    const cred=await store.get(`student/${studentId}`,{type:'json',consistency:'strong'});
    const ok=!!(session&&cred&&session.studentId===studentId&&session.credVersion===cred.credVersion&&session.expiresAt>Date.now());
    return new Response(JSON.stringify({ok}),{status:ok?200:401,headers});
  }

  if(action==='reset'){
    const teacherPin=clean(body.teacherPin), expected=process.env.TEACHER_PIN||'1014';
    if(teacherPin!==expected) return new Response(JSON.stringify({error:'교사 PIN이 맞지 않습니다.'}),{status:403,headers});
    await store.delete(`student/${studentId}`);
    return new Response(JSON.stringify({ok:true}),{headers});
  }

  return new Response(JSON.stringify({error:'action'}),{status:400,headers});
};
