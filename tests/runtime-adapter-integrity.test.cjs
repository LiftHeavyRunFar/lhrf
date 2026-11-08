const test=require('node:test'),assert=require('node:assert/strict');
const adapters=require('../src/coach-adapters.js');
const {record}=require('./fixtures/independent-coaching-inputs.cjs');
const {fullInventory}=require('./equipment-fixtures.cjs');
test('shorthand profile translation preserves the same calibrated strength evidence as a native input',()=>{
 const raw={coachingRulesVersion:2,startDate:'2026-11-09',weeks:4,bench:2,squat:0,deadlift:0,runs:0,priority:'Bench',trainingAge:'intermediate',maxes:{bench:140},equipmentInventory:fullInventory(),availableDays:['Mon','Thu'],days:2,visitConstraints:{strengthVisits:2,minutes:{Mon:120,Thu:120}}};
 const data={sets:['2026-10-28','2026-11-04'].map(date=>record('Bench',100,5,7,'top',date+'T12:00:00Z'))},options={data,now:()=>Date.parse('2026-11-07T12:00:00Z')},before=JSON.stringify({raw,data});
 const shorthand=adapters.buildNewProgramme(raw,options),native=adapters.buildNewProgramme(adapters.normalizeProfile(raw),options);
 assert.deepEqual(shorthand.config.strengthCalibration,native.config.strengthCalibration);assert.deepEqual(shorthand.config.baselines,native.config.baselines);assert.notEqual(shorthand.config.baselines.Bench,140,'Completed evidence must survive shorthand translation instead of being overwritten by declared maxes.');assert.equal(JSON.stringify({raw,data}),before);
});
test('approval keeps the reviewed evidence and all generated prescriptions instead of recapturing empty history',()=>{
 const coach=require('../src/coach-engine.js'),input={coachingRulesVersion:2,startDate:'2026-11-09',weeks:4,bench:1,squat:0,deadlift:0,runs:0,priority:'Bench',trainingAge:'intermediate',maxes:{bench:140},equipmentInventory:fullInventory(),availableDays:['Mon'],days:1,visitConstraints:{strengthVisits:1,minutes:{Mon:120}}},data={sets:['2026-10-28','2026-11-04'].map(date=>record('Bench',100,5,7,'top',date+'T12:00:00Z'))},now=()=>Date.parse('2026-11-07T12:00:00Z');
 const reviewed=adapters.buildNewProgramme(input,{data,now}),before=JSON.stringify(reviewed),approved=coach.approveProgrammeConfig(reviewed.config,'2026-11-07T13:00:00Z'),after=adapters.buildProgramme(approved,{data,now});
 assert.deepEqual(approved.coachingEvidence,reviewed.config.coachingEvidence);assert.deepEqual(approved.strengthCalibration,reviewed.config.strengthCalibration);assert.equal(JSON.stringify(reviewed),before);
 const doses=p=>p.weeks.map(w=>w.sessions.map(({id,programmeId,...s})=>s));assert.deepEqual(doses(after),doses(reviewed));
 assert.throws(()=>coach.approveProgrammeConfig(reviewed.config,'2026-11-06T13:00:00Z'),/postdates approval/);
});
test('new-runtime approvals cannot leak load increases or running reductions across programme identities or future decision dates',()=>{
 const coach=require('../src/coach-engine.js'),now=()=>Date.parse('2026-11-07T12:00:00Z'),config={coachingRuntimeVersion:1,coachingRulesVersion:2,coachingPolicy:'review-v2',programmeId:'current',approvedAt:'2026-11-05T12:00:00Z',startDate:'2026-11-02',weeks:8,bench:1,priority:'Bench'},run={name:'Easy aerobic run',role:'easy-run',distanceKm:10,minutes:60,durationRangeMinutes:{min:55,max:60},pace:'5:30 to 6:00/km',steps:[{label:'Easy run',role:'easy',distanceKm:10,pace:'5:30 to 6:00/km'}],workMinutes:0},sessions=[{id:'next',day:'Tue',ex:[['Bench',1,5,100,7.5,{category:'primary',role:'top',policy:'evidence-calibrated-v1'}]],runs:[run]}];
 for(const decision of [{date:'2026-11-01T12:00:00Z'},{date:'2026-11-06T12:00:00Z',programmeId:'old'},{date:'2026-11-10T12:00:00Z',programmeId:'current'}]){
  const data={customRoadmap:config,decisions:[{...decision,kind:'adaptive-progression',approved:true,week:1,exercise:'Bench',factor:1.025},{...decision,kind:'hybrid-load',approved:true,week:2,factor:.9,intervention:'running-duration'}]},engine=coach.createEngine({data,now}),copy=structuredClone(sessions);
  engine.carryForwardApprovedProgression(copy,2);engine.applyApprovedHybridRunning(copy,2);assert.deepEqual(copy,sessions);
 }
 const data={customRoadmap:config,decisions:[{date:'2026-11-06T12:00:00Z',programmeId:'current',kind:'adaptive-progression',approved:true,week:1,exercise:'Bench',factor:1.025},{date:'2026-11-06T12:00:00Z',programmeId:'current',key:'current-cut',kind:'hybrid-load',approved:true,week:2,factor:.9,intervention:'running-duration'}]},engine=coach.createEngine({data,now}),copy=structuredClone(sessions);engine.carryForwardApprovedProgression(copy,2);engine.applyApprovedHybridRunning(copy,2);assert.equal(copy[0].ex[0][3],102.5);assert.equal(copy[0].runs[0].distanceKm,9);assert.deepEqual(data.customRoadmap,config);
});
