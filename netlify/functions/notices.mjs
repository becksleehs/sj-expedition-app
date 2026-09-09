import { getStore } from '@netlify/blobs';
const headers={'content-type':'application/json; charset=utf-8','cache-control':'no-store'};
export default async (req)=>{
  const store=getStore({name:'sj-expedition-notices',consistency:'strong'});
  if(req.method==='GET'){
    const {blobs}=await store.list({prefix:'notice/'}); const keys=blobs.map(b=>b.key).sort().reverse().slice(0,20); const notices=[];
    for(const key of keys){const v=await store.get(key,{type:'json',consistency:'strong'});if(v)notices.push(v)}
    return new Response(JSON.stringify({notices}),{headers});
  }
  return new Response(JSON.stringify({error:'method'}),{status:405,headers});
};
