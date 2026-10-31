const test=require('node:test'),assert=require('node:assert/strict');
const {run}=require('../scripts/test-five-scenarios.cjs'),{audit}=require('../scripts/audit-coaching-round-three.cjs');
const fixturePath='tests/fixtures/five-scenario-round-three-inputs.json',fixture=require('./fixtures/five-scenario-round-three-inputs.json');
const native=run({fixture,fixturePath}),copy=x=>JSON.parse(JSON.stringify(x));
const gate=(rows,id)=>audit(rows).gates.find(g=>g.id===id);
test('coaching audit rejects day-after-race lifting even when calendar labels claim feasibility',()=>{
 const rows=copy(native.cases),n=rows.find(r=>r.id==='N');
 assert.equal(gate(rows,'N-day-after-half-recovery-coordination').status,'pass');
 n.programme.weeks[6].sessions.find(s=>s.day.slice(0,3)==='Mon').ex.push(['Squat',2,3,125,7.5,{category:'primary'}]);
 n.programme.weeks[6].feasible=true;
 assert.equal(gate(rows,'N-day-after-half-recovery-coordination').status,'blocked');
});
test('coaching audit measures taper steps rather than trusting phase and workout names',()=>{
 const rows=copy(native.cases),k=rows.find(r=>r.id==='K');
 assert.equal(gate(rows,'K-small-taper-pace-reminders').status,'pass');
 for(const s of k.programme.weeks[11].sessions)for(const r of s.runs||[])for(const step of r.steps||[])if(step.role==='work')step.role='easy';
 assert.equal(gate(rows,'K-small-taper-pace-reminders').status,'blocked');
});
test('coaching audit keeps unsupported preparation blocked and reports generation failure',()=>{
 const rows=copy(native.cases),l=rows.find(r=>r.id==='L');
 assert.equal(gate(rows,'L-unsupported-marathon-stays-blocked').status,'pass');
 for(const week of l.programme.weeks)week.feasible=true;
 assert.equal(gate(rows,'L-unsupported-marathon-stays-blocked').status,'blocked');
 l.error={message:'controlled incomplete capture'};
 assert.equal(gate(rows,'L-native-generation').status,'blocked');
});
test('coaching audit distinguishes support-lift maintenance from a feasible but wrong objective',()=>{
 const rows=copy(native.cases),m=rows.find(r=>r.id==='M');
 assert.equal(gate(rows,'M-support-lifts-maintained').status,'pass');
 const squat=m.programme.weeks[0].sessions.flatMap(s=>s.ex||[]).find(e=>e[0]==='Squat');squat[4]=8;squat[5].trainingRole='strength';
 assert.equal(gate(rows,'M-support-lifts-maintained').status,'blocked');
});
