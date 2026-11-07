// Synthetic preservation and fail-closed controls. No owner backup or device is read.
const test=require('node:test'),assert=require('node:assert/strict');
const api=require('../src/programme-replacement'),engine=require('../src/coach-engine');
const manifest=require('../docs/november-programme-correction/review-manifest.json');
const clone=x=>JSON.parse(JSON.stringify(x));
function fictional(){
 const native=clone(require('./replacement-fixtures.cjs').eventProgramme());
 const old=clone(native),config=old.config;
 config.programmeId='fictional-november-source';
 const week=old.weeks[0],fri=week.sessions.find(s=>s.day==='Fri');
 const speed=fri.ex.find(e=>e[0]==='Bench');
 const state={onboardingComplete:true,athlete:{id:'fictional-correction-test'},customRoadmap:clone(config),activeCustomWeek:1,activeSchedule:clone(week.sessions),reviewedProgramme:{config:clone(config),weeks:clone(old.weeks)},equipmentInventory:require('./equipment-fixtures.cjs').fullInventory(),sets:[{sessionId:fri.id+'::strength',week:1,date:'2026-11-06',exercise:'Bench',weight:speed[3],reps:2,rpe:2,evidenceReview:{rpe:{value:5,approximate:true}}}],runs:[{date:'2026-11-08',km:6,min:40,sourceActivityId:'fictional-garmin-link',source:'garmin-personal',splits:[{km:1,min:6.5}]}],completedWorkouts:[{id:fri.id,week:1,date:'2026-11-06',prescription:{ex:clone(fri.ex),runs:clone(fri.runs)}}],decisions:[{key:'historical-approval',approved:true}],overrides:{historical:{weight:25}},programmeArchive:[]};
 // A complete fictional source exists here. Unlike the owner summary, it can
 // support an exact one-row dry run. This is not the owner's 8 November row.
 const candidate=clone(old),target=candidate.weeks[1].sessions.find(s=>s.day==='Fri').ex.find(e=>e[0]==='Bench');
 assert.equal(target[5].trainingRole,'speed');target[3]=manifest.confirmedFutureRowProposal.proposedStartingCap.kg;
 return {old,state,candidate};
}
test('limited summary and conditional targets cannot be imported or packaged as native owner prescriptions',async()=>{
 const original=JSON.stringify(manifest);
 assert.equal(manifest.source.completePrivateBackupAvailable,false);
 assert.equal(manifest.completeExactFutureDiffAvailable,false);
 assert.equal(manifest.replacementReady,false);
 assert.throws(()=>api.validateProgramme(manifest),/complete reviewed native programme/);
 await assert.rejects(api.createPackage(manifest,{},{reviewedCommit:'0ae327b'}),/complete reviewed native programme/);
 assert.equal(JSON.stringify(manifest),original);
});
test('synthetic exact future edit uses existing source-bound fingerprint and leaves protected prescriptions, RPE and Garmin unchanged',async()=>{
 const {old,state,candidate}=fictional(),before=JSON.stringify(state),oldNative=JSON.stringify(old);
 const packet=await api.createPackage(candidate,state,{reviewedCommit:'0ae327bdb9dfe11e189ff4a9b066d1406bc48f07',approvalContext:['Fictional packaging test only; no owner package or approval']});
 await api.verifyPackage(packet,packet.reviewFingerprint,state);
 const preview=api.createReplacement(state,packet,engine,{now:'2026-11-07T20:00:00Z'});
 api.verifyPreservation(state,preview.next);
 assert.equal(JSON.stringify(state),before);assert.equal(JSON.stringify(old),oldNative);
 for(const date of ['2026-11-08']){const row=preview.rows.find(r=>r.date===date);assert.equal(row.status,'protected');assert.deepEqual(row.after.map(s=>({ex:s.ex,runs:s.runs})),row.before.map(s=>({ex:s.ex,runs:s.runs})));}
 const changed=preview.rows.find(r=>r.date==='2026-11-13');
 assert.equal(changed.after[0].ex.find(e=>e[0]==='Bench')[3],95);
 assert.deepEqual(preview.next.programmeArchive[0].programme,state.customRoadmap);
 assert.deepEqual(preview.next.programmeArchive[0].reviewedProgramme,state.reviewedProgramme);
 assert.notEqual(preview.next.customRoadmap.programmeId,state.customRoadmap.programmeId);
 for(const key of ['sets','runs','completedWorkouts','decisions','overrides'])assert.deepEqual(preview.next[key],state[key]);
 assert.equal(preview.next.sets[0].rpe,2);assert.equal(preview.next.sets[0].evidenceReview.rpe.value,5);
 assert.deepEqual(preview.next.reviewedProgramme.weeks[0].sessions.find(s=>s.scheduledDate==='2026-11-06').ex,old.weeks[0].sessions.find(s=>s.day==='Fri').ex);
 for(const eventType of ['strength','running'])assert.deepEqual(preview.next.reviewedProgramme.originalNative.weeks.flatMap(w=>w.sessions).find(s=>s.eventType===eventType),old.weeks.flatMap(w=>w.sessions).find(s=>s.eventType===eventType));
 const tampered=clone(packet);tampered.programme.weeks[1].sessions.find(s=>s.day==='Fri').ex.find(e=>e[0]==='Bench')[3]+=2.5;
 await assert.rejects(api.verifyPackage(tampered,packet.reviewFingerprint,state),/fingerprint/);
 const edited=clone(state);edited.sets[0].rpe=5;
 await assert.rejects(api.verifyPackage(packet,packet.reviewFingerprint,edited),/evidence/);
 await assert.rejects(api.verifyPackage(packet,packet.reviewFingerprint,{...state,customRoadmap:{...state.customRoadmap,weeks:3}}),/differs/);
 // In-memory rollback only: no commit(), storage, app, activation or device write.
 const later=clone(preview.next),newSession=later.reviewedProgramme.weeks[1].sessions.find(s=>s.scheduledDate==='2026-11-13');
 later.sets.push({sessionId:newSession.id+'::strength',week:2,date:'2026-11-13',exercise:'Bench',weight:95,reps:2,rpe:5});
 const rollback=api.createRollback(later,engine,{now:'2026-11-14T20:00:00Z'});
 api.verifyPreservation(later,rollback.next);assert.deepEqual(rollback.next.customRoadmap,state.customRoadmap);
 assert.deepEqual(rollback.next.sets,later.sets);assert.deepEqual(rollback.next.runs,later.runs);
 assert.deepEqual(rollback.next.reviewedProgramme.weeks[1].sessions.find(s=>s.scheduledDate==='2026-11-13').ex,newSession.ex);
});
