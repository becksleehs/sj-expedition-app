import {randomUUID,randomBytes} from 'node:crypto';
import {getStore} from '@netlify/blobs';
import {student,teacher} from './lib/mission-auth.mjs';
import {mediaStore,mediaFor,publicMedia,deleteMedia,validId,CHUNK,MAX_VIDEO,MAX_IMAGE} from './lib/media-store.mjs';
const reply=(d,status=200)=>new Response(JSON.stringify(d),{status,headers:{'content-type':'application/json','cache-control':'no-store'}});
const types=['image/jpeg','image/png','image/webp','video/mp4','video/webm','video/quicktime'];
export default async req=>{try{
 const u=new URL(req.url),id=u.searchParams.get('id'),action=u.searchParams.get('action'),store=mediaStore();
 if(['GET','HEAD'].includes(req.method)&&action==='read'){
  const m=await mediaFor(id);if(!m||u.searchParams.get('key')!==m.readKey)return reply({error:'파일이 없습니다.'},404);
  const base={'content-type':m.mime,'accept-ranges':'bytes','cache-control':'private,max-age=300','x-content-type-options':'nosniff'};
  if(req.method==='HEAD')return new Response(null,{headers:{...base,'content-length':String(m.size)}});
  const range=req.headers.get('range');let start=0,end=m.size-1,status=200;
  if(m.kind==='video'||range){if(range){const r=/^bytes=(\d*)-(\d*)$/.exec(range);if(!r||(!r[1]&&!r[2]))return new Response(null,{status:416,headers:{'content-range':`bytes */${m.size}`}});if(!r[1])start=Math.max(0,m.size-Number(r[2]));else{start=Number(r[1]);if(r[2])end=Math.min(end,Number(r[2]));}}
   if(!Number.isSafeInteger(start)||start<0||start>=m.size||end<start)return new Response(null,{status:416,headers:{'content-range':`bytes */${m.size}`}});end=Math.min(end,start+CHUNK-1);status=206;
  }
  const chunks=[],first=Math.floor(start/CHUNK);for(let i=first;i<=Math.floor(end/CHUNK);i++){const data=await store.get(`chunk/${id}/${i}`,{type:'arrayBuffer'});if(!data)return reply({},404);chunks.push(Buffer.from(data));}
  return new Response(Buffer.concat(chunks).subarray(start-first*CHUNK,end-first*CHUNK+1),{status,headers:{...base,'content-length':String(end-start+1),...(status===206?{'content-range':`bytes ${start}-${end}/${m.size}`}:{})}});
 }
 if(req.method==='PUT'&&action==='chunk'){
  const m=validId(id)?await store.get('upload/'+id,{type:'json'}):null,sid=req.headers.get('x-student-id');
  if(!m||m.expiresAt<Date.now()||!(teacher(req.headers.get('x-teacher-pin'))||(m.owner===sid&&await student(sid,req.headers.get('x-student-token')))))return reply({error:'업로드 인증 오류'},403);
  const index=Number(u.searchParams.get('index'));if(!Number.isInteger(index)||index<0||index>=m.chunks)return reply({},400);if(await mediaFor(id))return reply({ok:true});
  const data=await req.arrayBuffer(),expected=index===m.chunks-1?m.size-index*CHUNK:CHUNK;if(data.byteLength!==expected)return reply({error:'파일 조각의 크기가 맞지 않습니다.'},400);
  await store.set(`chunk/${id}/${index}`,data,{onlyIfNew:true,metadata:{size:expected}});return reply({ok:true});
 }
 if(req.method!=='POST')return reply({},405);const b=await req.json(),admin=teacher(b.teacherPin),logged=await student(b.studentId,b.token),owner=admin?'teacher':b.studentId;
 if(!admin&&!logged)return reply({error:'학생 로그인 또는 관리자 인증이 필요합니다.'},401);
 if(b.action==='init'){
  const size=Number(b.size),mime=String(b.mime||''),kind=mime.startsWith('video/')?'video':'photo',duration=Number(b.duration||0);
  if(!types.includes(mime)||!Number.isSafeInteger(size)||size<1||size>(kind==='video'?MAX_VIDEO:MAX_IMAGE))return reply({error:'사진 4MB, 동영상 150MB 이하로 선택해주세요.'},400);
  if(kind==='video'&&(!Number.isFinite(duration)||duration<=0||duration>180.5))return reply({error:'동영상은 3분 이내로 올려주세요.'},400);
  const id=randomUUID(),m={id,owner,kind,mime,size,duration,purpose:b.purpose==='mission'?'mission':'album',chunks:Math.ceil(size/CHUNK),originalName:String(b.originalName||'').slice(0,120),caption:String(b.caption||'').trim().slice(0,120),createdAt:Date.now(),expiresAt:Date.now()+86400000,readKey:randomBytes(24).toString('hex')};await store.setJSON('upload/'+id,m,{onlyIfNew:true});return reply({ok:true,id,chunkSize:CHUNK,chunks:m.chunks});
 }
 const m=validId(b.id)?await store.get('upload/'+b.id,{type:'json'}):null;if(!m||(!admin&&m.owner!==owner))return reply({error:'업로드 파일 없음'},404);
 if(b.action==='cancel'){if(!await mediaFor(m.id))await deleteMedia(m.id);return reply({ok:true});}
 if(b.action==='complete'){
  let ready=await mediaFor(m.id);if(!ready){
   if(m.expiresAt<Date.now())return reply({error:'업로드 시간이 만료되었습니다.'},410);
   for(let i=0;i<m.chunks;i++)if(!await store.getMetadata(`chunk/${m.id}/${i}`))return reply({error:'파일 일부가 아직 업로드되지 않았습니다.'},409);
   const data=Buffer.from(await store.get(`chunk/${m.id}/0`,{type:'arrayBuffer'})),valid=m.mime==='image/jpeg'?data[0]===255&&data[1]===216:m.mime==='image/png'?data.subarray(1,4).toString()==='PNG':m.mime==='image/webp'?data.subarray(0,4).toString()==='RIFF'&&data.subarray(8,12).toString()==='WEBP':m.mime==='video/webm'?data.subarray(0,4).toString('hex')==='1a45dfa3':data.subarray(4,8).toString()==='ftyp';
   if(!valid)return reply({error:'지원하는 사진 또는 동영상 파일이 아닙니다.'},400);await store.setJSON('ready/'+m.id,{...m,uploadedAt:Date.now()},{onlyIfNew:true});ready=await mediaFor(m.id);
  }
  if(m.purpose==='album'){const album=getStore({name:'sj-expedition-album',consistency:'strong'});await album.setJSON('meta/'+m.id,{id:m.id,mediaId:m.id,kind:m.kind,studentId:m.owner,caption:m.caption,uploadedAt:ready.uploadedAt,originalName:m.originalName},{onlyIfNew:true});}
  return reply({ok:true,media:publicMedia(ready)});
 }
 return reply({error:'요청 오류'},400);
}catch(e){console.error(e.message);return reply({error:'파일 처리 오류입니다. 다시 시도해주세요.'},503)}};
