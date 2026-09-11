(function(){
  const p=SJ.current();if(!SJ.isRegistered()||!p){location.replace('select-student.html');return;}
  const list=document.getElementById('chatList'),form=document.getElementById('chatForm'),input=document.getElementById('chatInput'),status=document.getElementById('chatStatus'),newBtn=document.getElementById('newMsgBtn'),emojiBtn=document.getElementById('emojiBtn'),emojiPanel=document.getElementById('emojiPanel');
  let lastSig='',firstLoad=true;
  const EMOJIS=['😀','😂','🥰','😍','😎','🥳','🤩','👍','👏','🙌','❤️','🔥','🎉','✨','📸','🚢','🏝️','🌊','🐬','🇰🇷','🎯','🏅','✅','💙'];
  if(emojiPanel){emojiPanel.innerHTML=EMOJIS.map(e=>`<button type="button">${e}</button>`).join('');emojiPanel.querySelectorAll('button').forEach(b=>b.onclick=()=>{const start=input.selectionStart??input.value.length,end=input.selectionEnd??input.value.length;input.value=input.value.slice(0,start)+b.textContent+input.value.slice(end);input.focus();const pos=start+b.textContent.length;input.setSelectionRange(pos,pos)});emojiBtn.onclick=()=>{emojiPanel.hidden=!emojiPanel.hidden;if(!emojiPanel.hidden)requestAnimationFrame(()=>emojiPanel.scrollIntoView({block:'nearest'}))};document.addEventListener('click',e=>{if(!e.target.closest('#emojiPanel')&&!e.target.closest('#emojiBtn'))emojiPanel.hidden=true});}

  const esc=s=>String(s||'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const nearBottom=()=>list.scrollHeight-list.scrollTop-list.clientHeight<90;
  const goBottom=()=>requestAnimationFrame(()=>{list.scrollTop=list.scrollHeight;newBtn.hidden=true});
  function render(messages){
    const stay=nearBottom();
    list.innerHTML=messages.map(m=>`<div class="chat-row-v34 ${m.student===p.name?'me':''}"><div class="chat-bubble-v34"><div class="chat-name-v34">${esc(m.student)}</div><div class="chat-text-v34">${esc(m.text)}</div><time>${new Date(m.time).toLocaleTimeString('ko-KR',{hour:'2-digit',minute:'2-digit'})}</time></div></div>`).join('');
    if(firstLoad||stay){goBottom();firstLoad=false}else newBtn.hidden=false;
  }
  async function load(){
    try{const r=await fetch('/.netlify/functions/chat',{cache:'no-store'});if(!r.ok)throw new Error('chat');const data=await r.json();const arr=data.messages||[];const sig=JSON.stringify(arr);status.textContent=`원정대 단체채팅 · ${arr.length}개 메시지`;if(sig===lastSig)return;lastSig=sig;render(arr);}catch(e){status.textContent='채팅 서버 연결 실패 · 잠시 후 다시 시도해주세요.';}
  }
  form.addEventListener('submit',async e=>{e.preventDefault();const text=input.value.trim();if(!text)return;const btn=form.querySelector('button');input.disabled=true;btn.disabled=true;try{const r=await fetch('/.netlify/functions/chat',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({student:p.name,grade:p.grade,text})});if(!r.ok)throw new Error('send');input.value='';await load();goBottom();}catch(e){alert('메시지를 보내지 못했습니다. 잠시 후 다시 시도해주세요.');}finally{input.disabled=false;btn.disabled=false;input.focus();}});
  newBtn.onclick=goBottom;list.addEventListener('scroll',()=>{if(nearBottom())newBtn.hidden=true});
  load();setInterval(load,3000);window.addEventListener('resize',()=>setTimeout(goBottom,120));
})();
