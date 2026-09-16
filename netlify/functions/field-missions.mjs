import {getStore} from '@netlify/blobs';import {randomInt} from 'node:crypto';
import {missions,students} from './lib/mission-data.mjs';import {teacher,student} from './lib/mission-auth.mjs';
import {settle} from './lib/progress-store.mjs';import {mediaFor,publicMedia,deleteMedia} from './lib/media-store.mjs';
const reply=(d,status=200)=>new Response(JSON.stringify(d),{status,headers:{'content-type':'application/json','cache-control':'no-store'}});
export default async req=>{try{
 const store=getStore({name:'sj-expedition-field-missions',consistency:'strong'}),b=req.method==='POST'?await req.json():req.method==='GET'?Object.fromEntries(new URL(req.url).searchParams):null;if(!b)return reply({},405);
 const admin=teacher(b.teacherPin),logged=await student(b.studentId,b.token);
 if(['start','close'].includes(b.action)){
  if(!admin)return reply({error:'교사 인증 필요'},403);const ids=Array.isArray(b.ids)?[...new Set(b.ids)]:[];if(!ids.length||ids.some(id=>!missions.some(m=>m.id===id)))return reply({error:'미션을 선택해주세요.'},400);
  const gs=getStore({name:'sj-expedition-groups',consistency:'strong'}),current=await gs.get('current',{type:'json'}),groups=current?.groups||[],attendees=[...new Set(groups.flatMap(g=>g.members))],prepared=[];
  if(b.action==='start'&&!attendees.length)return reply({error:'참석자를 반영해 조편성을 먼저 확정해주세요.'},400);
  for(const id of ids){let state=await store.get('state/'+id,{type:'json'});if(b.action==='close'){if(state)prepared.push([id,{...state,status:'closed'}]);continue;}
   if(!state){const m=missions.find(x=>x.id===id),seniors=students.filter(s=>s.grade===3&&attendees.includes(s.id)).map(s=>s.id),letters={};if(m.scope==='letter'){if(seniors.length<2)return reply({error:'랜덤 편지는 참석한 3학년이 2명 이상이어야 합니다.'},400);for(let i=seniors.length-1;i>0;i--){const j=randomInt(i+1);[seniors[i],seniors[j]]=[seniors[j],seniors[i]];}seniors.forEach((s,i)=>letters[s]=seniors[(i+1)%seniors.length]);}state={groups,attendees,letters,startedAt:Date.now()};}
   prepared.push([id,{...state,status:'open',version:Date.now()}]);
  }for(const [id,v] of prepared)await store.setJSON('state/'+id,v);return reply({ok:true});
 }
 if(b.action==='submit'){
  if(!logged)return reply({error:'학생 로그인 필요'},401);const m=missions.find(x=>x.id===b.id);if(!m)return reply({},400);const state=await store.get('state/'+m.id,{type:'json'});
  if(!state?.attendees.includes(b.studentId))return reply({error:'미션 참여 대상이 아닙니다.'},403);const grade=students.find(s=>s.id===b.studentId).grade;if(['senior','letter'].includes(m.scope)&&grade!==3)return reply({},403);
  let members=[b.studentId],team=b.studentId;
  if(m.scope==='group'){const i=state.groups.findIndex(g=>g.members.includes(b.studentId));if(i<0)return reply({},403);members=state.groups[i].members;team='group'+i;}
  if(['grade','senior'].includes(m.scope)){members=students.filter(s=>s.grade===grade&&state.attendees.includes(s.id)).map(s=>s.id);team='grade'+grade;}
  const key='submission/'+m.id+'/'+team,prior=await store.get(key,{type:'json'});if(prior){await settle(prior);return reply({ok:true,already:true,members:prior.members});}
  if(state.status!=='open')return reply({error:'현재 열려 있는 미션이 아닙니다.'},403);
  const text=String(b.text||'').trim(),media=await mediaFor(b.mediaId),image=String(b.image||'');if(text.length>3000||(m.type!=='photo'&&!text))return reply({error:'활동 내용을 3000자 이내로 적어주세요.'},400);
  if(media&&(media.owner!==b.studentId||media.purpose!=='mission'))return reply({error:'본인이 미션 제출용으로 올린 파일이 필요합니다.'},403);
  const legacy=!media&&/^data:image\/(jpeg|png|webp);base64,/.test(image)&&image.length<=2600000;if(m.type!=='text'&&!media&&!legacy)return reply({error:'사진 또는 동영상을 첨부해주세요.'},400);
  const sub={id:m.id,team,members,author:b.studentId,text,recipient:state.letters[b.studentId]||null,mediaId:media?.id||null,hasPhoto:!!legacy,time:Date.now()};if(legacy)await store.set('photo/'+m.id+'/'+team,image,{onlyIfNew:true});
  const saved=await store.setJSON(key,sub,{onlyIfNew:true}),final=saved.modified?sub:await store.get(key,{type:'json'});await settle(final);return reply({ok:true,already:!saved.modified,members:final.members});
 }
 if(b.action==='photo'){
  if(!admin&&!logged)return reply({},401);const sub=await store.get('submission/'+b.id+'/'+b.team,{type:'json'});if(!sub||(!admin&&!sub.members.includes(b.studentId)))return reply({},403);return reply({image:await store.get('photo/'+b.id+'/'+b.team)||null});
 }
 if(b.action==='delete-submission'){
  if(!admin)return reply({},403);if(!missions.some(m=>m.id===b.id)||!/^(s\d{2}|group\d+|grade[123])$/.test(b.team||''))return reply({},400);const key='submission/'+b.id+'/'+b.team,sub=await store.get(key,{type:'json'});if(sub?.mediaId)await deleteMedia(sub.mediaId);await store.delete(key);await store.delete('photo/'+b.id+'/'+b.team);return reply({ok:true});
 }
 if(b.action==='submissions'&&!admin&&!logged)return reply({error:'학생 로그인 또는 관리자 인증 후 제출물을 볼 수 있습니다.'},401);
 const result=[],items=[];for(const m of missions){const state=await store.get('state/'+m.id,{type:'json'});if(!admin&&b.action!=='submissions'&&state?.status!=='open')continue;const subs=[];
  if(admin||logged){const {blobs}=await store.list({prefix:'submission/'+m.id+'/'});for(const x of blobs){const sub=await store.get(x.key,{type:'json'});if(sub&&(admin||sub.members.includes(b.studentId)))subs.push({...sub,title:m.title,place:m.place,media:publicMedia(await mediaFor(sub.mediaId))});}}
  items.push(...subs);result.push({...m,status:state?.status||'waiting',version:state?.version||state?.startedAt||0,eligible:!!logged&&!!state?.attendees.includes(b.studentId)&&(!['senior','letter'].includes(m.scope)||students.find(s=>s.id===b.studentId)?.grade===3),recipient:logged?state?.letters[b.studentId]:undefined,done:subs.some(s=>s.members.includes(b.studentId)),...(admin?{submissions:subs}:{})});
 }return reply(b.action==='submissions'?{ok:true,items:items.sort((a,b)=>b.time-a.time)}:{ok:true,missions:result});
}catch(e){console.error(e.message);return reply({error:'미션 처리 오류입니다. 다시 제출하면 중복 없이 확인합니다.'},503)}};
