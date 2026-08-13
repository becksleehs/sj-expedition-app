const D=window.SJ_DATA;
const $=s=>document.querySelector(s);
const store={get:(k,d)=>{try{return JSON.parse(localStorage.getItem(k))??d}catch{return d}},set:(k,v)=>localStorage.setItem(k,JSON.stringify(v))};
const currentId=localStorage.getItem('sj_current_student');
if(!currentId)location.replace('student.html');
const student=D.students.find(s=>s.id===currentId);
if(!student)location.replace('student.html');
const state=store.get('sj_state',{attendance:{},scores:{},teams:{},missions:{},avatars:{},completed:{},notice:'',dress:{}});
const avatar=D.avatars.find(a=>a.id===state.avatars[currentId])||D.avatars.find(a=>a.gender===student.gender);
if(!state.dress[currentId])state.dress[currentId]=[];

const items=[
{id:'outfit',icon:'🧥',name:'탐험복',level:1,src:'assets/equipment-v23/outfit.svg',where:'몸통 + 배낭'},
{id:'hat',icon:'🧢',name:'탐험 모자',level:2,src:'assets/equipment-v23/hat.svg',where:'머리'},
{id:'scarf',icon:'🧣',name:'컬러 스카프',level:3,src:'assets/equipment-v23/scarf.svg',where:'목'},
{id:'camera',icon:'📷',name:'카메라',level:4,src:'assets/equipment-v23/camera.svg',where:'가슴'},
{id:'compass',icon:'🧭',name:'나침반',level:5,src:'assets/equipment-v23/compass.svg',where:'허리'},
{id:'badge',icon:'🇰🇷',name:'태극기 배지',level:6,src:'assets/equipment-v23/badge.svg',where:'가슴'},
{id:'telescope',icon:'🔭',name:'황금 망원경',level:8,src:'assets/equipment-v23/telescope.svg',where:'손/어깨'}
];
function xp(){
 const score=Number(state.scores[currentId]||0),done=state.completed[currentId]||[];
 return score+D.missions.filter(m=>done.includes(m.id)).reduce((n,m)=>n+m.xp,0);
}
function layer(src,cls=''){return `<img class="gear-layer ${cls}" src="${src}?v=230" alt="">`;}
function character(){
 const selected=state.dress[currentId]||[];
 return `<div class="v23-character equipment-large" style="--accent:${avatar.accent}">
 <div class="v23-avatar-glow"></div>
 ${selected.includes('outfit')?layer('assets/equipment-v23/backpack.svg','behind'):''}
 <img class="v23-base-avatar" src="${avatar.image}?v=230" alt="${avatar.name}">
 ${selected.includes('outfit')?layer('assets/equipment-v23/outfit.svg','outfit-layer'):''}
 ${selected.includes('scarf')?layer('assets/equipment-v23/scarf.svg','scarf-layer'):''}
 ${selected.includes('camera')?layer('assets/equipment-v23/camera.svg','camera-layer'):''}
 ${selected.includes('compass')?layer('assets/equipment-v23/compass.svg','compass-layer'):''}
 ${selected.includes('badge')?layer('assets/equipment-v23/badge.svg','badge-layer'):''}
 ${selected.includes('telescope')?layer('assets/equipment-v23/telescope.svg','telescope-layer'):''}
 ${selected.includes('hat')?layer('assets/equipment-v23/hat.svg','hat-layer'):''}
 </div>`;
}
function render(){
 const total=xp(),level=Math.floor(total/100)+1;
 $('#equipmentStudentName').textContent=student.name;
 $('#equipmentLevel').textContent=`Lv.${level}`;
 $('#equipmentXp').textContent=`${total} EXP`;
 $('#equipmentCharacterStage').innerHTML=character();
 const selected=state.dress[currentId]||[];
 $('#equipmentLocker').innerHTML=items.map(i=>{
   const locked=level<i.level,on=selected.includes(i.id);
   return `<button class="equipment-v23-item ${on?'equipped':''} ${locked?'locked':''}" data-id="${i.id}" ${locked?'disabled':''}>
   <span class="eq-icon">${locked?'🔒':i.icon}</span>
   <b>${i.name}</b><small>${locked?`Lv.${i.level} 해금`:i.where}</small>
   <em>${on?'장착 중':locked?'잠김':'장착하기'}</em></button>`;
 }).join('');
 document.querySelectorAll('.equipment-v23-item:not(.locked)').forEach(b=>b.onclick=()=>{
   const id=b.dataset.id,arr=state.dress[currentId]||[];
   state.dress[currentId]=arr.includes(id)?arr.filter(x=>x!==id):[...arr,id];
   store.set('sj_state',state);render();
 });
}
render();