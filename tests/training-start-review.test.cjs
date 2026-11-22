const test=require('node:test'),assert=require('node:assert/strict');
const P=require('../src/training-start-review'),{fixture}=require('./training-start-fixture.cjs');
const copy=x=>JSON.parse(JSON.stringify(x));
const opts={today:'2026-11-21'};
test('mixed per-exercise loading retains original suggestions, all actuals and exact identities',()=>{
 const state=fixture(),before=copy(state),out=P.review(state,{...opts,loading:{'competition-squat':'rpe','competition-deadlift':'rpe','competition-bench':'prescribed'}});
 assert.equal(out.proposalOnly,true);assert.equal(out.ownerApprovalRequired,true);assert.equal(out.readiness,'not assessed');
 for(const w of out.weeks)for(const {original,view}of w.sessions)for(let i=0;i<(view.ex||[]).length;i++){
  const ex=view.ex[i],o=original.ex[i],id=ex[5].exerciseId;
  assert.deepEqual([ex[1],ex[2],ex[4]],[o[1],o[2],o[4]]);
  assert.equal(ex[5].loadType,o[5].loadType);
  if(['competition-squat','competition-deadlift'].includes(id)){assert.equal(ex[3],0);assert.equal(ex[5].suppressLoadSuggestions,true);assert.equal(ex[5].originalSuggestedKg,o[3]||null);}
  else{assert.equal(ex[3],o[3]);assert.equal(ex[5].loadingMode,'prescribed');}
 }
 assert.deepEqual(state,before);
});
test('unknown/invalid loading preferences preserve the prescribed-weight path',()=>{
 const s={ex:[['Fictional bench',3,5,100,7,{exerciseId:'competition-bench',variantId:'same-setup',belt:'beltless'}]]};
 for(const loading of [null,{}, {'competition-bench':'unknown'},{'other-lift':'rpe'}]){
  const out=P.sessionView(s,loading);assert.equal(out.view.ex[0][3],100);assert.equal(out.view.ex[0][5].variantId,'same-setup');assert.equal(out.view.ex[0][5].belt,'beltless');assert.deepEqual(out.original,s);
 }
});
test('RPE-only does not propagate to a separately identified variant',()=>{
 const ex={ex:[['Bench',1,5,100,7,{exerciseId:'competition-bench'}],['Paused bench',1,5,90,7,{exerciseId:'paused-bench'}]]};
 const v=P.sessionView(ex,{'competition-bench':'rpe'}).view;assert.equal(v.ex[0][3],0);assert.equal(v.ex[1][3],90);
});
test('blank prescribed weight remains unknown rather than inventing a max or load',()=>{
 const s={ex:[['Fictional squat',3,5,0,7,{exerciseId:'competition-squat'}]]};
 const out=P.sessionView(s);assert.equal(out.view.ex[0][3],0);assert.equal(out.view.ex[0][5].originalSuggestedKg,null);
});
test('0/1/2 introductory options preserve original calendar, running and source progression',()=>{
 for(const id of ['powerlifting-three-day','powerlifting-four-day'])for(const introWeeks of [0,1,2]){
  const state=fixture(id),before=copy(state),out=P.review(state,{...opts,introWeeks});assert.deepEqual(out.blocked,[]);
  assert.equal(out.resumeWeek,introWeeks+1);
  for(let i=0;i<out.weeks.length;i++)for(let j=0;j<out.weeks[i].sessions.length;j++){
   const {original,view}=out.weeks[i].sessions[j];assert.equal(view.scheduledDate,original.scheduledDate);assert.equal(view.eventDate,original.eventDate);assert.deepEqual(view.runs,original.runs);
   for(let k=0;k<(view.ex||[]).length;k++){assert.equal(view.ex[k][1],i<introWeeks?Math.max(1,original.ex[k][1]-1):original.ex[k][1]);assert.deepEqual([view.ex[k][2],view.ex[k][3],view.ex[k][4]],[original.ex[k][2],original.ex[k][3],original.ex[k][4]]);}
  }
  assert.deepEqual(state,before);
 }
 const one=P.review(fixture(),{...opts,introWeeks:1}),two=P.review(fixture(),{...opts,introWeeks:2});
 assert.deepEqual(one.weeks.slice(0,3).map(w=>w.proposedSets),[21,37,37]);assert.deepEqual(two.weeks.slice(0,3).map(w=>w.proposedSets),[21,24,37]);
 assert.equal(one.resumeSets,37);assert.equal(two.resumeSets,37);
});
for(const [name,mutate]of [['event',s=>s.reviewedProgramme.weeks[0].sessions[0].eventType='strength'],['ambiguous source',s=>delete s.reviewedProgramme.weeks[0].sessions[0].catalogueOccurrenceId],['invalid date',s=>s.reviewedProgramme.weeks[0].sessions[0].scheduledDate='2026-02-30'],['past date',s=>s.reviewedProgramme.weeks[0].sessions[0].scheduledDate='2026-11-01'],['completed workout',s=>s.completedWorkouts.push({id:s.reviewedProgramme.weeks[0].sessions[0].id})],['partial set',s=>s.sets.push({sessionId:s.reviewedProgramme.weeks[0].sessions[0].id})],['taper',s=>s.reviewedProgramme.weeks[0].sessions[0].phase='Taper']])test(name+' refuses an intro without changing either original',()=>{
 const state=fixture();mutate(state);const before=copy(state),out=P.review(state,{...opts,introWeeks:1});assert.ok(out.blocked.length);assert.deepEqual(state,before);assert.equal(out.weeks[0].proposedSets,out.weeks[0].originalSets);for(const s of out.weeks[0].sessions)assert.deepEqual(s.view,s.original);
});
test('active work blocks review; pain/illness require separate return review and never gate RPE-only preference',()=>{
 for(const returnCondition of ['pain','illness']){const out=P.review(fixture(),{...opts,introWeeks:1,returnCondition});assert.ok(out.blocked.length);assert.deepEqual(P.review(fixture(),{...opts,loading:{'competition-squat':'rpe'},returnCondition}).blocked,[]);}
 assert.ok(P.review(fixture(),{...opts,active:true}).blocked.length);
});
test('preview has no live application API and never records a fatigue decision',()=>{
 assert.deepEqual(Object.keys(P),['sessionView','review','mount']);const s=fixture(),before=copy(s);P.review(s,{...opts,introWeeks:2});assert.deepEqual(s,before);assert.equal(s.fatigue,undefined);
});
test('zero or unreliable set counts refuse an intro without adding or inventing work',()=>{
 for(const value of [0,null,'unknown','2',NaN,1.5]){
  const state=fixture();state.reviewedProgramme.weeks[0].sessions[0].ex[0][1]=value;
  const before=JSON.stringify(state),out=P.review(state,{...opts,introWeeks:1});
  assert.ok(out.blocked.some(message=>message.includes('invalid working-set count')));
  assert.equal(JSON.stringify(state),before);assert.equal(out.weeks[0].originalSets,null);assert.equal(out.weeks[0].proposedSets,null);
  assert.equal(JSON.stringify(out.weeks[0].sessions[0].view),JSON.stringify(out.weeks[0].sessions[0].original));
 }
});

