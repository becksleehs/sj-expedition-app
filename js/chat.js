(function(){
  const p=SJ.current(); if(!SJ.isRegistered()||!p){ location.replace('select-student.html'); return; }
  const list=document.getElementById('chatList'), form=document.getElementById('chatForm'), input=document.getElementById('chatInput'), status=document.getElementById('chatStatus');
  let lastSig='';
  const esc=s=>String(s||'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  async function load(){
    try{
      const r=await fetch('/.netlify/functions/chat',{cache:'no-store'}); if(!r.ok) throw new Error('chat');
      const data=await r.json(); const sig=JSON.stringify(data.messages||[]); if(sig===lastSig) return; lastSig=sig;
      list.innerHTML=(data.messages||[]).map(m=>`<div class="msg ${m.student===p.name?'me':''}"><div class="meta">${esc(m.student)} · ${new Date(m.time).toLocaleTimeString('ko-KR',{hour:'2-digit',minute:'2-digit'})}</div><div class="body">${esc(m.text)}</div></div>`).join('');
      list.scrollTop=list.scrollHeight; status.textContent='온라인 채팅 · 최근 메시지 '+(data.messages||[]).length+'개';
    }catch(e){ status.textContent='채팅 서버 연결 실패 · Netlify Functions 배포를 확인해주세요.'; }
  }
  form.addEventListener('submit',async e=>{e.preventDefault(); const text=input.value.trim(); if(!text) return; input.disabled=true;
    try{ const r=await fetch('/.netlify/functions/chat',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({student:p.name,grade:p.grade,text})}); if(!r.ok) throw new Error('send'); input.value=''; await load(); }
    catch(e){ alert('메시지를 보내지 못했습니다. 잠시 후 다시 시도해주세요.'); } finally{ input.disabled=false; input.focus(); }
  });
  load(); setInterval(load,4000);
})();
