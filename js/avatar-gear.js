(function(){
  const gearMeta={
    scarf:{label:'스카프',emoji:'🧣',slot:'wear'},
    vest:{label:'탐험복',emoji:'🧥',slot:'wear'},
    camera:{label:'카메라',emoji:'📷',slot:'tool'},
    compass:{label:'나침반',emoji:'🧭',slot:'tool'},
    binoculars:{label:'망원경',emoji:'🔭',slot:'tool'},
    flag:{label:'태극기',emoji:'🇰🇷',slot:'tool'},
    badge:{label:'원정대 배지',emoji:'🏅',slot:'wear'}
  };
  const colors=['#ef4444','#2563eb','#16a34a','#f59e0b','#7c3aed'];
  const toolKeys=Object.keys(gearMeta).filter(k=>gearMeta[k].slot==='tool');

  function normalizeState(s){
    s.gear=s.gear||{}; s.gearColors=s.gearColors||{};
    Object.keys(gearMeta).forEach(k=>{
      if(!(k in s.gear)) s.gear[k]=false;
      if(!s.gearColors[k]) s.gearColors[k]=colors[0];
    });
    // v1.6 migration: old versions could stack many large layers on the face/body.
    // Clear that one time so every device starts from a clean, predictable state.
    if(s.gearSystemVersion!==16){
      Object.keys(gearMeta).forEach(k=>s.gear[k]=false);
      s.gearSystemVersion=16;
    }
    // Only one hand/tool item at a time. Wearables may coexist.
    const activeTools=toolKeys.filter(k=>s.gear[k]);
    if(activeTools.length>1){
      activeTools.slice(0,-1).forEach(k=>s.gear[k]=false);
    }
    return s;
  }

  function common(color){
    return `fill="${color}" stroke="#3e3027" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round"`;
  }
  function svgLayer(type,color){
    const C=color||'#ef4444', K=common(C);
    // All coordinates use the same 128 x 210 avatar canvas.
    if(type==='scarf') return `
      <path ${K} d="M48 77 Q63 83 79 77 L77 84 Q63 90 50 84 Z"/>
      <path ${K} d="M64 84 L72 105 L65 101 L59 108 L58 86 Z"/>`;
    if(type==='vest') return `
      <path ${K} opacity=".86" d="M47 91 L55 86 L62 95 L69 86 L78 91 L76 137 L49 137 Z"/>
      <path d="M62 96 V136" stroke="#fff" stroke-opacity=".6" stroke-width="2"/>
      <rect x="51" y="116" width="7" height="7" rx="2" fill="#fff" fill-opacity=".38"/>
      <rect x="68" y="116" width="7" height="7" rx="2" fill="#fff" fill-opacity=".38"/>`;
    if(type==='camera') return `
      <path d="M53 88 Q63 100 72 88" fill="none" stroke="#2f3640" stroke-width="1.6"/>
      <rect x="54" y="111" width="24" height="17" rx="4" ${K}/>
      <rect x="58" y="107" width="8" height="5" rx="2" fill="#2f3640"/>
      <circle cx="66" cy="119.5" r="6" fill="#dff6ff" stroke="#26313c" stroke-width="2"/>
      <circle cx="66" cy="119.5" r="2.4" fill="#2879c8"/>`;
    if(type==='compass') return `
      <path d="M78 105 Q84 110 86 120" fill="none" stroke="#6d4b2b" stroke-width="1.5"/>
      <circle cx="85" cy="126" r="8.5" fill="#fff7dc" stroke="#4b3523" stroke-width="1.8"/>
      <circle cx="85" cy="126" r="5.5" fill="#cceeff" stroke="#7b674f" stroke-width="1"/>
      <path d="M85 121 l2.4 5 -4.8 2.2 z" fill="${C}"/>`;
    if(type==='binoculars') return `
      <path d="M50 88 Q63 100 77 88" fill="none" stroke="#314052" stroke-width="1.6"/>
      <g transform="translate(51 108)">
        <rect x="5" y="5" width="19" height="7" rx="3" ${K}/>
        <circle cx="6" cy="9" r="6" ${K}/><circle cx="24" cy="9" r="6" ${K}/>
        <circle cx="6" cy="9" r="2.7" fill="#bcefff"/><circle cx="24" cy="9" r="2.7" fill="#bcefff"/>
      </g>`;
    if(type==='flag') return `
      <g>
        <path d="M103 74 V151" stroke="#6b4a2b" stroke-width="2.7"/>
        <path d="M103 76 Q92 72 81 77 L81 95 Q92 90 103 94 Z" fill="#fff" stroke="#4b3627" stroke-width="1.3"/>
        <path d="M88 84 a4 4 0 0 0 8 0 a4 4 0 0 1-8 0" fill="#2563eb"/>
        <path d="M88 84 a4 4 0 0 1 8 0 a4 4 0 0 0-8 0" fill="#ef4444"/>
        <path d="M84 79 l4 1 M96 79 l4 1 M84 91 l4-1 M96 91 l4-1" stroke="#111827" stroke-width="1"/>
      </g>`;
    if(type==='badge') return `
      <g transform="translate(76 101)">
        <circle r="6.5" fill="#ffd453" stroke="#694914" stroke-width="1.6"/>
        <path d="M0-4 1.4-1.5 4.5-.8 2.2 1.3 2.8 4.2 0 2.7-2.8 4.2-2.2 1.3-4.5-.8-1.4-1.5Z" fill="${C}"/>
      </g>`;
    return '';
  }

  function renderStage(el,avatar,state,opts={}){
    state=normalizeState(state||{});
    el.className=opts.small?'avatar-stage small':'avatar-stage';
    const base=`<img class="avatar-base" src="assets/characters-clean/${avatar}.png?v=160" alt="선택 캐릭터">`;
    const order=['vest','scarf','badge','camera','compass','binoculars','flag'];
    const layers=order.filter(k=>state.gear[k]).map(k=>
      `<svg class="gear-layer gear-${k}" viewBox="0 0 128 210" preserveAspectRatio="none" aria-hidden="true">${svgLayer(k,state.gearColors[k])}</svg>`
    ).join('');
    el.innerHTML=base+layers;
  }

  function toggleGear(state,key){
    state=normalizeState(state);
    const willOn=!state.gear[key];
    if(willOn && gearMeta[key].slot==='tool') toolKeys.forEach(k=>state.gear[k]=false);
    state.gear[key]=willOn;
    return state;
  }

  window.SJGear={gearMeta,colors,normalizeState,renderStage,toggleGear,toolKeys};
})();
