/* v5 Arcade Avatar System — one SVG canvas for base + equipment.
   All equipment is drawn in the exact same coordinate system as the character,
   so nothing can drift, float, or cover the wrong body part. */
const V5_PALETTE={
  outfit:['#c99555','#5d8b61','#4e78ad','#a95c52','#7561a0'],
  backpack:['#8b5b36','#4f765d','#4f6f91','#a85b51','#74578e'],
  hat:['#d84c42','#d6a45f','#4b7fb3','#4d8a62','#845da3'],
  scarf:['#1686df','#db4a4f','#38a461','#8e5bc2','#e69735'],
  camera:['#343d48','#765136','#3b6684','#924d55','#69717e'],
  compass:['#efd78f','#e5b94f','#d9844c','#72a6cb','#94b06b'],
  badge:['#ffffff','#ffd84b','#f18d9b','#76b9ee','#82d0a5'],
  telescope:['#d5a632','#ba6a40','#497fa5','#719a5e','#8e5da2']
};

function v5Color(id,key){
  const idx=gearIndex(id,key);
  return (V5_PALETTE[key]||V5_PALETTE.outfit)[idx]||V5_PALETTE[key][0];
}
function v5Esc(s){return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;')}

function v5AvatarSvg(a,id,scaleClass=''){
  const selected=state.dress[id]||[];
  const outfit=v5Color(id,'outfit'), pack=v5Color(id,'backpack'), hat=v5Color(id,'hat'), scarf=v5Color(id,'scarf'), camera=v5Color(id,'camera'), compass=v5Color(id,'compass'), badge=v5Color(id,'badge'), telescope=v5Color(id,'telescope');
  const male=a.gender==='M';
  const hair={m1:'#6a3f27',m2:'#2e2927',m3:'#314d68',f1:'#75452f',f2:'#5b302c',f3:'#4b4264'}[a.id]||'#6a3f27';
  const hair2={m1:'#8b5738',m2:'#4b4039',m3:'#506e8a',f1:'#9a6140',f2:'#7b4541',f3:'#685d85'}[a.id]||'#8b5738';
  const skin=['#f2bf97','#e7a97c','#f4c49e'][a.id.charCodeAt(1)%3];
  const eye={m1:'#6a432d',m2:'#344b72',m3:'#4d78a8',f1:'#7a4b31',f2:'#6d4b7e',f3:'#4c7658'}[a.id]||'#4d5f78';
  const hairShape=male
    ? `<path d="M91 142 Q89 62 170 45 Q251 62 249 142 L239 202 Q226 176 214 160 Q191 137 170 153 Q147 132 126 157 Q107 139 91 142Z" fill="${hair}" stroke="#38271f" stroke-width="7" stroke-linejoin="round"/>`
    : `<path d="M84 152 Q80 67 170 44 Q260 67 256 153 L248 275 Q240 304 220 285 L211 198 L129 198 L120 285 Q100 304 91 275Z" fill="${hair}" stroke="#38271f" stroke-width="7" stroke-linejoin="round"/>`;
  const hairDetail=male
    ? `<path d="M102 115 Q170 75 238 116" fill="none" stroke="${hair2}" stroke-width="12" stroke-linecap="round" opacity=".65"/>`
    : `<path d="M112 104 Q170 69 228 104" fill="none" stroke="${hair2}" stroke-width="12" stroke-linecap="round" opacity=".65"/><path d="M101 177 Q89 213 97 253" fill="none" stroke="${hair2}" stroke-width="9" stroke-linecap="round" opacity=".65"/>`;
  const outfitGroup=selected.includes('outfit')?`<g id="gear-outfit">
    <path d="M112 256 Q170 230 228 256 L219 366 Q170 384 121 366Z" fill="${outfit}" stroke="#4a3526" stroke-width="7"/>
    <path d="M119 269 L96 318" stroke="${outfit}" stroke-width="25" stroke-linecap="round"/><path d="M221 269 L244 318" stroke="${outfit}" stroke-width="25" stroke-linecap="round"/>
    <path d="M144 246 L170 278 L196 246 L190 350 L150 350Z" fill="#f6ead1" stroke="#705335" stroke-width="4"/>
    <rect x="145" y="309" width="50" height="28" rx="7" fill="#8d673f" stroke="#4a3526" stroke-width="4"/>
  </g>`:`<g id="base-clothes"><path d="M116 255 Q170 237 224 255 L218 355 Q170 371 122 355Z" fill="#5b7291" stroke="#3b2e27" stroke-width="7"/><path d="M128 264 L106 315" stroke="#5b7291" stroke-width="23" stroke-linecap="round"/><path d="M212 264 L234 315" stroke="#5b7291" stroke-width="23" stroke-linecap="round"/><path d="M145 250 L170 279 L195 250 L190 344 L150 344Z" fill="#f3e7cc" stroke="#6b5439" stroke-width="4"/><rect x="145" y="307" width="50" height="27" rx="7" fill="#8b673e"/></g>`;
  const hatGroup=selected.includes('hat')?`<g id="gear-hat"><ellipse cx="170" cy="92" rx="111" ry="30" fill="${hat}" stroke="#53371f" stroke-width="7"/><path d="M110 94 Q118 33 170 28 Q222 33 230 94Z" fill="${hat}" stroke="#53371f" stroke-width="7"/><path d="M112 78 Q170 97 228 78" fill="none" stroke="#26384e" stroke-width="15"/><circle cx="207" cy="59" r="15" fill="#9bdcff" stroke="#27445b" stroke-width="5"/><path d="M223 48 Q246 33 252 52 Q240 70 223 76" fill="#d94d45" stroke="#53371f" stroke-width="5"/></g>`:'';
  const scarfGroup=selected.includes('scarf')?`<g id="gear-scarf"><path d="M126 251 Q170 273 214 251 Q210 282 170 289 Q130 282 126 251Z" fill="${scarf}" stroke="#174b88" stroke-width="5"/><path d="M188 274 L220 335 L198 344 L170 286Z" fill="${scarf}" stroke="#174b88" stroke-width="5"/></g>`:'';
  const cameraGroup=selected.includes('camera')?`<g id="gear-camera"><path d="M132 298 Q170 329 208 298" fill="none" stroke="#252a31" stroke-width="7"/><rect x="137" y="320" width="69" height="50" rx="10" fill="${camera}" stroke="#151a22" stroke-width="5"/><rect x="150" y="312" width="23" height="11" rx="4" fill="#59636f"/><circle cx="171" cy="345" r="16" fill="#77c9ef" stroke="#151a22" stroke-width="5"/><circle cx="171" cy="345" r="7" fill="#193449"/></g>`:'';
  const compassGroup=selected.includes('compass')?`<g id="gear-compass"><path d="M217 320 Q242 334 239 360" fill="none" stroke="#c69a60" stroke-width="7"/><circle cx="239" cy="378" r="24" fill="${compass}" stroke="#684722" stroke-width="5"/><circle cx="239" cy="378" r="15" fill="#fff9dc" stroke="#a37a34" stroke-width="2"/><path d="M239 363 L246 378 L239 393 L232 378Z" fill="#d64b4b"/></g>`:'';
  const badgeGroup=selected.includes('badge')?`<g id="gear-badge"><rect x="199" y="286" width="39" height="29" rx="6" fill="#fff" stroke="#37445b" stroke-width="3"/><circle cx="218.5" cy="300.5" r="9" fill="${badge}"/><path d="M218.5 291.5 A9 9 0 0 1 218.5 309.5 A4.5 4.5 0 0 0 218.5 300.5 A4.5 4.5 0 0 1 218.5 291.5" fill="#315f9d"/></g>`:'';
  const telescopeGroup=selected.includes('telescope')?`<g id="gear-telescope" transform="rotate(-28 236 340)"><rect x="190" y="326" width="92" height="30" rx="12" fill="${telescope}" stroke="#61420f" stroke-width="5"/><rect x="182" y="321" width="24" height="39" rx="8" fill="#6d4a20"/><rect x="271" y="319" width="27" height="44" rx="8" fill="#f0cb56" stroke="#644513" stroke-width="4"/></g>`:'';
  const backpackGroup=selected.includes('backpack')?`<g id="gear-backpack"><path d="M221 276 Q270 276 276 324 L276 382 Q251 398 221 382Z" fill="${pack}" stroke="#3c2a20" stroke-width="7"/><path d="M233 279 Q247 245 263 279" fill="none" stroke="#3c2a20" stroke-width="8"/><path d="M235 329 H264" stroke="#d7b06d" stroke-width="6"/></g>`:'';
  return `<svg class="v5-avatar-svg ${scaleClass}" viewBox="0 0 342 470" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${v5Esc(a.name)}">
    <defs><radialGradient id="bg" cx="50%" cy="35%"><stop offset="0" stop-color="#ffffff"/><stop offset=".62" stop-color="#c8efff"/><stop offset="1" stop-color="#76bce5"/></radialGradient><linearGradient id="skin" x1="0" y1="0" x2="0" y2="1"><stop stop-color="${skin}"/><stop offset="1" stop-color="#d99a70"/></linearGradient></defs>
    <rect width="342" height="470" rx="28" fill="url(#bg)"/>
    <ellipse cx="171" cy="443" rx="104" ry="17" fill="#6ca95c" opacity=".9"/>
    ${hairShape}${hairDetail}
    <circle cx="91" cy="176" r="23" fill="url(#skin)" stroke="#5a392b" stroke-width="6"/><circle cx="251" cy="176" r="23" fill="url(#skin)" stroke="#5a392b" stroke-width="6"/>
    <path d="M101 118 Q170 82 241 118 L242 205 Q237 259 171 275 Q104 259 99 205Z" fill="url(#skin)" stroke="#5a392b" stroke-width="7"/>
    <path d="M101 144 Q107 90 170 88 Q233 90 241 144 Q225 124 207 130 Q189 108 171 134 Q150 109 132 131 Q113 125 101 144Z" fill="${hair}"/>
    <ellipse cx="142" cy="182" rx="22" ry="29" fill="#fff" stroke="#3a2b27" stroke-width="4"/><ellipse cx="199" cy="182" rx="22" ry="29" fill="#fff" stroke="#3a2b27" stroke-width="4"/><ellipse cx="145" cy="186" rx="13" ry="18" fill="${eye}"/><ellipse cx="196" cy="186" rx="13" ry="18" fill="${eye}"/><circle cx="149" cy="178" r="5" fill="#fff"/><circle cx="200" cy="178" r="5" fill="#fff"/><path d="M156 224 Q171 240 186 224 Q181 252 171 254 Q161 252 156 224Z" fill="#d95e69" stroke="#7b3944" stroke-width="4"/>
    ${backpackGroup}${outfitGroup}
    <path d="M138 370 L156 370 L153 420 L134 420Z" fill="#d9a16f" stroke="#4a352a" stroke-width="6"/><path d="M186 370 L204 370 L208 420 L189 420Z" fill="#d9a16f" stroke="#4a352a" stroke-width="6"/>
    <path d="M126 414 Q145 407 158 420 L153 444 Q128 452 112 439 Q111 425 126 414Z" fill="#65422b" stroke="#3e2a22" stroke-width="7"/><path d="M184 420 Q197 407 216 414 Q231 425 230 439 Q214 452 189 444Z" fill="#65422b" stroke="#3e2a22" stroke-width="7"/>
    ${scarfGroup}${hatGroup}${cameraGroup}${compassGroup}${badgeGroup}${telescopeGroup}
  </svg>`;
}

function avatarStage(id, cls=''){
  const a=avatarFor(id); if(!a)return '';
  return `<div class="v3-avatar-stage ${cls} v5-stage">${v5AvatarSvg(a,id,cls)}</div>`;
}
function avatarChoiceSvg(a){
  return v5AvatarSvg(a,'__preview__','choice');
}
