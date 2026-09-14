(()=>{
 const panel=document.createElement('section');panel.className='notice-compose admin-special-v34';
 panel.innerHTML='<h2>공지 · 채팅 · 앨범 관리</h2><p>초기화와 삭제는 되돌릴 수 없습니다.</p><button data-reset="notices">기본 공지 1개만 남기기</button><div id="manageNotices"></div><h3>채팅방</h3><button data-reset="chat">방 청소하기</button><label>상단 중요사항<textarea id="pinnedText" maxlength="500" placeholder="빈칸으로 저장하면 고정 해제됩니다."></textarea></label><button id="savePinned">중요사항 고정 저장</button><h3>앨범</h3><button data-reset="album">앨범 전체 초기화</button><input id="teacherPhoto" type="file" accept="image/*"><input id="teacherCaption" maxlength="80" placeholder="사진 설명"><button id="uploadTeacherPhoto">사진 등록</button><div id="managePhotos"></div><button id="refreshManage">목록 새로고침</button><p id="manageStatus" role="status"></p>';
 document.getElementById('adminBox').append(panel);
 const status=panel.querySelector('#manageStatus');
 async function api(data){const r=await fetch('/.netlify/functions/room-admin',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({...data,teacherPin})});const d=await r.json();if(!r.ok)throw Error(d.error||'처리 실패');return d}
 async function run(button,fn){button.disabled=true;try{await fn();status.textContent='처리 완료';await load()}catch(e){status.textContent=e.message}finally{button.disabled=false}}
 panel.querySelectorAll('[data-reset]').forEach(b=>b.onclick=()=>{if(confirm(b.textContent+' — 기존 기록을 삭제할까요?'))run(b,()=>api({area:b.dataset.reset,action:'reset'}))});
 panel.querySelector('#savePinned').onclick=e=>run(e.target,()=>api({area:'chat',action:'pin',text:panel.querySelector('#pinnedText').value}));
 async function load(){try{
   for(const [area,key,target] of [['notices','notices','manageNotices'],['album','items','managePhotos']]){
     const r=await fetch('/.netlify/functions/'+area,{cache:'no-store'});if(!r.ok)throw Error('목록 조회 실패');const d=await r.json(),box=panel.querySelector('#'+target);box.replaceChildren();
     for(const item of d[key]||[]){const row=document.createElement('div');row.className='manage-row';
       if(area==='album'){const img=document.createElement('img');img.src='/.netlify/functions/album?id='+encodeURIComponent(item.id);img.alt=item.caption||'원정 사진';img.loading='lazy';row.append(img)}
       const text=document.createElement('span');text.textContent=item.title||item.caption||'사진';const del=document.createElement('button');del.textContent='삭제';del.onclick=()=>{if(confirm('이 항목을 삭제할까요?'))run(del,()=>api({area,action:'delete',id:item.id}))};row.append(text,del);box.append(row)}
   }
 }catch(e){status.textContent=e.message}}
 panel.querySelector('#refreshManage').onclick=load;
 new MutationObserver(()=>{if(!document.getElementById('adminBox').hidden){load();fetch('/.netlify/functions/chat').then(r=>r.json()).then(d=>{panel.querySelector('#pinnedText').value=d.pinned||''}).catch(()=>{})}}).observe(document.getElementById('adminBox'),{attributes:true,attributeFilter:['hidden']});
 panel.querySelector('#uploadTeacherPhoto').onclick=e=>run(e.target,async()=>{
   const file=panel.querySelector('#teacherPhoto').files[0];if(!file)throw Error('사진을 선택해주세요.');
   const image=new Image(),url=URL.createObjectURL(file);let imageData;
   try{image.src=url;await image.decode();const scale=Math.min(1,1280/Math.max(image.width,image.height)),canvas=document.createElement('canvas');canvas.width=Math.round(image.width*scale);canvas.height=Math.round(image.height*scale);canvas.getContext('2d').drawImage(image,0,0,canvas.width,canvas.height);imageData=canvas.toDataURL('image/jpeg',.78)}finally{URL.revokeObjectURL(url)}
   await api({area:'album',action:'upload',imageData,caption:panel.querySelector('#teacherCaption').value});panel.querySelector('#teacherPhoto').value='';
 });
})();
