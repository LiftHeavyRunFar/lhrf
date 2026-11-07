// Current behavior characterizations. Passing is reproduction, not proposed-policy acceptance.
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {cases}=require('./fixtures/recovery-policy-proposal-inputs.cjs');
const {characterize,build}=require('../docs/recovery-policy-proposal/characterize-current.cjs');
const preparation=require('../src/running-preparation');
const caseBy=id=>cases().find(c=>c.id===id);
test('recovery proposal: current generation is deterministic and cannot mutate the fictional observations or athlete histories',()=>{
 for(const c of cases()){const source=JSON.stringify(c),first=characterize(c);assert.deepEqual(characterize(c),first,c.id);assert.equal(JSON.stringify(c),source,c.id);assert.equal(first.generatedWeeks,c.input.config.weeks);assert.equal(first.weeks.length,4);}
});
test('recovery proposal IA03 characterization: normal report resolves running but a later first-fortnight pass still clips unaffected bench in A B C',()=>{
 for(const id of ['A','B','C']){const c=characterize(caseBy(id+'-fast')),w=c.weeks[0];assert.notEqual(w.phase,'Recovery',id);assert.ok(w.bench.length,id);assert.ok(w.bench.every(e=>e.firstFortnightClip&&e.sets===2&&e.reps===2&&e.rpe===5.5),id);}
});
test('recovery proposal IA04 characterization: persistent context-only lower fatigue expires for running by week3 in A B C',()=>{
 for(const id of ['A','B','C']){const c=characterize(caseBy(id+'-slow')),w=c.weeks[2];assert.ok(w.workKm>0,id);if(id!=='B')assert.ok(w.lower.some(e=>e.reviewRequired),id);else assert.ok(w.lower.every(e=>!e.reviewRequired&&e.sets===3&&e.reps===6&&e.rpe===7),id);}
});
test('recovery proposal routing control: paired current evidence suppresses week3 running quality whereas context-only does not',()=>{
 for(const id of ['A','B','C'])for(const trajectory of ['slow','worsening','partial']){
  const context=characterize(caseBy(id+'-'+trajectory)),paired=characterize(caseBy(id+'-'+trajectory+'-paired'));
  assert.ok(context.weeks[2].workKm>0,id+' '+trajectory);assert.equal(paired.weeks[2].workKm,0,id+' '+trajectory);if(id!=='B')assert.ok(paired.weeks[2].lower.some(e=>e.reviewRequired),id+' '+trajectory);else assert.ok(paired.weeks[2].lower.every(e=>!e.reviewRequired&&e.rpe===7),id+' '+trajectory);
 }
});
test('recovery proposal characterization: no new report is required for event-only running to resume quality after21 days',()=>{
 for(const id of ['A','B','C']){const c=characterize(caseBy(id+'-uncertain'));assert.equal(c.weeks[0].workKm,0,id);assert.ok(c.weeks[2].workKm>0,id);}
});
test('recovery proposal positive control: current normal-report clearance already requires a valid post-event nonfuture date',()=>{
 const config=caseBy('C-uncertain').input.config,now=()=>Date.parse('2026-11-07T12:00:00Z'),resolved=(reportedAt,event='2026-11-01')=>preparation.recoveryContext({...config,runningHistory:{...config.runningHistory,recentMarathonDate:event},recoveryContext:{status:'normal',...(reportedAt?{reportedAt}:{})}},1,{now}).marathonRecoveryResolved;
 assert.equal(resolved('2026-11-06'),true);assert.equal(resolved(),false);assert.equal(resolved('2026-11-08'),false);assert.equal(resolved('2026-10-31'),false);assert.equal(resolved('2026-11-06','2026-11-20'),false);
});
test('recovery proposal preservation: fictional recovery variants retain original future target-event identities',()=>{
 for(const c of cases()){const result=characterize(c),expected=[['strength',c.input.config.strengthTargetDate],['running',c.input.config.runningTargetDate]].filter(([,date])=>date).map(([type,date])=>({type,date}));assert.deepEqual(result.targetEvents.map(({type,date})=>({type,date})),expected,c.id);}
});
test('recovery proposal artifact preserves current engine output and explicitly declares proposed semantics are unimplemented',()=>{
 const saved=JSON.parse(fs.readFileSync(path.join(__dirname,'../docs/recovery-policy-proposal/current-characterization.json'),'utf8'));assert.deepEqual(build(),saved);assert.equal(saved.proposalOnly,true);assert.equal(saved.proposedPolicyImplemented,false);
});
