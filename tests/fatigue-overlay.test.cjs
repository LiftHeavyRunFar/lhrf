const {test}=require('node:test');
const assert=require('node:assert/strict');
const catalogue=require('../src/programme-catalogue');
const training=require('../src/catalogue-training');
const overlay=require('../src/fatigue-overlay');
const native=require('../src/native-catalogue'),registry=require('../src/exercise-registry'),gym=require('../src/gym-equipment'),assessment=require('../src/fatigue-assessment');

test('all generated plans remain intact with the system disabled or source taper unknown',()=>{
 for(const entry of catalogue.listProgrammes()){
  const state=training.enrol(training.empty(),catalogue.previewProgramme(entry.id),'2026-11-09','plan');
  const before=structuredClone(state),proposal={discipline:entry.discipline==='strength'?'strength':'running',experimentalPolicy:{minDeclineFraction:.1,recentDays:14}};
  assert.equal(overlay.approve({state,assessmentState:{},proposal,enabled:true,approved:true,now:'2026-11-09'}).overlay,null,entry.id);
  const fabricated={schema:1,kind:'fatigue-overlay',discipline:proposal.discipline,approved:true,start:'2026-11-09',end:'2026-11-15',changes:[]};
  for(const enabled of [false,true])for(const item of overlay.view({state,assessmentState:{},overlay:fabricated,enabled,now:'2026-11-09'}).sessions)assert.deepEqual(item.adjusted,item.original,entry.id);
  assert.deepEqual(state,before,entry.id);
 }
});
test('approval requires enabled flag, affirmative action and current assessment evidence',()=>{
 const state=training.enrol(training.empty(),catalogue.previewProgramme('10k-two-run'),'2026-11-09','r');
 const proposal={discipline:'running',experimentalPolicy:{minDeclineFraction:.1,recentDays:14}};
 for(const [enabled,approved] of [[false,true],[true,false],[true,true]])assert.equal(overlay.approve({state,assessmentState:{},proposal,enabled,approved,now:'2026-11-09'}).overlay,null);
});
test('recovery is bounded to end of intervention and never extends it',()=>{
 const x={approved:true,start:'2026-11-09',end:'2026-11-15'};
 assert.deepEqual(overlay.recovery({overlay:x,answer:'persistent',now:'2026-11-14'}),{status:'persistent',requiresDecision:true,autoExtend:false});
 assert.deepEqual(overlay.recovery({overlay:x,answer:'recovered',now:'2026-11-15'}),{status:'recovered',requiresDecision:false,autoExtend:false});
 for(const now of ['2026-11-13','2026-11-16'])assert.equal(overlay.recovery({overlay:x,answer:'recovered',now}).status,'unknown');
 assert.equal(overlay.recovery({overlay:{...x,end:'bad'},answer:'recovered',now:'2026-11-15'}).status,'unknown');
});
test('confirmed event-free generated strength plan adjusts only eligible future workouts for seven days',()=>{
 const state=training.enrol(training.empty(),catalogue.previewProgramme('lifting-foundation',{continuation:true}),'2026-11-09','r');
 const programme=native.buildProgramme(state.plans,null,{training,registry,gym,inventory:{items:{}},now:'2026-11-09T09:00:00Z',equipment:[],protectedWeek:()=>false});
 const nativeState={customRoadmap:programme.config,reviewedProgramme:{weeks:programme.weeks},completedWorkouts:[],sets:[],runs:[],fatigueEvidence:[]};
 for(const [i,week] of [4,6,7,8,9].entries()){
  const session=programme.weeks[week-1].sessions.find(s=>s.catalogueOccurrenceId.endsWith('-A')),date=session.scheduledDate;
  const stamp=date+'T09:00:00.000Z',total=session.ex.reduce((sum,x)=>sum+x[1],0);nativeState.completedWorkouts.push({id:session.id,date:stamp,completedSets:total,plannedSets:total,prescription:{ex:structuredClone(session.ex),runs:[]}});
  session.ex.forEach((x,k)=>{for(let set=1;set<=x[1];set++)nativeState.sets.push({sessionId:session.id,date:stamp,exerciseId:x[5].exerciseId,set,reps:x[2],weight:k===0?(i<3?100:80):50,rpe:7});});
  nativeState.fatigueEvidence.push({sessionId:session.id,discipline:'strength',recordedAt:stamp,painOrDiscomfort:'no',illness:'no',unusualFatigue:i===4?'yes':'no'});
 }
 const now='2027-01-05',policy={minDeclineFraction:.1,recentDays:14},candidate=assessment.assess({state:nativeState,discipline:'strength',now,policy}).candidate;
 assert.ok(candidate,'comparable completed observations');
 const eventFreeAttestation={source:'athlete-confirmed',confirmedOn:now,noOtherEventOrTaper:true,boundPlans:JSON.stringify(state.plans)};
 const eventContext={asOfDate:now,eventInformationUnchanged:true,eventFreeAttestation},draftContext={known:true,activeSessionIds:[]},before=structuredClone(state),saved=structuredClone(nativeState);
 const result=overlay.approve({state,assessmentState:nativeState,proposal:candidate,approved:true,enabled:true,eventContext,draftContext,now});
 assert.ok(result.overlay,'eligible workouts have a temporary adjustment');assert.equal(result.overlay.end,'2027-01-11');
 const changed=overlay.view({state,assessmentState:nativeState,overlay:result.overlay,enabled:true,eventContext,draftContext,now}).sessions.filter(x=>JSON.stringify(x.original)!==JSON.stringify(x.adjusted));
 assert.ok(changed.length);for(const item of changed){assert.ok(item.date>=now&&item.date<='2027-01-11');assert.ok(item.adjusted.groups.some((g,i)=>g.sets<item.original.groups[i].sets));}
 const target=state.occurrences.find(x=>x.id===changed[0].occurrenceId),key=target.planId+'-w'+target.week+'-'+target.sessionId;
 const nativeSession=programme.weeks.flatMap(w=>w.sessions).find(s=>s.catalogueOccurrenceId===key);
 const done=structuredClone(nativeState);done.completedWorkouts.push({id:nativeSession.id,date:now+'T10:00:00Z'});
 const viewWith=(extra,ctx=draftContext)=>overlay.view({state,assessmentState:extra,overlay:result.overlay,enabled:true,eventContext,draftContext:ctx,now}).sessions.find(x=>x.occurrenceId===target.id);
 assert.deepEqual(viewWith(done).adjusted,viewWith(done).original,'completed workouts stay intact');
 assert.deepEqual(viewWith(nativeState,{known:true,activeSessionIds:[nativeSession.id]}).adjusted,changed[0].original,'active drafts stay intact');
 assert.deepEqual(viewWith(nativeState,{known:false,activeSessionIds:[]}).adjusted,changed[0].original,'unknown draft status fails closed');
 for(const item of overlay.view({state,assessmentState:nativeState,overlay:result.overlay,enabled:true,eventContext:{...eventContext,asOfDate:'2027-01-12'},draftContext,now:'2027-01-12'}).sessions)assert.deepEqual(item.adjusted,item.original);
 for(const item of overlay.view({state,assessmentState:nativeState,overlay:result.overlay,enabled:true,eventContext:{...eventContext,eventInformationUnchanged:false},draftContext,now}).sessions)assert.deepEqual(item.adjusted,item.original);
 assert.deepEqual(state,before);assert.deepEqual(nativeState,saved);
});
