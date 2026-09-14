(function(){
  const box=document.getElementById('noticeList');
  const esc=s=>String(s||'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const status=document.createElement('p');status.className='notice-status';status.setAttribute('role','status');box.before(status);
  const known=new Map();let busy=false;
  async function refresh(){if(busy)return;busy=true;try{
    const r=await fetch('/.netlify/functions/notices',{cache:'no-store'});if(!r.ok)throw Error();const d=await r.json();
    const ids=new Set((d.notices||[]).map(n=>n.id||`${n.time}-${n.title}`));for(const [id,item] of known){if(!ids.has(id)){item.el.remove();known.delete(id)}}
    for(const n of d.notices||[]){const id=n.id||`${n.time}-${n.title}`;if(known.has(id))continue;
      const el=document.createElement('article');el.className='subpage-card-v27 notice-item';el.innerHTML=`<time>${n.system?'원정대 소식':'선생님 공지'} · ${new Date(n.time).toLocaleString('ko-KR')}</time><h2>${esc(n.title)}</h2><p>${esc(n.body)}</p>`;known.set(id,{el,time:Number(n.time)});}
    [...known.values()].sort((a,b)=>b.time-a.time).forEach((n,i)=>{if(box.children[i]!==n.el)box.insertBefore(n.el,box.children[i]||null)});
    status.textContent=known.size?`공지 ${known.size}개 · 최신 글부터 표시됩니다.`:'아직 등록된 공지가 없습니다.';
  }catch{status.textContent='공지를 불러오지 못했습니다. 잠시 후 다시 확인합니다.'}finally{busy=false}}
  refresh();setInterval(()=>{if(!document.hidden)refresh()},10000);document.addEventListener('visibilitychange',()=>{if(!document.hidden)refresh()});
})();
