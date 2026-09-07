(function(){
  const profiles={
    f1:{name:'지유 · 밝고 상냥한 탐험가',accent:'#ef6fa7'},
    f2:{name:'서연 · 차분하고 똑똑한 탐험가',accent:'#8f78d8'},
    f3:{name:'다온 · 활발하고 씩씩한 탐험가',accent:'#5aa7e8'},
    m1:{name:'민준 · 호기심 많은 탐험가',accent:'#5aa7e8'},
    m2:{name:'준호 · 침착하고 든든한 탐험가',accent:'#64b787'},
    m3:{name:'태윤 · 밝고 에너지 넘치는 탐험가',accent:'#ef9a4c'}
  };
  const presetMeta={
    base:{label:'기본형',emoji:'🙂'},
    hat:{label:'탐험 모자',emoji:'👒'},
    scarf:{label:'스카프',emoji:'🧣'},
    vest:{label:'탐험복',emoji:'🧥'},
    vesthat:{label:'탐험복+모자',emoji:'🧭'},
    camera:{label:'카메라',emoji:'📷'},
    binoculars:{label:'망원경',emoji:'🔭'},
    badge:{label:'배지(태극기)',emoji:'🇰🇷'},
    combo:{label:'조합 예시',emoji:'✨'}
  };
  const order=Object.keys(presetMeta);
  function normalizeState(s){
    s=s||{};
    if(!order.includes(s.avatarPreset)) s.avatarPreset='base';
    s.presetSystemVersion=24;
    return s;
  }
  function asset(id,state){
    const safe=profiles[id]?id:'f1';
    const p=order.includes(state)?state:'base';
    return `assets/avatar-v24/${safe}-${p}.png?v=240`;
  }
  function renderStage(el,id,s,opts={}){
    s=normalizeState(s||{});
    const state=s.avatarPreset||'base';
    el.className='avatar-stage exact-v24'+(opts.small?' small':'');
    el.innerHTML=`<img class="exact-avatar-v24" src="${asset(id,state)}" alt="${profiles[id]?.name||'승주 원정대 캐릭터'}"><div class="exact-preset-pill">${presetMeta[state].label}</div>`;
  }
  function renderChoice(el,id){
    el.className='char-art exact-choice-v24';
    el.innerHTML=`<img src="${asset(id,'base')}" alt="${profiles[id]?.name||'승주 원정대 캐릭터'}">`;
  }
  function setPreset(s,key){
    s=normalizeState(s);
    s.avatarPreset=(s.avatarPreset===key && key!=='base')?'base':key;
    return s;
  }
  function active(s){s=normalizeState(s);return s.avatarPreset==='base'?[]:[s.avatarPreset];}
  function presetLabel(s){s=normalizeState(s);return presetMeta[s.avatarPreset].label;}
  window.SJGear={profiles,presetMeta,normalizeState,renderStage,renderChoice,setPreset,active,presetLabel,asset};
})();
