// Latest proposal vs frozen complete output; saved-policy replay remains exact.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),crypto=require('node:crypto'),a=require('../src/coach-adapters');
const clone=x=>JSON.parse(JSON.stringify(x)),eq=(a,b)=>JSON.stringify(a)===JSON.stringify(b),hash=b=>crypto.createHash('sha256').update(b).digest('hex');
function dose(p,essentialOnly=false){return p.weeks.map(w=>w.sessions.map(s=>({day:s.day,eventDate:s.eventDate||null,ex:s.ex.filter(e=>!essentialOnly||e[5]?.category==='primary').map(e=>e.slice(0,5)),runs:s.runs.map(r=>[r.name,r.distanceKm,r.minutes,r.steps])})))}
function run(output='docs/qa/stage-seven/regressions'){
 const dir=path.resolve(output);fs.mkdirSync(dir,{recursive:true});const profiles=[];
 for(const id of ['O1','O2','O3','P','Q','R','S','T','Taylor']){
  const previousPath='docs/qa/stage-six/regressions/'+id+'.json',bytes=fs.readFileSync(previousPath),r=JSON.parse(bytes),snapshot=JSON.stringify(r),opts={data:r.historicalData,now:()=>Date.parse(r.provenance.clock)};
  const p=a.buildNewProgramme(clone(r.input),opts);assert.deepEqual(p,a.buildNewProgramme(clone(r.input),opts));assert.equal(JSON.stringify(r),snapshot);
  assert.equal(JSON.stringify(a.buildProgramme(r.programme.config,opts)),JSON.stringify(r.programme));
  const changes=[];
  for(let i=0;i<p.weeks.length;i++)for(const s of p.weeks[i].sessions){const before=r.programme.weeks[i].sessions.find(t=>t.day===s.day&&t.eventDate===s.eventDate);assert.ok(before);if(!eq(s.ex.map(e=>e.slice(0,5)),before.ex.map(e=>e.slice(0,5)))||!eq(s.runs.map(t=>[t.distanceKm,t.steps]),before.runs.map(t=>[t.distanceKm,t.steps])))changes.push({week:i+1,day:s.day,beforeEx:before.ex,afterEx:s.ex,beforeRuns:before.runs,afterRuns:s.runs,adjustments:s.timeBudget?.adjustments});}
  const result={id,weeks:p.weeks.length,savedPolicyExactlyUnchanged:true,inputsUnchanged:true,deterministic:true,essentialPrescriptionAndDaysUnchanged:eq(dose(p,true),dose(r.programme,true)),changedSessionCount:changes.length,blockedWeeks:p.weeks.filter(w=>!w.feasible).map(w=>({week:w.week,issues:w.blockingIssues})),beforeBlockedWeeks:r.programme.weeks.filter(w=>!w.feasible).map(w=>w.week),firstWeekVisits:p.weeks[0].sessions.map(s=>({day:s.day,estimate:s.timeBudget?.baselineRangeMinutes,hardCap:s.timeBudget?.capMinutes})),baselineSha256:hash(bytes)};
  // Hard constraints must be surfaced honestly, never masked to match old booleans.
  for(const w of p.weeks)for(const s of w.sessions.filter(s=>!s.eventDate&&s.timeBudget?.hardLimit))if(s.timeBudget.feasible)assert.ok(s.timeBudget.visits.every(v=>v.capMinutes===null||v.rangeMinutes.max<=v.capMinutes));
  fs.writeFileSync(path.join(dir,id+'.json'),JSON.stringify({input:r.input,historicalData:r.historicalData,programme:p,changes,comparison:result},null,2)+'\n');profiles.push(result);
 }
 const summary={baseCommit:'5d27f31',weeks:profiles.reduce((n,p)=>n+p.weeks,0),profiles,sourceSha256:Object.fromEntries(['src/coach-engine.js','src/coach-constraints.js','src/coach-intake.js','index.html'].map(p=>[p,hash(fs.readFileSync(p))])),savedDataChanged:false,activated:false};fs.writeFileSync(path.join(dir,'comparison.json'),JSON.stringify(summary,null,2)+'\n');return summary;
}
if(require.main===module){const r=run(process.argv[2]);console.log(JSON.stringify({weeks:r.weeks,profiles:r.profiles.map(p=>({id:p.id,essentialUnchanged:p.essentialPrescriptionAndDaysUnchanged,changedSessions:p.changedSessionCount,blocked:p.blockedWeeks.length,beforeBlocked:p.beforeBlockedWeeks.length}))},null,2))}module.exports={run};
