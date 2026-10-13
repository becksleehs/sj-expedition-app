(()=>{
 const END='/.netlify/functions/media';
 const sizeLabel=bytes=>`${(bytes/1024/1024).toFixed(1)}MB`;
 function credentials(){const s=SJ.load();return SJ.getRole()==='student'?{studentId:s.studentId,token:s.authToken}:{};}
 async function request(body){const r=await fetch(END,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(body)}),d=await r.json().catch(()=>({}));if(!r.ok)throw Error(d.error||'연결 실패. 다시 시도해주세요.');return d;}
 async function createJob(file,{onProgress=()=>{},maxDuration=180}={}){
  if(!file)throw Error('파일을 선택해주세요.');let blob=file,mime=file.type,duration=0,kind='photo';
  const url=URL.createObjectURL(file);let session=null;
  try{
   if(mime.startsWith('video/')||/\.(mp4|mov|webm|m4v|3gp)$/i.test(file.name)){
    kind='video';mime=mime||(/\.webm$/i.test(file.name)?'video/webm':/\.mov$/i.test(file.name)?'video/quicktime':'video/mp4');
    const originalSupported=['video/mp4','video/quicktime','video/webm'].includes(mime);
    if(file.size>1024*1024*1024)throw Error('원본 영상이 1GB를 넘습니다. 갤러리에서 필요한 부분만 잘라주세요.');
    session=window.SJVideoCompression?.prime?.();
    const v=document.createElement('video');v.preload='metadata';try{duration=await new Promise((resolve,reject)=>{const t=setTimeout(()=>reject(Error('영상 길이를 읽지 못했습니다. MP4로 저장해주세요.')),15000);v.onloadedmetadata=()=>{clearTimeout(t);resolve(v.duration);};v.onerror=()=>{clearTimeout(t);reject(Error('읽을 수 없는 영상입니다. MP4로 저장해주세요.'));};v.src=url;});}finally{v.removeAttribute('src');v.load();}
    if(!Number.isFinite(duration)||duration<=0||duration>Math.min(maxDuration,180)+.5)throw Error(maxDuration<180?`이 미션 영상은 ${maxDuration}초 이내여야 합니다. 갤러리에서 필요한 부분만 잘라주세요.`:'영상은 3분 이내여야 합니다. 갤러리에서 필요한 부분만 잘라주세요.');
    // Prepare every video before upload. A small original remains usable when a phone
    // cannot transcode it; large originals must really shrink to meet the server limit.
    try{
     if(!window.SJVideoCompression?.compress)throw Error('영상 자동 압축 기능을 불러오지 못했습니다.');
     const compressed=await window.SJVideoCompression.compress(file,{duration,onProgress,session});
     blob=compressed.blob;mime=compressed.mime;
    }catch(e){
     if(file.size>150*1024*1024||!originalSupported)throw Error(`이 영상을 휴대전화에서 지원 형식·크기로 줄이지 못했습니다. ${e.message}`);
     onProgress(`영상 자동 압축을 완료하지 못해 ${sizeLabel(file.size)} 원본으로 제출합니다.`);
    }
   }else{
    if(!mime.startsWith('image/'))throw Error('사진 또는 동영상을 선택해주세요.');onProgress('사진을 자동 변환하는 중…');const im=new Image();im.src=url;try{await im.decode();}catch{throw Error('이 사진 형식을 읽지 못했습니다. 갤러리에서 JPEG로 저장한 뒤 다시 선택해주세요.');}if(!im.naturalWidth||!im.naturalHeight)throw Error('사진을 읽지 못했습니다. 다른 사진을 선택해주세요.');const c=document.createElement('canvas'),ctx=c.getContext('2d');if(!ctx)throw Error('사진 변환을 지원하지 않는 브라우저입니다.');for(const [side,quality] of [[1600,.82],[1280,.72],[960,.62]]){const scale=Math.min(1,side/Math.max(im.naturalWidth,im.naturalHeight));c.width=Math.max(1,Math.round(im.naturalWidth*scale));c.height=Math.max(1,Math.round(im.naturalHeight*scale));ctx.fillStyle='#fff';ctx.fillRect(0,0,c.width,c.height);ctx.drawImage(im,0,0,c.width,c.height);blob=await new Promise(r=>c.toBlob(r,'image/jpeg',quality));if(blob?.size&&blob.size<=4*1024*1024)break;}mime='image/jpeg';if(!blob||blob.size>4*1024*1024)throw Error('사진을 자동으로 줄여도 용량이 큽니다. 다른 사진을 선택해주세요.');
   }
  }finally{if(session?.audio&&session.audio.state!=='closed')await session.audio.close().catch(()=>{});URL.revokeObjectURL(url);}
  return {prepared:{blob,mime,duration,kind,name:file.name},id:null,next:0,ready:null};
 }
 async function upload(job,{teacherPin,purpose='album',caption='',onProgress=()=>{}}={}){
  if(job.ready)return job.ready;const auth=teacherPin?{teacherPin}:credentials();if(!teacherPin&&(!auth.studentId||!auth.token))throw Error('학생 로그인 또는 관리자 인증이 필요합니다.');const p=job.prepared;
  if(!job.id){const init=await request({...auth,action:'init',size:p.blob.size,mime:p.mime,duration:p.duration,purpose,caption,originalName:p.name});Object.assign(job,{id:init.id,chunks:init.chunks,chunkSize:init.chunkSize});}
  for(let i=job.next;i<job.chunks;i++){let ok=false,error;for(let attempt=0;attempt<3;attempt++){try{const headers=teacherPin?{'x-teacher-pin':teacherPin}:{'x-student-id':auth.studentId,'x-student-token':auth.token};const r=await fetch(`${END}?action=chunk&id=${job.id}&index=${i}`,{method:'PUT',headers:{...headers,'content-type':'application/octet-stream'},body:p.blob.slice(i*job.chunkSize,(i+1)*job.chunkSize)});if(!r.ok){const d=await r.json().catch(()=>({}));throw Error(d.error||'전송 실패');}ok=true;break;}catch(e){error=e;if(attempt<2)await new Promise(r=>setTimeout(r,600*(attempt+1)));}}if(!ok)throw Error(error.message+' 같은 화면에서 다시 누르면 이어서 전송합니다.');job.next=i+1;onProgress(Math.round(job.next/job.chunks*95));}
  const d=await request({...auth,action:'complete',id:job.id});job.ready=d.media;onProgress(100);return d.media;
 }
 function show(box,m){box.replaceChildren();if(!m)return;const e=document.createElement(m.kind==='video'?'video':'img');e.src=m.url;e.className='expedition-media';if(m.kind==='video'){e.controls=true;e.playsInline=true;e.preload='none';}else{e.alt='원정 사진';e.loading='lazy';}box.append(e);}
 window.SJMedia={credentials,createJob,upload,show,sizeLabel};
})();
