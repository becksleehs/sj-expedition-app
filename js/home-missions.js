(()=>{
 const text=document.getElementById('specialMissionCardText'),sub=document.getElementById('specialMissionCardSub');if(!text||!sub)return;let busy=false;
 async function refresh(){if(busy)return;busy=true;try{const r=await fetch('/.netlify/functions/field-missions?action=list',{cache:'no-store'});if(!r.ok)throw Error();const d=await r.json();if(!Array.isArray(d.missions))throw Error();const count=d.missions.length;text.textContent=count?`지금 열린 원정 미션 ${count}개`:'아직 열린 원정 미션이 없어요';sub.textContent=count?'눌러서 활동 확인 · 사진과 글 제출':'선생님이 시작하면 여기에 표시됩니다.';}catch{text.textContent='미션 상태를 확인하지 못했어요';sub.textContent='눌러서 다시 확인해주세요.';}finally{busy=false;}}
 refresh();setInterval(()=>{if(!document.hidden)refresh();},5000);document.addEventListener('visibilitychange',()=>{if(!document.hidden)refresh();});
})();
