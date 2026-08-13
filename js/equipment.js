const D=window.SJ_DATA,$=s=>document.querySelector(s);
const get=(k,d)=>{try{return JSON.parse(localStorage.getItem(k))??d}catch{return d}},set=(k,v)=>localStorage.setItem(k,JSON.stringify(v));
const state=get('sj_state',{attendance:{},scores:{},teams:{},missions:{},avatars:{},completed:{},notice:'',dress:{}});
let id=localStorage.getItem('sj_current_student');
let student=D.students.find(x=>x.id===id);
if(!student){ id=D.students[0].id; student=D.students[0]; localStorage.setItem('sj_current_student',id); }
if(!state.dress[id])state.dress[id]=[];
const avatar=D.avatars.find(a=>a.id===state.avatars[id])||D.avatars.find(a=>a.gender===student.gender);

const items=[
{id:'outfit',icon:'🧥',name:'탐험복',level:1,where:'몸통'},
{id:'hat',icon:'🧢',name:'탐험 모자',level:2,where:'머리'},
{id:'scarf',icon:'🧣',name:'파란 스카프',level:3,where:'목'},
{id:'camera',icon:'📷',name:'카메라',level:4,where:'가슴'},
{id:'compass',icon:'🧭',name:'나침반',level:5,where:'허리'},
{id:'badge',icon:'🇰🇷',name:'태극기 배지',level:6,where:'가슴'},
{id:'telescope',icon:'🔭',name:'황금 망원경',level:8,where:'손/어깨'}
];
const files={outfit:'outfit.svg',hat:'hat.svg',scarf:'scarf.svg',camera:'camera.svg',compass:'compass.svg',badge:'badge.svg',telescope:'telescope.svg'};
function totalXp(){const score=Number(state.scores[id]||0),done=state.completed[id]||[];return score+D.missions.filter(m=>done.includes(m.id)).reduce((n,m)=>n+m.xp,0)}
function stage(){
 const sel=state.dress[id]||[];
 const layers=sel.map(k=>`<img class="v24-gear ${k}" src="assets/custom-v24/${files[k]}?v=240" alt="">`).join('');
 return `<div class="v24-avatar-stage big" style="--accent:${avatar.accent}"><div class="avatar-halo"></div><img class="v24-base" src="${avatar.image}?v=240" alt="${avatar.name}">${layers}</div>`;
}
function render(){
 const xp=totalXp(),lv=Math.floor(xp/100)+1,sel=state.dress[id]||[];
 $('#equipStudentName').textContent=`${student.name}의 탐험가`;
 $('#equipLevel').textContent=`Lv.${lv}`; $('#equipXp').textContent=`${xp} EXP`;
 $('#equipStage').innerHTML=stage();
 $('#equipGrid').innerHTML=items.map(i=>{
  const locked=lv<i.level,on=sel.includes(i.id);
  return `<button class="v24-equip-item ${on?'on':''} ${locked?'locked':''}" data-id="${i.id}" ${locked?'disabled':''}>
  <span>${locked?'🔒':i.icon}</span><b>${i.name}</b><small>${locked?`Lv.${i.level} 해금`:i.where}</small><em>${on?'장착 중':locked?'잠김':'장착하기'}</em></button>`;
 }).join('');
 document.querySelectorAll('.v24-equip-item:not(.locked)').forEach(b=>b.onclick=()=>{
  const k=b.dataset.id,arr=state.dress[id]||[];
  state.dress[id]=arr.includes(k)?arr.filter(x=>x!==k):[...arr,k];
  set('sj_state',state);render();
 });
}
render();