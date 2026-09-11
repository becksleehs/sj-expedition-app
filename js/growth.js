(function(){
  const END='/.netlify/functions/student-progress';
  const levels=[
    {level:1,name:'기본 대원',minXP:0,desc:'기본 캐리커처'},
    {level:2,name:'새싹 탐험가',minXP:100,desc:'탐험복 획득'},
    {level:3,name:'길잡이 탐험가',minXP:300,desc:'탐험모자 + 스카프'},
    {level:4,name:'기록 탐험가',minXP:600,desc:'가방 + 카메라'},
    {level:5,name:'독도 수호 탐험가',minXP:1000,desc:'망원경 + 태극기'}
  ];
  const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
  function normalizeState(s){
    s=s||SJ.load();s.xp=Math.max(0,Number(s.xp)||0);s.growthLevel=clamp(Number(s.growthLevel)||1,1,5);
    if(s.studentId){s.avatar=s.studentId;}
    if(!Number.isFinite(Number(s.lastUpgradePromptLevel)))s.lastUpgradePromptLevel=s.growthLevel;
    return s;
  }
  function info(level){return levels[clamp(Number(level)||1,1,5)-1]}
  function asset(studentId,level){return `assets/growth-v35/${studentId}/lv${clamp(Number(level)||1,1,5)}.png?v=fresh370`}
  function render(el,studentId,level,opts={}){if(!el)return;el.innerHTML=`<img class="growth-avatar-v35 ${opts.small?'small':''}" src="${asset(studentId,level)}" alt="${SJ.students.find(s=>s.id===studentId)?.name||''} ${info(level).name}">`;}
  function nextInfo(s){s=normalizeState(s);return s.growthLevel>=5?null:levels[s.growthLevel]}
  function canUpgrade(s){const n=nextInfo(s);return !!(n&&s.xp>=n.minXP)}
  function progressPct(s){s=normalizeState(s);const cur=info(s.growthLevel),next=nextInfo(s);if(!next)return 100;return clamp(Math.round((s.xp-cur.minXP)/(next.minXP-cur.minXP)*100),0,100)}
  async function api(body,query){try{let url=END;if(query)url+='?'+new URLSearchParams(query);const r=await fetch(url,body?{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(body),cache:'no-store'}:{cache:'no-store'});if(!r.ok)throw new Error('progress');return await r.json()}catch{return null}}
  async function pull(){let s=normalizeState(SJ.load());if(!s.studentId||!s.authToken)return s;const d=await api(null,{studentId:s.studentId,token:s.authToken});if(d&&d.progress){s.xp=Math.max(0,Number(d.progress.xp)||0);s.growthLevel=clamp(Number(d.progress.growthLevel)||1,1,5);s.avatar=s.studentId;SJ.save(s)}return s}
  async function push(s){s=normalizeState(s);SJ.save(s);if(s.studentId&&s.authToken)await api({action:'save',studentId:s.studentId,token:s.authToken,xp:s.xp,growthLevel:s.growthLevel});return s}
  async function upgrade(){let s=normalizeState(SJ.load());if(!canUpgrade(s))return s;s.growthLevel+=1;s.lastUpgradePromptLevel=s.growthLevel;s.avatar=s.studentId;await push(s);window.dispatchEvent(new CustomEvent('sj:growth-changed',{detail:s}));return s}
  function ensureModal(){let w=document.getElementById('growthUpgradeModalV35');if(w)return w;w=document.createElement('div');w.id='growthUpgradeModalV35';w.className='growth-upgrade-modal-v35';w.hidden=true;w.innerHTML=`<div class="growth-upgrade-card-v35"><div class="growth-spark-v35">✨ LEVEL UP ✨</div><h2>캐릭터를 업그레이드하시겠습니까?</h2><div id="growthUpgradePreview"></div><p id="growthUpgradeText"></p><div class="growth-upgrade-actions-v35"><button id="growthUpgradeNow" type="button">지금 업그레이드</button><button id="growthUpgradeLater" type="button">나중에</button></div></div>`;document.body.appendChild(w);return w}
  async function checkUpgradePrompt(force=false){let s=normalizeState(SJ.load());if(SJ.getRole&&SJ.getRole()!=='student')return false;if(!s.studentId||!canUpgrade(s))return false;const target=s.growthLevel+1;if(!force&&Number(s.lastUpgradePromptLevel)===target)return false;const m=ensureModal(),p=SJ.current(),n=info(target);render(m.querySelector('#growthUpgradePreview'),s.studentId,target);m.querySelector('#growthUpgradeText').innerHTML=`<b>${p?.name||''}</b> 학생이 <strong>Lv.${target} ${n.name}</strong>로 성장할 수 있어요!<br><small>${n.desc}</small>`;m.hidden=false;s.lastUpgradePromptLevel=target;SJ.save(s);m.querySelector('#growthUpgradeNow').onclick=async()=>{m.querySelector('#growthUpgradeNow').disabled=true;await upgrade();m.hidden=true;location.reload()};m.querySelector('#growthUpgradeLater').onclick=()=>m.hidden=true;return true}
  async function addXP(amount){let s=normalizeState(SJ.load());s.xp=Math.max(0,s.xp+(Number(amount)||0));await push(s);await checkUpgradePrompt(true);return s}
  async function claimReward(rewardId){
    let s=normalizeState(SJ.load());
    if(!s.studentId||!s.authToken)return {ok:false,error:'학생 로그인이 필요합니다.',progress:s};
    const d=await api({action:'claim-reward',studentId:s.studentId,token:s.authToken,rewardId});
    if(!d)return {ok:false,error:'보상 서버에 연결하지 못했습니다.',progress:s};
    if(d.progress){s.xp=Math.max(0,Number(d.progress.xp)||0);s.growthLevel=clamp(Number(d.progress.growthLevel)||1,1,5);SJ.save(s);window.dispatchEvent(new CustomEvent('sj:growth-changed',{detail:s}));}
    if(!d.alreadyClaimed&&d.amount)await checkUpgradePrompt(true);
    return d;
  }
  window.SJGrowth={levels,normalizeState,info,asset,render,nextInfo,canUpgrade,progressPct,pull,push,upgrade,checkUpgradePrompt,addXP,claimReward};
})();
