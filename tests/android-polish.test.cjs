const {test}=require('node:test'),assert=require('node:assert/strict'),polish=require('../src/android-polish'),review=require('../src/training-review');
test('equipment entry suggestions use 2.5 kg without editing prescriptions, RPE or raw historical loads',()=>{
 for(const name of ['Chest-supported row','Bench']){const ex=[name,3,10,49,7],before=JSON.stringify(ex);assert.equal(polish.loadSuggestion(ex).value,50);assert.equal(polish.loadSuggestion(ex).step,2.5);assert.equal(JSON.stringify(ex),before)}
 assert.equal(polish.loadSuggestion(['Chest-supported row',3,10,47.5,7]).value,47.5);assert.equal(polish.loadSuggestion(['Chest-supported row',3,10,0,7]).value,0);assert.equal(polish.loadSuggestion(['Unknown machine',3,10,49,7]).value,49);
});
test('exercise grouped history retains all seven sets and original units, target and actual RPE',()=>{
 const row={prescription:{ex:[['Chest-supported row',3,10,49,7,{loadType:'per-hand-kg'}]]},sets:Array.from({length:7},(_,i)=>({exercise:'Chest-supported row',set:i+1,weight:49,reps:10,rpe:i===6?9:7,loadType:'per-hand-kg'}))},before=JSON.stringify(row),groups=review.strengthGroups(row);
 assert.equal(groups.length,1);assert.equal(groups[0].actual.length,7);assert.equal(groups[0].prescribed[0][3],49);assert.equal(groups[0].actual[6].rpe,9);assert.equal(JSON.stringify(row),before);
});
