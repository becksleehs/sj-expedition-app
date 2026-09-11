(function(){
  const Q={
    ulleung:[
      {id:'quiz_u1',q:'512년 우산국을 신라에 복속시킨 인물은 누구일까요?',choices:['장보고','이사부','김유신','안용복'],answer:1,why:'『삼국사기』에는 512년 이사부가 우산국을 복속시킨 기록이 전합니다.'},
      {id:'quiz_u2',q:'『세종실록』 「지리지」에서 울릉도와 연결되는 옛 이름은 무엇일까요?',choices:['무릉','제주','강화','거문'],answer:0,why:'기록에는 우산과 무릉 두 섬이 등장하며, 무릉은 울릉도의 옛 이름으로 설명됩니다.'},
      {id:'quiz_u3',q:'조선 숙종 때 울릉도와 관련해 기록에 등장하는 인물은?',choices:['이순신','정약용','안용복','세종'],answer:2,why:'안용복은 1693년과 1696년 울릉도·일본과 관련된 기록에 등장합니다.'},
      {id:'quiz_u4',q:'1900년 대한제국 칙령 제41호에서 울릉도는 어떤 이름으로 바뀌었을까요?',choices:['울도','우산도','송도','죽도'],answer:0,why:'칙령 제41호는 울릉도를 ‘울도’로 개칭하고 도감을 군수로 바꾸었습니다.'}
    ],
    dokdo:[
      {id:'quiz_d1',q:'1454년 『세종실록』 「지리지」에 함께 기록된 두 섬 이름은?',choices:['우산과 무릉','제주와 우도','거제와 가덕','진도와 완도'],answer:0,why:'『세종실록』 「지리지」에는 “우산과 무릉 두 섬”이 기록되어 있습니다.'},
      {id:'quiz_d2',q:'안용복의 두 번째 일본 방문과 관련된 『숙종실록』 기록은 몇 년일까요?',choices:['1592년','1696년','1796년','1900년'],answer:1,why:'1696년 『숙종실록』에 안용복 일행의 활동과 진술이 기록되어 있습니다.'},
      {id:'quiz_d3',q:'대한제국 칙령 제41호가 울도군 관할 구역으로 규정한 것은?',choices:['울릉도 전체·죽도·석도','울릉도 전체·제주도','죽도·거문도','울릉도 전체만'],answer:0,why:'칙령 제41호 제2조는 울릉도 전체와 죽도, 석도를 관할 구역으로 규정했습니다.'},
      {id:'quiz_d4',q:'한국의 공공 역사 자료에서 칙령 제41호의 “석도”는 어떤 섬으로 설명될까요?',choices:['마라도','독도','가거도','백령도'],answer:1,why:'국사편찬위원회와 외교부 자료는 칙령 제41호의 석도를 독도로 설명합니다.'}
    ]
  };
  let tab='ulleung',idx=0;const stage=document.getElementById('quizStage'),bonus=document.getElementById('quizBonus');
  const p=SJ.current(),logged=!!(p&&SJ.load().authToken);
  const solvedKey=id=>`sj2026_quiz_solved_${p?.id||'guest'}_${id}`;
  const isSolved=id=>localStorage.getItem(solvedKey(id))==='1';
  const allQuestions=()=>[...Q.ulleung,...Q.dokdo];
  const solvedCount=()=>allQuestions().filter(x=>isSolved(x.id)).length;
  function updateScore(){document.getElementById('quizSolved').textContent=`${solvedCount()} / 8`;if(solvedCount()===8)claimBonus();}
  async function claimBonus(){if(!logged||sessionStorage.getItem('sj2026_quiz_bonus_checked')==='1')return;sessionStorage.setItem('sj2026_quiz_bonus_checked','1');const d=await SJGrowth.claimReward('quiz_all_bonus');if(d?.ok&&!d.alreadyClaimed){bonus.hidden=false;setTimeout(()=>bonus.hidden=true,5000)}}
  function render(){const arr=Q[tab],q=arr[idx];stage.innerHTML=`<article class="quiz-card-v37"><div class="quiz-progress-v37"><span>${tab==='ulleung'?'울릉도':'독도'} ${idx+1} / ${arr.length}</span><i>${isSolved(q.id)?'✓ 정답 완료':'정답 +10 XP'}</i></div><h2>${q.q}</h2><div class="quiz-choices-v37">${q.choices.map((c,i)=>`<button type="button" data-i="${i}"><b>${i+1}</b>${c}</button>`).join('')}</div><div id="quizFeedback" class="quiz-feedback-v37" hidden></div><div class="quiz-next-v37"><button id="quizPrev" type="button" ${idx===0?'disabled':''}>← 이전</button><button id="quizNext" type="button">${idx===arr.length-1?'처음으로':'다음 →'}</button></div></article><p class="quiz-source-v37">📖 답은 ‘역사 이야기’ 화면에서 확인할 수 있어요.</p>`;
    const fb=document.getElementById('quizFeedback');stage.querySelectorAll('.quiz-choices-v37 button').forEach(b=>b.onclick=async()=>{if(b.classList.contains('wrong'))return;const choice=Number(b.dataset.i);if(choice!==q.answer){b.classList.add('wrong');fb.hidden=false;fb.className='quiz-feedback-v37 wrong';fb.textContent='아쉬워요! 역사 이야기를 떠올려 다시 골라보세요.';return}stage.querySelectorAll('.quiz-choices-v37 button').forEach(x=>x.disabled=true);b.classList.add('correct');fb.hidden=false;fb.className='quiz-feedback-v37 correct';if(!logged){fb.innerHTML=`정답! ${q.why}<br><small>학생 로그인 후에는 정답마다 +10 XP를 받을 수 있어요.</small>`;return}const d=await SJGrowth.claimReward(q.id);localStorage.setItem(solvedKey(q.id),'1');updateScore();fb.innerHTML=`정답! ${q.why}<br><small>${d?.alreadyClaimed?'이미 받은 문제 보상입니다.':'✨ +10 XP 획득!'}</small>`});
    document.getElementById('quizPrev').onclick=()=>{idx=Math.max(0,idx-1);render()};document.getElementById('quizNext').onclick=()=>{idx=idx===arr.length-1?0:idx+1;render()};
  }
  document.querySelectorAll('.quiz-tabs-v37 button').forEach(b=>b.onclick=()=>{document.querySelectorAll('.quiz-tabs-v37 button').forEach(x=>x.classList.remove('active'));b.classList.add('active');tab=b.dataset.tab;idx=0;render()});
  (async()=>{let open=false;try{const r=await fetch('/.netlify/functions/feature-gates',{cache:'no-store'});const d=await r.json();open=!!d.state?.quiz?.open}catch{}const lock=document.getElementById('quizLock');lock.hidden=open;stage.hidden=!open;document.querySelector('.quiz-score-v37').hidden=!open;document.querySelector('.quiz-tabs-v37').hidden=!open;if(open){updateScore();render()}})();
})();
