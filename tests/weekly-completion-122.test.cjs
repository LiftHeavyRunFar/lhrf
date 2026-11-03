const {test}=require('node:test'),assert=require('node:assert/strict'),ux=require('../src/mobile-ux');
test('completion matches scheduled identities, deduplicates and retains original records',()=>{
 const state={activeCustomWeek:2,activeSchedule:Array.from({length:6},(_,i)=>({id:'current-'+i})),completedWorkouts:[...Array.from({length:6},(_,i)=>({id:'current-'+i,week:2})),{id:'old-programme',week:2},{id:'current-0',week:2}]},before=JSON.stringify(state);
 assert.deepEqual(ux.weekCompletion(state),{planned:6,completed:6,percent:100});assert.equal(JSON.stringify(state),before);
 state.completedWorkouts=state.completedWorkouts.filter(w=>w.id!=='current-5');assert.equal(ux.weekComplete(state),false);assert.equal(ux.weekCompletion(state).completed,5);
});
test('protected source weeks and combined visits count their actual components',()=>{
 const state={activeCustomWeek:3,activeSchedule:[{id:'saved::strength',parentId:'saved',sourceProgrammeWeek:2},{id:'saved::run',parentId:'saved',sourceProgrammeWeek:2}],completedWorkouts:[{id:'saved::strength',week:2}]};
 assert.equal(ux.weekCompletion(state).percent,50);state.completedWorkouts.push({id:'saved::run',week:2});assert.equal(ux.weekComplete(state),true);
});
