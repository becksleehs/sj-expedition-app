(function(){
  const gearMeta={
    hat:{label:'탐험 모자',emoji:'👒',slot:'wear'},
    vest:{label:'탐험복',emoji:'🧥',slot:'wear'},
    scarf:{label:'스카프',emoji:'🧣',slot:'wear'},
    backpack:{label:'가방',emoji:'🎒',slot:'wear'},
    shoes:{label:'탐험 신발',emoji:'🥾',slot:'wear'},
    camera:{label:'카메라',emoji:'📷',slot:'tool'},
    compass:{label:'나침반',emoji:'🧭',slot:'tool'},
    binoculars:{label:'망원경',emoji:'🔭',slot:'tool'},
    flag:{label:'태극기',emoji:'🇰🇷',slot:'tool'},
    badge:{label:'원정대 배지',emoji:'🏅',slot:'wear'}
  };
  const colors=['#ef4444','#2563eb','#16a34a','#f59e0b','#7c3aed'];
  const toolKeys=Object.keys(gearMeta).filter(k=>gearMeta[k].slot==='tool');
  const profiles={
    m1:{name:'활발한 탐험가',accent:'#2584df',hair:'#20242b',skin:'#ffd9bd',hairStyle:1,glasses:false,gender:'m'},
    m2:{name:'든든한 전략가',accent:'#4b9b5c',hair:'#15191e',skin:'#f9d3b8',hairStyle:2,glasses:false,gender:'m'},
    m3:{name:'긍정 에너지',accent:'#f0a63b',hair:'#58331e',skin:'#ffdabc',hairStyle:3,glasses:false,gender:'m'},
    f1:{name:'밝은 기록가',accent:'#ef78a7',hair:'#6b3828',skin:'#ffd9bf',hairStyle:4,glasses:false,gender:'f'},
    f2:{name:'차분한 지식가',accent:'#7d61c8',hair:'#22202b',skin:'#f7d3ba',hairStyle:5,glasses:true,gender:'f'},
    f3:{name:'다정한 소통가',accent:'#278fd0',hair:'#192b39',skin:'#fbd8bd',hairStyle:6,glasses:false,gender:'f'}
  };

  function normalizeState(s){
    s.gear=s.gear||{}; s.gearColors=s.gearColors||{};
    Object.keys(gearMeta).forEach(k=>{
      if(!(k in s.gear)) s.gear[k]=false;
      if(!s.gearColors[k]) s.gearColors[k]=colors[0];
    });
    // New unified SVG character system. Clear old overlay state once.
    if(s.gearSystemVersion!==17){
      Object.keys(gearMeta).forEach(k=>s.gear[k]=false);
      s.gearSystemVersion=17;
    }
    const activeTools=toolKeys.filter(k=>s.gear[k]);
    if(activeTools.length>1) activeTools.slice(0,-1).forEach(k=>s.gear[k]=false);
    return s;
  }

  function hairBack(p){
    const h=p.hair;
    if(p.hairStyle===4) return `<path d="M64 48 C31 50 25 80 29 119 C31 148 19 171 33 191 C43 181 46 167 47 149 L82 149 C83 167 87 182 98 191 C110 169 98 149 100 117 C103 82 93 52 64 48Z" fill="${h}"/>`;
    if(p.hairStyle===5) return `<path d="M64 47 C32 49 27 78 30 111 C33 141 27 172 41 190 C48 176 48 154 48 139 L83 139 C84 157 84 175 91 190 C105 171 98 140 99 111 C101 78 94 49 64 47Z" fill="${h}"/>`;
    if(p.hairStyle===6) return `<path d="M64 47 C34 49 27 75 29 109 C31 139 25 166 36 186 C43 172 44 151 46 135 L84 135 C85 152 87 172 94 186 C105 166 98 139 99 108 C100 75 94 49 64 47Z" fill="${h}"/>`;
    return '';
  }
  function hairFront(p){
    const h=p.hair;
    if(p.hairStyle===1) return `<path d="M34 64 Q41 43 61 46 Q85 40 95 64 L89 74 Q83 62 76 61 Q73 71 65 65 Q60 72 53 65 Q47 74 40 68Z" fill="${h}"/>`;
    if(p.hairStyle===2) return `<path d="M33 64 Q42 43 62 45 Q86 43 95 64 Q84 58 77 59 Q72 71 65 64 Q57 74 51 64 Q42 74 36 68Z" fill="${h}"/>`;
    if(p.hairStyle===3) return `<path d="M32 65 Q40 47 57 46 Q73 40 96 60 L91 70 Q80 60 73 62 Q69 70 63 64 Q56 73 50 64 Q42 73 35 68Z" fill="${h}"/>`;
    if(p.hairStyle===4) return `<path d="M31 66 Q38 43 61 45 Q86 42 97 64 Q88 60 79 61 Q75 71 68 64 Q61 73 54 64 Q46 72 36 69Z" fill="${h}"/>`;
    if(p.hairStyle===5) return `<path d="M31 64 Q40 42 62 45 Q85 42 97 64 Q89 60 80 61 Q75 71 68 64 Q61 73 54 64 Q45 72 36 69Z" fill="${h}"/>`;
    return `<path d="M31 64 Q39 42 60 45 Q84 41 97 63 Q88 58 79 61 Q74 71 68 64 Q61 72 54 64 Q45 73 35 68Z" fill="${h}"/>`;
  }
  function face(p){
    const glasses=p.glasses?`<g fill="none" stroke="#252b34" stroke-width="2.2"><circle cx="52" cy="81" r="10"/><circle cx="76" cy="81" r="10"/><path d="M62 81H66"/></g>`:'';
    return `<ellipse cx="64" cy="83" rx="34" ry="32" fill="${p.skin}" stroke="#5d4536" stroke-width="1.5"/>
      ${hairFront(p)}
      <ellipse cx="52" cy="82" rx="5.2" ry="7" fill="#18202a"/><ellipse cx="76" cy="82" rx="5.2" ry="7" fill="#18202a"/>
      <circle cx="50.4" cy="79.8" r="1.6" fill="#fff"/><circle cx="74.4" cy="79.8" r="1.6" fill="#fff"/>
      ${glasses}<path d="M57 96 Q64 102 71 96" fill="none" stroke="#9f514d" stroke-width="2.2" stroke-linecap="round"/>
      <ellipse cx="40" cy="94" rx="4" ry="2" fill="#f49da0" opacity=".55"/><ellipse cx="88" cy="94" rx="4" ry="2" fill="#f49da0" opacity=".55"/>`;
  }
  function hat(color){return `<g><path d="M34 55 Q36 34 64 31 Q92 34 95 55 L88 62 H41Z" fill="${color}" stroke="#5b4030" stroke-width="2"/><ellipse cx="64" cy="58" rx="38" ry="8" fill="${color}" stroke="#5b4030" stroke-width="2"/><circle cx="64" cy="43" r="7" fill="#fff5d7" stroke="#5b4030" stroke-width="1.5"/><path d="M64 38V48M59 43H69" stroke="#d99027" stroke-width="1.4"/></g>`;}
  function body(p,s){
    const accent=p.accent, skin=p.skin;
    const vestOn=s.gear.vest, scarfOn=s.gear.scarf, packOn=s.gear.backpack, shoesOn=s.gear.shoes;
    const vestColor=s.gearColors.vest, scarfColor=s.gearColors.scarf, packColor=s.gearColors.backpack, shoeColor=s.gearColors.shoes;
    const shirt=vestOn?vestColor:accent;
    const tool=toolKeys.find(k=>s.gear[k])||null;
    const armPose=(tool==='camera'||tool==='binoculars')?'front':(tool==='flag'?'flag':tool?'side':'open');
    const back=packOn?`<path d="M36 119 Q24 126 28 159 Q31 175 43 176 L47 135Z" fill="${packColor}" stroke="#493a30" stroke-width="2"/><path d="M92 119 Q104 126 100 159 Q97 175 85 176 L81 135Z" fill="${packColor}" stroke="#493a30" stroke-width="2"/>`:'';
    const torso=`<path d="M46 116 Q64 106 82 116 L86 168 Q64 178 42 168Z" fill="${shirt}" stroke="#4f3d33" stroke-width="2"/>`;
    const vestDetails=vestOn?`<path d="M54 116 L58 168 M74 116 L70 168" stroke="#fff" stroke-opacity=".45" stroke-width="2"/><rect x="48" y="145" width="11" height="9" rx="2" fill="#fff" opacity=".25"/><rect x="69" y="145" width="11" height="9" rx="2" fill="#fff" opacity=".25"/>`:'';
    const scarf=scarfOn?`<path d="M47 113 Q64 121 81 113 L78 123 Q64 130 50 123Z" fill="${scarfColor}" stroke="#4a392f" stroke-width="2"/><path d="M62 124 L70 145 L63 140 L57 147 L58 124Z" fill="${scarfColor}" stroke="#4a392f" stroke-width="1.6"/>`:'';
    const arms=armPose==='front'?`<path d="M47 127 Q51 140 58 148" fill="none" stroke="${skin}" stroke-width="11" stroke-linecap="round"/><path d="M81 127 Q77 140 70 148" fill="none" stroke="${skin}" stroke-width="11" stroke-linecap="round"/>`:
      armPose==='flag'?`<path d="M47 129 Q34 139 31 154" fill="none" stroke="${skin}" stroke-width="11" stroke-linecap="round"/><path d="M81 128 Q95 111 99 88" fill="none" stroke="${skin}" stroke-width="11" stroke-linecap="round"/>`:
      `<path d="M46 128 Q34 140 31 154" fill="none" stroke="${skin}" stroke-width="11" stroke-linecap="round"/><path d="M82 128 Q94 140 97 154" fill="none" stroke="${skin}" stroke-width="11" stroke-linecap="round"/>`;
    const legs=`<path d="M50 166 L49 204" stroke="${skin}" stroke-width="12" stroke-linecap="round"/><path d="M78 166 L79 204" stroke="${skin}" stroke-width="12" stroke-linecap="round"/><path d="M43 165 Q64 177 85 165 L82 184 Q64 191 46 184Z" fill="#515861" stroke="#403a36" stroke-width="2"/>`;
    const shoeFill=shoesOn?shoeColor:'#5e4636';
    const shoes=`<path d="M40 201 Q51 196 59 202 L58 215 H38 Q36 207 40 201Z" fill="${shoeFill}" stroke="#40332b" stroke-width="2"/><path d="M69 202 Q78 196 88 201 Q92 207 90 215 H70Z" fill="${shoeFill}" stroke="#40332b" stroke-width="2"/>`;
    return `${back}${arms}${torso}${vestDetails}${scarf}${legs}${shoes}`;
  }
  function toolSvg(s){
    const tool=toolKeys.find(k=>s.gear[k]); if(!tool)return '';
    const c=s.gearColors[tool]||'#2563eb';
    if(tool==='camera')return `<g transform="translate(48 139)"><rect width="32" height="22" rx="5" fill="${c}" stroke="#25313a" stroke-width="2"/><rect x="5" y="-5" width="10" height="7" rx="2" fill="#25313a"/><circle cx="17" cy="11" r="7" fill="#dff5ff" stroke="#25313a" stroke-width="2"/><circle cx="17" cy="11" r="3" fill="#3588ce"/></g>`;
    if(tool==='binoculars')return `<g transform="translate(45 139)"><rect x="8" y="3" width="30" height="10" rx="4" fill="${c}" stroke="#24313b" stroke-width="2"/><circle cx="10" cy="9" r="9" fill="${c}" stroke="#24313b" stroke-width="2"/><circle cx="36" cy="9" r="9" fill="${c}" stroke="#24313b" stroke-width="2"/><circle cx="10" cy="9" r="4" fill="#b9eeff"/><circle cx="36" cy="9" r="4" fill="#b9eeff"/></g>`;
    if(tool==='compass')return `<g transform="translate(91 150)"><circle r="12" fill="#fff6d8" stroke="#4e382a" stroke-width="2"/><circle r="8" fill="#d8f2ff"/><path d="M0-7 L4 2 L0 0 L-4 2Z" fill="${c}"/><circle r="2" fill="#46362c"/></g>`;
    if(tool==='flag')return `<g><path d="M101 86 V181" stroke="#6b4a2b" stroke-width="3"/><path d="M100 89 Q86 84 72 90 L72 114 Q86 108 100 113Z" fill="#fff" stroke="#4b3627" stroke-width="1.6"/><path d="M82 100 a6 6 0 0 0 12 0 a6 6 0 0 1-12 0" fill="#2563eb"/><path d="M82 100 a6 6 0 0 1 12 0 a6 6 0 0 0-12 0" fill="#ef4444"/></g>`;
    return '';
  }
  function badgeSvg(s){if(!s.gear.badge)return '';const c=s.gearColors.badge;return `<g transform="translate(78 132)"><circle r="8" fill="#ffd453" stroke="#6b4b19" stroke-width="1.8"/><path d="M0-5 1.7-1.7 5-.8 2.6 1.8 3.3 5 0 3.2-3.3 5-2.6 1.8-5-.8-1.7-1.7Z" fill="${c}"/></g>`;}

  function avatarSvg(avatar,state){
    state=normalizeState(state||{}); const p=profiles[avatar]||profiles.m1;
    const bg='#eaf8ff';
    return `<svg viewBox="0 0 128 226" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${p.name}">
      <defs><filter id="s" x="-20%" y="-20%" width="140%" height="160%"><feDropShadow dx="0" dy="3" stdDeviation="2" flood-opacity=".16"/></filter></defs>
      <ellipse cx="64" cy="217" rx="35" ry="5" fill="#65a8cf" opacity=".18"/>
      <g filter="url(#s)">${hairBack(p)}${body(p,state)}${face(p)}${state.gear.hat?hat(state.gearColors.hat):''}${badgeSvg(state)}${toolSvg(state)}</g>
    </svg>`;
  }

  function renderStage(el,avatar,state,opts={}){
    state=normalizeState(state||{});
    el.className=opts.small?'avatar-stage small':'avatar-stage';
    el.innerHTML=avatarSvg(avatar,state);
  }
  function renderChoice(el,avatar){
    const empty={gear:{},gearColors:{},gearSystemVersion:17};
    el.innerHTML=avatarSvg(avatar,normalizeState(empty));
  }
  function toggleGear(state,key){
    state=normalizeState(state); const willOn=!state.gear[key];
    if(willOn && gearMeta[key].slot==='tool') toolKeys.forEach(k=>state.gear[k]=false);
    state.gear[key]=willOn; return state;
  }
  window.SJGear={gearMeta,colors,profiles,normalizeState,renderStage,renderChoice,toggleGear,toolKeys,avatarSvg};
})();
