const {test}=require('node:test'),assert=require('node:assert/strict');
const model=require('../src/performance-history'),review=require('../src/training-review'),registry=require('../src/exercise-registry');
const metadata=()=>({...registry.identity('Bench',{venueId:'synthetic-gym'}),role:'top'});
const ex=(purpose,reps=1)=>['Bench',1,reps,130,8,{...metadata(),benchRole:purpose}];
const record=(date,purpose,weight,reps=1)=>({id:'old-'+date,date:date+'T07:00:00Z',name:'Bench',week:99,prescription:{ex:[ex(purpose,reps)]},sets:[{exercise:'Bench',...metadata(),date:date+'T07:00:00Z',set:1,weight,reps,rpe:8}],runs:[]});
const live={id:'new-heavy',day:'Friday',started:'2026-11-06T06:00:00Z',sourceProgrammeWeek:2,ex:[ex('heavy')]};
const history=[record('2026-11-03','volume',120,5),record('2026-10-30','heavy',137.5)];
const select=(state={},l=live,rows=history)=>model.references(state,l,rows)[0];
test('Friday6November prefers actual30October heavy over newer3November volume across programme IDs/weeks',()=>{
 const before=JSON.stringify({live,history}),ref=select();assert.equal(ref.date,'2026-10-30');assert.equal(ref.samePurpose,true);assert.equal(ref.purpose.source,'saved prescription');assert.equal(ref.sets[0].weight,137.5);assert.equal(JSON.stringify({live,history}),before);
});
test('latest suitable SAME-purpose record wins; wrong variation, equipment and failed records cannot outrank it',()=>{
 const recent=record('2026-11-04','heavy',140);assert.equal(select({},live,[...history,recent]).date,'2026-11-04');
 for(const patch of [{failed:true},{variantId:'bench@other:fixed'},{loadType:'per-hand-kg'},{exerciseId:'paused-bench',exercise:'Paused bench'}])assert.equal(select({},live,[...history,{...recent,sets:[{...recent.sets[0],...patch}]}]).date,'2026-10-30');
});
test('top/backoff roles, weekday, hard RPE and low reps never fabricate a heavy purpose',()=>{
 const unknown={...record('2026-11-04',undefined,150),prescription:null,day:'Friday',name:'Bench',sets:[{...record('2026-11-04',undefined,150).sets[0],rpe:10}]};
 const fallback=select({},live,[unknown]);assert.equal(fallback.samePurpose,false);assert.equal(fallback.purpose.value,null);assert.equal(select({},live,[unknown,...history]).date,'2026-10-30');
});
test('known alternative purpose is explicitly marked when no same-purpose record exists',()=>{
 const ref=select({},live,[history[0]]);assert.equal(ref.alternative,true);assert.equal(ref.purpose.value,'volume');
 const unknownCurrent=select({}, {...live,ex:[ex(undefined)]});assert.equal(unknownCurrent.samePurpose,false);
});
test('preserved dated programme metadata resolves legacy rows without replaying current coaching',()=>{
 const rows=[{...history[1],prescription:null,id:'unrelated'}],state={programmeArchive:[{programme:{startDate:'2026-10-27'},weeks:[{week:1,sessions:[{id:'old-friday',day:'Friday',ex:[ex('heavy')]}]}]}]};
 const original=JSON.stringify({rows,state}),ref=select(state,live,rows);assert.equal(ref.samePurpose,true);assert.equal(ref.purpose.source,'preserved programme');assert.equal(JSON.stringify({rows,state}),original);
 state.programmeArchive[0].weeks[0].sessions.push({id:'ambiguous',day:'Friday',ex:[ex('volume')]});assert.equal(select(state,live,rows).purpose.ambiguous,true);assert.equal(select(state,live,rows).samePurpose,false);
});
test('conflicting direct/snapshot purpose is uncertain; speed and technique form the same named purpose',()=>{
 const conflict={...history[1],sets:[{...history[1].sets[0],trainingRole:'volume'}]};assert.equal(select({},live,[conflict]).purpose.ambiguous,true);
 const technique={...live,ex:[ex('technique',2)]};const ref=select({},technique,[record('2026-11-03','speed',85,2)]);assert.equal(ref.samePurpose,true);assert.equal(ref.purpose.value,'speed/technique');
});
test('actual top sets and backoffs remain distinct, unchanged and complete under saved purpose',()=>{
 const row=record('2026-10-30','heavy',137.5);row.prescription.ex.push(['Bench',3,3,115,7,{...metadata(),role:'backoff',benchRole:'heavy'}]);row.sets.push(...[1,2,3].map(set=>({...row.sets[0],set,role:'backoff',weight:114.25,reps:3,rpe:7.5})));
 const ref=select({},live,[row]);assert.equal(ref.sets.length,4);assert.equal(ref.sets[1].weight,114.25);assert.equal(ref.sets[1].rpe,7.5);assert.equal(ref.sets[1].role,'backoff');
});

test('the original installation archive schedule resolves only its recorded calendar week',()=>{const state={programmeArchive:[{programme:{startDate:'2026-10-27'},week:1,schedule:[{day:'Friday',ex:[ex('heavy')]}]}]};assert.equal(select(state,live,[{...history[1],prescription:null}]).samePurpose,true);state.programmeArchive[0].week=2;assert.equal(select(state,live,[{...history[1],prescription:null}]).purpose.value,null);});

test('linked legacy set/completion timestamps may differ while recorded purpose is retained',()=>{const row=history[1],set={...row.sets[0],sessionId:row.id,date:'2026-10-30T06:15:00Z'},state={sets:[set],completedWorkouts:[{...row,date:'2026-10-30T07:30:00Z'}],runs:[]};const ref=select(state,live,review.history(state));assert.equal(ref.samePurpose,true);assert.equal(ref.purpose.source,'saved session prescription');assert.equal(ref.sets[0],set);});
