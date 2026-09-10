(async function(){
  const $=s=>document.querySelector(s), st=SJGear.normalizeState(SJ.load()), p=SJ.current();
  if(!p||!st.avatar){location.replace('select-student.html');return}
  async function setupPassword(){
    const modal=$('#securityModal'), text=$('#securityText'), pw=$('#securityPw'), pw2=$('#securityPw2'), btn=$('#securitySave');
    modal.hidden=false;text.textContent=`${p.name} 학생의 숫자 4자리 비밀번호를 처음 설정합니다.`;
    return new Promise(resolve=>{btn.onclick=async()=>{const a=pw.value.trim(),b=pw2.value.trim();if(!/^\d{4}$/.test(a)){alert('숫자 4자리로 입력해주세요.');return}if(a!==b){alert('두 비밀번호가 다릅니다.');return}btn.disabled=true;btn.textContent='저장 중…';try{const r=await SJAuth.register(p.id,a);st.authToken=r.token;SJ.save(st);modal.hidden=true;resolve(true)}catch(e){alert(e.message);btn.disabled=false;btn.textContent='비밀번호 저장'}}});
  }
  try{
    const reg=await SJAuth.status(p.id);
    if(reg.registered){
      const valid=st.authToken?await SJAuth.verify(p.id,st.authToken):false;
      if(!valid){location.replace(`select-student.html?force=1&student=${encodeURIComponent(p.id)}`);return}
    }else{
      await setupPassword();
    }
  }catch(e){alert('학생 비밀번호 보안 서버에 연결하지 못했습니다. 인터넷 연결 후 다시 열어주세요.');return}

  $('#mainApp').hidden=false;
  $('#dashName').textContent=p.name;$('#dashGrade').textContent=p.grade+'학년';
  $('#dashRole').textContent=SJGear.profiles[st.avatar]?.name?.split('·').slice(1).join('·').trim()||'승주 원정대 탐험가';
  SJGear.renderStage($('#dashAvatar'),st.avatar,st,{small:false});
  $('#profileEdit').onclick=()=>location.href='equipment.html'; $('#missionBtn').onclick=()=>location.href='missions.html';
  $('#membersBtn').onclick=()=>alert('오늘의 원정대원은 교사가 공개하면 표시됩니다.');

  const settings=$('#settingsSheet'), drawer=$('#menuDrawer'), settingsBtn=$('#settingsBtn');
  const open=el=>{el.hidden=false;document.documentElement.style.overflow='hidden'}, close=el=>{el.hidden=true;document.documentElement.style.overflow=''};
  let timer=null,longOpened=false;
  settingsBtn.addEventListener('pointerdown',()=>{longOpened=false;clearTimeout(timer);timer=setTimeout(()=>{longOpened=true;location.href='teacher.html'},3000)});
  settingsBtn.addEventListener('pointerup',()=>{clearTimeout(timer);if(!longOpened)open(settings)});settingsBtn.addEventListener('pointercancel',()=>clearTimeout(timer));settingsBtn.addEventListener('contextmenu',e=>e.preventDefault());
  $('#hamburgerBtn').onclick=()=>open(drawer);
  document.querySelectorAll('[data-close="settings"]').forEach(x=>x.onclick=()=>close(settings));document.querySelectorAll('[data-close="menu"]').forEach(x=>x.onclick=()=>close(drawer));
})();
