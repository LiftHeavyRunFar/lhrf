const {test}=require('node:test'), assert=require('node:assert/strict');
const C=require('../src/programme-catalogue'),T=require('../src/catalogue-training'),M=require('../src/meet-entry'),N=require('../src/native-catalogue');
const registry=require('../src/exercise-registry'),gym=require('../src/gym-equipment'),inventory=require('./equipment-fixtures.cjs').fullInventory();
const options={training:T,registry,gym,inventory,now:'2026-11-20T09:00:00Z',equipment:[]};
for(const id of ['powerlifting-three-day','powerlifting-four-day']) for(const meetDate of ['2027-01-02','2027-01-05']) test(`${id} preserves reviewed occurrences for ${meetDate}`,()=>{
 const days=id.includes('three')?[0,2,4]:[0,2,4,6],strength=C.previewProgramme(id),run=C.previewProgramme('marathon-two-run-16');
 let state=T.enrol(T.enrol(T.empty(),strength,'2026-11-16','old'),run,'2026-11-16','running');
 const done=state.occurrences.find(o=>o.planId==='old');done.status='logged';state.logs[done.id]={loggedAt:'2026-11-16T10:00:00Z',sets:[{exerciseId:'competition-squat',dose:5,weightKg:100,rpe:7}]};
 const before=N.buildProgramme(state.plans,null,options),running=before.weeks.flatMap(w=>w.sessions).filter(s=>s.catalogueOccurrenceId.startsWith('running-'));
 const proposal=M.propose({snapshot:strength,today:'2026-11-20',meetDate,days,state,activePlanId:'old'}),accepted=M.apply(state,proposal,'new');
 const data=JSON.stringify({plans:accepted.plans,occurrences:accepted.occurrences,logs:accepted.logs,previous:before});
 const restored=JSON.parse(data),built=N.buildProgramme(restored.plans,restored.previous,{...options,reviewedOccurrences:restored.occurrences}),all=built.weeks.flatMap(w=>w.sessions);
 for(const occurrence of restored.occurrences){const key=`${occurrence.planId}-w${occurrence.week}-${occurrence.sessionId}`,session=all.find(s=>s.catalogueOccurrenceId===key);
  if(['superseded','not-scheduled'].includes(occurrence.status))assert.equal(session,undefined,key);
  else {assert.ok(session,key);assert.equal(session.scheduledDate,occurrence.date,key);assert.equal(session.day,['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][new Date(occurrence.date+'T00:00:00Z').getUTCDay()],key)}
 }
 assert.deepEqual(all.filter(s=>s.catalogueOccurrenceId.startsWith('running-')),running);
 assert.deepEqual(restored.logs,state.logs);
 const meet=all.find(s=>s.catalogueOccurrenceId===`new-w${proposal.weeks}-meet`);assert.equal(meet.eventDate,meetDate);
 assert.equal(all.find(s=>s.catalogueOccurrenceId==='old-w1-A').id,before.weeks.flatMap(w=>w.sessions).find(s=>s.catalogueOccurrenceId==='old-w1-A').id);
 for(const invalid of [restored.occurrences.slice(1),[...restored.occurrences,restored.occurrences[0]],restored.occurrences.map((o,i)=>i?o:{...o,status:'unknown'})])assert.throws(()=>N.buildProgramme(restored.plans,restored.previous,{...options,reviewedOccurrences:invalid}),/Reviewed sessions/);
});
