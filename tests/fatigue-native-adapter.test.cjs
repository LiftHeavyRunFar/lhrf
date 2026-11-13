const {test}=require('node:test'),assert=require('node:assert/strict');
const catalogue=require('../src/programme-catalogue'),training=require('../src/catalogue-training'),native=require('../src/native-catalogue'),registry=require('../src/exercise-registry'),gym=require('../src/gym-equipment');
const assessment=require('../src/fatigue-assessment'),overlay=require('../src/fatigue-overlay'),adapter=require('../src/fatigue-native-adapter');
function fixture(){
 const state=training.enrol(training.empty(),catalogue.previewProgramme('lifting-foundation',{continuation:true}),'2026-11-09','r');
 const p=native.buildProgramme(state.plans,null,{training,registry,gym,inventory:{items:{}},now:'2026-11-09T09:00:00Z',equipment:[],protectedWeek:()=>false});
 const n={customRoadmap:p.config,reviewedProgramme:{weeks:p.weeks},completedWorkouts:[],sets:[],runs:[],fatigueEvidence:[],featureFlags:{fatigueIntervention:true}};
 for(const [i,week] of [4,6,7,8,9].entries()){
  const s=p.weeks[week-1].sessions.find(x=>x.catalogueOccurrenceId.endsWith('-A')),stamp=s.scheduledDate+'T09:00:00.000Z',total=s.ex.reduce((sum,x)=>sum+x[1],0);
  n.completedWorkouts.push({id:s.id,date:stamp,completedSets:total,plannedSets:total,prescription:{ex:structuredClone(s.ex),runs:[]}});
  s.ex.forEach((x,k)=>{for(let set=1;set<=x[1];set++)n.sets.push({sessionId:s.id,date:stamp,exerciseId:x[5].exerciseId,set,reps:x[2],weight:k===0?(i<3?100:80):50,rpe:7});});
  n.fatigueEvidence.push({sessionId:s.id,discipline:'strength',recordedAt:stamp,painOrDiscomfort:'no',illness:'no',unusualFatigue:i===4?'yes':'no'});
 }
 const now='2027-01-05',proposal=assessment.assess({state:n,discipline:'strength',now,policy:{minDeclineFraction:.1,recentDays:14}}).candidate;assert.ok(proposal);
 const eventFreeAttestation={source:'athlete-confirmed',confirmedOn:now,noOtherEventOrTaper:true,boundPlans:JSON.stringify(state.plans)};
 const eventContext={asOfDate:now,eventInformationUnchanged:true,eventFreeAttestation},draftContext={known:true,activeSessionIds:[]};
 const approvedOverlay=overlay.approve({state,assessmentState:n,proposal,enabled:true,approved:true,eventContext,draftContext,now}).overlay;assert.ok(approvedOverlay);
 const change=approvedOverlay.changes[0],occ=state.occurrences.find(o=>o.id===change.occurrenceId),key=occ.planId+'-w'+occ.week+'-'+occ.sessionId;
 const session=p.weeks.flatMap(w=>w.sessions).find(s=>s.catalogueOccurrenceId===key);assert.ok(session);
 const f={native:n,session,approvedOverlay,now,eventContext,draftContext,mainKey:'main',overlayKey:'overlay'};
 f.storage={getItem(key){if(key==='main')return JSON.stringify(f.native);if(key==='overlay')return JSON.stringify(f.approvedOverlay);if(!f.draftContext.known)throw Error('unavailable');if(key==='lhrf_fresh_beta_live_v1114'&&f.draftContext.activeSessionIds.length)return JSON.stringify({id:f.draftContext.activeSessionIds[0]});return null}};
 return f;
}
test('applies scoped native strength set adjustment at read time with auditable original and unchanged programme',()=>{
 const f=fixture(),before=structuredClone(f.native),out=adapter.resolve(f);assert.equal(out.adjusted,true);
 assert.deepEqual(out.audit.original.ex,f.session.ex);assert.deepEqual(out.audit.adjusted.ex,out.session.ex);
 assert.ok(out.session.ex.some((x,i)=>x[1]<f.session.ex[i][1]));assert.deepEqual(f.native,before);
});
test('disabled, changed, completed, expired or unknown context always returns original',()=>{
 for(const mutate of [f=>f.native.featureFlags={},f=>f.session.ex[0][1]++,f=>f.draftContext={known:false,activeSessionIds:[]},f=>f.draftContext.activeSessionIds.push(f.session.id),f=>f.native.completedWorkouts.push({id:f.session.id,date:f.now+'T10:00:00Z'}),f=>f.eventContext.eventInformationUnchanged=false,f=>{f.now='2027-01-12';f.eventContext.asOfDate=f.now}]){
  const f=fixture();mutate(f);const before=structuredClone(f.session),out=adapter.resolve(f);assert.equal(out.adjusted,false);assert.deepEqual(out.session,before);
 }
});
test('draft read fails closed on unavailable or corrupt storage and preserves valid IDs',()=>{
 const good={getItem:k=>k.endsWith('_pendingRun')?JSON.stringify({parentId:'run-1'}):JSON.stringify({id:'workout-1'})};
 assert.deepEqual(adapter.draftContext(good),{known:true,activeSessionIds:['workout-1','run-1']});
 for(const storage of [{getItem(){throw Error('unavailable')}},{getItem:()=>'{'}])assert.equal(adapter.draftContext(storage).known,false);
});
test('missing workout fails closed without an exception',()=>{
 assert.deepEqual(adapter.resolve({session:null}),{session:null,adjusted:false});
});
test('revoked overlay and stale main data are never applied from cached state',()=>{
 const f=fixture(),read=f.storage.getItem;
 f.storage.getItem=key=>key==='overlay'?JSON.stringify({schema:1,kind:'fatigue-overlay-revocation'}):read(key);
 assert.equal(adapter.resolve(f).adjusted,false);
 f.storage.getItem=key=>key==='main'?'{}':read(key);assert.equal(adapter.resolve(f).adjusted,false);
});
