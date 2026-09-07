(function(){
  const gearMeta={
    vest:{label:'탐험복',emoji:'🧥'},hat:{label:'모자',emoji:'👒'},scarf:{label:'스카프',emoji:'🧣'},backpack:{label:'가방',emoji:'🎒'},shoes:{label:'신발',emoji:'🥾'},camera:{label:'카메라',emoji:'📷'},binoculars:{label:'망원경',emoji:'🔭'},compass:{label:'나침반',emoji:'🧭'},flag:{label:'태극기',emoji:'🇰🇷'},badge:{label:'배지',emoji:'🏅'}
  };
  const colors=['#ef4444','#2563eb','#16a34a','#f59e0b','#7c3aed'];
  const profiles={
    m1:{name:'활발한 탐험가',hair:'#27314a',skin:'#ffd8c2',accent:'#2d8fd7',hairType:'boyMessy',eye:'#26324a'},
    m2:{name:'든든한 전략가',hair:'#704632',skin:'#ffd8c2',accent:'#4b9c62',hairType:'boySoft',eye:'#3a2a26'},
    m3:{name:'긍정 에너지',hair:'#2a3244',skin:'#ffd8c2',accent:'#f28b2e',hairType:'boySide',eye:'#2a3348'},
    f1:{name:'밝은 기록가',hair:'#70402f',skin:'#ffd8c2',accent:'#ef6fa7',hairType:'girlWave',eye:'#5a352a'},
    f2:{name:'차분한 지식가',hair:'#2f3044',skin:'#ffd8c2',accent:'#7d68c8',hairType:'girlBob',eye:'#303047',glasses:true},
    f3:{name:'다정한 소통가',hair:'#273a59',skin:'#ffd8c2',accent:'#3a9bd8',hairType:'girlPony',eye:'#243b58'}
  };
  const order=Object.keys(gearMeta);
  function normalizeState(s){
    s=s||{};s.gear=s.gear||{};s.gearColors=s.gearColors||{};
    order.forEach(k=>{if(!(k in s.gear))s.gear[k]=false;if(!s.gearColors[k])s.gearColors[k]=colors[0]});
    s.gearSystemVersion=21; return s;
  }
  function active(s){s=normalizeState(s);return order.filter(k=>!!s.gear[k]);}
  const esc=s=>String(s).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  function hairShapes(p){
    const h=p.hair;
    switch(p.hairType){
      case 'boyMessy': return {back:'',front:`<path d="M43 64 Q49 39 80 35 Q111 35 119 61 L111 75 Q102 61 93 70 Q82 52 72 70 Q61 54 49 73Z" fill="${h}"/>`};
      case 'boySoft': return {back:'',front:`<path d="M42 63 Q50 39 80 36 Q108 36 119 60 Q112 61 107 73 Q95 55 84 70 Q73 53 62 70 Q52 61 44 74Z" fill="${h}"/>`};
      case 'boySide': return {back:'',front:`<path d="M43 63 Q53 38 87 36 Q111 38 119 59 Q104 57 91 68 Q77 51 64 70 Q53 62 45 74Z" fill="${h}"/><path d="M83 43 Q99 30 111 40 Q100 45 94 56Z" fill="${h}"/>`};
      case 'girlWave': return {back:`<path d="M39 67 Q39 34 80 31 Q121 34 121 70 L118 139 Q107 153 96 136 Q84 155 72 137 Q57 154 43 137Z" fill="${h}"/>`,front:`<path d="M42 62 Q51 37 80 34 Q108 35 118 60 Q107 58 97 70 Q85 53 74 70 Q60 52 48 73Z" fill="${h}"/>`};
      case 'girlBob': return {back:`<path d="M41 65 Q42 35 80 32 Q118 35 120 66 L116 126 Q106 139 97 125 Q84 142 72 125 Q58 140 44 124Z" fill="${h}"/>`,front:`<path d="M42 62 Q51 38 80 35 Q109 36 118 61 Q105 59 96 70 Q84 53 74 70 Q60 54 48 72Z" fill="${h}"/>`};
      case 'girlPony': return {back:`<path d="M42 65 Q43 34 80 32 Q116 35 119 65 L116 127 Q105 140 96 126 Q84 143 72 126 Q58 140 44 125Z" fill="${h}"/><ellipse cx="123" cy="81" rx="19" ry="33" fill="${h}" transform="rotate(-16 123 81)"/>`,front:`<path d="M43 62 Q52 37 80 34 Q108 36 118 60 Q107 59 96 70 Q85 52 74 70 Q62 53 49 72Z" fill="${h}"/>`};
    }
    return {back:'',front:''};
  }
  function svgFor(id,state,opts={}){
    state=normalizeState(state||{}); const p=profiles[id]||profiles.m1; const g=state.gear||{}; const hs=hairShapes(p);
    const vest=g.vest,hat=g.hat,scarf=g.scarf,backpack=g.backpack,shoes=g.shoes,camera=g.camera,bino=g.binoculars,compass=g.compass,flag=g.flag,badge=g.badge;
    const uniform = vest ? p.accent : '#fffdf9';
    const uniformTrim = vest ? '#f0c067' : p.accent;
    const lower = id.startsWith('f') ? '#34445b' : '#48566a';
    return `<svg viewBox="0 0 180 230" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${esc(p.name)}">
      <defs>
        <filter id="ds" x="-20%" y="-20%" width="140%" height="150%"><feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="#59708a" flood-opacity=".22"/></filter>
        <linearGradient id="shirt" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${uniform}"/><stop offset="1" stop-color="${vest?p.accent:'#f4f7fb'}"/></linearGradient>
      </defs>
      <ellipse cx="90" cy="214" rx="49" ry="8" fill="#bcdff0" opacity=".58"/>
      ${backpack?`<g filter="url(#ds)"><rect x="29" y="114" width="31" height="65" rx="10" fill="#5e7457" stroke="#34463a" stroke-width="3"/><rect x="120" y="114" width="31" height="65" rx="10" fill="#5e7457" stroke="#34463a" stroke-width="3"/><rect x="36" y="126" width="17" height="25" rx="4" fill="#839477"/><rect x="127" y="126" width="17" height="25" rx="4" fill="#839477"/></g>`:''}
      ${hs.back}
      <g filter="url(#ds)">
        <path d="M64 165 Q55 184 60 201 L78 201 Q81 180 79 164Z" fill="${lower}" stroke="#293744" stroke-width="3"/>
        <path d="M101 165 Q99 181 102 201 L120 201 Q125 184 116 165Z" fill="${lower}" stroke="#293744" stroke-width="3"/>
        ${id.startsWith('f')?`<path d="M58 151 Q90 141 122 151 L116 177 H64Z" fill="#354861" stroke="#293744" stroke-width="3"/><path d="M66 151 L62 170 M78 149 L76 174 M90 148 V176 M102 149 L104 174 M114 151 L118 170" stroke="#50647d" stroke-width="2"/>`:''}
        <rect x="58" y="197" width="27" height="17" rx="7" fill="${shoes?'#6b472e':'#2d3a4b'}" stroke="#24313d" stroke-width="3"/>
        <rect x="97" y="197" width="27" height="17" rx="7" fill="${shoes?'#6b472e':'#2d3a4b'}" stroke="#24313d" stroke-width="3"/>
        ${shoes?'<path d="M61 201H82M100 201H121" stroke="#d7aa72" stroke-width="2"/>':''}
        <rect x="48" y="114" width="84" height="58" rx="18" fill="url(#shirt)" stroke="#2b3946" stroke-width="3"/>
        ${vest?`<path d="M63 116 L75 141 L61 169 H49 V126 Q52 116 63 116Z" fill="#d9a34e" opacity=".85"/><path d="M117 116 L105 141 L119 169 H131 V126 Q128 116 117 116Z" fill="#d9a34e" opacity=".85"/><path d="M90 116V171" stroke="#35414a" stroke-width="3"/><rect x="59" y="136" width="16" height="20" rx="4" fill="#f2d17c"/><rect x="105" y="136" width="16" height="20" rx="4" fill="#f2d17c"/>`:`<path d="M63 118 Q90 139 117 118" fill="none" stroke="${uniformTrim}" stroke-width="4"/><path d="M80 121 L90 139 L100 121" fill="#f3f6fb" stroke="#cbd4df" stroke-width="2"/>`}
        <path d="M51 120 Q40 126 42 145 Q44 157 53 160 Q61 160 64 150 L66 126Z" fill="${vest?p.accent:'#eef4fb'}" stroke="#2b3946" stroke-width="3"/>
        <circle cx="49" cy="154" r="8" fill="${p.skin}" stroke="#2b3946" stroke-width="3"/>
        <path d="M129 120 Q140 126 138 145 Q136 157 127 160 Q119 160 116 150 L114 126Z" fill="${vest?p.accent:'#eef4fb'}" stroke="#2b3946" stroke-width="3"/>
        <circle cx="131" cy="154" r="8" fill="${p.skin}" stroke="#2b3946" stroke-width="3"/>
        <circle cx="47" cy="82" r="10" fill="${p.skin}" stroke="#2b3946" stroke-width="3"/>
        <circle cx="133" cy="82" r="10" fill="${p.skin}" stroke="#2b3946" stroke-width="3"/>
        <circle cx="90" cy="76" r="45" fill="${p.skin}" stroke="#2b3946" stroke-width="3"/>
        ${hs.front}
        <ellipse cx="72" cy="84" rx="11" ry="15" fill="#fff"/>
        <ellipse cx="108" cy="84" rx="11" ry="15" fill="#fff"/>
        <ellipse cx="72" cy="86" rx="7" ry="10" fill="${p.eye}"/><ellipse cx="108" cy="86" rx="7" ry="10" fill="${p.eye}"/>
        <path d="M61 76 Q66 72 71 72" stroke="#3a2e34" stroke-width="2" stroke-linecap="round"/><path d="M109 72 Q114 72 119 76" stroke="#3a2e34" stroke-width="2" stroke-linecap="round"/>
        <circle cx="70" cy="82" r="2.2" fill="#fff"/><circle cx="104" cy="82" r="2.2" fill="#fff"/>
        <ellipse cx="60" cy="101" rx="7" ry="3.5" fill="#ef9aa2" opacity=".55"/><ellipse cx="120" cy="101" rx="7" ry="3.5" fill="#ef9aa2" opacity=".55"/>
        <path d="M80 101 Q90 113 100 101 Q98 115 90 116 Q82 115 80 101Z" fill="#d97878" stroke="#9c5555" stroke-width="2"/><path d="M85 108 Q90 111 95 108" stroke="#ffd9df" stroke-width="2" stroke-linecap="round"/>
        ${p.glasses?'<rect x="59" y="74" width="25" height="25" rx="8" fill="none" stroke="#253047" stroke-width="3"/><rect x="96" y="74" width="25" height="25" rx="8" fill="none" stroke="#253047" stroke-width="3"/><path d="M84 84H96" stroke="#253047" stroke-width="3"/>':''}
        ${hat?`<g><path d="M42 54 Q90 22 138 54 L126 69 H54Z" fill="#e5ca8f" stroke="#6c5434" stroke-width="3"/><rect x="58" y="44" width="64" height="18" rx="7" fill="#efd8a5" stroke="#6c5434" stroke-width="3"/><circle cx="90" cy="50" r="7" fill="${p.accent}"/><circle cx="90" cy="50" r="3" fill="#fff4bc"/></g>`:''}
        ${scarf?`<g><path d="M63 112 Q90 129 117 112 L108 132 L90 124 L72 132Z" fill="#e94e4e" stroke="#9a2d2d" stroke-width="2"/><path d="M89 124 L99 154 L88 148 L78 154 L80 124Z" fill="#e94e4e"/></g>`:''}
        ${badge?`<g><circle cx="112" cy="130" r="8" fill="#f5c94e" stroke="#8d5d18" stroke-width="2"/><path d="M112 123l2.5 5 5.5.8-4 3.8.9 5.4-4.9-2.7-4.9 2.7.9-5.4-4-3.8 5.5-.8z" fill="#fff3a2"/></g>`:''}
        ${camera?`<g><path d="M71 128 Q90 137 109 128" fill="none" stroke="#313f4d" stroke-width="3"/><rect x="65" y="137" width="50" height="32" rx="7" fill="#31485d" stroke="#1d2b38" stroke-width="3"/><circle cx="90" cy="153" r="12" fill="#3ca8df" stroke="#173e55" stroke-width="4"/><circle cx="90" cy="153" r="5" fill="#9edcf7"/><rect x="72" y="131" width="14" height="8" rx="2" fill="#51687d"/></g>`:''}
        ${bino?`<g><rect x="56" y="78" width="29" height="23" rx="7" fill="#24557c" stroke="#17384f" stroke-width="3"/><rect x="95" y="78" width="29" height="23" rx="7" fill="#24557c" stroke="#17384f" stroke-width="3"/><rect x="85" y="85" width="10" height="9" fill="#326487"/><circle cx="69" cy="89" r="6" fill="#62c5ea"/><circle cx="111" cy="89" r="6" fill="#62c5ea"/></g>`:''}
        ${compass?`<g><path d="M47 121 Q37 145 49 164" fill="none" stroke="#8f6a38" stroke-width="3"/><circle cx="51" cy="169" r="12" fill="#f6e8bb" stroke="#8f6a38" stroke-width="3"/><path d="M51 160L56 170L46 177Z" fill="#e65242"/></g>`:''}
        ${flag?`<g><rect x="144" y="105" width="4" height="72" rx="2" fill="#6a492a"/><path d="M148 108 H176 V137 H148Z" fill="#fff" stroke="#d7dde4" stroke-width="1.5"/><circle cx="162" cy="122" r="6" fill="#e44b4b"/><path d="M156 122 A6 6 0 0 0 168 122" fill="#2b68bd"/><path d="M152 113h5M167 113h5M152 131h5M167 131h5" stroke="#26333d" stroke-width="1.4"/></g>`:''}
      </g>
      ${opts.showName?`<text x="90" y="226" text-anchor="middle" font-size="9" font-family="sans-serif" font-weight="800" fill="#245678">${esc(p.name)}</text>`:''}
    </svg>`;
  }
  function renderStage(el,a,s,opts={}){s=normalizeState(s);el.className=opts.small?'avatar-stage pixel small':'avatar-stage pixel';el.innerHTML=svgFor(a,s,opts)}
  function renderChoice(el,a){const s=normalizeState({gear:{}});el.innerHTML=svgFor(a,s,{})}
  function toggleGear(s,k){s=normalizeState(s);s.gear[k]=!s.gear[k];return s}
  window.SJGear={gearMeta,colors,profiles,normalizeState,renderStage,renderChoice,toggleGear,active,svgFor};
})();
