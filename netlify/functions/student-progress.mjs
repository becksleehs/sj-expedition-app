import {getStore} from '@netlify/blobs';
import {student,teacher} from './lib/mission-auth.mjs';
import {award,changeProgress,syncMissions,publicProgress} from './lib/progress-store.mjs';
const reply=(d,status=200)=>new Response(JSON.stringify(d),{status,headers:{'content-type':'application/json','cache-control':'no-store'}});
const today=()=>new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Seoul',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
const ids=['u1','u2','u3','u4','d1','d2','d3','d4'],quiz=ids.map(x=>'quiz_'+x),history=ids.map(x=>'history_'+x);
export default async req=>{try{
 const b=req.method==='GET'?Object.fromEntries(new URL(req.url).searchParams):req.method==='POST'?await req.json():null;if(!b)return reply({},405);
 const id=b.studentId,store=getStore({name:'sj-expedition-progress',consistency:'strong'});
 if(!/^s(0[1-9]|1[0-3])$/.test(id||''))return reply({error:'학생 정보 오류'},400);
 if(b.action==='teacher-add-xp'){
  if(!teacher(b.teacherPin))return reply({error:'교사 인증 필요'},403);
  const amount=Math.max(-10000,Math.min(10000,Math.round(Number(b.amount)||0)));
  const {progress}=await changeProgress(id,p=>{const key=b.requestId?'teacher_'+String(b.requestId).slice(0,60):null;if(key&&p.rewardIds.includes(key))return;if(key)p.rewardIds.push(key);p.xp=Math.max(0,p.xp+amount);});return reply({ok:true,progress:publicProgress(progress)});
 }
 if(!await student(id,b.token))return reply({error:'학생 로그인이 필요합니다.'},401);
 if(req.method==='GET'){
  const {progress}=await syncMissions(id),{blobs}=await store.list({prefix:`journal/${id}/`}),journals=[];
  for(const b of blobs){const v=await store.get(b.key,{type:'json'});if(v)journals.push(v);}journals.sort((a,b)=>b.date.localeCompare(a.date));return reply({ok:true,progress:publicProgress(progress),rewards:progress.rewardIds,journals});
 }
 if(b.action==='journal-save'){
  const text=String(b.text||'').trim(),lines=text.split(/\r?\n/).filter(x=>x.trim()),date=today();if(lines.length<2||lines.length>3||text.length>600)return reply({error:'2~3줄, 600자 이내로 적어주세요.'},400);
  await store.setJSON(`journal/${id}/${date}`,{date,text,updatedAt:Date.now()});return reply({ok:true,rewardId:'journal_'+date});
 }
 if(b.action==='claim-reward'){
  const key=String(b.rewardId||'');let amount=history.includes(key)?5:quiz.includes(key)?10:0;
  if(/^journal_\d{4}-\d{2}-\d{2}$/.test(key)&&key.slice(8)<=today()&&await store.get(`journal/${id}/${key.slice(8)}`))amount=10;
  if(key.startsWith('field_')){const {progress}=await syncMissions(id);if(!progress.rewardIds.includes(key))return reply({error:'제출 기록이 없습니다.'},400);return reply({ok:true,alreadyClaimed:true,amount:0,progress:publicProgress(progress)});}
  if(key==='quiz_all_bonus'){const {progress}=await changeProgress(id,()=>{});if(!quiz.every(x=>progress.rewardIds.includes(x)))return reply({error:'모든 퀴즈를 먼저 맞혀주세요.'},400);amount=20;}
  if(!amount)return reply({error:'보상 정보 오류'},400);const {progress,result}=await award(id,key,amount);return reply({ok:true,alreadyClaimed:!result,amount:result?amount:0,progress:publicProgress(progress)});
 }
 if(b.action==='save'){
  const {progress}=await changeProgress(id,p=>{const n=Math.max(1,Math.min(5,Math.floor(Number(b.growthLevel)||1)));if(n>p.growthLevel&&p.xp>=[0,100,300,600,1000][n-1])p.growthLevel=n;});return reply({ok:true,progress:publicProgress(progress)});
 }
 return reply({error:'요청 오류'},400);
}catch(e){console.error(e.message);return reply({error:'기록을 처리하지 못했습니다. 다시 시도해주세요.'},503)}};
