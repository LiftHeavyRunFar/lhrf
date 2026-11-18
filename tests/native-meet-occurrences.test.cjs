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

{
const assert = require('node:assert/strict');
const test = require('node:test');
const { buildProgramme } = require('../src/native-catalogue.js');
const { previewProgramme } = require('../src/programme-catalogue.js');
const training = require('../src/catalogue-training.js');
const registry = require('../src/exercise-registry.js');

const raceTemplates = [
  ['10k-two-run', 12, 10, false],
  ['10k-three-run', 12, 10, false],
  ['half-marathon', 22.6, 21.1, false],
  ['marathon-distance', 42.195, 42.195, false],
  ['marathon-timed', 42.195, 42.195, false],
  ['marathon-two-run', 42.195, 42.195, true],
  ['marathon-two-run-16', 42.195, 42.195, true],
];

const options = {
  training, registry, equipment: [], now: '2026-11-16T12:00:00Z',
};
const build = (plan, previous) => buildProgramme([plan], previous, options);

for (const [id, targetKm, raceKm, markedEvent] of raceTemplates) {
  test(id + ' labels its new race occurrence without changing its prescription', () => {
    const snapshot = previewProgramme(id, { recent10kSeconds: 3300 });
    const plan = { id, snapshot, start: '2026-11-16' };
    const before = JSON.stringify(plan);
    const generated = build(plan);
    const sessions = generated.weeks.flatMap(week => week.sessions);
    const race = sessions.find(session => session.catalogueOccurrenceId.endsWith('-race'));
    const sourceWeek = snapshot.weeks.find(week => week.sessions.some(session => session.id === 'race'));
    const source = sourceWeek.sessions.find(session => session.id === 'race');

    assert.equal(race.runs[0].role, 'race');
    assert.equal(race.runs[0].distanceKm, targetKm);
    assert.equal(race.runs[0].steps.find(step => step.role === 'race').distanceKm, raceKm);
    assert.equal(race.scheduledDate, training.addDays(plan.start, (sourceWeek.week - 1) * 7 + source.day));
    assert.equal(race.eventType, markedEvent ? 'running' : undefined);
    assert.equal(race.eventDate, markedEvent ? race.scheduledDate : undefined);
    assert.equal(JSON.stringify(plan), before);

    for (const session of sessions.filter(item => item !== race)) {
      const expected = session.catalogueOccurrenceId.endsWith('-long') ? 'long-run'
        : session.catalogueOccurrenceId.endsWith('-quality') ? 'quality-run' : 'easy-run';
      assert.equal(session.runs[0].role, expected);
    }
  });
}

test('preserves a race occurrence already in a reviewed programme', () => {
  const id = '10k-two-run';
  const plan = { id, snapshot: previewProgramme(id), start: '2026-11-16' };
  const previous = build(plan);
  const race = previous.weeks.flatMap(week => week.sessions)
    .find(session => session.catalogueOccurrenceId.endsWith('-race'));
  race.runs[0].role = 'easy-run';
  const before = JSON.stringify(previous);

  assert.deepEqual(build(plan, previous), previous);
  assert.equal(JSON.stringify(previous), before);
});

}
