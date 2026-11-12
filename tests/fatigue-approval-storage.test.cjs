const {test}=require('node:test'),assert=require('node:assert/strict');
const catalogue=require('../src/programme-catalogue'),training=require('../src/catalogue-training'),native=require('../src/native-catalogue'),registry=require('../src/exercise-registry'),gym=require('../src/gym-equipment');
const assessment=require('../src/fatigue-assessment'),persist=require('../src/fatigue-approval-storage');
function fixture(){
 const catalogueState=training.enrol(training.empty(),catalogue.previewProgramme('lifting-foundation',{continuation:true}),'2026-11-09','r');
 const programme=native.buildProgramme(catalogueState.plans,null,{training,registry,gym,inventory:{items:{}},now:'2026-11-09T09:00:00Z',equipment:[],protectedWeek:()=>false});
 const n={customRoadmap:programme.config,reviewedProgramme:{weeks:programme.weeks},completedWorkouts:[],sets:[],runs:[],fatigueEvidence:[],checkins:[]};
 for(const [i,week] of [4,6,7,8,9].entries()){
  const s=programme.weeks[week-1].sessions.find(x=>x.catalogueOccurrenceId.endsWith('-A')),stamp=s.scheduledDate+'T09:00:00.000Z',total=s.ex.reduce((sum,x)=>sum+x[1],0);
  n.completedWorkouts.push({id:s.id,date:stamp,completedSets:total,plannedSets:total,prescription:{ex:structuredClone(s.ex),runs:[]}});
  s.ex.forEach((x,k)=>{for(let set=1;set<=x[1];set++)n.sets.push({sessionId:s.id,date:stamp,exerciseId:x[5].exerciseId,set,reps:x[2],weight:k===0?(i<3?100:80):50,rpe:7});});
  n.fatigueEvidence.push({sessionId:s.id,discipline:'strength',recordedAt:stamp,painOrDiscomfort:'no',illness:'no',unusualFatigue:i===4?'yes':'no'});
 }
 const now='2027-01-05',policy={minDeclineFraction:.1,recentDays:14},proposal=assessment.assess({state:n,discipline:'strength',now,policy}).candidate;assert.ok(proposal);
 const eventFreeAttestation={source:'athlete-confirmed',confirmedOn:now,noOtherEventOrTaper:true,boundPlans:JSON.stringify(catalogueState.plans)};
 return {native:n,catalogueState,proposal,now,eventContext:{asOfDate:now,eventInformationUnchanged:true,eventFreeAttestation},draftContext:{known:true,activeSessionIds:[]}};
}
function memory(raw){return {raw,getItem(){return this.raw},setItem(k,v){this.raw=v}};}
function args(f,storage,expectedRaw=storage.raw){return {storage,key:'synthetic',expectedRaw,catalogueState:f.catalogueState,proposal:f.proposal,enabled:true,approved:true,now:f.now,eventContext:f.eventContext,draftContext:f.draftContext};}
test('storage failure leaves records intact; retry commits one bounded overlay without programme mutation',()=>{
 const f=fixture(),raw=JSON.stringify(f.native),s=memory(raw),a=args(f,s),original=structuredClone(f.native);
 s.setItem=function(){throw Error('quota exceeded')};assert.equal(persist.approveAndSave(a).status,'failed');assert.equal(s.raw,raw);assert.deepEqual(f.native,original);
 s.setItem=function(k,v){this.raw=v};const result=persist.approveAndSave(a);assert.equal(result.status,'saved');assert.equal(result.state.fatigueIntervention.end,'2027-01-11');
 const saved=JSON.parse(s.raw);assert.ok(saved.fatigueIntervention.changes.length);delete saved.fatigueIntervention;assert.deepEqual(saved,original);assert.deepEqual(f.native,original);
 assert.equal(persist.approveAndSave({...a,expectedRaw:s.raw}).status,'conflict','never replace existing approval');
});
test('no explicit approval or disabled feature never writes; stale state is rejected',()=>{
 const f=fixture(),raw=JSON.stringify(f.native),s=memory(raw);
 for(const x of [{enabled:false},{approved:false}]){assert.equal(persist.approveAndSave({...args(f,s),...x}).status,'not-approved');assert.equal(s.raw,raw);}
 assert.equal(persist.approveAndSave({...args(f,s),expectedRaw:'{}'}).status,'conflict');assert.equal(s.raw,raw);
});
test('ambiguous storage result is not reported saved or retried blindly',()=>{
 const f=fixture(),raw=JSON.stringify(f.native),s=memory(raw);s.setItem=function(k,v){this.raw=v;throw Error('uncertain')};
 assert.equal(persist.approveAndSave(args(f,s)).status,'unknown');assert.notEqual(s.raw,raw);
 assert.equal(persist.approveAndSave({...args(f,s),expectedRaw:s.raw}).status,'conflict');
});
