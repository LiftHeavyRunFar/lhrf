// Independent adversarial controls. Fictional records only; no storage or network.
const test=require('node:test'),assert=require('node:assert/strict');
const evidence=require('../src/coaching-evidence');
const coach=require('../src/coach-engine'),adapters=require('../src/coach-adapters'),replacement=require('../src/programme-replacement');
const running=require('../src/running-preparation');
const {record}=require('./fixtures/independent-coaching-inputs.cjs');
const {makeRuntimeAthletes,FIXED_NOW,clone}=require('./fixtures/runtime-coaching-athletes.cjs');
const {legacyEngine}=require('../scripts/compare-runtime-coaching.cjs');
const now=()=>Date.parse(FIXED_NOW),blank=()=>({sets:[],runs:[],checkins:[],completedWorkouts:[],sessionFeedback:[],decisions:[],overrides:{}});
function packet({sets=[],runs=[],observations=[],context,event='2026-11-01'}={}){
 const config={runningHistory:{recentMarathonDate:event},recoveryObservations:observations,...(context?{recoveryContext:context}:{})};
 const data={...blank(),sets,runs};const before=JSON.stringify({config,data});
 const result=evidence.capture(config,{data,now});assert.equal(JSON.stringify({config,data}),before);
 return {...config,coachingEvidence:result};
}
const observe=(status,day='2026-11-06',extra={})=>({observedAt:day+'T12:00:00Z',sport:'strength',task:'heavy',lift:'Squat',status,eventDate:'2026-11-01',...extra});
const recover=(config,extra={})=>evidence.recovery(config,{now,atDate:'2026-11-09',sport:'strength',task:'heavy',lift:'Squat',...extra});
function noviceReviewFixture(){
 const athlete=makeRuntimeAthletes().find(a=>a.id==='novice-strength-runner');
 const programme=adapters.buildNewProgramme(clone(athlete.config),{data:clone(athlete.data),now});
 const config={...clone(programme.config),programmeId:'independent-novice-review',approvedAt:FIXED_NOW};
 const state={...blank(),customRoadmap:config,activeCustomWeek:4,activeSchedule:clone(programme.weeks[3].sessions),
  reviewedProgramme:{...clone(programme),config:clone(config)}};
 const weekdays=['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];let visits=0;
 for(const week of programme.weeks.slice(0,3))for(const session of week.sessions){
  const ex=session.ex.find(e=>e[0]==='Bench'&&e[5]?.role==='straight'&&e[5]?.category==='primary');if(!ex)continue;
  const date=new Date(Date.parse('2026-11-09T12:00:00Z')+((week.week-1)*7+weekdays.indexOf(session.day))*86400000).toISOString();
  state.completedWorkouts.push({id:session.id+'::strength',parentId:session.id,day:session.day,date,week:week.week,
   completedSets:ex[1],plannedSets:ex[1],prescription:{ex:clone(session.ex),runs:clone(session.runs)}});
  const meta=ex[5],weight=50+2.5*visits++;
  for(let set=1;set<=ex[1];set++)state.sets.push({date,exercise:'Bench',session:session.name,sessionId:session.id+'::strength',week:week.week,
   set,weight,reps:ex[2],rpe:ex[4]-1,target:ex[4],role:'straight',exerciseId:meta.exerciseId,variantId:meta.variantId,loadType:meta.loadType,doseUnit:meta.doseUnit});
 }
 assert.ok(visits>=3,'Actual novice programme needs at least three comparable opportunities');
 return state;
}
function review(state){const before=JSON.stringify(state),decision=coach.createEngine({data:state,now:()=>Date.parse('2026-11-30T08:00:00Z')}).reviewDecision();assert.equal(JSON.stringify(state),before);return decision;}
test('independent runtime assurance: real typed same-purpose practice remains an anchor without claiming a maximum or velocity',()=>{
 const row=record('Bench',90,2,5,'straight','2026-11-05T12:00:00Z',{trainingRole:'speed',execution:'competition-paused'});
 const config=packet({sets:[row],event:null}),before=JSON.stringify(config);
 const anchor=evidence.anchor(config,{exercise:'Bench',purpose:'speed',reps:2,target:5.5,execution:'competition-paused',variantId:row.variantId});
 assert.ok(anchor);assert.equal(anchor.suggestedKg,90);assert.equal(anchor.automaticIncrease,false);
 assert.equal(anchor.velocityMeasured,false);assert.equal(JSON.stringify(config),before);
});
test('independent runtime assurance: absent or conflicting setup cannot silently match a requested confirmed setup',()=>{
 for(const change of [row=>{delete row.variantId;},row=>{row.variantId='another-gym';},row=>{delete row.execution;},row=>{row.execution='touch-and-go';}]){
  const row=record('Bench',90,2,5,'straight','2026-11-05T12:00:00Z',{trainingRole:'speed',execution:'competition-paused'}),variantId=row.variantId;
  change(row);const config=packet({sets:[row],event:null});
  assert.equal(evidence.anchor(config,{exercise:'Bench',purpose:'speed',reps:2,target:5.5,execution:'competition-paused',variantId}),null);
 }
});
test('independent runtime assurance: completed work above the requested recovery effort is not the same recovery-load evidence',()=>{
 const row=record('Deadlift',140,3,7.5,'straight','2026-11-05T12:00:00Z',{trainingRole:'recovery'}),config=packet({sets:[row]});
 assert.equal(evidence.anchor(config,{exercise:'Deadlift',purpose:'recovery',reps:3,target:6,variantId:row.variantId}),null);
});
test('independent runtime assurance: failed, warm-up, optional, stale, future and unreliable effort do not become reliable calibration rows',()=>{
 for(const patch of [{failed:true},{techniqueFailed:true},{warmup:true},{category:'warm-up'},{optional:true},
  {category:'optional'},{completed:false},{date:'2027-01-01'},{date:'2026-01-01'},
  {rpeReliable:false},{evidenceReview:{rpe:{approximate:true,value:8}}}]){
  const row=record('Bench',180,1,8,'top','2026-11-05T12:00:00Z',patch);
  assert.equal(evidence.validSet(row,now()),false,JSON.stringify(patch));
 }
});
test('independent runtime assurance: unsuitable evidence is excluded before full-programme maximum calibration',()=>{
 const base=makeRuntimeAthletes().find(a=>a.id==='experienced-strength-hybrid');
 for(const patch of [{rpeReliable:false},{category:'warm-up'},{category:'optional'},
  {failed:true},{techniqueFailed:true},{variantId:'different-machine'},
  {evidenceReview:{rpe:{value:8,approximate:true,source:'athlete-confirmation'}}}]){
  const athlete=clone(base);athlete.config.coachingRuntimeVersion=1;athlete.data=blank();
  athlete.data.sets=['2026-11-01','2026-11-05'].map(day=>record('Bench',180,1,8,'top',day+'T12:00:00Z',patch));
  const before=JSON.stringify(athlete),programme=adapters.buildNewProgramme(athlete.config,{data:athlete.data,now});
  assert.equal(programme.config.strengthCalibration?.lifts?.Bench,undefined,JSON.stringify(patch));
  assert.equal(JSON.stringify(athlete),before);
 }
});
test('independent runtime assurance: fresh proposals rebuild practice and running-return caches without upgrading saved source',()=>{
 const athlete=clone(makeRuntimeAthletes().find(a=>a.id==='general-hybrid'));
 athlete.config.coachingRuntimeVersion=1;
 athlete.config.strengthPractice={Bench:{kg:300,reps:2,rpe:5,date:'2026-11-01',method:'obsolete proposal cache'}};
 athlete.config.runningHistory.recentMarathonDate='2026-10-18';
 athlete.config.runningReturnObservation={reportedHabitualKm:28,observedWeekKm:6,initialWeeklyCeilingKm:7.2};
 athlete.data=blank();athlete.data.runs=['2026-11-03','2026-11-05','2026-11-07'].map(day=>({date:day+'T09:00:00Z',km:10,min:65,rpe:3,type:'easy-run',completed:true}));
 const before=JSON.stringify(athlete),programme=adapters.buildNewProgramme(athlete.config,{data:athlete.data,now});
 assert.equal(programme.config.strengthPractice,undefined,'A missing current practice record cannot inherit an old suggestion');
 assert.equal(programme.config.runningReturnObservation,undefined,'Restored current observed dose must not inherit an old low-week ceiling');
 assert.equal(JSON.stringify(athlete),before);
});
test('independent runtime assurance: unreliable low-effort rows are not silently relabelled as credible light practice',()=>{
 const athlete=clone(makeRuntimeAthletes().find(a=>a.id==='general-hybrid'));athlete.config.coachingRuntimeVersion=1;athlete.data=blank();
 athlete.data.sets=[record('Bench',200,2,5,'straight','2026-11-05T12:00:00Z',{rpeReliable:false})];
 const programme=adapters.buildNewProgramme(athlete.config,{data:athlete.data,now});
 assert.equal(programme.config.strengthPractice?.Bench,undefined);
});
test('independent runtime assurance: an older completed task cannot corroborate recovery after intervening pain',()=>{
 const row=record('Squat',100,3,8,'top','2026-11-02T12:00:00Z',{trainingRole:'heavy'});
 const config=packet({sets:[row],observations:[observe('pain','2026-11-04'),observe('normal','2026-11-06',{nextDayResponse:'normal'})]});
 assert.equal(recover(config).canProgress,false,'No completed comparable task after the intervening concern is supplied');
 const sameDay=packet({sets:[{...row,date:'2026-11-05T10:00:00Z'}],
  observations:[observe('normal','2026-11-05',{nextDayResponse:'normal'})]});
 assert.equal(recover(sameDay).canProgress,false,'A noon report cannot establish the following-day response to that morning\'s task');
 const completed={...row,date:'2026-11-04T12:00:00Z'},specific=observe('normal','2026-11-05',{nextDayResponse:'normal'});
 const valid=packet({sets:[completed],observations:[specific]});
 const withCoarseNormal=packet({sets:[completed],observations:[specific],context:{status:'normal',reportedAt:'2026-11-06'}});
 assert.equal(recover(valid).canProgress,true);
 assert.equal(recover(withCoarseNormal).canProgress,true,'A later benign form default cannot erase dated task-specific subsequent-response evidence');
 const laterConcern=packet({sets:[completed],observations:[specific],context:{status:'lower',reportedAt:'2026-11-06'}});
 assert.equal(recover(laterConcern).canProgress,false,'A later relevant adverse report still defeats older positive evidence');
});
test('independent runtime assurance: negated symptom text is not a new positive safety finding',()=>{
 const row=record('Squat',100,3,8,'top','2026-11-05T12:00:00Z',{trainingRole:'heavy'});
 const config=packet({sets:[row],observations:[observe('normal','2026-11-06',{nextDayResponse:'normal',pain:false,symptoms:'No pain or discomfort'})]});
 assert.notEqual(recover(config).restriction,'hold','A negated symptom description must not manufacture a safety signal');
 const mixed=packet({sets:[row],observations:[observe('normal','2026-11-06',{nextDayResponse:'normal',symptoms:'No soreness but worsening pain changes walking'})]});
 assert.equal(recover(mixed).restriction,'hold','An initial negation does not erase a subsequent positive worsening concern');
});
test('independent runtime assurance: current pain persists beyond a timer; newer worsening defeats old normal',()=>{
 for(const observations of [[observe('fatigue')],[observe('normal','2026-11-03',{nextDayResponse:'normal'}),observe('worsening')]]){
  const config=packet({observations}),result=recover(config,{atDate:'2026-12-07'});
  assert.equal(result.canProgress,false);assert.equal(result.reviewRequired,true);
  if(observations.at(-1).status==='worsening')assert.equal(result.restriction,'hold');
 }
});
test('independent runtime assurance: a light lower warm-up and easy-run response do not establish heavy or quality readiness',()=>{
 const config=packet({sets:[record('Squat',40,3,5,'straight','2026-11-05T12:00:00Z')],
  runs:[{date:'2026-11-05T12:00:00Z',km:4,min:30,rpe:3,type:'easy-run',completed:true}],
  observations:[observe('normal','2026-11-06',{task:'lifting',nextDayResponse:'normal'}),
   {observedAt:'2026-11-06T12:00:00Z',sport:'running',task:'easy',status:'normal',nextDayResponse:'normal',eventDate:'2026-11-01'}]});
 assert.equal(recover(config).canProgress,false);
 assert.equal(evidence.recovery(config,{now,atDate:'2026-11-09',sport:'running',task:'quality'}).canProgress,false);
 const novice=clone(makeRuntimeAthletes().find(a=>a.id==='marathon-novice-fast'));
 for(const row of novice.data.sets)if(row.date.startsWith('2026-11-05')&&['Squat','Deadlift'].includes(row.exercise)){row.rpe=6;row.target=6;}
 const proposal=adapters.buildNewProgramme(novice.config,{data:novice.data,now});
 for(const lift of ['Squat','Deadlift']){
  const work=proposal.weeks[2].sessions.flatMap(s=>s.ex).filter(e=>e[0]===lift);
  assert.ok(work.length);assert.ok(work.every(e=>e[2]<=3&&e[4]<=6),'One normal three-rep task at6 is not proof of a three-set six-rep task at7');
  assert.ok(work.reduce((n,e)=>n+e[1],0)<=1,'Only one returned set was confirmed by the supplied next-day response');
 }
});
test('independent runtime assurance: future, pre-event and undated normal reports cannot clear a return',()=>{
 for(const observation of [observe('normal','2026-11-12',{nextDayResponse:'normal'}),
  observe('normal','2026-10-31',{nextDayResponse:'normal'}),{sport:'strength',task:'heavy',lift:'Squat',status:'normal',nextDayResponse:'normal'}]){
  const config=packet({observations:[observation]});assert.equal(recover(config).canProgress,false);
 }
});
test('independent runtime assurance: unreliable running effort cannot corroborate quality recovery while reliable completed work remains useful',()=>{
 const report={observedAt:'2026-11-06T12:00:00Z',sport:'running',task:'quality',status:'normal',nextDayResponse:'normal',eventDate:'2026-11-01'};
 const run={date:'2026-11-05T12:00:00Z',km:4,min:25,rpe:7,type:'quality-run',completed:true};
 const good=packet({runs:[run],observations:[report]});
 assert.equal(evidence.recovery(good,{now,atDate:'2026-11-09',sport:'running',task:'quality'}).status,'normal');
 for(const extra of [{rpeReliable:false},{evidenceReview:{rpe:{approximate:true,value:7}}},{unreliable:true}]){
  const config=packet({runs:[{...run,...extra}],observations:[report]});
  assert.equal(evidence.recovery(config,{now,atDate:'2026-11-09',sport:'running',task:'quality'}).canProgress,false,JSON.stringify(extra));
 }
});
test('independent runtime assurance: initial systemic uncertainty includes heavy bench but does not become a permanent upper-body ban',()=>{
 const config=packet();
 const initial=evidence.recovery(config,{now,atDate:'2026-11-02',sport:'strength',task:'heavy',lift:'Bench'});
 assert.equal(initial.canProgress,false);assert.notEqual(initial.restriction,'none');
 const familiar=record('Bench',80,3,7,'top','2026-11-05T12:00:00Z',{trainingRole:'heavy'});
 const recovered=packet({sets:[familiar],observations:[{...observe('normal','2026-11-06',{nextDayResponse:'normal'}),lift:'Bench'}]});
 assert.notEqual(evidence.recovery(recovered,{now,atDate:'2026-11-09',sport:'strength',task:'heavy',lift:'Bench'}).restriction,'hold');
 const unknown=packet(),normalContext=packet({context:{status:'normal',reportedAt:'2026-11-06'}});
 const options={now,atDate:'2026-11-09',sport:'strength',task:'heavy',lift:'Bench'};
 assert.equal(evidence.recovery(normalContext,options).restriction,evidence.recovery(unknown,options).restriction,
  'An unscoped normal answer must not make unaffected bench more restricted than missing information');
});
test('independent runtime assurance: an undated adverse concern remains scoped review evidence rather than disappearing after a timer',()=>{
 for(const status of ['fatigue','worsening'])for(const observedAt of [undefined,'2026-11-12T12:00:00Z']){
  const config=packet({event:'2026-09-01',observations:[{sport:'strength',task:'heavy',lift:'Squat',status,observedAt}]});
  const result=recover(config,{atDate:'2026-12-07'});
  assert.equal(result.canProgress,false);assert.equal(result.reviewRequired,true);assert.notEqual(result.restriction,'none');
 }
});
test('independent runtime assurance: production legacy generation stays exact without a new-proposal upgrade',()=>{
 const old=legacyEngine();
 for(const athlete of makeRuntimeAthletes().filter(a=>['experienced-strength-hybrid','novice-strength-runner','general-hybrid'].includes(a.id))){
  const config=old.coach.prepareNewProgramme(clone(athlete.config),{data:clone(athlete.data),now}),data=clone(athlete.data),before=JSON.stringify({config,data});
  assert.deepEqual(clone(adapters.buildProgramme(config,{data,now})),clone(old.adapters.buildProgramme(config,{data,now})),athlete.id);
  assert.equal(JSON.stringify({config,data}),before);
 }
});
test('independent runtime assurance: a new proposal cannot rewrite frozen prescriptions, original RPE or activity associations',()=>{
 const athlete=makeRuntimeAthletes().find(a=>a.id==='general-hybrid'),old=legacyEngine();
 const original=old.adapters.buildNewProgramme(clone(athlete.config),{data:clone(athlete.data),now});
 original.config.programmeId='assurance-frozen';
 const state={...blank(),customRoadmap:clone(original.config),reviewedProgramme:clone(original),activeCustomWeek:1,
  activeSchedule:clone(original.weeks[0].sessions),
  sets:[record('Bench',100,2,2,'straight','2026-11-01T12:00:00Z',{originalRpe:2,evidenceReview:{rpe:{original:2,value:5,approximate:true,source:'athlete-confirmation'}}})],
  runs:[{date:'2026-11-03',km:4,min:30,sourceActivityId:'synthetic-kept',activityAssociation:{sessionId:'original-run'}}],
  decisions:[{key:'existing-approval',approved:true,kind:'hybrid-load',week:1,factor:.9}]};
 const before=JSON.stringify(state),frozen=clone(replacement.sessions(state,1));
 const proposal=adapters.buildNewProgramme(clone(athlete.config),{data:state,now});
 assert.equal(proposal.config.coachingRuntimeVersion,1,'The real new-proposal entry point must select the corrected policy by default');
 assert.ok(proposal.requiresAthleteApproval);assert.equal(JSON.stringify(state),before);
 assert.deepEqual(replacement.sessions(state,1),frozen);
});
test('independent runtime assurance: real novice straight-set visits provide a progression-review route without pretending they are top sets',()=>{
 const state=noviceReviewFixture(),decision=review(state);
 assert.ok(state.sets.every(s=>s.role==='straight'));
 assert.equal(decision.status,'progress');assert.ok(decision.changes?.length);
 assert.equal(decision.changes[0].exercise,'Bench');assert.ok(decision.changes[0].loadFactor>1);
 assert.ok(!decision.automaticApply,'A review proposal is not automatic programme activation');
});
test('independent runtime assurance: compressed catch-up novice completions and missing source cannot manufacture a sustained trend',()=>{
 const dense=noviceReviewFixture();
 const dayForWeek=week=>['2026-11-25','2026-11-26','2026-11-27'][week-1]+'T12:00:00Z';
 for(const row of dense.sets)row.date=dayForWeek(row.week);
 for(const row of dense.completedWorkouts)row.date=dayForWeek(row.week);
 assert.notEqual(review(dense).status,'progress');
 const unlinked=noviceReviewFixture();delete unlinked.reviewedProgramme;unlinked.completedWorkouts=[];
 assert.notEqual(review(unlinked).status,'progress');
});
test('independent runtime assurance: familiar accessories and locked variations retain their own calibration',()=>{
 const athlete=clone(makeRuntimeAthletes().find(a=>a.id==='general-hybrid'));
 const old=legacyEngine(),prior=old.adapters.buildNewProgramme(athlete.config,{data:athlete.data,now});
 const accessory=prior.weeks[0].sessions.flatMap(s=>s.ex).find(e=>e[5]?.category==='accessory'&&!e[5]?.optional);
 assert.ok(accessory,'A genuine generated accessory is required');
 athlete.data.sets.push(record(accessory[0],50,accessory[2],accessory[4],accessory[5]?.role||'straight'));
 const oldWithEvidence=old.adapters.buildNewProgramme(athlete.config,{data:athlete.data,now});
 assert.ok(oldWithEvidence.weeks[0].sessions.flatMap(s=>s.ex).some(e=>e[0]===accessory[0]&&e[3]>0));
 const current=adapters.buildNewProgramme(athlete.config,{data:athlete.data,now});
 assert.ok(current.weeks[0].sessions.flatMap(s=>s.ex).some(e=>e[0]===accessory[0]&&e[3]>0),'Registered accessory evidence must not disappear because calibration captures only three main lifts');
 athlete.config.variations.Squat={choice:'Safety-bar squat',lock:true};
 const seed=old.adapters.buildNewProgramme(athlete.config,{data:athlete.data,now});
 const variation=seed.weeks[0].sessions.flatMap(s=>s.ex).find(e=>e[0]==='Safety-bar squat');assert.ok(variation);
 athlete.data.sets.push(record(variation[0],85,variation[2],variation[4],variation[5]?.role||'straight'));
 const varied=adapters.buildNewProgramme(athlete.config,{data:athlete.data,now});
 const actual=varied.weeks[0].sessions.flatMap(s=>s.ex).find(e=>e[0]===variation[0]);
 assert.ok(actual&&actual[3]>0&&actual[3]<=85,'A familiar variation uses its own compatible task, without borrowing the competition squat');
});
test('independent runtime assurance: a matching completed back-off constrains a model-derived higher back-off',()=>{
 for(const id of ['experienced-strength-hybrid','general-hybrid']){
  const athlete=clone(makeRuntimeAthletes().find(a=>a.id===id)),programme=adapters.buildNewProgramme(athlete.config,{data:athlete.data,now});
  for(const ex of programme.weeks[0].sessions.flatMap(s=>s.ex).filter(e=>e[5]?.role==='backoff')){
   const matches=athlete.data.sets.filter(row=>row.exercise===ex[0]&&row.role==='backoff'&&row.reps===ex[2]&&row.rpe===ex[4]);
   if(matches.length)assert.ok(ex[3]<=matches.at(-1).weight,ex[0]+' cannot earn higher back-off kg merely from a different top-set curve');
  }
 }
});
test('independent runtime assurance: overlap alone monitors, repeated adverse feedback still reaches review, and no records change',()=>{
 const athlete=clone(makeRuntimeAthletes().find(a=>a.id==='general-hybrid'));
 const config=adapters.buildNewProgramme(athlete.config,{data:athlete.data,now}).config,data=blank();data.customRoadmap=config;
 for(let week=0;week<4;week++)for(const offset of [1,4]){
  const date=new Date(now()-(week*7+offset)*86400000).toISOString();
  data.runs.push({date,km:8,min:44,rpe:8,type:'quality-run',completed:true});
  for(let set=1;set<=3;set++)data.sets.push(record('Squat',100,5,8,'straight',date,{set}));
 }
 const before=JSON.stringify(data),plain=coach.createEngine({data,now}).hybridWorkloadRecommendation();
 assert.equal(plain.level,'monitor');assert.equal(plain.intervention,null);assert.equal(JSON.stringify(data),before);
 data.sessionFeedback=[{date:'2026-11-04',difficulty:'harder',energy:'low'},{date:'2026-11-06',difficulty:'harder',energy:'low'}];
 const adverse=coach.createEngine({data,now}).hybridWorkloadRecommendation();assert.ok(['adjust','review'].includes(adverse.level));
 data.sessionFeedback.push({date:'2026-11-07T09:00:00Z',discomfort:'yes'});
 assert.equal(coach.createEngine({data,now}).hybridWorkloadRecommendation().level,'review');
});
test('independent runtime assurance: approval preserves the reviewed evidence and dose while new-programme decisions remain source scoped',()=>{
 const athlete=clone(makeRuntimeAthletes().find(a=>a.id==='general-hybrid'));
 const proposal=adapters.buildNewProgramme(athlete.config,{data:athlete.data,now}),before=JSON.stringify(proposal.config);
 const approved=coach.approveProgrammeConfig(proposal.config,'2026-11-07T13:00:00Z');
 assert.equal(JSON.stringify(proposal.config),before);assert.deepEqual(approved.coachingEvidence,proposal.config.coachingEvidence);
 assert.deepEqual(approved.baselines,proposal.config.baselines);
 const normalize=sessions=>clone(sessions).map(({id,programmeId,...session})=>session);
 const approvedProgramme=adapters.buildProgramme(approved,{data:athlete.data,now});
 assert.deepEqual(approvedProgramme.weeks.map(w=>normalize(w.sessions)),proposal.weeks.map(w=>normalize(w.sessions)));
 const c={coachingRuntimeVersion:1,coachingRulesVersion:2,coachingPolicy:'review-v2',startDate:'2026-11-02',weeks:12,
  programmeId:'independent-current',approvedAt:'2026-11-01T12:00:00Z',priority:'Bench'};
 const good={approved:true,kind:'adaptive-progression',exercise:'Bench',week:1,factor:1.025,date:'2026-11-05T12:00:00Z',programmeId:c.programmeId};
 const sessions=()=>[{id:'current-bench',ex:[['Bench',1,3,100,8,{role:'top',category:'primary',policy:'evidence-calibrated-v1'}]],runs:[]}];
 for(const patch of [null,{programmeId:'another-programme'},{programmeId:undefined},{date:'2026-10-01'},{date:'2027-01-01'}]){
  const data={...blank(),customRoadmap:c,decisions:[{...good,...patch}]},snapshot=JSON.stringify(data);
  const result=coach.createEngine({data,now}).carryForwardApprovedProgression(sessions(),2);
  assert.equal(result[0].ex[0][3],patch===null?102.5:100,JSON.stringify(patch));assert.equal(JSON.stringify(data),snapshot);
 }
});
test('independent runtime assurance: a fresh proposal cannot resume untested running merely because the event became22 days old',()=>{
 const source=clone(makeRuntimeAthletes().find(a=>a.id==='marathon-general-uncertain'));
 const stamp='2026-11-23T12:00:00Z',later=()=>Date.parse(stamp),before=JSON.stringify(source);
 const unknown=adapters.buildNewProgramme(source.config,{data:source.data,now:later}),week=unknown.weeks[2],runs=week.sessions.flatMap(s=>s.runs);
 assert.ok(runs.every(r=>r.role!=='long-run'&&!(r.steps||[]).some(s=>s.role==='work')),'No completed running or new task response was supplied after the event');
 const unknownKm=runs.reduce((n,r)=>n+Number(r.distanceKm||0),0);
 assert.ok(unknownKm<source.config.runProfile.weeklyKm,'Missing return evidence cannot become a full habitual week at a date cutoff');
 const early=adapters.buildNewProgramme(source.config,{data:source.data,now}).weeks[2];
 const lowerDose=w=>{const rows=w.sessions.flatMap(s=>s.ex).filter(e=>/squat|deadlift/i.test(e[0]));return {reps:rows.reduce((n,e)=>n+e[1]*e[2],0),effort:Math.max(0,...rows.map(e=>e[4]))};};
 const priorLower=lowerDose(early),laterLower=lowerDose(week);
 assert.ok(laterLower.reps<=priorLower.reps&&laterLower.effort<=priorLower.effort,
  'The same unreviewed post-event strength evidence cannot restore full lower working volume solely by advancing the proposal clock');
 assert.equal(JSON.stringify(source),before);
 const restored=clone(source);
 restored.data.runs=[['2026-11-16',4,25,7,'quality-run'],['2026-11-17',6,40,3,'easy-run'],
  ['2026-11-19',6,40,3,'easy-run'],['2026-11-21',12,80,3,'long-run']].map(([date,km,min,rpe,type])=>({date:date+'T12:00:00Z',km,min,rpe,type,completed:true}));
 restored.config.recoveryObservations=[['easy','2026-11-20'],['quality','2026-11-17'],['long','2026-11-22']]
  .map(([task,day])=>({observedAt:day+'T12:00:00Z',sport:'running',task,status:'normal',nextDayResponse:'normal',eventDate:'2026-11-01'}));
 const supported=adapters.buildNewProgramme(restored.config,{data:restored.data,now:later}).weeks[2].sessions.flatMap(s=>s.runs);
 assert.ok(supported.some(r=>(r.steps||[]).some(s=>s.role==='work')),'Actual completed quality and normal subsequent response remain usable');
 assert.ok(supported.reduce((n,r)=>n+Number(r.distanceKm||0),0)>unknownKm,'Verified restored dose can support a different proposal');
});
test('independent runtime assurance: an old event alone cannot erase current post-event fitness and familiar running evidence',()=>{
 const source=clone(makeRuntimeAthletes().find(a=>a.id==='general-hybrid'));
 source.config.runningHistory.recentMarathonDate='2026-09-01';
 // The fixture's25Oct performance and recent habitual weekly history are now
 // after the event, rather than the pre-event evidence in the22day adversary.
 const programme=adapters.buildNewProgramme(source.config,{data:source.data,now}),runs=programme.weeks[0].sessions.flatMap(s=>s.runs);
 assert.ok(runs.some(r=>(r.steps||[]).some(s=>s.role==='work')),'A historical event is not an indefinite quality prohibition');
 const symptomatic=clone(source);symptomatic.config.recoveryObservations=[{observedAt:'2026-11-06T12:00:00Z',sport:'running',task:'all',status:'worsening'}];
 assert.equal(adapters.buildNewProgramme(symptomatic.config,{data:symptomatic.data,now}).weeks[0].sessions.flatMap(s=>s.runs).length,0,
  'A current worsening report still overrides older positive fitness evidence');
});
test('independent runtime assurance: newer discomfort from the actual app logger remains visible to a fresh proposal',()=>{
 const source=clone(makeRuntimeAthletes().find(a=>a.id==='general-hybrid'));
 const squat=source.data.sets.find(row=>row.exercise==='Squat'&&row.role==='top');
 source.data.completedWorkouts=[{id:'prior-lower::strength',parentId:'prior-lower',date:'2026-11-05T12:00:00Z',week:1,
  prescription:{ex:[['Squat',1,5,squat.weight,7.5,{role:'top',category:'primary',trainingRole:'heavy',
   exerciseId:squat.exerciseId,variantId:squat.variantId,loadType:squat.loadType,doseUnit:squat.doseUnit}]],runs:[]}}];
 source.data.sessionFeedback=[{date:'2026-11-06T12:00:00Z',week:1,sessionId:'prior-lower::strength',
  session:'Prior lower session',difficulty:'expected',energy:'good',discomfort:'yes'}];
 const before=JSON.stringify(source),proposal=adapters.buildNewProgramme(source.config,{data:source.data,now});
 assert.ok(proposal.config.coachingEvidence.recovery.observations.some(o=>['adverse','safety'].includes(o.status)&&String(o.date).startsWith('2026-11-06')),
  'The fresh recovery interpretation must retain the newer reported concern, not only old configuration fields');
 assert.ok(proposal.weeks.some(w=>w.reviewRequired));assert.equal(JSON.stringify(source),before);
});
test('independent runtime assurance: complete running weeks include Monday morning and date-only rows, not a noon-to-noon bucket',()=>{
 for(const monday of ['2026-11-16','2026-11-16T09:00:00Z']){
  const data={runs:[{date:monday,km:9,min:60,rpe:3,type:'easy-run'},
   {date:'2026-11-18T09:00:00Z',km:9,min:50,rpe:7,type:'quality-run'},
   {date:'2026-11-20T09:00:00Z',km:10,min:65,rpe:3,type:'long-run'},
   {date:'2026-11-15T23:59:00Z',km:2,min:14,rpe:3,type:'easy-run'},
   {date:'2026-11-23T00:01:00Z',km:3,min:21,rpe:3,type:'easy-run'}]},before=JSON.stringify(data);
  const prepared=running.prepareEvidence({}, {data,now:()=>Date.parse('2026-11-23T12:00:00Z')});
  assert.equal(prepared.latestCompletedCalendarWeek.observedKm,28);
  assert.equal(prepared.currentCalendarWeek.observedKm,3);assert.equal(JSON.stringify(data),before);
 }
});
test('independent runtime assurance: the actual proposal form forwards undated concerns without inventing their onset date',()=>{
 const fs=require('node:fs'),vm=require('node:vm'),intake=require('../src/coach-intake');
 const html=fs.readFileSync(require.resolve('../index.html'),'utf8'),start=html.indexOf(' function recoveryObservationRows(){'),end=html.indexOf(" get('frStartDate').value",start);
 const previous={recoveryContext:{status:'lower'}};previous.coachingEvidence=evidence.capture(previous,{data:{},now});
 const data={customRoadmap:previous},before=JSON.stringify(data),box={data,get:()=>({children:[]}),LHRFCoachingEvidence:evidence};
 vm.createContext(box);vm.runInContext(html.slice(start,end),box);const carried=clone(box.recoveryObservationRows());
 assert.ok(carried.some(o=>o.source==='preserved-recovery-concern'&&!o.observedAt));
 assert.equal(carried[0].recordedAt,previous.coachingEvidence.asOf);assert.equal(JSON.stringify(data),before);
 const base=clone(makeRuntimeAthletes().find(a=>a.id==='general-hybrid').config),limits={strengthVisits:3,minutes:base.visitConstraints.minutes};
 const prepared=intake.build(base,{...limits,recoveryObservations:carried});
 assert.equal(prepared.recoveryObservations[0].observedAt,null);
 assert.throws(()=>intake.build(base,{...limits,recoveryObservations:[{sport:'strength',task:'lifting',lift:'Squat',status:'fatigue',source:'athlete-recovery-review'}]}),RangeError);
 const later=()=>Date.parse('2026-11-10T12:00:00Z'),normal={sport:'strength',task:'lifting',lift:'Squat',status:'normal',observedAt:'2026-11-09',referencePerformanceDate:'2026-11-08',nextDayResponse:'normal'};
 const actual={...blank(),sets:[record('Squat',60,3,6,'straight','2026-11-08T12:00:00Z')]};
 const config={recoveryObservations:[...carried,normal]};config.coachingEvidence=evidence.capture(config,{data:actual,now:later});
 const resolved=evidence.recovery(config,{now:later,atDate:'2026-11-11',sport:'strength',task:'lifting',lift:'Squat'});
 assert.equal(resolved.status,'normal');assert.equal(resolved.restriction,'none',
  'A real subsequent task after the documented receipt can resolve that familiar task without fabricating the old symptom date');
 assert.equal(resolved.canProgress,false,'A normal familiar task does not establish full working volume or heavy readiness');
});
test('independent runtime assurance: a recent marathon with zero requested training runs still generates a complete strength proposal',()=>{
 const source=clone(makeRuntimeAthletes().find(a=>a.id==='owner-limited-diagnostic')),before=JSON.stringify(source);
 assert.equal(source.config.runs,0);assert.deepEqual(source.data.runs,[]);
 const programme=adapters.buildNewProgramme(source.config,{data:source.data,now,performanceReviews:source.performanceReviews});
 assert.equal(programme.weeks.length,source.config.weeks);
 assert.ok(programme.weeks.every(w=>w.sessions.flatMap(s=>s.runs).filter(r=>r.role!=='race').length===0));
 assert.equal(JSON.stringify(source),before);
});
test('independent runtime assurance: normal familiar fives remain fives at their supported effort without requiring a heavy single probe',()=>{
 const source=clone(makeRuntimeAthletes().find(a=>a.id==='marathon-general-uncertain'));source.config.squat=1;
 source.data.sets=source.data.sets.filter(row=>!['Squat','Deadlift'].includes(row.exercise));
 for(const [lift,kg,sets]of [['Squat',100,3],['Deadlift',130,2]])for(let set=1;set<=sets;set++)
  source.data.sets.push(record(lift,kg,5,7,'straight','2026-11-05T12:00:00Z',{set,target:7,trainingRole:'strength'}));
 source.config.recoveryObservations=['Squat','Deadlift'].map(lift=>({sport:'strength',task:'lifting',lift,status:'normal',
  observedAt:'2026-11-06',referencePerformanceDate:'2026-11-05',nextDayResponse:'normal'}));
 source.config.recoveryContext={status:'normal',reportedAt:'2026-11-07'};
 const before=JSON.stringify(source),programme=adapters.buildNewProgramme(source.config,{data:source.data,now});
 for(const week of [programme.weeks[0],programme.weeks[2]])for(const [lift,kg,sets]of [['Squat',100,3],['Deadlift',130,2]]){
  const rows=week.sessions.flatMap(s=>s.ex).filter(e=>e[0]===lift);
  assert.deepEqual(rows.map(e=>e.slice(0,5)),[[lift,sets,5,kg,7]],'Known working reps/sets/effort are retained, without a universal recovery-effort ceiling or added volume');
 }
 assert.equal(JSON.stringify(source),before);
});
