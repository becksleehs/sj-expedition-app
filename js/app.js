const D=window.SJ_DATA;
const $=s=>document.querySelector(s);
const store={get:(k,d)=>{try{return JSON.parse(localStorage.getItem(k))??d}catch{return d}},set:(k,v)=>localStorage.setItem(k,JSON.stringify(v))};
const state=store.get('sj_state',{attendance:{},scores:{},teams:{},missions:{},avatars:{},completed:{},notice:'',dress:{}});
D.missions.forEach(m=>{if(state.missions[m.id]===undefined)state.missions[m.id]=m.open});
let currentId=localStorage.getItem('sj_current_student');

const items=[
{id:'hat',icon:'🧢',name:'탐험 모자',level:1},{id:'scarf',icon:'🧣',name:'컬러 스카프',level:2},
{id:'camera',icon:'📷',name:'카메라',level:3},{id:'compass',icon:'🧭',name:'나침반',level:4},
{id:'flag',icon:'🇰🇷',name:'태극기 배지',level:6},{id:'scope',icon:'🔭',name:'황금 망원경',level:8}
];

function characterHTML(a,id){
 const selected=state.dress[id]||[];
 const deco=items.filter(i=>selected.includes(i.id)).map((i,n)=>`<span class="dress-item d${n%4}">${i.icon}</span>`).join('');
 return `<div class="cute-avatar" style="--accent:${a.accent}"><div class="avatar-halo"></div><img src="${a.image}" alt="${a.name}"><div class="dress-layer">${deco}</div></div>`;
}
function show(view){['#loginView','#avatarView','#dashboardView'].forEach(x=>$(x).classList.add('hidden'));$(view).classList.remove('hidden');$('#bottomNav').classList.toggle('hidden',view!=='#dashboardView')}
function initLogin(){
 $('#studentGrid').innerHTML=D.students.map(s=>`<button class="student-card" data-id="${s.id}"><span>${s.grade}학년</span><b>${s.name}</b><small>${s.gender==='M'?'남학생':'여학생'}</small></button>`).join('');
 document.querySelectorAll('.student-card').forEach(b=>b.onclick=()=>{currentId=b.dataset.id;localStorage.setItem('sj_current_student',currentId);state.avatars[currentId]?renderDashboard():renderAvatars()});
}
function renderAvatars(){
 const s=D.students.find(x=>x.id===currentId);show('#avatarView');
 $('#avatarGrid').innerHTML=D.avatars.filter(a=>a.gender===s.gender).map(a=>`<button class="avatar-card" data-id="${a.id}"><div class="avatar-preview"><img src="${a.image}" alt="${a.name}"></div><b>${a.name}</b><span>이 캐릭터 선택</span></button>`).join('');
 document.querySelectorAll('.avatar-card').forEach(b=>b.onclick=()=>{state.avatars[currentId]=b.dataset.id;store.set('sj_state',state);renderDashboard()});
}
function getXp(id){const score=Number(state.scores[id]||0),done=state.completed[id]||[];return score+D.missions.filter(m=>done.includes(m.id)).reduce((n,m)=>n+m.xp,0)}
function renderDashboard(){
 const s=D.students.find(x=>x.id===currentId);if(!s)return show('#loginView');
 const a=D.avatars.find(x=>x.id===state.avatars[currentId])||D.avatars.find(x=>x.gender===s.gender);
 show('#dashboardView');$('#studentName').textContent=s.name;
 const team=state.teams[currentId]||'미배정';$('#teamChip').textContent=team;$('#teamName').textContent=team;
 $('#heroCharacter').innerHTML=characterHTML(a,currentId);
 const xp=getXp(currentId),level=Math.floor(xp/100)+1,within=xp%100;
 $('#levelText').textContent=`Lv.${level}`;$('#xpText').textContent=`${within} / 100 EXP`;$('#xpBar').style.width=within+'%';
 $('#personalScore').textContent=state.scores[currentId]||0;
 const members=Object.keys(state.teams).filter(id=>state.teams[id]===team);
 $('#teamScore').textContent=members.reduce((n,id)=>n+Number(state.scores[id]||0),0)+'점';
 renderDress(level);renderMissions();renderBadges(level);
}
function renderDress(level){
 const selected=state.dress[currentId]||[];
 $('#equipmentRow').innerHTML=items.map(i=>`<button class="dress-btn ${selected.includes(i.id)?'on':''} ${level<i.level?'locked':''}" data-item="${i.id}" ${level<i.level?'disabled':''}><span>${i.icon}</span><small>${level<i.level?`Lv.${i.level}`:i.name}</small></button>`).join('');
 document.querySelectorAll('.dress-btn:not(.locked)').forEach(b=>b.onclick=()=>{const arr=state.dress[currentId]||[],id=b.dataset.item;state.dress[currentId]=arr.includes(id)?arr.filter(x=>x!==id):[...arr,id];store.set('sj_state',state);renderDashboard()});
}
function renderMissions(){
 const open=D.missions.filter(m=>state.missions[m.id]),done=state.completed[currentId]||[];
 $('#missionList').innerHTML=open.map(m=>`<article class="mission-card ${done.includes(m.id)?'done':''}"><div class="mission-icon">${done.includes(m.id)?'✓':m.icon}</div><div><span class="mission-type">${m.type}</span><h4>${m.title}</h4><p>${m.desc}</p></div><b>+${m.xp}<small> EXP</small></b></article>`).join('')||'<p class="empty">아직 공개된 미션이 없습니다.</p>';
 const count=open.filter(m=>done.includes(m.id)).length,pct=open.length?Math.round(count/open.length*100):0;$('#missionCount').textContent=`${count} / ${open.length} 완료`;$('#missionPercent').textContent=pct+'%';
}
function renderBadges(level){
 const defs=[['🧭','원정대 입단',1],['🎢','탑승왕',2],['📸','포토그래퍼',3],['🤝','협동왕',4],['🏝️','울릉도 탐험가',6],['🇰🇷','독도 수호대',8]];
 $('#badgeList').innerHTML=defs.map(([i,n,l])=>`<div class="badge ${level>=l?'earned':''}"><span>${i}</span><b>${n}</b><small>${level>=l?'획득 완료':`Lv.${l} 해금`}</small></div>`).join('');
}
$('#resetBtn').onclick=()=>{localStorage.removeItem('sj_current_student');currentId=null;show('#loginView')};
$('#changeAvatarBtn').onclick=renderAvatars;
initLogin();currentId?(state.avatars[currentId]?renderDashboard():renderAvatars()):show('#loginView');