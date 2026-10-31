const test=require('node:test'),assert=require('node:assert/strict');
const preparation=require('../src/running-preparation.js');
const base={coachingRulesVersion:2,startDate:'2026-11-02',weeks:20,runs:4,hybridFocus:'running',runGoal:'marathon',runningTargetDate:'2027-03-21',runProfile:{distance:10,seconds:2520,weeklyKm:60,recency:'recent',effort:'performance',resultDate:'2026-10-18'},runningHistory:{weeklyKm:[55,56,58,58,60,60],longRun:{km:20,minutes:110,recoveryHours:24}}};
const options={now:Date.parse('2026-10-30T12:00:00Z')};
test('marathon preparation builds supporting mileage, longer runs and actual marathon-pace rehearsals',()=>{
 const weeks=Array.from({length:20},(_,i)=>preparation.assess(base,i+1,options));
 assert.ok(weeks.slice(0,17).some(w=>w.longKm>=28),'No arbitrary 26 km ceiling for a supported experienced runner');
 assert.ok(weeks.some(w=>w.runs.some(r=>r.workoutFamily==='marathon-pace-long-run'&&r.steps.some(s=>s.role==='work'))));
 assert.ok(weeks.filter(w=>w.phase==='Specific preparation'&&!w.deload&&!w.taper).every(w=>w.runs.some(r=>r.steps.some(s=>s.role==='work'))),'Specific weeks practise marathon rhythm');
 assert.ok(weeks.every(w=>w.longShare<=.4+.001));
 assert.ok(weeks[19].requestedKm<weeks[16].requestedKm*.4,'Race-week training tapers substantially');
 for(const w of weeks)assert.ok(w.runs.every(r=>Math.abs(r.steps.reduce((n,s)=>n+s.distanceKm,0)-r.distanceKm)<.005));
});
test('faster half-marathon aspiration cannot replace current performance paces',()=>{
 const config={...base,weeks:12,runGoal:'half',runningTargetDate:'2027-01-24',runningGoalSeconds:6300,runs:3,runProfile:{...base.runProfile,seconds:3450,weeklyKm:24},runningHistory:{weeklyKm:[18,20,20,22,24,24],longRun:{km:12,minutes:82,recoveryHours:48}}};
 const withGoal=preparation.assess(config,3,options),without=preparation.assess({...config,runningGoalSeconds:null},3,options);
 const prescribed=w=>w.runs.map(({paceBasis,...r})=>r);
 assert.deepEqual(prescribed(withGoal),prescribed(without));
 assert.ok(withGoal.warnings.some(x=>x.includes('Goal pace is faster')));
 assert.ok(withGoal.runs.some(r=>r.paceBasis?.goalSupported===false));
});
test('recent marathon creates easy recovery weeks before normal loading and strength-event week has no long run',()=>{
 const returning={...base,runningHistory:{...base.runningHistory,recentMarathonDate:'2026-10-25'}};
 const a=preparation.assess(returning,1,options),b=preparation.assess(returning,2,options),c=preparation.assess(returning,4,options);
 assert.equal(a.phase,'Recovery');assert.equal(b.phase,'Recovery');
 assert.ok(a.requestedKm<base.runProfile.weeklyKm*.5&&b.requestedKm<base.runProfile.weeklyKm*.7);
 assert.ok(a.runs.every(r=>r.role==='easy-run'&&!r.steps.some(s=>s.role==='work')));
 assert.ok(c.requestedKm>a.requestedKm);
 const meet=preparation.assess({...base,strengthTargetDate:'2026-11-28'},4,options);
 assert.ok(meet.runs.every(r=>r.role==='easy-run'));assert.equal(meet.reviewGates.recoveryCheckRequired,true);
});
test('missing baseline remains unknown and full history prevents a recent mileage spike becoming the prescription',()=>{
 const missing={...base,runProfile:{},runningHistory:{}};
 const a=preparation.assess(missing,1,options);assert.equal(a.feasible,false);assert.ok(a.runs.every(r=>r.minutes===null));
 const history=preparation.history({...base,runProfile:{...base.runProfile,weeklyKm:40},runningHistory:{weeklyKm:[20,21,22,23,24,40]}});
 assert.equal(history.current,40);assert.equal(history.base,24);
});
test('ordered priority progression is slower before handover and does not retroactively apply running-first growth',()=>{
 const staged={...base,runningPriorityFromWeek:13,goalSchedule:[{fromWeek:1,hybridFocus:'strength'},{fromWeek:13,hybridFocus:'running'}]};
 const a=preparation.assess(staged,14,options),b=preparation.assess(base,14,options);
 assert.ok(a.requestedKm<b.requestedKm);assert.ok(a.requestedKm>base.runProfile.weeklyKm);
});
test('long runs respect recorded capacity and explicit duration while redistributing only into supporting runs',()=>{
 const c={...base,longRunMaxMinutes:110,runningHistory:{...base.runningHistory,longRun:{km:12,minutes:90}}};
 const a=preparation.assess(c,3,options);
 assert.ok(a.longKm<=13.6+.001);assert.equal(a.progressionLimited,true);
 assert.ok(a.runs.filter(r=>r.role!=='long-run').length===3);
 assert.equal(a.allocatedKm,a.requestedKm);
 const frozen=JSON.stringify(c);assert.deepEqual(preparation.assess(c,3,options),a);assert.equal(JSON.stringify(c),frozen);
});
test('fitness after a priority handover is two short easy health runs, and fatigue does not clear by calendar week',()=>{
 const c={...base,runGoal:'fitness',hybridFocus:'strength',runs:2,runningTargetDate:'',runProfile:{...base.runProfile,weeklyKm:28}};
 const a=preparation.assess(c,9,options);assert.equal(a.requestedKm,12);assert.ok(a.runs.every(r=>r.role==='easy-run'&&r.distanceKm<=6));
 const fatigued={...c,runProfile:{...base.runProfile,weeklyKm:34},runningHistory:{weeklyKm:[22,23,24,22,30,34]},recoveryEvidence:{status:'accumulating-fatigue',affectedLifts:['Squat','Deadlift'],sleepHours:5.75,usualSleepHours:7.5}};
 for(const week of [1,2,3]){
  const w=preparation.assess(fatigued,week,options);assert.ok(w.requestedKm>=12&&w.requestedKm<=16);assert.ok(w.runs.every(r=>r.role==='easy-run'));
  assert.ok(w.warnings.some(x=>x.includes('week number does not clear')));
 }
});
test('visit fitter trims easy support and reports exact actual dose while preserving quality and recoveries',()=>{
 const r=preparation.assess({...base,runGoal:'half'},3,options).runs[0];
 const before=JSON.stringify(r),work=r.steps.filter(s=>s.role==='work'||s.role==='recovery');
 const result=preparation.fitRunToMinutes(r,r.minutes-3);
 assert.equal(result.feasible,true);assert.ok(result.trimmedKm>0);assert.ok(result.run.minutes<=r.minutes-3);
 assert.deepEqual(result.run.steps.filter(s=>s.role==='work'||s.role==='recovery'),work);
 assert.ok(Math.abs(result.run.steps.reduce((n,s)=>n+s.distanceKm,0)-result.run.distanceKm)<.001);
 assert.equal(JSON.stringify(r),before);
 const blocked=preparation.fitRunToMinutes(r,5);assert.equal(blocked.feasible,false);assert.deepEqual(blocked.run,r);
});
test('general-health running with unknown race fitness is timed rather than a fabricated pace or distance',()=>{
 const c={...base,runGoal:'fitness',hybridFocus:'strength',runningTargetDate:'',runs:2,runProfile:{},runningHistory:{}};
 const a=preparation.assess(c,1,options);
 assert.equal(a.feasible,true);assert.equal(a.distanceKnown,false);assert.equal(a.allocatedKm,0);
 assert.ok(a.runs.every(r=>r.minutes===20&&r.distanceKnown===false&&r.distanceKm===0&&!/\d:\d/.test(r.pace)));
 const fit=preparation.fitRunToMinutes(a.runs[0],18);assert.equal(fit.feasible,true);assert.equal(fit.run.minutes,18);assert.equal(fit.run.distanceKnown,false);
 assert.equal(preparation.fitRunToMinutes(a.runs[0],5).feasible,false);
});
test('known quality visit windows calibrate work up front and fractional caps cannot round beyond the visit',()=>{
 const c={...base,weeks:20,runs:3,runGoal:'half',runningTargetDate:'2027-03-21',runProfile:{distance:5,seconds:1740,weeklyKm:18,recency:'recent',effort:'performance',resultDate:'2026-10-11'},runningHistory:{weeklyKm:[14,16,17,16,18,18],longRun:{km:8,minutes:64,recoveryHours:24}},runVisitWindows:[{day:'Tue',kind:'quality',minutes:45},{day:'Sun',kind:'long',minutes:130}]};
 const a=preparation.assess(c,18,options),q=a.runs[0],fit=preparation.fitRunToMinutes(q,45);
 assert.equal(fit.feasible,true);assert.ok(fit.run.minutes<=45);assert.equal(fit.run.steps.filter(s=>s.role==='work').length,q.steps.filter(s=>s.role==='work').length);
 const smaller=preparation.assess({...c,runVisitWindows:[{day:'Tue',kind:'quality',minutes:40},{day:'Sun',kind:'long',minutes:130}]},18,options).runs[0];
 assert.ok(smaller.workCapacityAdjustment);assert.equal(preparation.fitRunToMinutes(smaller,40).feasible,true);
 const peak=Array.from({length:17},(_,i)=>preparation.assess(c,i+1,options));
 assert.ok(Math.max(...peak.map(w=>w.longKm))>=14,'A supported first-half build should not be stuck at12km');
 assert.ok(peak.every(w=>w.runs.find(r=>r.role==='long-run')?.minutes<=130||!w.runs.some(r=>r.role==='long-run')));
 const fractional=preparation.fitRunToMinutes(preparation.assess({...base,runGoal:'half'},3,options).runs[0],59.5);
 assert.equal(fractional.feasible,true);assert.ok(fractional.run.minutes<=59);
});
test('a future ordered marathon preserves aerobic support during the strength-first stage without turning health running into race prep',()=>{
 const c={...base,runGoal:'fitness',runs:3,hybridFocus:'strength',runningTargetDate:'2027-05-02',strengthTargetDate:'2027-01-23',runProfile:{...base.runProfile,weeklyKm:30},runningHistory:{weeklyKm:[28,29,29,30,30,30],longRun:{km:12,minutes:90,recoveryHours:24}},runningPriorityFromWeek:14,orderedGoals:[{sport:'strength',date:'2027-01-23',runGoal:'fitness',hybridFocus:'strength'},{sport:'running',date:'2027-05-02',runGoal:'marathon',hybridFocus:'running'}],goalSchedule:[{fromWeek:1,hybridFocus:'strength'},{fromWeek:14,hybridFocus:'running'}]};
 const supporting=preparation.assess(c,5,options),health=preparation.assess({...c,orderedGoals:[]},5,options);
 assert.equal(supporting.supportEndurance,true);assert.equal(supporting.preparationMode,'endurance-support');
 assert.ok(supporting.requestedKm>=30&&supporting.requestedKm<=34);assert.equal(health.requestedKm,18);
 assert.ok(supporting.longKm>=11);assert.ok(supporting.runs.every(r=>!r.steps.some(s=>s.role==='work')),'Strength-first support stays easy');
 const recent=preparation.assess({...c,runningHistory:{...c.runningHistory,recentMarathonDate:'2026-10-25'}},1,options);
 assert.ok(recent.requestedKm<=12);assert.ok(recent.runs.every(r=>r.role==='easy-run'));
 const afterMeet=preparation.assess(c,13,options);assert.ok(afterMeet.requestedKm<=15);assert.ok(afterMeet.runs.every(r=>r.role==='easy-run'));
 assert.equal(afterMeet.reviewGates.recoveryCheckRequired,true);
});
test('marathon-specific endurance uses the available long-run window with supporting mileage and conditional slow-run review',()=>{
 const fast={...base,weeks:17,runs:4,runningTargetDate:'2027-02-28',runProfile:{distance:42.195,seconds:10740,weeklyKm:45,recency:'recent',effort:'performance'},runningHistory:{recentMarathonDate:'2026-10-25'},runVisitWindows:[{day:'Sun',kind:'long',minutes:180}]};
 const fastWeeks=Array.from({length:14},(_,i)=>preparation.assess(fast,i+1,options));
 assert.ok(Math.max(...fastWeeks.map(w=>w.longKm))>=29,'Established faster marathon preparation should contain supported ~30km exposure');
 for(const w of fastWeeks.filter(x=>x.longKm>=28))assert.ok(w.requestedKm-w.longKm>w.longKm,'Long work has substantial separate support');
 const slow={...base,weeks:26,runs:4,runningTargetDate:'2027-05-02',runProfile:{distance:42.195,seconds:18780,weeklyKm:30,recency:'recent',effort:'performance'},runningHistory:{recentMarathonDate:'2026-10-25'},runningPriorityFromWeek:14,orderedGoals:[{sport:'strength',date:'2027-01-23',hybridFocus:'strength'},{sport:'running',date:'2027-05-02',hybridFocus:'running',runGoal:'marathon'}],goalSchedule:[{fromWeek:1,hybridFocus:'strength'},{fromWeek:14,hybridFocus:'running'}],runVisitWindows:[{day:'Sun',kind:'long',minutes:240}]};
 const slowWeeks=Array.from({length:23},(_,i)=>preparation.assess(slow,i+1,options));
 const peak=slowWeeks.reduce((a,b)=>a.requestedKm>b.requestedKm?a:b);
 assert.ok(peak.requestedKm>=55&&peak.requestedKm<=60,'Conditional handover develops endurance beyond the prior weak peak');
 assert.ok(peak.longKm>=24&&peak.longKm<30,'Slow runner gets a substantial time-bounded rehearsal, not a forced five-hour30km run');
 assert.ok(peak.runs.find(r=>r.role==='long-run').minutes<=240);
 assert.equal(peak.reviewGates.longRunHistoryConfirmed,false,'Past marathon does not fabricate current long-run history');
 assert.equal(peak.reviewGates.handoverProgressionReview,true);assert.equal(peak.reviewGates.longDurationReview,true);
 assert.ok(slowWeeks[13].requestedKm<=slowWeeks[10].requestedKm*1.15,'Post-meet return must be assessed against the established pre-taper dose, not compound fictional growth through the meet/recovery week');
});
test('undated low-frequency marathon goals build a base without claiming race-specific preparation',()=>{
 const c={...base,weeks:8,runs:2,runningTargetDate:'',runGoal:'marathon',runProfile:{...base.runProfile,weeklyKm:15}};
 const weeks=Array.from({length:8},(_,i)=>preparation.assess(c,i+1,options));
 assert.ok(weeks.every(w=>w.feasible&&w.preparationMode==='base-building'&&w.phase!=='Specific preparation'&&!w.taper));
 assert.ok(weeks.every(w=>w.runs.length===2&&w.runs.every(r=>!r.steps.some(s=>s.role==='work'))));
 assert.ok(weeks[0].warnings.some(x=>/third easy run/.test(x)));
 assert.equal(preparation.assess({...c,runningTargetDate:'2027-03-07'},1,options).feasible,false);
});
