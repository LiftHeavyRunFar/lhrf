// Isolated QA evidence capture. No app writes, no production changes.
const test=require('node:test'),assert=require('node:assert/strict');
const {run}=require('../scripts/test-five-scenarios.cjs');
const {audit}=require('../scripts/audit-five-scenarios.cjs');
test('capture five native-engine profiles and their actual week-by-week prescriptions',()=>{
 const report=run();assert.equal(report.synthetic,true);assert.equal(report.cases.length,5);
 const evaluation=audit(report);
 const evidence=report.cases.map(c=>({
  id:c.id,name:c.name,weeks:c.programme?.weeks.length,
  first:c.summary?.[0],last:c.summary?.at(-1),
  infeasible:c.summary?.filter(w=>!w.feasible).map(w=>w.week),
  review:c.review?.status,errors:c.error||null,
  gates:evaluation.cases.find(x=>x.id===c.id)?.gates.map(g=>({id:g.id,status:g.status}))
 }));
 console.log('LHRF_QA_ACTUAL_GENERATED_PRESCRIPTIONS='+JSON.stringify(evidence));
 assert.ok(evidence.every(e=>e.weeks>0&&!e.errors));
 // This is an evidence capture, NOT a commercial acceptance gate.
 // Preserve reported blocked outcomes for independent coaching review.
});
