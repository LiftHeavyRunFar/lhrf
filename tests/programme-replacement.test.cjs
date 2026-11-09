const test=require('node:test'),assert=require('node:assert/strict');
const api=require('../src/programme-replacement'),backupModule=require('../src/training-backup'),engine=require('../src/coach-engine'),adapters=require('../src/coach-adapters');
const clone=x=>JSON.parse(JSON.stringify(x)),now='2026-11-02T08:00:00Z';
function athlete(){const r=require('../docs/qa/stage-seven/regressions/Taylor.json');return {equipmentInventory:require('./equipment-fixtures.cjs').fullInventory(),athlete:{id:'synthetic-athlete',name:'Fixture'},onboardingComplete:true,onboardingAnswers:{keep:1},customRoadmap:clone(r.programme.config),activeCustomWeek:1,activeSchedule:clone(r.programme.weeks[0].sessions),sets:[],runs:[{date:'2026-10-31',sourceActivityId:'garmin-kept',source:'garmin-personal',km:5.123,min:31,avgHr:150,splits:[{km:1,min:6}]}],checkins:[{sleep:4}],sessionFeedback:[{energy:'good'}],readinessDay:'2026-11-02',decisions:[{key:'historical',approved:true}],overrides:{historical:{weight:25}},completedWorkouts:[],programmeArchive:[],futureUnknownField:{keep:true}}}
function programme(){const p=clone(require('../docs/qa/stage-seven/regressions/Taylor.json').programme);p.config.weeks=4;p.weeks=p.weeks.slice(0,4);return p}
async function setup(state=athlete()){const packet=await api.createPackage(programme(),state,{reviewedCommit:'synthetic-review',approvalContext:['Athlete reports normal recovery; no invented scores']});return {state,packet,p:api.createReplacement(state,packet,engine,{now})}}
function store(raw){const map=new Map([[api.DATA_KEY,raw]]);return {getItem:k=>map.get(k)??null,setItem:(k,v)=>map.set(k,v),removeItem:k=>map.delete(k),map}}
async function ready(x){const storage=store(JSON.stringify(x.state)),backup=await api.backupFor(x.state,storage,backupModule,now);await api.verifyBackupFile(backup.text,backup);return {storage,backup,options:{expectedRaw:JSON.stringify(x.state),backup,backupVerified:true,confirmed:true,now}}}
const dose=s=>({ex:s.ex,runs:s.runs});
test('exact reviewed prescriptions are installed under distinct stable IDs; no unrelated athlete field is changed',async()=>{
 const x=await setup(),snapshot=JSON.stringify(x.state);api.verifyPreservation(x.state,x.p.next);assert.equal(JSON.stringify(x.state),snapshot);assert.notEqual(x.p.next.customRoadmap.programmeId,x.state.customRoadmap.programmeId);assert.deepEqual(x.p.next.programmeArchive[0].programme,x.state.customRoadmap);assert.deepEqual(x.p.next.programmeArchive[0].schedule,x.state.activeSchedule);
 for(const w of x.p.next.reviewedProgramme.weeks)for(const s of w.sessions){assert.ok(s.id.startsWith(x.p.id));const original=x.packet.programme.weeks[w.week-1].sessions.find(t=>t.day===s.day);assert.deepEqual(dose(s),dose(original));}
 assert.deepEqual(x.p.next.decisions,x.state.decisions);assert.deepEqual(x.p.next.overrides,x.state.overrides);
});
test('next-week coaching review reads the approved calendar rather than regenerating it',async()=>{
 const {p:{next:state}}=await setup();
 const c=state.customRoadmap,review=()=>engine.createEngine({data:state,now:()=>Date.parse(now)}).plannedNextWeek();
 const generated=engine.createEngine({data:state,now:()=>Date.parse(now)}).generatedSessions(c,2);
 const nextWeek=state.reviewedProgramme.weeks.find(week=>week.week===2);
 const approvedLift=c.priority||'Squat';
 nextWeek.sessions=[{id:'approved-preview',phase:'Approved phase',ex:[[approvedLift,1,5,123.5,7]],runs:[]}];
 assert.ok(generated.length>1);
 assert.equal(review().sessions,1);
 assert.equal(review().phase,'Approved phase');
 assert.match(review().next,/@ 123\.5 kg/);
 nextWeek.sessions=[];
 assert.equal(review().sessions,0);
});
test('independent fingerprint and source-programme binding reject corruption or a different athlete programme',async()=>{
 const x=await setup();await api.verifyPackage(x.packet,x.packet.reviewFingerprint,x.state);const bad=clone(x.packet);bad.programme.weeks[0].sessions[0].ex[0][3]+=2.5;await assert.rejects(api.verifyPackage(bad,x.packet.reviewFingerprint,x.state),/fingerprint/);await assert.rejects(api.verifyPackage(x.packet,'0'.repeat(64),x.state));await assert.rejects(api.verifyPackage(x.packet,x.packet.reviewFingerprint,{...x.state,customRoadmap:{other:true}}),/differs/);
});
test('completed, partly logged and unlinked Garmin dates retain the whole old visit without duplicate new work',async()=>{
 const s=athlete(),tue=s.activeSchedule.find(s=>s.day==='Tue'),sat=s.activeSchedule.find(s=>s.day==='Sat');s.sets.push({sessionId:tue.id+'::strength',week:1,date:'2026-11-03',exercise:'Squat',weight:50,reps:3});s.completedWorkouts.push({id:sat.id,week:1,date:'2026-11-07'});s.runs.push({date:'2026-11-05',km:4,min:25,sourceActivityId:'unlinked'});const x=await setup(s);
 for(const date of ['2026-11-03','2026-11-05','2026-11-07']){const row=x.p.rows.find(r=>r.date===date);assert.equal(row.status,'protected');assert.ok(row.after.every(s=>s.preservedFromProgrammeId));assert.deepEqual(row.after.map(dose),row.before.map(dose));}assert.deepEqual(x.p.next.sets,s.sets);assert.deepEqual(x.p.next.runs,s.runs);
});
test('today is preserved even when unfinished; dates are correct across source and replacement week numbers',async()=>{
 const x=await setup(),p=api.createReplacement(x.state,x.packet,engine,{now:'2026-11-03T08:00:00Z'}),row=p.rows.find(r=>r.date==='2026-11-03');assert.equal(row.status,'protected');assert.deepEqual(row.after.map(dose),row.before.map(dose));assert.ok(p.next.reviewedProgramme.weeks.every(w=>w.sessions.every(s=>api.dateOf(p.next.customRoadmap,w.week,s)===s.scheduledDate)));
});
test('live or pending workouts block both activation and rollback without changing drafts',async()=>{
 const x=await setup();assert.throws(()=>api.createReplacement({...x.state,activeWorkout:{notes:'legacy unfinished'}},x.packet,engine,{now}),/Finish/);for(const patch of [{liveWorkout:{id:'kept',entries:{a:{done:true}}}},{pendingRun:{id:'pending'}}]){const before=JSON.stringify(patch);assert.throws(()=>api.createReplacement(x.state,x.packet,engine,{now,...patch}),/Finish/);assert.equal(JSON.stringify(patch),before);assert.throws(()=>api.createRollback(x.p.next,engine,{now,...patch}),/Finish/);}
});
test('fresh downloadable backup is byte-verified, retains device state and excludes credentials',async()=>{
 const x=await setup(),r=await ready(x);r.storage.setItem(api.LIVE_KEY,JSON.stringify({id:'draft',entries:{a:{done:true}},accessToken:'secret'}));const b=await api.backupFor(x.state,r.storage,backupModule,now);assert.ok(b.backup._backup.deviceState[api.LIVE_KEY].entries.a.done);assert.doesNotMatch(b.text,/secret/);await api.verifyBackupFile(b.text,b);await assert.rejects(api.verifyBackupFile(b.text+' ',b),/verification failed/);assert.equal(r.storage.getItem(api.DATA_KEY),JSON.stringify(x.state));
});
test('atomic activation requires backup, confirmation and unchanged data; repeat package is idempotent',async()=>{
 const x=await setup(),r=await ready(x);assert.throws(()=>api.commit(r.storage,x.p,{...r.options,confirmed:false}),/confirmation/);assert.throws(()=>api.commit(r.storage,x.p,{...r.options,backupVerified:false}),/backup/);const next=api.commit(r.storage,x.p,r.options);assert.deepEqual(JSON.parse(r.storage.getItem(api.DATA_KEY)),next);assert.equal(api.recovery(r.storage).status,'committed');const again=api.createReplacement(next,x.packet,engine,{now});assert.ok(again.alreadyApplied);assert.deepEqual(again.next,next);await api.verifyPackage(x.packet,x.packet.reviewFingerprint,next);
 const stale=await ready(x);stale.storage.setItem(api.DATA_KEY,JSON.stringify({...x.state,newLog:true}));assert.throws(()=>api.commit(stale.storage,x.p,stale.options),/changed/);assert.ok(JSON.parse(stale.storage.getItem(api.DATA_KEY)).newLog);
});
test('storage interruptions before the atomic write leave original data; after-write journal interruption recovers without reverting new training',async()=>{
 for(const failingKey of ['backup',api.JOURNAL_KEY,api.DATA_KEY]){const x=await setup(),r=await ready(x),set=r.storage.setItem;r.storage.setItem=(k,v)=>{if(k===failingKey||failingKey==='backup'&&k.startsWith('lhrf_replacement_backup_'))throw Error('injected quota failure');set(k,v)};assert.throws(()=>api.commit(r.storage,x.p,r.options),/injected/);assert.equal(r.storage.getItem(api.DATA_KEY),JSON.stringify(x.state));}
 const x=await setup(),r=await ready(x),set=r.storage.setItem;let journalWrites=0;r.storage.setItem=(k,v)=>{if(k===api.JOURNAL_KEY&&++journalWrites===2)throw Error('crash after main write');set(k,v)};const n=api.commit(r.storage,x.p,r.options);n.sets.push({exercise:'Bench',weight:70,reps:3,date:'2026-11-03'});set(api.DATA_KEY,JSON.stringify(n));assert.equal(api.recovery(r.storage).status,'committed');assert.equal(JSON.parse(r.storage.getItem(api.DATA_KEY)).sets.length,1);
});
test('rollback preserves newly logged training and keeps their prescribed sessions instead of adding overlapping old work',async()=>{
 const x=await setup(),n=clone(x.p.next),s=n.activeSchedule.find(s=>s.day==='Tue');n.sets.push({sessionId:s.id+'::strength',week:1,date:'2026-11-03',exercise:'Bench',weight:75,reps:3});n.runs.push({date:'2026-11-04',km:2,min:15,sourceActivityId:'new-garmin'});n.checkins.push({date:'2026-11-04',energy:4});n.completedWorkouts.push({id:s.id+'::strength',week:1,date:'2026-11-03',prescription:clone(dose(s))});const before=JSON.stringify(n),rb=api.createRollback(n,engine,{now});api.verifyPreservation(n,rb.next);assert.equal(JSON.stringify(n),before);assert.deepEqual(rb.next.customRoadmap,x.state.customRoadmap);assert.equal(rb.next.programmeActivation.status,'rolled-back');assert.deepEqual(rb.next.sets,n.sets);const row=rb.rows.find(r=>r.date==='2026-11-03');assert.ok(row.after.every(s=>s.id===row.before.find(b=>b.id===s.id)?.id));assert.equal(api.createRollback(rb.next,engine,{now}).alreadyApplied,true);assert.equal(api.createReplacement(rb.next,x.packet,engine,{now}).alreadyApplied,true);
});
test('preview on the preceding day is read-only; activation requires current-day preview at or after programme start',async()=>{
 const x=await setup(),p=api.createReplacement(x.state,x.packet,engine,{now:'2026-11-01T12:00:00Z'}),r=await ready(x);assert.throws(()=>api.commit(r.storage,p,{...r.options,now:'2026-11-01T12:00:00Z'}),/available from/);assert.throws(()=>api.commit(r.storage,p,r.options),/another day/);assert.equal(r.storage.getItem(api.DATA_KEY),JSON.stringify(x.state));
});
test('stored reviewed sessions never regenerate from later historical maximums, fatigue, or new engine evidence',async()=>{
 const x=await setup(),n=x.p.next,before=api.sessions(n,1);n.customRoadmap.baselines.Squat=500;n.sets.push({exercise:'Squat',weight:300,reps:5,rpe:9});assert.deepEqual(api.sessions(n,1),before);assert.notStrictEqual(api.sessions(n,1),n.activeSchedule);
});
test('protected old week numbers remain attached when the reviewed calendar starts a week later',async()=>{
 const s=athlete();s.customRoadmap.startDate='2026-10-26';s.activeCustomWeek=2;s.activeSchedule=engine.createEngine({data:s,now:()=>Date.parse(now)}).generatedSessions(s.customRoadmap,2);const t=s.activeSchedule.find(s=>s.day==='Tue');s.sets.push({sessionId:t.id,week:2,date:'2026-11-03',exercise:'Bench',weight:50,reps:3});const x=await setup(s),protectedSession=x.p.next.reviewedProgramme.weeks[0].sessions.find(s=>s.day==='Tue');assert.equal(protectedSession.sourceProgrammeWeek,2);assert.equal(protectedSession.scheduledDate,'2026-11-03');assert.equal(protectedSession.id,t.id);
});
test('a backup from another athlete snapshot and a newly started workout cannot authorize activation',async()=>{
 const x=await setup(),r=await ready(x),wrong=await api.backupFor({...x.state,sets:[{new:true}]},r.storage,backupModule,now);assert.throws(()=>api.commit(r.storage,x.p,{...r.options,backup:wrong}),/does not match/);r.storage.setItem(api.LIVE_KEY,JSON.stringify({id:'newly-started'}));assert.throws(()=>api.commit(r.storage,x.p,r.options),/now active/);assert.equal(r.storage.getItem(api.DATA_KEY),JSON.stringify(x.state));
});
test('package fingerprint binds athlete identity and reviewed evidence, while permitting additional genuine logs',async()=>{
 const x=await setup();await assert.rejects(api.verifyPackage(x.packet,x.packet.reviewFingerprint,{...x.state,athlete:{id:'another-athlete'}}),/different athlete/);const edited=clone(x.state);edited.runs[0].km=6;await assert.rejects(api.verifyPackage(x.packet,x.packet.reviewFingerprint,edited),/evidence/);const extra=clone(x.state);extra.sets.push({exercise:'Bench',weight:80,reps:1,date:'2026-11-01'});await api.verifyPackage(x.packet,x.packet.reviewFingerprint,extra);const tampered=clone(x.packet);tampered.sourceIdentityDigest='0'.repeat(64);await assert.rejects(api.verifyPackage(tampered,x.packet.reviewFingerprint,x.state),/fingerprint/);
});
test('native adjacent-competition recovery conditions and RPE progression survive installation without reinterpretation',async()=>{
 const state=athlete(),seed=require('./replacement-fixtures.cjs').eventProgramme();
 // A reviewed future prescription must use the recipient's confirmed setup;
 // missing intake equipment is not permission to relabel its venue on install.
 const p=adapters.buildNewProgramme({...seed.config,equipmentInventory:state.equipmentInventory},{data:state,now:()=>Date.parse(now)});
 assert.ok(p.weeks.every(w=>w.feasible));const packet=await api.createPackage(p,state,{reviewedCommit:'synthetic-current-review'}),n=api.createReplacement(state,packet,engine,{now}).next;const race=n.reviewedProgramme.weeks.flatMap(w=>w.sessions).find(s=>s.eventType==='running');assert.equal(race.eventDate,'2026-11-29');assert.equal(race.recoveryReviewRequired,true);assert.equal(race.runs[0].recoveryReviewRequired,true);assert.deepEqual(race.runs,p.weeks.at(-1).sessions.find(s=>s.eventType==='running').runs);assert.equal(n.customRoadmap.strengthModes.Squat,'maintenance');assert.equal(n.customRoadmap.strengthModes.Deadlift,'maintenance');
});
test('all nine stored Stage 7 native programmes remain exactly unchanged across 149 weeks',()=>{
 // Compare complete native objects, including undefined own properties, against
 // the actual frozen engine. Separately verify its original persisted capture.
 const fs=require('node:fs'),path=require('node:path'),os=require('node:os'),cp=require('node:child_process');
 const referenceRoot=fs.mkdtempSync(path.join(os.tmpdir(),'lhrf-stage-seven-reference-'));
 try{
  for(const name of ['coach-engine','coach-constraints','coach-adapters','running-preparation','running-workouts'])fs.writeFileSync(path.join(referenceRoot,name+'.js'),cp.execFileSync('git',['show','233f09e:src/'+name+'.js'],{cwd:path.join(__dirname,'..')}));
  const reference=require(path.join(referenceRoot,'coach-adapters.js'));
  let weeks=0;for(const id of ['O1','O2','O3','P','Q','R','S','T','Taylor']){const r=require('../docs/qa/stage-seven/regressions/'+id+'.json'),options={data:r.historicalData,now:()=>Date.parse(require('../docs/qa/stage-six/regressions/'+id+'.json').provenance.clock)},expected=reference.buildNewProgramme(r.input,options),p=adapters.buildProgramme(expected.config,options);assert.deepEqual(p,expected,id+' complete native structure');assert.deepEqual(JSON.parse(JSON.stringify(expected)),r.programme,id+' frozen persisted capture');weeks+=p.weeks.length}assert.equal(weeks,149);
 }finally{fs.rmSync(referenceRoot,{recursive:true,force:true})}
});
test('complete preview includes existing approved overrides, while new reviewed work is not silently altered',async()=>{
 const state=athlete(),s=state.activeSchedule.find(s=>s.ex.length),exercise=s.ex[0][0];state.overrides[s.id]={exercise,setDelta:-1,loadFactor:.95};const x=await setup(state),row=x.p.rows.find(r=>r.before.some(t=>t.id===s.id));assert.ok(row.before.find(t=>t.id===s.id).hasApprovedAdjustment);assert.notDeepEqual(row.before.find(t=>t.id===s.id).displayEx,s.ex);assert.deepEqual(x.p.next.overrides,state.overrides);const replaced=row.after.find(t=>!t.preservedFromProgrammeId);if(replaced)assert.deepEqual(replaced.displayEx,replaced.ex);
});
test('Garmin planned links use frozen future prescriptions and retain protected source-week identities',async()=>{
 const g=require('../src/garmin-import'),x=await setup(),n=x.p.next;const later=api.sessions(n,2).find(s=>s.runs.length),before=clone(later.runs);n.customRoadmap.runProfile.seconds=3600;const candidates=g.plannedSessions(n,{date:later.scheduledDate}),target=candidates.find(t=>t.id===later.id||(t.parentId===later.id));assert.ok(target);assert.deepEqual(target.prescription.runs,before);
 const s=athlete();s.customRoadmap.startDate='2026-10-26';s.activeCustomWeek=2;s.activeSchedule=engine.createEngine({data:s}).generatedSessions(s.customRoadmap,2);const old=s.activeSchedule.find(s=>s.day==='Thu');s.runs.push({sessionId:old.id,week:2,date:'2026-11-05',km:3,min:20});const y=await setup(s),protectedTarget=g.plannedSessions(y.p.next,{date:'2026-11-05'}).find(t=>t.id===old.id);assert.equal(protectedTarget.week,2);assert.equal(protectedTarget.calendarWeek,1);assert.equal(protectedTarget.plannedDate,'2026-11-05');
});
test('reviewed package binds the frozen calendar while retaining the protected active visit as shown',async()=>{
 const state=athlete(),native=programme();
 state.reviewedProgramme={config:clone(state.customRoadmap),weeks:clone(native.weeks)};
 const current=state.activeSchedule.find(s=>s.ex.length);
 const day=api.dateOf(state.customRoadmap,1,current);
 current.name='Current protected visit';
 const packet=await api.createPackage(native,state,{reviewedCommit:'synthetic-review'});
 await api.verifyPackage(packet,packet.reviewFingerprint,state);
 const changed=clone(state);changed.reviewedProgramme.weeks[0].sessions[0].name='Different frozen visit';
 await assert.rejects(api.verifyPackage(packet,packet.reviewFingerprint,changed),/differs/);
 const preview=api.createReplacement(state,packet,engine,{now:day+'T08:00:00Z'});
 assert.equal(preview.rows.find(r=>r.date===day).after.find(s=>s.id===current.id).name,current.name);
});
