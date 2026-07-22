(() => {
  const D=window.SJ_DATA;
  const $=s=>document.querySelector(s);
  const get=(k,d)=>{try{return JSON.parse(localStorage.getItem(k))??d}catch{return d}};
  const state=get('sj_state',{scores:{},teams:{},avatars:{},completed:{}});
  const id=localStorage.getItem('sj_current_student');
  const student=D.students.find(s=>s.id===id);
  if(!student) return;

  const avatar=D.avatars.find(a=>a.id===state.avatars[id]) || D.avatars.find(a=>a.gender===student.gender);
  const score=Number(state.scores[id]||0);
  const done=state.completed[id]||[];
  const missionXp=D.missions.filter(m=>done.includes(m.id)).reduce((n,m)=>n+m.xp,0);
  const xp=score+missionXp, level=Math.floor(xp/100)+1, within=xp%100;

  $('#homeStudentName').textContent=student.name;
  $('#homeTeam').textContent=state.teams[id]||`${student.grade}학년 원정대원`;
  $('#homeLevel').textContent=`Lv.${level} · ${level>=8?'전설의 탐험가':level>=5?'숙련 탐험가':'새싹 탐험가'}`;
  $('#homeXpText').textContent=`${within} / 100`;
  $('#homeXpBar').style.width=within+'%';
  $('#enterText').textContent='내 원정 이어가기';

  if(avatar){
    const img=$('#homeAvatarImg');
    img.src=`${avatar.image}?v=200`;
    img.onerror=()=>{ img.src=`assets/avatars/${student.gender==='F'?'f1':'m1'}.png?v=200`; };
  }
})();
if('serviceWorker' in navigator){
  navigator.serviceWorker.getRegistrations().then(regs=>regs.forEach(r=>r.update()));
  navigator.serviceWorker.register('./sw.js?v=200').catch(()=>{});
}