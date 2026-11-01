const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),crypto=require('node:crypto');
const fixture=require('./fixtures/stage-two-new-athletes.json'),{run}=require('../scripts/test-five-scenarios.cjs'),{inspect}=require('../scripts/audit-stage-two.cjs');
test('Stage 2 inputs are the five frozen new profiles, not rewritten captures or benchmark athletes',()=>{
 assert.equal(crypto.createHash('sha256').update(fs.readFileSync('tests/fixtures/stage-two-new-athletes.json')).digest('hex'),'5a0e83d10a5aab146db43ad2d7170be0cd2ff97888de412a809161099a4e190a');
 assert.deepEqual(fixture.cases.map(p=>p.id),['P','Q','R','S','T']);
 assert.equal(fixture.cases.reduce((n,p)=>n+p.config.weeks,0),64);
 for(const p of fixture.cases)assert.equal(p.config.manualSplit,undefined);
});
test('all 64 new athlete-weeks are native deterministic prescriptions with immutable inputs and histories',()=>{
 const before=JSON.stringify(fixture),capture=run({fixture,fixturePath:'tests/fixtures/stage-two-new-athletes.json'});
 for(const r of capture.cases){assert.equal(r.error,undefined,r.error?.message);assert.equal(r.programme.weeks.length,r.input.weeks);assert.ok(Object.values(r.checks).every(Boolean));}
 assert.equal(JSON.stringify(fixture),before);
 // Do not assert that new programmes pass coaching review or require known defects to persist.
});
function capture(session,feasible=true,patch={}){const input={startDate:'2026-11-02',visitConstraints:{eventDays:{}},...patch};return {id:'controlled',input,programme:{config:input,weeks:[{week:1,feasible,sessions:[session],warnings:[]} ]}}}
test('independent inspector rejects an explicitly confirmed event which exceeds its actual allowance',()=>{
 const r=capture({day:'Sun',eventDate:'2026-11-08',eventPermission:{confirmed:true},timeBudget:{totalMinutes:140},runs:[],ex:[]},true,{visitConstraints:{eventDays:{'2026-11-08':{confirmed:true,minutes:150,logisticsMinutes:20}}}});
 assert.equal(inspect([r]).findings[0].kind,'event-window-exceeded');
 r.input.visitConstraints.eventDays['2026-11-08'].minutes=160;
 assert.equal(inspect([r]).findings.length,0);
});
test('unknown or unfit visit correctly blocked by the engine is not labelled false feasibility',()=>{
 const s={day:'Tue',runs:[],ex:[],timeBudget:{feasible:false,visits:[{totalMinutes:70,capMinutes:60}]}};
 assert.equal(inspect([capture(s,false)]).findings.length,0);
 assert.ok(inspect([capture(s,true)]).findings.some(x=>x.kind==='false-visit-feasibility'));
});
test('recovery inspection uses actual day offsets, including the partial recovery week',()=>{
 const s={day:'Mon',runs:[],ex:[['Squat',1,3,100,8,{category:'primary'}]]},r=capture(s,true,{orderedGoals:[{sport:'strength',date:'2026-10-24',recoveryDays:10}]});
 const f=inspect([r]).findings.find(x=>x.kind==='hard-work-within-requested-recovery');assert.equal(f.daysAfterEvent,9);
 s.ex[0][4]=5.5;assert.equal(inspect([r]).findings.length,0);
});
