(function(){
  const $=s=>document.querySelector(s);
  const start=new Date(2026,9,14,0,0,0), d2=new Date(2026,9,15), d3=new Date(2026,9,16), end=new Date(2026,9,17);
  const now=new Date();
  let percent=0;
  if(now>=start&&now<d2) percent=33; else if(now>=d2&&now<d3) percent=66; else if(now>=d3) percent=100;
  if($('#tripPercent')) $('#tripPercent').textContent=percent+'%';
  if($('#tripProgress')) $('#tripProgress').style.width=percent+'%';
  const days=Math.ceil((start-now)/86400000);
  const countdown=days>0?'D-'+days:(now<end?'원정 진행 중':'원정 완료');
  if($('#countdown')) $('#countdown').textContent=countdown;
  if($('#readyStat')) $('#readyStat').textContent=countdown;
  if($('#readyProgress')) $('#readyProgress').style.width=days>0?Math.max(8,Math.min(92,100-(days/40*100)))+'%':'100%';

  const registered=SJ.isRegistered(), st=SJGear.normalizeState(SJ.load()), p=SJ.current(), embark=$('#embarkBtn');
  if(registered&&p){
    $('#dashName').textContent=p.name;
    $('#dashGrade').textContent=p.grade+'학년';
    $('#passportName').textContent=p.name;
    $('#passportGrade').textContent=p.grade+'학년';
    $('#dashRole').textContent=SJGear.profiles[st.avatar]?.name?.split('·').slice(1).join('·').trim()||'승주 원정대 탐험가';
    $('#embarkSub').textContent=p.name+' 원정대원, 계속 탐험해요!';
    SJGear.renderStage($('#dashAvatar'),st.avatar,st,{small:true});
    $('#profileEdit').onclick=()=>location.href='equipment.html';
    $('#profileCard').onclick=e=>{if(!e.target.closest('button')) location.href='home.html'};
    embark.onclick=()=>location.href='home.html';
  }else{
    $('#profileEdit').onclick=()=>location.href='select-student.html';
    $('#profileCard').onclick=()=>location.href='select-student.html';
    $('#embarkSub').textContent='내 이름과 캐릭터를 먼저 선택해요!';
    embark.onclick=()=>location.href='select-student.html';
  }
  $('#teacherBtn').onclick=()=>location.href='teacher.html';
  $('#noticeBtn').onclick=()=>location.href='notices.html';
  $('#previewBtn').onclick=()=>location.href='home.html';
  $('#missionBtn').onclick=()=>location.href='missions.html';
  $('#badgeBtn').onclick=()=>location.href='badges.html';
})();
