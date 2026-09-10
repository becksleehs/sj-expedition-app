(function(){
  const ENDPOINT='/.netlify/functions/student-auth';
  async function req(body){
    const r=await fetch(ENDPOINT,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(body),cache:'no-store'});
    let data={}; try{data=await r.json()}catch{}
    if(!r.ok){const e=new Error(data.error||'보안 서버에 연결하지 못했습니다.');e.status=r.status;e.data=data;throw e}
    return data;
  }
  async function status(studentId){
    const r=await fetch(`${ENDPOINT}?studentId=${encodeURIComponent(studentId)}`,{cache:'no-store'});
    if(!r.ok) throw new Error('비밀번호 상태를 확인하지 못했습니다.');
    return r.json();
  }
  async function register(studentId,password){return req({action:'register',studentId,password})}
  async function login(studentId,password){return req({action:'login',studentId,password})}
  async function verify(studentId,token){try{return (await req({action:'verify',studentId,token})).ok}catch{return false}}
  async function reset(studentId,teacherPin){return req({action:'reset',studentId,teacherPin})}
  function setToken(token){const s=SJ.load();s.authToken=token||null;SJ.save(s)}
  function clearToken(){const s=SJ.load();delete s.authToken;SJ.save(s)}
  window.SJAuth={status,register,login,verify,reset,setToken,clearToken};
})();
