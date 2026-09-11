(function(){
  document.querySelectorAll('.bottom-nav-v27,.bottom-nav-v28,.bottom-nav-v29,.bottom-nav-v30,.bottom-nav-v31,.bottom-nav-v32,.sj-fixed-nav-v33').forEach(n=>n.remove());
  const path=(location.pathname.split('/').pop()||'index.html').toLowerCase();
  const excluded=['select-student.html','character.html','teacher.html'];
  if(!excluded.includes(path)){
    const items=[
      ['index.html','🏠','홈'],['notices.html','📣','공지'],['schedule.html','📅','일정'],['missions.html','🎯','미션'],['chat.html','💬','채팅'],['badges.html','🏅','배지'],['album.html','🖼️','앨범']
    ];
    const nav=document.createElement('nav');nav.id='sjFixedNav';nav.className='sj-fixed-nav-v34';nav.setAttribute('aria-label','주요 메뉴');
    nav.innerHTML=items.map(([href,icon,label])=>`<a href="${href}" class="${path===href||(path===''&&href==='index.html')?'active':''}"><span>${icon}</span><b>${label}</b></a>`).join('');
    document.body.appendChild(nav);
  }
  if(window.SJGrowth){setTimeout(()=>window.SJGrowth.checkUpgradePrompt?.(),250)}else if(window.SJ&&!document.getElementById('sjGrowthScript')){const g=document.createElement('script');g.id='sjGrowthScript';g.src='js/growth.js?v=fresh360';g.onload=()=>setTimeout(()=>window.SJGrowth?.checkUpgradePrompt?.(),250);document.body.appendChild(g);}
  if(!window.SJSpecial&&!document.getElementById('sjSpecialScript')&&!excluded.includes(path)){
    const s=document.createElement('script');s.id='sjSpecialScript';s.src='js/special-mission.js?v=fresh360';document.body.appendChild(s);
  }
})();
