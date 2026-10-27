// A disposable, separately namespaced copy of the real app. No production records read/written.
const fs=require('node:fs'),path=require('node:path');
const root=path.join(__dirname,'..');
let html=fs.readFileSync(path.join(root,'index.html'),'utf8');
html=html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,block=>block.includes('navigator.serviceWorker.register')?'':block);
html=html.replace(/<link[^>]+rel="manifest"[^>]*>/g,'');
html=html.replace(/<script src="\.\/([^"?]+)"><\/script>/g,(_,file)=>'<script>'+fs.readFileSync(path.join(root,file),'utf8').replaceAll('</script','<\\/script')+'</script>');
html=html.replace('<link rel="stylesheet" href="./src/workout-tools.css">','<style>'+fs.readFileSync(path.join(root,'src/workout-tools.css'),'utf8')+'</style>');
// Namespace every app-owned key, including timers, remembered screen and optional connections.
html=html.replaceAll('lhrf_', 'lhrf_demo_').replaceAll('lhrf-', 'lhrf-demo-');
const seed=`<script>
(function(){
const KEY='lhrf_demo_beta_v1118_clean',PREFIXES=['lhrf_demo_','lhrf-demo-'];
window.resetWorkoutDemo=function(){for(const store of [localStorage,sessionStorage])for(const key of Object.keys(store))if(PREFIXES.some(p=>key.startsWith(p)))store.removeItem(key);location.reload()};
const day=new Date(),date=day.toLocaleDateString('en-CA',{timeZone:'Europe/London'}),weekday=day.toLocaleDateString('en-GB',{timeZone:'Europe/London',weekday:'short'});
if(!localStorage.getItem(KEY)){
const steps=[{label:'Warm-up',distanceKm:.05,pace:'8:00/km to 9:00/km'},{label:'Interval 1 of 2',distanceKm:.10,pace:'6:00/km to 6:40/km'},{label:'Walking recovery',distanceKm:.05,pace:'15:00/km'},{label:'Interval 2 of 2',distanceKm:.10,pace:'6:00/km to 6:40/km'},{label:'Cool-down',distanceKm:.05,pace:'8:00/km to 9:00/km'}];
const config={variations:{Squat:{choice:'auto'},Bench:{choice:'auto'},Deadlift:{choice:'auto'}},liftProfiles:{Squat:{kg:100,reps:1,recency:'recent'},Bench:{kg:100,reps:1,recency:'recent'},Deadlift:{kg:120,reps:1,recency:'recent'}},weeks:4,startDate:date,noDate:true,event:'general',priority:'Bench',squat:1,bench:2,deadlift:1,runs:2,rungoal:'fitness',days:4,availableDays:['Mon','Tue','Thu','Sat'],maxes:{bench:100,squat:100,deadlift:120},runProfile:{distance:5,seconds:1800,weeklyKm:12,recency:'recent'},baselines:{Bench:100,Squat:100,Deadlift:120},coachingPolicy:'review-v2',exerciseSelectionVersion:2};
const session={id:'demo-today',day:weekday,name:'Bench + Quick treadmill test',ex:[['Bench',1,5,60,7,{role:'top'}],['Bench',2,5,50,6.5,{role:'backoff',topIndex:0}],['Chest-supported row',2,10,20,7,{role:'accessory'}]],runs:[{name:'Quick treadmill test',role:'quality-run',distanceKm:.35,minutes:3,pace:'6:00/km to 9:00/km',steps}]};
localStorage.setItem(KEY,JSON.stringify({onboardingComplete:true,demoScope:true,customRoadmap:config,activeCustomWeek:1,activeSchedule:[session],sets:[],runs:[],checkins:[],decisions:[],completedWorkouts:[],plannedRuns:[],overrides:{},goals:{strength:'General strength',running:'General fitness'},readinessDay:date,runEnvironment:'treadmill'}));
}
sessionStorage.setItem('lhrf_demo_onboarding_test_last_tab_v194','today');
})();
</script>`;
html=html.replace('<script>',seed+'<script>');
const banner='<aside id="demoNotice" style="max-width:720px;margin:auto;padding:10px 16px;background:#0a2432;border-bottom:1px solid #245066;font:12px/1.4 system-ui;color:#d6edf5;display:flex;gap:12px;align-items:center;justify-content:space-between"><span><b>TEST DRIVE</b> · Sample data only<br><span style="color:#91b7c6">Short laps for quick testing. Your training records are separate.</span></span><button type="button" onclick="resetWorkoutDemo()" style="font-size:11px;padding:8px 10px;white-space:nowrap">Reset demo</button></aside><style>body[data-treadmill-focus="true"] #demoNotice{display:none!important}</style>';
html=html.replace('<body>','<body>'+banner).replace('<title>Lift Heavy. Run Far.</title>','<title>LHRF · Workout test drive</title>');
fs.writeFileSync(path.join(root,'workout-demo.html'),html);console.log('Built workout-demo.html with isolated sample data.');
