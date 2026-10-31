const test=require('node:test'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const coach=require('../src/coach-engine'),adapters=require('../src/coach-adapters'),install=require('../src/programme-install');
const days=['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
const base={startDate:'2027-01-04',weeks:12,event:'bench',priority:'Bench',trainingAge:'advanced',bench:3,squat:1,deadlift:1,runs:2,runGoal:'fitness',maxes:{bench:120,squat:150,deadlift:180},tenKTime:'50:00',runningBaselineMinutes:120,availableDays:days,doubleDays:days,days:7,maxSessionsPerDay:2};
const create=input=>{const p=adapters.buildNewProgramme({...base,...input});return {...p,engine:coach.createEngine({data:{customRoadmap:p.config}})}};
const main=s=>s.ex.filter(e=>e[5]?.category==='primary');
function sessionDate(c,s,w){const d=new Date(c.startDate+'T12:00:00Z');d.setUTCDate(d.getUTCDate()-(d.getUTCDay()+6)%7+(w-1)*7+days.indexOf(s.day.slice(0,3)));return d.toISOString().slice(0,10)}
function target(weeks,day=5){const d=new Date('2027-01-04T12:00:00Z');d.setUTCDate(d.getUTCDate()+7*(weeks-1)+day);return d.toISOString().slice(0,10)}
test('the canonical new-programme factory internalises shared defaults without mutating input or copying personal peak rules',()=>{
 const input={...base,programmeId:'november-2026',sessionNamespace:'old-',approvedAt:'2026-10-01',benchPeakVersion:2,benchExposureVersion:1,finalHeavyBenchDaysOut:6},before=JSON.stringify(input);
 const c=coach.prepareNewProgramme(input);assert.equal(JSON.stringify(input),before);assert.equal(c.coachingRulesVersion,1);assert.equal(c.runningWorkoutVersion,1);assert.equal(c.exerciseSelectionVersion,2);
 for(const key of ['programmeId','sessionNamespace','approvedAt','benchPeakVersion','benchExposureVersion','finalHeavyBenchDaysOut'])assert.equal(c[key],undefined);
 assert.deepEqual(coach.prepareNewProgramme(c),c);
 assert.equal(adapters.buildNewProgramme(base).config.coachingRulesVersion,1);
 assert.equal(adapters.previewNewProgramme(base).config.coachingRulesVersion,1);
});
test('bench frequencies 1–4 get appropriate roles and complete distinct supporting work',()=>{
 const expected={1:['strength'],2:['volume','heavy'],3:['volume','heavy','speed'],4:['volume','heavy','speed','technique']};
 for(let bench=1;bench<=4;bench++){
  const p=create({bench}),sessions=p.weeks[0].sessions.filter(s=>main(s).some(e=>e[0]==='Bench'));
  assert.deepEqual(sessions.map(s=>main(s)[0][5].trainingRole),expected[bench]);
  for(const s of sessions){assert.ok(s.ex.some(e=>e[5]?.role==='accessory'),'No bench-only loading day');const first=s.ex.findIndex(e=>e[5]?.optional);if(first>=0)assert.ok(s.ex.slice(first).every(e=>e[5]?.optional));}
  if(bench>=3){const menus=sessions.slice(0,3).map(s=>s.ex.filter(e=>e[5]?.role==='accessory').map(e=>e[0]));assert.equal(new Set(menus.map(JSON.stringify)).size,3);}
 }
});
test('short and long horizons, frequency, experience and priority replay as 96 deterministic synthetic athletes',t=>{
 let profiles=0,weeksChecked=0;
 for(const weeks of [4,6,12,20])for(const bench of [1,2,3,4])for(const trainingAge of ['beginner','intermediate','advanced'])for(const priority of ['Bench','Running']){
  const input={...base,weeks,bench,trainingAge,priority,hybridFocus:priority==='Running'?'running':'strength',strengthTargetDate:target(weeks)};
  const before=JSON.stringify(input),p=adapters.buildNewProgramme(input),again=adapters.buildNewProgramme(input);assert.deepEqual(p,again);assert.equal(JSON.stringify(input),before);assert.equal(p.config.coachingRulesVersion,1);
  for(const week of p.weeks){weeksChecked++;assert.ok(week.sessions.length<=7);for(const s of week.sessions){for(const e of s.ex){assert.ok(Number.isFinite(e[3])&&e[3]>=0);assert.ok(e[1]>=1&&e[2]>=1&&e[4]>=1&&e[4]<=8.5);if(trainingAge==='beginner')assert.ok(e[4]<=7);if(e[5]?.role==='backoff')assert.equal(s.ex[e[5].topIndex]?.[5]?.role,'top');}for(const r of s.runs)assert.ok(Number.isFinite(r.distanceKm)&&r.distanceKm>=0);}}
  const singles=p.weeks.flatMap(w=>w.sessions.flatMap(s=>main(s).filter(e=>e[0]==='Bench'&&e[2]===1)));
  if(trainingAge==='beginner')assert.equal(singles.length,0);else {assert.ok(singles.length>0);if(priority==='Running')assert.ok(singles.every(e=>e[4]<=7.5));}
  profiles++;
 }
 assert.equal(profiles,96);t.diagnostic(`${profiles} new athletes, ${weeksChecked} programme weeks replayed twice`);
});
test('63 non-personal calendars choose lift-specific final heavy dates from real available days',t=>{
 let calendars=0;
 for(const weeks of [2,5,20])for(let eventDay=0;eventDay<7;eventDay++)for(const lift of ['Bench','Squat','Deadlift']){
  const key=lift.toLowerCase(),input={...base,weeks,event:key,priority:lift,bench:0,squat:0,deadlift:0,runs:0,[key]:3,strengthTargetDate:target(weeks,eventDay),availableDays:['Mon','Wed','Fri'],days:3,doubleDays:[],fixedSessions:['Mon','Wed','Fri'].map(day=>({kind:'strength',lift:key,day}))};
  const p=adapters.buildNewProgramme(input),e=coach.createEngine({data:{customRoadmap:p.config}}),calendar=e.generalStrengthCalendar(p.config).lifts[lift];assert.ok(calendar.finalHeavyDate);
  const delta=(Date.parse(input.strengthTargetDate)-Date.parse(calendar.finalHeavyDate))/86400000,bounds=lift==='Bench'?[4,7]:lift==='Squat'?[6,10]:[7,12];assert.ok(delta>=bounds[0]&&delta<=bounds[1],`${lift} ${delta}`);
  const final=p.weeks.flatMap(w=>w.sessions.map(s=>({s,date:sessionDate(p.config,s,w.week)}))).find(x=>x.date===calendar.finalHeavyDate);
  assert.equal(main(final.s)[0][2],1);assert.ok(main(final.s)[0][4]<=8.5);assert.equal(final.s.ex.some(e=>e[5]?.role==='accessory'||e[5]?.optional),false);
  for(const w of p.weeks)for(const s of w.sessions){if(s.eventDate)continue;const date=sessionDate(p.config,s,w.week),out=(Date.parse(input.strengthTargetDate)-Date.parse(date))/86400000;if(out>=0&&out<3)assert.equal(main(s).length,0);if(date>calendar.finalHeavyDate&&out>=0)assert.ok(main(s).every(e=>e[4]<=5.5));}
  calendars++;
 }
 assert.equal(calendars,63);t.diagnostic(`${calendars} schedules across all event weekdays and three lifts`);
});
test('heavy practice appears early in short preparations; long plans retain development and recovery instead of peaking from week one',()=>{
 const short=create({weeks:5,strengthTargetDate:target(5)}),long=create({weeks:52,strengthTargetDate:target(52)});
 assert.ok(short.weeks[0].sessions.flatMap(main).some(e=>e[0]==='Bench'&&e[2]===1));
 assert.ok(long.weeks[0].sessions.flatMap(main).filter(e=>e[0]==='Bench').every(e=>e[2]>1));
 assert.ok(long.weeks.some(w=>w.deload));
 for(const w of long.weeks.filter(w=>w.deload))assert.ok(w.sessions.flatMap(main).every(e=>e[4]<=6));
 const undated=create({weeks:52});assert.ok(undated.weeks.every(w=>w.phase!=='Taper / event'));assert.ok(undated.weeks.every(w=>w.sessions.flatMap(main).every(e=>e[2]!==1)));
});
test('beginner, returning, unknown-experience, unknown-load and running-maintenance athletes do not inherit advanced singles',()=>{
 for(const trainingAge of ['beginner','returning',undefined]){
  const p=create({trainingAge,maxes:{},weeks:5,strengthTargetDate:target(5)});assert.ok(p.weeks.flatMap(w=>w.sessions.flatMap(main)).every(e=>e[2]>1&&e[4]<=7&&e[3]===0));
 }
 const p=create({event:'running',priority:'Running',hybridFocus:'running',strengthMode:'maintenance',strengthTargetDate:null});
 assert.ok(p.weeks.flatMap(w=>w.sessions.flatMap(main)).every(e=>e[2]>1&&e[4]<=7.5));
});
test('availability gaps and locked uncalibrated variations raise review warnings rather than creating extra sessions or invented loads',()=>{
 const sparse=create({weeks:5,strengthTargetDate:target(5),bench:1,squat:0,deadlift:0,runs:0,availableDays:['Wed'],days:1,doubleDays:[],fixedSessions:[{kind:'strength',lift:'bench',day:'Wed'}]});
 assert.ok(sparse.weeks.some(w=>w.warnings.some(s=>s.includes('earlier-than-preferred'))));assert.ok(sparse.weeks.every(w=>w.sessions.every(s=>s.eventDate||s.day==='Wed')));
 const locked=create({weeks:5,strengthTargetDate:target(5),variations:{Bench:{choice:'Close-grip bench',lock:true}}});
 assert.ok(locked.weeks.some(w=>w.warnings.some(s=>s.includes('locked variation'))));
 const variations=locked.weeks.flatMap(w=>w.sessions.flatMap(s=>s.ex.filter(e=>e[0]==='Close-grip bench')));assert.ok(variations.length);assert.ok(variations.every(e=>e[3]===0));
 const impossible=create({bench:4,squat:2,deadlift:2,runs:4,availableDays:['Tue'],doubleDays:[],days:1,maxSessionsPerDay:1});assert.ok(impossible.weeks.every(w=>w.feasible===false&&w.unscheduled.length>0));
});
test('support movements respect preferences, remain stable within blocks and rotate later without changing event dates',()=>{
 const raw={...base,weeks:20,strengthTargetDate:null},p=adapters.buildNewProgramme(raw),c=p.config;
 const names=w=>p.weeks[w-1].sessions.filter(s=>main(s).some(e=>e[0]==='Bench')).map(s=>s.ex.filter(e=>e[5]?.role==='accessory').map(e=>e[0]));
 assert.deepEqual(names(1),names(3));assert.notDeepEqual(names(1),names(6));
 const e=coach.createEngine({data:{customRoadmap:c,accessoryPreferences:{'Incline dumbbell press':'avoid','Lat pulldown':'unavailable','Seated dumbbell shoulder press':'avoid'}}});
 for(const s of e.generatedSessions(c,1))assert.ok(s.ex.every(x=>!['Incline dumbbell press','Lat pulldown','Seated dumbbell shoulder press'].includes(x[0])));
});
test('approval gives a new programme independent completion IDs and filters older programme load increases',()=>{
 const proposal=coach.prepareNewProgramme(adapters.normalizeProfile(base)),a=coach.approveProgrammeConfig(proposal,'2026-10-30T10:00:00Z'),b=coach.approveProgrammeConfig(proposal,'2026-10-30T10:00:00Z');
 assert.notEqual(a.sessionNamespace,b.sessionNamespace);assert.equal(proposal.approvedAt,undefined);
 const stale={customRoadmap:a,decisions:[{approved:true,kind:'adaptive-progression',exercise:'Bench',week:1,factor:1.075,date:'2026-10-01T10:00:00Z'}]},e=coach.createEngine({data:stale}),s=e.generatedSessions(a,2),snapshot=JSON.stringify(s);assert.equal(JSON.stringify(e.carryForwardApprovedProgression(s,2)),snapshot);
 stale.decisions.push({approved:true,kind:'adaptive-progression',exercise:'Bench',week:1,factor:1.025,date:'2026-10-31T10:00:00Z'});assert.notEqual(JSON.stringify(e.carryForwardApprovedProgression(e.generatedSessions(a,2),2)),snapshot);
 assert.ok(e.generatedSessions(a,1).every(s=>s.id.startsWith(a.sessionNamespace)));
});
test('generic proposals cannot trigger personal November migrations and validation rejects malformed inputs',()=>{
 const config=coach.prepareNewProgramme({...adapters.normalizeProfile(base),programmeId:'november-2026',strengthTargetDate:'2027-03-27'}),state={customRoadmap:{...config,programmeId:'november-2026'},sets:[{keep:true}],runs:[],completedWorkouts:[],activeSchedule:[]};
 for(const fn of ['refreshApprovedRunningProgramme','refreshApprovedThresholdPaces','refreshApprovedBenchProgramme','refreshApprovedBenchPeak'])assert.equal(install[fn](state,coach,'2026-10-30T12:00:00Z'),state);
 for(const input of [{weeks:0},{bench:-1},{weeks:2.5},{startDate:'2027-02-30'},{strengthTargetDate:'2027-01-01',startDate:'2027-01-04'}])assert.throws(()=>adapters.buildNewProgramme({...base,...input}));
});
test('shared defaults are wired into onboarding, advanced proposals and trial preview while saved schedules stay read-only on startup',()=>{
 const fs=require('node:fs'),path=require('node:path'),app=fs.readFileSync(path.join(__dirname,'../index.html'),'utf8'),preview=fs.readFileSync(path.join(__dirname,'../coaching-preview.html'),'utf8');
 assert.match(app,/return LHRFCoach\.prepareNewProgramme\(intakeConfig\(cfg,selected\)\)/);assert.match(app,/const next=LHRFCoach\.prepareNewProgramme\(c\)/);assert.match(preview,/Object\.assign\(c,LHRFCoach\.prepareNewProgramme\(c\)\)/);
 assert.ok(app.includes('reviewed=wholeProgramme(proposal)'));assert.ok(app.includes('LHRFCoach.approveProgrammeConfig(proposal)'));assert.ok(app.includes('c=LHRFCoach.approveProgrammeConfig(c)'));
 const core=fs.readFileSync(path.join(__dirname,'../src/coach-engine.js'),'utf8');assert.doesNotMatch(core,/\b(document|localStorage|fetch)\s*[.(]/);
});
test('the existing approved November programme remains byte-identical across all five weeks',()=>{
 const fixture=require('./fixtures/approved-peak-v2.json'),e=coach.createEngine();
 for(const w of fixture.weeks)assert.equal(crypto.createHash('sha256').update(JSON.stringify(e.generatedSessions(fixture.config,w.week))).digest('hex'),w.sha256,`Approved week ${w.week}`);
});
test('Monday events after the UK daylight-saving change keep the correct taper week',()=>{
 const prior=process.env.TZ;process.env.TZ='Europe/London';
 try{const p=create({weeks:13,strengthTargetDate:'2027-03-29'});assert.notEqual(p.weeks[11].phase,'Taper / event');assert.equal(p.weeks[12].phase,'Taper / event');assert.equal(p.weeks[12].sessions.filter(s=>s.eventDate==='2027-03-29').length,1);}
 finally{if(prior===undefined)delete process.env.TZ;else process.env.TZ=prior}
});
test('explicit light supporting lifts retain their constraint throughout general powerlifting preparation',()=>{
 const p=create({weeks:12,event:'powerlifting',strengthTargetDate:target(12),lightLifts:['squat','deadlift']});
 for(const w of p.weeks)for(const s of w.sessions)for(const e of main(s).filter(e=>['Squat','Deadlift'].includes(e[0]))){assert.ok(e[4]<=5.5);assert.notEqual(e[5]?.role,'top');}
});
