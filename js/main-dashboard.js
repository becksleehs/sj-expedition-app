(function(){
  const $=s=>document.querySelector(s);
  const start=new Date(2026,9,14,0,0,0), end=new Date(2026,9,17,0,0,0), now=new Date();
  const days=Math.ceil((start-now)/86400000);
  const countdown=days>0?'D-'+days:(now<end?'원정 진행 중':'원정 완료');
  if($('#countdown')) $('#countdown').textContent=countdown;

  const registered=SJ.isRegistered(), st=SJGear.normalizeState(SJ.load()), p=SJ.current();
  if(registered&&p){
    if($('#dashName')) $('#dashName').textContent=p.name;
    if($('#dashGrade')) $('#dashGrade').textContent=p.grade+'학년';
    if($('#dashRole')) $('#dashRole').textContent=SJGear.profiles[st.avatar]?.name?.split('·').slice(1).join('·').trim()||'승주 원정대 탐험가';
    if($('#dashAvatar')) SJGear.renderStage($('#dashAvatar'),st.avatar,st,{small:false});
    if($('#profileEdit')) $('#profileEdit').onclick=e=>{e.stopPropagation();location.href='equipment.html'};
  }else{
    if($('#profileEdit')) $('#profileEdit').onclick=e=>{e.stopPropagation();location.href='select-student.html'};
    if($('#profileCard')) $('#profileCard').onclick=()=>location.href='select-student.html';
  }
  if($('#missionBtn')) $('#missionBtn').onclick=()=>location.href='missions.html';

  const settings=$('#settingsSheet'), drawer=$('#menuDrawer'), more=$('#moreTray'), settingsBtn=$('#settingsBtn');
  const open=(el)=>{if(!el)return;el.hidden=false;document.documentElement.style.overflow='hidden'};
  const close=(el)=>{if(!el)return;el.hidden=true;if((!settings||settings.hidden)&&(!drawer||drawer.hidden))document.documentElement.style.overflow=''};

  // 일반 학생: 짧게 누르면 꾸미기만 보임.
  // 교사 관리자: 설정 아이콘을 3초간 길게 누르면 PIN 보호된 관리자 화면으로 진입.
  let adminTimer=null, adminOpened=false;
  if(settingsBtn){
    settingsBtn.addEventListener('pointerdown',()=>{
      adminOpened=false;
      clearTimeout(adminTimer);
      adminTimer=setTimeout(()=>{adminOpened=true;location.href='teacher.html'},3000);
    });
    const cancelAdmin=()=>{clearTimeout(adminTimer);adminTimer=null};
    settingsBtn.addEventListener('pointerup',()=>{
      if(adminOpened){cancelAdmin();return;}
      cancelAdmin();open(settings);
    });
    settingsBtn.addEventListener('pointercancel',cancelAdmin);
    settingsBtn.addEventListener('pointerleave',e=>{if(e.buttons)cancelAdmin()});
    settingsBtn.addEventListener('contextmenu',e=>e.preventDefault());
  }

  if($('#hamburgerBtn')) $('#hamburgerBtn').onclick=()=>open(drawer);
  document.querySelectorAll('[data-close="settings"]').forEach(x=>x.onclick=()=>close(settings));
  document.querySelectorAll('[data-close="menu"]').forEach(x=>x.onclick=()=>close(drawer));
  if($('#moreBtn')) $('#moreBtn').onclick=()=>{if(!more)return;more.hidden=!more.hidden};
  document.addEventListener('keydown',e=>{if(e.key==='Escape'){close(settings);close(drawer);if(more)more.hidden=true}});
})();
