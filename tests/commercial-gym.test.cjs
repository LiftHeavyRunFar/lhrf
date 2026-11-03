const {test}=require('node:test'),assert=require('node:assert/strict');
const gym=require('../src/gym-equipment.js'),kit=require('../src/exercise-registry.js'),coach=require('../src/coach-engine.js');
test('exactly fourteen specialist selections; unknown kit never becomes confirmed',()=>{
 assert.equal(gym.specialists.length,14);assert.equal(new Set(gym.specialists.map(x=>x.key)).size,14);
 for(const {key}of gym.specialists){assert.equal(gym.availability(key), 'unavailable');assert.equal(gym.availability(key,{items:{[key]:'unknown'}}),'unavailable');const next=gym.update(undefined,{[key]:true},kit.exercises,kit.equipment,'2026-11-03T12:00:00Z');for(const other of gym.specialists)assert.equal(gym.availability(other.key,next),other.key===key?'available':'unavailable');}
});
test('legacy migration is derived, preserves explicit specialist choices, venue identity and genuine absence',()=>{
 const inv={version:1,venueId:'existing-load-calibration',confirmedAt:'2026-10-27T12:00:00Z',items:{'straight-bar':'unknown',plates:'unknown',dumbbells:'unknown','safety-squat-bar':'available',bands:'unknown',chains:'unavailable','leg-press':'unavailable'},setups:{},unknownField:{keep:true}},before=JSON.stringify(inv);
 assert.equal(kit.eligibility('Bench',inv).eligible,true);assert.equal(kit.eligibility('Safety-bar squat',inv).eligible,true);assert.equal(kit.eligibility('Leg press',inv).eligible,false);assert.equal(gym.availability('bands',inv),'unavailable');assert.equal(JSON.stringify(inv),before);
 const choices=Object.fromEntries(gym.specialists.map(s=>[s.key,gym.availability(s.key,inv)==='available'])),saved=gym.update(inv,choices,kit.exercises,kit.equipment);assert.equal(saved.venueId,inv.venueId);assert.deepEqual(saved.unknownField,inv.unknownField);assert.equal(saved.items['leg-press'],'unavailable');assert.equal(saved.items['safety-squat-bar'],'available');assert.equal(saved.items.bands,'unavailable');assert.equal(JSON.stringify(inv),before);
});
test('the 3 November bench prescription starts with ordinary defaults without any prescription or history mutation',()=>{
 const c=require('../programmes/november-2026.json'),sessions=coach.createEngine().generatedSessions(c,2),bench=sessions.find(s=>s.day==='Tue'),before=JSON.stringify({c,bench});
 assert.ok(bench.ex.length);assert.equal(kit.assertStart(bench,undefined),true);const unknown={items:Object.fromEntries(kit.equipment.map(k=>[k,'unknown']))};assert.equal(kit.assertStart(bench,unknown),true);assert.equal(JSON.stringify({c,bench}),before);
 const special={ex:[['Safety-bar squat',3,5,100,7]]};assert.throws(()=>kit.assertStart(special,undefined),/safety-squat-bar/);assert.equal(kit.assertStart(special,{items:{'safety-squat-bar':'available'}}),true);
});
test('standard defaulting cannot borrow load identities or approve ambiguous legacy execution',()=>{
 const inv={venueId:'existing-venue',items:{'straight-bar':'unknown'}},identity=kit.identity('Bench',inv),session={ex:[['Bench',3,5,100,7,{equipmentPolicyVersion:1,...identity}]]};assert.equal(kit.assertStart(session,inv),true);assert.throws(()=>kit.assertStart(session,{...inv,venueId:'different-venue'}),/identity changed/);assert.throws(()=>kit.assertStart({ex:[['Triceps cable extension',2,12,20,7]]},inv),/execution-review/);
});
test('mixed cached HTML without the new helper stays readable and fails closed',()=>{
 const fs=require('node:fs'),vm=require('node:vm'),context={};vm.runInNewContext(fs.readFileSync(require.resolve('../src/exercise-registry.js'),'utf8'),context);assert.equal(context.LHRFExercises.eligibility('Bench',undefined).eligible,false);assert.equal(context.LHRFExercises.eligibility('Safety-bar squat',undefined).eligible,false);
});
