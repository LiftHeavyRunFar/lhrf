const test=require('node:test');
const assert=require('node:assert/strict');
const coach=require('../src/coach-engine.js');
const registry=require('../src/exercise-registry.js');
const {fullInventory}=require('./equipment-fixtures.cjs');

const start='2026-11-09', inventory=fullInventory(), identity=registry.identity('Bench',inventory);
const weekDate=(week,offset)=>new Date(Date.parse(start+'T12:00:00Z')+((week-1)*7+offset)*86400000).toISOString().slice(0,10);
const kinds={
 heavy:{offset:0,day:'Mon',reps:3,rpe:7.5,role:'top'},
 volume:{offset:2,day:'Wed',reps:5,rpe:7,role:'top'},
 speed:{offset:4,day:'Fri',reps:2,rpe:5.5,role:'straight'},
 recovery:{offset:0,day:'Mon',reps:3,rpe:5.5,role:'straight'}
};
function strengthVisit(week,purpose){
 const {offset,day,reps,rpe,role}=kinds[purpose];
 return {id:'bench-'+purpose,day,scheduledDate:weekDate(week,offset),runs:[],ex:[
  ['Bench',1,reps,100,rpe,{...identity,role,category:'primary',trainingRole:purpose}],
  ['Cable triceps pushdown',3,10,15,7,{role:'accessory',category:'assistance'}]
 ]};
}
function fixture({order=['volume','heavy','speed'],low=true,overshoot=true,deload=false}={}){
 const c={programmeId:'current',approvedAt:'2026-11-08T12:00:00Z',coachingRulesVersion:2,coachingRuntimeVersion:1,
  coachingPolicy:'review-v2',startDate:start,weeks:12,bench:3,runs:0,priority:'Bench',trainingAge:'advanced'};
 const activeWeek=deload?6:4, reviewDate=weekDate(activeWeek,0);
 const weeks=Array.from({length:activeWeek},(_,i)=>({week:i+1,sessions:(deload&&i>=3&&i<activeWeek-1?['recovery']:order).map(role=>strengthVisit(i+1,role))}));
 const data={customRoadmap:c,activeCustomWeek:activeWeek,activeSchedule:weeks.at(-1).sessions,
  reviewedProgramme:{config:c,weeks},completedWorkouts:[],sets:[],runs:[],sessionFeedback:[],decisions:[],
  checkins:low?[{date:'2026-11-26',sleep:1},{date:'2026-11-27',energy:1}]:[]};
 for(const {week,sessions} of weeks.slice(0,3))for(const s of sessions){
  const [name,,reps,weight,target,meta]=s.ex[0], date=s.scheduledDate+'T12:00:00Z', id=s.id+'::strength';
  data.completedWorkouts.push({id,parentId:s.id,component:'strength',week,date,prescription:{ex:s.ex,runs:[]}});
  data.sets.push({date,sessionId:id,week,exercise:name,weight,reps,target,role:meta.role,
   rpe:target+(overshoot&&meta.trainingRole==='heavy'?1:-1),...identity});
 }
 return {data,now:()=>Date.parse(reviewDate+'T08:00:00Z')};
}
const review=({data,now})=>coach.createEngine({data,now}).reviewDecision();

test('three heavy overshoots survive calendar array reordering and affect only the matching uncompleted strength visit',()=>{
 for(const order of [['volume','heavy','speed'],['speed','volume','heavy'],['heavy','speed','volume']]){
  const sample=fixture({order}),before=JSON.stringify(sample.data),result=review(sample);
  assert.equal(result.status,'fatigue');
  assert.equal(result.trainingPurpose,'heavy');
  assert.deepEqual(result.changes,[{id:'bench-heavy',exercise:'Cable triceps pushdown',setDelta:-1}]);
  assert.equal(result.hybridIntervention,undefined);
  assert.equal(JSON.stringify(sample.data),before);
 }
 const complete=fixture();
 const heavy=complete.data.activeSchedule.find(s=>s.id==='bench-heavy');
 complete.data.completedWorkouts.push({id:heavy.id+'::strength',week:4,component:'strength',date:heavy.scheduledDate+'T07:00:00Z',prescription:{ex:heavy.ex}});
 complete.data.sets.push({...complete.data.sets.find(row=>row.sessionId==='bench-heavy::strength'),week:4,date:heavy.scheduledDate+'T07:00:00Z'});
 const decision=review(complete);
 assert.equal(decision.status,'recovery-review');
 assert.equal(decision.changes,undefined);
});

test('a scheduled recovery visit does not manufacture a missing heavy visit, while a genuinely missed heavy visit still holds progression',()=>{
 const sample=fixture({deload:true,low:false,overshoot:false}),result=review(sample);
 assert.equal(result.status,'progress');
 assert.equal(result.trainingPurpose,'heavy');
 assert.ok(result.evidence.every(row=>row.week<=3));
 const old=sample.data.reviewedProgramme.weeks[4];
 old.sessions=[strengthVisit(5,'heavy')];
 assert.notEqual(review(sample).trainingPurpose,'heavy');
});

test('fatigue cooldown is scoped to the programme, lift, purpose and valid review dates',()=>{
 const sample=fixture(), decision={kind:'fatigue-intervention',approved:true,programmeId:'current',week:3,date:'2026-11-27',affectedLift:'Bench',trainingPurpose:'heavy'};
 for(const prior of [{...decision,programmeId:'older'},{...decision,affectedLift:'Squat'},{...decision,trainingPurpose:'volume'},{...decision,date:'2027-01-01'}]){
  sample.data.decisions=[prior];
  assert.equal(review(sample).status,'fatigue');
 }
 sample.data.decisions=[decision];
 assert.equal(review(sample).status,'recovery-review');
 const recovered=fixture({low:false,overshoot:false});
 recovered.data.decisions=[decision];
 assert.equal(review(recovered).status,'progress');
});

test('reported speed and recovery work cannot recalibrate a main-lift baseline',()=>{
 const base={startDate:start,weeks:8,days:3,bench:1,squat:0,deadlift:0,runs:0,trainingAge:'advanced',
  strengthMode:'progression',priority:'Bench',baselines:{Bench:125},equipmentInventory:inventory};
 const prepare=(purpose,rpe)=>coach.prepareNewProgramme(base,{now:()=>Date.parse('2026-11-08T12:00:00Z'),data:{
  sets:['2026-10-28','2026-11-04'].map((date,i)=>({date,sessionId:'recorded-'+i,exercise:'Bench',
   role:'straight',reps:2,weight:65,rpe,target:5.5,...identity})),
  completedWorkouts:['2026-10-28','2026-11-04'].map((date,i)=>({id:'recorded-'+i,date,
   prescription:{ex:[['Bench',5,2,65,5.5,{...identity,role:'straight',trainingRole:purpose}]]}}))
 }});
 for(const purpose of ['speed','recovery','technique']){
  assert.equal(prepare(purpose,6).baselines.Bench,125);
  assert.equal(prepare(purpose,5.5).baselines.Bench,125);
 }
 assert.ok(prepare('heavy',7).baselines.Bench<125,'Genuine capacity-relevant work remains eligible');
});

test('plan-first review follows planned strength progression and keeps corroborated fatigue interventions',()=>{
 const healthy=fixture({low:false,overshoot:false});
 assert.equal(review(healthy).status,'progress');
 healthy.data.customRoadmap.planFirstVersion=1;
 assert.equal(review(healthy).status,'on-track');
 assert.equal(review(healthy).changes,undefined);
 const isolated=fixture({overshoot:false});
 isolated.data.customRoadmap.planFirstVersion=1;
 isolated.data.sets.findLast(row=>row.sessionId==='bench-heavy::strength').rpe=9;
 assert.equal(review(isolated).changes,undefined);
 const repeated=fixture();
 const original=review(repeated);
 repeated.data.customRoadmap.planFirstVersion=1;
 assert.deepEqual(review(repeated),original);
 assert.equal(original.status,'fatigue');
});

test('a lower-body reduction from either review route prevents a second cut from the same visits',()=>{
 const sample=fixture();
 const {data,now}=sample,c=data.customRoadmap,squat=registry.identity('Squat',inventory);
 Object.assign(c,{bench:0,squat:3,runs:1,priority:'Squat',integratedCoachingVersion:1,planFirstVersion:1});
 for(const {sessions} of data.reviewedProgramme.weeks)for(const s of sessions){
  Object.assign(s.ex[0][5],squat);
  s.ex[0][0]='Squat';
  s.ex[0][3]=200;
  s.ex[1][0]='Leg extension';
 }
 for(const row of data.sets)Object.assign(row,squat,{exercise:'Squat',weight:200});
 const heavy=data.sets.findLast(row=>row.sessionId==='bench-heavy::strength');
 for(let set=2;set<=9;set++)data.sets.push({...heavy,role:'backoff',weight:180,rpe:8,set});
 for(const done of data.completedWorkouts.slice(-2))data.sessionFeedback.push({
  sessionId:done.id,date:done.date,week:done.week,difficulty:'harder',energy:'low'
 });
 assert.equal(coach.createEngine({data,now}).hybridWorkloadRecommendation().intervention,'lower-accessory');
 assert.equal(review(sample).trainingPurpose,'heavy');
 const prior={approved:true,programmeId:c.programmeId,week:4,date:'2026-11-30T07:00:00Z'};
 data.decisions=[{...prior,kind:'hybrid-load',intervention:'lower-accessory'}];
 assert.equal(review(sample).changes,undefined);

 // The same repeated feedback can still trigger the broader review after
 // the purpose-specific concern is no longer selected.
 data.sets.find(row=>row.sessionId==='bench-heavy::strength').rpe=7.5;
 data.decisions=[];
 assert.equal(review(sample).hybridIntervention,'lower-accessory');
 data.decisions=[{...prior,kind:'fatigue-intervention',affectedLift:'Squat',trainingPurpose:'heavy'}];
 assert.equal(review(sample).changes,undefined);
 data.decisions[0].date='2026-11-26T08:00:00Z';
 assert.equal(review(sample).changes,undefined,'One later difficult lower-body visit does not repeat the cut');
 data.decisions[0].date='2026-11-23T08:00:00Z';
 assert.equal(review(sample).hybridIntervention,'lower-accessory','Two new linked visits can reopen the decision');
 data.decisions[0].date=prior.date;
 data.decisions[0].affectedLift='Bench';
 assert.equal(review(sample).hybridIntervention,'lower-accessory');
 data.decisions[0].affectedLift='Squat';
 data.decisions[0].programmeId='archived';
 assert.equal(review(sample).hybridIntervention,'lower-accessory');
});
