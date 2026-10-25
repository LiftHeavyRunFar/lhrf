const assert=require('node:assert/strict');
const {coordinateWeek}=require('../src/hybrid-v2.js');
const {strengthPrescription}=require('../src/prescriptions-v2.js');
function fixture(priority){
 const squat=strengthPrescription('squat',7,'intensification',180,'Squat');
 const deadlift=strengthPrescription('deadlift',7,'intensification',220,'Squat');
 return {priority,week:{week:7,phase:'intensification',
  strengths:[squat,deadlift],runs:[{type:'quality',minutes:40},{type:'easy',minutes:30},{type:'long',minutes:70}],
  strengthStress:squat.totalStress+deadlift.totalStress,runningMinutes:140}};
}
for(const priority of ['Running','Squat','Balanced']){
 const {week,...c}=fixture(priority),original=JSON.stringify(week);
 const output=coordinateWeek(c,week);
 assert.equal(JSON.stringify(week),original,'Must not mutate input');
 assert.equal(output.hybrid.conflict,true);
 assert.equal(output.hybrid.approvalRequired,true);
 assert.equal(output.runs.find(r=>r.type==='long').minutes,70,'Long run protected');
 assert.ok(output.hybrid.changes.length>0);
 assert.equal(JSON.stringify(output.strengths),JSON.stringify(week.strengths),'Pending proposals never edit strength prescriptions');
 assert.equal(JSON.stringify(output.runs),JSON.stringify(week.runs),'Pending proposals never edit running prescriptions');
 assert.equal(output.strengthStress,Math.round(week.strengthStress*10)/10);
 assert.equal(output.runningMinutes,week.runningMinutes);
 assert.ok(output.hybrid.changes.every(change=>priority==='Running'?change.kind==='trim-lower-backoffs':change.kind==='trim-quality-run'));
 assert.equal(output.strengthStress,Math.round(output.strengths.reduce((n,s)=>n+s.totalStress,0)*10)/10);
 assert.equal(output.runningMinutes,output.runs.reduce((n,r)=>n+r.minutes,0));
 console.log('PASS',priority,'priority');
}
const noConflict=coordinateWeek({priority:'Running'},{week:1,strengths:[],runs:[{type:'easy',minutes:25}],strengthStress:0,runningMinutes:25});
assert.equal(noConflict.hybrid.approvalRequired,false);
console.log('PASS no conflict');
