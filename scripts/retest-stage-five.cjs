// Complete frozen-profile replay and evidence only; never activates or rewrites athlete data.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),crypto=require('node:crypto'),cp=require('node:child_process');
const {run}=require('./test-five-scenarios.cjs'),{audit}=require('./audit-five-scenarios.cjs'),{metrics}=require('./compare-original-three.cjs');
const adapters=require('../src/coach-adapters.js');
const root=path.join(__dirname,'..'),manifest=require('../docs/qa/stage-five/baseline-manifest.json'),hash=b=>crypto.createHash('sha256').update(b).digest('hex'),same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
const doses=w=>w.sessions.map(s=>[s.day,(s.ex||[]).map(e=>e.slice(0,5)),s.runs]);
const bag=(w,key)=>w.sessions.flatMap(s=>key==='ex'?(s.ex||[]).map(e=>e.slice(0,5)):s.runs||[]).sort((a,b)=>JSON.stringify(a).localeCompare(JSON.stringify(b)));
function replay(dest='docs/qa/stage-five/current'){
 const dir=path.resolve(root,dest);fs.mkdirSync(dir,{recursive:true});
 for(const x of manifest.baselines)assert.equal(hash(fs.readFileSync(path.join(root,x.path))),x.sha256,'Baseline changed: '+x.path);
 for(const [f,h]of Object.entries(manifest.inputs))assert.equal(hash(fs.readFileSync(path.join(root,f))),h,'Frozen input changed');
 const captures=[],gates=[];
 for(const f of ['original-three-engine-inputs','stage-two-new-athletes','five-scenario-round-three-inputs']){
  const fixturePath='tests/fixtures/'+f+'.json',fixture=require('../'+fixturePath),selected=f==='five-scenario-round-three-inputs'?{...fixture,cases:fixture.cases.filter(x=>x.id==='O')}:fixture;
  const capture=run({fixture:selected,fixturePath});assert.ok(capture.cases.every(x=>!x.error&&Object.values(x.checks).every(Boolean)));
  if(f==='original-three-engine-inputs')gates.push(audit(capture));
  for(const row of capture.cases){
   const key=f==='five-scenario-round-three-inputs'?'Taylor':row.id;
   const baselinePath=key==='Taylor'?'docs/qa/stage-five/baseline/Taylor.json':key.startsWith('O')?'docs/qa/stage-four/current/'+key+'.json':'docs/qa/stage-three/'+key+'.json';
   const before=JSON.parse(fs.readFileSync(path.join(root,baselinePath))),after={...row,provenance:capture.provenance};
   assert.deepEqual(before.input,after.input);assert.deepEqual(before.historicalData,after.historicalData);
   assert.equal(JSON.stringify(adapters.buildProgramme(before.programme.config,{data:before.historicalData,now:()=>Date.parse(fixture.clock)})),JSON.stringify(before.programme),'Saved previous programme changed');
   fs.writeFileSync(path.join(dir,key+'.json'),JSON.stringify(after,null,2)+'\n');
   const b=metrics(before),a=metrics(after),changed=row.programme.weeks.flatMap((w,i)=>{
    const old=before.programme.weeks[i];if(same(old,w))return [];
    return [{week:w.week,numericOrDayChanged:!same(doses(old),doses(w)),strengthDoseChanged:!same(bag(old,'ex'),bag(w,'ex')),runningDoseChanged:!same(bag(old,'runs'),bag(w,'runs')),before:old.sessions.map(s=>({day:s.day,ex:s.ex,runs:s.runs,budget:s.timeBudget})),after:w.sessions.map(s=>({day:s.day,ex:s.ex,runs:s.runs,budget:s.timeBudget}))}];
   });
   captures.push({id:key,name:row.name,weeks:a.weeks.length,checks:row.checks,baseline:baselinePath,baselineSha256:hash(fs.readFileSync(path.join(root,baselinePath))),before:b,after:a,changed,
    allRunDosesUnchanged:changed.every(x=>!x.runningDoseChanged),allOrdinaryVisitsFit:row.programme.weeks.every(w=>w.sessions.filter(s=>!s.eventDate).every(s=>s.timeBudget?.feasible!==false)),
    beforeBlockedWeeks:before.programme.weeks.filter(w=>!w.feasible).map(w=>w.week),afterBlockedWeeks:row.programme.weeks.filter(w=>!w.feasible).map(w=>w.week),savedPreviousProgrammeExactlyUnchanged:true});
  }
 }
 const allowed=new Set(['src/coach-engine.js','src/coach-constraints.js']),files=cp.execFileSync('git',['ls-tree','-r','--name-only',manifest.baseCommit],{cwd:root,encoding:'utf8'}).trim().split('\n'),changedBase=[];
 for(const f of files){if(allowed.has(f))continue;const bytes=cp.execFileSync('git',['show',manifest.baseCommit+':'+f],{cwd:root,maxBuffer:32*1024*1024});if(!fs.readFileSync(path.join(root,f)).equals(bytes))changedBase.push(f)}
 assert.deepEqual(changedBase,[],'Unexpected edit to a pre-existing file');
 const result={schema:'lhrf-stage-five-comparison-v1',baseCommit:manifest.baseCommit,sourceSha256:Object.fromEntries([...allowed].map(f=>[f,hash(fs.readFileSync(path.join(root,f)))])),capturedWeeks:captures.reduce((n,c)=>n+c.weeks,0),protectedBaseFiles:{checked:files.length-allowed.size,changed:changedBase},coachingSignoff:false,captures,gates};
 fs.writeFileSync(path.join(dir,'comparison.json'),JSON.stringify(result,null,2)+'\n');return result;
}
if(require.main===module){const r=replay(process.argv[2]);console.log(JSON.stringify({capturedWeeks:r.capturedWeeks,protectedBaseFiles:r.protectedBaseFiles,profiles:r.captures.map(c=>({id:c.id,weeks:c.weeks,beforeDays:c.before.weeks[0].strengthDays,afterDays:c.after.weeks[0].strengthDays,oldHardAdjacent:c.before.adjacentHardLower.length,newHardAdjacent:c.after.adjacentHardLower.length,changedWeeks:c.changed.filter(w=>w.numericOrDayChanged).map(w=>w.week),strengthChangedWeeks:c.changed.filter(w=>w.strengthDoseChanged).map(w=>w.week),runningDosesUnchanged:c.allRunDosesUnchanged,allOrdinaryVisitsFit:c.allOrdinaryVisitsFit,blockedWeeks:c.afterBlockedWeeks})),gates:r.gates.map(g=>g.summary)},null,2))}
module.exports={replay};
