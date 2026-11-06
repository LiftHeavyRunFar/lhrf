// Every performance below is fictional. No owner loads or retrospective RPE assumed.
const registry=require('../src/exercise-registry'),coach=require('../src/coach-engine');
function fixture(){
 const inventory=require('./equipment-fixtures.cjs').fullInventory(),meta=(name,role,purpose)=>({...registry.identity(name,inventory),role,...(purpose?{benchRole:purpose}:{})});
 const top=['Bench',1,1,130,8,meta('Bench','top','heavy')],back=['Bench',2,3,110,7,meta('Bench','backoff','heavy')];
 const session={id:'replacement-heavy',day:'Friday',name:'Heavy bench + support',scheduledDate:'2026-11-06',ex:[top,back,['Chest-supported row',2,10,30,7,meta('Chest-supported row','accessory')]],runs:[]};
 const historical=(date,purpose,weight,reps)=>({id:'archived-'+purpose,date:date+'T06:30:00Z',name:'Bench',week:99,prescription:{ex:[['Bench',1,reps,weight,8,meta('Bench','top',purpose)],['Bench',3,3,weight-20,7,meta('Bench','backoff',purpose)]]},completedSets:4});
 const heavy=historical('2026-10-30','heavy',137.25,2),volume=historical('2026-11-03','volume',121.75,5);
 const sets=[heavy,volume].flatMap(w=>[{sessionId:w.id,session:w.name,date:w.date,week:99,exercise:'Bench',...meta('Bench','top'),set:1,weight:w.prescription.ex[0][3],reps:w.prescription.ex[0][2],rpe:8.5},...[1,2,3].map(set=>({sessionId:w.id,session:w.name,date:w.date,week:99,exercise:'Bench',...meta('Bench','backoff'),set,weight:w.prescription.ex[1][3],reps:3,rpe:7.5}))]);
 return {onboardingComplete:true,readinessDay:'2026-11-06',customRoadmap:coach.approveProgrammeConfig({...require('../programmes/november-2026.json')}),activeCustomWeek:2,activeSchedule:[session],equipmentInventory:inventory,sets,runs:[{date:'2026-10-31T08:00:00Z',km:5,min:34,garminActivityId:'synthetic-retained',sessionId:'earlier-run'}],completedWorkouts:[heavy,volume],plannedRuns:[{id:'earlier-run',activityId:'synthetic-retained'}],checkins:[],decisions:[],overrides:{},goals:{strength:'Bench',running:'10K PB'}};
}
module.exports={fixture};
