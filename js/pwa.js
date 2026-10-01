(()=>{
let pending=null;const installed=()=>window.matchMedia('(display-mode: standalone)').matches||navigator.standalone===true;
function render(){const button=document.getElementById('installApp'),status=document.getElementById('installStatus');if(button)button.hidden=installed()||!pending;if(installed()&&status)status.textContent='앱 모드로 실행 중입니다. 홈으로 돌아가 이용하세요.';}
window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();pending=e;render();});
window.addEventListener('appinstalled',()=>{pending=null;const status=document.getElementById('installStatus');if(status)status.textContent='설치되었습니다. 홈 화면의 승주 원정대 아이콘으로 실행하세요.';const b=document.getElementById('installApp');if(b)b.hidden=true;});
const b=document.getElementById('installApp');if(b)b.onclick=async()=>{if(!pending)return;const event=pending;pending=null;b.hidden=true;try{await event.prompt();const result=await event.userChoice;document.getElementById('installStatus').textContent=result.outcome==='accepted'?'설치 후 홈 화면의 그림 아이콘을 눌러주세요.':'설치를 취소했습니다. 브라우저 메뉴에서 다시 설치할 수 있어요.';}catch{document.getElementById('installStatus').textContent='브라우저 메뉴에서 앱 설치를 선택해주세요.';}};
render();if('serviceWorker' in navigator&&window.isSecureContext)navigator.serviceWorker.register('sw.js',{updateViaCache:'none'}).catch(()=>{});
})();