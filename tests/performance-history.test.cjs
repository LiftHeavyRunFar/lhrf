const {test}=require('node:test'),assert=require('node:assert/strict'),history=require('../src/performance-history'),review=require('../src/training-review'),registry=require('../src/exercise-registry');
const meta=name=>({...registry.identity(name,{venueId:'synthetic-gym'}),role:'straight'});
const ex=name=>[name,3,5,100,7,meta(name)];
const live={id:'replacement-thu',day:'Thursday',sourceProgrammeWeek:1,started:'2026-11-05T06:00:00Z',ex:[ex('Squat'),ex('Deadlift')]};
const set=(exercise,weight)=>({exercise,...meta(exercise),date:'2026-10-29T06:30:00Z',sessionId:'archived-other-id',week:99,set:1,reps:5,weight,rpe:7.5});
const state={activeCustomWeek:1,sets:[set('Squat',112.5),{...set('Squat',110),set:2,rpe:8},set('Deadlift',140)],runs:[],completedWorkouts:[]};
const refs=(s=state,l=live)=>history.references(s,l,review.history(s));
test('5 November finds 29 October actual squat and deadlift across replacement IDs and numeric weeks',()=>{
 const before=JSON.stringify({state,live}),out=refs();assert.equal(out.length,2);assert.deepEqual(out.map(r=>[r.exercise,r.date,r.sets.map(s=>[s.set,s.weight,s.reps,s.rpe])]),[['Squat','2026-10-29',[[1,112.5,5,7.5],[2,110,5,8]]],['Deadlift','2026-10-29',[[1,140,5,7.5]]]]);assert.equal(JSON.stringify({state,live}),before);
 assert.deepEqual(refs({...state,activeCustomWeek:54},{...live,sourceProgrammeWeek:33,day:'Monday',id:'another'}).map(r=>r.sets),out.map(r=>r.sets));
});
test('each exercise finds its own latest suitable performance using dates, never array order or programme week',()=>{
 const earlier={...set('Deadlift',130),date:'2026-10-22'},later={...set('Squat',115),date:'2026-11-02'};
 const out=refs({...state,sets:[later,...state.sets,earlier]});assert.equal(out[0].date,'2026-11-02');assert.equal(out[1].date,'2026-10-29');
});
test('failed, optional, warmup, technical failure, invalid, future and current-day records are unsuitable',()=>{
 for(const patch of [{failed:true},{techniqueFailed:true},{warmup:true},{optional:true},{completed:false},{role:'warm-up'},{weight:NaN},{weight:0},{category:'optional'},{reps:0},{reps:2.5},{rpe:11},{rpeReliable:false},{evidenceReview:{rpe:{approximate:true}}},{date:'bad'},{date:'2026-02-30'},{date:'2026-11-05'},{date:'2026-11-06'}])assert.equal(refs({...state,sets:[{...set('Squat',150),...patch}]}).length,0,JSON.stringify(patch));
});
test('different variations, venue, load and dose conventions cannot become comparable evidence',()=>{
 for(const patch of [{exercise:'Paused squat',...meta('Paused squat')},{variantId:'squat@other-gym:fixed'},{exerciseId:'paused-squat'},{loadType:'per-hand-kg'},{doseUnit:'seconds'}])assert.equal(refs({...state,sets:[{...set('Squat',100),...patch}]}).length,0);
});
test('basic legacy barbell rows retain original RPE with visible setup uncertainty; ambiguous accessories require exact setup',()=>{
 const legacy={exercise:'Squat',date:'2026-10-29',weight:107,reps:4,rpe:8.5};const out=refs({...state,sets:[legacy]});assert.equal(out[0].setupMissing,true);assert.equal(out[0].sets[0],legacy);
 assert.equal(refs({...state,sets:[{...legacy,exercise:'Chest-supported row'}]},{...live,ex:[ex('Chest-supported row')]}).length,0);
 const noRpe=refs({...state,sets:[{...legacy,rpe:null}]});assert.equal(noRpe[0].sets[0].rpe,null);
});
test('invalid dates are excluded and London calendar dates handle DST boundary timestamps',()=>{
 assert.equal(history.day('2026-10-24T23:30:00Z'),'2026-10-25');assert.equal(history.day('2026-10-25T23:30:00Z'),'2026-10-25');assert.equal(history.day('2026-02-30'),null);
});
