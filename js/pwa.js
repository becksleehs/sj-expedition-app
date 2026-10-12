(()=>{
  let pending=null;
  const intro=document.getElementById('installIntro');
  const introKey='sj2026_install_intro_v339';
  const installed=()=>window.matchMedia('(display-mode: standalone)').matches||navigator.standalone===true;
  let finishWait;
  window.SJInstallIntro=new Promise(resolve=>{finishWait=resolve});
  function finishIntro(){
    if(intro&&!intro.hidden){intro.hidden=true;document.documentElement.style.overflow='';}
    try{localStorage.setItem(introKey,'1')}catch{}
    finishWait();
  }
  function render(){
    const button=document.getElementById('installApp'),status=document.getElementById('installStatus');
    if(button)button.hidden=installed()||!pending;
    const introButton=document.getElementById('installIntroInstall');
    if(introButton)introButton.hidden=installed()||!pending;
    if(installed()&&status)status.textContent='앱 모드로 실행 중입니다. 홈으로 돌아가 이용하세요.';
  }
  async function promptInstall(){
    if(!pending)return;
    const event=pending;pending=null;render();
    try{await event.prompt();const result=await event.userChoice;
      const status=document.getElementById('installStatus');
      if(status)status.textContent=result.outcome==='accepted'?'설치 후 홈 화면의 그림 아이콘을 눌러주세요.':'설치를 취소했습니다. 브라우저 메뉴에서 다시 설치할 수 있어요.';
    }catch{const status=document.getElementById('installStatus');if(status)status.textContent='브라우저 메뉴에서 앱 설치를 선택해주세요.';}
    if(intro)finishIntro();
  }
  window.addEventListener('beforeinstallprompt',event=>{event.preventDefault();pending=event;render();});
  window.addEventListener('appinstalled',()=>{pending=null;render();const status=document.getElementById('installStatus');if(status)status.textContent='설치되었습니다. 홈 화면의 승주 원정대 아이콘으로 실행하세요.';finishIntro();});
  const legacy=document.getElementById('installApp');if(legacy)legacy.onclick=promptInstall;
  const introButton=document.getElementById('installIntroInstall');if(introButton)introButton.onclick=promptInstall;
  if(intro&&!installed()&&!(()=>{try{return localStorage.getItem(introKey)==='1'}catch{return false}})()){
    intro.hidden=false;document.documentElement.style.overflow='hidden';
    document.getElementById('installIntroClose').onclick=finishIntro;
  }else finishWait();
  render();
  if('serviceWorker'in navigator&&window.isSecureContext)navigator.serviceWorker.register('sw.js',{updateViaCache:'none'}).catch(()=>{});
})();
