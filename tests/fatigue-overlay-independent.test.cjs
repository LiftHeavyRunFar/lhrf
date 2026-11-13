// Independent regression checks for source and athlete-approval binding.
const {test}=require('node:test'),assert=require('node:assert/strict');
const catalogue=require('../src/programme-catalogue'),training=require('../src/catalogue-training'),native=require('../src/native-catalogue');
const registry=require('../src/exercise-registry'),gym=require('../src/gym-equipment'),assessment=require('../src/fatigue-assessment'),overlay=require('../src/fatigue-overlay');
function repeatedOneOccurrence(){
 const state=training.enrol(training.empty(),catalogue.previewProgramme('lifting-foundation'),'2026-11-09','r');
 const programme=native.buildProgramme(state.plans,null,{training,registry,gym,inventory:{items:{}},now:'2026-11-09T09:00:00Z',equipment:[],protectedWeek:()=>false});
 const session=programme.weeks[0].sessions.find(s=>s.ex.length),assessmentState={customRoadmap:programme.config,reviewedProgramme:{weeks:programme.weeks},completedWorkouts:[],sets:[],runs:[],fatigueEvidence:[]};
 for(const [i,date] of ['2026-11-09','2026-11-12','2026-11-15','2026-11-18','2026-11-21'].entries()){
  const stamp=date+'T09:00:00.000Z',total=session.ex.reduce((n,x)=>n+x[1],0);
  assessmentState.completedWorkouts.push({id:session.id,date:stamp,completedSets:total,plannedSets:total,prescription:{ex:structuredClone(session.ex),runs:[]}});
  session.ex.forEach((x,k)=>{for(let set=1;set<=x[1];set++)assessmentState.sets.push({sessionId:session.id,date:stamp,exerciseId:x[5].exerciseId,set,reps:x[2],weight:k===0?(i<3?100:80):50,rpe:7});});
  assessmentState.fatigueEvidence.push({sessionId:session.id,discipline:'strength',recordedAt:stamp,painOrDiscomfort:'no',illness:'no',unusualFatigue:i===4?'yes':'no'});
 }
 const now='2026-11-23',policy={minDeclineFraction:.1,recentDays:14};
 const proposal=assessment.assess({state:assessmentState,discipline:'strength',now,policy}).candidate;
 assert.ok(proposal,'fixture must reproduce a review signal');
 const eventContext={asOfDate:now,eventInformationUnchanged:true,eventFreeAttestation:{source:'athlete-confirmed',confirmedOn:now,noOtherEventOrTaper:true,boundPlans:JSON.stringify(state.plans)}};
 return {state,assessmentState,proposal,enabled:true,approved:true,eventContext,draftContext:{known:true,activeSessionIds:[]},now};
}
test('repeating one historical source occurrence across dates cannot establish a programme intervention',()=>{
 const inputs=repeatedOneOccurrence(),before=structuredClone(inputs);
 assert.equal(overlay.approve(inputs).overlay,null);
 assert.deepEqual(inputs,before);
});
function actualOccurrences(){
 const state=training.enrol(training.empty(),catalogue.previewProgramme('lifting-foundation',{continuation:true}),'2026-11-09','r');
 const programme=native.buildProgramme(state.plans,null,{training,registry,gym,inventory:{items:{}},now:'2026-11-09T09:00:00Z',equipment:[],protectedWeek:()=>false});
 const assessmentState={customRoadmap:programme.config,reviewedProgramme:{weeks:programme.weeks},completedWorkouts:[],sets:[],runs:[],fatigueEvidence:[]};
 for(const [i,week] of [4,6,7,8,9].entries()){
  const session=programme.weeks[week-1].sessions.find(s=>s.catalogueOccurrenceId.endsWith('-A')),stamp=session.scheduledDate+'T09:00:00.000Z',total=session.ex.reduce((n,x)=>n+x[1],0);
  assessmentState.completedWorkouts.push({id:session.id,date:stamp,completedSets:total,plannedSets:total,prescription:{ex:structuredClone(session.ex),runs:[]}});
  session.ex.forEach((x,k)=>{for(let set=1;set<=x[1];set++)assessmentState.sets.push({sessionId:session.id,date:stamp,exerciseId:x[5].exerciseId,set,reps:x[2],weight:k===0?(i<3?100:80):50,rpe:7});});
  assessmentState.fatigueEvidence.push({sessionId:session.id,discipline:'strength',recordedAt:stamp,painOrDiscomfort:'no',illness:'no',unusualFatigue:i===4?'yes':'no'});
 }
 const now='2027-01-05',policy={minDeclineFraction:.1,recentDays:14};
 const proposal=assessment.assess({state:assessmentState,discipline:'strength',now,policy}).candidate;assert.ok(proposal);
 const eventContext={asOfDate:now,eventInformationUnchanged:true,eventFreeAttestation:{source:'athlete-confirmed',confirmedOn:now,noOtherEventOrTaper:true,boundPlans:JSON.stringify(state.plans)}};
 return {state,assessmentState,proposal,enabled:true,approved:true,eventContext,draftContext:{known:true,activeSessionIds:[]},now};
}
test('rescheduled occurrence and altered frozen original each fail closed',()=>{
 for(const variant of ['early','prescription']){
  const input=actualOccurrences();assert.ok(overlay.approve(input).overlay);
  const old=input.assessmentState.completedWorkouts[0],date=old.date;
  if(variant==='early'){
   const changed=training.addDays(date.slice(0,10),-1)+'T09:00:00.000Z';old.date=changed;
   for(const row of input.assessmentState.sets.filter(r=>r.sessionId===old.id))row.date=changed;
   input.assessmentState.fatigueEvidence.find(r=>r.sessionId===old.id).recordedAt=changed;
  }else old.prescription.ex[0][1]++;
  assert.equal(overlay.approve(input).overlay,null,variant);
 }
});
test('changed upcoming native prescription must not receive an adjustment from a different source prescription',()=>{
 const input=actualOccurrences(),approved=overlay.approve(input).overlay;assert.ok(approved);
 const changed=approved.changes[0],item=input.state.occurrences.find(x=>x.id===changed.occurrenceId),key=item.planId+'-w'+item.week+'-'+item.sessionId;
 const session=input.assessmentState.reviewedProgramme.weeks.flatMap(w=>w.sessions).find(s=>s.catalogueOccurrenceId===key);assert.ok(session);session.ex[0][1]++;
 const result=overlay.view({...input,overlay:approved}).sessions.find(x=>x.occurrenceId===changed.occurrenceId);
 assert.deepEqual(result.adjusted,result.original);
});
test('ambiguous duplicated historical native source sessions must fail closed',()=>{
 const input=actualOccurrences();assert.ok(overlay.approve(input).overlay);
 const historicalId=input.assessmentState.completedWorkouts[0].id,week=input.assessmentState.reviewedProgramme.weeks.find(w=>w.sessions.some(s=>s.id===historicalId));
 week.sessions.push(structuredClone(week.sessions.find(s=>s.id===historicalId)));
 assert.equal(overlay.approve(input).overlay,null);
});
