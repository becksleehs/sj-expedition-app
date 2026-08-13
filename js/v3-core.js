
const D=window.SJ_DATA;
const $=s=>document.querySelector(s);
const load=(k,d)=>{try{return JSON.parse(localStorage.getItem(k))??d}catch{return d}};
const save=(k,v)=>localStorage.setItem(k,JSON.stringify(v));
const defaultState={attendance:{},scores:{},teams:{},missions:{},avatars:{},completed:{},notice:'',dress:{},gearColors:{},gearColorIndex:{},dokdoStatus:'waiting'};
let state=load('sj_state',defaultState);
Object.keys(defaultState).forEach(k=>{if(state[k]===undefined)state[k]=defaultState[k]});
D.missions.forEach(m=>{if(state.missions[m.id]===undefined)state.missions[m.id]=m.open});
const GEAR=[
{id:'outfit',icon:'🧥',name:'탐험복',level:1},
{id:'hat',icon:'🧢',name:'탐험 모자',level:2},
{id:'scarf',icon:'🧣',name:'스카프',level:3},
{id:'camera',icon:'📷',name:'카메라',level:4},
{id:'compass',icon:'🧭',name:'나침반',level:5},
{id:'badge',icon:'🇰🇷',name:'태극기 배지',level:6},
{id:'telescope',icon:'🔭',name:'망원경',level:8}
];
const GEAR_COLORS={
 hat:['#d14b43','#d6a45f','#4b7fb3','#4d8a62','#845da3'],
 scarf:['#1686df','#db4a4f','#38a461','#8e5bc2','#e69735'],
 outfit:['#c49a62','#53764e','#4d78a7','#a85d54','#75629a'],
 camera:['#343d48','#765136','#3b6684','#924d55','#69717e'],
 compass:['#efd78f','#e5b94f','#d9844c','#72a6cb','#94b06b'],
 badge:['#ffffff','#ffd84b','#f18d9b','#76b9ee','#82d0a5'],
 telescope:['#d5a632','#ba6a40','#497fa5','#719a5e','#8e5da2']
};

function studentById(id){return D.students.find(x=>x.id===id)}
function avatarFor(id){
 const s=studentById(id); if(!s)return null;
 return D.avatars.find(a=>a.id===state.avatars[id])||D.avatars.find(a=>a.gender===s.gender);
}
function totalXp(id){
 const done=state.completed[id]||[];
 return Number(state.scores[id]||0)+D.missions.filter(m=>done.includes(m.id)).reduce((n,m)=>n+m.xp,0);
}
function gearIndex(id,key){
 if(!state.gearColorIndex)state.gearColorIndex={};
 if(!state.gearColorIndex[id])state.gearColorIndex[id]={};
 return Number(state.gearColorIndex[id][key]||0);
}
const ACC_ANCHOR={
 m1:{camera:[42,51,17],compass:[64,61,11],badge:[60,48,10],telescope:[61,58,22]},
 m2:{camera:[42,52,17],compass:[64,62,11],badge:[60,49,10],telescope:[60,59,22]},
 m3:{camera:[41,53,17],compass:[63,63,11],badge:[59,50,10],telescope:[58,57,23]},
 f1:{camera:[41,52,17],compass:[64,62,11],badge:[60,49,10],telescope:[61,58,22]},
 f2:{camera:[41,52,17],compass:[64,62,11],badge:[60,49,10],telescope:[61,58,22]},
 f3:{camera:[40,52,17],compass:[64,62,11],badge:[60,49,10],telescope:[59,56,23]}
};
function avatarStage(id, cls=''){
 const a=avatarFor(id); if(!a)return '';
 const selected=state.dress[id]||[];
 let layers='';
 for(const k of selected){
   if(['hat','scarf','outfit'].includes(k)){
     layers+=`<img class="integrated-patch ${k}" src="assets/gear-patches-v32/${a.id}/${k}-${gearIndex(id,k)}.png?v=320" alt="">`;
   }else{
     const an=(ACC_ANCHOR[a.id]&&ACC_ANCHOR[a.id][k])||[50,55,14];
     const c=(GEAR_COLORS[k]||['#fff'])[gearIndex(id,k)]||GEAR_COLORS[k][0];
     layers+=`<span class="small-gear ${k}" style="--x:${an[0]}%;--y:${an[1]}%;--s:${an[2]}%;--gear:${c}"><img src="assets/gear-v32/${k}.svg?v=320" alt=""></span>`;
   }
 }
 return `<div class="v3-avatar-stage ${cls}" data-avatar="${a.id}" style="--accent:${a.accent}">
   <img class="base-avatar" src="${a.image}?v=320" alt="${a.name}">${layers}
 </div>`;
}
function persist(){save('sj_state',state)}
