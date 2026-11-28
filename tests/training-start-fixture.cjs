const C=require('../src/programme-catalogue'),N=require('../src/native-catalogue'),T=require('../src/catalogue-training'),R=require('../src/exercise-registry'),G=require('../src/gym-equipment');
const copy=x=>JSON.parse(JSON.stringify(x));
function fixture(id='powerlifting-four-day'){
 const snapshot=T.scheduleSnapshot(C.previewProgramme(id,{referenceKg:{'competition-bench':160,'competition-squat':180,'competition-deadlift':200}}),id==='powerlifting-four-day'?[1,3,4,6]:[1,3,6],5);
 const running=T.scheduleSnapshot(C.previewProgramme('10k-two-run'),[1,5],6);
 const plans=[{id:'fictional-strength',start:'2026-11-30',snapshot},{id:'fictional-running',start:'2026-11-30',snapshot:running}];
 const programme=N.buildProgramme(plans,null,{training:T,registry:R,gym:G,inventory:G.effective(null,R.exercises,R.equipment),equipment:[],now:'2026-11-21T12:00:00Z'});
 return copy({onboardingComplete:true,customRoadmap:programme.config,reviewedProgramme:programme,activeSchedule:programme.weeks[0].sessions,activeCustomWeek:1,completedWorkouts:[{id:'preserved-prior-workout',date:'2026-11-17T12:00:00Z',prescription:{ex:[['Fictional bench',1,5,100,7]]}}],sets:[],runs:[],garminSync:{connected:false,fictionalSentinel:'retain'},settings:{fictional:'retain'}});
}
module.exports={fixture};
