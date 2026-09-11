import { getStore } from '@netlify/blobs';
import { createHash, randomUUID } from 'node:crypto';
const headers={'content-type':'application/json; charset=utf-8','cache-control':'no-store'};
const STUDENTS=new Set(['s01','s02','s03','s04','s05','s06','s07','s08','s09','s10','s11','s12','s13']);
const clean=v=>String(v??'').trim();
const tokenKey=t=>createHash('sha256').update(t).digest('hex');
async function validSession(studentId,token){if(!STUDENTS.has(studentId)||!token)return false;const auth=getStore({name:'sj-expedition-auth',consistency:'strong'});const session=await auth.get(`session/${tokenKey(token)}`,{type:'json',consistency:'strong'});const cred=await auth.get(`student/${studentId}`,{type:'json',consistency:'strong'});return !!(session&&cred&&session.studentId===studentId&&session.credVersion===cred.credVersion&&session.expiresAt>Date.now());}
export default async(req)=>{
  const store=getStore({name:'sj-expedition-album',consistency:'strong'});const u=new URL(req.url);
  if(req.method==='GET'){
    const id=clean(u.searchParams.get('id'));
    if(id){const data=await store.get(`image/${id}`,{consistency:'strong'});if(!data)return new Response('not found',{status:404});const m=String(data).match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/);if(!m)return new Response('bad image',{status:500});const bytes=Buffer.from(m[2],'base64');const download=u.searchParams.get('download')==='1';return new Response(bytes,{headers:{'content-type':m[1],'cache-control':'public,max-age=3600',...(download?{'content-disposition':`attachment; filename="sj-photo-${id}.jpg"`}:{})}})}
    const {blobs}=await store.list({prefix:'meta/'});const items=[];for(const b of blobs){const v=await store.get(b.key,{type:'json',consistency:'strong'});if(v)items.push(v)}items.sort((a,b)=>a.uploadedAt-b.uploadedAt);items.forEach((x,i)=>x.rank=i+1);return new Response(JSON.stringify({ok:true,items:[...items].reverse()}),{headers});
  }
  if(req.method!=='POST')return new Response(JSON.stringify({error:'method'}),{status:405,headers});
  let body={};try{body=await req.json()}catch{}
  const studentId=clean(body.studentId),token=clean(body.token);if(!await validSession(studentId,token))return new Response(JSON.stringify({error:'학생 로그인이 필요합니다.'}),{status:401,headers});
  const imageData=clean(body.imageData);if(!/^data:image\/(jpeg|png|webp);base64,/i.test(imageData))return new Response(JSON.stringify({error:'이미지 형식이 올바르지 않습니다.'}),{status:400,headers});
  if(imageData.length>2600000)return new Response(JSON.stringify({error:'사진 용량이 너무 큽니다. 다시 선택해주세요.'}),{status:413,headers});
  const id=randomUUID();const uploadedAt=Date.now();const meta={id,studentId,caption:clean(body.caption).slice(0,80),uploadedAt,originalName:clean(body.originalName).slice(0,120)};
  await store.set(`image/${id}`,imageData);await store.setJSON(`meta/${id}`,meta);
  return new Response(JSON.stringify({ok:true,item:meta}),{headers});
};
