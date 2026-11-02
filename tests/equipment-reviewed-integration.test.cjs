const test=require('node:test'),assert=require('node:assert/strict');
const adapters=require('../src/coach-adapters'),registry=require('../src/exercise-registry');
const {fullInventory}=require('./equipment-fixtures.cjs');
const clone=x=>JSON.parse(JSON.stringify(x)),now=()=>Date.parse('2026-11-02T08:00:00Z');
function fixture(){
 const config=clone(require('./fixtures/five-scenario-round-three-inputs.json').cases.find(r=>r.id==='M').config);
 delete config.trainingAge;config.startDate='2026-11-02';config.weeks=4;config.strengthTargetDate='2026-11-28';
 config.baselines.Bench=110;config.liftProfiles.Bench={kg:110,reps:1};config.strengthExposureRoles={Bench:['volume','heavy','speed']};
 config.equipmentPolicyVersion=1;config.equipmentInventory=fullInventory();
 const identity=registry.identity('Bench',config.equipmentInventory);
 const sets=[{...identity,date:'2026-10-24T09:00:00Z',exercise:'Bench',role:'top',weight:75,reps:5,rpe:8},
 {...identity,date:'2026-10-30T09:00:00Z',exercise:'Bench',role:'top',weight:90,reps:1,rpe:9},
 ...Array.from({length:6},(_,i)=>({...identity,date:'2026-11-01T09:00:00Z',exercise:'Bench',role:'straight',weight:60,reps:2,rpe:2,set:i+1}))];
 const match=i=>Object.fromEntries(['date','exercise','role','weight','reps'].map(k=>[k,sets[i][k]]));
 const reviews=[{kind:'execution',match:match(1),original:null,value:'competition-paused',source:'athlete-confirmation'},
 {kind:'rpe',match:match(2),original:2,value:5,approximate:true,purpose:'speed',source:'athlete-confirmation'}];
 return {config,data:{sets,runs:[],checkins:[],overrides:{}},reviews,match};
}
const generate=x=>adapters.buildNewProgramme(x.config,{data:x.data,performanceReviews:x.reviews,now});
const exercises=p=>p.weeks.flatMap(w=>w.sessions.flatMap(s=>s.ex));
test('equipment policy retains production correction provenance and practice context without treating approximate effort as a load anchor',()=>{
 const x=fixture(),before=JSON.stringify(x),p=generate(x),legacy=adapters.buildNewProgramme({...x.config,equipmentPolicyVersion:undefined,equipmentInventory:undefined},{data:x.data,performanceReviews:x.reviews,now});
 assert.deepEqual(p.config.strengthCalibration,legacy.config.strengthCalibration);
 assert.deepEqual(p.config.strengthEvidenceReview,legacy.config.strengthEvidenceReview);
 assert.deepEqual(p.config.strengthPractice,legacy.config.strengthPractice);
 const speed=exercises(p).find(e=>e[5]?.trainingRole==='speed');assert.ok(speed);
 assert.equal(speed[5].practiceEvidence.reviewEvidence.approximate,true);
 assert.equal(speed[5].practiceEvidence.velocityMeasured,false);assert.equal(speed[5].practiceEvidence.automaticIncrease,false);
 assert.equal(speed[3],0);assert.equal(speed[5].loadAnchor,null);assert.equal(speed[5].calibrationRequired,true);
 assert.equal(JSON.stringify(x),before);assert.deepEqual(generate(x),p);
});
test('unreliable and changed originals cannot anchor exact-setup loads; precise reviews retain their source in anchor metadata',()=>{
 for(const value of [null,5]){
  const x=fixture();x.reviews[1]={...x.reviews[1],value,approximate:false};const before=JSON.stringify(x),p=generate(x);
  const speed=exercises(p).find(e=>e[5]?.trainingRole==='speed');
  if(value===null){assert.equal(speed[3],0);assert.equal(speed[5].loadAnchor,null)}
  else {assert.ok(speed[3]>0&&speed[3]<=60);assert.equal(speed[5].loadAnchor.reviewEvidence.rpe.original,2);assert.equal(speed[5].loadAnchor.reviewEvidence.rpe.value,5);assert.equal(speed[5].loadAnchor.reviewEvidence.rpe.source,'athlete-confirmation')}
  assert.equal(JSON.stringify(x),before);
  if(value!==null){const changed=clone(x.data);changed.sets.slice(2).forEach(r=>r.rpe=7);const saved=adapters.buildProgramme(p.config,{data:changed,now});assert.equal(exercises(saved).find(e=>e[5]?.trainingRole==='speed')[5].loadAnchor,null)}
 }
});
test('current equipment removal and venue changes cannot be overridden by reviewed competition evidence',()=>{
 const x=fixture(),p=generate(x),before=JSON.stringify(x.data),removed=fullInventory();removed.items['straight-bar']='unavailable';
 const next=adapters.buildProgramme(p.config,{data:{...x.data,equipmentInventory:removed},now});
 assert.ok(next.weeks.some(w=>w.feasible===false));assert.ok(!exercises(next).some(e=>e[0]==='Bench'));
 assert.deepEqual(next.config.strengthEvidenceReview,p.config.strengthEvidenceReview);assert.equal(JSON.stringify(x.data),before);
 const moved=adapters.buildProgramme(p.config,{data:{...x.data,equipmentInventory:{...fullInventory(),venueId:'other-gym'}},now});
 assert.ok(exercises(moved).filter(e=>e[0]==='Bench').every(e=>e[3]===0&&e[5].calibrationRequired));
});

test('browser globals match Node when both reviewed-evidence and equipment policies are active',()=>{
 const fs=require('node:fs'),vm=require('node:vm'),sandbox=vm.createContext({Date,console});
 for(const name of ['running-workouts','running-preparation','coach-constraints','exercise-registry','coach-engine','coach-adapters'])vm.runInContext(fs.readFileSync('src/'+name+'.js','utf8'),sandbox);
 const x=fixture(),before=JSON.stringify(x);
 assert.equal(JSON.stringify(sandbox.LHRFCoachAdapters.buildNewProgramme(x.config,{data:x.data,now,performanceReviews:x.reviews})),JSON.stringify(generate(x)));
 assert.equal(JSON.stringify(x),before);
});

test('reviewed CLI, Stage 8 fingerprint and equipment-aware replacement preserve correction provenance and original training anchors',async t=>{
 const fs=require('node:fs'),path=require('node:path'),os=require('node:os'),crypto=require('node:crypto'),cp=require('node:child_process');
 const {review}=require('../scripts/review-athlete-programme.cjs'),replacement=require('../src/programme-replacement'),coach=require('../src/coach-engine');
 const x=fixture(),dir=fs.mkdtempSync(path.join(os.tmpdir(),'lhrf-equipment-review-'));t.after(()=>fs.rmSync(dir,{recursive:true,force:true}));
 x.config.visitConstraints={...x.config.visitConstraints,minutes:{},separateMinutes:{},eventDays:Object.fromEntries([x.config.strengthTargetDate,x.config.runningTargetDate].filter(Boolean).map(date=>[date,{confirmed:true}]))};
 const source={...x.data,customRoadmap:x.config,equipmentInventory:x.config.equipmentInventory,onboardingComplete:true,completedWorkouts:[],decisions:[],_backup:{exportedAt:'2026-11-02T08:00:00Z'}};
 const backup=path.join(dir,'backup.json'),options=path.join(dir,'options.json'),out=path.join(dir,'review'),packaged=path.join(dir,'package'),bytes=JSON.stringify(source,null,2)+'\n';fs.writeFileSync(backup,bytes);
 fs.writeFileSync(options,JSON.stringify({asOf:'2026-11-02T08:00:00Z',startDate:x.config.startDate,weeks:x.config.weeks,performanceReviews:x.reviews}));
 const native=review(backup,options,out),proof=native.config.strengthEvidenceReview;
 assert.ok(native.weeks.every(w=>w.feasible));assert.equal(proof.reviews[1].approximate,true);
 const provenance=JSON.parse(fs.readFileSync(path.join(out,'provenance.json')));assert.deepEqual(provenance.performanceReviews,proof);
 const nativePath=path.join(out,'native-programme-NOT-ACTIVATED.json'),metadata=path.join(dir,'metadata.json');
 fs.writeFileSync(metadata,JSON.stringify({reviewedCommit:provenance.baseCommit,expectedNativeSha256:crypto.createHash('sha256').update(fs.readFileSync(nativePath)).digest('hex'),approvalContext:['Synthetic integration review; not athlete activation']}));
 const packed=cp.spawnSync(process.execPath,['scripts/package-reviewed-programme.cjs',nativePath,backup,metadata,packaged],{encoding:'utf8'});assert.equal(packed.status,0,packed.stderr||packed.error?.message);
 const packet=JSON.parse(fs.readFileSync(path.join(packaged,'reviewed-programme-package.json'))),fingerprint=fs.readFileSync(path.join(packaged,'fingerprint.txt'),'utf8').trim();
 await replacement.verifyPackage(packet,fingerprint,source);assert.deepEqual(packet.sourceTrainingAnchors.sets,await Promise.all(source.sets.map(r=>replacement.digest(r))));
 const changed=clone(packet);changed.programme.config.strengthEvidenceReview.reviews[1].approximate=false;await assert.rejects(replacement.verifyPackage(changed,fingerprint,source),/fingerprint/);
 const snapshot=JSON.stringify(source),preview=replacement.createReplacement(source,packet,coach,{now:'2026-11-02T08:00:00Z'});replacement.verifyPreservation(source,preview.next);
 assert.deepEqual(preview.next.reviewedProgramme.config.strengthEvidenceReview,proof);assert.deepEqual(preview.next.sets,source.sets);assert.deepEqual(preview.next.runs,source.runs);
 assert.equal(JSON.stringify(source),snapshot);assert.equal(fs.readFileSync(backup,'utf8'),bytes);
});
