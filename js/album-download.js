(()=>{
 const CHUNK=1024*1024,urls=new Set();let active=0;
 const extension=mime=>({'image/jpeg':'jpg','image/png':'png','image/webp':'webp','video/mp4':'mp4','video/webm':'webm','video/quicktime':'mov'}[mime]||'jpg');
 const makeLink=(href,filename,label)=>{const link=document.createElement('a');link.className='album-save-v347';link.href=href;link.download=filename;link.textContent=label;return link;};
 const filename=(item,mission,kind)=>`sj-${mission?'mission':'album'}-${item.id}${mission?'-'+item.team:''}.${item.media?extension(item.media.mime):kind==='video'?'mp4':'jpg'}`;
 function attach(card,item,mission){
  const kind=item.media?.kind||(item.hasPhoto?'photo':item.kind),name=filename(item,mission,kind);
  if(kind==='photo'){
   const href=item.media?item.media.url+'&download=1':mission?'/.netlify/functions/field-missions?'+new URLSearchParams({action:'download-photo',id:item.id,team:item.team}):'/.netlify/functions/album?'+new URLSearchParams({id:item.id,download:'1'});
   card.append(makeLink(href,name,'⬇️ 사진 저장'));return;
  }
  if(kind!=='video'||!item.media?.url)return;
  const button=document.createElement('button'),message=document.createElement('small');button.type='button';button.className='album-save-v347';button.textContent='⬇️ 동영상 저장';message.setAttribute('role','status');card.append(button,message);
  button.onclick=async()=>{
   const size=Number(item.media.size);if(!Number.isSafeInteger(size)||size<1||size>150*1024*1024){message.textContent='영상 크기를 확인할 수 없습니다.';return;}
   button.disabled=true;active++;let writer=null;
   try{
    // When available, write each range straight to disk. Other phones assemble
    // the same verified ranges and offer a link the user can tap to save.
    if(typeof window.showSaveFilePicker==='function'){
     try{const handle=await window.showSaveFilePicker({suggestedName:name,types:[{description:'원정대 동영상',accept:{[item.media.mime]:['.'+extension(item.media.mime)]}}]});writer=await handle.createWritable();}
     catch(e){if(e.name==='AbortError'){message.textContent='저장을 취소했습니다.';return;}}
    }
    const parts=[];
    for(let start=0;start<size;start+=CHUNK){const end=Math.min(size-1,start+CHUNK-1),response=await fetch(item.media.url,{headers:{range:`bytes=${start}-${end}`},cache:'no-store'});
     if(response.status!==206||response.headers.get('content-range')!==`bytes ${start}-${end}/${size}`)throw Error('영상의 일부를 받지 못했습니다. 다시 시도해주세요.');
     const bytes=await response.arrayBuffer();if(bytes.byteLength!==end-start+1)throw Error('영상 파일 크기가 맞지 않습니다. 다시 시도해주세요.');
     if(writer)await writer.write(bytes);else parts.push(bytes);
     message.textContent=`동영상 준비 중 ${Math.round((end+1)/size*100)}% · 화면을 열어 두세요.`;
    }
    if(writer){await writer.close();writer=null;message.textContent='동영상 파일을 저장했습니다.';}
    else{const blob=new Blob(parts,{type:item.media.mime}),url=URL.createObjectURL(blob);urls.add(url);const link=makeLink(url,name,'⬇️ 준비 완료 · 파일 저장');card.append(link);message.textContent='준비 완료! 아래 「파일 저장」을 눌러주세요.';}
   }catch(e){if(writer)await writer.abort().catch(()=>{});message.textContent=e.message||'다운로드에 실패했습니다. 다시 시도해주세요.';button.disabled=false;}
   finally{active--;}
  };
 }
 window.addEventListener('pagehide',()=>{for(const url of urls)URL.revokeObjectURL(url);urls.clear();});
 window.SJAlbumDownload={attach,busy:()=>active>0};
})();
