const stores=new Map();let revision=0;
export function reset(){stores.clear();revision=0;}
const copy=x=>x instanceof ArrayBuffer?x.slice(0):structuredClone(x);
export function getStore(config){const name=typeof config==='string'?config:config.name;if(!stores.has(name))stores.set(name,new Map());const data=stores.get(name);
 const write=async(key,value,options={})=>{const prev=data.get(key);if(options.onlyIfNew&&prev||options.onlyIfMatch&&prev?.etag!==options.onlyIfMatch)return {modified:false};const etag='"'+(++revision)+'"';data.set(key,{value:copy(value),etag,metadata:options.metadata||{}});return {modified:true,etag};};
 return {get:async(key,opts={})=>{const e=data.get(key);return e?copy(e.value):null;},set:write,setJSON:write,getMetadata:async key=>{const e=data.get(key);return e?{etag:e.etag,metadata:copy(e.metadata)}:null;},getWithMetadata:async key=>{const e=data.get(key);return e?{data:copy(e.value),etag:e.etag,metadata:copy(e.metadata)}:null;},delete:async key=>{data.delete(key);},list:async({prefix=''})=>({blobs:[...data.keys()].filter(k=>k.startsWith(prefix)).map(key=>({key}))})};
}
