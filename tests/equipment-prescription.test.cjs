const test=require('node:test');
const assert=require('node:assert/strict');
const kit=require('../src/exercise-registry.js');
const coach=require('../src/coach-engine.js');
const adapters=require('../src/coach-adapters.js');
const replacement=require('../src/programme-replacement.js');
const profile=require('./athletes/profiles.cjs')[0].config;
const clone=x=>JSON.parse(JSON.stringify(x));
function inventory(available=kit.equipment){return {version:1,venueId:'test-gym',confirmedAt:'2026-11-01T12:00:00Z',source:'athlete-confirmed',items:Object.fromEntries(kit.equipment.map(k=>[k,available.includes(k)?'available':'unavailable'])),setups:Object.fromEntries(kit.exercises.filter(e=>e.setup!=='fixed'&&e.setup!=='execution-review').map(e=>[e.id,e.setup]))}}
function engine(inv,extra={}){return adapters.createProfileEngine({...profile,weeks:20,strengthTargetDate:null,runningTargetDate:null,equipmentPolicyVersion:1,equipmentInventory:inv,exerciseSelectionVersion:2,coachingPolicy:'review-v2',...extra});}

test('registry covers all audited names, both legacy identities, unique typed requirements and safe fallback graph',()=>{
 const names=require('./fixtures/equipment-inventory-names.json');
 assert.equal(names.length,62);assert.equal(kit.exercises.length,64);
 for(const n of [...names,'Bench press','Triceps cable extension'])assert.ok(kit.resolve(n),n);
 assert.equal(new Set(kit.exercises.map(e=>e.id)).size,64);
 assert.notEqual(kit.resolve('Bench').id,kit.resolve('Bench press').id);
 for(const e of kit.exercises){assert.ok(e.required.length);for(const id of e.alternatives){const other=kit.resolve(id);assert.equal(e.purpose,other.purpose);assert.equal(e.doseUnit,other.doseUnit)}}
 assert.ok(!kit.resolve('Seated leg curl').alternatives.includes(kit.resolve('Back extension').id));
 assert.ok(!kit.resolve('Lat pulldown').alternatives.includes(kit.resolve('Seated cable row').id));
});

test('commercial gym is eligible for the complete horizon; filtering never alters volume or intensity to pass',()=>{
 const inv=inventory(),{engine:e,config:c}=engine(inv),old=adapters.createProfileEngine({...c,equipmentPolicyVersion:undefined,equipmentInventory:undefined}).engine;
 for(let w=1;w<=20;w++){
  const actual=e.generatedSessions(c,w),expected=old.generatedSessions({...c,equipmentPolicyVersion:undefined},w);
  assert.equal(kit.audit(actual,inv).eligible,true);
  assert.equal(actual.constraintResult.feasible,true);
  assert.deepEqual(actual.flatMap(s=>s.ex.map(x=>x.slice(0,3).concat(x[4]))),expected.flatMap(s=>s.ex.map(x=>x.slice(0,3).concat(x[4]))));
 }
});

test('basic home gym and removed equipment expose lost stimulus and never emit ineligible exercises',()=>{
 const home=inventory(['straight-bar','plates','collars','rack','safeties','floor','lifting-floor','flat-bench','dumbbells','incline-bench','rear-foot-support']);
 const {engine:e,config:c}=engine(home);
 let blocked=0;for(let w=1;w<=20;w++){const s=e.generatedSessions(c,w);assert.equal(kit.audit(s,home).eligible,true);if(s.constraintResult.blockingIssues.length){blocked++;assert.equal(s.constraintResult.feasible,false)}}assert.ok(blocked>0);
 const removed=inventory();removed.items['straight-bar']='unavailable';
 const state=engine(inventory());state.data.equipmentInventory=removed;const s=state.engine.generatedSessions(state.config,1);assert.ok(s.constraintResult.blockingIssues.some(x=>x.includes('straight-bar')));assert.ok(!s.flatMap(x=>x.ex).some(x=>kit.resolve(x[0]).required.includes('straight-bar')));
});

test('no specialist bars, chains or bands: eligible upright squat alternative, no invented resisted work',()=>{
 const inv=inventory(kit.equipment.filter(k=>!['safety-squat-bar','bands','chains','band-anchor','chain-attachments'].includes(k)));
 const {engine:e,config:c}=engine(inv,{squat:2,variations:{Squat:{choice:'Safety-bar squat',lock:true}}});
 const choice=e.variationChoice(c,'Squat',1);assert.equal(choice.name,'Front squat');assert.match(choice.why,/Setup and loading differ/);
 for(let w=1;w<=20;w++){const s=e.generatedSessions(c,w);assert.ok(s.every(x=>x.ex.every(x=>!kit.resolve(x[0]).required.includes('safety-squat-bar'))));assert.equal(kit.audit(s,inv).eligible,true)}
});

test('ordinary defaults are usable; explicit absence, locked names and missing specialist kit fail closed',()=>{
 const inv=inventory();delete inv.items.rope;
 assert.equal(kit.eligibility('Face pull',inv).eligible,true);inv.items.rope='unavailable';assert.equal(kit.eligibility('Face pull',inv).eligible,false);
 assert.equal(kit.eligibility('Bench',undefined).eligible,true);assert.equal(kit.eligibility('Safety-bar squat',undefined).eligible,false);
 assert.equal(kit.eligibility('Imaginary exercise',inventory()).eligible,false);
 const {engine:e,config:c}=engine(undefined,{squat:2,variations:{Squat:{choice:'Imaginary exercise',lock:true}}});const s=e.generatedSessions(c,1);assert.equal(s.constraintResult.feasible,false);assert.ok(!s.flatMap(x=>x.ex).some(e=>e[0]==='Imaginary exercise'));
 assert.doesNotThrow(()=>coach.approveProgrammeConfig({...adapters.normalizeProfile(profile),equipmentInventory:undefined}));
 const noCurls=inventory();noCurls.items['seated-leg-curl']='unavailable';noCurls.items['lying-leg-curl']='unavailable';const a=engine(noCurls);const sessions=a.engine.generatedSessions(a.config,1);assert.ok(sessions.some(s=>s.equipmentLimitations.some(x=>x.purpose==='knee flexion')));
});

test('unversioned output and frozen legacy records are preserved; all start routes use a current inventory audit',()=>{
 const inv=inventory(),legacy=clone(profile),a=adapters.createProfileEngine(legacy),before=JSON.stringify(a.engine.generatedSessions(a.config,1));a.data.equipmentInventory=inv;assert.equal(JSON.stringify(a.engine.generatedSessions(a.config,1)),before);
 const frozen={customRoadmap:{programmeId:'frozen'},reviewedProgramme:{config:{programmeId:'frozen'},weeks:[{week:1,sessions:[{id:'saved',ex:[['Bench press',3,5,100,7]],runs:[]}]}]}};
 const saved=JSON.stringify(frozen),session=replacement.sessions(frozen,1)[0];inv.items['straight-bar']='unavailable';assert.throws(()=>kit.assertStart(session,inv),/straight-bar/);assert.equal(JSON.stringify(frozen),saved);
 assert.equal(kit.resolve('Bench press').id,'bench-press');assert.throws(()=>kit.assertStart({ex:[['Triceps cable extension',2,12,20,7]]},inventory()),/execution-review/);
});

test('exact variant anchors survive return, incomparable/future/failed records never supply a new setup load',()=>{
 const inv=inventory(),a=engine(inv),s=a.engine.generatedSessions(a.config,1),ex=s.flatMap(s=>s.ex)[0],identity=kit.identity(ex[0],inv);
 const row={...identity,date:'2026-10-31T12:00:00Z',exercise:ex[0],weight:40,reps:ex[2],rpe:7,role:ex[5].role,completed:true};
 const frozenNow=Date.parse('2026-11-01T12:00:00Z');const b=adapters.createProfileEngine(a.config,{now:frozenNow,data:{sets:[row,{...row,weight:999,failed:true},{...row,date:'2099-01-01',weight:999}]}});
 const next=b.engine.generatedSessions(b.config,1).flatMap(s=>s.ex).find(x=>x[0]===ex[0]&&x[5].role===row.role);assert.equal(next[3],40);assert.equal(next[5].variantId,identity.variantId);
 b.data.equipmentInventory={...inv,venueId:'different-machine'};const changed=b.engine.generatedSessions(b.config,1).flatMap(s=>s.ex).find(x=>x[0]===ex[0]);assert.equal(changed[3],0);assert.equal(changed[5].calibrationRequired,true);assert.equal(b.data.sets[0].weight,40);
 b.data.equipmentInventory=inv;assert.equal(b.engine.generatedSessions(b.config,1).flatMap(s=>s.ex).find(x=>x[0]===ex[0]&&x[5].role===row.role)[3],40);
});

test('holds and assistance carry units and never inherit a generic positive weight progression',()=>{
 assert.equal(kit.resolve('Weighted plank').doseUnit,'seconds');assert.equal(kit.resolve('Assisted pull-up').loadType,'assistance-kg');
 const inv=inventory(),a=engine(inv),session=[{id:'units',ex:[['Assisted pull-up',2,10,20.5,7],['Side plank',2,30,0,7]]}];
 const result=a.engine.equipmentFinish(session,a.config);assert.equal(result[0].ex[0][3],0);assert.equal(result[0].ex[0][5].loadType,'assistance-kg');assert.equal(result[0].ex[1][5].doseUnit,'seconds');
});

test('stripped required slots cannot start; optional omissions stay visible without blocking unrelated work',()=>{
 const a=engine(inventory([])),sessions=a.engine.generatedSessions(a.config,1);const session=sessions.find(s=>s.equipmentLimitations.some(x=>!x.optional));assert.throws(()=>kit.assertStart(session,inventory([])),/Required training stimulus/);
 const optional=a.engine.equipmentFinish([{id:'optional',ex:[['Cable biceps curl',2,12,0,7,{optional:true}]]}],a.config);
 assert.equal(optional[0].equipmentLimitations[0].optional,true);assert.equal(optional.constraintResult.feasible,true);assert.ok(optional.constraintResult.warnings.length);
 const current=engine(inventory()),original=current.engine.generatedSessions(current.config,1)[0];assert.throws(()=>kit.assertStart(original,{...inventory(),venueId:'new-venue'}),/identity changed/);
});

test('reviewed replacement with missing current equipment is rejected before any athlete state changes',async()=>{
 const p=clone(require('../docs/qa/stage-seven/regressions/Taylor.json').programme);p.config.weeks=4;p.weeks=p.weeks.slice(0,4);
 const state={onboardingComplete:true,customRoadmap:clone(p.config),activeCustomWeek:1,activeSchedule:clone(p.weeks[0].sessions),equipmentInventory:inventory([]),sets:[],runs:[],checkins:[],decisions:[],overrides:{},completedWorkouts:[]};
 const snapshot=JSON.stringify(state),packet=await replacement.createPackage(p,state,{reviewedCommit:'synthetic-review',approvalContext:[]});
 assert.throws(()=>replacement.createReplacement(state,packet,coach,{now:'2026-11-02T08:00:00Z'}),/Equipment review required/);assert.equal(JSON.stringify(state),snapshot);
});

test('role accessories, new optional pools and legacy optional rotations all enforce equipment over the horizon',()=>{
 const inv=inventory(kit.equipment.filter(k=>!['cable-station','dual-cable','cable-row','safety-squat-bar'].includes(k)));
 const config=coach.prepareNewProgramme({...adapters.normalizeProfile({...profile,weeks:20,strengthTargetDate:null,runningTargetDate:null,trainingAge:'advanced'}),equipmentPolicyVersion:1,equipmentInventory:inv});
 const a=adapters.createProfileEngine(config);let role=0,optional=0;
 for(let w=1;w<=20;w++){const sessions=a.engine.generatedSessions(a.config,w);assert.equal(kit.audit(sessions,inv).eligible,true);role+=sessions.flatMap(s=>s.ex).filter(e=>e[5]?.benchDayRole).length;optional+=sessions.flatMap(s=>s.ex).filter(e=>e[5]?.optional).length;}
 assert.ok(role>0);assert.ok(optional>0);
 const old=engine(inv,{exerciseSelectionVersion:undefined});for(let w=1;w<=20;w++)assert.equal(kit.audit(old.engine.generatedSessions(old.config,w),inv).eligible,true);
});
