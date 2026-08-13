const D=window.SJ_DATA;
const store={get:(k,d)=>{try{return JSON.parse(localStorage.getItem(k))??d}catch{return d}},set:(k,v)=>localStorage.setItem(k,JSON.stringify(v))};
const state=store.get('sj_state',{attendance:{},scores:{},teams:{},missions:{},avatars:{},completed:{},notice:'',dress:{}});
const currentId=localStorage.getItem('sj_current_student');
if(!currentId)location.replace('student.html');
const student=D.students.find(s=>s.id===currentId);const avatar=D.avatars.find(a=>a.id===state.avatars[currentId])||D.avatars.find(a=>a.gender===student.gender);
const xp=Number(state.scores[currentId]||0)+D.missions.filter(m=>(state.completed[currentId]||[]).includes(m.id)).reduce((n,m)=>n+m.xp,0);const level=Math.floor(xp/100)+1;
const items=[
{id:'outfit',icon:'🧥',name:'탐험복',level:1,src:'assets/items/outfit.svg',layer:'body-layer',hint:'버스 미션 보상'},
{id:'hat',icon:'🧢',name:'탐험 모자',level:2,src:'assets/items/hat.svg',layer:'head-layer',hint:'롯데월드 탐험 보상'},
{id:'scarf',icon:'🧣',name:'컬러 스카프',level:3,src:'assets/items/scarf.svg',layer:'neck-layer',hint:'원정 성장 보상'},
{id:'camera',icon:'📷',name:'카메라',level:4,src:'assets/items/camera.svg',layer:'chest-layer',hint:'사진 미션 보상'},
{id:'compass',icon:'🧭',name:'나침반',level:5,src:'assets/items/compass.svg',layer:'hand-layer',hint:'울릉도 탐험 보상'},
{id:'flag',icon:'🇰🇷',name:'태극기 배지',level:6,src:'assets/items/badge.svg',layer:'chest-layer',hint:'독도 원정 보상'},
{id:'scope',icon:'🔭',name:'황금 망원경',level:8,src:'assets/items/telescope.svg',layer:'hand-layer',hint:'최종 미션 보상'}];
function baseFor(){const n=(avatar.id||'m1').slice(1);return `assets/characters/${avatar.gender==='F'?'female':'male'}-${n}.svg`}
function render(){const selected=state.dress[currentId]||[];const layers=items.filter(i=>selected.includes(i.id)).map(i=>`<img class="avatar-layer ${i.layer}" src="${i.src}" alt="${i.name}">`).join('');const backpack=selected.includes('outfit')?'<img class="avatar-layer back-layer" src="assets/items/backpack.svg" alt="배낭">':'';document.getElementById('characterMount').innerHTML=`<div class="layered-avatar" style="--accent:${avatar.accent}"><div class="avatar-halo"></div>${backpack}<img class="avatar-layer base-layer" src="${baseFor()}" alt="${avatar.name}">${layers}</div>`;document.getElementById('studentName').textContent=student.name;document.getElementById('equipCount').textContent=selected.length?`${selected.length}개 장비 장착 중`:'기본 장비만 착용';document.getElementById('locker').innerHTML=items.map(i=>{const unlocked=level>=i.level,on=selected.includes(i.id);return `<article class="${unlocked?'unlocked':''}"><span>${unlocked?i.icon:'🔒'}</span><div><b>${i.name}</b><small>${unlocked?i.hint:`Lv.${i.level}에서 해금`}</small></div>${unlocked?`<button data-item="${i.id}" class="${on?'on':''}">${on?'장착중':'장착'}</button>`:''}</article>`}).join('');document.querySelectorAll('#locker button').forEach(b=>b.onclick=()=>{const arr=state.dress[currentId]||[],id=b.dataset.item;state.dress[currentId]=arr.includes(id)?arr.filter(x=>x!==id):[...arr,id];store.set('sj_state',state);render()})}
render();
