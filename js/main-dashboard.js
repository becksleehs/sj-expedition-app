(async function(){
  const $=s=>document.querySelector(s);
  const preview=new URLSearchParams(location.search).get('preview')==='1';
  let st=SJGear.normalizeState(SJ.load());
  let role=preview?'student':SJ.getRole();
  let p=preview?{id:'s06',grade:2,name:'박현제',gender:'M'}:SJ.current();

  const settings=$('#settingsSheet'), drawer=$('#menuDrawer'), settingsBtn=$('#settingsBtn');
  const open=el=>{el.hidden=false;document.documentElement.style.overflow='hidden'};
  const close=el=>{el.hidden=true;document.documentElement.style.overflow=''};
  const prettyBase=id=>`assets/avatar-v33/${id||'m1'}.png?v=fresh330`;

  function renderGuest(){
    $('#dashAvatar').innerHTML='<div class="guest-avatar-v33">🧭</div>';
    $('#dashName').textContent='승주 원정대';
    $('#dashGrade').textContent='방문자';
    $('#dashRole').textContent='부산 · 울릉도 · 독도 대모험';
    $('#profileEdit').textContent='학생으로 시작하기';
    $('#profileEdit').onclick=()=>{SJ.setRole('student');location.href='select-student.html?force=1'};
    const primary=$('#settingsPrimary');
    primary.href='select-student.html?force=1'; primary.querySelector('b').textContent='학생으로 시작하기'; primary.onclick=()=>SJ.setRole('student');
  }

  function renderStudent(){
    if(!preview){p=SJ.current();st=SJGear.normalizeState(SJ.load())}
    else st={...st,studentId:p.id,avatar:st.avatar||'m1'};
    if(!p||!st.avatar){location.replace('select-student.html?force=1');return false}
    $('#dashName').textContent=p.name;
    $('#dashGrade').textContent=p.grade+'학년';
    $('#dashRole').textContent=SJGear.profiles[st.avatar]?.name?.split('·').slice(1).join('·').trim()||'승주 원정대 탐험가';
    $('#dashAvatar').innerHTML=`<img class="pretty-avatar-v33" src="${prettyBase(st.avatar)}" alt="${p.name} 캐릭터">`;
    $('#profileEdit').textContent='👕 꾸미기';
    $('#profileEdit').onclick=()=>location.href='equipment.html';
    const primary=$('#settingsPrimary'); primary.href='equipment.html'; primary.querySelector('b').textContent='내 캐릭터 꾸미기'; primary.onclick=null;
    return true;
  }

  async function setupPassword(){
    const modal=$('#securityModal'), text=$('#securityText'), pw=$('#securityPw'), pw2=$('#securityPw2'), btn=$('#securitySave');
    modal.hidden=false;text.textContent=`${p.name} 학생의 새 숫자 4자리 비밀번호를 설정합니다.`;
    return new Promise(resolve=>{btn.onclick=async()=>{const a=pw.value.trim(),b=pw2.value.trim();if(!/^\d{4}$/.test(a)){alert('숫자 4자리로 입력해주세요.');return}if(a!==b){alert('두 비밀번호가 다릅니다.');return}btn.disabled=true;btn.textContent='저장 중…';try{const r=await SJAuth.register(p.id,a);st.authToken=r.token;SJ.save(st);modal.hidden=true;resolve(true)}catch(e){alert(e.message);btn.disabled=false;btn.textContent='비밀번호 저장'}}});
  }

  if(preview){ renderStudent(); }
  else if(!role){
    $('#roleModal').hidden=false;
    $('#roleStudent').onclick=()=>{SJ.setRole('student');location.href='select-student.html?onboarding=1'};
    $('#roleGuest').onclick=()=>{SJ.setRole('guest');$('#roleModal').hidden=true;role='guest';renderGuest()};
    renderGuest();
  }else if(role==='guest') renderGuest();
  else{
    if(!renderStudent()) return;
    try{
      const reg=await SJAuth.status(p.id);
      if(reg.registered){
        const valid=st.authToken?await SJAuth.verify(p.id,st.authToken):false;
        if(!valid){location.replace(`select-student.html?force=1&student=${encodeURIComponent(p.id)}`);return}
      }else await setupPassword();
    }catch(e){alert('학생 비밀번호 보안 서버에 연결하지 못했습니다. 인터넷 연결 후 다시 열어주세요.');return}
  }

  $('#missionBtn').onclick=()=>location.href='missions.html';
  $('#membersBtn').onclick=()=>alert('오늘의 원정대원은 교사가 공개하면 이곳에 표시됩니다.');
  $('#profileCard').onclick=e=>{if(e.target.closest('button'))return;if(role==='student')location.href='equipment.html'};

  let timer=null,longOpened=false;
  settingsBtn.addEventListener('pointerdown',()=>{longOpened=false;clearTimeout(timer);timer=setTimeout(()=>{longOpened=true;location.href='teacher.html'},3000)});
  settingsBtn.addEventListener('pointerup',()=>{clearTimeout(timer);if(!longOpened)open(settings)});
  settingsBtn.addEventListener('pointercancel',()=>clearTimeout(timer));
  settingsBtn.addEventListener('contextmenu',e=>e.preventDefault());
  $('#hamburgerBtn').onclick=()=>open(drawer);
  document.querySelectorAll('[data-close="settings"]').forEach(x=>x.onclick=()=>close(settings));
  document.querySelectorAll('[data-close="menu"]').forEach(x=>x.onclick=()=>close(drawer));
})();
