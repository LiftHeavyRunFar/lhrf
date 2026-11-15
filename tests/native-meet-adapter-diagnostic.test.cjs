// Synthetic diagnostic: exercise the actual standalone meet proposal against the native adapter.
const {test}=require('node:test'), assert=require('node:assert/strict');
const C=require('../src/programme-catalogue'),T=require('../src/catalogue-training'),M=require('../src/meet-entry'),N=require('../src/native-catalogue');
const registry=require('../src/exercise-registry'),gym=require('../src/gym-equipment'),inventory=require('./equipment-fixtures.cjs').fullInventory();
const options={training:T,registry,gym,inventory,now:'2026-11-20T09:00:00Z',equipment:[]};
for(const id of ['powerlifting-three-day','powerlifting-four-day'])test(id+' exposes native adapter mismatch',()=>{
 const days=id.includes('three')?[0,2,4]:[0,2,4,6],strength=C.previewProgramme(id),run=C.previewProgramme('marathon-two-run-16');
 let state=T.enrol(T.enrol(T.empty(),strength,'2026-11-16','old'),run,'2026-11-16','running');
 const done=state.occurrences.find(o=>o.planId==='old');done.status='logged';state.logs[done.id]={loggedAt:'2026-11-16T10:00:00Z',sets:[{exerciseId:'competition-squat',dose:5,weightKg:100,rpe:7}]};
 const before=N.buildProgramme(state.plans,null,options),running=before.weeks.flatMap(w=>w.sessions).filter(s=>s.catalogueOccurrenceId.startsWith('running-'));
 const p=M.propose({snapshot:strength,today:'2026-11-20',meetDate:'2027-01-02',days,state,activePlanId:'old'}),accepted=M.apply(state,p,'new');
 const rebuilt=N.buildProgramme(accepted.plans,before,options),all=rebuilt.weeks.flatMap(w=>w.sessions),expectedSuperseded=accepted.occurrences.filter(o=>o.planId==='old'&&o.status==='superseded');
 const reappeared=expectedSuperseded.filter(o=>all.some(s=>s.catalogueOccurrenceId===`old-w${o.week}-${o.sessionId}`));
 const p2=M.propose({snapshot:strength,today:'2026-11-20',meetDate:'2027-01-05',days,state,activePlanId:'old'}),a2=M.apply(state,p2,'new');
 const all2=N.buildProgramme(a2.plans,before,options).weeks.flatMap(w=>w.sessions);
 const placementMismatch=a2.occurrences.filter(o=>o.planId==='new'&&o.status==='planned').filter(o=>{const s=all2.find(x=>x.catalogueOccurrenceId===`new-w${o.week}-${o.sessionId}`);return s&&s.scheduledDate!==o.date});
 const omitted=accepted.occurrences.filter(o=>o.planId==='new'&&o.status==='not-scheduled');
 const omittedReappeared=omitted.filter(o=>all.some(s=>s.catalogueOccurrenceId===`new-w${o.week}-${o.sessionId}`));
 assert.ok(reappeared.length);assert.ok(placementMismatch.length);assert.ok(omittedReappeared.length);
 assert.deepEqual(all.filter(s=>s.catalogueOccurrenceId.startsWith('running-')),running);
 assert.equal(accepted.logs[done.id].sets[0].weightKg,100);
 console.log(JSON.stringify({plan:id,supersededReappeared:reappeared.length,wrongDates:placementMismatch.map(o=>({session:o.sessionId,expected:o.date,actual:all2.find(x=>x.catalogueOccurrenceId===`new-w${o.week}-${o.sessionId}`).scheduledDate})),pastOpeningSessionsReappeared:omittedReappeared.length,runningSessionsPreserved:running.length,standaloneLogRetained:true}));
});
