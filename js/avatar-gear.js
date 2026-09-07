(function(){
  const gearMeta={
    scarf:{label:'스카프',emoji:'🧣'},
    vest:{label:'탐험복',emoji:'🧥'},
    camera:{label:'카메라',emoji:'📷'},
    compass:{label:'나침반',emoji:'🧭'},
    binoculars:{label:'망원경',emoji:'🔭'},
    flag:{label:'태극기',emoji:'🇰🇷'},
    badge:{label:'원정대 배지',emoji:'🏅'}
  };
  const colors=['#ef4444','#2563eb','#16a34a','#f59e0b','#7c3aed'];
  function normalizeState(s){
    s.gear=s.gear||{}; s.gearColors=s.gearColors||{};
    Object.keys(gearMeta).forEach(k=>{ if(!(k in s.gear)) s.gear[k]=false; if(!s.gearColors[k]) s.gearColors[k]=colors[0]; });
    return s;
  }
  function svgLayer(type,color){
    const C=color||'#ef4444';
    const common=`fill="${C}" stroke="#473626" stroke-width="2.2" stroke-linejoin="round" stroke-linecap="round"`;
    if(type==='scarf') return `<path ${common} d="M46 73 Q64 81 82 73 L78 85 Q64 91 50 85 Z"/><path ${common} d="M69 84 L79 116 L67 108 L59 118 L58 87 Z"/>`;
    if(type==='vest') return `<path ${common} opacity=".93" d="M44 88 L54 82 L62 93 L70 82 L81 89 L78 139 L46 139 Z"/><path fill="#fff6" stroke="#473626" stroke-width="1.6" d="M59 94 L65 94 L65 136 L59 136 Z"/><circle cx="53" cy="116" r="4" fill="#fff9"/><circle cx="72" cy="116" r="4" fill="#fff9"/>`;
    if(type==='camera') return `<path ${common} d="M47 119 h31 a5 5 0 0 1 5 5 v20 a5 5 0 0 1-5 5 H47 a5 5 0 0 1-5-5 v-20 a5 5 0 0 1 5-5Z"/><path fill="#1f2937" stroke="#473626" stroke-width="2" d="M52 115 h10 l4 5 H50Z"/><circle cx="63" cy="134" r="8" fill="#bfe8ff" stroke="#1f2937" stroke-width="3"/><circle cx="63" cy="134" r="3" fill="#2563eb"/>`;
    if(type==='compass') return `<circle cx="87" cy="128" r="11" fill="#fff8e7" stroke="#473626" stroke-width="2.3"/><circle cx="87" cy="128" r="7" fill="#bde8ff" stroke="#7c5b39" stroke-width="1.5"/><path d="M87 122 l3 6 -6 3 3-9Z" fill="${C}" stroke="#473626" stroke-width="1"/>`;
    if(type==='binoculars') return `<g transform="translate(41 111)"><rect x="7" y="11" width="26" height="9" rx="4" ${common}/><circle cx="8" cy="16" r="8" ${common}/><circle cx="32" cy="16" r="8" ${common}/><circle cx="8" cy="16" r="4" fill="#9fe8ff"/><circle cx="32" cy="16" r="4" fill="#9fe8ff"/></g>`;
    if(type==='flag') return `<g transform="translate(82 65)"><path d="M0 10 v70" stroke="#6b4b2a" stroke-width="3.5"/><path d="M2 12 Q20 6 35 14 L35 38 Q20 30 2 36Z" fill="white" stroke="#473626" stroke-width="1.8"/><circle cx="18" cy="24" r="7" fill="#ef4444"/><path d="M11 24 a7 7 0 0 0 14 0 a7 7 0 0 1-14 0" fill="#2563eb"/></g>`;
    if(type==='badge') return `<g transform="translate(74 90)"><circle cx="0" cy="0" r="10" fill="#ffd34d" stroke="#7b5213" stroke-width="2.2"/><path d="M0-6 2-2 7-1 3 2 4 7 0 4-4 7-3 2-7-1-2-2Z" fill="${C}"/></g>`;
    return '';
  }
  function renderStage(el,avatar,state,opts={}){
    state=normalizeState(state||{});
    const cls=opts.small?'avatar-stage small':'avatar-stage';
    el.className=cls;
    const base=`<img class="avatar-base" src="assets/characters-clean/${avatar}.png?v=14" alt="선택 캐릭터">`;
    const layers=Object.keys(gearMeta).filter(k=>state.gear[k]).map(k=>`<svg class="gear-layer gear-${k}" viewBox="0 0 128 210" aria-hidden="true">${svgLayer(k,state.gearColors[k])}</svg>`).join('');
    el.innerHTML=base+layers;
  }
  window.SJGear={gearMeta,colors,normalizeState,renderStage};
})();
