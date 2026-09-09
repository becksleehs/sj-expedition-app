(function(){
  const $=s=>document.querySelector(s);
  const start=new Date(2026,9,14,0,0,0), d2=new Date(2026,9,15), d3=new Date(2026,9,16), end=new Date(2026,9,17);
  const now=new Date();
  let percent=0;
  if(now>=start&&now<d2) percent=33; else if(now>=d2&&now<d3) percent=66; else if(now>=d3) percent=100;
  if($('#tripPercent')) $('#tripPercent').textContent=percent+'%';
  if($('#tripProgress')) $('#tripProgress').style.width=percent+'%';
  const days=Math.ceil((start-now)/86400000);
  const countdown=days>0?'D-'+days:(now<end?'원정 진행 중':'원정 완료');
  if($('#countdown')) $('#countdown').textContent=countdown;
  if($('#readyStat')) $('#readyStat').textContent=countdown;

  const registered=SJ.isRegistered(), st=SJGear.normalizeState(SJ.load()), p=SJ.current(), embark=$('#embarkBtn');
  if(registered&&p){
    if($('#dashName')) $('#dashName').textContent=p.name;
    if($('#dashGrade')) $('#dashGrade').textContent=p.grade+'학년';
    if($('#dashRole')) $('#dashRole').textContent=SJGear.profiles[st.avatar]?.name?.split('·').slice(1).join('·').trim()||'승주 원정대 탐험가';
    if($('#embarkSub')) $('#embarkSub').textContent=p.name+' 원정대원, 계속 탐험해요!';
    if($('#dashAvatar')) SJGear.renderStage($('#dashAvatar'),st.avatar,st,{small:true});
    if($('#profileEdit')) $('#profileEdit').onclick=()=>location.href='equipment.html';
    if($('#profileCard')) $('#profileCard').onclick=e=>{if(!e.target.closest('button')) location.href='home.html'};
    if(embark) embark.onclick=()=>location.href='home.html';
  }else{
    if($('#profileEdit')) $('#profileEdit').onclick=()=>location.href='select-student.html';
    if($('#profileCard')) $('#profileCard').onclick=()=>location.href='select-student.html';
    if($('#embarkSub')) $('#embarkSub').textContent='내 이름과 캐릭터를 먼저 선택해요!';
    if(embark) embark.onclick=()=>location.href='select-student.html';
  }
  if($('#previewBtn')) $('#previewBtn').onclick=()=>location.href='home.html';
  if($('#missionBtn')) $('#missionBtn').onclick=()=>location.href='missions.html';

  const settings=$('#settingsSheet'), drawer=$('#menuDrawer'), more=$('#moreTray');
  const open=(el)=>{if(!el)return;el.hidden=false;document.documentElement.style.overflow='hidden'};
  const close=(el)=>{if(!el)return;el.hidden=true;if((!settings||settings.hidden)&&(!drawer||drawer.hidden))document.documentElement.style.overflow=''};
  if($('#settingsBtn')) $('#settingsBtn').onclick=()=>open(settings);
  if($('#hamburgerBtn')) $('#hamburgerBtn').onclick=()=>open(drawer);
  document.querySelectorAll('[data-close="settings"]').forEach(x=>x.onclick=()=>close(settings));
  document.querySelectorAll('[data-close="menu"]').forEach(x=>x.onclick=()=>close(drawer));
  if($('#moreBtn')) $('#moreBtn').onclick=()=>{if(!more)return;more.hidden=!more.hidden};
  document.addEventListener('keydown',e=>{if(e.key==='Escape'){close(settings);close(drawer);if(more)more.hidden=true}});
})();
