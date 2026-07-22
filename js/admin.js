if(sessionStorage.getItem('sj_admin_ok')!=='1'){location.href='admin-login.html'}
const D=window.SJ_DATA,$=s=>document.querySelector(s);
const store={get:(k,d)=>{try{return JSON.parse(localStorage.getItem(k))??d}catch{return d}},set:(k,v)=>localStorage.setItem(k,JSON.stringify(v))};
let state=store.get('sj_state',{attendance:{},scores:{},teams:{},missions:{},avatars:{},completed:{},notice:''});
D.missions.forEach(m=>{if(state.missions[m.id]===undefined)state.missions[m.id]=m.open});
function save(){store.set('sj_state',state);renderAll()}
function renderStudents(){
 $('#adminStudentList').innerHTML=D.students.map(s=>`<div class="admin-student">
 <label class="check"><input type="checkbox" data-att="${s.id}" ${state.attendance[s.id]?'checked':''}><i></i></label>
 <div><b>${s.name}</b><small>${s.grade}학년 · ${s.gender==='M'?'남':'여'}</small></div>
 <input class="score-input" data-score="${s.id}" type="number" min="0" value="${state.scores[s.id]||0}" aria-label="${s.name} 점수">
 <button class="small-btn add10" data-id="${s.id}">+10</button></div>`).join('');
 document.querySelectorAll('[data-att]').forEach(x=>x.onchange=()=>{state.attendance[x.dataset.att]=x.checked;save()});
 document.querySelectorAll('[data-score]').forEach(x=>x.onchange=()=>{state.scores[x.dataset.score]=Number(x.value)||0;save()});
 document.querySelectorAll('.add10').forEach(x=>x.onclick=()=>{state.scores[x.dataset.id]=Number(state.scores[x.dataset.id]||0)+10;save()});
}
function renderMissions(){
 $('#adminMissionList').innerHTML=D.missions.map(m=>`<div class="admin-mission">
 <span>${m.icon}</span><div><b>${m.title}</b><small>${m.type} · ${m.xp}EXP</small></div>
 <label class="switch"><input type="checkbox" data-mission="${m.id}" ${state.missions[m.id]?'checked':''}><i></i></label></div>`).join('');
 document.querySelectorAll('[data-mission]').forEach(x=>x.onchange=()=>{state.missions[x.dataset.mission]=x.checked;save()});
}
function renderTeams(){
 const names=['별빛조','파도조','나침반조'];
 $('#teamBoard').innerHTML=names.map(n=>`<div class="team-column"><h3>${n}</h3>${D.students.filter(s=>state.teams[s.id]===n).map(s=>`<span>${s.name}</span>`).join('')||'<small>아직 배정 없음</small>'}</div>`).join('');
}
function stats(){
 const attend=D.students.filter(s=>state.attendance[s.id]).length;
 $('#attendanceCount').textContent=attend;
 $('#openMissionCount').textContent=Object.values(state.missions).filter(Boolean).length;
 $('#totalScore').textContent=Object.values(state.scores).reduce((a,b)=>a+Number(b||0),0);
}
function renderAll(){renderStudents();renderMissions();renderTeams();stats();$('#noticeInput').value=state.notice||''}
$('#selectAllBtn').onclick=()=>{D.students.forEach(s=>state.attendance[s.id]=true);save()};
$('#makeTeamsBtn').onclick=()=>{
 let list=D.students.filter(s=>state.attendance[s.id]);
 if(!list.length){alert('먼저 참석 학생을 체크하세요.');return}
 list=list.sort(()=>Math.random()-.5);
 const names=['별빛조','파도조','나침반조']; state.teams={};
 list.forEach((s,i)=>state.teams[s.id]=names[i%3]);save();
};
$('#saveNoticeBtn').onclick=()=>{state.notice=$('#noticeInput').value.trim();save();alert('공지가 저장되었습니다.')};
$('#changePasswordBtn').onclick=()=>{const p=$('#newPassword').value;if(p.length<4)return alert('4자리 이상 입력하세요.');localStorage.setItem('sj_admin_password',p);$('#newPassword').value='';alert('비밀번호가 변경되었습니다.')};
$('#resetDataBtn').onclick=()=>{if(confirm('출석, 점수, 조 편성, 미션 상태를 모두 초기화할까요?')){localStorage.removeItem('sj_state');location.reload()}};
$('#exportBtn').onclick=()=>{
 const blob=new Blob([JSON.stringify(state,null,2)],{type:'application/json'}),a=document.createElement('a');
 a.href=URL.createObjectURL(blob);a.download='sj-expedition-backup.json';a.click();URL.revokeObjectURL(a.href);
};
renderAll();