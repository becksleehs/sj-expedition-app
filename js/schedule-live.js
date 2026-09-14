(()=>{
 const clock=document.createElement('p');document.querySelector('.schedule-head-v35').append(clock);
 const base=Date.parse('2026-10-14T00:00:00+09:00'),minute=60000,day=86400000,rows=[];
 document.querySelectorAll('.day-panel-v35').forEach((panel,i)=>{
   const entries=[...panel.querySelectorAll('.timeline-v35>div')];let priorEnd=0;
   entries.forEach((el,j)=>{const raw=el.querySelector('time').textContent,parts=raw.split('~'),parse=s=>{const m=s.match(/(\d{2}):(\d{2})/);return m?Number(m[1])*60+Number(m[2]):null};
     const start=parse(parts[0])??priorEnd;let end=parse(parts[1]||'');
     if(end===null){const next=entries[j+1]?.querySelector('time').textContent||'';end=parse(next)??(raw.includes('~')?1440:start+1)}
     if(end<=start)end+=1440;priorEnd=end;rows.push({el,start:base+i*day+start*minute,end:base+i*day+end*minute});
   });
 });
 function tick(){const now=Date.now();clock.textContent='한국 시간 · '+new Date(now).toLocaleString('ko-KR',{timeZone:'Asia/Seoul'});rows.forEach(r=>{const active=now>=r.start&&now<r.end;r.el.classList.toggle('schedule-now',active);if(active)r.el.setAttribute('aria-current','time');else r.el.removeAttribute('aria-current')})}
 const today=Math.floor((Date.now()-base)/day)+1;if(today>=1&&today<=3)document.querySelector('[data-day="'+today+'"]').click();tick();setInterval(tick,1000);
})();
