const test=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs'),os=require('node:os'),path=require('node:path'),{execFileSync}=require('node:child_process');
test('new Tuesday review discards disposable review logs once and preserves real athlete storage',()=>{
 const out=fs.mkdtempSync(path.join(os.tmpdir(),'lhrf-review-'));
 try{
  execFileSync(process.execPath,['scripts/build-review.cjs',out]);
  const html=fs.readFileSync(path.join(out,'index.html'),'utf8');
  const boot=[...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m=>m[1]).find(s=>s.startsWith('const LHRF_REVIEW_SEED='));
  const storage=initial=>{const o={...initial};Object.defineProperties(o,{getItem:{value:k=>o[k]??null},setItem:{value:(k,v)=>o[k]=v},removeItem:{value:k=>delete o[k]}});return o};
  const key='lhrf_review_20261025_beta_v1118_clean',real='lhrf_beta_v1118_clean';
  const localStorage=storage({[key]:'old disposable workout',[real]:'real athlete history',lhrf_fresh_beta_live_v1114:'real workout'}),sessionStorage=storage({'lhrf_review_20261025_live':'old trial',other:'retain'});
  vm.runInNewContext(boot,{localStorage,sessionStorage});const state=JSON.parse(localStorage[key]);
  assert.equal(state.customRoadmap.startDate,'2026-10-27');assert.equal(state.customRoadmap.weeks,5);assert.equal(state.activeCustomWeek,1);assert.deepEqual(state.sets,[]);assert.deepEqual(state.completedWorkouts,[]);
  assert.equal(localStorage[real],'real athlete history');assert.equal(localStorage.lhrf_fresh_beta_live_v1114,'real workout');assert.equal(sessionStorage.other,'retain');assert.equal(sessionStorage.lhrf_review_20261025_live,undefined);
  localStorage[key]='new block workout';vm.runInNewContext(boot,{localStorage,sessionStorage});assert.equal(localStorage[key],'new block workout','Reload cannot reset the new programme logs');
 }finally{fs.rmSync(out,{recursive:true,force:true})}
});
