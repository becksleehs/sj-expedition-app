(function(){
  const p=SJ.current();
  const list=document.getElementById('chatList'),form=document.getElementById('chatForm'),input=document.getElementById('chatInput'),status=document.getElementById('chatStatus'),newBtn=document.getElementById('newMsgBtn'),emojiBtn=document.getElementById('emojiBtn'),emojiPanel=document.getElementById('emojiPanel'),attachBtn=document.getElementById('chatAttachBtn'),fileInput=document.getElementById('chatFile'),preview=document.getElementById('chatPreview'),photo=document.getElementById('chatPreviewImage'),removeBtn=document.getElementById('chatRemovePhoto'),uploadStatus=document.getElementById('chatUploadStatus');
  const teacherButton=document.getElementById('teacherChatButton'),teacherGate=document.getElementById('teacherChatGate'),teacherInput=document.getElementById('teacherChatPin'),teacherConfirm=document.getElementById('teacherChatConfirm'),teacherCancel=document.getElementById('teacherChatCancel'),teacherError=document.getElementById('teacherChatError');
  let lastSig='',firstLoad=true,job=null,previewUrl=null,selecting=false,teacherPin='',mode=p&&SJ.getRole()==='student'?'student':'guest';
  const pinned=document.createElement('div');pinned.className='chat-pinned';pinned.hidden=true;list.before(pinned);
  const EMOJIS=['😀','😂','🥰','😍','😎','🥳','🤩','👍','👏','🙌','❤️','🔥','🎉','✨','📸','🚢','🏝️','🌊','🐬','🇰🇷','🎯','🏅','✅','💙'];
  if(emojiPanel){emojiPanel.innerHTML=EMOJIS.map(e=>`<button type="button">${e}</button>`).join('');emojiPanel.querySelectorAll('button').forEach(b=>b.onclick=()=>{const start=input.selectionStart??input.value.length,end=input.selectionEnd??input.value.length;input.value=input.value.slice(0,start)+b.textContent+input.value.slice(end);input.focus();const pos=start+b.textContent.length;input.setSelectionRange(pos,pos)});emojiBtn.onclick=()=>{emojiPanel.hidden=!emojiPanel.hidden;if(!emojiPanel.hidden)requestAnimationFrame(()=>emojiPanel.scrollIntoView({block:'nearest'}))};document.addEventListener('click',e=>{if(!e.target.closest('#emojiPanel')&&!e.target.closest('#emojiBtn'))emojiPanel.hidden=true});}

  const esc=s=>String(s||'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const nearBottom=()=>list.scrollHeight-list.scrollTop-list.clientHeight<90;
  const goBottom=()=>requestAnimationFrame(()=>{list.scrollTop=list.scrollHeight;newBtn.hidden=true});
  function render(messages){
    const stay=nearBottom();
    list.replaceChildren();
    for(const m of messages){
      const row=document.createElement('div');row.className='chat-row-v34'+((mode==='teacher'&&m.student==='선생님')||(mode==='student'&&m.studentId===p?.id)?' me':'');
      const bubble=document.createElement('div');bubble.className='chat-bubble-v34';
      const name=document.createElement('div');name.className='chat-name-v34';name.textContent=(m.student||'작성자 확인 중')+(m.grade?' · '+m.grade+'학년':'');bubble.append(name);
      if(m.media?.kind==='photo'&&typeof m.media.url==='string'&&m.media.url.startsWith('/.netlify/functions/media?action=read&')){
        const link=document.createElement('a');link.className='chat-photo-link-v332';link.href=m.media.url;link.target='_blank';link.rel='noopener';link.setAttribute('aria-label','사진 크게 보기');
        const img=document.createElement('img');img.src=m.media.url;img.alt=(m.student||'학생')+' 학생이 올린 채팅 사진';img.loading='lazy';link.append(img);bubble.append(link);
      }
      if(m.text){const body=document.createElement('div');body.className='chat-text-v34';body.textContent=m.text;bubble.append(body);}
      const time=document.createElement('time');time.textContent=new Date(m.time).toLocaleTimeString('ko-KR',{hour:'2-digit',minute:'2-digit'});bubble.append(time);row.append(bubble);list.append(row);
    }
    if(firstLoad||stay){goBottom();firstLoad=false}else newBtn.hidden=false;
  }
  async function load(){
    try{const r=await fetch('/.netlify/functions/chat',{cache:'no-store'});if(!r.ok)throw new Error('chat');const data=await r.json();pinned.textContent=data.pinned?'📌 '+data.pinned:'';pinned.hidden=!data.pinned;const arr=data.messages||[];const sig=JSON.stringify(arr);status.textContent=`원정대 단체채팅 · ${arr.length}개 메시지`;if(sig===lastSig)return;lastSig=sig;render(arr);}catch(e){status.textContent='채팅 서버 연결 실패 · 잠시 후 다시 시도해주세요.';}
  }
  function clearPhoto(){job=null;fileInput.value='';preview.hidden=true;uploadStatus.textContent='';if(previewUrl)URL.revokeObjectURL(previewUrl);previewUrl=null;photo.removeAttribute('src');}
  const note=document.createElement('p');note.className='chat-readonly-v342';note.textContent='학생은 로그인 후 글을 쓸 수 있습니다. 교사는 위의 「교사 채팅」에서 PIN을 입력해주세요.';form.before(note);
  function updateAccess(){const enabled=mode!=='guest';form.hidden=!enabled;note.hidden=enabled;attachBtn.hidden=mode==='teacher';teacherButton.textContent=mode==='teacher'?'교사 채팅 종료':'교사 채팅';input.placeholder=mode==='teacher'?'선생님 메시지를 입력하세요':'메시지를 입력하세요';}
  teacherButton.onclick=()=>{if(mode==='teacher'){teacherPin='';mode=p&&SJ.getRole()==='student'?'student':'guest';clearPhoto();updateAccess();lastSig='';load();return;}teacherGate.hidden=false;teacherError.textContent='';teacherInput.focus();};
  teacherCancel.onclick=()=>{teacherGate.hidden=true;teacherInput.value='';teacherError.textContent='';};
  teacherConfirm.onclick=async()=>{const pin=teacherInput.value.trim();if(!/^\d{4}$/.test(pin)){teacherError.textContent='PIN 4자리를 입력하세요.';return;}teacherConfirm.disabled=true;teacherError.textContent='확인 중…';try{const r=await fetch('/.netlify/functions/student-auth',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({action:'teacher-check',teacherPin:pin}),cache:'no-store'});if(!r.ok)throw Error('교사 PIN을 확인해주세요.');teacherPin=pin;mode='teacher';teacherInput.value='';teacherGate.hidden=true;teacherError.textContent='';clearPhoto();updateAccess();input.focus();lastSig='';await load();}catch(e){teacherError.textContent=e.message;}finally{teacherConfirm.disabled=false;}};
  teacherInput.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();teacherConfirm.click();}});
  updateAccess();
  attachBtn.onclick=()=>fileInput.click();removeBtn.onclick=clearPhoto;
  fileInput.addEventListener('change',async()=>{
    const file=fileInput.files?.[0];if(!file)return;clearPhoto();selecting=true;attachBtn.disabled=true;uploadStatus.textContent='사진을 준비하는 중…';preview.hidden=false;
    try{if(!file.type.startsWith('image/'))throw Error('사진 파일을 선택해주세요.');job=await SJMedia.createJob(file,{onProgress:s=>uploadStatus.textContent=s});previewUrl=URL.createObjectURL(job.prepared.blob);photo.src=previewUrl;uploadStatus.textContent=`사진 준비 완료 · ${SJMedia.sizeLabel(job.prepared.blob.size)}`;}
    catch(e){clearPhoto();alert(e.message||'사진을 준비하지 못했습니다.');}
    finally{selecting=false;attachBtn.disabled=false;}
  });
  form.addEventListener('submit',async e=>{
    e.preventDefault();const text=input.value.trim();if((!text&&!job)||selecting||mode==='guest'||(mode==='student'&&(!p||SJ.getRole()!=='student')))return;
    const btn=form.querySelector('button[type="submit"]');input.disabled=true;btn.disabled=true;attachBtn.disabled=true;removeBtn.disabled=true;
    try{
      let mediaId;if(job){uploadStatus.textContent='사진을 올리는 중…';const media=await SJMedia.upload(job,{purpose:'chat',onProgress:n=>uploadStatus.textContent=`사진 업로드 ${n}%`});mediaId=media.id;}
      const credentials=mode==='teacher'?{teacherPin}:{studentId:p.id,token:SJ.load().authToken};
      const r=await fetch('/.netlify/functions/chat',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({...credentials,text,mediaId})});
      if(!r.ok){const d=await r.json().catch(()=>({}));throw Error(d.error||'메시지를 보내지 못했습니다.');}
      input.value='';clearPhoto();await load();goBottom();
    }catch(e){uploadStatus.textContent=job?'전송 실패 · 다시 누르면 이어서 전송합니다.':'';alert(e.message||'메시지를 보내지 못했습니다. 잠시 후 다시 시도해주세요.');}
    finally{input.disabled=false;btn.disabled=false;attachBtn.disabled=false;removeBtn.disabled=false;input.focus();}
  });
  newBtn.onclick=goBottom;list.addEventListener('scroll',()=>{if(nearBottom())newBtn.hidden=true});
load();setInterval(load,3000);window.addEventListener('resize',()=>setTimeout(goBottom,120));
})();
