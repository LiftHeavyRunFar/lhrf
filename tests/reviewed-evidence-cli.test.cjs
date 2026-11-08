const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),os=require('node:os'),cp=require('node:child_process'),crypto=require('node:crypto');
const adapters=require('../src/coach-adapters'),api=require('../src/programme-replacement');
const copy=x=>JSON.parse(JSON.stringify(x)),hash=x=>crypto.createHash('sha256').update(x).digest('hex');
const clock='2026-11-02T08:00:00Z',root=path.join(__dirname,'..');
function fixture(){
 const config=copy(require('./fixtures/five-scenario-round-three-inputs.json').cases.find(r=>r.id==='M').config);
 config.equipmentInventory=require('./equipment-fixtures.cjs').fullInventory();
 delete config.trainingAge;config.startDate='2026-11-02';config.weeks=4;config.strengthTargetDate='2026-11-28';config.runningTargetDate='2026-11-29';
 config.runGoal='10k';
 config.baselines.Bench=110;config.liftProfiles.Bench={kg:110,reps:1};config.strengthExposureRoles={Bench:['volume','heavy','speed']};
 config.visitConstraints={...config.visitConstraints,minutes:{},separateMinutes:{},eventDays:{'2026-11-28':{confirmed:true},'2026-11-29':{confirmed:true}}};
 const sets=[{date:'2026-10-24T09:00:00Z',exercise:'Bench',role:'top',weight:75,reps:5,rpe:8},
  {date:'2026-10-30T09:00:00Z',exercise:'Bench',role:'top',weight:90,reps:1,rpe:9},
  ...Array.from({length:6},(_,i)=>({date:'2026-11-01T09:00:00Z',exercise:'Bench',role:'straight',weight:60,reps:2,rpe:2,set:i+1}))];
 for(const row of sets)Object.assign(row,require('../src/exercise-registry').identity(row.exercise,config.equipmentInventory));
 const match=i=>Object.fromEntries(['date','exercise','role','weight','reps'].map(k=>[k,sets[i][k]]));
 const performanceReviews=[{kind:'execution',match:match(1),original:null,value:'competition-paused',source:'athlete-confirmation'},
  {kind:'rpe',match:match(2),original:2,value:5,approximate:true,purpose:'speed',source:'athlete-confirmation'}];
 return {source:{customRoadmap:config,sets,runs:[],checkins:[],overrides:{},completedWorkouts:[],_backup:{exportedAt:clock}},options:{asOf:clock,startDate:config.startDate,weeks:config.weeks,performanceReviews}};
}
function workspace(t){const dir=fs.mkdtempSync(path.join(os.tmpdir(),'lhrf-cli-review-'));t.after(()=>fs.rmSync(dir,{recursive:true,force:true}));return dir}
const invoke=(script,args)=>cp.spawnSync(process.execPath,[path.join(root,'scripts',script),...args],{cwd:root,encoding:'utf8'});
test('review CLI to existing Stage 8 packager retains corrections, original anchors, uncertainty and exact prescriptions',async t=>{
 const dir=workspace(t),{source,options}=fixture(),backup=path.join(dir,'backup.json'),opts=path.join(dir,'options.json'),out=path.join(dir,'review'),destination=path.join(dir,'package');
 const original=JSON.stringify(source,null,2)+'\n';fs.writeFileSync(backup,original);fs.writeFileSync(opts,JSON.stringify(options));
 const run=invoke('review-athlete-programme.cjs',[backup,opts,out]);assert.equal(run.status,0,run.stderr||run.error?.message);
 const nativePath=path.join(out,'native-programme-NOT-ACTIVATED.json'),native=JSON.parse(fs.readFileSync(nativePath));
 assert.ok(native.weeks.every(w=>w.feasible),JSON.stringify(native.weeks.map(w=>({week:w.week,issues:w.blockingIssues}))));
 assert.equal(native.config.strengthCalibration.lifts.Bench.competitionTechniqueConfirmed,true);
 assert.equal(native.config.strengthPractice.Bench.rpe,5);assert.equal(native.config.strengthPractice.Bench.reviewEvidence.approximate,true);
 const proof=native.config.strengthEvidenceReview;assert.deepEqual(proof.reviews.map(r=>r.matchedRows),[1,6]);
 assert.equal(proof.reviews[1].original,2);
 const provenance=JSON.parse(fs.readFileSync(path.join(out,'provenance.json')));
 assert.deepEqual(provenance.performanceReviews,proof);
 assert.deepEqual(JSON.parse(fs.readFileSync(path.join(out,'input-and-confirmations.json'))).performanceReviews,proof);
 assert.deepEqual(JSON.parse(fs.readFileSync(path.join(out,'saved-policy-baseline.json'))),copy(adapters.buildProgramme(source.customRoadmap,{data:source,now:()=>Date.parse(clock)})));
 const metadata=path.join(dir,'metadata.json');fs.writeFileSync(metadata,JSON.stringify({reviewedCommit:provenance.baseCommit,expectedNativeSha256:hash(fs.readFileSync(nativePath)),approvalContext:['Synthetic integration test only']}));
 const packed=invoke('package-reviewed-programme.cjs',[nativePath,backup,metadata,destination]);assert.equal(packed.status,0,packed.stderr||packed.error?.message);
 const packet=JSON.parse(fs.readFileSync(path.join(destination,'reviewed-programme-package.json'))),fingerprint=fs.readFileSync(path.join(destination,'fingerprint.txt'),'utf8').trim();
 assert.match(fingerprint,/^[a-f0-9]{64}$/);await api.verifyPackage(packet,fingerprint,source);
 assert.deepEqual(packet.programme,native);assert.deepEqual(packet.sourceTrainingAnchors.sets,await Promise.all(source.sets.map(s=>api.digest(s))));
 assert.equal(fs.readFileSync(backup,'utf8'),original);assert.ok(source.sets.slice(2).every(s=>s.rpe===2));
 assert.equal(packet.programme.weeks.at(-1).sessions.find(s=>s.eventType==='running').recoveryReviewRequired,true);
 const unreviewed=adapters.buildNewProgramme(source.customRoadmap,{data:source,now:()=>Date.parse(clock)});
 const speeds=p=>p.weeks.flatMap(w=>w.sessions.flatMap(s=>s.ex)).filter(e=>e[5]?.trainingRole==='speed').map(e=>e[3]);
 assert.ok(speeds(native).every(kg=>kg<=60),'An explicitly reviewed approximate practice reference cannot increase beyond familiar completed loading.');
 assert.ok(native.weeks.flatMap(w=>w.sessions.flatMap(s=>s.ex)).filter(e=>e[5]?.trainingRole==='speed').every(e=>e[4]<=5.5));
 const changed=copy(packet);changed.programme.config.strengthEvidenceReview.reviews[1].approximate=false;await assert.rejects(api.verifyPackage(changed,fingerprint,source),/fingerprint/);
});
test('CLI fails closed on invalid reviews without changing the backup or writing a package',t=>{
 const dir=workspace(t);
 for(const [i,change]of [o=>o.performanceReviews[1].original=3,o=>o.performanceReviews='invalid',o=>o.performanceReviews[0].match.exercise='Missing lift'].entries()){
  const {source,options}=fixture();change(options);const backup=path.join(dir,i+'-backup.json'),opts=path.join(dir,i+'-options.json'),out=path.join(dir,i+'-review'),original=JSON.stringify(source);
  fs.writeFileSync(backup,original);fs.writeFileSync(opts,JSON.stringify(options));const run=invoke('review-athlete-programme.cjs',[backup,opts,out]);assert.notEqual(run.status,0);assert.equal(fs.readFileSync(backup,'utf8'),original);assert.equal(fs.existsSync(out),false);
 }
});
