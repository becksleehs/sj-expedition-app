(()=>{
const $=s=>document.querySelector(s),money=n=>Number(n).toLocaleString('ko-KR')+'원';
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const funds=[['학교자율','학교자율 예산'],['수자원','수자원 예산']];
let pin='',items=[],fundFilter='all',statusFilter='all';
const drafts=new Map();

async function api(body){
  const r=await fetch('/.netlify/functions/expenses',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({...body,teacherPin:pin}),cache:'no-store'});
  const d=await r.json();
  if(!r.ok){const e=Error(d.error||'연결을 확인해주세요.');e.current=d.current;throw e;}
  return d;
}
function totals(rows){
  const done=rows.filter(x=>x.done);
  return {count:rows.length,done:done.length,amount:rows.reduce((s,x)=>s+x.amount,0),paid:done.reduce((s,x)=>s+x.amount,0)};
}
function summary(){
  const all=totals(items);
  $('#summary').innerHTML=`<div class="summary-head"><b>전체 예산 ${money(all.amount)}</b><span>완료 ${all.done}/${all.count}건</span></div>
    <div class="budget-grid">${funds.map(([id,label])=>{
      const t=totals(items.filter(x=>x.fund===id));
      return `<div class="budget-box"><b>${label}</b><strong>${money(t.amount)}</strong><small>집행 완료 ${money(t.paid)} · ${t.done}/${t.count}건</small><small>미집행 ${money(t.amount-t.paid)}</small></div>`;
    }).join('')}</div>`;
}
function card(item){
  const c=document.createElement('article');
  c.className='card'+(item.done?' done':'');
  c.innerHTML=`<small>${esc(item.category)} · ${esc(item.fund)}</small><h3>${esc(item.title)}</h3><p class="amount">${money(item.amount)}</p>
    ${item.note?`<p class="original">${esc(item.note)}</p>`:''}
    <div class="actions"><button class="toggle" aria-pressed="${item.done}">${item.done?'✓ 집행 완료':'○ 미집행'}</button>
    <label class="memoLabel" for="memo-${item.id}">결제 메모</label><textarea id="memo-${item.id}" maxlength="2000" placeholder="결제 시각, 결제 방법, 영수증, 잔금 등을 기록하세요."></textarea><button class="save">메모 저장</button></div>
    <p class="status" role="status"></p>`;
  const ta=c.querySelector('textarea'),status=c.querySelector('.status');
  const stamp=()=>item.updatedAt?'최근 저장: '+new Date(item.updatedAt).toLocaleString('ko-KR',{timeZone:'Asia/Seoul'}):'아직 집행 기록이 없습니다.';
  ta.value=drafts.has(item.id)?drafts.get(item.id):item.memo;
  status.textContent=drafts.has(item.id)?'저장하지 않은 메모가 있습니다.':stamp();
  ta.oninput=()=>{
    if(ta.value===item.memo)drafts.delete(item.id);else drafts.set(item.id,ta.value);
    status.textContent=drafts.has(item.id)?'메모를 작성한 뒤 저장해주세요.':stamp();
  };
  async function update(change){
    c.querySelectorAll('button').forEach(b=>b.disabled=true);status.textContent='저장 중…';
    try{
      const d=await api({action:'update',id:item.id,revision:item.revision,...change});
      Object.assign(item,d.item);
      if(Object.hasOwn(change,'memo')&&ta.value===change.memo)drafts.delete(item.id);
      render();$('#feedback').textContent='✓ '+item.title+' 기록을 서버에 저장했습니다.';
    }catch(e){
      if(e.current)Object.assign(item,e.current);
      render();$('#feedback').textContent=e.message+' 작성 중인 메모는 유지됩니다.';
    }
  }
  c.querySelector('.toggle').onclick=()=>update({done:!item.done});
  c.querySelector('.save').onclick=()=>update({memo:ta.value});
  return c;
}
function render(){
  summary();
  document.querySelectorAll('[data-fund]').forEach(b=>{const on=b.dataset.fund===fundFilter;b.classList.toggle('active',on);b.setAttribute('aria-pressed',String(on));});
  document.querySelectorAll('[data-filter]').forEach(b=>{const on=b.dataset.filter===statusFilter;b.classList.toggle('active',on);b.setAttribute('aria-pressed',String(on));});
  const list=$('#list');list.replaceChildren();
  for(const [id,label] of funds){
    if(fundFilter!=='all'&&fundFilter!==id)continue;
    const all=items.filter(x=>x.fund===id),visible=all.filter(x=>statusFilter==='all'||(statusFilter==='done'?x.done:!x.done));
    if(!visible.length)continue;
    const section=document.createElement('section'),head=document.createElement('div'),t=totals(all);
    section.className='fund-section';head.className='fund-heading';
    head.innerHTML=`<h2>${label}</h2><span>${money(t.amount)} · 완료 ${t.done}/${t.count}건</span>`;
    section.appendChild(head);visible.forEach(x=>section.appendChild(card(x)));list.appendChild(section);
  }
  if(!list.children.length)list.innerHTML='<p class="empty">이 조건에 해당하는 항목이 없습니다.</p>';
}
async function load(){
  const d=await api({action:'list'});items=d.items;
  $('#login').hidden=true;$('#content').hidden=false;render();
}
$('#openExpenses').onclick=async()=>{
  pin=$('#expensePin').value;$('#error').textContent='';$('#openExpenses').disabled=true;
  try{await load();$('#expensePin').value='';}catch(e){$('#error').textContent=e.message;}finally{$('#openExpenses').disabled=false;}
};
$('#expensePin').onkeydown=e=>{if(e.key==='Enter')$('#openExpenses').click();};
document.querySelectorAll('[data-fund]').forEach(b=>b.onclick=()=>{fundFilter=b.dataset.fund;render();});
document.querySelectorAll('[data-filter]').forEach(b=>b.onclick=()=>{statusFilter=b.dataset.filter;render();});
$('#reload').onclick=()=>load().then(()=>{$('#feedback').textContent='최신 집행 기록을 불러왔습니다.';}).catch(e=>{$('#feedback').textContent=e.message;});
$('#logout').onclick=()=>{
  if(drafts.size&&!confirm('저장하지 않은 메모가 있습니다. 잠글까요?'))return;
  pin='';items=[];drafts.clear();$('#list').replaceChildren();$('#feedback').textContent='';
  $('#content').hidden=true;$('#login').hidden=false;
};
window.addEventListener('beforeunload',e=>{if(drafts.size){e.preventDefault();e.returnValue='';}});

const context=document.modelContext;
if(context?.registerTool){
  Promise.resolve(context.registerTool({name:'read_expenses',title:'집행 현황 보기',description:'교사 PIN으로 연 항목별 예산 출처와 집행 현황을 확인합니다.',inputSchema:{type:'object',properties:{},additionalProperties:false},annotations:{readOnlyHint:true},execute(){
    if(!pin||!items.length)throw Error('교사 PIN으로 집행내역을 먼저 여세요.');
    return {items:items.map(({id,title,fund,amount,done,memo,revision})=>({id,title,fund,amount,done,memo,revision}))};
  }})).catch(()=>{});
  Promise.resolve(context.registerTool({name:'save_expense',title:'집행 여부·메모 저장',description:'화면에 열린 집행 항목의 완료 여부 또는 메모를 서버에 저장합니다.',inputSchema:{type:'object',properties:{id:{type:'string'},done:{type:'boolean'},memo:{type:'string',maxLength:2000}},required:['id'],additionalProperties:false},annotations:{readOnlyHint:false},async execute(input){
    if(!pin||!items.length)throw Error('교사 PIN으로 집행내역을 먼저 여세요.');
    if(!input||typeof input.id!=='string'||(!Object.hasOwn(input,'done')&&!Object.hasOwn(input,'memo'))||Object.hasOwn(input,'done')&&typeof input.done!=='boolean'||Object.hasOwn(input,'memo')&&(typeof input.memo!=='string'||input.memo.length>2000))throw Error('항목과 변경할 값을 확인해주세요.');
    const item=items.find(x=>x.id===input.id);if(!item)throw Error('해당 항목을 찾지 못했습니다.');
    const changes={};if(Object.hasOwn(input,'done'))changes.done=input.done;if(Object.hasOwn(input,'memo'))changes.memo=input.memo;
    const response=await api({action:'update',id:item.id,revision:item.revision,...changes});
    Object.assign(item,response.item);drafts.delete(item.id);render();
    return {id:item.id,done:item.done,memo:item.memo,revision:item.revision};
  }})).catch(()=>{});
}
})();
