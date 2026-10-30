const test=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs');
const {createProfileEngine}=require('../src/coach-adapters.js');
test('editing creates a versioned proposal while preserving saved dates, split and approved state',()=>{
 const {config,engine}=createProfileEngine({...require('./athletes/profiles.cjs')[0].config,coachingPolicy:'review-v1'});
 const data={customRoadmap:config},before=JSON.stringify(data);
 const fields=['Event','Weeks','Date','Priority','Squat','Bench','Deadlift','Runs','RunGoal','Days'];
 const controls={customNoDate:{checked:false}};
 for(const key of fields)controls['custom'+key]={value:config[key==='RunGoal'?'runGoal':key.toLowerCase()]??''};
 for(const lift of ['Squat','Bench','Deadlift']){
  controls['baseline'+lift]={value:config.liftProfiles[lift].kg};controls['reps'+lift]={value:1};controls['recency'+lift]={value:'recent'};
  controls['variation'+lift]={value:'auto'};controls['lock'+lift]={checked:false};
 }
 for(const [id,value]of Object.entries({runPbDistance:10,runPbTime:'1:05:00',runPbRecency:'recent',runWeeklyKm:25}))controls[id]={value};
 const html=fs.readFileSync(require('node:path').join(__dirname,'../index.html'),'utf8');
 const source=html.slice(html.indexOf('function customConfig(){'),html.indexOf('function runningPaces(...args)'));
 const ctx=vm.createContext({LHRFCoach:require('../src/coach-engine.js'),data,customFields:fields,$:id=>controls[id],estimatedMax:engine.estimatedMax,pbSeconds:engine.pbSeconds});vm.runInContext(source,ctx);const result=ctx.customConfig();
 for(const key of ['strengthTargetDate','runningTargetDate','startDate','topSetFirst'])assert.equal(result[key],config[key],key);
 assert.equal(result.coachingRulesVersion,1);assert.equal(result.coachingPolicy,'review-v2');assert.equal(data.customRoadmap.coachingPolicy,'review-v1');assert.equal(result.runGoal,'10k');assert.equal(JSON.stringify(result.manualSplit),JSON.stringify(config.manualSplit));assert.equal(JSON.stringify(result.availableDays),JSON.stringify(config.availableDays));assert.equal(JSON.stringify(data),before);
});
