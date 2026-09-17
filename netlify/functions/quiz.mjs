import {getStore} from '@netlify/blobs';
import {student} from './lib/mission-auth.mjs';
import {changeProgress,publicProgress} from './lib/progress-store.mjs';
import {questions} from './lib/quiz-data.mjs';
const reply=(d,status=200)=>new Response(JSON.stringify(d),{status,headers:{'content-type':'application/json','cache-control':'no-store'}});
export default async req=>{try{
 const b=req.method==='GET'?Object.fromEntries(new URL(req.url).searchParams):req.method==='POST'?await req.json():null;
 if(!b)return reply({},405);
 if(!Object.hasOwn(questions,b.island))return reply({error:'섬을 선택해주세요.'},400);
 const gates=await getStore({name:'sj-expedition-gates',consistency:'strong'}).get('state',{type:'json'});
 if(!gates?.['quiz_'+b.island]?.open)return reply({error:'선생님이 아직 이 퀴즈를 열지 않았어요.',locked:true},403);
 if(!await student(b.studentId,b.token))return reply({error:'학생으로 로그인한 뒤 참여해주세요.'},401);
 const items=questions[b.island];
 if(req.method==='GET'){
  const {progress}=await changeProgress(b.studentId,()=>{});
  return reply({ok:true,items:items.map(({answer,why,...q})=>{const attempt=progress.quizAnswers?.[q.id]||(progress.rewardIds.includes(q.id)?{correct:true,legacy:true,choice:answer}:null);return {...q,attempt:attempt?{...attempt,answer,why}:null};}),progress:publicProgress(progress)});
 }
 const q=items.find(x=>x.id===b.id);
 if(!q||!Number.isInteger(b.choice)||b.choice<0||b.choice>=q.choices.length)return reply({error:'답안을 선택해주세요.'},400);
 const {progress,result}=await changeProgress(b.studentId,p=>{
  p.quizAnswers=p.quizAnswers||{};
  if(p.quizAnswers[q.id])return false;
  if(p.rewardIds.includes(q.id)){p.quizAnswers[q.id]={choice:q.answer,correct:true,legacy:true};return false;}
  const correct=b.choice===q.answer;
  p.quizAnswers[q.id]={choice:b.choice,correct,submittedAt:Date.now()};
  if(correct){p.xp+=10;p.rewardIds.push(q.id);}return true;
 });
 return reply({ok:true,attempt:{...progress.quizAnswers[q.id],answer:q.answer,why:q.why},amount:result&&progress.quizAnswers[q.id].correct?10:0,alreadySubmitted:!result,progress:publicProgress(progress)});
}catch(e){console.error(e.message);return reply({error:'답안을 저장하지 못했습니다. 같은 답으로 다시 시도해주세요.'},503)}};
