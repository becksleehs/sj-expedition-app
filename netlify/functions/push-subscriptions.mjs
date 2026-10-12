import {student} from './lib/mission-auth.mjs';
import {pushStore,subscriptionKey,validSubscription,vapidKeys} from './lib/push-service.mjs';
const reply=(data,status=200)=>Response.json(data,{status,headers:{'cache-control':'no-store'}});
export default async req=>{try{
  if(req.method==='GET')return reply({publicKey:(await vapidKeys()).publicKey});
  if(req.method!=='POST')return reply({error:'method'},405);
  let b;try{b=await req.json()}catch{return reply({error:'입력 오류'},400)}
  if(!await student(b.studentId,b.token))return reply({error:'학생 로그인이 필요합니다.'},401);
  if(!validSubscription(b.subscription))return reply({error:'유효한 기기 알림 등록 정보가 아닙니다.'},400);
  const store=pushStore(),key=subscriptionKey(b.subscription.endpoint),saved=await store.get(key,{type:'json'});
  if(b.action==='unsubscribe'){
    if(saved?.studentId===b.studentId)await store.delete(key);
    return reply({ok:true});
  }
  if(b.action!=='subscribe')return reply({error:'요청 오류'},400);
  await store.setJSON(key,{studentId:b.studentId,subscription:b.subscription,updatedAt:Date.now()});
  return reply({ok:true});
}catch(error){console.error('push subscription failed',error?.message);return reply({error:'알림 등록 서버에 연결하지 못했습니다.'},503)}};
