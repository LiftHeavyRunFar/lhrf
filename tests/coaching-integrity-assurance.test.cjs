// Priya's independent integrity controls. No production data, storage or network.
const test=require('node:test'),assert=require('node:assert/strict');
const coach=require('../src/coach-engine'),adapters=require('../src/coach-adapters');
const visits=require('../src/coach-constraints'),garmin=require('../src/garmin-workout');
const {makeAthletes,clock,clone}=require('./fixtures/independent-coaching-inputs.cjs');
const baseline=require('../docs/independent-coaching-audit/three-athlete-evidence.json');
const now=()=>Date.parse(clock);
const identity={role:'top',category:'primary',policy:'general-strength-v2',exerciseId:'bench',
 variantId:'bench-competition',loadType:'external-kg',doseUnit:'reps',execution:'competition-paused',trainingRole:'heavy'};
function trendFixture(){
 const config={programmeId:'assurance-trend',coachingRulesVersion:2,coachingPolicy:'review-v2',weeks:12,
  bench:1,priority:'Bench',trainingAge:'advanced',startDate:'2026-11-02'};
 const dates=['2026-11-08','2026-11-15','2026-11-22','2026-11-29'];
 const session=date=>({id:'bench-sunday',day:'Sun',scheduledDate:date,
  ex:[['Bench',1,3,100,8,{...identity}]],runs:[]});
 return {activeCustomWeek:4,customRoadmap:config,activeSchedule:[session(dates[3])],
  reviewedProgramme:{config:clone(config),weeks:dates.map((date,i)=>({week:i+1,sessions:[session(date)]}))},
  sets:dates.slice(0,3).map((date,i)=>({date:date+'T09:00:00Z',exercise:'Bench',weight:100+i*2.5,
   reps:3,rpe:7,target:8,week:i+1,sessionId:'bench-sunday::strength',...identity})),
  runs:[],completedWorkouts:[],checkins:[],sessionFeedback:[],decisions:[]};
}
function trend(data,stamp='2026-11-28T12:00:00Z'){
 const before=JSON.stringify(data),decision=coach.createEngine({data,now:()=>Date.parse(stamp)}).reviewDecision();
 assert.equal(JSON.stringify(data),before);return decision;
}
function completedRoute(data,actualDates){
 data.completedWorkouts=data.reviewedProgramme.weeks.slice(0,3).map((w,i)=>({id:'bench-sunday::strength',week:w.week,day:'Sun',
  date:actualDates[i]+'T10:00:00Z',prescription:{ex:clone(w.sessions[0].ex),runs:[]}}));
 data.sets.forEach((s,i)=>{s.date=actualDates[i]+'T09:00:00Z';delete s.execution;});
 delete data.reviewedProgramme;return data;
}
const easy=()=>({role:'easy-run',name:'Easy aerobic run',distanceKm:10,minutes:60,
 durationRangeMinutes:{min:55,max:60},workMinutes:0,rpe:3.5,pace:'5:30 to 6:00/km',
 steps:[{label:'Easy run',role:'easy',distanceKm:10,pace:'5:30 to 6:00/km'}],structure:'10000 m easy run'});
function state(approved){return {sets:[{date:'2026-11-02',exercise:'Bench',weight:80,reps:5,rpe:8,originalRpe:8}],
 runs:[{date:'2026-11-03',source:'garmin-personal',sourceActivityId:'synthetic-kept',km:5,min:30,
  activityAssociation:{sessionId:'old-run',plannedDate:'2026-11-03',prescription:{runs:[easy()]}}}],
 completedWorkouts:[{id:'old-run',date:'2026-11-03',prescription:{runs:[easy()]}}],
 overrides:{historical:{setDelta:-1}},decisions:[{approved,kind:'hybrid-load',week:2,key:'assurance-accepted',intervention:'running-duration',factor:.9}]};}
function fit(){return visits.fitSessions({sessionTimeVersion:1,availableDays:['Tue'],
 visitConstraints:{minutes:{Tue:75}}},[{id:'upcoming',day:'Tue',ex:[],runs:[easy()]}]).sessions;}
function decodedDistances(bytes){
 const view=new DataView(bytes.buffer,bytes.byteOffset,bytes.byteLength),end=14+view.getUint32(4,true),defs={},distances=[];let p=14;
 while(p<end){const head=bytes[p++],local=head&15;
  if(head&64){p++;assert.equal(bytes[p++],0);const global=view.getUint16(p,true);p+=2;const n=bytes[p++],fields=[];
   for(let i=0;i<n;i++)fields.push({number:bytes[p++],size:bytes[p++],type:bytes[p++]});defs[local]={global,fields};
  }else{const def=defs[local];assert.ok(def);for(const field of def.fields){
    if(def.global===27&&field.number===2)distances.push(view.getUint32(p,true)/100000);p+=field.size;
  }}
 }assert.equal(p,end);assert.equal(garmin.crc(bytes),0);return distances;
}
test('independent assurance: saved A B C policies remain exactly the PR128 evidence baseline on reload',()=>{
 for(const athlete of makeAthletes()){
  const saved=baseline.athletes.find(a=>a.id===athlete.id).programme;
  const before=JSON.stringify(athlete),actual=adapters.buildProgramme(clone(saved.config),{data:athlete.data,now});
  // The PR128 artifact is JSON: compare the same serialization boundary, rather
  // than treating an in-memory undefined metadata key as a prescription change.
  assert.deepEqual(clone(actual),saved,athlete.id);
  assert.equal(JSON.stringify(athlete),before,athlete.id);
 }
});
test('independent assurance: rejected and missing approval cannot alter executable future work or stored evidence',()=>{
 for(const approved of [false,undefined]){const data=state(approved),sessions=fit(),snapshot=JSON.stringify({data,sessions});
  coach.createEngine({data,now}).applyApprovedHybridRunning(sessions,2);
  assert.equal(JSON.stringify({data,sessions}),snapshot);
 }
});
test('independent assurance: approved reduction exports its actual reduced distance while preserving original RPE, completed prescriptions and Garmin links',()=>{
 const data=state(true),source=JSON.stringify(data),sessions=fit(),original=clone(sessions),engine=coach.createEngine({data,now});
 const result=engine.applyApprovedHybridRunning(sessions,2),run=result[0].runs[0];
 assert.equal(run.hybridAdjustment.status,'applied');assert.equal(run.minutes,54);assert.ok(run.distanceKm<10);
 assert.deepEqual(run.hybridAdjustment.originalPrescription,original[0].runs[0]);
 assert.equal(JSON.stringify(data),source);assert.ok(result[0].timeBudget.totalMinutes<original[0].timeBudget.totalMinutes);
 assert.deepEqual(decodedDistances(garmin.encodeWorkout({name:run.name,steps:run.steps,createdAt:now()})),run.steps.map(s=>s.distanceKm));
 assert.deepEqual(decodedDistances(garmin.encodeWorkout({steps:data.completedWorkouts[0].prescription.runs[0].steps,createdAt:now()})),[10]);
 const once=JSON.stringify(result);engine.applyApprovedHybridRunning(result,2);assert.equal(JSON.stringify(result),once);
 // Reconstruct the unchanged approved baseline; withdrawing this synthetic decision
 // restores it without rewriting or attempting to undo completed activity evidence.
 data.decisions=[];assert.deepEqual(coach.createEngine({data,now}).applyApprovedHybridRunning(fit(),2),original);
});
test('independent assurance: event and protected long-run prescriptions remain exact under a legitimate approved reduction',()=>{
 const data=state(true),long={...easy(),name:'Long aerobic run',role:'long-run'},race={...easy(),name:'10K event',role:'race'};
 const sessions=[{id:'long',ex:[],runs:[long]},{id:'race',eventDate:'2026-11-15',eventType:'running',ex:[],runs:[race]}],before=clone(sessions);
 coach.createEngine({data,now}).applyApprovedHybridRunning(sessions,2);assert.deepEqual(sessions,before);
});
test('independent assurance: canonical legacy threshold labels preserve every work and recovery step',()=>{
 const steps=[{label:'Warm-up',distanceKm:2,pace:'6:00/km'}];
 for(let i=0;i<4;i++){steps.push({label:'Threshold interval '+(i+1)+' of 4',distanceKm:1,pace:'5:00/km'});
  if(i<3)steps.push({label:'Easy recovery',distanceKm:.2,pace:'6:00/km'});}
 steps.push({label:'Cool-down',distanceKm:1,pace:'6:00/km'});
 const quality={role:'quality-run',name:'Controlled threshold intervals',steps,distanceKm:7.6,minutes:42,
  durationRangeMinutes:{min:42,max:42},workMinutes:20};
 const long={role:'long-run',name:'Long aerobic run',distanceKm:15,minutes:90,
  durationRangeMinutes:{min:90,max:90},steps:[{label:'Easy run',distanceKm:15,pace:'6:00/km'}]};
 const sessions=[{id:'quality',ex:[],runs:[clone(quality)]},{id:'long',ex:[],runs:[long]}];
 const result=coach.createEngine({data:state(true),now}).applyApprovedHybridRunning(sessions,2)[0].runs[0];
 assert.equal(result.hybridAdjustment.status,'applied');assert.ok(result.minutes<42);
 assert.deepEqual(result.steps.filter(s=>/Threshold interval|recovery/i.test(s.label)).map(s=>[s.label,s.distanceKm,s.pace]),
  quality.steps.filter(s=>/Threshold interval|recovery/i.test(s.label)).map(s=>[s.label,s.distanceKm,s.pace]));
 assert.equal(result.workMinutes,20);assert.deepEqual(result.hybridAdjustment.originalPrescription,quality);
});
test('independent assurance: conflicting numeric and FIT pace bounds are deferred without reducing the workout',()=>{
 for(const run of [
  {role:'easy-run',distanceKm:10,minutes:61,durationRangeMinutes:{min:60,max:61},
   steps:[{role:'easy',label:'Easy run',distanceKm:10,paceSeconds:360,pace:'9:00 to 9:10/km'}]},
  {role:'easy-run',pace:'3:00/km',distanceKm:10,minutes:60,durationRangeMinutes:{min:60,max:60},
   steps:[{role:'easy',label:'Easy run',distanceKm:10,pace:'6:00/km'}]}
 ]){
  const result=coach.createEngine({data:state(true),now}).applyApprovedHybridRunning([{id:'conflict',ex:[],runs:[clone(run)]}],2)[0].runs[0];
  assert.equal(result.hybridAdjustment.status,'not-applied');assert.equal(result.distanceKm,10);
  assert.deepEqual(result.steps,run.steps);assert.equal(result.minutes,run.minutes);
 }
});
test('independent assurance: an unsupported timed quality prescription cannot silently become an easy run',()=>{
 const run={role:'quality-run',name:'Timed threshold',distanceKnown:false,distanceKm:0,minutes:30,
  durationRangeMinutes:{min:30,max:30},workMinutes:20,
  steps:[{label:'Threshold work',role:'work',minutes:20,distanceKm:0},
   {label:'Easy recovery',role:'recovery',minutes:10,distanceKm:0}]};
 const result=coach.createEngine({data:state(true),now}).applyApprovedHybridRunning([{id:'timed-quality',ex:[],runs:[clone(run)]}],2)[0].runs[0];
 assert.equal(result.hybridAdjustment.status,'not-applied');assert.equal(result.minutes,30);
 assert.deepEqual(result.steps,run.steps);assert.equal(result.workMinutes,20);
});
test('independent assurance: genuine recurring completed visits allow optional progression through both supported provenance routes',()=>{
 for(const completedOnly of [false,true]){
  const data=trendFixture();
  if(completedOnly){
   data.completedWorkouts=data.reviewedProgramme.weeks.slice(0,3).map(w=>({id:'bench-sunday::strength',week:w.week,day:'Sun',
    date:w.sessions[0].scheduledDate+'T10:00:00Z',prescription:{ex:clone(w.sessions[0].ex),runs:[]}}));
   delete data.reviewedProgramme;
   // Current app logs can lack execution; preserved actual purpose supplies it.
   for(const row of data.sets)delete row.execution;
  }
  const decision=trend(data);assert.equal(decision.status,'progress');assert.equal(decision.changes[0].loadFactor,1.025);
  assert.equal(decision.evidence.length,3);assert.ok(decision.evidence.every(x=>x.source===(completedOnly?'completed-prescription':'reviewed-snapshot')));
  assert.match(decision.summary,/not proof of a physiological adaptation/);
 }
});
test('independent assurance: actual C registered standard squat retains progression coverage without inventing an execution subtype',()=>{
 const athlete=makeAthletes()[2],programme=adapters.buildNewProgramme(athlete.config,{data:athlete.data,now});
 const config={...clone(programme.config),programmeId:'assurance-C-standard',priority:'Squat'};
 const data={customRoadmap:config,activeCustomWeek:4,activeSchedule:clone(programme.weeks[3].sessions),
  reviewedProgramme:{config:clone(config),weeks:clone(programme.weeks)},sets:[],runs:[],
  completedWorkouts:[],checkins:[],sessionFeedback:[],decisions:[]};
 for(let i=0;i<3;i++){
  const session=programme.weeks[i].sessions.find(s=>s.ex.some(e=>e[0]==='Squat'&&e[5]?.role==='top'));
  const ex=session.ex.find(e=>e[0]==='Squat'&&e[5]?.role==='top'),meta=ex[5];
  assert.equal(meta.execution,undefined);
  data.sets.push({date:['2026-11-09','2026-11-16','2026-11-23'][i]+'T10:00:00Z',exercise:'Squat',
   sessionId:session.id+'::strength',week:i+1,weight:105+i*2.5,reps:ex[2],target:ex[4],rpe:ex[4]-1,
   role:'top',exerciseId:meta.exerciseId,variantId:meta.variantId,loadType:meta.loadType,doseUnit:meta.doseUnit});
 }
 const decision=trend(data,'2026-11-30T08:00:00Z');
 assert.equal(decision.status,'progress');assert.equal(decision.changes[0].exercise,'Squat');
 assert.ok(data.sets.every(row=>!Object.hasOwn(row,'execution')));
});
test('independent assurance: delayed genuine recurring visits remain eligible while dense catch-up aliases do not prove sustained evidence',()=>{
 const delayed=completedRoute(trendFixture(),['2026-11-09','2026-11-16','2026-11-23']);
 assert.equal(trend(delayed).status,'progress','One-day reschedules retain weekly comparable practice');
 const dense=completedRoute(trendFixture(),['2026-11-25','2026-11-26','2026-11-27']);
 assert.notEqual(trend(dense).status,'progress','Completing old weekly source slots within48h does not make a sustained trend');
});
test('independent assurance: false identities, purpose, invalid effort and failed/warm-up aliases never earn extra progression',()=>{
 for(const extra of [{failed:true},{techniqueFailed:true},{warmup:true},{warmUp:true},{optional:true},
  {category:'warm-up'},{category:'optional'},{rpeReliable:false},{evidenceReview:{rpe:{approximate:true}}},
  {trainingRole:'speed'},{benchRole:'speed'},{trainingPurpose:'recovery'},{execution:'touch-and-go'},
  {variantId:'other-setup'},{target:9},{reps:4},{role:'backoff'}]){
  const data=trendFixture();for(const row of data.sets)Object.assign(row,extra);
  assert.notEqual(trend(data).status,'progress',JSON.stringify(extra));
 }
 const unknown=trendFixture();
 for(const row of unknown.sets)for(const key of ['exerciseId','variantId','loadType','doseUnit','execution'])delete row[key];
 for(const session of [...unknown.activeSchedule,...unknown.reviewedProgramme.weeks.flatMap(w=>w.sessions)])
  for(const key of ['exerciseId','variantId','loadType','doseUnit','execution'])delete session.ex[0][5][key];
 assert.notEqual(trend(unknown).status,'progress','Unknown source and recorded setup cannot be treated as exact comparable execution');
});
test('independent assurance: dense, duplicated, stale, future and provenance-free rows cannot impersonate recurring completed visits',()=>{
 for(const change of [
  data=>data.sets.forEach((s,i)=>s.date=['2026-11-25','2026-11-26','2026-11-27'][i]),
  data=>data.sets.forEach(s=>{s.date='2026-11-22';s.week=3;}),
  data=>data.sets.forEach((s,i)=>s.date=['2020-11-08','2020-11-15','2020-11-22'][i]),
  data=>data.sets.forEach((s,i)=>s.date=['2027-11-08','2027-11-15','2027-11-22'][i]),
  data=>{delete data.reviewedProgramme;},
  data=>{data.sets.pop();},
  data=>{data.activeCustomWeek=3;}
 ]){const data=trendFixture();change(data);assert.notEqual(trend(data).status,'progress');}
 const missed=trendFixture();missed.activeCustomWeek=5;missed.activeSchedule[0].scheduledDate='2026-12-06';
 assert.notEqual(trend(missed,'2026-12-05T12:00:00Z').status,'progress','Uncompleted latest due November29 visit blocks extra progression');
 const incomplete=trendFixture();incomplete.reviewedProgramme.weeks.pop();
 incomplete.activeCustomWeek=8;incomplete.activeSchedule[0].scheduledDate='2026-12-27';
 assert.notEqual(trend(incomplete,'2026-12-26T12:00:00Z').status,'progress',
  'Missing reviewed weeks4–7 cannot make old November evidence current for late December');
});
test('independent assurance: recovery, maintenance, event/taper, completed targets and duplicate approvals retain their safeguards',()=>{
 for(const change of [
  data=>{data.customRoadmap.strengthMode='maintenance';},
  data=>{data.customRoadmap.strengthTargetDate='2026-11-29';data.customRoadmap.weeks=4;},
  data=>{data.completedWorkouts.push({id:'bench-sunday::strength',week:4,date:'2026-11-28'});},
  data=>{data.decisions.push({key:'adaptive|4|bench'});},
  data=>{data.sessionFeedback.push({date:'2026-11-27',discomfort:'yes'});},
  data=>{data.checkins=[{date:'2026-11-26',sleep:1},{date:'2026-11-27',energy:1}];}
 ]){const data=trendFixture();change(data);assert.notEqual(trend(data).status,'progress');}
});
test('independent assurance: activation callbacks refuse a deferred adjustment before consent or live-state/history writes',()=>{
 const fs=require('node:fs'),vm=require('node:vm'),html=fs.readFileSync(require.resolve('../index.html'),'utf8');
 const declaration=name=>html.split('\n').find(line=>line.startsWith('function '+name+'('));
 const source=declaration('applyApprovedHybridRunning')+'\n'+declaration('activateCustomWeek');
 const data=state(true);data.customRoadmap={weeks:12};data.activeCustomWeek=1;
 data.activeSchedule=[{id:'original',ex:[],runs:[]}];const before=JSON.stringify(data),message={textContent:''};
 const inconsistent=easy();inconsistent.minutes=59;
 let confirms=0,saves=0,alerts=0;
 const context={data,schedule:data.activeSchedule,coachEngine:()=>coach.createEngine({data,now}),
  $:id=>id==='customWeek'?{value:2}:message,alert:()=>alerts++,confirm:()=>{confirms++;return true;},
  save:()=>saves++,generatedSessions:()=>[{id:'new',ex:[],runs:[clone(inconsistent)]}],
  ensureKnownLiftLoads:x=>x,carryForwardApprovedProgression:x=>x};
 vm.createContext(context);vm.runInContext(source,context);
 assert.throws(()=>context.activateCustomWeek(),/not activated/);
 assert.equal(JSON.stringify(data),before);assert.equal(saves,0);assert.equal(confirms,0);assert.equal(alerts,1);
 assert.match(message.textContent,/needs review/);
});
test('independent assurance: frozen running reductions cannot be falsely accepted, while mutable approval and rejection still work',()=>{
 const fs=require('node:fs'),vm=require('node:vm'),html=fs.readFileSync(require.resolve('../index.html'),'utf8');
 const start=html.indexOf('function applyWeeklyReview(approved)'),end=html.indexOf('\nfunction refresh()',start);
 assert.ok(start>=0&&end>start);const callback=html.slice(start,end);
 for(const {frozen,approved} of [{frozen:true,approved:true},{frozen:true,approved:false},{frozen:false,approved:true}]){
  const data=state(true);data.activeCustomWeek=2;data.activeSchedule=fit();
  if(frozen)data.reviewedProgramme={config:{programmeId:'frozen-assurance'},weeks:[{week:2,sessions:clone(data.activeSchedule)}]};
  const proposal={key:'new-running-review',status:'fatigue',title:'Synthetic bounded reduction',summary:'Fictional review',
   hybridIntervention:'running-duration',hybridFactor:.9,changes:[{type:'running-duration',factor:.9}]};
  const before=JSON.stringify(data),protectedBefore=JSON.stringify({sets:data.sets,runs:data.runs,
   completed:data.completedWorkouts,overrides:data.overrides,snapshot:data.reviewedProgramme,schedule:data.activeSchedule});
  const status={textContent:''};let saves=0,populates=0,refreshes=0;
  const context={data,schedule:data.activeSchedule,weeklyReviewProposal:proposal,$:()=>status,
   save:()=>saves++,populate:()=>populates++,refresh:()=>refreshes++};
  vm.createContext(context);vm.runInContext(callback,context);context.applyWeeklyReview(approved);
  assert.equal(JSON.stringify({sets:data.sets,runs:data.runs,completed:data.completedWorkouts,
   overrides:data.overrides,snapshot:data.reviewedProgramme,schedule:data.activeSchedule}),protectedBefore);
  if(frozen&&approved){
   assert.equal(JSON.stringify(data),before);assert.equal(saves,0);assert.equal(populates,0);assert.equal(refreshes,0);
   assert.match(status.textContent,/reviewed|replacement/i);assert.doesNotMatch(status.textContent,/^Approved/);
  }else{
   assert.equal(data.decisions.length,2);assert.equal(data.decisions.at(-1).approved,approved);
   assert.equal(data.decisions.at(-1).kind,'hybrid-load');assert.equal(saves,1);assert.equal(populates,1);assert.equal(refreshes,1);
   assert.match(status.textContent,approved?/Re-activate/:/kept unchanged/);
  }
 }
});
