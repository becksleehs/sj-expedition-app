(function(){
  const gearMeta={
    vest:{label:'탐험복',emoji:'🧥'},hat:{label:'모자',emoji:'👒'},scarf:{label:'스카프',emoji:'🧣'},backpack:{label:'가방',emoji:'🎒'},shoes:{label:'신발',emoji:'🥾'},camera:{label:'카메라',emoji:'📷'},binoculars:{label:'망원경',emoji:'🔭'},compass:{label:'나침반',emoji:'🧭'},flag:{label:'태극기',emoji:'🇰🇷'},badge:{label:'배지',emoji:'🏅'}
  };
  const profiles={
    f1:{name:'밝은 기록가',accent:'#ef6fa7',dx:0,dy:0},
    f2:{name:'차분한 지식가',accent:'#6659bd',dx:0,dy:0},
    f3:{name:'다정한 소통가',accent:'#ef8b3c',dx:0,dy:0},
    m1:{name:'활발한 탐험가',accent:'#2f80d8',dx:0,dy:2},
    m2:{name:'든든한 전략가',accent:'#3e9b64',dx:0,dy:4},
    m3:{name:'긍정 에너지',accent:'#ef8b3c',dx:0,dy:2}
  };
  const order=Object.keys(gearMeta);
  function normalizeState(s){
    s=s||{}; s.gear=s.gear||{};
    const previous=Number(s.gearSystemVersion||0);
    order.forEach(k=>{ if(!(k in s.gear)) s.gear[k]=false; });
    // v2.3은 이전 버전의 과도하게 겹친 장비 상태를 한 번 비우고 새 좌표계에서 시작한다.
    if(previous<23){ order.forEach(k=>s.gear[k]=false); }
    // 자연스러운 손장비: 망원경과 태극기는 동시에 들지 않음.
    if(s.gear.binoculars && s.gear.flag) s.gear.flag=false;
    s.gearSystemVersion=23; return s;
  }
  function active(s){s=normalizeState(s);return order.filter(k=>!!s.gear[k]);}
  function defs(){return `<defs>
    <filter id="soft" x="-25%" y="-25%" width="150%" height="160%"><feDropShadow dx="0" dy="5" stdDeviation="5" flood-color="#17324b" flood-opacity=".20"/></filter>
    <linearGradient id="khaki23" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f5deb4"/><stop offset="1" stop-color="#c59a60"/></linearGradient>
    <linearGradient id="bag23" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#738a5f"/><stop offset="1" stop-color="#40573c"/></linearGradient>
    <linearGradient id="boot23" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8e603e"/><stop offset="1" stop-color="#3e2a1d"/></linearGradient>
  </defs>`;}
  function backSvg(s){
    if(!s.gear.backpack) return '';
    return `<svg class="gear-svg gear-back" viewBox="0 0 1086 1448" aria-hidden="true">${defs()}
      <g filter="url(#soft)" opacity=".98">
        <path d="M225 720 Q168 760 180 920 Q185 1045 285 1090 L352 1028 L350 748Z" fill="url(#bag23)" stroke="#314334" stroke-width="18"/>
        <path d="M861 720 Q918 760 906 920 Q901 1045 801 1090 L734 1028 L736 748Z" fill="url(#bag23)" stroke="#314334" stroke-width="18"/>
        <rect x="200" y="848" width="100" height="108" rx="28" fill="#8a9f77" stroke="#40573c" stroke-width="13"/>
        <rect x="786" y="848" width="100" height="108" rx="28" fill="#8a9f77" stroke="#40573c" stroke-width="13"/>
      </g></svg>`;
  }
  function frontSvg(id,s){
    const g=s.gear||{}, p=profiles[id]||profiles.f1; let x='';
    if(g.vest) x+=`<g filter="url(#soft)"><path d="M366 716 Q425 680 488 696 L543 757 L598 696 Q661 680 720 716 L701 995 Q638 1023 586 987 L543 931 L500 987 Q448 1023 385 995Z" fill="url(#khaki23)" stroke="#6c4c2f" stroke-width="16"/><path d="M543 758V986" stroke="#7a5735" stroke-width="13"/><rect x="402" y="842" width="100" height="82" rx="18" fill="#efd09e" stroke="#7a5735" stroke-width="11"/><rect x="584" y="842" width="100" height="82" rx="18" fill="#efd09e" stroke="#7a5735" stroke-width="11"/><circle cx="543" cy="822" r="10" fill="#d49a3a"/><circle cx="543" cy="888" r="10" fill="#d49a3a"/></g>`;
    if(g.backpack) x+=`<g opacity=".95"><path d="M384 731 Q345 816 378 979" fill="none" stroke="#40573c" stroke-width="22" stroke-linecap="round"/><path d="M702 731 Q741 816 708 979" fill="none" stroke="#40573c" stroke-width="22" stroke-linecap="round"/></g>`;
    if(g.scarf) x+=`<g filter="url(#soft)"><path d="M435 667 Q543 711 651 667 L617 744 Q543 771 469 744Z" fill="#e84b4b" stroke="#8f2f30" stroke-width="13"/><path d="M526 739 L561 739 L589 889 L546 855 L510 896Z" fill="#e84b4b" stroke="#8f2f30" stroke-width="11"/></g>`;
    if(g.hat) x+=`<g filter="url(#soft)"><path d="M262 344 Q543 214 824 344 Q788 390 720 407 Q543 444 366 407 Q298 390 262 344Z" fill="#ead09a" stroke="#684c31" stroke-width="17"/><path d="M362 333 Q388 165 543 151 Q698 165 724 333Z" fill="#f0d9a7" stroke="#684c31" stroke-width="17"/><path d="M368 310 Q543 268 718 310" fill="none" stroke="#6e7e59" stroke-width="22"/><circle cx="543" cy="307" r="32" fill="#4d96c7" stroke="#5c432d" stroke-width="11"/><path d="M543 286l9 18 20 3-14 14 3 20-18-10-18 10 3-20-14-14 20-3z" fill="#fff0a8"/></g>`;
    if(g.shoes) x+=`<g filter="url(#soft)"><path d="M323 1206 Q367 1175 438 1201 L456 1280 Q416 1340 310 1338 Q274 1302 292 1250Z" fill="url(#boot23)" stroke="#3d2a1d" stroke-width="17"/><path d="M648 1201 Q719 1175 763 1206 L794 1250 Q812 1302 776 1338 Q670 1340 630 1280Z" fill="url(#boot23)" stroke="#3d2a1d" stroke-width="17"/><path d="M308 1260H445M641 1260H778" stroke="#c99a65" stroke-width="11"/></g>`;
    if(g.camera) x+=`<g filter="url(#soft)"><path d="M426 746 Q543 838 660 746" fill="none" stroke="#263a4a" stroke-width="16"/><rect x="438" y="900" width="210" height="132" rx="30" fill="#354b5e" stroke="#1b2a36" stroke-width="15"/><rect x="471" y="868" width="72" height="44" rx="12" fill="#5b7385" stroke="#1b2a36" stroke-width="12"/><circle cx="543" cy="966" r="55" fill="#173f58" stroke="#1b2a36" stroke-width="15"/><circle cx="543" cy="966" r="36" fill="#47b7e7"/><circle cx="543" cy="966" r="17" fill="#b9efff"/><circle cx="621" cy="927" r="9" fill="#ffcf52"/></g>`;
    if(g.binoculars) x+=`<g filter="url(#soft)"><path d="M445 738 Q543 805 641 738" fill="none" stroke="#2c3c4c" stroke-width="14"/><rect x="407" y="790" width="105" height="92" rx="30" fill="#235477" stroke="#17394f" stroke-width="14"/><rect x="574" y="790" width="105" height="92" rx="30" fill="#235477" stroke="#17394f" stroke-width="14"/><rect x="500" y="812" width="86" height="42" rx="15" fill="#3d6784"/><circle cx="458" cy="835" r="31" fill="#62c3e8"/><circle cx="628" cy="835" r="31" fill="#62c3e8"/><circle cx="458" cy="835" r="14" fill="#d7f6ff"/><circle cx="628" cy="835" r="14" fill="#d7f6ff"/></g>`;
    if(g.compass) x+=`<g filter="url(#soft)"><path d="M682 808 Q716 874 700 945" fill="none" stroke="#8a683e" stroke-width="12"/><circle cx="698" cy="960" r="48" fill="#f4e6bd" stroke="#775731" stroke-width="13"/><circle cx="698" cy="960" r="33" fill="#d9f2fa" stroke="#91aab1" stroke-width="7"/><path d="M698 932 L716 964 L687 987Z" fill="#dc4c42"/><path d="M698 988 L682 957 L709 933Z" fill="#3475b6"/><circle cx="698" cy="960" r="5" fill="#5a462d"/></g>`;
    if(g.badge) x+=`<g filter="url(#soft)"><circle cx="683" cy="792" r="31" fill="#f3c84e" stroke="#8b5d21" stroke-width="11"/><path d="M683 773l8 16 18 3-13 12 3 18-16-9-16 9 3-18-13-12 18-3z" fill="#fff3ab"/></g>`;
    if(g.flag) x+=`<g filter="url(#soft)"><rect x="842" y="666" width="15" height="445" rx="8" fill="#6f4a2d"/><path d="M857 681 H1010 V797 H857Z" fill="#fff" stroke="#cbd3da" stroke-width="7"/><circle cx="933" cy="739" r="31" fill="#e14c4c"/><path d="M902 739 A31 31 0 0 0 964 739" fill="#2d66b2"/><path d="M878 703h24M964 703h24M878 775h24M964 775h24" stroke="#253039" stroke-width="8"/></g>`;
    return `<svg class="gear-svg gear-front" viewBox="0 0 1086 1448" aria-hidden="true">${defs()}${x}</svg>`;
  }
  function renderStage(el,id,s,opts={}){
    s=normalizeState(s||{}); const p=profiles[id]||profiles.f1;
    el.className='avatar-stage v23'+(opts.small?' small':'');
    el.innerHTML=`<div class="avatar-stack-v23" style="--avatar-dy:${p.dy}px">${backSvg(s)}<img class="avatar-photo-v23" src="assets/avatar-v23/${id}.png?v=230" alt="${p.name}">${frontSvg(id,s)}</div>`;
  }
  function renderChoice(el,id){el.innerHTML=`<div class="avatar-choice-v23"><img src="assets/avatar-v23/${id}.png?v=230" alt="${profiles[id].name}"></div>`;}
  function toggleGear(s,k){
    s=normalizeState(s); const next=!s.gear[k];
    if(next && k==='binoculars') s.gear.flag=false;
    if(next && k==='flag') s.gear.binoculars=false;
    s.gear[k]=next; return s;
  }
  window.SJGear={gearMeta,profiles,normalizeState,renderStage,renderChoice,toggleGear,active};
})();
