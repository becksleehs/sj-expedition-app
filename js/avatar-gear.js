(function(){
  const gearMeta={
    vest:{label:'탐험복',emoji:'🧥'},hat:{label:'모자',emoji:'👒'},scarf:{label:'스카프',emoji:'🧣'},backpack:{label:'가방',emoji:'🎒'},shoes:{label:'신발',emoji:'🥾'},camera:{label:'카메라',emoji:'📷'},binoculars:{label:'망원경',emoji:'🔭'},compass:{label:'나침반',emoji:'🧭'},flag:{label:'태극기',emoji:'🇰🇷'},badge:{label:'배지',emoji:'🏅'}
  };
  const colors=['#ef4444','#2563eb','#16a34a','#f59e0b','#7c3aed'];
  const profiles={
    m1:{name:'활발한 탐험가',hair:'#1f2937',skin:'#ffd7bd',accent:'#2889d8',hairType:'messy'},
    m2:{name:'든든한 전략가',hair:'#5b3425',skin:'#ffd7bd',accent:'#3b9b5b',hairType:'round'},
    m3:{name:'긍정 에너지',hair:'#232b42',skin:'#ffd7bd',accent:'#f28b2d',hairType:'side'},
    f1:{name:'밝은 기록가',hair:'#6b3c2b',skin:'#ffd7bd',accent:'#ef5c9a',hairType:'long'},
    f2:{name:'차분한 지식가',hair:'#29283a',skin:'#ffd7bd',accent:'#7b61c8',hairType:'straight',glasses:true},
    f3:{name:'다정한 소통가',hair:'#22324f',skin:'#ffd7bd',accent:'#2f93d5',hairType:'pony'}
  };
  const order=Object.keys(gearMeta);
  function normalizeState(s){
    s=s||{};s.gear=s.gear||{};s.gearColors=s.gearColors||{};
    order.forEach(k=>{if(!(k in s.gear))s.gear[k]=false;if(!s.gearColors[k])s.gearColors[k]=colors[0]});
    if(s.gearSystemVersion!==20){s.gearSystemVersion=20;}
    return s;
  }
  function active(s){s=normalizeState(s);return order.filter(k=>!!s.gear[k]);}
  const esc=s=>String(s).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  function svgFor(id,state,opts={}){
    state=normalizeState(state||{});const p=profiles[id]||profiles.m1;const g=state.gear||{};
    const accent=p.accent; const vest=g.vest?accent:'#f6f7fb'; const shorts='#4d5968';
    const hat=g.hat; const scarf=g.scarf; const backpack=g.backpack; const shoes=g.shoes; const camera=g.camera; const bino=g.binoculars; const compass=g.compass; const flag=g.flag; const badge=g.badge;
    let hairBack='';
    if(p.hairType==='long') hairBack='<rect x="42" y="53" width="76" height="80" rx="24" fill="'+p.hair+'"/><rect x="36" y="78" width="18" height="70" rx="8" fill="'+p.hair+'"/><rect x="106" y="78" width="18" height="70" rx="8" fill="'+p.hair+'"/>';
    if(p.hairType==='straight') hairBack='<rect x="40" y="54" width="80" height="92" rx="24" fill="'+p.hair+'"/>';
    if(p.hairType==='pony') hairBack='<rect x="43" y="54" width="74" height="75" rx="23" fill="'+p.hair+'"/><rect x="111" y="68" width="22" height="58" rx="10" fill="'+p.hair+'"/>';
    const bangs={messy:'<path d="M43 65 L54 50 L61 61 L72 47 L80 61 L91 49 L100 63 L117 56 L113 79 L45 79Z" fill="'+p.hair+'"/>',round:'<path d="M44 66 Q80 38 116 66 L112 80 L48 80Z" fill="'+p.hair+'"/>',side:'<path d="M43 67 Q63 42 116 58 L108 80 L47 80Z" fill="'+p.hair+'"/><path d="M77 54 L94 44 L91 66Z" fill="'+p.hair+'"/>',long:'<path d="M43 68 Q70 42 118 62 L112 81 L48 81Z" fill="'+p.hair+'"/>',straight:'<path d="M42 67 Q80 42 118 66 L110 81 L49 81Z" fill="'+p.hair+'"/>',pony:'<path d="M44 66 Q78 41 116 64 L110 81 L48 81Z" fill="'+p.hair+'"/>'}[p.hairType]||'';
    let out=`<svg viewBox="0 0 160 220" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${esc(p.name)}" style="shape-rendering:crispEdges">
      <defs><filter id="s"><feDropShadow dx="0" dy="2" stdDeviation="1.5" flood-opacity=".18"/></filter></defs>
      <ellipse cx="80" cy="205" rx="44" ry="8" fill="#b8dff0" opacity=".55"/>
      ${hairBack}
      ${backpack?`<rect x="28" y="112" width="25" height="60" rx="8" fill="#536b4b" stroke="#27392c" stroke-width="3"/><rect x="107" y="112" width="25" height="60" rx="8" fill="#536b4b" stroke="#27392c" stroke-width="3"/><rect x="34" y="122" width="12" height="20" fill="#758861"/><rect x="114" y="122" width="12" height="20" fill="#758861"/>`:''}
      <rect x="52" y="128" width="20" height="52" rx="7" fill="${shorts}" stroke="#26313a" stroke-width="3"/>
      <rect x="88" y="128" width="20" height="52" rx="7" fill="${shorts}" stroke="#26313a" stroke-width="3"/>
      <rect x="50" y="173" width="25" height="24" rx="7" fill="${shoes?'#5c3a23':'#26313a'}" stroke="#1d252b" stroke-width="3"/>
      <rect x="85" y="173" width="25" height="24" rx="7" fill="${shoes?'#5c3a23':'#26313a'}" stroke="#1d252b" stroke-width="3"/>
      <rect x="44" y="103" width="72" height="64" rx="15" fill="${vest}" stroke="#26313a" stroke-width="3"/>
      ${g.vest?`<rect x="52" y="115" width="14" height="25" rx="3" fill="#f4c86d"/><rect x="94" y="115" width="14" height="25" rx="3" fill="#f4c86d"/><path d="M80 106V164" stroke="#23313a" stroke-width="3"/>`:''}
      <rect x="27" y="111" width="22" height="46" rx="10" fill="${p.skin}" stroke="#26313a" stroke-width="3"/>
      <rect x="111" y="111" width="22" height="46" rx="10" fill="${p.skin}" stroke="#26313a" stroke-width="3"/>
      <circle cx="80" cy="77" r="42" fill="${p.skin}" stroke="#26313a" stroke-width="3" filter="url(#s)"/>
      ${bangs}
      <rect x="48" y="66" width="12" height="15" fill="${p.hair}"/><rect x="100" y="66" width="12" height="15" fill="${p.hair}"/>
      <rect x="59" y="82" width="9" height="14" rx="2" fill="#26313a"/><rect x="92" y="82" width="9" height="14" rx="2" fill="#26313a"/>
      <rect x="62" y="84" width="3" height="4" fill="#fff"/><rect x="95" y="84" width="3" height="4" fill="#fff"/>
      <rect x="76" y="103" width="8" height="3" rx="2" fill="#b6635d"/>
      ${p.glasses?'<rect x="52" y="77" width="22" height="23" rx="5" fill="none" stroke="#172234" stroke-width="3"/><rect x="86" y="77" width="22" height="23" rx="5" fill="none" stroke="#172234" stroke-width="3"/><rect x="74" y="87" width="12" height="3" fill="#172234"/>':''}
      ${hat?`<path d="M38 56 Q80 26 122 56 L112 68 H48Z" fill="#d9b878" stroke="#624b2f" stroke-width="3"/><rect x="52" y="48" width="56" height="13" rx="5" fill="#e5c887" stroke="#624b2f" stroke-width="3"/><circle cx="80" cy="50" r="6" fill="${accent}"/>`:''}
      ${scarf?`<path d="M57 106 Q80 121 103 106 L98 123 L80 116 L62 123Z" fill="#e54646" stroke="#8c2828" stroke-width="2"/><path d="M80 116 L88 145 L78 140 L70 145 L72 116Z" fill="#e54646"/>`:''}
      ${badge?`<circle cx="101" cy="118" r="7" fill="#f5c84b" stroke="#8d5b13" stroke-width="2"/><path d="M101 112L103 116L108 117L104 120L105 125L101 122L97 125L98 120L94 117L99 116Z" fill="#fff3a0"/>`:''}
      ${camera?`<g><rect x="58" y="132" width="44" height="30" rx="5" fill="#273546" stroke="#111820" stroke-width="3"/><circle cx="80" cy="147" r="11" fill="#168cd2" stroke="#0c2f47" stroke-width="4"/><rect x="64" y="126" width="13" height="8" rx="2" fill="#3d4e61"/></g>`:''}
      ${bino?`<g><rect x="52" y="74" width="24" height="19" rx="5" fill="#1b4770" stroke="#10273b" stroke-width="3"/><rect x="84" y="74" width="24" height="19" rx="5" fill="#1b4770" stroke="#10273b" stroke-width="3"/><rect x="76" y="79" width="8" height="8" fill="#294f70"/><circle cx="64" cy="83" r="5" fill="#4fb8e8"/><circle cx="96" cy="83" r="5" fill="#4fb8e8"/></g>`:''}
      ${compass?`<g><path d="M45 121 Q39 139 48 154" fill="none" stroke="#7f5d2e" stroke-width="3"/><circle cx="49" cy="157" r="11" fill="#f2e5ba" stroke="#7f5d2e" stroke-width="3"/><path d="M49 149L53 158L45 164Z" fill="#e94c3d"/></g>`:''}
      ${flag?`<g><rect x="127" y="99" width="4" height="67" fill="#5d4127"/><path d="M131 101 H156 V126 H131Z" fill="#fff" stroke="#ccd2d7" stroke-width="1"/><circle cx="143" cy="113" r="5" fill="#e84747"/><path d="M138 113 A5 5 0 0 0 148 113" fill="#2468be"/></g>`:''}
      ${opts.showName?`<text x="80" y="217" text-anchor="middle" font-size="9" font-family="sans-serif" font-weight="700" fill="#245678">${esc(p.name)}</text>`:''}
    </svg>`;
    return out;
  }
  function renderStage(el,a,s,opts={}){s=normalizeState(s);el.className=opts.small?'avatar-stage pixel small':'avatar-stage pixel';el.innerHTML=svgFor(a,s,opts)}
  function renderChoice(el,a){const s=normalizeState({gear:{}});el.innerHTML=svgFor(a,s,{})}
  function toggleGear(s,k){s=normalizeState(s);s.gear[k]=!s.gear[k];return s}
  window.SJGear={gearMeta,colors,profiles,normalizeState,renderStage,renderChoice,toggleGear,active,svgFor};
})();
