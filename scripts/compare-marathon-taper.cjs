// Evidence only: node scripts/compare-marathon-taper.cjs BASELINE_CHECKOUT OUTPUT_DIRECTORY
// BASELINE_CHECKOUT must be an untouched checkout of 2511fe2a. No activation/storage/network.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'..'),base=path.resolve(process.argv[2]||''),out=process.argv[3]&&path.resolve(process.argv[3]);
if(!process.argv[2]||!out||out===root||out===base)throw Error('Supply baseline checkout and separate evidence output directory.');
const fixturePath='tests/fixtures/original-three-engine-inputs.json',bytes=fs.readFileSync(path.join(root,fixturePath)),fixture=JSON.parse(bytes),copy=x=>JSON.parse(JSON.stringify(x)),hash=x=>crypto.createHash('sha256').update(x).digest('hex');
assert.equal(hash(bytes),hash(fs.readFileSync(path.join(base,fixturePath))),'Fixture bytes differ');
const sourceHashes=dir=>Object.fromEntries(['coach-engine','running-preparation','running-workouts','coach-adapters','coach-constraints'].map(n=>[n+'.js',hash(fs.readFileSync(path.join(dir,'src',n+'.js')))]));
const source={baselineCommit:'2511fe2a53270d3b88c34359c588462f789acb4f',baseline:sourceHashes(base),candidate:sourceHashes(root),fixtureSha256:hash(bytes),clock:fixture.clock};
const date=(c,w,s)=>s.eventDate||new Date(Date.parse(c.startDate+'T12:00:00Z')+((w-1)*7+['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].indexOf(s.day))*86400000).toISOString().slice(0,10);
const rs=w=>w.sessions.flatMap(s=>s.runs||[]).filter(r=>r.role!=='race');
const km=w=>Number(rs(w).reduce((n,r)=>n+(r.distanceKm||0),0).toFixed(3));
function build(dir,row){const a=require(path.join(dir,'src/coach-adapters')),coach=require(path.join(dir,'src/coach-engine')),c=copy(row.config),data=copy(row.historicalData),snapshot=JSON.stringify({c,data}),e=coach.createEngine({now:()=>Date.parse(fixture.clock)});for(const [n,p]of Object.entries(c.liftProfiles))c.baselines[n]=e.estimatedMax(p.kg,p.reps);const mapped=JSON.stringify(c),p=a.buildNewProgramme(c,{data,now:()=>Date.parse(fixture.clock)});assert.equal(JSON.stringify(c),mapped);assert.deepEqual(data,row.historicalData);assert.deepEqual(p,a.buildNewProgramme(c,{data,now:()=>Date.parse(fixture.clock)}));return {input:c,historicalData:data,programme:p};}
fs.mkdirSync(out,{recursive:true});const comparisons=[];
for(const row of fixture.cases){
 const before=build(base,row),after=build(root,row);assert.deepEqual(after.input,before.input);
 const unchanged=a=>a.sessions.map(s=>[s.day,s.ex]);assert.deepEqual(after.programme.weeks.map(unchanged),before.programme.weeks.map(unchanged),'Lifting changed');
 assert.deepEqual(after.programme.weeks.map(km),before.programme.weeks.map(km),'Weekly distance changed');
 const saved=require(path.join(root,'src/coach-adapters')).buildProgramme(before.programme.config,{data:before.historicalData,now:()=>Date.parse(fixture.clock)});assert.equal(JSON.stringify(saved),JSON.stringify(before.programme),'Saved production programme changed');
 const weeks=after.programme.weeks.flatMap((w,i)=>{
  if(row.id!=='O3'&&i<after.programme.weeks.length-3){assert.deepEqual(w.sessions,before.programme.weeks[i].sessions,'Non-taper prescription changed');return []}
  if(row.id==='O3'&&i<after.programme.weeks.length-3){assert.deepEqual(w.sessions,before.programme.weeks[i].sessions);return []}
  const b=before.programme.weeks[i];return [{week:w.week,weeklyTrainingKmBefore:km(b),weeklyTrainingKmAfter:km(w),sessions:w.sessions.map(s=>{const old=b.sessions.find(x=>x.id===s.id);return {date:date(row.config,w.week,s),day:s.day,before:old,after:s}})}];
 });
 if(row.id==='O3')assert.deepEqual(after.programme.weeks,before.programme.weeks,'Health-running athlete changed');
 fs.writeFileSync(path.join(out,row.id+'.json'),JSON.stringify({source,id:row.id,before,after,comparisons:weeks},null,2)+'\n');comparisons.push({id:row.id,weeks});
}
const report={source,checks:{identicalInputs:true,fixtureUnchanged:true,deterministic:true,allWeeklyDistancesUnchanged:true,allLiftingUnchanged:true,savedProductionProgrammesUnchanged:true,nonTaperSessionsUnchanged:true,healthAthleteUnchanged:true},comparisons};fs.writeFileSync(path.join(out,'comparison.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({source,checks:report.checks,comparisons:comparisons.map(c=>({id:c.id,weeks:c.weeks.map(w=>({week:w.week,km:w.weeklyTrainingKmAfter,rhythm:w.sessions.flatMap(s=>(s.after.runs||[]).filter(r=>r.workoutFamily==='taper-race-rhythm').map(r=>({date:s.date,km:r.distanceKm,pace:r.pace,workKm:r.steps.filter(x=>x.role==='work').map(x=>x.distanceKm),minutes:r.minutes})))}))}))},null,2));
