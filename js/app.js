const D=window.SJ_DATA;
const $=s=>document.querySelector(s);
const store={
 get:(k,d)=>{try{return JSON.parse(localStorage.getItem(k))??d}catch{return d}},
 set:(k,v)=>localStorage.setItem(k,JSON.stringify(v))
};
const state=store.get('sj_state',{attendance:{},scores:{},teams:{},missions:{},avatars:{},completed:{},notice:''});
D.missions.forEach(m=>{if(state.missions[m.id]===undefined)state.missions[m.id]=m.open});
let currentId=localStorage.getItem('sj_current_student');

function characterHTML(a){
 return `<div class="ch-glow" style="--accent:${a.accent}"></div>
 <svg viewBox="0 0 220 290" role="img" aria-label="${a.name}">
 <defs><linearGradient id="shirt-${a.id}" x1="0" y1="0" x2="1" y2="1"><stop stop-color="${a.accent}"/><stop offset="1" stop-color="#273863"/></linearGradient></defs>
 <ellipse cx="110" cy="271" rx="62" ry="12" fill="rgba(0,0,0,.25)"/>
 <path d="M65 145 Q110 120 155 145 L165 235 Q110 260 55 235Z" fill="url(#shirt-${a.id})"/>
 <path d="M72 160 L42 220" stroke="${a.skin}" stroke-width="18" stroke-linecap="round"/><path d="M148 160 L178 220" stroke="${a.skin}" stroke-width="18" stroke-linecap="round"/>
 <path d="M83 230 L78 270M137 230 L142 270" stroke="#15213f" stroke-width="22" stroke-linecap="round"/>
 <circle cx="110" cy="94" r="56" fill="${a.skin}"/>
 <path d="M57 91 Q57 30 110 27 Q169 28 165 95 Q145 61 110 61 Q78 61 57 91Z" fill="${a.hair}"/>
 ${a.gender==='F'?`<path d="M62 75 Q45 130 70 153M158 75 Q175 130 150 153" stroke="${a.hair}" stroke-width="18" stroke-linecap="round"/>`:''}
 <circle cx="90" cy="98" r="5" fill="#24304a"/><circle cx="130" cy="98" r="5" fill="#24304a"/>
 <path d="M96 119 Q110 132 124 119" fill="none" stroke="#c56d70" stroke-width="5" stroke-linecap="round"/>
 <path d="M77 144 Q110 165 143 144" fill="none" stroke="#fff" stroke-width="7" opacity=".85"/>
 <path d="M86 61 Q110 46 138 60" stroke="${a.hair}" stroke-width="16" stroke-linecap="round"/>
 </svg>`;
}

function show(view){
 ['#loginView','#avatarView','#dashboardView'].forEach(x=>$(x).classList.add('hidden'));
 $(view).classList.remove('hidden');
 $('#bottomNav').classList.toggle('hidden',view!=='#dashboardView');
}

function initLogin(){
 $('#studentGrid').innerHTML=D.students.map(s=>`<button class="student-card" data-id="${s.id}">
 <span>${s.grade}학년</span><b>${s.name}</b><small>${s.gender==='M'?'남학생':'여학생'}</small></button>`).join('');
 document.querySelectorAll('.student-card').forEach(b=>b.onclick=()=>{
  currentId=b.dataset.id; localStorage.setItem('sj_current_student',currentId);
  if(!state.avatars[currentId]) renderAvatars(); else renderDashboard();
 });
}

function renderAvatars(){
 const s=D.students.find(x=>x.id===currentId); show('#avatarView');
 const avatars=D.avatars.filter(a=>a.gender===s.gender);
 $('#avatarGrid').innerHTML=avatars.map(a=>`<button class="avatar-card" data-id="${a.id}">
 <div class="character mini">${characterHTML(a)}</div><b>${a.name}</b><span>선택하기</span></button>`).join('');
 document.querySelectorAll('.avatar-card').forEach(b=>b.onclick=()=>{
  state.avatars[currentId]=b.dataset.id; store.set('sj_state',state); renderDashboard();
 });
}

function getXp(id){
 const score=Number(state.scores[id]||0);
 const done=state.completed[id]||[];
 return score + D.missions.filter(m=>done.includes(m.id)).reduce((n,m)=>n+m.xp,0);
}
function renderDashboard(){
 const s=D.students.find(x=>x.id===currentId); if(!s)return show('#loginView');
 const a=D.avatars.find(x=>x.id===state.avatars[currentId])||D.avatars.find(x=>x.gender===s.gender);
 show('#dashboardView');
 $('#studentName').textContent=s.name;
 const team=state.teams[currentId]||'미배정'; $('#teamChip').textContent=team; $('#teamName').textContent=team;
 $('#heroCharacter').innerHTML=characterHTML(a);
 const xp=getXp(currentId), level=Math.floor(xp/100)+1, within=xp%100;
 $('#levelText').textContent=`Lv.${level}`; $('#xpText').textContent=`${within} / 100 EXP`; $('#xpBar').style.width=within+'%';
 $('#personalScore').textContent=state.scores[currentId]||0;
 const teamMembers=Object.keys(state.teams).filter(id=>state.teams[id]===team);
 const teamScore=teamMembers.reduce((n,id)=>n+Number(state.scores[id]||0),0); $('#teamScore').textContent=teamScore+'점';
 const eq=['🎒','🧢','🧭','📷','🇰🇷','🔭']; const unlocked=Math.min(eq.length,Math.max(1,Math.floor(level/2)+1));
 $('#equipmentRow').innerHTML=eq.map((x,i)=>`<span class="${i<unlocked?'on':''}">${x}</span>`).join('');
 renderMissions(); renderBadges(level);
}
function renderMissions(){
 const open=D.missions.filter(m=>state.missions[m.id]);
 const done=state.completed[currentId]||[];
 $('#missionList').innerHTML=open.map(m=>`<article class="mission-card ${done.includes(m.id)?'done':''}">
 <div class="mission-icon">${done.includes(m.id)?'✓':m.icon}</div><div><span class="mission-type">${m.type}</span><h4>${m.title}</h4><p>${m.desc}</p></div><b>+${m.xp}<small> EXP</small></b></article>`).join('')||'<p class="empty">아직 공개된 미션이 없습니다.</p>';
 const count=open.filter(m=>done.includes(m.id)).length, pct=open.length?Math.round(count/open.length*100):0;
 $('#missionCount').textContent=`${count} / ${open.length} 완료`; $('#missionPercent').textContent=pct+'%';
}
function renderBadges(level){
 const defs=[['🧭','원정대 입단',1],['🎢','탑승왕',2],['📸','포토그래퍼',3],['🤝','협동왕',4],['🏝️','울릉도 탐험가',6],['🇰🇷','독도 수호대',8]];
 $('#badgeList').innerHTML=defs.map(([i,n,l])=>`<div class="badge ${level>=l?'earned':''}"><span>${i}</span><b>${n}</b><small>${level>=l?'획득 완료':`Lv.${l} 해금`}</small></div>`).join('');
}
$('#resetBtn').onclick=()=>{localStorage.removeItem('sj_current_student');currentId=null;show('#loginView')};
$('#changeAvatarBtn').onclick=renderAvatars;
initLogin();
if(currentId){if(state.avatars[currentId])renderDashboard();else renderAvatars()} else show('#loginView');