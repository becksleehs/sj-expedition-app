(function(){
 const gearMeta={
  vest:{label:'탐험복',emoji:'🧥',slot:'wear'},hat:{label:'모자',emoji:'👒',slot:'wear'},scarf:{label:'스카프',emoji:'🧣',slot:'wear'},backpack:{label:'가방',emoji:'🎒',slot:'wear'},shoes:{label:'신발',emoji:'🥾',slot:'wear'},camera:{label:'카메라',emoji:'📷',slot:'tool'},binoculars:{label:'망원경',emoji:'🔭',slot:'tool'},compass:{label:'나침반',emoji:'🧭',slot:'tool'},flag:{label:'태극기',emoji:'🇰🇷',slot:'tool'},badge:{label:'배지',emoji:'🏅',slot:'wear'}
 };
 const colors=['#ef4444','#2563eb','#16a34a','#f59e0b','#7c3aed'];
 const profiles={m1:{name:'활발한 탐험가'},m2:{name:'든든한 전략가'},m3:{name:'긍정 에너지'},f1:{name:'밝은 기록가'},f2:{name:'차분한 지식가'},f3:{name:'다정한 소통가'}};
 const exact={
  '':'base','vest':'vest','hat':'hat','scarf':'scarf','backpack':'backpack','shoes':'shoes','camera':'camera','binoculars':'binoculars','compass':'compass','flag':'flag','badge':'badge',
  'hat+scarf':'hat_scarf','backpack+camera':'backpack_camera','backpack+binoculars':'binoculars_backpack'
 };
 const order=['vest','hat','scarf','backpack','shoes','camera','binoculars','compass','flag','badge'];
 function normalizeState(s){s=s||{};s.gear=s.gear||{};s.gearColors=s.gearColors||{};order.forEach(k=>{if(!(k in s.gear))s.gear[k]=false;if(!s.gearColors[k])s.gearColors[k]=colors[0]});if(s.gearSystemVersion!==19){order.forEach(k=>s.gear[k]=false);s.gearSystemVersion=19;s.lastGearChanged=null;}return s}
 function active(s){s=normalizeState(s);return order.filter(k=>s.gear[k]);}
 function stateKey(s){
   s=normalizeState(s); const on=active(s); const sorted=order.filter(k=>on.includes(k)); const key=sorted.join('+');
   if(exact[key]) return exact[key];
   // exact two-item combinations independent of canonical order
   const set=new Set(on);
   if(on.length===2&&set.has('hat')&&set.has('scarf')) return 'hat_scarf';
   if(on.length===2&&set.has('backpack')&&set.has('camera')) return 'backpack_camera';
   if(on.length===2&&set.has('backpack')&&set.has('binoculars')) return 'binoculars_backpack';
   // For 3+ selections, use a visibly equipped full-body photo instead of leaving the image unchanged.
   if(on.length>=3) return 'full';
   // For other two-item mixes, emphasize the most recently toggled selected item, otherwise the second item.
   if(on.length===2){const last=s.lastGearChanged&&s.gear[s.lastGearChanged]?s.lastGearChanged:on[1];return exact[last]||'full';}
   return on.length?exact[on[0]]||'base':'base';
 }
 function imgPath(a,s){return `assets/arcade-v19/${a}-${stateKey(s)}.png?v=190`}
 function chips(s){const on=active(s);return on.length?`<div class="avatar-gear-chips" aria-label="선택 장비">${on.map(k=>`<span title="${gearMeta[k].label}">${gearMeta[k].emoji}</span>`).join('')}</div>`:''}
 function renderStage(el,a,s,opts={}){s=normalizeState(s);el.className=opts.small?'avatar-stage photo small':'avatar-stage photo';el.innerHTML=`<img class="arcade-photo" src="${imgPath(a,s)}" alt="${profiles[a]?.name||'캐릭터'}">${chips(s)}`}
 function renderChoice(el,a){el.innerHTML=`<img class="arcade-choice" src="assets/arcade-v19/${a}-base.png?v=190" alt="${profiles[a]?.name||'캐릭터'}">`}
 function toggleGear(s,k){s=normalizeState(s);s.gear[k]=!s.gear[k];s.lastGearChanged=k;return s}
 window.SJGear={gearMeta,colors,profiles,normalizeState,renderStage,renderChoice,toggleGear,stateKey,imgPath,active};
})();
