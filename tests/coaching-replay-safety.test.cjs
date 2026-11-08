const test=require('node:test'),assert=require('node:assert/strict');
const {audit}=require('../scripts/audit-five-scenarios.cjs');
const {checkSafety}=require('../scripts/coaching-replay-safety.cjs');
const fixture=require('./fixtures/five-scenario-engine-inputs.json');
// The exact five-blocked/ten-gate contract describes the frozen production
// policy. Run the actual capture checks against isolated production modules,
// then challenge that capture with the current safety validator. Current-policy
// dose/recovery controls are independently covered by runtime assurance.
const fs=require('node:fs'),path=require('node:path'),Module=require('node:module');
const legacy=require('../scripts/compare-runtime-coaching.cjs').legacyEngine();
const capturePath=require.resolve('../scripts/test-five-scenarios.cjs'),isolated=new Module(capturePath,module);
const fromCapture=Module.createRequire(capturePath);
isolated.filename=capturePath;isolated.paths=Module._nodeModulePaths(path.dirname(capturePath));
isolated.require=request=>request.startsWith('../src/')?require(path.join(legacy.root,'src',request.slice('../src/'.length))):fromCapture(request);
isolated._compile(fs.readFileSync(capturePath,'utf8'),capturePath);
const {run}=isolated.exports;
const capture=run({fixture}),review=audit(capture),clone=x=>JSON.parse(JSON.stringify(x));
const verify=(c=capture,r=review)=>checkSafety(c,r,fixture,{frozenFive:true});
test('engine safety passes while all five programme outcomes and ten gates stay blocked',()=>{
 assert.equal(verify().passed,true);assert.equal(verify().athleteApproval,false);
 assert.equal(review.summary.blocked,5);assert.equal(review.summary.blockedGates,10);
 assert.ok(review.cases.every(c=>c.status==='blocked'));
});
for(const [name,change]of [
 ['unsafe week approval',c=>{c.cases[0].programme.weeks[0].feasible=true}],
 ['unsafe session approval',c=>{c.cases[0].programme.weeks[0].sessions[0].timeBudget.feasible=true}],
 ['raised hard cap',c=>{c.cases[0].programme.config.visitConstraints.minutes.Tue=999}],
 ['missing time proof',c=>{delete c.cases[0].programme.weeks[0].sessions[0].timeBudget}],
 ['missing restriction',c=>{c.cases[0].programme.weeks[0].sessions[0].constraintIssues=[]}],
 ['cleared recovery evidence',c=>{c.cases[3].programme.config.recoveryEvidence.cleared=true}],
 ['invented event permission',c=>{c.cases[1].programme.config.visitConstraints.eventDays['2027-03-21'].confirmed=true}],
 ['replay generation error',c=>{c.cases[0].error={message:'generation failed'}}],
 ['incomplete replay',c=>{c.cases.pop()}],
 ['incomplete horizon',c=>{c.cases[0].programme.weeks.pop()}],
 ['missing parity proof',c=>{delete c.cases[0].checks.nativeSessionParity}]
])test('safety fails for '+name,()=>{const c=clone(capture);change(c);assert.equal(verify(c).passed,false)});
for(const [name,change]of [
 ['blocked programme reported approved',r=>{r.cases[0].status='pass'}],
 ['missing event restriction',r=>{r.cases[1].inputReviews=[]}],
 ['missing recovery restriction',r=>{r.cases[3].inputReviews=[]}],
 ['unexpected coaching failure',r=>{r.cases[0].gates[0].status='blocked'}],
 ['erased blocked gate',r=>{r.cases[0].gates=r.cases[0].gates.filter(g=>g.status!=='blocked')}]
])test('safety fails for '+name,()=>{const r=clone(review);change(r);assert.equal(verify(capture,r).passed,false)});
