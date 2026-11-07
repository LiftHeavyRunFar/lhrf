const test=require('node:test'),assert=require('node:assert/strict');
const adapters=require('../src/coach-adapters.js'),registry=require('../src/exercise-registry');
const {fullInventory}=require('./equipment-fixtures.cjs');
const copy=x=>JSON.parse(JSON.stringify(x)),now=()=>Date.parse('2026-11-02T08:00:00Z');
function example(scale=1){
 const config=copy(require('./fixtures/five-scenario-round-three-inputs.json').cases.find(r=>r.id==='M').config);
 delete config.trainingAge;config.startDate='2026-11-02';config.weeks=4;config.strengthTargetDate='2026-11-28';
 config.baselines.Bench=110*scale;config.liftProfiles.Bench={kg:110*scale,reps:1};
 config.strengthExposureRoles={Bench:['volume','heavy','speed']};config.equipmentInventory=fullInventory();
 const sets=[{date:'2026-10-24T09:00:00Z',exercise:'Bench',role:'top',weight:75*scale,reps:5,rpe:8},
  {date:'2026-10-30T09:00:00Z',exercise:'Bench',role:'top',weight:90*scale,reps:1,rpe:9},
  ...Array.from({length:6},(_,i)=>({date:'2026-11-01T09:00:00Z',exercise:'Bench',role:'straight',weight:60*scale,reps:2,rpe:2,set:i+1}))];
 for(const row of sets)Object.assign(row,registry.identity(row.exercise,config.equipmentInventory));
 const match=i=>Object.fromEntries(['date','exercise','role','weight','reps'].map(k=>[k,sets[i][k]]));
 const reviews=[{kind:'execution',match:match(1),original:null,value:'competition-paused',source:'athlete-confirmation'},
  {kind:'rpe',match:match(2),original:2,value:5,approximate:true,purpose:'speed',source:'athlete-confirmation'}];
 return {config,data:{sets,runs:[],checkins:[],overrides:{}},reviews};
}
const generate=(x,performanceReviews=x.reviews)=>adapters.buildNewProgramme(x.config,{data:x.data,now,...(performanceReviews===undefined?{}:{performanceReviews})});
const mains=p=>p.weeks.flatMap(w=>w.sessions.flatMap(s=>s.ex||[])).filter(e=>e[0]==='Bench'&&e[5]?.category==='primary');
test('review preserves raw logs, distinguishes retrospective practice and unlocks only evidenced paused singles across strength levels',()=>{
 for(const scale of [.5,1,1.5]){
  const x=example(scale),before=JSON.stringify(x),raw=adapters.buildNewProgramme(x.config,{data:x.data,now}),p=generate(x);
  assert.equal(JSON.stringify(x),before);assert.deepEqual(generate(x),p);
  assert.equal(p.config.strengthEvidenceReview.reviews[1].matchedRows,6);
  assert.equal(p.config.strengthPractice.Bench.kg,60*scale);
  assert.equal(p.config.strengthPractice.Bench.reviewEvidence.original,2);
  assert.equal(p.config.strengthPractice.Bench.reviewEvidence.approximate,true);
  assert.equal(p.config.strengthCalibration.lifts.Bench.evidence.length,2,'Six practice sets are not six calibration days');
  assert.equal(p.config.strengthCalibration.lifts.Bench.adoptedBaseline,raw.config.strengthCalibration.lifts.Bench.adoptedBaseline);
  assert.ok(mains(raw).filter(e=>e[2]===1).every(e=>e[4]<=8));
  assert.ok(mains(p).some(e=>e[2]===1&&e[4]>=7.5&&e[4]<=8),'Familiar confirmed singles may be practised without inventing advanced experience or a final RPE9');
  const speed=mains(p).find(e=>e[5].trainingRole==='speed');
  assert.ok(speed);assert.equal(speed[5].practiceEvidence.kg,60*scale);
  assert.equal(speed[5].practiceEvidence.velocityMeasured,false);
  assert.equal(speed[5].practiceEvidence.automaticIncrease,false);
  assert.equal(speed[3],60*scale,'Confirmed approximate speed context can repeat familiar typed practice; it cannot create a maximum or increase over the observed load');
  assert.equal(p.config.trainingAge,undefined);
  const saved=copy(p.config),savedBefore=JSON.stringify(saved);
  const a=adapters.buildProgramme(saved,{data:x.data,now}),b=adapters.buildProgramme(saved,{data:{...x.data,sets:[]},now});
  assert.equal(JSON.stringify(saved),savedBefore);
  assert.deepEqual(a.weeks.map(w=>w.sessions),b.weeks.map(w=>w.sessions),'Frozen reviewed prescriptions do not recalibrate from later evidence');
 }
});
test('approximate retrospective RPE never becomes maximum evidence; explicitly unreliable RPE is excluded',()=>{
 const x=example();x.reviews[1].value=8;
 const p=generate(x);assert.equal(p.config.strengthCalibration.lifts.Bench.evidence.length,2);
 assert.equal(p.config.strengthPractice?.Bench,undefined);
 x.reviews[1].value=null;assert.equal(generate(x).config.strengthCalibration.lifts.Bench.evidence.length,2);
});
test('a new review cannot inherit stale corroboration from a previously prepared proposal',()=>{
 const x=example();x.config=copy(generate(x).config);
 x.data.sets=x.data.sets.slice(1);x.reviews=x.reviews.slice(1);
 const p=generate(x);assert.equal(p.config.strengthCalibration?.lifts?.Bench,undefined);
 assert.ok(!mains(p).some(e=>e[2]===1&&e[4]>=8.5));
});
test('repeating an identical explicit review does not compound a legacy evidence increase cap',()=>{
 const x=example();x.config.baselines.Bench=40;x.config.liftProfiles.Bench.kg=40;
 x.data.sets.slice(0,2).forEach(r=>r.role='straight');x.reviews=x.reviews.slice(1);
 const p=generate(x);x.config=copy(p.config);
 assert.equal(generate(x).config.baselines.Bench,p.config.baselines.Bench);
});
test('reviews reject wrong originals, missing records, invented review sources, invalid efforts and duplicate corrections',()=>{
 const changes=[x=>x.reviews[1].original=3,x=>x.reviews[0].match.exercise='Close-grip bench',x=>x.reviews[1].value=11,
  x=>x.reviews[1].approximate=undefined,x=>x.reviews[1].source='inferred',x=>x.reviews.push(copy(x.reviews[1])),
  x=>x.reviews[0].match.date='2027-01-01',x=>x.reviews[1].match.extra='not-a-selector'];
 for(const change of changes){const x=example();change(x);const before=JSON.stringify(x);assert.throws(()=>generate(x),RangeError);assert.equal(JSON.stringify(x),before);}
});
test('exercise-specific practice cannot transfer from a variation or a failed, optional or warm-up set',()=>{
 for(const change of [r=>r.exercise='Close-grip bench',r=>r.failed=true,r=>r.warmup=true,r=>r.optional=true,r=>r.techniqueFailed=true,r=>r.completed=false]){
  const x=example();x.reviews=x.reviews.slice(0,1);x.data.sets.slice(2).forEach(r=>{r.rpe=5;change(r)});
  assert.equal(generate(x).config.strengthPractice?.Bench,undefined);
 }
});
test('novice status and unresolved fatigue retain their conservative gates despite a reviewed competition single',()=>{
 const novice=example();novice.config.trainingAge='novice';assert.ok(!mains(generate(novice)).some(e=>e[2]===1&&e[4]>=8.5));
 const fatigue=example();fatigue.config.recoveryEvidence={status:'accumulating-fatigue',affectedLifts:['Bench'],repeatCount:2,baselineRpe:7,recentRpe:9};
 assert.equal(generate(fatigue).config.strengthCalibration?.lifts?.Bench,undefined);
});
test('browser and Node apply the same explicit review without changing source evidence',()=>{
 const fs=require('node:fs'),vm=require('node:vm'),sandbox=vm.createContext({Date,console});
 for(const name of ['gym-equipment','exercise-registry','coaching-evidence','running-workouts','running-preparation','coach-constraints','coach-engine','coach-adapters'])vm.runInContext(fs.readFileSync('src/'+name+'.js','utf8'),sandbox);
 const x=example(),before=JSON.stringify(x);
 assert.equal(JSON.stringify(sandbox.LHRFCoachAdapters.buildNewProgramme(x.config,{data:x.data,now,performanceReviews:x.reviews})),JSON.stringify(generate(x)));
 assert.equal(JSON.stringify(x),before);
});
