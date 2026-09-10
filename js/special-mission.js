(function(){
  const END='/.netlify/functions/special-mission';
  const SEEN='sj2026_special_seen_v34';
  let lastId=null, timer=null, currentMission=null;
  const esc=s=>String(s||'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  function ensureModal(){
    let wrap=document.getElementById('specialMissionModalV34');if(wrap)return wrap;
    wrap=document.createElement('div');wrap.id='specialMissionModalV34';wrap.className='special-modal-v34';wrap.hidden=true;
    wrap.innerHTML=`<div class="special-card-v34"><div class="special-badge-v34">🎁 SPECIAL MISSION</div><h2>스페셜 미션 도착!</h2><div id="specialMissionPopupText" class="special-text-v34"></div><button id="specialMissionConfirm" type="button">확인했어요</button><button id="specialMissionNotify" class="special-notify-v34" type="button">🔔 휴대폰 알림 켜기</button><small>선생님이 새 스페셜 미션을 보내면 이 창으로 알려드려요.</small></div>`;
    document.body.appendChild(wrap);
    wrap.querySelector('#specialMissionConfirm').onclick=()=>{if(lastId)localStorage.setItem(SEEN,lastId);wrap.hidden=true};
    wrap.querySelector('#specialMissionNotify').onclick=async()=>{if(!('Notification'in window)){alert('이 브라우저는 알림 기능을 지원하지 않습니다.');return}const p=await Notification.requestPermission();if(p==='granted'){wrap.querySelector('#specialMissionNotify').textContent='🔔 휴대폰 알림 켜짐';try{const reg=await navigator.serviceWorker.ready;await reg.showNotification('승주 원정대',{body:'스페셜 미션 알림이 켜졌어요!',tag:'sj-special-ready'});}catch{}}};
    return wrap;
  }
  async function systemNotify(mission){
    if(!('Notification'in window)||Notification.permission!=='granted')return;
    try{const reg=await navigator.serviceWorker.ready;await reg.showNotification('🎁 승주 원정대 스페셜 미션',{body:mission.text,tag:`sj-special-${mission.id}`,renotify:true,data:{url:'index.html'}});}catch{}
  }
  function updateCard(mission){
    const text=document.getElementById('specialMissionCardText'),sub=document.getElementById('specialMissionCardSub'),paper=document.getElementById('specialMissionCardBody');
    if(!text)return;
    if(mission){text.innerHTML=esc(mission.text).replace(/\n/g,'<br>');sub.textContent='새 스페셜 미션이 도착했어요!';paper?.classList.add('open');}
    else{text.innerHTML='스페셜 미션이<br>아직 공개되지 않았어요!';sub.textContent='선생님이 보내면 팝업으로 바로 알려드려요.';paper?.classList.remove('open');}
  }
  async function check(){
    try{
      const r=await fetch(END,{cache:'no-store'});if(!r.ok)return;const data=await r.json();const mission=data.mission||null;currentMission=mission;updateCard(mission);if(!mission)return;
      const role=window.SJ?.getRole?.();const registered=window.SJ?.isRegistered?.();if(role!=='student'||!registered)return;
      if(mission.id!==lastId){lastId=mission.id;const seen=localStorage.getItem(SEEN);if(seen!==mission.id){const modal=ensureModal();modal.querySelector('#specialMissionPopupText').textContent=mission.text;const nb=modal.querySelector('#specialMissionNotify');if('Notification'in window&&Notification.permission==='granted')nb.textContent='🔔 휴대폰 알림 켜짐';modal.hidden=false;systemNotify(mission);}}
    }catch{}
  }
  window.SJSpecial={check,openCurrent:()=>{if(!currentMission){alert('현재 공개된 스페셜 미션이 없습니다.');return;}lastId=currentMission.id;const modal=ensureModal();modal.querySelector('#specialMissionPopupText').textContent=currentMission.text;modal.hidden=false;},requestNotification:async()=>('Notification'in window?Notification.requestPermission():'unsupported')};
  check();timer=setInterval(check,8000);document.addEventListener('visibilitychange',()=>{if(!document.hidden)check()});
})();
