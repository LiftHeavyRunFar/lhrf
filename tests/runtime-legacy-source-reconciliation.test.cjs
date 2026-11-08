const test=require('node:test'),assert=require('node:assert/strict');
const coach=require('../src/coach-engine.js'),adapters=require('../src/coach-adapters.js');
const now=()=>Date.parse('2026-11-08T07:00:00Z');
function done(id,date,lift,kg,reps,role){
 return {id,date,completedSets:1,completedRun:false,prescription:{ex:[[lift,1,reps,kg,6,{role,category:role==='top'?'primary':'secondary'}]],runs:[]}};
}
test('a reviewed proposal can use original completed native history without rewriting RPE or inventing known equipment',()=>{
 const first='2026-10-30T08:00:00Z',second='2026-11-06T08:00:00Z';
 const rows=[{date:first,sessionId:'first',exercise:'Bench',set:1,reps:1,weight:145,rpe:9,role:'top'},
             {date:second,sessionId:'second::strength',exercise:'Bench',set:1,reps:1,weight:142.5,rpe:9,role:'top'}];
 const data={sets:rows,completedWorkouts:[done('first',first,'Bench',145,1,'top'),done('second',second,'Bench',142.5,1,'top')],runs:[]};
 const config={coachingRulesVersion:2,startDate:'2026-11-02',weeks:4,bench:1,squat:0,deadlift:0,runs:0,
  trainingAge:'advanced',priority:'Bench',availableDays:['Fri'],days:1,baselines:{Bench:150},
  liftProfiles:{Bench:{kg:150,reps:1,recency:'recent'}},
  strengthEvidenceReview:{version:1,originalLogsUnchanged:true,reviews:[{kind:'execution',match:{date:first,exercise:'Bench',weight:145,reps:1,role:'top'},original:null,value:'competition-paused',source:'athlete-confirmation'}]}};
 const before=JSON.stringify({data,config});
 const p=coach.prepareNewProgramme(config,{data,now}),proof=p.coachingEvidence.strength.Bench.rows;
 assert.equal(proof.length,2);
 assert.equal(proof[0].exerciseId,'bench');assert.equal(proof[0].execution,'competition-paused');
 assert.equal(p.strengthCalibration.lifts.Bench.singlesSupported,true);
 assert.equal(JSON.stringify({data,config}),before,'original history and athlete review must remain immutable');
 const unknown=coach.prepareNewProgramme({...config,strengthEvidenceReview:undefined},{data:{...data,completedWorkouts:[]},now});
 assert.equal(unknown.coachingEvidence.strength.Bench.rows[0].exerciseId,null,'no completed native source means no derived identity');
 assert.equal(unknown.strengthCalibration?.lifts?.Bench,undefined,'untyped rows must not silently calibrate a competition lift');
});
test('newer excess RPE bounds a repeated recovery dose rather than hiding it or asserting recovery',()=>{
 const earlier='2026-10-29T08:00:00Z',later='2026-11-05T08:00:00Z';
 const sets=[{date:earlier,sessionId:'lower-one',exercise:'Deadlift',set:1,weight:120,reps:3,rpe:6,role:'straight'},
             {date:later,sessionId:'lower-two',exercise:'Deadlift',set:1,weight:120,reps:3,rpe:8,role:'straight'}];
 const data={sets,runs:[],completedWorkouts:[done('lower-one',earlier,'Deadlift',120,3,'straight'),done('lower-two',later,'Deadlift',120,3,'straight')]};
 const config={coachingRulesVersion:2,startDate:'2026-11-02',weeks:4,bench:0,squat:0,deadlift:1,runs:0,
  trainingAge:'advanced',priority:'Deadlift',availableDays:['Thu'],days:1,
  fixedSessions:[{kind:'strength',lift:'deadlift',day:'Thu'}],manualSplit:{Thu:['lower']},
  lightLifts:['deadlift'],strengthModes:{Deadlift:'maintenance'},visitConstraints:{strengthVisits:1,minutes:{Thu:null}},
  runningHistory:{recentMarathonDate:'2026-10-18'}};
 const p=adapters.buildNewProgramme(config,{data,now}),work=p.weeks[1].sessions.flatMap(s=>s.ex).find(ex=>ex[0]==='Deadlift');
 assert.ok(work,'a lower maintenance session remains scheduled');
 assert.ok(work[3]>0&&work[3]<120,'newer high effort must reduce the proposed same-reps load');
 assert.equal(work[5].runtimeLoadEvidence?.kind,'recent-higher-effort-bound');
 assert.equal(work[5].loadUnconfirmed,false);
 assert.equal(data.sets[1].rpe,8,'do not rewrite historical RPE');
});
