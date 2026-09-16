import {getStore} from '@netlify/blobs';
export async function changeProgress(id,change){
 const store=getStore({name:'sj-expedition-progress',consistency:'strong'}),key='progress/'+id;
 for(let i=0;i<12;i++){
  const entry=await store.getWithMetadata(key,{type:'json',consistency:'strong'}),old=entry?.data||{};
  let rewards=old.rewardIds||[];
  if(old.schema!==318){const {blobs}=await store.list({prefix:`reward/${id}/`});rewards=[...new Set([...rewards,...blobs.map(x=>x.key.split('/').pop())])];}
  const p={...old,schema:318,xp:Math.max(0,Math.round(Number(old.xp)||0)),growthLevel:Math.max(1,Math.min(5,Math.floor(Number(old.growthLevel)||1))),rewardIds:rewards};
  const result=change(p);p.updatedAt=Date.now();const r=await store.setJSON(key,p,entry?{onlyIfMatch:entry.etag}:{onlyIfNew:true});
  if(r.modified)return {progress:p,result};
 }
 throw Error('경험치 동기화 중입니다. 다시 시도해주세요.');
}
export const award=(id,key,amount)=>changeProgress(id,p=>{if(p.rewardIds.includes(key))return false;p.rewardIds.push(key);p.xp+=amount;return true;});
export const settle=sub=>Promise.all(sub.members.map(id=>award(id,'field_'+sub.id,20)));
export async function syncMissions(id){
 const store=getStore({name:'sj-expedition-field-missions',consistency:'strong'}),{blobs}=await store.list({prefix:'submission/'}),keys=[];
 for(const b of blobs){const sub=await store.get(b.key,{type:'json'});if(sub?.members?.includes(id))keys.push('field_'+sub.id);}
 return changeProgress(id,p=>{for(const key of keys)if(!p.rewardIds.includes(key)){p.rewardIds.push(key);p.xp+=20;}});
}
export const publicProgress=p=>({xp:p.xp,growthLevel:p.growthLevel,updatedAt:p.updatedAt});
