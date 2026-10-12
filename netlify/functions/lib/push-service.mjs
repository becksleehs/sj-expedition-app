import {createHash} from 'node:crypto';
import {getStore} from '@netlify/blobs';
import webpush from 'web-push';

const subscriptions=()=>getStore({name:'sj-expedition-push',consistency:'strong'});
const keyStore=()=>getStore({name:'sj-expedition-push-keys',consistency:'strong'});
export const allStudentIds=Array.from({length:13},(_,i)=>'s'+String(i+1).padStart(2,'0'));
export const subscriptionKey=endpoint=>'subscription/'+createHash('sha256').update(endpoint).digest('hex');

export function validSubscription(value){
  if(!value||typeof value!=='object'||typeof value.endpoint!=='string'||value.endpoint.length>2048)return false;
  let url;try{url=new URL(value.endpoint)}catch{return false}
  const host=url.hostname.toLowerCase();
  const allowed=host==='fcm.googleapis.com'||host==='updates.push.services.mozilla.com'||host==='web.push.apple.com'||host.endsWith('.push.apple.com')||host.endsWith('.notify.windows.com');
  return url.protocol==='https:'&&!url.username&&!url.password&&allowed&&typeof value.keys?.p256dh==='string'&&/^[A-Za-z0-9_-]{60,200}$/.test(value.keys.p256dh)&&typeof value.keys?.auth==='string'&&/^[A-Za-z0-9_-]{16,100}$/.test(value.keys.auth);
}

export async function vapidKeys(){
  const store=keyStore(),name='vapid/v1';
  let keys=await store.get(name,{type:'json'});
  if(!keys){await store.setJSON(name,webpush.generateVAPIDKeys(),{onlyIfNew:true});keys=await store.get(name,{type:'json'});}
  if(!keys?.publicKey||!keys?.privateKey)throw Error('푸시 키 저장 실패');
  return keys;
}

export async function broadcastPush({title,body,url,tag,studentIds},requestUrl){
  const store=subscriptions(),{blobs}=await store.list({prefix:'subscription/'}),target=new Set(studentIds||[]);
  if(!blobs.length||!target.size)return;
  const keys=await vapidKeys(),origin=process.env.URL||new URL(requestUrl).origin;
  const subject=origin.startsWith('https://')?origin:'https://becksleehs.github.io';
  const payload=JSON.stringify({title,body,url,tag});
  await Promise.all(blobs.map(async ({key})=>{
    try{
      const entry=await store.get(key,{type:'json'});
      if(!entry||!target.has(entry.studentId)||!validSubscription(entry.subscription))return;
      await webpush.sendNotification(entry.subscription,payload,{vapidDetails:{subject,publicKey:keys.publicKey,privateKey:keys.privateKey},TTL:3600,timeout:5000});
    }catch(error){
      if([404,410].includes(error?.statusCode))await store.delete(key);
      else console.error('push delivery failed',error?.statusCode||error?.code||'unknown');
    }
  }));
}

export const pushStore=subscriptions;
