(function(){
  const stories={
    ulleung:[
      {id:'history_u1',year:'512년',title:'우산국과 이사부',icon:'🦁',body:'신라 지증왕 13년, 하슬라주의 군주 이사부가 우산국을 신라에 복속시켰다는 기록이 『삼국사기』에 전합니다. 우산국은 오늘날 울릉도 일대를 중심으로 한 세력으로 설명됩니다.',fact:'기억하기: 이사부 · 우산국 · 512년',source:'국사편찬위원회 「신라의 우산국 정복」',url:'https://contents.history.go.kr/front/hm/view.do?levelId=hm_011_0030'},
      {id:'history_u2',year:'1454년',title:'세종실록 속 무릉과 우산',icon:'📜',body:'『세종실록』 「지리지」에는 우산과 무릉 두 섬이 울진현 동쪽 바다에 있다고 기록되어 있습니다. 무릉은 울릉도를 가리키는 옛 이름으로 사용되었습니다.',fact:'기억하기: 무릉 = 울릉도와 연결된 옛 지명',source:'외교부 독도 「세종실록 지리지」',url:'https://dokdo.mofa.go.kr/kor/pds/part06_view02.jsp'},
      {id:'history_u3',year:'1693~1696년',title:'안용복과 울릉도',icon:'⛵',body:'조선 숙종 때 안용복은 울릉도에서 일본 어민과 마주친 뒤 일본으로 건너간 일로 기록에 남았습니다. 1696년 『숙종실록』에는 안용복 일행이 울릉도에 갔다가 일본으로 건너가 일본인과 다툰 뒤 돌아온 내용이 실려 있습니다.',fact:'기억하기: 안용복 · 숙종 · 울릉도',source:'조선왕조실록, 숙종 22년 8월 29일',url:'https://sillok.history.go.kr/id/ksa_12208029_003'},
      {id:'history_u4',year:'1900년',title:'울도군이 된 울릉도',icon:'🏛️',body:'대한제국은 칙령 제41호로 울릉도를 ‘울도’로 고치고 도감을 군수로 바꾸어 행정 체계를 강화했습니다. 울도군의 관할 구역도 함께 규정했습니다.',fact:'기억하기: 대한제국 · 칙령 제41호 · 울도군',source:'국사편찬위원회 「대한제국 칙령 제41호」',url:'https://contents.history.go.kr/front/hm/view.do?levelId=hm_122_0020'}
    ],
    dokdo:[
      {id:'history_d1',year:'1454년',title:'옛 기록 속 우산도',icon:'🗺️',body:'『세종실록』 「지리지」는 우산과 무릉 두 섬을 함께 기록합니다. 한국의 공공 사료에서는 이 우산을 독도와 연결하여 설명하고 있습니다.',fact:'기억하기: 우산 · 무릉 · 세종실록 지리지',source:'외교부 독도 「세종실록 지리지」',url:'https://dokdo.mofa.go.kr/kor/pds/part06_view02.jsp'},
      {id:'history_d2',year:'1696년',title:'안용복의 두 번째 도일',icon:'🧭',body:'『숙종실록』에는 안용복이 울릉도에서 일본 어민을 만난 뒤 일본으로 건너가 울릉도와 자산도에 관한 주장을 했다고 진술한 기록이 있습니다. 외교부 자료는 자산도를 독도와 연결해 설명합니다.',fact:'기억하기: 안용복 · 자산도 · 1696년',source:'외교부 독도 「안용복의 활동」',url:'https://dokdo.mofa.go.kr/m/kor/dokdo/faq05.jsp'},
      {id:'history_d3',year:'1900년',title:'칙령 제41호와 석도',icon:'📕',body:'대한제국 칙령 제41호 제2조는 울도군의 관할 구역을 울릉도 전체와 죽도, 석도로 규정했습니다. 한국의 역사 자료에서는 이 석도를 독도로 설명합니다.',fact:'기억하기: 울도군 · 죽도 · 석도',source:'외교부 독도 「칙령 제41호」',url:'https://dokdo.mofa.go.kr/kor/pds/part02_view02.jsp'},
      {id:'history_d4',year:'오늘',title:'오늘날의 독도',icon:'🇰🇷',body:'대한민국은 독도를 경상북도 울릉군에 두고 실효적으로 관리하고 있습니다. 한편 일본 정부도 독도에 대한 영유권을 주장하고 있어, 관련 역사와 사료를 정확히 살펴보는 태도가 중요합니다.',fact:'생각하기: 주장보다 사료와 근거를 확인하기',source:'대한민국 외교부 독도',url:'https://dokdo.mofa.go.kr/kor/'}
    ]
  };
  const list=document.getElementById('historyList');let tab='ulleung';
  const esc=s=>String(s).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const current=()=>SJ.current();
  function doneKey(id){return `sj2026_history_done_${current()?.id||'guest'}_${id}`}
  function render(){list.innerHTML='';stories[tab].forEach((s,i)=>{const done=localStorage.getItem(doneKey(s.id))==='1';const logged=!!(current()&&SJ.load().authToken);const c=document.createElement('article');c.className='history-card-v37';c.innerHTML=`<div class="history-card-top-v37"><span class="history-icon-v37">${s.icon}</span><div><em>${s.year}</em><h3>${esc(s.title)}</h3></div><i>${i+1}</i></div><p>${esc(s.body)}</p><div class="history-fact-v37">💡 ${esc(s.fact)}</div><div class="history-card-actions-v37"><a href="${s.url}" target="_blank" rel="noopener">자료 보기 ↗</a><button type="button" ${done?'disabled':''}>${done?'✓ 읽기 완료':logged?'읽었어요 · +5 XP':'학생 로그인 후 +5 XP'}</button></div><small>자료: ${esc(s.source)}</small>`;const b=c.querySelector('button');b.onclick=async()=>{if(!logged){alert('학생으로 로그인하면 읽기 XP를 받을 수 있어요.');return}b.disabled=true;b.textContent='저장 중…';const d=await SJGrowth.claimReward(s.id);if(!d?.ok){b.disabled=false;b.textContent='읽었어요 · +5 XP';alert(d?.error||'보상을 저장하지 못했습니다.');return}localStorage.setItem(doneKey(s.id),'1');b.textContent=d.alreadyClaimed?'✓ 이미 받은 XP':'✓ +5 XP 획득!';setTimeout(()=>b.textContent='✓ 읽기 완료',1400)};list.appendChild(c)})}
  document.querySelectorAll('.history-tabs-v37 button').forEach(b=>b.onclick=()=>{document.querySelectorAll('.history-tabs-v37 button').forEach(x=>x.classList.remove('active'));b.classList.add('active');tab=b.dataset.tab;render();window.scrollTo({top:0,behavior:'smooth'})});render();
})();
