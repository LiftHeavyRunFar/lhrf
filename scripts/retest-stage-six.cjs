// Frozen regression capture only. Real athlete data belongs outside the repository.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const {run}=require('./test-five-scenarios.cjs'),{audit}=require('./audit-five-scenarios.cjs'),{metrics}=require('./compare-original-three.cjs'),adapters=require('../src/coach-adapters.js');
const root=path.join(__dirname,'..'),hash=b=>crypto.createHash('sha256').update(b).digest('hex'),equal=(a,b)=>JSON.stringify(a)===JSON.stringify(b),dose=p=>p.weeks.map(w=>w.sessions.map(s=>[s.day,s.ex,s.runs]));
function retest(output='docs/qa/stage-six/regressions'){
 const dir=path.resolve(root,output);fs.mkdirSync(dir,{recursive:true});const comparisons=[],gates=[];
 for(const file of ['original-three-engine-inputs','stage-two-new-athletes','five-scenario-round-three-inputs']){
  const fixturePath='tests/fixtures/'+file+'.json',fixture=require('../'+fixturePath),selected=file==='five-scenario-round-three-inputs'?{...fixture,cases:fixture.cases.filter(r=>r.id==='O')}:fixture;
  const capture=run({fixture:selected,fixturePath});assert.ok(capture.cases.every(r=>!r.error&&Object.values(r.checks).every(Boolean)));
  if(file==='original-three-engine-inputs')gates.push(audit(capture));
  for(const row of capture.cases){const id=file==='five-scenario-round-three-inputs'?'Taylor':row.id,baselinePath='docs/qa/stage-five/current/'+id+'.json',bytes=fs.readFileSync(path.join(root,baselinePath)),baseline=JSON.parse(bytes),m=metrics(row),b=metrics(baseline);
   assert.deepEqual(row.input,baseline.input);assert.deepEqual(row.historicalData,baseline.historicalData);assert.ok(equal(dose(row.programme),dose(baseline.programme)),id+' changed an established prescription');
   assert.equal(JSON.stringify(adapters.buildProgramme(baseline.programme.config,{data:baseline.historicalData,now:()=>Date.parse(fixture.clock)})),JSON.stringify(baseline.programme));
   const blocked=p=>p.weeks.filter(w=>!w.feasible).map(w=>w.week);assert.deepEqual(blocked(row.programme),blocked(baseline.programme));
   fs.writeFileSync(path.join(dir,id+'.json'),JSON.stringify({...row,provenance:capture.provenance},null,2)+'\n');
   comparisons.push({id,weeks:row.programme.weeks.length,checks:row.checks,baseline:baselinePath,baselineSha256:hash(bytes),prescriptionsAndDaysExactlyUnchanged:true,savedProgrammeExactlyUnchanged:true,blockedWeeks:blocked(row.programme),beforeHardAdjacent:b.adjacentHardLower.length,afterHardAdjacent:m.adjacentHardLower.length});
  }
 }
 const result={schema:'lhrf-stage-six-regressions-v1',baseCommit:'f22f6ad',fixtureSha256:Object.fromEntries(['original-three-engine-inputs','stage-two-new-athletes','five-scenario-round-three-inputs'].map(f=>['tests/fixtures/'+f+'.json',hash(fs.readFileSync(path.join(root,'tests/fixtures/'+f+'.json')))])),sourceSha256:Object.fromEntries(['src/coach-engine.js','src/running-preparation.js'].map(f=>[f,hash(fs.readFileSync(path.join(root,f)))])),weeks:comparisons.reduce((n,c)=>n+c.weeks,0),comparisons,gates,athleteApproval:false};
 fs.writeFileSync(path.join(dir,'comparison.json'),JSON.stringify(result,null,2)+'\n');return result;
}
if(require.main===module){const r=retest(process.argv[2]);console.log(JSON.stringify({weeks:r.weeks,comparisons:r.comparisons,gates:r.gates.map(g=>g.summary)},null,2))}
module.exports={retest};
