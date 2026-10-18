(()=>{
 const grid=document.getElementById('albumGrid'),file=document.getElementById('albumFile'),pick=document.getElementById('albumPick'),upload=document.getElementById('albumUpload'),caption=document.getElementById('albumCaption'),preview=document.getElementById('albumPreview'),status=document.getElementById('albumStatus');
 let folder=new URLSearchParams(location.search).get('folder')||'photos',job=null,busy=false,loadRevision=0;const tabs=document.querySelectorAll('[data-folder]'),name=id=>id==='teacher'?'선생님':SJ.students.find(s=>s.id===id)?.name||'학생';
 const text=(tag,value)=>{const e=document.createElement(tag);e.textContent=value;return e;};
 function studentLoggedIn(){return SJ.getRole()==='student'&&!!SJ.current()&&!!SJ.load().authToken;}
 function updateAccess(){document.getElementById('albumUploadPanel').hidden=folder==='missions'||!studentLoggedIn();}
 async function load(){const revision=++loadRevision,currentFolder=folder;tabs.forEach(b=>b.setAttribute('aria-selected',b.dataset.folder===currentFolder));updateAccess();grid.replaceChildren();try{
  const missionRequest=fetch('/.netlify/functions/field-missions?action=public-submissions',{cache:'no-store'});
  const albumRequest=currentFolder==='missions'?null:fetch('/.netlify/functions/album',{cache:'no-store'});
  const [missionResponse,albumResponse]=await Promise.all([missionRequest,albumRequest]);
  const missions=await missionResponse.json(),album=albumResponse?await albumResponse.json():null;
  if(revision!==loadRevision)return;
  if(!missionResponse.ok)throw Error(missions.error||'미션 사진·영상을 불러오지 못했습니다.');
  if(albumResponse&&!albumResponse.ok)throw Error(album.error||'앨범 목록을 불러오지 못했습니다.');
  const missionItems=(missions.items||[]).map(x=>({...x,source:'mission',kind:x.media?.kind||'photo'}));
  const normalItems=(album?.items||[]).map(x=>({...x,source:'album'}));
  const items=(currentFolder==='missions'?missionItems:[...normalItems,...missionItems].filter(x=>x.kind===(currentFolder==='videos'?'video':'photo'))).sort((a,b)=>(b.time||b.uploadedAt||0)-(a.time||a.uploadedAt||0));
  if(!items.length){grid.textContent=currentFolder==='missions'?'아직 공개된 미션 사진·영상이 없습니다.':'아직 업로드된 사진·영상이 없습니다.';return;}
  for(const x of items){if(revision!==loadRevision)return;const isMission=x.source==='mission',card=document.createElement('article');card.className='album-item-v38'+(currentFolder==='missions'?' submission-card':'');const box=document.createElement('div');if(x.media)SJMedia.show(box,x.media);else if(isMission&&x.hasPhoto){const r=await fetch('/.netlify/functions/field-missions',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({action:'public-photo',id:x.id,team:x.team})}),d=await r.json();if(revision!==loadRevision)return;if(d.image)SJMedia.show(box,{kind:'photo',url:d.image});else box.textContent='사진을 불러오지 못했습니다.';}else if(!isMission)SJMedia.show(box,{kind:'photo',url:'/.netlify/functions/album?id='+x.id});card.append(box);
   const author=text('strong',(isMission?'작성자: ':'올린 사람: ')+name(isMission?x.author:x.studentId));author.className='album-author-v337';if(isMission){card.append(text('h3',x.title),author);if(x.text){const p=text('p',x.text);p.className='submission-text';card.append(p);}card.append(text('p','참여: '+x.members.map(name).join(', ')+(x.xp>0?' · 각 +'+x.xp+' XP':' · 경험치 없음')));}else{card.append(author);if(x.caption)card.append(text('p',x.caption));}card.append(text('small',(isMission?x.place:'원정 앨범')+' · '+new Date(x.time||x.uploadedAt).toLocaleString('ko-KR')));grid.append(card);}
 }catch(e){if(revision===loadRevision)grid.textContent=e.message;}}
 tabs.forEach(b=>b.onclick=()=>{if(busy)return;folder=b.dataset.folder;load();});pick.onclick=()=>{if(!studentLoggedIn()){status.textContent='앨범 업로드는 학생 계정에서 할 수 있습니다. 교사는 관리자 화면에서 등록해주세요.';return;}file.accept=folder==='videos'?'video/*':'image/*';file.click();};
 file.onchange=async()=>{if(!file.files[0]||busy)return;busy=true;job=null;pick.disabled=true;upload.disabled=true;try{job=await SJMedia.createJob(file.files[0],{onProgress:message=>status.textContent=message});if(preview.dataset.url)URL.revokeObjectURL(preview.dataset.url);const url=URL.createObjectURL(job.prepared.blob);preview.dataset.url=url;preview.hidden=false;SJMedia.show(preview,{kind:job.prepared.kind,url});status.textContent=`파일 준비 완료 · ${SJMedia.sizeLabel(job.prepared.blob.size)}. 업로드를 눌러주세요.`;upload.disabled=false;}catch(e){status.textContent=e.message;file.value='';preview.hidden=true;}finally{busy=false;pick.disabled=false;}};
 upload.onclick=async()=>{if(!job||busy)return;busy=true;pick.disabled=upload.disabled=caption.disabled=true;try{await SJMedia.upload(job,{caption:caption.value,onProgress:n=>status.textContent=`업로드 ${n}% · 화면을 열어 두세요.`});folder=job.prepared.kind==='video'?'videos':'photos';job=null;file.value=caption.value='';preview.hidden=true;status.textContent='업로드 완료! 일반 앨범에는 경험치가 지급되지 않습니다.';await load();}catch(e){status.textContent=e.message;}finally{busy=false;pick.disabled=caption.disabled=false;upload.disabled=!job;upload.textContent=job?'업로드 다시 시도':'업로드';}};
 window.addEventListener('beforeunload',e=>{if(busy){e.preventDefault();e.returnValue='';}});load();
})();
