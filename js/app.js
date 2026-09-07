const KEY='sj2026_fresh_v1';
const TEACHER_PIN='1014';
const students=[
{id:'s01',grade:1,name:'김서하',gender:'M'},{id:'s02',grade:1,name:'조현정',gender:'F'},
{id:'s03',grade:2,name:'김주안',gender:'M'},{id:'s04',grade:2,name:'위준민',gender:'M'},{id:'s05',grade:2,name:'정범수',gender:'M'},{id:'s06',grade:2,name:'양하율',gender:'M'},{id:'s07',grade:2,name:'박현제',gender:'M'},
{id:'s08',grade:3,name:'양서현',gender:'M'},{id:'s09',grade:3,name:'위지현',gender:'F'},{id:'s10',grade:3,name:'이사랑',gender:'F'},{id:'s11',grade:3,name:'이희주',gender:'F'},{id:'s12',grade:3,name:'송승아',gender:'F'},{id:'s13',grade:3,name:'오예린',gender:'F'}];
const chars={M:[['m1','탐험대장'],['m2','스마트 스카우트'],['m3','레드 러너']],F:[['f1','핑크 가이드'],['f2','포레스트 캠퍼'],['f3','퍼플 러너']]};
function defaultState(){return {studentId:null,avatar:null,avatarChangesUsed:0,gear:{},gearColors:{}}}
function load(){try{return Object.assign(defaultState(),JSON.parse(localStorage.getItem(KEY))||{})}catch{return defaultState()}}
function save(s){localStorage.setItem(KEY,JSON.stringify(s))}
function current(){let s=load();return students.find(x=>x.id===s.studentId)}
function isRegistered(){const s=load();return !!(s.studentId&&s.avatar&&students.some(x=>x.id===s.studentId))}
function entryUrl(){return isRegistered()?'home.html':'select-student.html'}
function remainingAvatarChanges(){const s=load();return Math.max(0,1-(Number(s.avatarChangesUsed)||0))}
function resetCurrent(){localStorage.removeItem(KEY)}
window.SJ={KEY,TEACHER_PIN,students,chars,load,save,current,isRegistered,entryUrl,remainingAvatarChanges,resetCurrent};
// Fresh reset: retire old service workers/caches once on this build.
if(!sessionStorage.getItem('sj2026_sw_cleaned_v15')){sessionStorage.setItem('sj2026_sw_cleaned_v15','1');if('serviceWorker'in navigator)navigator.serviceWorker.getRegistrations().then(rs=>rs.forEach(r=>r.unregister()));if(window.caches)caches.keys().then(ks=>ks.forEach(k=>{if(/^sj-|expedition/i.test(k))caches.delete(k)}));}
