const test=require('node:test'),assert=require('node:assert/strict');
const {createProfileEngine,buildProgramme,normalizeProfile}=require('../src/coach-adapters.js');
const profiles=require('./athletes/profiles.cjs');
const candidate={...profiles[0].config,coachingPolicy:'review-v1'};
test('short event candidate has one recovery transition, two specific weeks and event taper',()=>{
 const p=buildProgramme(candidate);assert.deepEqual(p.weeks.map(w=>w.phase),['Development','Development','Development','Specificity','Specificity','Taper / event']);
 assert.deepEqual(p.weeks.map(w=>w.deload),[false,false,true,false,false,false]);
 assert.ok(p.weeks[2].sessions.some(s=>s.reason.includes('Reduced volume separates')));
 const {engine,config}=createProfileEngine(candidate);assert.equal(engine.hybridRunWeek(config,3).deload,true);
});
test('requested bench top set replaces straight-set work and back-offs reference that top set',()=>{
 const {engine,config}=createProfileEngine({...candidate,strengthTargetDate:null,runningTargetDate:null,weeks:12});
 const sessions=engine.generatedSessions(config,1),bench=sessions.filter(s=>s.ex.some(e=>e[0]==='Bench'));
 assert.ok(bench.length>=1);
 for(const s of bench){const i=s.ex.findIndex(e=>e[0]==='Bench'&&e[5]?.role==='top');assert.ok(i>=0);assert.equal(s.ex[i][1],1);assert.ok(s.ex[i][4]<=7.5);const back=s.ex.find(e=>e[5]?.role==='backoff'&&e[5].topIndex===i);assert.ok(back);assert.ok(back[3]<s.ex[i][3]);assert.ok(s.ex[i][1]*s.ex[i][2]+back[1]*back[2]<=24)}
});
test('light lower-body constraint cannot turn into a heavy top set in any week',()=>{
 const p=buildProgramme({...candidate,maxes:{bench:160,squat:140,deadlift:180}});
 for(const week of p.weeks)for(const s of week.sessions)for(const e of s.ex){if(['Squat','Deadlift'].includes(e[0])){assert.ok(e[4]<=5.5);assert.ok(e[1]<=2);assert.equal(e[5].role,'straight');assert.ok(e[3]<=p.config.baselines[e[0]]*.60)}}
 const unknown=buildProgramme(candidate);assert.ok(unknown.weeks[0].sessions.flatMap(s=>s.ex).filter(e=>['Squat','Deadlift'].includes(e[0])).every(e=>e[3]===0),'Unknown lower-lift loads stay unknown');
});
test('candidate phase changes have recovery and retain fixed days across supported horizons',()=>{
 for(let n=4;n<=52;n++){
  const date=new Date(Date.UTC(2026,9,19+(n-1)*7+5)).toISOString().slice(0,10);
  const {engine,config}=createProfileEngine({...candidate,weeks:n,strengthTargetDate:date,runningTargetDate:null});
  for(let w=1;w<n;w++){const a=engine.candidateWeek(config,w),b=engine.candidateWeek(config,w+1);if(a.phase!==b.phase&&b.phase!=='Taper / event')assert.ok(a.deload||b.deload,'Recovery transition: '+n+' weeks, W'+w)}
 }
 const p=buildProgramme(candidate);for(const w of p.weeks.slice(0,-1)){assert.deepEqual(w.sessions.map(s=>s.day),['Tue','Thu','Fri','Sat','Sun']);assert.ok(w.sessions.find(s=>s.day==='Sat').runs.some(r=>r.role==='long-run'))}
});
test('candidate policy is opt-in and legacy programme output remains unchanged',()=>{
 const original=profiles[0].config,legacy=buildProgramme(original),changed=buildProgramme(candidate);assert.notDeepEqual(legacy.weeks,changed.weeks);assert.equal(legacy.config.coachingPolicy,undefined);
 const snapshot=JSON.stringify(original);buildProgramme(candidate);assert.equal(JSON.stringify(original),snapshot);
});

test('recovery week reduces interval work and removes optional isolation work',()=>{
 const p=buildProgramme(candidate),loading=p.weeks[1],recovery=p.weeks[2];
 const intervals=w=>w.sessions.flatMap(s=>s.runs).find(r=>r.role==='quality-run');
 assert.ok(intervals(recovery).workMinutes<intervals(loading).workMinutes);
 assert.ok(recovery.sessions.flatMap(s=>s.runs).reduce((n,r)=>n+r.distanceKm,0)<loading.sessions.flatMap(s=>s.runs).reduce((n,r)=>n+r.distanceKm,0)*.85);
 assert.ok(recovery.sessions.flatMap(s=>s.ex).every(e=>!e[5]?.optional));
});
