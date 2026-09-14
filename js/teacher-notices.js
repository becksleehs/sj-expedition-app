(()=>{
 const section=document.createElement('section');section.className='admin-special-v34 notice-compose';
 section.innerHTML='<h2>📣 공지사항 작성</h2><p>새 공지를 올려도 이전 글은 계속 남습니다.</p><form><label>제목<input name="title" maxlength="100" required></label><label>내용<textarea name="body" maxlength="5000" rows="6" required></textarea></label><button type="submit">공지 올리기</button><p role="status"></p></form><a href="notices.html">등록된 공지 보기 ›</a>';
 document.getElementById('adminBox').prepend(section);
 const form=section.querySelector('form'),button=form.querySelector('button'),result=form.querySelector('p');let pending=null;
 form.addEventListener('submit',async e=>{
 e.preventDefault();if(button.disabled)return;const title=form.elements.title.value.trim(),body=form.elements.body.value.trim();
 if(!title||!body){result.textContent='제목과 내용을 입력해주세요.';return}
 if(!pending||pending.title!==title||pending.body!==body)pending={title,body,id:Date.now()+'-'+crypto.randomUUID()};
 button.disabled=true;result.textContent='저장 중…';
 try{const r=await fetch('/.netlify/functions/notices',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({...pending,teacherPin})});const d=await r.json();if(!r.ok)throw Error(d.error||'저장 실패');form.reset();pending=null;result.textContent='공지가 등록되었습니다. 학생 공지 화면에 곧 반영됩니다.'}
 catch(e){result.textContent=(e.message||'연결 실패')+' 입력 내용은 유지됩니다. 다시 시도해주세요.'}finally{button.disabled=false}
 });
})();
