(function(){
  const gearMeta={
    vest:{label:'탐험복',emoji:'🧥'},hat:{label:'모자',emoji:'👒'},scarf:{label:'스카프',emoji:'🧣'},backpack:{label:'가방',emoji:'🎒'},shoes:{label:'신발',emoji:'🥾'},camera:{label:'카메라',emoji:'📷'},binoculars:{label:'망원경',emoji:'🔭'},compass:{label:'나침반',emoji:'🧭'},flag:{label:'태극기',emoji:'🇰🇷'},badge:{label:'배지',emoji:'🏅'}
  };
  const colors=['#e84646','#2f80d8','#3e9b64','#e6a028','#7b61c9'];
  const profiles={
    f1:{name:'밝은 기록가',accent:'#ef6fa7',x:0,y:0,scale:1},
    f2:{name:'차분한 지식가',accent:'#6f64c8',x:0,y:0,scale:1},
    f3:{name:'다정한 소통가',accent:'#ef8b3c',x:0,y:0,scale:1},
    m1:{name:'활발한 탐험가',accent:'#2f80d8',x:0,y:6,scale:0.99},
    m2:{name:'든든한 전략가',accent:'#3e9b64',x:0,y:7,scale:0.99},
    m3:{name:'긍정 에너지',accent:'#ef8b3c',x:0,y:6,scale:0.99}
  };
  const order=Object.keys(gearMeta);
  function normalizeState(s){
    s=s||{}; s.gear=s.gear||{}; s.gearColors=s.gearColors||{};
    order.forEach(k=>{ if(!(k in s.gear)) s.gear[k]=false; if(!s.gearColors[k]) s.gearColors[k]=colors[0]; });
    s.gearSystemVersion=22; return s;
  }
  function active(s){s=normalizeState(s);return order.filter(k=>!!s.gear[k]);}
  function col(s,k,fallback){return (s.gearColors&&s.gearColors[k])||fallback;}
  function defs(){return `<defs>
    <filter id="shadow" x="-30%" y="-30%" width="160%" height="180%"><feDropShadow dx="0" dy="8" stdDeviation="8" flood-color="#203448" flood-opacity=".28"/></filter>
    <linearGradient id="khaki" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f4d49a"/><stop offset="1" stop-color="#c99b55"/></linearGradient>
    <linearGradient id="bag" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#6f875a"/><stop offset="1" stop-color="#415b3d"/></linearGradient>
    <linearGradient id="boot" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8b5b38"/><stop offset="1" stop-color="#49301f"/></linearGradient>
  </defs>`;}
  function backSvg(s){
    const g=s.gear||{}; if(!g.backpack)return '';
    return `<svg class="gear-svg gear-back" viewBox="0 0 1086 1448" aria-hidden="true">${defs()}
      <g filter="url(#shadow)">
        <path d="M250 720 Q185 750 190 925 Q195 1070 300 1110 L360 1035 L355 760Z" fill="url(#bag)" stroke="#263a2b" stroke-width="22"/>
        <path d="M836 720 Q901 750 896 925 Q891 1070 786 1110 L726 1035 L731 760Z" fill="url(#bag)" stroke="#263a2b" stroke-width="22"/>
        <rect x="205" y="850" width="112" height="120" rx="35" fill="#81956d" stroke="#344c37" stroke-width="16"/>
        <rect x="769" y="850" width="112" height="120" rx="35" fill="#81956d" stroke="#344c37" stroke-width="16"/>
      </g></svg>`;
  }
  function frontSvg(id,s){
    const g=s.gear||{}; const p=profiles[id]||profiles.f1; const scarf=col(s,'scarf','#e84646');
    let x='';
    if(g.vest) x+=`<g filter="url(#shadow)"><path d="M342 700 Q410 660 490 685 L543 770 L596 685 Q676 660 744 700 L718 1015 Q648 1055 584 1014 L543 950 L502 1014 Q438 1055 368 1015Z" fill="url(#khaki)" stroke="#65482a" stroke-width="20"/><path d="M543 765V1008" stroke="#765530" stroke-width="17"/><rect x="390" y="855" width="118" height="102" rx="22" fill="#f2d49d" stroke="#765530" stroke-width="15"/><rect x="578" y="855" width="118" height="102" rx="22" fill="#f2d49d" stroke="#765530" stroke-width="15"/><circle cx="543" cy="828" r="13" fill="#d39838"/><circle cx="543" cy="905" r="13" fill="#d39838"/></g>`;
    if(g.backpack) x+=`<g opacity=".98"><path d="M370 720 Q330 825 370 1000" fill="none" stroke="#344c37" stroke-width="30" stroke-linecap="round"/><path d="M716 720 Q756 825 716 1000" fill="none" stroke="#344c37" stroke-width="30" stroke-linecap="round"/></g>`;
    if(g.scarf) x+=`<g filter="url(#shadow)"><path d="M392 642 Q543 720 694 642 L636 790 L543 748 L450 790Z" fill="${scarf}" stroke="#862c2c" stroke-width="18"/><path d="M520 738 L558 738 L604 948 L540 905 L488 955Z" fill="${scarf}" stroke="#862c2c" stroke-width="15"/></g>`;
    if(g.hat) x+=`<g filter="url(#shadow)"><path d="M190 325 Q543 70 896 325 Q846 385 760 410 Q543 465 326 410 Q240 385 190 325Z" fill="#ead099" stroke="#654b2d" stroke-width="22"/><path d="M330 306 Q362 105 543 92 Q724 105 756 306Z" fill="#f0d9a7" stroke="#654b2d" stroke-width="22"/><path d="M335 287 Q543 230 751 287" fill="none" stroke="#667451" stroke-width="30"/><circle cx="543" cy="285" r="42" fill="${p.accent}" stroke="#5a4229" stroke-width="15"/><path d="M543 260l13 27 30 4-22 21 5 30-26-14-26 14 5-30-22-21 30-4z" fill="#fff0a8"/></g>`;
    if(g.shoes) x+=`<g filter="url(#shadow)"><path d="M322 1205 Q370 1168 455 1200 L477 1295 Q432 1378 305 1368 Q260 1320 285 1250Z" fill="url(#boot)" stroke="#39271d" stroke-width="22"/><path d="M631 1200 Q716 1168 764 1205 L801 1250 Q826 1320 781 1368 Q654 1378 609 1295Z" fill="url(#boot)" stroke="#39271d" stroke-width="22"/><path d="M304 1260H454M632 1260H782" stroke="#d5a66d" stroke-width="16"/></g>`;
    if(g.camera) x+=`<g filter="url(#shadow)"><path d="M390 770 Q543 870 696 770" fill="none" stroke="#26384a" stroke-width="22"/><rect x="383" y="845" width="320" height="205" rx="45" fill="#34485b" stroke="#1b2936" stroke-width="22"/><rect x="430" y="805" width="100" height="65" rx="18" fill="#536a7c" stroke="#1b2936" stroke-width="18"/><circle cx="543" cy="948" r="87" fill="#173f58" stroke="#1b2936" stroke-width="22"/><circle cx="543" cy="948" r="59" fill="#47b7e7"/><circle cx="543" cy="948" r="30" fill="#a9e6ff"/><circle cx="653" cy="890" r="15" fill="#ffce52"/></g>`;
    if(g.binoculars) x+=`<g filter="url(#shadow)"><path d="M390 748 Q543 850 696 748" fill="none" stroke="#2d3e4f" stroke-width="22"/><rect x="365" y="800" width="155" height="150" rx="50" fill="#214f73" stroke="#173349" stroke-width="22"/><rect x="566" y="800" width="155" height="150" rx="50" fill="#214f73" stroke="#173349" stroke-width="22"/><rect x="500" y="830" width="86" height="68" rx="20" fill="#345e7e"/><circle cx="445" cy="872" r="48" fill="#56bce5"/><circle cx="641" cy="872" r="48" fill="#56bce5"/><circle cx="445" cy="872" r="25" fill="#bcecff"/><circle cx="641" cy="872" r="25" fill="#bcecff"/></g>`;
    if(g.compass) x+=`<g filter="url(#shadow)"><path d="M668 745 Q720 860 688 975" fill="none" stroke="#7f613c" stroke-width="18"/><circle cx="682" cy="994" r="72" fill="#f5e8be" stroke="#775631" stroke-width="20"/><circle cx="682" cy="994" r="49" fill="#d8f1f8" stroke="#8da7ad" stroke-width="10"/><path d="M682 950 L710 1003 L667 1040Z" fill="#df4d43"/><path d="M682 1038 L656 986 L697 952Z" fill="#3575b8"/><circle cx="682" cy="994" r="8" fill="#59452d"/></g>`;
    if(g.badge) x+=`<g filter="url(#shadow)"><circle cx="696" cy="786" r="54" fill="#f4c84e" stroke="#8b5c1f" stroke-width="18"/><path d="M696 747l15 30 34 5-25 24 6 34-30-16-30 16 6-34-25-24 34-5z" fill="#fff2a4"/></g>`;
    if(g.flag) x+=`<g filter="url(#shadow)"><rect x="820" y="640" width="22" height="560" rx="11" fill="#6e4a2d"/><path d="M842 655 H1035 V825 H842Z" fill="#fff" stroke="#c8d0d9" stroke-width="10"/><circle cx="938" cy="740" r="44" fill="#e44c4c"/><path d="M894 740 A44 44 0 0 0 982 740" fill="#2d66b2"/><path d="M868 690h34M974 690h34M868 790h34M974 790h34" stroke="#243039" stroke-width="12"/></g>`;
    return `<svg class="gear-svg gear-front" viewBox="0 0 1086 1448" aria-hidden="true">${defs()}${x}</svg>`;
  }
  function renderStage(el,id,s,opts={}){
    s=normalizeState(s||{}); const p=profiles[id]||profiles.f1;
    el.className='avatar-stage v22'+(opts.small?' small':'');
    el.innerHTML=`<div class="avatar-stack-v22" style="--avatar-y:${p.y}px;--avatar-scale:${p.scale}">${backSvg(s)}<img class="avatar-photo-v22" src="assets/avatar-v22/${id}.png?v=220" alt="${p.name}">${frontSvg(id,s)}</div>`;
  }
  function renderChoice(el,id){const s=normalizeState({gear:{}}); el.innerHTML=`<div class="avatar-choice-v22"><img src="assets/avatar-v22/${id}.png?v=220" alt="${profiles[id].name}"></div>`;}
  function toggleGear(s,k){s=normalizeState(s);s.gear[k]=!s.gear[k];return s;}
  window.SJGear={gearMeta,colors,profiles,normalizeState,renderStage,renderChoice,toggleGear,active};
})();
