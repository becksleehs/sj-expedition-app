
const D=window.SJ_DATA;
const $=s=>document.querySelector(s);
const load=(k,d)=>{try{return JSON.parse(localStorage.getItem(k))??d}catch{return d}};
const save=(k,v)=>localStorage.setItem(k,JSON.stringify(v));
const defaultState={attendance:{},scores:{},teams:{},missions:{},avatars:{},completed:{},notice:'',dress:{},dokdoStatus:'waiting'};
let state=load('sj_state',defaultState);
Object.keys(defaultState).forEach(k=>{if(state[k]===undefined)state[k]=defaultState[k]});
D.missions.forEach(m=>{if(state.missions[m.id]===undefined)state.missions[m.id]=m.open});
const GEAR=[
{id:'outfit',icon:'🧥',name:'탐험복',level:1,file:'outfit.svg'},
{id:'hat',icon:'🧢',name:'탐험 모자',level:2,file:'hat.svg'},
{id:'scarf',icon:'🧣',name:'파란 스카프',level:3,file:'scarf.svg'},
{id:'camera',icon:'📷',name:'카메라',level:4,file:'camera.svg'},
{id:'compass',icon:'🧭',name:'나침반',level:5,file:'compass.svg'},
{id:'badge',icon:'🇰🇷',name:'태극기 배지',level:6,file:'badge.svg'},
{id:'telescope',icon:'🔭',name:'황금 망원경',level:8,file:'telescope.svg'}];

function studentById(id){return D.students.find(x=>x.id===id)}
function avatarFor(id){
 const s=studentById(id); if(!s)return null;
 return D.avatars.find(a=>a.id===state.avatars[id])||D.avatars.find(a=>a.gender===s.gender);
}
function totalXp(id){
 const done=state.completed[id]||[];
 return Number(state.scores[id]||0)+D.missions.filter(m=>done.includes(m.id)).reduce((n,m)=>n+m.xp,0);
}
function avatarStage(id, cls=''){
 const a=avatarFor(id); if(!a)return '';
 const selected=state.dress[id]||[];
 const layers=GEAR.filter(g=>selected.includes(g.id)).map(g=>`<img class="gear ${g.id}" src="assets/gear-v3/${g.file}?v=300" alt="">`).join('');
 return `<div class="v3-avatar-stage ${cls}" style="--accent:${a.accent}"><img src="${a.image}?v=300" alt="${a.name}">${layers}</div>`;
}
function persist(){save('sj_state',state)}
