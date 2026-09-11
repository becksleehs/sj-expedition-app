(function(){
  const profiles={
    f1:{name:'지유 · 밝고 상냥한 탐험가',accent:'#ef6fa7'},
    f2:{name:'서연 · 차분하고 똑똑한 탐험가',accent:'#8f78d8'},
    f3:{name:'다온 · 활발하고 씩씩한 탐험가',accent:'#5aa7e8'},
    m1:{name:'민준 · 호기심 많은 탐험가',accent:'#5aa7e8'},
    m2:{name:'준호 · 침착하고 든든한 탐험가',accent:'#64b787'},
    m3:{name:'태윤 · 밝고 에너지 넘치는 탐험가',accent:'#ef9a4c'}
  };
  const gearMeta={
    vest:{label:'탐험복',emoji:'🧥'},hat:{label:'모자',emoji:'👒'},scarf:{label:'스카프',emoji:'🧣'},
    backpack:{label:'가방',emoji:'🎒'},boots:{label:'신발',emoji:'🥾'},camera:{label:'카메라',emoji:'📷'},
    binoculars:{label:'망원경',emoji:'🔭'},compass:{label:'나침반',emoji:'🧭'},flag:{label:'태극기',emoji:'🇰🇷'},badge:{label:'배지',emoji:'🏅'}
  };
  const order=Object.keys(gearMeta);
  function normalizeState(s){
    s=s||{};
    if(!s.gear||typeof s.gear!=='object')s.gear={};
    // migrate old preset selections into the new unified renderer once
    if(!s.gearSystemVersion || s.gearSystemVersion<34){
      const p=s.avatarPreset;
      if(p==='hat')s.gear.hat=true;
      if(p==='scarf')s.gear.scarf=true;
      if(p==='vest')s.gear.vest=true;
      if(p==='vesthat'){s.gear.vest=true;s.gear.hat=true;}
      if(p==='camera')s.gear.camera=true;
      if(p==='binoculars')s.gear.binoculars=true;
      if(p==='badge')s.gear.badge=true;
      if(p==='combo'){s.gear.vest=true;s.gear.hat=true;s.gear.scarf=true;s.gear.camera=true;}
      s.avatarPreset='base';
      s.gearSystemVersion=34;
    }
    return s;
  }
  function baseAsset(id){const safe=profiles[id]?id:'f1';return `assets/avatar-v33/${safe}.png?v=fresh350`;}
  function svgLayer(kind){
    const common='viewBox="0 0 720 900" preserveAspectRatio="xMidYMid meet"';
    const s={
      backpack:`<svg ${common}><g opacity=".98" stroke="#2d4329" stroke-width="8" stroke-linejoin="round"><path fill="#567848" d="M130 405 Q88 430 98 610 Q102 680 174 670 L205 635 L205 440 Z"/><path fill="#567848" d="M590 405 Q632 430 622 610 Q618 680 546 670 L515 635 L515 440 Z"/><path fill="none" d="M178 425 Q235 385 272 430M542 425 Q485 385 448 430"/></g></svg>`,
      vest:`<svg ${common}><g stroke="#6f5538" stroke-width="6" stroke-linejoin="round"><path fill="#d7b98d" d="M254 447 L315 430 L360 472 L405 430 L466 447 L492 600 L427 630 L360 604 L293 630 L228 600 Z"/><path fill="#f2e2c4" d="M344 471 L360 488 L376 471 L387 596 L333 596 Z"/><path fill="none" d="M286 510 H326 V556 H286 ZM394 510 H434 V556 H394 Z"/></g></svg>`,
      scarf:`<svg ${common}><g stroke="#9c211e" stroke-width="5" stroke-linejoin="round"><path fill="#df3a32" d="M315 451 Q360 430 405 451 Q394 487 360 492 Q326 487 315 451Z"/><path fill="#df3a32" d="M347 484 L319 555 L358 533 L360 493 ZM373 484 L401 555 L362 533 L360 493 Z"/></g></svg>`,
      hat:`<svg ${common}><g stroke="#705230" stroke-width="7" stroke-linejoin="round"><ellipse fill="#d8b47b" cx="360" cy="172" rx="180" ry="57"/><path fill="#e8c995" d="M238 176 Q245 64 360 62 Q475 64 482 176 Z"/><path fill="#8a6840" d="M250 145 Q360 115 470 145 L468 170 Q360 145 252 170 Z"/><circle fill="#f4dfb6" cx="360" cy="131" r="23" stroke-width="5"/></g></svg>`,
      boots:`<svg ${common}><g stroke="#4d3424" stroke-width="7" stroke-linejoin="round"><path fill="#7a5237" d="M255 798 Q287 776 324 795 L326 855 Q282 874 244 848 Z"/><path fill="#7a5237" d="M396 795 Q433 776 465 798 L476 848 Q438 874 394 855 Z"/><path fill="none" d="M260 819 H319M401 819 H460"/></g></svg>`,
      camera:`<svg ${common}><g stroke="#1d2c39" stroke-width="7" stroke-linejoin="round"><path fill="none" d="M316 446 Q360 410 404 446"/><rect x="302" y="505" width="116" height="78" rx="16" fill="#344a5f"/><circle cx="360" cy="544" r="28" fill="#63b8e8"/><circle cx="360" cy="544" r="14" fill="#0b3657"/><rect x="326" y="490" width="38" height="18" rx="5" fill="#344a5f"/></g></svg>`,
      binoculars:`<svg ${common}><g stroke="#223b4c" stroke-width="7" stroke-linejoin="round"><path fill="#2f5065" d="M303 333 Q328 309 348 334 L348 381 Q315 397 292 376 Z"/><path fill="#2f5065" d="M372 334 Q392 309 417 333 L428 376 Q405 397 372 381 Z"/><rect x="345" y="342" width="30" height="24" rx="8" fill="#2f5065"/><circle cx="316" cy="350" r="17" fill="#70c7f2"/><circle cx="404" cy="350" r="17" fill="#70c7f2"/><circle cx="282" cy="383" r="16" fill="#ffd9c7" stroke="#bd785d"/><circle cx="438" cy="383" r="16" fill="#ffd9c7" stroke="#bd785d"/><path fill="none" d="M292 379 Q315 390 324 381M428 379 Q405 390 396 381"/></g></svg>`,
      compass:`<svg ${common}><g stroke="#8e681e" stroke-width="6"><circle cx="458" cy="596" r="35" fill="#f4d475"/><circle cx="458" cy="596" r="27" fill="#fff4c9"/><path fill="#d84b37" d="M458 572 L468 598 L458 620 L448 598Z"/><path fill="#225c92" d="M458 620 L448 598 L458 572 L468 598Z"/></g></svg>`,
      flag:`<svg ${common}><g stroke="#514532" stroke-width="6" stroke-linejoin="round"><path d="M535 390 V680"/><path fill="#fff" d="M535 397 Q606 378 664 402 L664 500 Q602 478 535 498 Z"/><circle cx="599" cy="443" r="23" fill="#d93d3d" stroke="none"/><path fill="#2367b1" d="M576 443 A23 23 0 0 0 622 443 A11.5 11.5 0 0 1 599 443 A11.5 11.5 0 0 0 576 443Z" stroke="none"/><path d="M558 415 l18 10 M558 426 l18 10 M622 455 l18 10 M622 466 l18 10" stroke="#111" stroke-width="4"/><circle cx="524" cy="585" r="17" fill="#ffd9c7" stroke="#bd785d"/></g></svg>`,
      badge:`<svg ${common}><g stroke="#9c6a10" stroke-width="5"><circle cx="423" cy="512" r="24" fill="#ffd23e"/><path fill="#f3a51e" d="M423 493 l6 12 14 2-10 10 3 14-13-7-13 7 3-14-10-10 14-2z"/></g></svg>`
    };
    return s[kind]||'';
  }
  function renderStage(el,id,s,opts={}){
    s=normalizeState(s||{}); const safe=profiles[id]?id:'f1';
    const active=order.filter(k=>s.gear[k]);
    const back=s.gear.backpack?`<div class="gear-layer-v34 behind">${svgLayer('backpack')}</div>`:'';
    const front=active.filter(k=>k!=='backpack').map(k=>`<div class="gear-layer-v34 ${k}">${svgLayer(k)}</div>`).join('');
    el.className=`avatar-stage-v34${opts.small?' small':''}`;
    el.innerHTML=`${back}<img class="avatar-base-v34" src="${baseAsset(safe)}" alt="${profiles[safe].name}">${front}`;
  }
  function renderChoice(el,id){const safe=profiles[id]?id:'f1';el.className='char-art exact-choice-v33';el.innerHTML=`<img src="${baseAsset(safe)}" alt="${profiles[safe].name}">`;}
  function toggle(s,key){s=normalizeState(s);s.gear[key]=!s.gear[key];return s;}
  function active(s){s=normalizeState(s);return order.filter(k=>s.gear[k]);}
  function labelList(s){const a=active(s);return a.length?a.map(k=>gearMeta[k].label).join(' · '):'기본형';}
  window.SJGear={profiles,gearMeta,order,normalizeState,renderStage,renderChoice,toggle,active,labelList,baseAsset};
})();
