const test=require('node:test'),assert=require('node:assert/strict');
const bridge=require('../src/intervals-sync');
const structured={target:'PACE',workout_doc:{steps:[{distance:1000,pace:{start:465,end:420,units:'secs/km'}},{distance:400,pace:{start:400,end:385,units:'secs/km'}},{distance:200,pace:{value:420,units:'secs/km'}}]}};
const fixture={name:'Intervals',steps:[{name:'Warm-up',distanceKm:1,pace:'7:00 to 7:45/km'},{name:'Interval',distanceKm:.4,pace:'6:25 to 6:40/km'},{name:'Recovery',distanceKm:.2,pace:'7:00/km'}],sessionId:'november-2026-tue:0',date:'2026-10-27'};
test('planned calendar payload carries absolute pace steps, local date and stable upsert identity',()=>{
 const before=JSON.stringify(fixture),a=bridge.workoutEvent(fixture),b=bridge.workoutEvent(fixture);
 assert.equal(a.external_id,b.external_id);assert.notEqual(a.external_id,bridge.workoutEvent({...fixture,date:'2026-10-28'}).external_id);
 assert.equal(a.start_date_local,'2026-10-27T00:00:00');assert.equal(a.category,'WORKOUT');assert.equal(a.type,'Run');assert.equal(a.target,'PACE');assert.equal(a.filename,undefined);assert.equal(a.file_contents_base64,undefined);assert.equal(a.workout_doc,undefined);
 assert.equal(a.description,'- Warmup 1km 7:45-7:00/km Pace\n- Interval 0.4km 6:40-6:25/km Pace\n- Recovery 0.2km 7:00/km Pace');assert.equal(JSON.stringify(fixture),before);
 assert.throws(()=>bridge.workoutEvent({...fixture,date:'2026-02-30'}),/valid/);assert.throws(()=>bridge.workoutEvent({...fixture,sessionId:''}),/scheduled/);
});
test('API requests use fixed host, private auth headers and one explicit upsert; no retries or credential leakage',async()=>{
 const calls=[],key='fake-test-key-123';const fetchImpl=async(url,options)=>{calls.push({url,options});return {ok:true,json:async()=>options.method==='GET'?{id:'i123',name:'Test athlete'}:[{id:77,...structured}]}};
 assert.deepEqual(await bridge.checkConnection(key,{fetchImpl}),{id:'i123',name:'Test athlete'});assert.equal(calls.length,1);assert.equal(calls[0].options.method,'GET');
 const event=bridge.workoutEvent(fixture);assert.deepEqual(await bridge.sendWorkout(key,event,{fetchImpl}),{id:77,date:'2026-10-27'});
 assert.equal(calls.length,2);assert.equal(calls[1].url,'https://intervals.icu/api/v1/athlete/0/events/bulk?upsert=true');assert.deepEqual(JSON.parse(calls[1].options.body),[event]);
 for(const call of calls){assert.equal(call.options.credentials,'omit');assert.equal(call.options.redirect,'error');assert.equal(call.options.referrerPolicy,'no-referrer');assert.equal(call.options.headers.Authorization,'Basic '+btoa('API_KEY:'+key));assert.ok(!call.url.includes(key));assert.ok(!(call.options.body||'').includes(key));}
});
test('auth, network and ambiguous responses cannot claim a successful upload',async()=>{
 for(const code of [401,403,429,500])await assert.rejects(bridge.sendWorkout('fake-test-key',bridge.workoutEvent(fixture),{fetchImpl:async()=>({ok:false,status:code})}));
 let count=0;await assert.rejects(bridge.sendWorkout('fake-test-key',bridge.workoutEvent(fixture),{fetchImpl:async()=>{count++;throw new TypeError('network')}}),/check the Intervals calendar/i);assert.equal(count,1);
 await assert.rejects(bridge.sendWorkout('fake-test-key',bridge.workoutEvent(fixture),{fetchImpl:async()=>({ok:true,json:async()=>[]})}),/not confirmed/);
 await assert.rejects(bridge.checkConnection('fake-test-key',{fetchImpl:async()=>({ok:true,json:async()=>({})})}),/verify/);
});


test('short nonempty keys reach the service; invalid credentials are decided by Intervals, not a guessed length',async()=>{
 let contacted=false;await assert.rejects(bridge.checkConnection('1234567',{fetchImpl:async()=>{contacted=true;return {ok:false,status:401}}}),/did not authorise/);assert.equal(contacted,true);
 contacted=false;await assert.rejects(bridge.checkConnection('',{fetchImpl:async()=>{contacted=true}}),/Paste your/);assert.equal(contacted,false);
});

test('native export preserves each distance and pace regardless of display environment',()=>{
 assert.equal(bridge.workoutEvent({...fixture,environment:'treadmill'}).description,bridge.workoutEvent(fixture).description);
 assert.equal(bridge.workoutDescription([{label:'Threshold interval 1 of 3',distanceKm:.8,pace:'6:30–6:40/km'}]),'- Threshold interval of 0.8km 6:40-6:30/km Pace');
 assert.equal(bridge.workoutDescription([{label:'Easy',distanceKm:2,pace:''}]),'- Easy 2km');
 for(const pace of ['88-90% Pace','9 km/h','6:30/mi','bad pace','0:00/km'])assert.throws(()=>bridge.workoutDescription([{distanceKm:1,pace}]));
 for(const distanceKm of [0,-1,NaN,Infinity])assert.throws(()=>bridge.workoutDescription([{distanceKm,pace:'7:00/km'}]));
 assert.throws(()=>bridge.workoutDescription([]));
});

test('upload confirmation requires parsed distances and absolute pace ranges, not merely a calendar id',async()=>{
 const event=bridge.workoutEvent(fixture);
 assert.doesNotThrow(()=>bridge.verifyStructuredPaces(event,structured));
 for(const saved of [{id:77},{...structured,target:'POWER'},{workout_doc:{steps:[]}},{workout_doc:{steps:structured.workout_doc.steps.map(s=>({...s,pace:null}))}},{workout_doc:{steps:structured.workout_doc.steps.map(s=>({...s,distance:99}))}},{workout_doc:{steps:structured.workout_doc.steps.map(s=>({...s,pace:{start:70,end:80,units:'%pace'}}))}}]){
  await assert.rejects(bridge.sendWorkout('fake-test-key',event,{fetchImpl:async()=>({ok:true,json:async()=>[{id:77,...saved}]})}),/structured pace targets were not confirmed/);
 }
});
