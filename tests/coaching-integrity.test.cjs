const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const coach=require('../src/coach-engine'),running=require('../src/running-preparation'),constraints=require('../src/coach-constraints');
const {makeAthletes,clone}=require('./fixtures/independent-coaching-inputs.cjs'),adapters=require('../src/coach-adapters');
const now=()=>Date.parse('2026-11-28T12:00:00Z'),decision={approved:true,kind:'hybrid-load',week:2,intervention:'running-duration',factor:.9,key:'approved-test',date:'2026-11-27T12:00:00Z'};
const easy=(km=10)=>({name:'Easy aerobic run',role:'easy-run',distanceKm:km,minutes:km*6,durationRangeMinutes:{min:km*6,max:km*6},workMinutes:0,steps:[{label:'Easy run',role:'easy',distanceKm:km,pace:'6:00/km'}],pace:'6:00/km'});
const apply=(sessions,patch={})=>coach.createEngine({data:{decisions:[{...decision,...patch}]},now}).applyApprovedHybridRunning(sessions,2);
function quality({legacy=false,padding=3,warm=2,cool=1.5}={}){
 const steps=[{label:'Warm-up',role:'easy',distanceKm:warm,pace:'6:00/km'}];
 for(let i=0;i<4;i++){steps.push({label:'Threshold interval '+(i+1),role:'work',distanceKm:1,paceSeconds:300,pace:'4:55/km to 5:05/km'});if(i<3)steps.push({label:'Easy recovery',role:'recovery',distanceKm:.2,pace:'6:00/km'});}
 if(padding)steps.push({label:'Easy aerobic running',role:'easy',distanceKm:padding,pace:'6:00/km'});
 steps.push({label:'Cool-down',role:'easy',distanceKm:cool,pace:'6:00/km'});
 const run=running.buildRun('Controlled threshold repeats','quality-run',steps,{easyLow:360,easyHigh:360},{workoutFamily:'threshold-repeats'});
 if(legacy)for(const step of run.steps)delete step.role;
 return run;
}
const session=run=>({id:'custom-tue',name:run.name,day:'Tue',ex:[],runs:[run]});
test('IA01 easy run updates executable distance, bounds, structure and existing visit estimates',()=>{
 const c={sessionTimeVersion:1,availableDays:['Tue'],visitConstraints:{minutes:{Tue:100}}},input=constraints.fitSessions(c,[session(easy())]).sessions,source=clone(input),result=apply(input)[0];
 assert.equal(result.runs[0].minutes,54);assert.equal(result.runs[0].distanceKm,9);assert.equal(result.runs[0].steps[0].distanceKm,9);assert.deepEqual(result.runs[0].durationRangeMinutes,{min:54,max:54});assert.equal(result.timeBudget.totalMinutes,59);assert.ok(result.runs[0].structure.startsWith('9000 m'));assert.deepEqual(result.runs[0].hybridAdjustment.originalPrescription,source[0].runs[0]);
 const once=JSON.stringify(input);apply(input);assert.equal(JSON.stringify(input),once);
});
test('IA01 trims easy padding while retaining exact quality work, recoveries, pace and purpose',()=>{
 const run=quality(),work=clone(run.steps.filter(s=>s.role==='work'||s.role==='recovery')),sessions=[session(run),session({...easy(20),name:'Long run',role:'long-run'})];
 const result=apply(sessions)[0].runs[0];assert.equal(result.hybridAdjustment.status,'applied');assert.deepEqual(result.steps.filter(s=>s.role==='work'||s.role==='recovery'),work);assert.equal(result.workMinutes,run.workMinutes);assert.equal(result.workoutFamily,run.workoutFamily);assert.equal(result.steps.find(s=>s.label==='Warm-up').distanceKm,2);assert.equal(result.steps.find(s=>s.label==='Cool-down').distanceKm,1.5);assert.ok(result.distanceKm<run.distanceKm);
});
test('IA01 an impossible quality cut retains executable work and reports not applied',()=>{
 const run=quality({padding:0,warm:1,cool:.5}),original=clone(run),sessions=[session(run),session({...easy(20),name:'Long run',role:'long-run'})],result=apply(sessions)[0].runs[0];
 assert.equal(result.hybridAdjustment.status,'not-applied');assert.deepEqual(result.steps,original.steps);assert.equal(result.minutes,original.minutes);assert.equal(result.distanceKm,original.distanceKm);assert.match(result.coachNote,/not applied/);assert.ok(sessions[0].constraintWarnings.length);const once=JSON.stringify(sessions);apply(sessions);assert.equal(JSON.stringify(sessions),once);
});
test('IA01 legacy threshold labels preserve every work repetition rather than becoming removable easy distance',()=>{
 const run=quality({legacy:true,padding:0,warm:1,cool:.5}),before=clone(run),result=apply([session(run),session({...easy(20),name:'Long run',role:'long-run'})])[0].runs[0];assert.equal(result.hybridAdjustment.status,'not-applied');assert.deepEqual(result.steps,before.steps);assert.equal(result.workMinutes,before.workMinutes);
});
test('IA01 post-reduction final weekly quality budget uses the existing ceiling',()=>{
 const a=makeAthletes()[0],p=adapters.buildNewProgramme(a.config,{data:a.data,now:()=>Date.parse('2026-11-07T12:00:00Z')}),input=clone(p.weeks[0].sessions),original=clone(input),result=coach.createEngine({data:{customRoadmap:p.config,decisions:[{...decision,week:1,factor:.75}]},now}).applyApprovedHybridRunning(input,1);
 const run=result.flatMap(s=>s.runs).find(r=>r.role==='quality-run');assert.equal(run.hybridAdjustment.status,'not-applied');assert.match(run.hybridAdjustment.reason,/quality-distance budget/);assert.deepEqual(run.steps,original.flatMap(s=>s.runs).find(r=>r.role==='quality-run').steps);
});
test('IA01 contradictory or unknown timing defers; accepted factor1 is a true no-op',()=>{
 for(const run of [{...easy(),minutes:50},{...easy(),durationRangeMinutes:{min:61,max:60}},{...easy(),pace:'Conversational',steps:[{label:'Easy',distanceKm:10,pace:'Conversational'}]},{...easy(5.1),minutes:30,durationRangeMinutes:{min:31,max:30}}]){const input=[session(run)],original=clone(run),result=apply(input)[0].runs[0];assert.equal(result.hybridAdjustment.status,'not-applied');assert.deepEqual(result.steps,original.steps);assert.equal(result.minutes,original.minutes)}
 const input=[session({...easy(),minutes:50})],before=JSON.stringify(input);apply(input,{factor:1});assert.equal(JSON.stringify(input),before);
});
test('IA01 timed unknown-distance running stays timed and unknown; short runs never grow to a15-minute floor',()=>{
 const run={name:'Timed health run',role:'easy-run',distanceKnown:false,distanceKm:0,minutes:30,durationRangeMinutes:{min:30,max:30},steps:[{label:'Easy',role:'easy',minutes:30,distanceKm:0}]},result=apply([session(run)])[0].runs[0];assert.equal(result.minutes,27);assert.equal(result.steps[0].minutes,27);assert.equal(result.distanceKnown,false);assert.equal(result.distanceKm,0);
 const short=apply([session({...easy(),minutes:10,durationRangeMinutes:{min:10,max:10},distanceKm:10/6,steps:[{label:'Easy',distanceKm:10/6,pace:'6:00/km'}]})])[0].runs[0];assert.equal(short.hybridAdjustment.status,'not-applied');assert.equal(short.minutes,10);
});
test('IA01 actual activation wrapper exposes deferred reason and stops before a caller can write its new programme',()=>{
 const source=fs.readFileSync('index.html','utf8').split('\n').find(line=>line.startsWith('function applyApprovedHybridRunning(...args)')),messages=[],node={textContent:''},sandbox={coachEngine:()=>({applyApprovedHybridRunning:()=>[{runs:[{hybridAdjustment:{status:'not-applied',reason:'Protected work cannot fit.'}}]}]}),$:()=>node,alert:message=>messages.push(message)};
 vm.createContext(sandbox);vm.runInContext(source,sandbox);assert.throws(()=>sandbox.applyApprovedHybridRunning([],2),/Programme not activated/);assert.match(node.textContent,/Protected work cannot fit/);assert.equal(messages.length,1);
});
test('IA01 actual review callback refuses unsupported frozen-plan approval without writes and retains mutable approval/rejection',()=>{
 const html=fs.readFileSync('index.html','utf8'),source=html.slice(html.indexOf('function applyWeeklyReview(approved)'),html.indexOf('function refresh()'));
 const proposal={key:'new-duration-decision',changes:[{type:'running-duration',factor:.9}],status:'fatigue',hybridIntervention:'running-duration',hybridFactor:.9,title:'Recovery adjustment',summary:'Synthetic adjustment'},history={key:'existing-decision',approved:true,kind:'hybrid-load',week:1};
 for(const [frozen,approved]of [[true,true],[false,true],[true,false]]){
  const data={activeCustomWeek:2,activeSchedule:[session(easy())],sets:[{originalRpe:8,rpe:8}],runs:[],overrides:{existing:{setDelta:-1}},decisions:[clone(history)],...(frozen?{reviewedProgramme:{id:'frozen',weeks:[{week:2,sessions:[session(easy())]}]}}:{})},before=JSON.stringify(data),status={textContent:''},calls={save:0,populate:0,refresh:0};
  const context={data,schedule:data.activeSchedule,weeklyReviewProposal:clone(proposal),$:()=>status,save:()=>calls.save++,populate:()=>calls.populate++,refresh:()=>calls.refresh++};vm.createContext(context);vm.runInContext(source,context);context.applyWeeklyReview(approved);
  if(frozen&&approved){assert.equal(JSON.stringify(data),before);assert.deepEqual(calls,{save:0,populate:0,refresh:0});assert.match(status.textContent,/separate replacement review/);assert.match(status.textContent,/Current programme unchanged/);}
  else{assert.equal(data.decisions.length,2);assert.equal(data.decisions[1].approved,approved);assert.equal(data.decisions[1].intervention,'running-duration');assert.deepEqual(calls,{save:1,populate:1,refresh:1});assert.deepEqual(data.decisions[0],history);assert.match(status.textContent,approved?/Re-activate this week/:/Plan kept unchanged/);}
 }
});
test('IA01 actual weekly totals use adjusted distances and already completed run components are protected',()=>{
 const a=makeAthletes()[2],programme=adapters.buildNewProgramme(a.config,{data:a.data,now:()=>Date.parse('2026-11-07T12:00:00Z')}),sessions=clone(programme.weeks[0].sessions),data={customRoadmap:programme.config,decisions:[{...decision,week:1}],completedWorkouts:[]};
 const completed=sessions.find(s=>s.runs.some(r=>r.role==='easy-run'));data.completedWorkouts.push({id:completed.id+'::run',parentId:completed.id,component:'run',week:1,completedRun:true,prescription:{runs:clone(completed.runs)}});
 const before=clone(completed),engine=coach.createEngine({data,now}),result=engine.applyApprovedHybridRunning(sessions,1),summary=engine.runningWeekSummary(programme.config,1,result),sum=result.flatMap(s=>s.runs).reduce((n,r)=>n+r.distanceKm,0);
 assert.deepEqual(result.find(s=>s.id===completed.id),before);assert.equal(summary.totalKm,Math.round(sum*1000)/1000);assert.deepEqual(data.completedWorkouts[0].prescription.runs,before.runs);
 const blocked=[session(quality({padding:0,warm:1,cool:.5}))];apply(blocked);assert.equal(blocked.constraintResult.feasible,false);assert.ok(blocked.constraintResult.blockingIssues.length);
});
function evidenceState({snapshot=false}={}){
 const meta={role:'top',category:'primary',trainingRole:'heavy',policy:'general-strength-v2',exerciseId:'bench',variantId:'bench-test-setup',loadType:'external-kg',doseUnit:'reps',execution:'competition-paused'},top=['Bench',1,3,100,8,meta];
 const make=(week,date)=>({id:snapshot?'reviewed-w'+week:'custom-sun',day:'Sun',scheduledDate:snapshot?date:undefined,name:'Heavy bench',ex:[clone(top)],runs:[]});
 const data={customRoadmap:{programmeId:'test-programme',approvedAt:'2026-11-01T12:00:00Z',coachingRulesVersion:2,coachingPolicy:'review-v2',startDate:'2026-11-02',weeks:12,bench:1,priority:'Bench',trainingAge:'advanced'},activeCustomWeek:4,activeSchedule:[make(4,'2026-11-29')],sets:[],runs:[],checkins:[],sessionFeedback:[],decisions:[],completedWorkouts:[]};
 const weeks=[];for(const [i,date]of ['2026-11-08','2026-11-15','2026-11-22','2026-11-29'].entries()){const s=make(i+1,date);weeks.push({week:i+1,sessions:[s]});if(i>=3)continue;data.sets.push({date:date+'T12:00:00Z',exercise:'Bench',session:s.name,sessionId:s.id+'::strength',week:i+1,set:1,weight:100+i*2.5,reps:3,rpe:7,target:8,role:'top',exerciseId:meta.exerciseId,variantId:meta.variantId,loadType:meta.loadType,doseUnit:meta.doseUnit});data.completedWorkouts.push({id:s.id+'::strength',parentId:s.id,component:'strength',name:s.name,day:s.day,date:date+'T12:00:00Z',week:i+1,completedSets:1,plannedSets:1,prescription:{ex:clone(s.ex),runs:[]}})}
 if(snapshot)data.reviewedProgramme={config:clone(data.customRoadmap),weeks};return data;
}
const review=data=>coach.createEngine({data,schedule:data.activeSchedule,now}).reviewDecision();
test('IA02 positive control uses exact app log shape and completed prescriptions with a real recurring plan',()=>{
 const data=evidenceState(),before=JSON.stringify(data),result=review(data);assert.equal(result.status,'progress');assert.equal(result.changes[0].loadFactor,1.025);assert.equal(result.evidence.length,3);assert.ok(result.evidence.every(x=>x.source==='completed-prescription'));assert.equal(JSON.stringify(data),before);assert.equal(data.sets[0].execution,undefined);
});
test('IA02 preserved reviewed programme supplies historical purpose without a past-engine regeneration',()=>{const data=evidenceState({snapshot:true});data.completedWorkouts=[];const result=review(data);assert.equal(result.status,'progress');assert.ok(result.evidence.every(x=>x.source==='reviewed-snapshot'))});
test('IA02 unsuitable flags and role/category aliases cannot establish an extra progression proposal',()=>{
 for(const patch of [{failed:true},{techniqueFailed:true},{warmup:true},{optional:true},{completed:false},{rpeReliable:false},{category:'warm-up'},{category:'optional'},{category:'failed'},{role:'warm-up'},{trainingRole:'speed'},{trainingPurpose:'volume'},{benchRole:'recovery'},{trainingRole:'heavy',trainingPurpose:'speed'}]){const data=evidenceState();Object.assign(data.sets.at(-1),patch);assert.notEqual(review(data).status,'progress',JSON.stringify(patch));}
});
test('IA02 provenance, setup, actualsourceweek and repetition/effort target must match preserved evidence',()=>{
 for(const patch of [{programmeId:'another-plan'},{sessionId:'invented'},{week:6},{variantId:'another-gym'},{exerciseId:'another-exercise'},{loadType:'assistance-kg'},{doseUnit:'seconds'},{execution:'touch-and-go'},{reps:5},{target:7}]){const data=evidenceState();Object.assign(data.sets.at(-1),patch);assert.notEqual(review(data).status,'progress',JSON.stringify(patch));}
 const missing=evidenceState();missing.completedWorkouts=[];assert.notEqual(review(missing).status,'progress');assert.match(review(missing).details,/needs evidence/);
});
test('IA02 duplicate log rows and renamed copies of the same visit cannot become distinct exposures',()=>{
 const data=evidenceState();data.sets=[data.sets[0],clone(data.sets[0]),{...clone(data.sets[0]),session:'Renamed duplicate'}];assert.equal(coach.createEngine({data,now}).reviewSessions().length,1);assert.notEqual(review(data).status,'progress');
});
test('IA02 actual latest due visit governs freshness rather than a universal lookback window',()=>{
 const data=evidenceState({snapshot:true});data.reviewedProgramme.weeks[3].sessions[0].scheduledDate='2026-11-27';assert.notEqual(review(data).status,'progress');
 const stale=evidenceState();stale.activeCustomWeek=10;assert.notEqual(coach.createEngine({data:stale,schedule:stale.activeSchedule,now:()=>Date.parse('2027-01-05T12:00:00Z')}).reviewDecision().status,'progress');
 const future=evidenceState();future.sets.at(-1).date='2027-11-22';assert.notEqual(review(future).status,'progress');
});
test('IA02 a real dense Sun Mon Tue plan is not a repeated recurring practice across cycles',()=>{
 const data=evidenceState({snapshot:true}),dates=['2026-11-08','2026-11-09','2026-11-10'];data.customRoadmap.startDate='2026-11-02';data.activeCustomWeek=2;data.reviewedProgramme.config=clone(data.customRoadmap);data.reviewedProgramme.weeks=[];data.sets=[];
 for(let i=0;i<3;i++){const s={id:'dense-'+i,day:['Sun','Mon','Tue'][i],scheduledDate:dates[i],ex:clone(data.activeSchedule[0].ex),runs:[]};data.reviewedProgramme.weeks.push({week:i?2:1,sessions:[s]});data.sets.push({date:dates[i]+'T12:00:00Z',exercise:'Bench',sessionId:s.id,week:i?2:1,weight:100+i*2.5,reps:3,rpe:7,target:8,role:'top',...s.ex[0][5]})}
 const engine=coach.createEngine({data,schedule:data.activeSchedule,now:()=>Date.parse('2026-11-10T20:00:00Z')});assert.notEqual(engine.reviewDecision().status,'progress');
});
test('IA02 actual C generated registered main-lift identities remain eligible without an optional execution field',()=>{
 const athlete=makeAthletes()[2],programme=adapters.buildNewProgramme(athlete.config,{data:athlete.data,now:()=>Date.parse('2026-11-07T12:00:00Z')});programme.config.programmeId='registered-C';
 for(const lift of ['Squat','Bench','Deadlift']){
  const data={customRoadmap:clone(programme.config),reviewedProgramme:clone(programme),activeCustomWeek:4,activeSchedule:clone(programme.weeks[3].sessions),sets:[],completedWorkouts:[],checkins:[],sessionFeedback:[],decisions:[],runs:[]};
  for(const w of programme.weeks.slice(0,3)){const s=w.sessions.find(s=>s.ex.some(e=>e[0]===lift&&e[5]?.role==='top')),e=s.ex.find(e=>e[0]===lift&&e[5]?.role==='top'),date=new Date(Date.parse('2026-11-09T12:00:00Z')+(w.week-1)*7*86400000).toISOString();assert.equal(e[5].execution,undefined);data.sets.push({date,sessionId:s.id+'::strength',week:w.week,exercise:lift,weight:e[3]+(w.week-1)*2.5,reps:e[2],rpe:e[4]-1,target:e[4],role:'top',exerciseId:e[5].exerciseId,variantId:e[5].variantId,loadType:e[5].loadType,doseUnit:e[5].doseUnit});}
  const result=coach.createEngine({data,now:()=>Date.parse('2026-11-30T08:00:00Z')}).reviewDecision();assert.equal(result.status,'progress',lift);assert.equal(result.changes[0].exercise,lift);assert.ok(data.sets.every(row=>row.execution===undefined));
 }
});
module.exports={evidenceState,quality,easy};
