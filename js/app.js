const KEY='sj2026_fresh_v1';
const ROLE_KEY='sj2026_role_v31';
const students=[
{id:'s01',grade:1,name:'김서하',gender:'M'},{id:'s02',grade:1,name:'조현정',gender:'F'},
{id:'s03',grade:2,name:'김주안',gender:'M'},{id:'s04',grade:2,name:'위준민',gender:'M'},{id:'s05',grade:2,name:'정범수',gender:'M'},{id:'s06',grade:2,name:'양하율',gender:'M'},{id:'s07',grade:2,name:'박현제',gender:'M'},
{id:'s08',grade:3,name:'양서현',gender:'M'},{id:'s09',grade:3,name:'위지현',gender:'F'},{id:'s10',grade:3,name:'이사랑',gender:'F'},{id:'s11',grade:3,name:'이희주',gender:'F'},{id:'s12',grade:3,name:'송승아',gender:'F'},{id:'s13',grade:3,name:'오예린',gender:'F'}];
function defaultState(){return {studentId:null,avatar:null,avatarChangesUsed:0,authToken:null,xp:0,growthLevel:1,lastUpgradePromptLevel:1}}
function load(){try{return Object.assign(defaultState(),JSON.parse(localStorage.getItem(KEY))||{})}catch{return defaultState()}}
function save(s){localStorage.setItem(KEY,JSON.stringify(s))}
function current(){const s=load();return students.find(x=>x.id===s.studentId)}
function isRegistered(){const s=load();return !!(s.studentId&&students.some(x=>x.id===s.studentId)&&(s.avatar||s.growthLevel))}
function resetCurrent(){localStorage.removeItem(KEY)}
function getRole(){let role=localStorage.getItem(ROLE_KEY);if(role==='student'||role==='guest')return role;const s=load();if(s.studentId&&s.authToken){localStorage.setItem(ROLE_KEY,'student');return 'student'}return null}
function setRole(role){if(role==='student'||role==='guest')localStorage.setItem(ROLE_KEY,role);else localStorage.removeItem(ROLE_KEY)}
function clearRole(){localStorage.removeItem(ROLE_KEY)}
function entryUrl(){const role=getRole();if(role==='guest')return 'index.html';return isRegistered()?'index.html':'select-student.html'}
window.SJ={KEY,ROLE_KEY,students,load,save,current,isRegistered,entryUrl,resetCurrent,getRole,setRole,clearRole};
if(!sessionStorage.getItem('sj2026_sw_cleaned_v38')){sessionStorage.setItem('sj2026_sw_cleaned_v38','1');if('serviceWorker'in navigator)navigator.serviceWorker.getRegistrations().then(rs=>rs.forEach(r=>r.unregister()));if(window.caches)caches.keys().then(ks=>ks.forEach(k=>{if(/^sj-|expedition/i.test(k))caches.delete(k)}));}
if('serviceWorker'in navigator){window.addEventListener('load',()=>navigator.serviceWorker.register('sw.js').catch(()=>{}));}
