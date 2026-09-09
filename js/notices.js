(async function(){
  const box=document.getElementById('noticeList');
  const esc=s=>String(s||'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  try{ const r=await fetch('/.netlify/functions/notices',{cache:'no-store'}); if(!r.ok)return; const d=await r.json();
    if((d.notices||[]).length){ box.innerHTML=d.notices.map(n=>`<article class="subpage-card-v27 notice-item"><time>${new Date(n.time).toLocaleString('ko-KR')}</time><h2>${esc(n.title)}</h2><p>${esc(n.body)}</p></article>`).join(''); }
  }catch(e){}
})();
