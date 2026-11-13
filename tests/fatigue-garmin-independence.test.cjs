// Isolated hybrid prototype: genuine generated strength overlay and Garmin code.
// This does not exercise a live app screen, real device, or a running overlay.
const {test}=require('node:test'),assert=require('node:assert/strict');
const catalogue=require('../src/programme-catalogue'),training=require('../src/catalogue-training'),native=require('../src/native-catalogue');
const registry=require('../src/exercise-registry'),gym=require('../src/gym-equipment'),assessment=require('../src/fatigue-assessment'),overlay=require('../src/fatigue-overlay');
const fit=require('../src/garmin-workout'),garmin=require('../src/garmin-import');
test('active strength-only overlay leaves a generated Garmin workout and activity import unchanged',()=>{
 let state=training.enrol(training.empty(),catalogue.previewProgramme('lifting-foundation',{continuation:true}),'2026-11-09','lift');
 state=training.enrol(state,catalogue.previewProgramme('running-base',{continuation:true}),'2026-11-09','run');
 const p=native.buildProgramme(state.plans,null,{training,registry,gym,inventory:{items:{}},now:'2026-11-09T09:00:00Z',equipment:[],protectedWeek:()=>false});
 const n={customRoadmap:p.config,reviewedProgramme:{weeks:p.weeks},completedWorkouts:[],sets:[],runs:[],fatigueEvidence:[]};
 for(const [i,w] of [4,6,7,8,9].entries()){
  const s=p.weeks[w-1].sessions.find(x=>x.catalogueOccurrenceId==='lift-w'+w+'-A'),stamp=s.scheduledDate+'T09:00:00.000Z',total=s.ex.reduce((x,e)=>x+e[1],0);
  n.completedWorkouts.push({id:s.id,date:stamp,completedSets:total,plannedSets:total,prescription:{ex:structuredClone(s.ex),runs:[]}});
  s.ex.forEach((x,k)=>{for(let j=1;j<=x[1];j++)n.sets.push({sessionId:s.id,date:stamp,exerciseId:x[5].exerciseId,set:j,reps:x[2],weight:k===0?(i<3?100:80):50,rpe:7})});
  n.fatigueEvidence.push({sessionId:s.id,discipline:'strength',recordedAt:stamp,painOrDiscomfort:'no',illness:'no',unusualFatigue:i===4?'yes':'no'});
 }
 const now='2027-01-05',policy={minDeclineFraction:.1,recentDays:14},proposal=assessment.assess({state:n,discipline:'strength',now,policy}).candidate;assert.ok(proposal);
 const eventContext={asOfDate:now,eventInformationUnchanged:true,eventFreeAttestation:{source:'athlete-confirmed',confirmedOn:now,noOtherEventOrTaper:true,boundPlans:JSON.stringify(state.plans)}};
 const draftContext={known:true,activeSessionIds:[]},beforeState=structuredClone(state),beforeNative=structuredClone(n),approved=overlay.approve({state,assessmentState:n,proposal,enabled:true,approved:true,eventContext,draftContext,now}).overlay;assert.ok(approved,'real strength overlay required');
 const standalone=training.enrol(training.empty(),catalogue.previewProgramme('10k-two-run'),'2026-11-09','fit-run');const planned=native.buildProgramme(standalone.plans,null,{training,registry,gym,inventory:{items:{}},now:'2026-11-09T09:00:00Z',equipment:[],protectedWeek:()=>false});const run=planned.weeks[0].sessions.find(x=>x.runs.length),steps=run.runs[0].steps;assert.ok(steps.every(s=>s.distanceKm>0));
 const encode=()=>Buffer.from(fit.encodeWorkout({name:run.name,steps,createdAt:Date.UTC(2027,0,5)}));const originalFIT=encode();
 const view=overlay.view({state,assessmentState:n,overlay:approved,enabled:true,eventContext,draftContext,now});assert.ok(view.sessions.some(x=>JSON.stringify(x.original)!==JSON.stringify(x.adjusted)));for(const x of view.sessions.filter(x=>x.occurrenceId.startsWith('run/')))assert.deepEqual(x.adjusted,x.original);
 assert.deepEqual(encode(),originalFIT,'identical generated run FIT export');
 const activity={source:'garmin-personal',sourceActivityId:'42',date:'2027-01-05T06:00:00Z',name:'Test',km:6,min:30,avgHr:150,maxHr:170,splits:[]};
 const withOverlay={...n,fatigueIntervention:approved},imported=garmin.mergeRuns(withOverlay,[{run:activity,action:'new'}]);assert.equal(imported.added,1);assert.deepEqual(imported.state.fatigueIntervention,approved);assert.deepEqual(imported.state.completedWorkouts,n.completedWorkouts);assert.deepEqual(imported.state.customRoadmap,n.customRoadmap);
 assert.deepEqual(garmin.mergeRuns(imported.state,[{run:activity,action:'new'}]).added,0);assert.deepEqual(state,beforeState);assert.deepEqual(n,beforeNative);
});
