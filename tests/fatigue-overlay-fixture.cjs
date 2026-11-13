const {test}=require('node:test'),assert=require('node:assert/strict');
const catalogue=require('../src/programme-catalogue'),training=require('../src/catalogue-training'),native=require('../src/native-catalogue'),registry=require('../src/exercise-registry'),gym=require('../src/gym-equipment');
const assessment=require('../src/fatigue-assessment');
function fixture(){
 const c=training.enrol(training.empty(),catalogue.previewProgramme('lifting-foundation',{continuation:true}),'2026-11-09','r');
 const p=native.buildProgramme(c.plans,null,{training,registry,gym,inventory:{items:{}},now:'2026-11-09T09:00:00Z',equipment:[],protectedWeek:()=>false});
 const n={customRoadmap:p.config,reviewedProgramme:{weeks:p.weeks},completedWorkouts:[],sets:[],runs:[],fatigueEvidence:[],featureFlags:{fatigueIntervention:true}};
 for(const [i,week] of [4,6,7,8,9].entries()){
  const s=p.weeks[week-1].sessions.find(x=>x.catalogueOccurrenceId.endsWith('-A')),stamp=s.scheduledDate+'T09:00:00.000Z',total=s.ex.reduce((sum,x)=>sum+x[1],0);
  n.completedWorkouts.push({id:s.id,date:stamp,completedSets:total,plannedSets:total,prescription:{ex:structuredClone(s.ex),runs:[]}});
  s.ex.forEach((x,k)=>{for(let set=1;set<=x[1];set++)n.sets.push({sessionId:s.id,date:stamp,exerciseId:x[5].exerciseId,set,reps:x[2],weight:k===0?(i<3?100:80):50,rpe:7});});
  n.fatigueEvidence.push({sessionId:s.id,discipline:'strength',recordedAt:stamp,painOrDiscomfort:'no',illness:'no',unusualFatigue:i===4?'yes':'no'});
 }
 const now='2027-01-05',proposal=assessment.assess({state:n,discipline:'strength',now,policy:{minDeclineFraction:.1,recentDays:14}}).candidate;assert.ok(proposal);
 const eventContext={asOfDate:now,eventInformationUnchanged:true,eventFreeAttestation:{source:'athlete-confirmed',confirmedOn:now,noOtherEventOrTaper:true,boundPlans:JSON.stringify(c.plans)}};
 return {n,c,now,proposal,eventContext};
}
function memory(raw){const values=new Map([['main',raw]]),writes=[];return {values,writes,getItem:k=>values.has(k)?values.get(k):null,setItem(k,v){writes.push(k);values.set(k,v)},removeItem:k=>values.delete(k)};}
function lock(){let held=false;return {async request(name,opts,fn){if(held)return fn(null);held=true;try{return await fn({name})}finally{held=false}}};}
function args(f,s,l){return {storage:s,locks:l,mainKey:'main',overlayKey:'overlay',expectedRaw:JSON.stringify(f.n),proposal:f.proposal,approved:true,now:f.now,eventContext:f.eventContext};}
module.exports={fixture,memory,args};
