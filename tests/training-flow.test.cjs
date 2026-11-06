const {test}=require('node:test'),assert=require('node:assert/strict'),flow=require('../src/training-flow');
const ex=(name='Squat',meta={})=>[name,5,5,100,7,{exerciseId:name.toLowerCase(),variantId:name+'@synthetic',loadType:'external-kg',doseUnit:'reps',role:'straight',...meta}];
const live=()=>({id:'synthetic',started:'2026-11-06T06:00:00Z',ex:[ex(),ex('Deadlift')],entries:{'0_0':{weight:105,reps:5,rpe:7.5,done:true}}});
test('actual increased working load suggests all later common-load sets without changing dose or prescription',()=>{
 const l=live(),before=JSON.stringify(l.ex);assert.deepEqual(flow.carry(l,0,0),['0_1','0_2','0_3','0_4']);assert.equal(JSON.stringify(l.ex),before);
 for(let j=1;j<5;j++){const s=l.entries['0_'+j];assert.equal(s.weight,105);assert.equal(s.reps,5);assert.equal(s.rpe,'');assert.equal(s.done,false);assert.equal(s.weightHint.fromSet,1)}assert.equal(l.entries['1_0'],undefined);
});
test('decreases, decimal adjustments and successive completed sets update only later suggestions',()=>{
 const l=live();l.entries['0_0'].weight=95.25;flow.carry(l,0,0);assert.equal(l.entries['0_4'].weight,95.25);
 l.entries['0_1']={...l.entries['0_1'],done:true,rpe:8};l.entries['0_2']={...l.entries['0_2'],weight:107.5,reps:5,rpe:8,done:true};flow.carry(l,0,2);
 assert.equal(l.entries['0_3'].weight,107.5);assert.equal(l.entries['0_4'].weight,107.5);assert.equal(l.entries['0_0'].weight,95.25);assert.equal(l.entries['0_1'].weight,95.25);assert.equal(l.ex[0][3],100);
});
test('manual, completed and ambiguous legacy values are never overwritten, including deliberate blanks',()=>{
 const l=live();l.entries['0_1']={weight:103,weightEdited:true,done:false};l.entries['0_2']={weight:102,reps:5,rpe:7,done:false};l.entries['0_3']={weight:'',weightEdited:true,done:false};l.entries['0_4']={weight:104,reps:5,rpe:8,done:true};
 assert.equal(flow.canSuggest({weight:100,weightEdited:false,correcting:true},l.ex[0]),false);
 const before=JSON.stringify(l.entries);assert.deepEqual(flow.carry(l,0,0),[]);assert.equal(JSON.stringify(l.entries),before);
});
test('top sets, warm-ups, unknown roles and explicit loading changes fail closed',()=>{
 for(const patch of [{role:'top'},{role:'warmup'},{role:'warm-up'},{warmup:true},{category:'warmup'},{role:'mystery'},{setWeights:[100,95,95,90,90]},{setPrescriptions:[{weight:100},{weight:95}]},{perSetLoads:[100,90]},{ramp:true},{loadingPattern:'descending'}]){const l=live();l.ex[0]=ex('Squat',patch);assert.deepEqual(flow.carry(l,0,0),[],JSON.stringify(patch));assert.equal(l.ex[0][3],100)}
});
test('exercise, variation, equipment and load-unit boundaries cannot be crossed',()=>{
 for(const patch of [{variantId:'different'},{exerciseId:'front-squat'},{loadType:'per-hand-kg'},{equipmentId:'other-machine'},{doseUnit:'seconds'}]){const l=live();l.entries['0_1']={weight:100,weightEdited:false,...patch};flow.carry(l,0,0);assert.equal(l.entries['0_1'].weight,100)}
 const l=live();l.entries['1_1']={weight:200,weightEdited:false};flow.carry(l,0,0);assert.equal(l.entries['1_1'].weight,200);
});
test('a top-to-backoff transition preserves its separate loading phase; backoff working sets can carry their own actual load',()=>{
 const l=live();l.ex[0]=ex('Bench',{role:'top'});l.ex[1]=ex('Bench',{role:'backoff'});l.ex[1][3]=80;l.entries['0_0'].weight=140;assert.deepEqual(flow.carry(l,0,0),[]);assert.equal(l.entries['1_0'],undefined);
 l.entries['1_0']={weight:82.5,reps:5,rpe:7,done:true};flow.carry(l,1,0);assert.equal(l.entries['1_1'].weight,82.5);assert.equal(l.ex[1][3],80);
});
test('invalid or incomplete work and earlier corrections never generate carry-forward',()=>{
 for(const patch of [{done:false},{weight:NaN},{weight:-1},{weight:0}]){const l=live();Object.assign(l.entries['0_0'],patch);assert.deepEqual(flow.carry(l,0,0),[])}
 const l=live();l.entries['0_1']={weight:105,reps:5,rpe:7,done:true};assert.deepEqual(flow.carry(l,0,0,{correcting:true}),[]);
});
test('progression occurs only on a newly completed exercise at the forward frontier, never skips required work or finishes',()=>{
 const before=live();before.ex[0][1]=1;before.entries={};const after=structuredClone(before);after.entries['0_0']={weight:100,reps:5,rpe:7,done:true};assert.equal(flow.nextExercise(before,after,0),1);
 assert.equal(flow.nextExercise(before,before,0),null);assert.equal(flow.nextExercise(after,after,0),null);assert.equal(flow.nextExercise(before,after,0,{correcting:true}),null);
 const outOfOrder=structuredClone(before);outOfOrder.ex[1][1]=1;const doneLater=structuredClone(outOfOrder);doneLater.entries['1_0']={done:true};assert.equal(flow.nextExercise(outOfOrder,doneLater,1),null);
 after.ex[1][1]=1;after.entries['1_0']={done:true};assert.equal(flow.firstIncomplete(after),null);assert.equal(flow.nextExercise(before,after,0),null);
});
test('required order precedes optional work and hidden optional rows can be excluded from progression',()=>{
 const l=live();l.ex.unshift(ex('Optional',{optional:true}));assert.deepEqual(flow.order(l),[1,2,0]);
 const before={...l,ex:l.ex.map(e=>[e[0],1,...e.slice(2)]),entries:{'1_0':{done:true}}};const after=structuredClone(before);after.entries['2_0']={done:true};assert.equal(flow.nextExercise(before,after,2,{indices:[1,2]}),null);
});
test('atomic next-view metadata wins over stale UI selection; explicit same-revision navigation and pending corrections resume',()=>{
 const l=live();l.ex[0][1]=1;l.trainingView={exerciseIndex:1};assert.equal(flow.resumeIndex(l,{key:l.id+'|'+l.started,index:0,revision:'stale'}),1);
 assert.equal(flow.resumeIndex(l,{key:l.id+'|'+l.started,index:0,revision:flow.revision(l)}),0);
 l.entries['0_0'].done=false;l.entries['0_0'].correcting=true;assert.equal(flow.resumeIndex(l,null),0);
});
test('JSON persistence retains editable suggestions separately from actuals and the original prescription',()=>{
 const l=live();l.trainingPrescription={ex:structuredClone(l.ex)};flow.carry(l,0,0);const restored=JSON.parse(JSON.stringify(l));assert.equal(restored.entries['0_0'].done,true);assert.equal(restored.entries['0_1'].done,false);assert.equal(restored.entries['0_1'].weightHint.kind,'carry-forward');assert.equal(flow.originalWeight(restored,0),100);
});

test('a different workout cannot reuse an old presentation index',()=>{const l=live();assert.equal(flow.resumeIndex(l,{key:'other|old',index:1}),0);});

test('a planned reduction in a separate phase of the same exercise remains untouched',()=>{const l=live();l.ex[1]=ex();l.ex[1][3]=90;flow.carry(l,0,0);assert.equal(l.entries['1_0'],undefined);assert.equal(l.ex[1][3],90);});

test('optional working accessories retain their voluntary status while carrying compatible loads',()=>{const l=live();l.ex[0]=ex('Squat',{role:'optional',optional:true});flow.carry(l,0,0);assert.equal(l.entries['0_1'].weight,105);assert.equal(l.ex[0][5].optional,true);assert.equal(l.ex[0][3],100);});

test('explicit current navigation and a durable next-view revision outrank an older pending correction',()=>{const l=live();l.entries['0_0'].done=false;l.entries['0_0'].correcting=true;const current=flow.revision(l);assert.equal(flow.resumeIndex(l,{key:l.id+'|'+l.started,index:1,revision:current}),1);l.trainingView={exerciseIndex:1,revision:current};assert.equal(flow.resumeIndex(l,null),1);});

test('correcting the latest actual updates untouched suggestions but never forces progression',()=>{const l=live();flow.carry(l,0,0);l.entries['0_0'].weight=107.5;flow.carry(l,0,0,{correcting:true});assert.equal(l.entries['0_1'].weight,107.5);assert.equal(l.entries['0_4'].weight,107.5);assert.equal(flow.nextExercise(l,l,0,{correcting:true}),null);assert.equal(l.ex[0][3],100);});

test('per-entry warm-up or incompatible source metadata cannot seed working suggestions',()=>{for(const patch of [{warmup:true},{role:'straight',category:'warmup'},{role:'warmup'},{role:'top'},{variantId:'other'},{loadType:'per-hand-kg'}]){const l=live();Object.assign(l.entries['0_0'],patch);assert.deepEqual(flow.carry(l,0,0),[]);}});

test('explicit per-entry planned reductions remain even when the field is generated',()=>{const l=live();l.entries['0_1']={weight:90,plannedWeight:90,weightEdited:false};flow.carry(l,0,0);assert.equal(l.entries['0_1'].weight,90);assert.equal(l.entries['0_2'].weight,105);});
