// Pre-implementation behavioural acceptance tests. Synthetic observations are explicitly
// marked comparable for test purposes; current catalogue logs do not establish that.
// Numeric differences are deliberately large test examples, not clinical thresholds.
const assert = require('node:assert/strict');
const {test} = require('node:test');
const fs = require('node:fs');
const catalogue = require('../src/programme-catalogue.js');
const training = require('../src/catalogue-training.js');
const modulePath = require('node:path').join(__dirname,'../src/fatigue-intervention.js');
const fatigue = fs.existsSync(modulePath) ? require(modulePath) : null;
const blocked = fatigue ? {} : {skip:'BLOCKED: intervention module and evidence capture not implemented'};
const start='2026-11-09';
const now='2026-12-14';
const clone=x=>structuredClone(x);
const enrol=(id, planId=id)=>training.enrol(training.empty(),catalogue.previewProgramme(id),start,planId);
const hybrid=()=>training.enrol(enrol('powerlifting-four-day','lift'),catalogue.previewProgramme('10k-two-run'),start,'run');
const obs=(discipline,date,value,extra={})=>({date,discipline,completed:true,comparable:true,metric:discipline,value,contextKey:'same-protocol',confidence:'reliable',...extra});
const strong=(discipline)=>({observations:[obs(discipline,'2026-11-09',100),obs(discipline,'2026-11-16',100),obs(discipline,'2026-11-23',100),obs(discipline,'2026-12-01',60),obs(discipline,'2026-12-08',60)],recovery:{date:'2026-12-08',unusualFatigue:true},safety:{pain:false,illness:false}});
const assess=(state,discipline,evidence,day=now)=>fatigue.assess({state,discipline,evidence,now:day});
const approve=(state,proposal,approved=true,day=now)=>fatigue.approve({state,proposal,approved,now:day});
const view=(state,overlay,day)=>fatigue.view({state,overlay,now:day});
const hasProposal=result=>Boolean(result && result.proposal);
const noProposal=(state,d,e)=>assert.equal(hasProposal(assess(state,d,e)),false);
const itemMap=v=>new Map(v.sessions.map(x=>[x.occurrenceId,x]));
const proposal=(state,d)=>{const a=assess(state,d,strong(d));assert.ok(a.proposal,'Repeated comparable regression + corroboration should offer review');return a.proposal;};
const approved=(state,d)=>{const p=proposal(state,d);const a=approve(state,p);assert.ok(a.overlay,'Explicit approval must create overlay');return a.overlay;};

test('1. ordinary fatigue without regression is neutral',blocked,()=>{
 const e=strong('strength');e.observations=e.observations.map(x=>({...x,value:100}));noProposal(enrol('general-strength'),'strength',e);
});
test('2. one unusually difficult completed workout does not establish a trend',blocked,()=>{
 const e=strong('strength');e.observations.splice(3,1);noProposal(enrol('powerlifting-four-day'),'strength',e);
});
test('3. missed family or work sessions remain neutral',blocked,()=>{
 const e=strong('strength');e.observations=e.observations.map(x=>({...x,value:100}));e.observations.push(obs('strength','2026-12-11',0,{completed:false,reason:'work'}));noProposal(enrol('powerlifting-three-day'),'strength',e);
});
test('4. incomplete sets with no explicit cause are neutral',blocked,()=>{
 const e=strong('strength');e.observations=e.observations.map(x=>({...x,value:100}));e.observations.push(obs('strength','2026-12-11',0,{completed:false,reason:'unknown'}));noProposal(enrol('bench-specialisation'),'strength',e);
});
test('5. confirmed fatigue after missed work is support, not automatic trigger',blocked,()=>{
 const e=strong('strength');e.observations=e.observations.map(x=>({...x,value:100}));e.observations.push(obs('strength','2026-12-11',0,{completed:false,reason:'fatigue'}));noProposal(enrol('deadlift-specialisation'),'strength',e);
});
test('6. repeated comparable strength regression plus corroboration offers approval, not mutation',blocked,()=>{
 const state=enrol('powerlifting-four-day'),before=clone(state);const p=proposal(state,'strength');assert.deepEqual(state,before);assert.ok(p);assert.ok(!approve(state,p,false)?.overlay);assert.deepEqual(state,before);
});
test('7. repeated comparable running regression is distinct from a slow or shortened run',blocked,()=>{
 const state=enrol('10k-two-run'),e=strong('run');const before=clone(state);assert.ok(proposal(state,'run'));e.observations[3].comparable=false;noProposal(state,'run',e);e.observations[3].comparable=true;e.observations[3].contextKey='different-terrain';noProposal(state,'run',e);assert.deepEqual(state,before);
});
test('8. hybrid adjustment is discipline-scoped and leaves completed work and dates intact',blocked,()=>{
 let state=hybrid();const completed=state.occurrences.find(x=>x.planId==='lift');state=training.saveWorkout(state,completed.id,{groups:[[{weightKg:100,dose:5,rpe:7}]]},'2026-11-09T19:00:00Z');const before=clone(state),overlay=approved(state,'strength');const v=view(state,overlay,now),map=itemMap(v);assert.ok(v.sessions.some(x=>x.occurrenceId.startsWith('lift/')&&JSON.stringify(x.adjusted)!==JSON.stringify(x.original)),'An eligible future lifting prescription must actually change');for(const o of state.occurrences.filter(x=>x.planId==='run'||x.status==='logged')) {const x=map.get(o.id);if(x)assert.deepEqual(x.adjusted,x.original);}assert.deepEqual(state,before);
});
test('9. persistent regression after seven days requires a fresh coaching decision',blocked,()=>{
 const state=enrol('10k-two-run'),o=approved(state,'run');const r=fatigue.recovery({overlay:o,answer:'persistent',now:'2026-12-20'});assert.equal(r.status,'persistent');assert.equal(r.autoExtend,false);assert.ok(r.requiresDecision);
});
test('10. recovery expires overlay and restores the original scheduled prescriptions',blocked,()=>{
 const state=enrol('general-strength'),before=clone(state),o=approved(state,'strength');const r=fatigue.recovery({overlay:o,answer:'recovered',now:'2026-12-20'});assert.equal(r.status,'recovered');const v=view(state,o,'2026-12-21');for(const x of v.sessions)assert.deepEqual(x.adjusted,x.original);assert.deepEqual(state,before);
});
test('11. races, meets, benchmarks and taper need separate explicit permission',blocked,()=>{
 for(const id of ['powerlifting-four-day','bench-specialisation','10k-two-run','half-marathon','marathon-timed']){const state=enrol(id),d=id.includes('powerlifting')||id.includes('specialisation')?'strength':'run',o=approved(state,d),v=view(state,o,now);for(const x of v.sessions){const s=x.original;if(s.kind==='event'||s.id==='race'||/benchmark|taper/i.test(s.title||''))assert.deepEqual(x.adjusted,s,id);}}
});
test('11b. final-week races, meets and benchmarks inside the intervention window stay intact',blocked,()=>{
 for (const id of ['general-strength','powerlifting-three-day','powerlifting-four-day','bench-specialisation','deadlift-specialisation','10k-two-run','10k-three-run','half-marathon','marathon-distance','marathon-timed']) {
  const state=enrol(id), before=clone(state), calendar=training.calendar(state);
  const target=calendar.find(x=>x.session.kind==='event'||x.session.id==='race'||/benchmark/i.test(x.session.title||''));
  assert.ok(target,id+' must expose the actual generated event');
  const day=training.addDays(target.date,-3), discipline=target.session.kind==='run'?'run':'strength';
  const e={observations:[-35,-28,-21,-12,-5].map((offset,i)=>obs(discipline,training.addDays(day,offset),i<3?100:60)),recovery:{date:training.addDays(day,-4),unusualFatigue:true},safety:{pain:false,illness:false}};
  const a=assess(state,discipline,e,day);
  // Withholding a proposal altogether near an event is conservative and acceptable.
  if(a?.proposal){const result=approve(state,a.proposal,true,day);assert.ok(result.overlay);const v=view(state,result.overlay,day);const event=v.sessions.find(x=>x.occurrenceId===target.id);assert.ok(event,id+' event must be present in returned view to verify it');assert.deepEqual(event.original,target.session);assert.deepEqual(event.adjusted,target.session,id+' event modified');}
  assert.deepEqual(state,before,id+' underlying programme and dates changed');
 }
});
test('12. offline serialisation preserves records and applies no unapproved intervention',blocked,()=>{
 const state=enrol('marathon-timed'),before=JSON.stringify(state),p=proposal(state,'run');const rejected=approve(state,p,false);assert.ok(!rejected?.overlay);const o=approved(state,'run');const reloaded=JSON.parse(JSON.stringify({state,overlay:o}));assert.deepEqual(reloaded.state,state);assert.deepEqual(view(reloaded.state,reloaded.overlay,now),view(state,o,now));assert.equal(JSON.stringify(state),before);
});
test.todo('12b. Actual native storage write interruption and successful retry preserve programme, logs, approval and overlay');
test('missing, duplicate, inconsistent and unsafe evidence fails closed',blocked,()=>{
 const state=enrol('10k-two-run');for(const change of [e=>{e.observations=[]},e=>{e.recovery=null},e=>{e.safety=null},e=>{e.safety.pain=true},e=>{e.safety.illness=true},e=>{e.observations[3].date='bad-date'},e=>{e.observations[4].date=e.observations[3].date},e=>{e.observations[3].confidence='unreliable'},e=>{e.observations[3].value=NaN}]){const e=strong('run');change(e);noProposal(state,'run',e);}
});
test('calendar-day expiry and both running units restore originals without changing dates',blocked,()=>{
 for(const id of ['marathon-distance','marathon-timed']){const state=enrol(id),before=clone(state),o=approved(state,'run');const first=view(state,o,'2026-12-14'),last=view(state,o,'2026-12-20'),expired=view(state,o,'2026-12-21');assert.ok(first.sessions.length&&last.sessions.length);assert.ok(first.sessions.some(x=>JSON.stringify(x.adjusted)!==JSON.stringify(x.original)),id+' must alter a suitable run');for(const x of expired.sessions)assert.deepEqual(x.adjusted,x.original);assert.deepEqual(state,before);}
});
