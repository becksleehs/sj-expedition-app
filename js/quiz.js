(() => {
  const Q=window.SJ_QUIZ_DATA, D=window.SJ_DATA;
  const $=s=>document.querySelector(s);
  const load=(k,d)=>{try{return JSON.parse(localStorage.getItem(k))??d}catch{return d}};
  const save=(k,v)=>localStorage.setItem(k,JSON.stringify(v));
  const quizState=load('sj_quiz_state',{answered:{},stars:0,correct:0,badges:[],totalXp:0,bestStreak:0});
  let session={questions:[],index:0,correct:0,streak:0,bestStreak:0,xp:0,stars:0,cat:null,answered:false};

  function shuffle(a){return [...a].sort(()=>Math.random()-.5)}
  function updateStats(){
    $('#quizTotalXp').textContent=`⚡ ${quizState.totalXp} EXP`;
    $('#statStars').textContent=quizState.stars;
    $('#statCorrect').textContent=quizState.correct;
    $('#statBadges').textContent=`${quizState.badges.length} / 3`;
    $('#quizBadgeList').innerHTML=Q.categories.map(c=>`
      <article class="${quizState.badges.includes(c.id)?'earned':''}">
        <span>${c.icon}</span><b>${c.reward}</b><small>${quizState.badges.includes(c.id)?'획득 완료':'10문제 중 8개 정답 시 획득'}</small>
      </article>`).join('');
  }
  function categoryProgress(cat){
    const ids=Q.questions.filter(q=>q.cat===cat).map(q=>q.id);
    return ids.filter(id=>quizState.answered[id]?.correct).length;
  }
  function renderCategories(){
    $('#quizCategoryGrid').innerHTML=Q.categories.map(c=>{
      const correct=categoryProgress(c.id), earned=quizState.badges.includes(c.id);
      return `<button type="button" class="quiz-category-card" data-cat="${c.id}" style="--cat:${c.color}">
        <div class="cat-icon">${c.icon}</div>
        <span>지역 퀴즈</span><h3>${c.name}</h3>
        <div class="cat-progress"><i style="width:${correct*10}%"></i></div>
        <p>${correct} / 10 지식 수집</p>
        <b>${earned?'🏅 배지 획득':'도전하기 →'}</b>
      </button>`;
    }).join('');
    document.querySelectorAll('.quiz-category-card').forEach(b=>b.addEventListener('click',()=>startQuiz(b.dataset.cat)));
  }
  function show(id){['#quizLobby','#quizGame','#quizResult'].forEach(x=>$(x).classList.add('hidden'));$(id).classList.remove('hidden');window.scrollTo({top:0,behavior:'smooth'})}
  function startQuiz(cat){
    const pool=cat==='random'?Q.questions:Q.questions.filter(q=>q.cat===cat);
    session={questions:shuffle(pool).slice(0,10),index:0,correct:0,streak:0,bestStreak:0,xp:0,stars:0,cat,answered:false};
    show('#quizGame');renderQuestion();
  }
  function renderQuestion(){
    session.answered=false;
    const q=session.questions[session.index];
    const category=Q.categories.find(c=>c.id===q.cat);
    $('#quizCategoryName').textContent=session.cat==='random'?'🎲 랜덤 원정 퀴즈':`${category.icon} ${category.name}`;
    $('#quizProgressText').textContent=`${session.index+1} / ${session.questions.length}`;
    $('#quizProgressBar').style.width=`${(session.index/session.questions.length)*100}%`;
    $('#quizStreak').textContent=`🔥 ${session.streak}`;
    $('#questionIcon').textContent=category.icon;
    $('#questionNumber').textContent=`QUESTION ${session.index+1}`;
    $('#questionText').textContent=q.q;
    $('#answerFeedback').classList.add('hidden');
    $('#answerChoices').innerHTML=q.choices.map((c,i)=>`<button type="button" data-answer="${i}"><span>${String.fromCharCode(65+i)}</span><b>${c}</b></button>`).join('');
    document.querySelectorAll('#answerChoices button').forEach(b=>b.addEventListener('click',()=>answer(Number(b.dataset.answer))));
  }
  function answer(choice){
    if(session.answered)return;
    session.answered=true;
    const q=session.questions[session.index], correct=choice===q.answer;
    document.querySelectorAll('#answerChoices button').forEach((b,i)=>{
      b.disabled=true;
      if(i===q.answer)b.classList.add('correct');
      else if(i===choice)b.classList.add('wrong');
    });
    if(correct){
      session.correct++;session.streak++;session.bestStreak=Math.max(session.bestStreak,session.streak);
      const bonus=Math.min(session.streak-1,5)*2;
      session.xp+=20+bonus;session.stars+=3;
      $('#feedbackTitle').innerHTML=`<span>✅</span><b>정답! +${20+bonus} EXP</b>`;
    }else{
      session.streak=0;session.xp+=5;session.stars+=1;
      $('#feedbackTitle').innerHTML='<span>💡</span><b>아쉽지만 지식을 획득했어요!</b>';
    }
    quizState.answered[q.id]={correct:correct||quizState.answered[q.id]?.correct||false,last:Date.now()};
    $('#feedbackExplanation').textContent=q.exp;
    $('#answerFeedback').classList.remove('hidden');
    $('#quizStreak').textContent=`🔥 ${session.streak}`;
  }
  function finish(){
    const bonus=session.correct===10?100:session.correct>=8?50:0;
    session.xp+=bonus;
    quizState.totalXp+=session.xp;
    quizState.stars+=session.stars;
    quizState.correct+=session.correct;
    quizState.bestStreak=Math.max(quizState.bestStreak,session.bestStreak);
    let newBadge=null;
    if(session.cat!=='random' && session.correct>=8 && !quizState.badges.includes(session.cat)){
      quizState.badges.push(session.cat);newBadge=Q.categories.find(c=>c.id===session.cat);
    }
    save('sj_quiz_state',quizState);

    // 선택된 학생의 기존 RPG 점수에도 퀴즈 EXP 반영
    const sid=localStorage.getItem('sj_current_student');
    if(sid){
      const state=load('sj_state',{attendance:{},scores:{},teams:{},missions:{},avatars:{},completed:{},notice:'',dress:{}});
      state.scores[sid]=Number(state.scores[sid]||0)+session.xp;
      save('sj_state',state);
    }

    $('#resultScore').textContent=session.correct;
    $('#resultXp').textContent=`+${session.xp}`;
    $('#resultStars').textContent=`+${session.stars}`;
    $('#resultStreak').textContent=session.bestStreak;
    $('#resultMedal').textContent=session.correct===10?'👑':session.correct>=8?'🏆':session.correct>=5?'🥈':'📘';
    $('#resultTitle').textContent=session.correct===10?'완벽한 원정 지식왕!':session.correct>=8?'지역 탐험 완료!':session.correct>=5?'좋은 도전이었어요!':'지식을 더 모아봐요!';
    $('#resultMessage').textContent=`10문제 중 ${session.correct}문제를 맞혔습니다.${bonus?` 완주 보너스 ${bonus} EXP 획득!`:''}`;
    if(newBadge){
      $('#newBadgeNotice').classList.remove('hidden');
      $('#newBadgeNotice').innerHTML=`<span>${newBadge.icon}</span><div><small>NEW BADGE</small><b>${newBadge.reward}</b></div>`;
    }else $('#newBadgeNotice').classList.add('hidden');
    show('#quizResult');
  }
  $('#nextQuestionBtn').addEventListener('click',()=>{
    if(session.index>=session.questions.length-1)finish();
    else{session.index++;renderQuestion()}
  });
  $('#quitQuizBtn').addEventListener('click',()=>{if(confirm('퀴즈를 그만하고 로비로 돌아갈까요?')){updateStats();renderCategories();show('#quizLobby')}});
  $('#randomQuizBtn').addEventListener('click',()=>startQuiz('random'));
  $('#retryQuizBtn').addEventListener('click',()=>startQuiz(session.cat));
  updateStats();renderCategories();
})();