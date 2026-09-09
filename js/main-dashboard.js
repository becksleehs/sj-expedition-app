(function(){
  const $=s=>document.querySelector(s);
  const start=new Date(2026,9,14,0,0,0);
  const d2=new Date(2026,9,15,0,0,0);
  const d3=new Date(2026,9,16,0,0,0);
  const end=new Date(2026,9,17,0,0,0);
  const now=new Date();
  let percent=0;
  if(now>=start&&now<d2) percent=33;
  else if(now>=d2&&now<d3) percent=66;
  else if(now>=d3) percent=100;
  $('#tripPercent').textContent=percent+'%';
  $('#tripProgress').style.width=percent+'%';
  const days=Math.ceil((start-now)/(24*60*60*1000));
  const countdown=days>0?'D-'+days:(now<end?'원정 진행 중':'원정 완료');
  $('#countdown').textContent=countdown;
  $('#readyStat').textContent=countdown;
  $('#readyProgress').style.width=days>0?Math.max(8,Math.min(92,100-(days/40*100)))+'%':'100%';

  const registered=SJ.isRegistered();
  const st=SJGear.normalizeState(SJ.load());
  const p=SJ.current();
  const embark=$('#embarkBtn');
  if(registered&&p){
    const name=p.name;
    $('#dashName').textContent=name;
    $('#dashGrade').textContent=p.grade+'학년';
    $('#passportName').textContent=name;
    $('#passportGrade').textContent=p.grade+'학년';
    $('#dashRole').textContent=SJGear.profiles[st.avatar]?.name?.split('·').slice(1).join('·').trim()||'승주 원정대 탐험가';
    $('#embarkSub').textContent=name+' 원정대원, 계속 탐험해요!';
    SJGear.renderStage($('#dashAvatar'),st.avatar,st,{small:true});
    SJGear.renderStage($('#passportAvatar'),st.avatar,st,{small:true});
    $('#profileEdit').onclick=()=>location.href='equipment.html';
    $('#profileCard').onclick=e=>{if(!e.target.closest('button'))location.href='home.html'};
    embark.onclick=()=>location.href='home.html';
  }else{
    $('#profileEdit').onclick=()=>location.href='select-student.html';
    $('#profileCard').onclick=()=>location.href='select-student.html';
    $('#embarkSub').textContent='내 이름과 캐릭터를 먼저 선택해요!';
    embark.onclick=()=>location.href='select-student.html';
  }
  $('#teacherBtn').onclick=()=>location.href='teacher.html';
  $('#noticeBtn').onclick=$('#noticeBar').onclick=()=>alert('📣 10월 14일 출발 예정입니다. 준비물과 최종 집합 시간은 교사 안내를 확인해주세요.');
  $('#previewBtn').onclick=()=>location.href='home.html';
  $('#missionBtn').onclick=()=>location.href='missions.html';
  $('#badgeBtn').onclick=()=>alert('배지 컬렉션은 미션 시스템과 함께 연결할 예정입니다.');
})();
