const test=require('node:test'),assert=require('node:assert/strict');
const intake=require('../src/coach-intake.js');
const {prepareNewProgramme}=require('../src/coach-engine.js');
const fixtures=require('./fixtures/five-scenario-engine-inputs.json');
const copy=x=>JSON.parse(JSON.stringify(x));
function input(id='A'){
 const config=copy(fixtures.cases.find(c=>c.id===id).config),v=config.visitConstraints,h=config.runningHistory||{};
 return {config,raw:{strengthVisits:v.strengthVisits,minutes:v.minutes,combinedDays:v.combinedDays,separateDays:v.separateDays,separateMinutes:v.separateMinutes,minimumGapHours:v.minimumGapHours,eventDays:v.eventDays,weeklyKmHistory:(h.weeklyKm||[]).join(', '),longRun:h.longRun,recentMarathonDate:h.recentMarathonDate||'',orderedGoals:config.orderedGoals}};
}
test('intake translates supplied visits and running observations without changing the source athlete',()=>{
 const {config,raw}=input(),before=JSON.stringify({config,raw}),proposal=intake.build(config,raw);
 assert.equal(JSON.stringify({config,raw}),before);assert.equal(proposal.coachingRulesVersion,2);
 assert.deepEqual(proposal.visitConstraints,config.visitConstraints);assert.deepEqual(proposal.runningHistory,config.runningHistory);
 assert.deepEqual(proposal.liftProfiles,config.liftProfiles);assert.deepEqual(proposal.baselines,config.baselines);
});
test('unknown or malformed visit/history facts are rejected rather than assigned plausible values',()=>{
 const {config,raw}=input();
 for(const patch of [{minutes:{...raw.minutes,Tue:''}},{minutes:{...raw.minutes,Tue:74.5}},{weeklyKmHistory:'20, unknown, 25'},{weeklyKmHistory:'20, -1, 25'},{longRun:{km:11,minutes:'',recoveryHours:24}},{eventDays:{'2027-01-10':{confirmed:true,minutes:-2}}}])assert.throws(()=>intake.build(config,{...raw,...patch}),RangeError);
});
test('separate visits retain per-visit limits and the actual gap while contradictory permissions fail',()=>{
 const {config,raw}=input('C'),proposal=intake.build(config,raw);
 assert.deepEqual(proposal.visitConstraints.separateDays,['Tue']);assert.equal(proposal.visitConstraints.minimumGapHours,6);
 assert.throws(()=>intake.build(config,{...raw,minimumGapHours:5}),/at least 6/);
 assert.throws(()=>intake.build(config,{...raw,combinedDays:['Tue']}),/combined or separate/);
});
test('event availability and dated handover remain explicit inputs to canonical validation',()=>{
 const {config,raw}=input('C'),proposal=intake.build(config,raw);
 assert.equal(proposal.visitConstraints.eventDays['2027-03-06'].confirmed,false);
 assert.equal(proposal.visitConstraints.eventDays['2027-03-06'].minutes,null);
 assert.deepEqual(proposal.orderedGoals,config.orderedGoals);
 assert.throws(()=>prepareNewProgramme(intake.build(config,{...raw,orderedGoals:copy(raw.orderedGoals).reverse()})),/increasing.*dates/);
});
test('recovery observations survive intact and a stated normal history can explicitly clear the proposed evidence',()=>{
 const {config,raw}=input(),evidence={status:'accumulating-fatigue',affectedLifts:['Squat'],repeatCount:2,baselineRpe:7.5,recentRpe:9,observedAt:'2026-10-28'};
 const proposal=intake.build(config,{...raw,recoveryEvidence:evidence});
 assert.deepEqual(proposal.recoveryEvidence,evidence);assert.notEqual(proposal.recoveryEvidence,evidence);
 assert.equal(intake.build(proposal,{...raw,recoveryEvidence:null}).recoveryEvidence,undefined);
 assert.throws(()=>intake.build(config,{...raw,recoveryEvidence:{status:'normal',affectedLifts:['Squat']}}),/Recovery evidence/);
});
test('reported sleep and normal recovery remain raw intake facts without invented check-in scores',()=>{
 const {config,raw}=input(),context={status:'normal',reportedAt:'2026-10-30',sleepHours:6,usualSleepHours:7.5};
 const proposal=intake.build(config,{...raw,recoveryEvidence:null,recoveryContext:context});
 assert.deepEqual(proposal.recoveryContext,context);assert.notEqual(proposal.recoveryContext,context);assert.equal(proposal.recoveryEvidence,undefined);assert.equal(proposal.checkins,undefined);
 for(const recoveryContext of [{...context,status:'fine'},{...context,sleepHours:-1},{...context,usualSleepHours:undefined},{...context,reportedAt:'2026-02-30'}])assert.throws(()=>intake.build(config,{...raw,recoveryContext}),RangeError);
});
test('same-day strength and running events cannot silently replace one another',()=>{
 const {config,raw}=input();assert.throws(()=>prepareNewProgramme(intake.build({...config,strengthTargetDate:'2027-01-10',runningTargetDate:'2027-01-10'},raw)),/same date.*timing review/);
});
