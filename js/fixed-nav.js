(function(){
  const old=document.querySelectorAll('.bottom-nav-v27,.bottom-nav-v28,.bottom-nav-v29,.bottom-nav-v30,.bottom-nav-v31,.bottom-nav-v32');
  old.forEach(n=>n.remove());
  const path=(location.pathname.split('/').pop()||'index.html').toLowerCase();
  if(['select-student.html','character.html','teacher.html'].includes(path)) return;
  const items=[
    ['index.html','🏠','홈'],
    ['notices.html','📣','공지'],
    ['schedule.html','📅','일정'],
    ['missions.html','🎯','미션'],
    ['chat.html','💬','채팅'],
    ['badges.html','🏅','배지'],
    ['album.html','🖼️','앨범']
  ];
  const nav=document.createElement('nav');
  nav.id='sjFixedNav'; nav.className='sj-fixed-nav-v33'; nav.setAttribute('aria-label','주요 메뉴');
  nav.innerHTML=items.map(([href,icon,label])=>`<a href="${href}" class="${path===href||(path===''&&href==='index.html')?'active':''}"><span>${icon}</span><b>${label}</b></a>`).join('');
  document.body.appendChild(nav);
})();
