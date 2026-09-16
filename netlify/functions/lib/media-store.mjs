import {getStore} from '@netlify/blobs';
export const CHUNK=1024*1024,MAX_VIDEO=150*1024*1024,MAX_IMAGE=4*1024*1024;
export const mediaStore=()=>getStore({name:'sj-expedition-media',consistency:'strong'});
export const validId=id=>/^[a-f0-9-]{36}$/.test(id||'');
export const mediaFor=id=>validId(id)?mediaStore().get('ready/'+id,{type:'json'}):Promise.resolve(null);
export const publicMedia=m=>m?{id:m.id,kind:m.kind,mime:m.mime,size:m.size,duration:m.duration,url:`/.netlify/functions/media?action=read&id=${m.id}&key=${m.readKey}`} : null;
export async function deleteMedia(id){if(!validId(id))return;const s=mediaStore(),m=await s.get('upload/'+id,{type:'json'});await s.delete('ready/'+id);if(m)await Promise.all(Array.from({length:m.chunks},(_,i)=>s.delete(`chunk/${id}/${i}`)));await s.delete('upload/'+id);}
