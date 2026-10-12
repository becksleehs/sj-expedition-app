(()=>{
  const endpoint='/.netlify/functions/push-subscriptions';
  const installed=()=>matchMedia('(display-mode: standalone)').matches||navigator.standalone===true;
  const supported=()=>window.isSecureContext&&'serviceWorker'in navigator&&'PushManager'in window&&'Notification'in window;
  const credentials=()=>{const state=SJ.load();return {studentId:state.studentId,token:state.authToken};};
  const keyBytes=key=>Uint8Array.from(atob(key.replace(/-/g,'+').replace(/_/g,'/')),c=>c.charCodeAt(0));
  async function api(payload){const r=await fetch(endpoint,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({...credentials(),...payload})});const d=await r.json();if(!r.ok)throw Error(d.error||'알림 서버 오류');return d;}
  async function registration(){await navigator.serviceWorker.register('sw.js',{updateViaCache:'none'});return navigator.serviceWorker.ready;}
  async function sync(){if(!supported()||Notification.permission!=='granted'||!credentials().token)return false;
    const sub=await (await registration()).pushManager.getSubscription();if(!sub)return false;
    await api({action:'subscribe',subscription:sub.toJSON()});return true;
  }
  async function enable(){
    if(!supported())throw Error('이 브라우저는 웹 푸시를 지원하지 않습니다. 앱 설치와 브라우저 업데이트를 확인해주세요.');
    if(/iPad|iPhone|iPod/.test(navigator.userAgent)&&!installed())throw Error('아이폰·아이패드에서는 먼저 홈 화면에 앱을 추가하고, 설치한 아이콘으로 실행해주세요.');
    if(!credentials().token)throw Error('학생 로그인 후 알림을 켤 수 있습니다.');
    // iOS requires the permission request directly inside a tap handler.
    const permission=await Notification.requestPermission();
    if(permission!=='granted')throw Error('알림 권한이 꺼져 있습니다. 휴대전화 설정에서 승주 원정대 알림을 허용해주세요.');
    const reg=await registration();let sub=await reg.pushManager.getSubscription();
    const r=await fetch(endpoint,{cache:'no-store'});if(!r.ok)throw Error('알림 서버에 연결하지 못했습니다.');
    const {publicKey}=await r.json();if(!publicKey)throw Error('알림 서버 키를 읽지 못했습니다.');
    if(!sub)sub=await reg.pushManager.subscribe({userVisibleOnly:true,applicationServerKey:keyBytes(publicKey)});
    await api({action:'subscribe',subscription:sub.toJSON()});return true;
  }
  async function disable(){if(!supported())return;const sub=await (await registration()).pushManager.getSubscription();if(sub){await api({action:'unsubscribe',subscription:sub.toJSON()});await sub.unsubscribe();}}
  window.SJPush={enable,disable,sync,supported};
})();
