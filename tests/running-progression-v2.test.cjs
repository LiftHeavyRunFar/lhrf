const assert=require('node:assert/strict');
const {runningPrescription}=require('../src/prescriptions-v2.js');
const total=(week,phase='foundation',priority='Running')=>runningPrescription(week,phase,3,priority).reduce((n,r)=>n+r.minutes,0);
assert.ok(total(2)>total(1));
assert.ok(total(3)>total(2));
assert.ok(total(5)>total(1),'Second block must not restart at first-block workload');
assert.ok(total(9)>total(5),'Third block must build on second block');
assert.ok(total(4,'recovery')<total(3));
assert.ok(total(8,'recovery')<total(7,'development'));
assert.ok(total(11,'realisation')<total(10,'intensification'));
assert.equal(runningPrescription(5,'development',0,'Running').length,0);
for(let w=1;w<=52;w++){
 const sessions=runningPrescription(w,'development',3,'Running');
 assert.ok(sessions.every(s=>Number.isInteger(s.minutes)&&s.minutes>0));
 assert.ok(sessions.reduce((n,s)=>n+s.minutes,0)<=total(1)*1.6,'Guard against excessive progression');
}
console.log('PASS running progression across blocks, recovery reductions and bounded volumes');
