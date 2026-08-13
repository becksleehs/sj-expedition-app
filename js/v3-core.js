
const D=window.SJ_DATA;
const $=s=>document.querySelector(s);
const load=(k,d)=>{try{return JSON.parse(localStorage.getItem(k))??d}catch{return d}};
const save=(k,v)=>localStorage.setItem(k,JSON.stringify(v));
const defaultState={attendance:{},scores:{},teams:{},missions:{},avatars:{},completed:{},notice:'',dress:{},gearColors:{},dokdoStatus:'waiting'};
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
 outfit:['#c39a62','#315f43','#35679a','#9a574f','#6d589b'],
 hat:['#e4b66a','#cf6c50','#567ca9','#557456','#7b5b91'],
 scarf:['#1686df','#e3494f','#36a263','#8b56c2','#f09c38'],
 camera:['#313a48','#6a4429','#315c77','#8b3f4a','#6a6f7c'],
 compass:['#f4db8f','#e2b653','#d9824a','#70a4c9','#93b06a'],
 badge:['#ffffff','#ffd84b','#f28e9b','#74b8ef','#7fd1a4'],
 telescope:['#d9a82f','#bf6c3e','#477fa6','#6f9b5b','#8f5ca3']
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
function gearColor(id,key){
 if(!state.gearColors[id])state.gearColors[id]={};
 return state.gearColors[id][key]||GEAR_COLORS[key][0];
}
function shade(hex,amt){
 const n=parseInt(hex.replace('#',''),16),r=Math.max(0,Math.min(255,(n>>16)+amt)),
 g=Math.max(0,Math.min(255,((n>>8)&255)+amt)),b=Math.max(0,Math.min(255,(n&255)+amt));
 return '#'+[r,g,b].map(x=>x.toString(16).padStart(2,'0')).join('');
}
const GEAR_ALIGN={
 m1:{hat:[0,-2,1.00,0],scarf:[0,4,.96,0],outfit:[0,7,.97,0],camera:[0,5,.95,0],compass:[-2,2,.96,0],badge:[-2,2,.95,0],telescope:[-8,18,.90,-3]},
 m2:{hat:[0,0,.98,0],scarf:[0,5,.93,0],outfit:[0,9,.95,0],camera:[0,7,.93,0],compass:[-5,4,.94,0],badge:[-4,3,.93,0],telescope:[-12,20,.88,-4]},
 m3:{hat:[0,-1,1.01,0],scarf:[0,5,.95,0],outfit:[0,8,.96,0],camera:[0,6,.94,0],compass:[-4,3,.95,0],badge:[-3,2,.94,0],telescope:[-10,18,.89,-3]},
 f1:{hat:[0,-4,1.00,0],scarf:[0,8,.94,0],outfit:[0,10,.94,0],camera:[0,9,.92,0],compass:[-5,5,.92,0],badge:[-4,4,.92,0],telescope:[-14,24,.86,-5]},
 f2:{hat:[0,-3,.99,0],scarf:[0,8,.93,0],outfit:[0,11,.93,0],camera:[0,9,.91,0],compass:[-5,5,.91,0],badge:[-4,4,.91,0],telescope:[-14,24,.85,-5]},
 f3:{hat:[0,-3,1.00,0],scarf:[0,7,.94,0],outfit:[0,10,.94,0],camera:[0,8,.92,0],compass:[-5,4,.92,0],badge:[-4,3,.92,0],telescope:[-13,23,.86,-5]}
};
function gearSvg(key,color,avatarId){
 const dark=shade(color,-55), light=shade(color,45);
 const a=(GEAR_ALIGN[avatarId]&&GEAR_ALIGN[avatarId][key])||[0,0,1,0];
 const tr=`translate(${a[0]} ${a[1]}) translate(171 256) scale(${a[2]}) rotate(${a[3]}) translate(-171 -256)`;
 const shapes={
 outfit:`<path d="M112 223 Q171 205 230 223 L220 347 Q171 364 122 347Z" fill="${color}" stroke="${dark}" stroke-width="6"/><path d="M118 244 Q96 265 94 319" fill="none" stroke="${color}" stroke-width="25" stroke-linecap="round"/><path d="M224 244 Q246 265 248 319" fill="none" stroke="${color}" stroke-width="25" stroke-linecap="round"/><path d="M143 218 L171 254 L199 218 L192 325 L150 325Z" fill="${light}" stroke="${dark}" stroke-width="4"/>`,
 hat:`<ellipse cx="171" cy="92" rx="93" ry="22" fill="${color}" stroke="${dark}" stroke-width="6"/><path d="M116 92 Q122 39 171 34 Q220 39 226 92Z" fill="${light}" stroke="${dark}" stroke-width="6"/><path d="M121 78 Q171 95 221 78" fill="none" stroke="${dark}" stroke-width="13"/><ellipse cx="145" cy="63" rx="22" ry="12" fill="#4a87ae" stroke="#192b3d" stroke-width="5"/><ellipse cx="196" cy="63" rx="22" ry="12" fill="#4a87ae" stroke="#192b3d" stroke-width="5"/>`,
 scarf:`<path d="M132 206 Q171 223 210 206 Q204 238 171 247 Q138 238 132 206Z" fill="${color}" stroke="${dark}" stroke-width="5"/><path d="M190 229 L215 276 L195 288 L170 243Z" fill="${light}" stroke="${dark}" stroke-width="5"/>`,
 camera:`<path d="M136 220 Q171 272 206 220" fill="none" stroke="${dark}" stroke-width="7"/><rect x="133" y="274" width="76" height="55" rx="10" fill="${color}" stroke="${dark}" stroke-width="5"/><circle cx="171" cy="301" r="19" fill="${light}" stroke="${dark}" stroke-width="6"/><circle cx="171" cy="301" r="9" fill="${dark}"/>`,
 compass:`<path d="M213 288 Q240 305 238 333" fill="none" stroke="${dark}" stroke-width="7"/><circle cx="239" cy="351" r="24" fill="${color}" stroke="${dark}" stroke-width="5"/><circle cx="239" cy="351" r="15" fill="${light}" stroke="${dark}" stroke-width="2"/><path d="M239 335 L246 351 L239 368 L232 351Z" fill="#e15050"/>`,
 badge:`<rect x="197" y="258" width="39" height="28" rx="5" fill="${color}" stroke="${dark}" stroke-width="3"/><circle cx="216.5" cy="272" r="8" fill="#d94d4d"/><path d="M216.5 264 A8 8 0 0 1 216.5 280 A4 4 0 0 0 216.5 272 A4 4 0 0 1 216.5 264" fill="#315f9d"/>`,
 telescope:`<g transform="rotate(-28 242 314)"><rect x="202" y="301" width="87" height="29" rx="11" fill="${color}" stroke="${dark}" stroke-width="5"/><rect x="193" y="298" width="23" height="35" rx="7" fill="${dark}"/><rect x="278" y="294" width="25" height="42" rx="8" fill="${light}" stroke="${dark}" stroke-width="4"/></g>`
 };
 return `<svg class="gear ${key}" viewBox="0 0 342 512" aria-hidden="true"><g transform="${tr}">${shapes[key]}</g></svg>`;
}
function avatarStage(id, cls=''){
 const a=avatarFor(id); if(!a)return '';
 const selected=state.dress[id]||[];
 const layers=selected.map(k=>gearSvg(k,gearColor(id,k),a.id)).join('');
 return `<div class="v3-avatar-stage ${cls}" data-avatar="${a.id}" style="--accent:${a.accent}"><img src="${a.image}?v=310" alt="${a.name}">${layers}</div>`;
}
function persist(){save('sj_state',state)}
