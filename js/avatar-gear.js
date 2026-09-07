(function(){
 const gearMeta={
  vest:{label:'탐험복',emoji:'🧥',slot:'wear'},hat:{label:'모자',emoji:'👒',slot:'wear'},scarf:{label:'스카프',emoji:'🧣',slot:'wear'},backpack:{label:'가방',emoji:'🎒',slot:'wear'},shoes:{label:'신발',emoji:'🥾',slot:'wear'},camera:{label:'카메라',emoji:'📷',slot:'tool'},binoculars:{label:'망원경',emoji:'🔭',slot:'tool'},compass:{label:'나침반',emoji:'🧭',slot:'tool'},flag:{label:'태극기',emoji:'🇰🇷',slot:'tool'},badge:{label:'배지',emoji:'🏅',slot:'wear'}
 };
 const toolKeys=['camera','binoculars','compass','flag'];
 const colors=['#ef4444','#2563eb','#16a34a','#f59e0b','#7c3aed'];
 const profiles={m1:{name:'활발한 탐험가'},m2:{name:'든든한 전략가'},m3:{name:'긍정 에너지'},f1:{name:'밝은 기록가'},f2:{name:'차분한 지식가'},f3:{name:'다정한 소통가'}};
 const singles={vest:'vest',hat:'hat',scarf:'scarf',backpack:'backpack',shoes:'shoes',camera:'camera',binoculars:'binoculars',compass:'compass',flag:'flag',badge:'badge'};
 function normalizeState(s){s=s||{};s.gear=s.gear||{};s.gearColors=s.gearColors||{};Object.keys(gearMeta).forEach(k=>{if(!(k in s.gear))s.gear[k]=false;if(!s.gearColors[k])s.gearColors[k]=colors[0]});if(s.gearSystemVersion!==18){Object.keys(gearMeta).forEach(k=>s.gear[k]=false);s.gearSystemVersion=18;}let t=toolKeys.filter(k=>s.gear[k]);if(t.length>1)t.slice(0,-1).forEach(k=>s.gear[k]=false);return s}
 function stateKey(s){s=normalizeState(s);const on=Object.keys(gearMeta).filter(k=>s.gear[k]);if(!on.length)return'base';if(on.length===1)return singles[on[0]]||'base';const set=new Set(on);if(on.length===2&&set.has('hat')&&set.has('scarf'))return'hat_scarf';if(on.length===2&&set.has('backpack')&&set.has('camera'))return'backpack_camera';if(on.length===2&&set.has('backpack')&&set.has('binoculars'))return'binoculars_backpack';if(on.length>=7)return'full';// for mixed selections, prioritize the hand pose, then strongest wearable; chips below show the exact active set
 const tool=toolKeys.find(k=>set.has(k));if(tool)return tool;for(const k of ['vest','hat','scarf','backpack','shoes','badge'])if(set.has(k))return singles[k];return'base'}
 function imgPath(a,s){return `assets/arcade-v18/${a}-${stateKey(s)}.jpg?v=180`}
 function chips(s){const on=Object.keys(gearMeta).filter(k=>s.gear[k]);return on.length?`<div class="avatar-gear-chips">${on.map(k=>`<span>${gearMeta[k].emoji} ${gearMeta[k].label}</span>`).join('')}</div>`:''}
 function renderStage(el,a,s,opts={}){s=normalizeState(s);el.className=opts.small?'avatar-stage photo small':'avatar-stage photo';el.innerHTML=`<img class="arcade-photo" src="${imgPath(a,s)}" alt="${profiles[a]?.name||'캐릭터'}">${chips(s)}`}
 function renderChoice(el,a){const e=normalizeState({gearSystemVersion:18});el.innerHTML=`<img class="arcade-choice" src="assets/arcade-v18/${a}-base.jpg?v=180" alt="${profiles[a]?.name||'캐릭터'}">`}
 function toggleGear(s,k){s=normalizeState(s);const will=!s.gear[k];if(will&&gearMeta[k].slot==='tool')toolKeys.forEach(t=>s.gear[t]=false);s.gear[k]=will;return s}
 window.SJGear={gearMeta,toolKeys,colors,profiles,normalizeState,renderStage,renderChoice,toggleGear,stateKey,imgPath};
})();
