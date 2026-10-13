import {student as validStudent,teacher as validTeacher} from './lib/mission-auth.mjs';
import { getStore } from '@netlify/blobs';
import {mediaFor,publicMedia,deleteMedia} from './lib/media-store.mjs';
import {broadcastPush,allStudentIds} from './lib/push-service.mjs';

const headers={'content-type':'application/json; charset=utf-8','cache-control':'no-store'};
const clean=s=>String(s??'').replace(/[<>]/g,'').trim();
const STUDENT_NAMES=['김서하','조현정','김주안','위준민','정범수','양하율','박현제','양서현','위지현','이사랑','이희주','송승아','오예린'];

export default async (req) => {
  const store=getStore({name:'sj-expedition-chat',consistency:'strong'});
  if(req.method==='GET'){
    const {blobs}=await store.list({prefix:'msg/'});
    const keys=blobs.map(b=>b.key).sort().slice(-100);
    const messages=[];
    for(const key of keys){ const v=await store.get(key,{type:'json',consistency:'strong'}); if(v){const name=STUDENT_NAMES[Number(String(v.studentId||'').slice(1))-1];messages.push({...v,student:name||v.student||'작성자 확인 중'});} }
    const pinned=await store.get('pinned',{type:'json'});
    return new Response(JSON.stringify({messages,pinned:pinned?.text||''}),{headers});
  }
  if(req.method==='POST'){
    let body={}; try{body=await req.json();}catch{}
    const isTeacher=validTeacher(body.teacherPin);
    if(!isTeacher&&!await validStudent(body.studentId,body.token))return new Response(JSON.stringify({error:'학생 로그인 또는 교사 PIN이 필요합니다.'}),{status:401,headers});
    const index=isTeacher?-1:Number(body.studentId.slice(1))-1,student=isTeacher?'선생님':STUDENT_NAMES[index],text=clean(body.text).slice(0,120),grade=isTeacher?'':index<2?'1':index<7?'2':'3';
    const mediaId=body.mediaId||null,media=mediaId?await mediaFor(mediaId):null;
    if(mediaId&&(!media||isTeacher||media.owner!==body.studentId||media.purpose!=='chat'||media.kind!=='photo'))return new Response(JSON.stringify({error:'학생 본인이 올린 채팅 사진만 첨부할 수 있습니다.'}),{status:403,headers});
    if(!student||(!text&&!media)) return new Response(JSON.stringify({error:'invalid student or message'}),{status:400,headers});
    const time=Date.now(), id=crypto.randomUUID();
    const msg={id,studentId:isTeacher?null:body.studentId,student,grade,text,time,...(media?{mediaId,media:publicMedia(media)}:{})};
    await store.setJSON(`msg/${String(time).padStart(13,'0')}-${id}`,msg);
    try{await broadcastPush({title:`원정대 채팅 · ${student}`,body:text||'사진을 보냈어요.',url:'chat.html',tag:`sj-chat-${id}`,studentIds:allStudentIds.filter(s=>s!==body.studentId)},req.url)}catch(error){console.error('chat push failed',error?.message)}
    const {blobs}=await store.list({prefix:'msg/'});
    if(blobs.length>220){ const old=blobs.map(b=>b.key).sort().slice(0,blobs.length-200); for(const k of old){const removed=await store.get(k,{type:'json'});await store.delete(k);if(removed?.mediaId)await deleteMedia(removed.mediaId);} }
    return new Response(JSON.stringify({ok:true,message:msg}),{headers});
  }
  return new Response(JSON.stringify({error:'method'}),{status:405,headers});
};
