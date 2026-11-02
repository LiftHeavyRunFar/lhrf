const test=require('node:test'),assert=require('node:assert/strict'),crypto=require('node:crypto').webcrypto;
const g=require('../src/local-activity-import'),garmin=require('../src/garmin-import'),coach=require('../src/coach-engine');
const fixture=require('./local-activity-fixtures.cjs'),config=require('./fixtures/approved-peak-v2.json').config;
const file=(bytes=fixture.fit(),name='historical.fit')=>({name,size:bytes.length,arrayBuffer:async()=>Uint8Array.from(bytes).buffer});
const prepare=(bytes,name)=>g.prepareFile(file(bytes,name),{crypto});
function state(){return {customRoadmap:structuredClone(config),activeCustomWeek:1,activeSchedule:coach.createEngine().generatedSessions(config,1),runs:[{source:'garmin-personal',sourceActivityId:'424242',date:'2026-10-20T07:00:00.000Z',km:4,min:25,splits:[{km:1,min:6}],notes:'unchanged API evidence'}],completedWorkouts:[{id:'prior-manual',week:1,date:'2026-10-20T07:00:00.000Z'}],sets:[{exercise:'Bench',weight:120,reps:3}],overrides:{keep:true},checkins:[{energy:4}],decisions:[{approved:false}],sentinel:'preserve'};}
function rewriteCRC(bytes){const b=Buffer.from(bytes),n=g.crc(b.subarray(0,12));b.writeUInt16LE(n,12);b.writeUInt16LE(g.crc(b.subarray(0,-2)),b.length-2);return b;}
test('historical paused FIT uses authoritative totals, unsigned HR and separate duration semantics',async()=>{
 const row=await prepare();assert.equal(row.date,fixture.START);assert.equal(row.km,6);assert.equal(row.min,30);assert.equal(row.timerMinutes,30);assert.equal(row.elapsedMinutes,40);assert.equal(row.movingMinutes,1700/60);assert.equal(row.durationBasis,'timer');assert.equal(row.avgHr,180);assert.equal(row.maxHr,190);assert.equal(row.pace,'5:00/km');assert.equal(row.totalsSource,'FIT session');
 assert.equal(row.outcome,'unconfirmed');assert.equal(row.source,'garmin-local');assert.match(row.sourceFileHash,/^[a-f0-9]{64}$/);assert.notEqual(row.importedAt,row.date);
});
test('same bytes retain SHA-256 identity after renaming; duplicate merge is refused without mutation',async()=>{
 const a=await prepare(),b=await prepare(fixture.fit(),'renamed.FIT');assert.equal(a.sourceFileHash,b.sourceFileHash);assert.equal(a.sourceActivityId,b.sourceActivityId);
 const before=state(),snapshot=structuredClone(before),next=g.merge(before,a);assert.deepEqual(before,snapshot);assert.equal(next.runs.length,before.runs.length+1);assert.equal(g.review(next,b).duplicate,true);assert.throws(()=>g.merge(next,b),/already been imported/);assert.equal(next.runs.length,before.runs.length+1);
});
test('corrupt, truncated, compressed, developer and non-activity FIT fail closed',async()=>{
 for(const bytes of [fixture.fit({corrupt:true}),fixture.fit({truncated:true}),fixture.fit({developer:true})])assert.throws(()=>g.parseFIT(Uint8Array.from(bytes).buffer));
 assert.throws(()=>g.parseFIT(Uint8Array.from(fixture.fit({compressed:true})).buffer),/Compressed/);
 const workout=fixture.fit();workout[24]=5;assert.throws(()=>g.parseFIT(Uint8Array.from(rewriteCRC(workout)).buffer),/activity|Unsupported|definition/);
 const noCommit=state(),before=structuredClone(noCommit);await assert.rejects(()=>prepare(fixture.fit({corrupt:true})),/checksum/);assert.deepEqual(noCommit,before);
});
test('missing optional FIT summaries use labelled fallbacks without inventing timer/moving values',()=>{
 const row=g.parseFIT(Uint8Array.from(fixture.fit({omit:[2,8,9,16,17,59]})).buffer);assert.equal(row.date,fixture.START);assert.equal(row.km,6);assert.equal(row.min,40);assert.equal(row.timerMinutes,null);assert.equal(row.movingMinutes,null);assert.equal(row.durationBasis,'elapsed');assert.equal(row.avgHr,185);assert.equal(row.maxHr,190);assert.equal(row.totalsSource,'FIT records');assert.match(row.warnings.join(' '),/cumulative record distance/);assert.match(row.warnings.join(' '),/includes pauses/);assert.match(row.warnings.join(' '),/unweighted/);
});
test('multisession FIT is rejected rather than silently selecting or combining activity totals',()=>{assert.throws(()=>g.parseFIT(Uint8Array.from(fixture.fit({multiSession:true})).buffer),/one running session/)});
test('file identity and unsupported-format failures do not add training records',async()=>{
 await assert.rejects(()=>g.prepareFile(file(fixture.fit(),'run.csv'),{crypto}),/FIT, TCX or GPX/);
 await assert.rejects(()=>g.prepareFile(file(),{crypto:{}}),/identification|HTTPS/);
 await assert.rejects(()=>g.prepareFile({...file(),size:26*1024*1024},{crypto}),/25 MB/);
});
test('association a day early preserves activity date and partial/interrupted/modified never complete prescription',async()=>{
 const row=await prepare(),before=state(),snapshot=structuredClone(before),target=garmin.plannedSessions(before,row).find(t=>t.plannedDate==='2026-10-31');assert.ok(target);
 for(const outcome of ['unconfirmed','partial','interrupted','modified']){
  const next=g.merge(before,row,{plannedKey:target.key,outcome});const saved=next.runs.at(-1);assert.equal(saved.date,fixture.START);assert.equal(saved.activityAssociation.plannedDate,'2026-10-31');assert.equal(saved.activityAssociation.distance,1);assert.equal(saved.outcome,outcome);assert.equal(saved.sessionId,undefined);assert.equal(saved.week,undefined);assert.deepEqual(next.completedWorkouts,before.completedWorkouts);
 }
 assert.deepEqual(before,snapshot);
 const full=g.merge(before,row,{plannedKey:target.key,outcome:'completed'});assert.equal(full.runs.at(-1).date,fixture.START);assert.equal(full.runs.at(-1).sessionId,target.id);assert.equal(full.completedWorkouts.at(-1).date,fixture.START);assert.equal(full.completedWorkouts.at(-1).plannedDate,'2026-10-31');assert.equal(full.completedWorkouts.at(-1).completedRun,true);
 for(const k of Object.keys(before).filter(k=>!['runs','completedWorkouts'].includes(k)))assert.deepEqual(full[k],before[k]);assert.deepEqual(full.runs[0],before.runs[0]);
});
test('existing API/manual history is review-only and cannot be silently overwritten or duplicated',async()=>{
 const row=await prepare(),before=state();before.runs.push({source:'garmin-personal',sourceActivityId:'42',date:row.date,km:row.km,min:row.min,avgHr:175,notes:'original'});const snapshot=structuredClone(before);
 assert.equal(g.review(before,row).matches.length,1);assert.throws(()=>g.merge(before,row),/similar activity/);assert.deepEqual(before,snapshot);const next=g.merge(before,row,{acknowledgeMatch:true});assert.deepEqual(next.runs.slice(0,-1),before.runs);assert.deepEqual(next.completedWorkouts,before.completedWorkouts);
});
test('failed storage return or exception leaves persisted and published state untouched; retry saves once',async()=>{
 const row=await prepare(),current=state(),original=structuredClone(current);let memory=current,stored=JSON.stringify(current),applied=0;
 const handlers={getData:()=>memory,persist:()=>false,apply:next=>{memory=next;applied++}};assert.throws(()=>g.saveReviewed(handlers,row,{}),/Could not save/);assert.strictEqual(memory,current);assert.deepEqual(memory,original);assert.equal(stored,JSON.stringify(original));assert.equal(applied,0);
 handlers.persist=()=>{throw Error('synthetic quota failure')};assert.throws(()=>g.saveReviewed(handlers,row,{}),/quota/);assert.strictEqual(memory,current);assert.equal(stored,JSON.stringify(original));assert.equal(applied,0);
 handlers.persist=next=>{stored=JSON.stringify(next);return true};g.saveReviewed(handlers,row,{});assert.equal(applied,1);assert.deepEqual(memory,JSON.parse(stored));assert.equal(memory.runs.length,original.runs.length+1);assert.deepEqual(current,original);
});
test('stale/occupied planned targets and invalid outcomes cannot alter state',async()=>{
 const row=await prepare(),before=state(),snapshot=structuredClone(before);assert.throws(()=>g.merge(before,row,{plannedKey:'stale',outcome:'completed'}),/changed|seven days/);assert.throws(()=>g.merge(before,row,{outcome:'assumed'}),/outcome/);assert.deepEqual(before,snapshot);
 const target=garmin.plannedSessions(before,row).find(t=>t.parentId);assert.ok(target);const next=g.merge(before,row,{plannedKey:target.key,outcome:'completed'});assert.equal(next.completedWorkouts.at(-1).id,target.id);assert.notEqual(next.completedWorkouts.at(-1).id,target.parentId);const other=await prepare(fixture.fit({hr:181}),'other.fit');assert.throws(()=>g.merge(next,other,{plannedKey:target.key,outcome:'completed',acknowledgeMatch:true}),/already completed/);
});
