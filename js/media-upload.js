(()=>{
 const END='/.netlify/functions/media';
 function credentials(){const s=SJ.load();return SJ.getRole()==='student'?{studentId:s.studentId,token:s.authToken}:{};}
 async function request(body){const r=await fetch(END,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(body)}),d=await r.json().catch(()=>({}));if(!r.ok)throw Error(d.error||'연결 실패. 다시 시도해주세요.');return d;}
 async function createJob(file){
  if(!file)throw Error('파일을 선택해주세요.');let blob=file,mime=file.type,duration=0,kind='photo';
  const url=URL.createObjectURL(file);
  try{
   if(mime.startsWith('video/')||/\.(mp4|mov|webm)$/i.test(file.name)){
    kind='video';if(file.size>150*1024*1024)throw Error('동영상은 150MB 이하로 선택해주세요.');mime=mime||(/\.webm$/i.test(file.name)?'video/webm':/\.mov$/i.test(file.name)?'video/quicktime':'video/mp4');if(!['video/mp4','video/quicktime','video/webm'].includes(mime))throw Error('MP4, MOV, WebM 영상을 선택해주세요.');
    const v=document.createElement('video');v.preload='metadata';try{duration=await new Promise((resolve,reject)=>{const t=setTimeout(()=>reject(Error('영상 길이를 읽지 못했습니다. MP4로 저장해주세요.')),15000);v.onloadedmetadata=()=>{clearTimeout(t);resolve(v.duration);};v.onerror=()=>{clearTimeout(t);reject(Error('읽을 수 없는 영상입니다. MP4로 저장해주세요.'));};v.src=url;});}finally{v.removeAttribute('src');v.load();}
    if(!Number.isFinite(duration)||duration<=0||duration>180.5)throw Error('동영상은 3분 이내로 선택해주세요.');
   }else{
    if(!mime.startsWith('image/'))throw Error('사진 또는 동영상을 선택해주세요.');const im=new Image();im.src=url;await im.decode();const scale=Math.min(1,1600/Math.max(im.width,im.height)),c=document.createElement('canvas');c.width=Math.round(im.width*scale);c.height=Math.round(im.height*scale);c.getContext('2d').drawImage(im,0,0,c.width,c.height);blob=await new Promise(r=>c.toBlob(r,'image/jpeg',.82));mime='image/jpeg';if(!blob||blob.size>4*1024*1024)throw Error('사진을 더 작게 저장해주세요.');
   }
  }finally{URL.revokeObjectURL(url);}
  return {prepared:{blob,mime,duration,kind,name:file.name},id:null,next:0,ready:null};
 }
 async function upload(job,{teacherPin,purpose='album',caption='',onProgress=()=>{}}={}){
  if(job.ready)return job.ready;const auth=teacherPin?{teacherPin}:credentials();if(!teacherPin&&(!auth.studentId||!auth.token))throw Error('학생 로그인 또는 관리자 인증이 필요합니다.');const p=job.prepared;
  if(!job.id){const init=await request({...auth,action:'init',size:p.blob.size,mime:p.mime,duration:p.duration,purpose,caption,originalName:p.name});Object.assign(job,{id:init.id,chunks:init.chunks,chunkSize:init.chunkSize});}
  for(let i=job.next;i<job.chunks;i++){let ok=false,error;for(let attempt=0;attempt<3;attempt++){try{const headers=teacherPin?{'x-teacher-pin':teacherPin}:{'x-student-id':auth.studentId,'x-student-token':auth.token};const r=await fetch(`${END}?action=chunk&id=${job.id}&index=${i}`,{method:'PUT',headers:{...headers,'content-type':'application/octet-stream'},body:p.blob.slice(i*job.chunkSize,(i+1)*job.chunkSize)});if(!r.ok){const d=await r.json().catch(()=>({}));throw Error(d.error||'전송 실패');}ok=true;break;}catch(e){error=e;if(attempt<2)await new Promise(r=>setTimeout(r,600*(attempt+1)));}}if(!ok)throw Error(error.message+' 같은 화면에서 다시 누르면 이어서 전송합니다.');job.next=i+1;onProgress(Math.round(job.next/job.chunks*95));}
  const d=await request({...auth,action:'complete',id:job.id});job.ready=d.media;onProgress(100);return d.media;
 }
 function show(box,m){box.replaceChildren();if(!m)return;const e=document.createElement(m.kind==='video'?'video':'img');e.src=m.url;e.className='expedition-media';if(m.kind==='video'){e.controls=true;e.playsInline=true;e.preload='none';}else{e.alt='원정 사진';e.loading='lazy';}box.append(e);}
 window.SJMedia={credentials,createJob,upload,show};
})();
