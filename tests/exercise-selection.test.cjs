const test=require('node:test');
const assert=require('node:assert/strict');
const {createProfileEngine}=require('../src/coach-adapters.js');
const profile=require('./athletes/profiles.cjs')[0].config;

test('optional arm variants never duplicate required elbow-extension work across blocks',()=>{
 const {engine,config}=createProfileEngine({...profile,weeks:20,strengthTargetDate:null,runningTargetDate:null,coachingPolicy:'review-v2',exerciseSelectionVersion:2});
 let inspected=0,retainedBiceps=0;
 for(let week=1;week<=20;week++)for(const session of engine.generatedSessions(config,week)){
  const triceps=session.ex.filter(e=>/pushdown|triceps? extension/i.test(e[0]));
  if(triceps.some(e=>!e[5]?.optional)){
   inspected++;
   assert.equal(triceps.filter(e=>e[5]?.optional).length,0,`W${week}: ${session.name}`);
  }
  const firstOptional=session.ex.findIndex(e=>e[5]?.optional);
  if(firstOptional>=0)assert.ok(session.ex.slice(firstOptional).every(e=>e[5]?.optional),'Optional work finishes every generated session');
  retainedBiceps+=session.ex.filter(e=>e[5]?.optional&&/curl/i.test(e[0])).length;
  for(const ex of session.ex)if(ex[5]?.role==='backoff')assert.equal(session.ex[ex[5].topIndex]?.[5]?.role,'top');
 }
 assert.ok(inspected>0);assert.ok(retainedBiceps>0,'Useful non-duplicate optional work remains');
});

test('required triceps capacity remains and optional preferences are respected',()=>{
 const {engine,config}=createProfileEngine({...profile,weeks:12,strengthTargetDate:null,runningTargetDate:null,coachingPolicy:'review-v2',exerciseSelectionVersion:2}, {data:{accessoryPreferences:{'Cable biceps curl':'avoid'}}});
 const sessions=engine.generatedSessions(config,1);
 assert.ok(sessions.some(s=>s.ex.some(e=>e[0]==='Triceps pushdown'&&!e[5]?.optional)));
 assert.ok(sessions.every(s=>s.ex.every(e=>e[0]!=='Cable biceps curl')));
});

test('execution order places optional compound or isolation after every mandatory exercise without mutating saved sets',()=>{
 const {engine}=createProfileEngine(profile);
 const session={ex:[['Bench',1,5,120,8,{role:'top'}],['Optional row',2,10,20,7,{optional:true}],['Bench',3,5,100,7,{role:'backoff',topIndex:0}],['Cable biceps curl',2,12,10,7,{optional:true}],['Triceps pushdown',2,12,20,7]]};
 const before=JSON.stringify(session),ordered=engine.orderSessionExercises(session);
 assert.deepEqual(ordered.ex.map(e=>e[0]),['Bench','Bench','Triceps pushdown','Optional row','Cable biceps curl']);
 assert.equal(ordered.ex[1][5].topIndex,0);
 assert.equal(JSON.stringify(session),before);
 assert.deepEqual(engine.orderSessionExercises(ordered),ordered);
});
