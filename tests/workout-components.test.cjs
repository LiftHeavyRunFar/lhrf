const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const html=fs.readFileSync(require('node:path').join(__dirname,'../index.html'),'utf8');
const helpers=html.slice(html.indexOf('function workoutParts('),html.indexOf('function populate(){',html.indexOf('function workoutParts(')));
function context(logs=[]){const c=vm.createContext({data:{completedWorkouts:logs,activeCustomWeek:1}});vm.runInContext(helpers,c);return c}
const combined={id:'tue',day:'Tue',name:'Bench + Intervals',ex:[['Bench',1,5,100,8]],runs:[{name:'Intervals',distanceKm:4}]};
test('double-day components preserve original programme and have independently completable identities',()=>{
 const c=context();c.session=JSON.parse(JSON.stringify(combined));const parts=vm.runInContext('workoutParts(session)',c);
 assert.equal(parts.length,2);assert.equal(parts[0].id,'tue::strength');assert.equal(parts[1].id,'tue::run');assert.equal(parts[0].runs.length,0);assert.equal(parts[1].ex.length,0);assert.deepEqual(JSON.parse(JSON.stringify(c.session)),combined);
 c.data.completedWorkouts.push({id:'tue::strength',week:1});assert.equal(c.sessionCompleted(parts[0]),true);assert.equal(c.sessionCompleted(parts[1]),false);assert.equal(c.sessionCompleted(c.session),false);
 c.data.completedWorkouts.push({id:'tue::run',week:1});assert.equal(c.sessionCompleted(c.session),true);
});
test('legacy combined completion covers both components without resetting historical records',()=>{
 const c=context([{id:'tue',week:1}]);assert.equal(c.sessionCompleted(combined),true);for(const p of c.workoutParts(combined))assert.equal(c.sessionCompleted(p),true);
 c.data.activeCustomWeek=2;assert.equal(c.sessionCompleted(combined),false);
});
test('single modality sessions retain their original identity',()=>{
 const c=context();const single={...combined,id:'fri',runs:[]};assert.equal(c.workoutParts(single)[0],single);
});
