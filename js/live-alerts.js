(function(){
  const path=(location.pathname.split('/').pop()||'index.html').toLowerCase();
  if(['teacher.html','select-student.html','character.html'].includes(path))return;
  const seen=(key,v)=>localStorage.setItem(key,String(v));
  const wasSeen=(key,v)=>Number(localStorage.getItem(key)||0)>=Number(v||0);
  function notify(title,body){try{if('Notification'in window&&Notification.permission==='granted'){new Notification(title,{body,tag:'sj-live-'+title,icon:'assets/ui/seungju-school-logo.png'})}}catch{}}
  function popup({title,body,href,label='확인하기',key,version}){
    if(key&&wasSeen(key,version))return;
    if(key)seen(key,version);
    const wrap=document.createElement('div');wrap.className='sj-live-popup-v38';wrap.innerHTML=`<div class="sj-live-popup-card-v38"><button class="sj-live-close-v38" type="button">×</button><div class="sj-live-icon-v38">🔔</div><h2>${title}</h2><p>${body}</p><div class="sj-live-actions-v38"><a href="${href}">${label}</a><button type="button">나중에</button></div></div>`;document.body.appendChild(wrap);const close=()=>wrap.remove();wrap.querySelector('.sj-live-close-v38').onclick=close;wrap.querySelector('.sj-live-actions-v38 button').onclick=close;notify(title,body);
  }
  async function pollGates(){try{const r=await fetch('/.netlify/functions/feature-gates',{cache:'no-store'});if(!r.ok)return;const d=await r.json(),s=d.state||{};if(s.history?.open)popup({title:'📖 역사 이야기가 열렸어요!',body:'지금 역사 이야기를 읽고 자료까지 확인한 뒤 경험치를 획득하세요.',href:'history.html',key:'sj_seen_gate_history_v38',version:s.history.version});if(s.quiz?.open)popup({title:'🚌 버스 역사 퀴즈가 열렸어요!',body:'역사 이야기를 떠올리며 버스 퀴즈에 도전하고 XP를 획득하세요.',href:'quiz.html',key:'sj_seen_gate_quiz_v38',version:s.quiz.version});}catch{}}
  async function pollGroups(){try{const r=await fetch('/.netlify/functions/groups',{cache:'no-store'});if(!r.ok)return;const d=await r.json(),g=d.current;if(!g||!g.version)return;const p=window.SJ?.current?.();if(!p)return;const mine=(g.groups||[]).find(x=>(x.members||[]).includes(p.id));if(!mine)return;popup({title:'👥 오늘의 원정대 조편성이 확정되었습니다!',body:`${p.name} 학생은 ${mine.name}입니다. 지금 조원들을 확인해보세요.`,href:'groups.html',key:'sj_seen_groups_v38',version:g.version});}catch{}}
  setTimeout(()=>{pollGates();pollGroups()},1200);setInterval(()=>{pollGates();pollGroups()},9000);
})();
