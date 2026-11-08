const assert = require('node:assert/strict');
const {test} = require('node:test');
const coach = require('../src/coach-engine');
const adapters = require('../src/coach-adapters');
const running = require('../src/running-preparation');
const {fullInventory} = require('./equipment-fixtures.cjs');

const days = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
const now = () => Date.parse('2026-11-08T20:00:00Z');
const clock = date => Date.parse(date+'T12:00:00Z');
const pace = {distance:5,seconds:1500,resultDate:'2026-10-23',effort:'performance',recency:'recent'};
const empty = () => ({runs:[],completedWorkouts:[],sessionFeedback:[]});
const raw = changes => adapters.normalizeProfile({
 startDate:'2026-11-09',weeks:20,days:7,availableDays:days,runs:2,
 trainingAge:'intermediate',runGoal:'fitness',onboardingAerobicBuildVersion:1,
 visitConstraints:{strengthVisits:0},equipmentInventory:fullInventory(),...changes
});
const prepare = (profile,data=empty()) => coach.prepareNewProgramme(profile,{data,now});
const dose = (profile,data,week=1) => running.assess(prepare(profile,data),week,{now});
const good = {difficulty:'expected',energy:'good',discomfort:'no'};
function completion(data,day,run,{id='programme-run',km=5,minutes=run.minutes,feedback=good,flags={}}={}){
 const date=day+'T08:00:00Z';
 data.completedWorkouts.push({id,date,week:1,completedRun:true,prescription:{runs:[run]}});
 data.runs.push({date,sessionId:id,type:'easy-run',km,min:minutes,...flags});
 if(feedback)data.sessionFeedback.push({date:day+'T08:01:00Z',sessionId:id,week:1,...feedback});
}

test('fitness dose uses normal outing history and weekly budget independently of pace',()=>{
 const history = empty();
 for(const day of ['2026-11-02','2026-11-04','2026-11-06','2026-11-07']){
  completion(history,day,{role:'easy-run',distanceKm:7,minutes:44},{km:7,minutes:44});
 }
 const without = {...raw(),runProfile:{weeklyKm:28}};
 const withPace = {...without,runProfile:{...pace,weeklyKm:28}};
 assert.deepEqual(dose(without,history).runs.map(r=>r.distanceKm),[7,7]);
 assert.deepEqual(dose(withPace,history).runs.map(r=>r.distanceKm),[7,7]);
 assert.deepEqual(dose(without,empty()).runs.map(r=>[r.minutes,r.distanceKnown]),[[20,false],[20,false]]);
 assert.deepEqual(dose(withPace,empty()).runs.map(r=>[r.minutes,r.distanceKnown]),[[20,false],[20,false]]);
});

test('native easy completions can support a dated post-marathon return with no numeric RPE',()=>{
 const profile={...raw(),runProfile:{...pace,weeklyKm:28},runningHistory:{recentMarathonDate:'2026-11-01'},
  recoveryObservations:[{sport:'running',task:'easy',status:'normal',observedAt:'2026-11-06',
   nextDayResponse:'normal',referencePerformanceDate:'2026-11-05'}]};
 const history=empty(),plan={role:'easy-run',distanceKm:5,minutes:30};
 for(const day of ['2026-11-03','2026-11-05'])completion(history,day,plan);
 const positive=dose(profile,history);
 assert.equal(positive.actualKm,10);
 assert.equal(positive.qualityAllowed,false);
 const unconfirmed=dose({...profile,recoveryObservations:[]},history);
 assert.equal(unconfirmed.actualKm,5.6);
 assert.equal(unconfirmed.qualityAllowed,false);
 const adverse=structuredClone(history);adverse.sessionFeedback.at(-1).discomfort='yes';
 assert.ok(dose(profile,adverse).actualKm<=5.6);
 const hard=structuredClone(history);hard.runs.at(-1).rpe=7;
 assert.equal(dose(profile,hard).actualKm,5.6);
});

test('earned easy running survives planned cuts and unknown feedback, with explicit adverse and incomplete controls',()=>{
 const profile=prepare(raw());
 const get=week=>running.assess(profile,week,{now}).runs[0];
 const history=empty(),live=(run,data=history,ready=true)=>running.resolveAerobicBuild(run,data,{
  now:clock('2026-12-08'),ready,sessionNamespace:'programme-'
 });
 const normal=get(9),deload=get(8);
 completion(history,'2026-11-27',normal);
 completion(history,'2026-12-01',normal);
 completion(history,'2026-12-04',deload);
 completion(history,'2026-12-06',deload);
 assert.equal(live(get(13)).minutes,21);
 assert.equal(live(get(13),history,false).minutes,19);
 const unknown=structuredClone(history);
 completion(unknown,'2026-12-07',normal,{feedback:null});
 assert.equal(live(get(13),unknown).minutes,19);
 const short=structuredClone(history);
 completion(short,'2026-12-07',normal,{minutes:12});
 assert.equal(live(get(13),short).minutes,19);
 const repeatedlyShort=structuredClone(history);
 completion(repeatedlyShort,'2026-12-02',normal,{minutes:13});
 completion(repeatedlyShort,'2026-12-07',normal,{minutes:12});
 assert.equal(live(get(13),repeatedlyShort).minutes,19);
 const adverse=structuredClone(history);
 adverse.sessionFeedback.at(-1).discomfort='yes';
 assert.equal(live(get(13),adverse).minutes,15);
 const failed=structuredClone(history);
 failed.runs[1].failed=true;
 assert.equal(live(get(13),failed).minutes,15);
});

test('coach calendar tests actual visit fit and never trades full dose for a tighter slot',()=>{
 const allDays=raw({priority:'Bench',hybridFocus:'strength',bench:2,squat:2,deadlift:1,
  visitConstraints:{strengthVisits:3,minutes:{Tue:21,Wed:21}}});
 const block=adapters.buildProgramme(prepare(allDays),{now});
 assert.ok(block.weeks.every(w=>w.feasible!==false));
 const visits=block.weeks[18].sessions.filter(s=>s.runs.length);
 assert.equal(visits.length,2);
 assert.ok(visits.every(s=>s.runs[0].minutes===23&&!['Tue','Wed'].includes(s.day)));
 const tight={...allDays,visitConstraints:{strengthVisits:3,
  minutes:Object.fromEntries(days.map(day=>[day,21]))}};
 // Isolate running from strength visits that genuinely cannot fit a 21-minute cap.
 const runsOnly={...tight,bench:0,squat:0,deadlift:0,visitConstraints:{...tight.visitConstraints,strengthVisits:0}};
 const capped=adapters.buildProgramme(prepare(runsOnly),{now});
 assert.ok(capped.weeks.every(w=>w.feasible!==false));
 assert.deepEqual(capped.weeks[18].sessions.map(s=>[s.runs[0].minutes,s.timeBudget.totalMinutes]),[[16,21],[16,21]]);
});

test('feasibility can move a lift to another already available strength visit',()=>{
 const profile=raw({weeks:6,runs:0,bench:1,squat:1,deadlift:1,days:2,availableDays:['Mon','Thu'],
  visitConstraints:{strengthVisits:2,minutes:{Mon:50}}});
 const block=adapters.buildProgramme(prepare(profile),{now});
 assert.ok(block.weeks.every(w=>w.feasible!==false));
 assert.ok(block.weeks.every(w=>w.sessions.find(s=>s.day==='Mon').timeBudget.totalMinutes<=50));
});

test('a longest outing cannot become two typical runs, and 10K plans do not redistribute unsupported mileage',()=>{
 const profile={...raw(),runProfile:{...pace,weeklyKm:28},
  runningHistory:{longRun:{km:24,minutes:150}}};
 assert.deepEqual(dose(profile,empty()).runs.map(r=>[r.minutes,r.distanceKnown]),[[20,false],[20,false]]);
 const history=empty();
 for(const day of ['2026-11-02','2026-11-04','2026-11-06','2026-11-07']){
  completion(history,day,{role:'easy-run',distanceKm:7,minutes:44},{km:7,minutes:44});
 }
 const race=dose({...profile,runGoal:'10k',runningHistory:{longRun:{km:7,minutes:44}}},history);
 assert.equal(race.actualKm,14);
 assert.ok(race.runs.every(r=>r.distanceKm<=7));
 assert.ok(race.qualityBudget.workKm<=race.actualKm*.2);
 const intakeOnly=dose({...profile,runGoal:'10k',runningTargetDate:'2027-01-03',
  runningHistory:{weeklyKm:[28,28,28],longRun:{km:7,minutes:46}}},empty());
 assert.equal(intakeOnly.actualKm,14);
 assert.ok(intakeOnly.runs.every(r=>r.distanceKm<=7));
 const single=dose({...profile,runs:1,runGoal:'10k',runningTargetDate:'2027-01-03',
  runningHistory:{weeklyKm:[28,28,28],longRun:{km:7,minutes:46}}},empty());
 assert.equal(single.actualKm,7);
 const missing=dose({...profile,runGoal:'10k',runningTargetDate:'2027-01-03',
  runningHistory:{weeklyKm:[28,28,28]}},empty());
 assert.deepEqual(missing.runs.map(r=>[r.minutes,r.distanceKnown]),[[20,false],[20,false]]);
 assert.equal(missing.qualityAllowed,false);
 assert.ok(missing.blocking.some(reason=>/familiar running outing/.test(reason)));
});

test('an unavoidable run reduction can fit without dropping any strength or running visit',()=>{
 const profile=raw({priority:'Bench',hybridFocus:'strength',bench:2,squat:2,deadlift:1,
  visitConstraints:{strengthVisits:3,minutes:{Tue:21,Wed:21,Fri:21,Sun:21}}});
 const plan=adapters.buildProgramme(prepare(profile),{now});
 const week=plan.weeks[18],runs=week.sessions.filter(s=>s.runs.length);
 assert.ok(plan.weeks.every(w=>w.feasible!==false));
 assert.equal(week.sessions.filter(s=>s.ex.length).length,3);
 assert.deepEqual(runs.map(s=>[s.runs[0].minutes,s.timeBudget.totalMinutes]),[[16,21],[16,21]]);
});
