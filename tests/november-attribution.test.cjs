const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),os=require('node:os'),path=require('node:path');
const {inspect,main}=require('../scripts/inspect-november-programme.cjs');
const backup=require('../src/training-backup'),replacement=require('../src/programme-replacement');
const clone=x=>JSON.parse(JSON.stringify(x)),now='2026-11-07T18:00:00Z';
function fixture(){
 const c={programmeId:'fictional-november',startDate:'2026-10-26',weeks:5,lightLifts:['squat','deadlift'],baselines:{Squat:999},strengthTargetDate:'2026-11-28',runningTargetDate:'2026-11-29'};
 const session=(date,id,exercise='Bench',kg=80)=>({id,day:'Sun',name:'Synthetic saved visit',scheduledDate:date,ex:[[exercise,2,3,kg,5.5,{role:'straight',category:'primary',light:exercise==='Squat',benchRole:exercise==='Bench'?'speed':undefined}]],runs:[]});
 const old=session('2026-11-01','saved-old'),next=session('2026-11-08','saved-next');
 return {customRoadmap:c,reviewedProgramme:{config:clone(c),sourceDigest:'synthetic-only',approvalContext:['Fictional preservation test'],weeks:[{week:1,sessions:[old]},{week:2,sessions:[next,session('2026-11-05','saved-lower','Squat',100)]}]},activeCustomWeek:2,activeSchedule:[clone(next)],
 sets:[{date:'2026-11-01T09:00:00Z',exercise:'Bench',weight:80,reps:3,rpe:5.5,role:'straight',trainingRole:'speed'},
 {date:'2026-11-05T09:00:00Z',exercise:'Squat',weight:100,reps:3,rpe:5,role:'straight'},
 {date:'2026-11-05T09:01:00Z',exercise:'Squat',weight:110,reps:3,rpe:3,role:'straight'},
 {date:'2026-11-05T09:02:00Z',exercise:'Deadlift',weight:140,reps:3,rpe:6,role:'straight'},
 {date:'2026-11-07T22:00:00Z',exercise:'Squat',weight:200,reps:3,rpe:7,role:'top'},
 {date:'2026-11-05',exercise:'Deadlift',weight:150,reps:3,rpe:7,role:'top',failed:true}],
 runs:[{date:'2026-10-31',source:'garmin-personal',sourceActivityId:'fictional-activity',sessionId:'old-run',km:7.123,min:45,splits:[{km:1,min:6.1}]}],checkins:[],sessionFeedback:[],decisions:[],overrides:{'saved-next':{exercise:'Bench',loadFactor:.95}},completedWorkouts:[]};
}
test('read-only attribution honours frozen prescriptions, saved overrides, original RPE and Garmin rows',()=>{
 const s=fixture(),before=JSON.stringify(s),r=inspect(s,now);
 assert.equal(JSON.stringify(s),before);assert.equal(r.generationPerformed,false);assert.equal(r.activated,false);
 assert.equal(r.tomorrow.date,'2026-11-08');assert.equal(r.tomorrow.comparisonDate,'2026-11-01');
 assert.equal(r.tomorrow.prescriptions[0].basePrescription.ex[0][3],80);assert.equal(r.tomorrow.prescriptions[0].effectiveBaseIdPrescription.ex[0][3],76);
 assert.deepEqual(r.recordedEvidence.lowerBody.slice(0,3).map(s=>s.rpe),[5,3,6]);
 assert.equal(r.recordedEvidence.lowerBody.length,4);assert.equal(r.recordedEvidence.eligibleCompletedLowerBody.length,3);
 assert.deepEqual(r.recordedEvidence.lastWeek.runs,s.runs);assert.equal(r.recordedEvidence.excludedUndatedOrFutureSetCount,1);
 assert.equal(r.proposedCorrection.replacementReady,false);assert.deepEqual(r.proposedCorrection.changedPrescriptions,[]);
 assert.throws(()=>replacement.validateProgramme(r),/complete reviewed/);
});
test('missing snapshot or mismatched snapshot never becomes a fabricated tomorrow or rest day',()=>{
 const s=fixture();delete s.reviewedProgramme;s.activeSchedule=[];
 const r=inspect(s,now);assert.equal(r.currentPrescriptions.length,0);assert.equal(r.tomorrow.prescriptions.length,0);
 assert.ok(r.uncertainties.some(x=>/does not establish a rest day/.test(x)));
 const wrong=fixture();wrong.reviewedProgramme.config.programmeId='unrelated';wrong.activeSchedule=[];
 assert.equal(inspect(wrong,now).currentPrescriptions.length,0);
});
test('saved lower-body metadata distinguishes light flags from marathon support and final clipping without clearing either',()=>{
 const s=fixture(),lower=s.reviewedProgramme.weeks[1].sessions[1];
 for(const [meta,mechanism]of [[{light:true},'saved light-lift execution'],[{policy:'endurance-support-v1'},'endurance-support override'],[{recentMarathonRecovery:true},'first-fortnight marathon clip']]){
  lower.ex[0][5]=meta;const before=JSON.stringify(s),r=inspect(s,now);assert.ok(r.lowerBodyDecisionTrace.some(x=>x.mechanism===mechanism));assert.equal(JSON.stringify(s),before);
 }
});
test('London dates and exact as-of cutoffs are explicit; incomplete dates do not invent recovery',()=>{
 const s=fixture();assert.equal(inspect(s,'2026-10-24T23:30:00Z').tomorrow.date,'2026-10-26');
 for(const stamp of ['bad','2026-11-07','2026-02-30T12:00:00Z','2026-11-07T18:00:00'])assert.throws(()=>inspect(s,stamp),/timestamp/);
});
test('existing backup download is a credential-excluding, source-preserving input for offline attribution',()=>{
 const s=fixture();s.credentials={token:'never-export'};const before=JSON.stringify(s),exported=backup.create(s,{now});
 assert.doesNotMatch(JSON.stringify(exported),/never-export/);assert.equal(JSON.stringify(s),before);
 const r=inspect(exported,now);assert.equal(r.sourceBackupExportedAt,now.replace('Z','.000Z'));assert.deepEqual(r.recordedEvidence.lastWeek.runs,s.runs);
});
test('offline CLI refuses Git destinations and overwrites and leaves source bytes unchanged',()=>{
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'lhrf-attribution-')),input=path.join(dir,'source.json');
 try{fs.writeFileSync(input,JSON.stringify(fixture()));const before=fs.readFileSync(input);
  assert.throws(()=>main(input,now,path.join(__dirname,'../docs/private')),/outside every Git/);
  const output=path.join(dir,'report');assert.deepEqual(main(input,now,output),{reportWritten:true,sourceUnchanged:true,generated:false,activated:false});
  assert.ok(fs.readFileSync(input).equals(before));assert.throws(()=>main(input,now,output),/EEXIST/);
  assert.equal(fs.statSync(path.join(output,'november-attribution.json')).mode&0o777,0o600);
 }finally{fs.rmSync(dir,{recursive:true,force:true});}
});
test('versioned reviewed replacement stays read-only until consent and rollback preserves new original-RPE/Garmin evidence',async()=>{
 const s=fixture();s.onboardingComplete=true;s.equipmentInventory=require('./equipment-fixtures.cjs').fullInventory();
 s.reviewedProgramme.weeks.push(...[3,4,5].map(week=>({week,sessions:[]})));
 const native=clone(require('./replacement-fixtures.cjs').eventProgramme()),source=JSON.stringify(s);
 const packet=await replacement.createPackage(native,s,{reviewedCommit:'cc8eef90b628269758bfdcb9b383aee8c41e2895',approvalContext:['november-review-v1; entirely fictional route proof; no owner dose recommended']});
 await replacement.verifyPackage(packet,packet.reviewFingerprint,s);
 const engine=require('../src/coach-engine'),preview=replacement.createReplacement(s,packet,engine,{now});
 assert.equal(JSON.stringify(s),source);assert.equal(preview.next.customRoadmap.reviewedSnapshotVersion,1);
 replacement.verifyPreservation(s,preview.next);
 const raw=JSON.stringify(s),map=new Map([[replacement.DATA_KEY,raw]]),storage={getItem:k=>map.get(k)??null,setItem:(k,v)=>map.set(k,v),removeItem:k=>map.delete(k)};
 assert.throws(()=>replacement.commit(storage,preview,{now,confirmed:false,backupVerified:false}),/backup|confirmation/);
 assert.equal(storage.getItem(replacement.DATA_KEY),raw);
 assert.throws(()=>replacement.createReplacement(s,packet,engine,{now,liveWorkout:{id:'protected-draft'}}),/Finish/);
 const trial=clone(preview.next);trial.sets.push({date:'2026-11-08',exercise:'Bench',weight:80,reps:2,rpe:5.5});
 trial.runs.push({date:'2026-11-08',sourceActivityId:'new-fictional-garmin',km:5,min:32,sessionId:'retained-link'});
 const rollback=replacement.createRollback(trial,engine,{now:'2026-11-09T18:00:00Z'});
 replacement.verifyPreservation(trial,rollback.next);assert.deepEqual(rollback.next.sets,trial.sets);assert.deepEqual(rollback.next.runs,trial.runs);
 assert.deepEqual(rollback.next.customRoadmap,s.customRoadmap);assert.equal(JSON.stringify(s),source);
 assert.throws(()=>replacement.validateProgramme(require('../docs/november-programme-review/pending-review.json')),/complete reviewed/);
});
