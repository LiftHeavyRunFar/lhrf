const assert=require('node:assert/strict');
const {buildProgramme}=require('../src/programme-v2.js');
const cases=[
 ['undated strength', {weeks:12,bench:2,squat:2,deadlift:1,runs:2,runGoal:'fitness',priority:'Bench'}],
 ['undated hybrid',{weeks:20,bench:2,squat:1,deadlift:1,runs:3,priority:'Running'}],
 ['powerlifting meet',{weeks:20,bench:2,squat:2,deadlift:1,strengthTargetDate:'2027-05-01'}],
 ['running event',{weeks:12,bench:1,runs:3,runGoal:'10k',runningTargetDate:'2027-02-01',priority:'Running'}],
 ['dual events',{weeks:6,bench:3,runs:3,strengthTargetDate:'2026-11-28',runningTargetDate:'2026-11-29'}],
 ['unknown baseline',{weeks:8,bench:2}]
];
for(const [name,c] of cases){
 const before=JSON.stringify(c),p=buildProgramme(c);
 assert.equal(JSON.stringify(c),before,name+' input unchanged');
 assert.equal(p.weeks.length,c.weeks,name);
 assert.ok(p.checks.outcomeDefined,name);
 assert.ok(p.checks.finalWeekAligned,name);
 assert.ok(p.checks.workloadBudgetRespected,name);
 assert.ok(p.checks.chartsUsePlanPhases,name);
 assert.ok(p.checks.approvalsExplicit,name);
 assert.ok(p.checks.noUnmotivatedCompetitionTaper,name);
 assert.ok(p.weeks.every(w=>w.calendar.sessions.length===w.strengths.length+w.runs.length),name);
 assert.equal(p.weeks.at(-1).phase,c.strengthTargetDate||c.runningTargetDate?'event':'assessment',name);
 assert.deepEqual(buildProgramme(c),p,name+' deterministic');
 console.log('PASS pipeline',name);
}
const constrained=buildProgramme({weeks:8,squat:2,runs:2,priority:'Running',availableDays:['Tue'],fixedSessions:[{kind:'strength',lift:'squat',day:'Tue'},{kind:'run',runType:'quality',day:'Tue'}]});
assert.ok(constrained.issues.some(x=>x.type==='recovery-conflict'));
assert.ok(constrained.weeks.some(x=>x.reviewRequired));
console.log('PASS explicit conflict escalation');
console.log('Prototype structural tests only; no coaching efficacy claims.');
