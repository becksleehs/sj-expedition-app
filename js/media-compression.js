/* Browser-native, real-time video preparation. The original file is never changed. */
(()=>{
 const LIMIT=150*1024*1024;
 const help='갤러리에서 필요한 부분만 자르거나 저용량·720p로 저장한 뒤 다시 선택해주세요.';
 const mb=n=>`${(n/1024/1024).toFixed(1)}MB`;
 function outputType(){
  if(typeof MediaRecorder==='undefined'||typeof MediaRecorder.isTypeSupported!=='function')return null;
  return ['video/mp4;codecs=avc1.42E01E,mp4a.40.2','video/mp4','video/webm;codecs=vp8,opus','video/webm']
   .find(type=>MediaRecorder.isTypeSupported(type))||null;
 }
 // Start the audio engine during the student's tap, before video metadata awaits.
 function prime(){
  const Audio=window.AudioContext||window.webkitAudioContext;
  if(!Audio)return null;
  try{const audio=new Audio();return {audio,started:audio.resume().catch(()=>{})};}catch{return null;}
 }
 async function compress(file,{duration,onProgress=()=>{},session}={}){
  const type=outputType(),Audio=window.AudioContext||window.webkitAudioContext;
  if(!type||!Audio||typeof HTMLCanvasElement==='undefined'||!HTMLCanvasElement.prototype.captureStream||typeof MediaStream==='undefined')
   throw Error('이 휴대전화에서는 영상 자동 압축을 지원하지 않습니다. '+help);
  const url=URL.createObjectURL(file),video=document.createElement('video');
  const canvas=document.createElement('canvas'),ctx=canvas.getContext('2d',{alpha:false});
  if(!ctx){URL.revokeObjectURL(url);throw Error('영상 자동 압축을 지원하지 않는 브라우저입니다. '+help);}
  let audio,stream,recorder,frame=0,check=0,timeout=0,wake,problem=null;
  const stop=()=>{if(recorder&&recorder.state!=='inactive')recorder.stop();};
  const hidden=()=>{if(document.hidden){problem=Error('화면이 꺼져 영상 압축이 중단되었습니다. 다시 시도해주세요.');stop();}};
  try{
   video.preload='auto';video.playsInline=true;
   video.style.cssText='position:fixed;left:0;bottom:0;width:1px;height:1px;opacity:.01;pointer-events:none;z-index:-1';
   document.body.append(video);
   const details=await new Promise((resolve,reject)=>{
    timeout=setTimeout(()=>reject(Error('영상을 읽지 못했습니다.')),15000);
    video.onloadedmetadata=()=>{clearTimeout(timeout);resolve({width:video.videoWidth,height:video.videoHeight});};
    video.onerror=()=>{clearTimeout(timeout);reject(Error('이 영상 형식을 읽지 못했습니다.'));};
    video.src=url;
   });
   if(!details.width||!details.height)throw Error('영상 화면을 읽지 못했습니다.');
   const scale=Math.min(1,1280/Math.max(details.width,details.height));
   canvas.width=Math.max(2,Math.round(details.width*scale/2)*2);
   canvas.height=Math.max(2,Math.round(details.height*scale/2)*2);
   audio=session?.audio||new Audio();
   const source=audio.createMediaElementSource(video),destination=audio.createMediaStreamDestination();
   source.connect(destination); // Do not play the sound over the phone speaker.
   await Promise.race([session?.started||audio.resume(),new Promise((_,reject)=>{timeout=setTimeout(()=>reject(Error('오디오 시작 오류')),5000);})]);
   clearTimeout(timeout);
   if(audio.state!=='running')throw Error('소리 트랙을 준비하지 못했습니다.');
   const picture=canvas.captureStream(24);
   stream=new MediaStream([...picture.getVideoTracks(),...destination.stream.getAudioTracks()]);
   if(stream.getVideoTracks().length!==1||stream.getAudioTracks().length!==1)throw Error('소리를 포함한 영상을 만들지 못했습니다.');
   recorder=new MediaRecorder(stream,{mimeType:type,videoBitsPerSecond:2200000,audioBitsPerSecond:96000});
   const parts=[];
   const finished=new Promise((resolve,reject)=>{
    recorder.ondataavailable=e=>{if(e.data?.size)parts.push(e.data);};
    recorder.onerror=e=>reject(e.error||Error('영상 인코딩 오류'));
    recorder.onstop=()=>resolve(new Blob(parts,{type:recorder.mimeType.split(';')[0]}));
   });
   document.addEventListener('visibilitychange',hidden);
   video.addEventListener('ended',stop,{once:true});
   if(navigator.wakeLock?.request)wake=await navigator.wakeLock.request('screen').catch(()=>null);
   recorder.start(1000);
   const draw=()=>{if(video.readyState>=2)ctx.drawImage(video,0,0,canvas.width,canvas.height);if(!video.ended)frame=requestAnimationFrame(draw);};
   frame=requestAnimationFrame(draw);
   onProgress(`영상 자동 압축 중… 원본 ${mb(file.size)}. 화면을 켜 두세요.`);
   try{await video.play();}catch{throw Error('영상을 자동 재생할 수 없습니다.');}
   let last=0,stalled=0;
   check=setInterval(()=>{
    if(video.ended)return;
    const now=video.currentTime;
    stalled=now<=last+.01?stalled+1:0;last=now;
    onProgress(`영상 자동 압축 중 ${Math.min(99,Math.round(now/duration*100))}% · 화면을 켜 두세요. 영상 길이만큼 걸릴 수 있어요.`);
    if(stalled>=15){problem=Error('영상 변환이 중단되었습니다. 다시 시도해주세요.');stop();}
   },1000);
   const blob=await Promise.race([finished,new Promise((_,reject)=>{timeout=setTimeout(()=>reject(Error('영상 변환 시간이 초과되었습니다.')),Math.ceil(duration*1000)+45000);})]);
   if(problem)throw problem;
   if(video.currentTime<duration-3)throw Error('영상 변환이 끝까지 진행되지 않았습니다.');
   if(!blob.size||blob.size>LIMIT||blob.size>=file.size)throw Error('영상 크기를 충분히 줄이지 못했습니다.');
   const head=new Uint8Array(await blob.slice(0,12).arrayBuffer());
   const valid=blob.type==='video/webm'?head[0]===26&&head[1]===69&&head[2]===223&&head[3]===163:String.fromCharCode(...head.slice(4,8))==='ftyp';
   if(!valid)throw Error('압축된 영상 파일을 확인하지 못했습니다.');
   onProgress(`영상 압축 완료 · ${mb(file.size)} → ${mb(blob.size)}`);
   return {blob,mime:blob.type};
  }catch(e){throw Error(`${e.message||'영상 변환 오류'} ${help}`);}
  finally{
   clearTimeout(timeout);clearInterval(check);cancelAnimationFrame(frame);
   document.removeEventListener('visibilitychange',hidden);video.removeEventListener('ended',stop);
   video.pause();video.removeAttribute('src');video.load();video.remove();
   if(recorder&&recorder.state!=='inactive')recorder.stop();stream?.getTracks().forEach(t=>t.stop());
   await audio?.close().catch(()=>{});await wake?.release().catch(()=>{});URL.revokeObjectURL(url);
  }
 }
 window.SJVideoCompression={compress,prime};
})();
