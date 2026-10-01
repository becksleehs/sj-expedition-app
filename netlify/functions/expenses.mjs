import {getStore} from '@netlify/blobs';
import {teacher} from './lib/mission-auth.mjs';
import {expenses} from './lib/expense-data.mjs';
const reply=(d,status=200)=>new Response(JSON.stringify(d),{status,headers:{'content-type':'application/json; charset=utf-8','cache-control':'no-store'}});
export default async req=>{try{
 if(req.method!=='POST')return reply({error:'허용되지 않은 요청입니다.'},405);
 const b=await req.json();if(!teacher(b.teacherPin))return reply({error:'교사 PIN을 확인해주세요.'},403);
 const store=getStore({name:'sj-expedition-expenses',consistency:'strong'});
 if(b.action==='list')return reply({items:await Promise.all(expenses.map(async e=>({...e,...(await store.get('item/'+e.id,{type:'json'})||{done:false,memo:'',revision:0,updatedAt:null,doneAt:null})})))});
 if(b.action!=='update'||!expenses.some(e=>e.id===b.id))return reply({error:'항목을 확인해주세요.'},400);
 if(!Number.isInteger(b.revision)||b.revision<0||(!Object.hasOwn(b,'done')&&!Object.hasOwn(b,'memo'))||Object.hasOwn(b,'done')&&typeof b.done!=='boolean'||Object.hasOwn(b,'memo')&&(typeof b.memo!=='string'||b.memo.length>2000))return reply({error:'메모는 2,000자 이내로 입력해주세요.'},400);
 const key='item/'+b.id,entry=await store.getWithMetadata(key,{type:'json'}),old=entry?.data||{done:false,memo:'',revision:0,updatedAt:null,doneAt:null};
 if(old.revision!==b.revision)return reply({error:'다른 화면에서 변경되었습니다. 최신 기록을 확인한 뒤 다시 저장해주세요.',current:old},409);
 const row={...old,revision:old.revision+1,updatedAt:Date.now()};
 if(Object.hasOwn(b,'done')){row.done=b.done;row.doneAt=b.done?(old.doneAt||Date.now()):null;}if(Object.hasOwn(b,'memo'))row.memo=b.memo;
 const result=await store.setJSON(key,row,entry?{onlyIfMatch:entry.etag}:{onlyIfNew:true});
 if(!result.modified)return reply({error:'동시에 변경되었습니다. 다시 불러온 뒤 저장해주세요.'},409);
 return reply({ok:true,item:row});
 }catch{return reply({error:'저장하지 못했습니다. 연결을 확인하고 다시 시도해주세요.'},503)}};
