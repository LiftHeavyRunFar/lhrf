const test = require('node:test');
const assert = require('node:assert/strict');
const coach = require('../src/coach-engine.js');
const adapters = require('../src/coach-adapters.js');
const {fullInventory} = require('./equipment-fixtures.cjs');

const MEET = '2026-12-19';
const NOW = () => Date.parse('2026-11-09T12:00:00Z');
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const LIFTS = ['Squat', 'Bench', 'Deadlift'];

function profile(event, overrides = {}) {
  const lifts = event === 'powerlifting' ? LIFTS : LIFTS.filter(lift => lift.toLowerCase() === event);
  return {
    ...adapters.normalizeProfile({
      event, strengthTargetDate: MEET, startDate: '2026-11-09', weeks: 6, days: 7,
      availableDays: DAYS, trainingAge: 'intermediate', strengthMode: 'auto', priority: 'Bench',
      squat: +lifts.includes('Squat'), bench: +lifts.includes('Bench'), deadlift: +lifts.includes('Deadlift'),
      runs: 0, equipmentInventory: fullInventory(), competitionIntakeVersion: 1,
      visitConstraints: {strengthVisits: lifts.length, eventDays: {[MEET]: {confirmed: true}}}
    }),
    liftProfiles: Object.fromEntries(lifts.map(lift => [lift, {
      kg: 100, reps: 1, resultDate: '2026-11-06', competitionTechnique: true
    }])),
    ...overrides
  };
}

function review(raw, {now = NOW, conditional = false} = {}) {
  const config = coach.prepareNewProgramme(raw, {now});
  if (!conditional) delete config.competitionConditionalVersion;
  const programme = adapters.buildProgramme(config, {now});
  const sessions = programme.weeks.flatMap(week => week.sessions);
  const issues = programme.weeks.flatMap(week => week.blockingIssues || []);
  const finalExposures = sessions.flatMap(session => session.ex).filter(ex => ex[5]?.finalHeavyExposure);
  const conditionalExposures = sessions.flatMap(session => session.ex).filter(ex => ex[5]?.conditionalFinalHeavy);
  return {config, programme, sessions, issues, finalExposures, conditionalExposures};
}

test('competition types produce only their event lifts and deliver each athlete-chosen single and taper', () => {
  const choices = {Squat: {mode: 'athlete', date: '2026-12-11'}, Bench: {mode: 'athlete', daysOut: 6},
    Deadlift: {mode: 'athlete', daysOut: 10}};
  const expected = {Squat: '2026-12-11', Bench: '2026-12-13', Deadlift: '2026-12-09'};
  for (const event of ['powerlifting', 'bench', 'deadlift']) {
    const lifts = event === 'powerlifting' ? LIFTS : LIFTS.filter(lift => lift.toLowerCase() === event);
    const finalHeavyPreferences = Object.fromEntries(lifts.map(lift => [lift, choices[lift]]));
    const result = review(profile(event, {finalHeavyPreferences}));
    assert.deepEqual(result.issues, []);
    const meet = result.sessions.find(session => session.competitionType);
    assert.equal(meet.eventDate, MEET);
    assert.deepEqual(meet.competitionLifts, lifts);
    assert.equal(meet.variationNotes.length, lifts.length);
    meet.variationNotes.forEach((note, i) => {
      assert.match(note, new RegExp('^' + lifts[i] + ':'));
      assert.match(note, /warm up|warm-up/i);
      assert.match(note, /opener/);
    });
    assert.equal(result.finalExposures.length, lifts.length);
    for (const lift of lifts) {
      const plan = result.programme.finalHeavyPlan[lift];
      assert.equal(plan.date, expected[lift]);
      assert.equal(plan.kind, 'single');
      const single = result.finalExposures.find(ex => ex[0] === lift);
      assert.equal(single[2], 1);
      assert.equal(single[3], 0);
      assert.equal(single[4], 7.5);
      assert.equal(single[5].earnedProgression, undefined);
      const eventWeek = result.programme.weeks.at(-1);
      for (const session of eventWeek.sessions) {
        for (const ex of session.ex.filter(ex => ex[0] === lift)) {
          assert.ok(ex[4] <= 6 || ex[5].finalHeavyExposure, 'Only the designated final exposure can remain heavy in meet week');
        }
      }
    }
  }
});

test('coach timing distinguishes supported singles, demanding rep practice and novice technique', () => {
  const available = {bench: 7, visitConstraints: {strengthVisits: 7, eventDays: {[MEET]: {confirmed: true}}}};
  const advanced = review(profile('bench', {...available, trainingAge: 'advanced'}));
  const intermediate = review(profile('bench', available));
  assert.equal(advanced.programme.finalHeavyPlan.Bench.daysOut, 6);
  assert.equal(intermediate.programme.finalHeavyPlan.Bench.daysOut, 7);
  assert.equal(intermediate.programme.finalHeavyPlan.Bench.mode, 'coach');
  const missingSingle = {liftProfiles: {Bench: {kg: 100, reps: 5}}};
  const reps = review(profile('bench', {...available, ...missingSingle}));
  assert.equal(reps.programme.finalHeavyPlan.Bench.kind, 'rep-practice');
  assert.ok(reps.finalExposures.every(ex => ex[2] > 1));
  const novice = review(profile('bench', {...available, ...missingSingle, trainingAge: 'beginner'}));
  assert.equal(novice.programme.finalHeavyPlan.Bench.kind, 'none');
  assert.equal(novice.finalExposures.length, 0);
  assert.ok(novice.programme.weeks.at(-1).sessions.flatMap(session => session.ex).every(ex => ex[4] <= 6));
});

test('unavailable, too-late and unsupported athlete choices block approval with an explanation', () => {
  const tooLate = review(profile('deadlift', {finalHeavyPreferences: {Deadlift: {mode: 'athlete', daysOut: 2}}}));
  assert.ok(tooLate.issues.some(issue => /at least 5 days/.test(issue)));
  const unavailable = review(profile('bench', {availableDays: ['Mon'], finalHeavyPreferences: {Bench: {mode: 'athlete', daysOut: 6}}}));
  assert.ok(unavailable.issues.some(issue => /outside your available training days/.test(issue)));
  const unsupported = review(profile('bench', {trainingAge: 'beginner', finalHeavyPreferences: {Bench: {mode: 'athlete', daysOut: 6}}}));
  assert.ok(unsupported.issues.some(issue => /current experience supports technique practice/.test(issue)));
  assert.throws(() => coach.approveProgrammeConfig(tooLate.config, new Date(NOW()).toISOString()), /at least 5 days/);
  for (const result of [tooLate, unavailable, unsupported]) {
    assert.equal(result.finalExposures.length, 0);
    assert.equal(Object.values(result.programme.finalHeavyPlan)[0].date, null);
  }
});

const LONG_MEET = '2027-03-27';
const longChoices = {Squat: {mode: 'athlete', daysOut: 8}, Bench: {mode: 'athlete', daysOut: 6},
  Deadlift: {mode: 'athlete', daysOut: 10}};
function longHybrid(overrides = {}) {
  return profile('powerlifting', {
    strengthTargetDate: LONG_MEET, weeks: 20, runs: 2, finalHeavyPreferences: longChoices,
    visitConstraints: {strengthVisits: 3, eventDays: {[LONG_MEET]: {confirmed: true}}},
    ...overrides
  });
}

test('one protected long-run conflict retains both feasible final singles in a 20-week full meet', () => {
  const result = review(longHybrid({longRunDay: 'Sun'}));
  const {Squat, Bench, Deadlift} = result.programme.finalHeavyPlan;
  assert.equal(Squat.date, '2027-03-19');
  assert.equal(Deadlift.date, '2027-03-17');
  assert.equal(Bench.requestedDate, '2027-03-21');
  assert.equal(Bench.requestedDaysOut, 6);
  assert.equal(Bench.date, null);
  assert.match(Bench.reason, /protected long run/);
  assert.match(Bench.nextStep, /Choose another date/);
  assert.deepEqual(result.finalExposures.map(ex => ex[5].finalHeavyExposure.lift).sort(), ['Deadlift', 'Squat']);
  assert.equal(result.issues.length, 1);
  assert.throws(() => coach.approveProgrammeConfig(result.config, new Date(NOW()).toISOString()), /Bench.*protected long run/);
});

test('requested dates on three different weeks fit one strength visit per week and retain the taper', () => {
  const result = review(longHybrid({
    longRunDay: 'Tue', visitConstraints: {strengthVisits: 1, eventDays: {[LONG_MEET]: {confirmed: true}}},
    finalHeavyPreferences: {Squat: {mode: 'athlete', date: '2027-03-12'}, Bench: {mode: 'athlete', daysOut: 5},
      Deadlift: {mode: 'athlete', daysOut: 20}}
  }));
  assert.deepEqual(result.issues, []);
  const expected = {Squat: '2027-03-12', Bench: '2027-03-22', Deadlift: '2027-03-07'};
  assert.equal(result.finalExposures.length, 3);
  const start = Date.parse('2026-11-09T12:00:00Z');
  for (const lift of LIFTS) {
    const plan = result.programme.finalHeavyPlan[lift];
    assert.equal(plan.date, expected[lift]);
    assert.equal(plan.requestedDate, expected[lift]);
    assert.equal(plan.kind, 'single');
    assert.equal(result.finalExposures.find(ex => ex[0] === lift)[5].finalHeavyExposure.date, expected[lift]);
    for (const week of result.programme.weeks) for (const session of week.sessions.filter(s => !s.eventDate)) {
      const date = new Date(start + ((week.week-1)*7+DAYS.indexOf(session.day))*86400000).toISOString().slice(0, 10);
      if (date <= plan.date || date >= LONG_MEET) continue;
      assert.ok(session.ex.filter(ex => ex[0] === lift).every(ex => ex[4] <= 6), lift+' exceeded light work on '+date);
    }
  }
  assert.doesNotThrow(() => coach.approveProgrammeConfig(result.config, new Date(NOW()).toISOString()));
});

test('20-week fresh hybrid separates missing single evidence from genuine timed running prescriptions', () => {
  const missing = review(longHybrid({longRunDay: 'Tue', liftProfiles: {}}));
  for (const lift of LIFTS) {
    const plan = missing.programme.finalHeavyPlan[lift];
    assert.equal(plan.kind, 'none');
    assert.equal(plan.requestedDaysOut, longChoices[lift].daysOut);
    assert.match(plan.reason, /no recent completed competition-single evidence/);
    assert.match(plan.nextStep, /coach timing for controlled rep practice/);
  }
  assert.equal(missing.finalExposures.length, 0);
  assert.equal(missing.issues.length, 3);
  assert.equal(missing.programme.weeks.length, 20);
  for (const week of missing.programme.weeks) {
    const runs = week.sessions.flatMap(s => s.runs);
    assert.ok(runs.length);
    assert.ok(runs.every(r => r.distanceKnown === false && r.minutes >= 15 && r.distanceKm === 0));
  }
  const withEvidence = review(longHybrid({longRunDay: 'Tue',
    runProfile: {distance: 10, seconds: 3000, recency: 'recent', weeklyKm: 20, resultDate: '2026-11-01', effort: 'performance'}}));
  assert.deepEqual(withEvidence.issues, []);
  assert.ok(withEvidence.programme.weeks.every(w => w.runningSummary.trainingKm > 0));
});

test('reported pain blocks a chosen rehearsal and supporting lifts stay light for a deadlift-only meet', () => {
  const finalHeavyPreferences = {Deadlift: {mode: 'athlete', daysOut: 10}};
  const unsafe = review(profile('deadlift', {finalHeavyPreferences, recoveryObservations: [{
    sport: 'strength', task: 'heavy', lift: 'Deadlift', status: 'pain', observedAt: '2026-11-08'
  }]}));
  assert.ok(unsafe.issues.some(issue => /current recovery|competition-single experience/i.test(issue)));
  assert.equal(unsafe.finalExposures.length, 0);
  const support = review(profile('deadlift', {finalHeavyPreferences, bench: 1, squat: 1}));
  assert.deepEqual(support.issues, []);
  assert.equal(support.config.strengthModes.Bench, 'maintenance');
  assert.equal(support.config.strengthModes.Squat, 'maintenance');
  assert.deepEqual(support.finalExposures.map(ex => ex[0]), ['Deadlift']);
  const supportingWork = support.programme.weeks.at(-2).sessions.flatMap(session => session.ex)
    .filter(ex => ['Bench', 'Squat'].includes(ex[0]));
  assert.ok(supportingWork.length > 0);
  assert.ok(supportingWork.every(ex => ex[4] <= 6));
});

test('competition and running calendar protects same-day and close-event conflicts', () => {
  assert.throws(() => review(profile('bench', {runningTargetDate: MEET})), /same date/);
  const race = '2026-12-13';
  const overlap = review(profile('bench', {
    runningTargetDate: race, runs: 3, runGoal: '10k', hybridFocus: 'balanced',
    runProfile: {distance: 10, seconds: 3000, recency: 'recent', weeklyKm: 22},
    finalHeavyPreferences: {Bench: {mode: 'athlete', date: race}},
    visitConstraints: {strengthVisits: 1, combinedDays: DAYS,
      eventDays: {[MEET]: {confirmed: true}, [race]: {confirmed: true}}}
  }));
  assert.ok(overlap.issues.some(issue => /overlaps a running event/.test(issue)));
  assert.equal(overlap.finalExposures.length, 0);
  const nextDay = '2026-12-20';
  const adjacent = review(profile('deadlift', {
    runningTargetDate: nextDay, runs: 3, runGoal: '10k',
    runProfile: {distance: 10, seconds: 3000, recency: 'recent', weeklyKm: 22},
    visitConstraints: {strengthVisits: 1, combinedDays: DAYS,
      eventDays: {[MEET]: {confirmed: true}, [nextDay]: {confirmed: true}}}
  }));
  const run = adjacent.sessions.find(session => session.eventType === 'running');
  assert.equal(run.recoveryReviewRequired, true);
});

test('pre-marker configs retain their existing output contract and no timing preferences are injected', () => {
  const legacy = profile('bench');
  delete legacy.competitionIntakeVersion;
  const {config, programme, sessions} = review(legacy);
  assert.equal(config.finalHeavyPreferences, undefined);
  assert.equal(programme.finalHeavyPlan, undefined);
  assert.equal(sessions.find(session => session.eventType === 'strength').name, 'Strength competition');
  assert.equal(sessions.some(session => session.competitionLifts), false);
});

const ownerPreferences = {Squat: {mode: 'athlete', date: '2027-03-20'}, Bench: {mode: 'athlete', daysOut: 5},
  Deadlift: {mode: 'athlete', daysOut: 9}};
const ownerDates = {Squat: '2027-03-20', Bench: '2027-03-22', Deadlift: '2027-03-18'};

test('fresh 20-week meet reserves all requested dates as safe fallback work and can be approved', () => {
  const raw = longHybrid({longRunDay: 'Tue', liftProfiles: {}, finalHeavyPreferences: ownerPreferences});
  const {config, issues, programme, sessions, conditionalExposures, finalExposures} = review(raw, {conditional: true});
  assert.deepEqual(issues, []);
  assert.equal(programme.weeks.length, 20);
  assert.equal(sessions.find(s => s.eventType === 'strength').eventDate, LONG_MEET);
  assert.equal(conditionalExposures.length, 3);
  assert.equal(finalExposures.length, 0);
  for (const lift of LIFTS) {
    const plan = programme.finalHeavyPlan[lift];
    assert.equal(plan.kind, 'conditional-single');
    assert.equal(plan.date, ownerDates[lift]);
    assert.match(plan.condition, /two recent controlled sessions/);
    assert.match(plan.alternative, /controlled reps/);
    const ex = conditionalExposures.find(e => e[0] === lift);
    assert.deepEqual(ex[5].conditionalFinalHeavy, {lift,date:plan.date,daysOut:plan.daysOut,ceiling:7.5});
    assert.equal(ex[1], 1);
    assert.equal(ex[2], 2);
    assert.equal(ex[4], 7);
    assert.ok(!ex[5].finalHeavyExposure);
  }
  const approved = coach.approveProgrammeConfig(config, new Date(NOW()).toISOString());
  assert.equal(approved.competitionConditionalVersion, 1);
  const approvedPlan = adapters.buildProgramme(approved, {now: NOW});
  assert.deepEqual(approvedPlan.finalHeavyPlan, programme.finalHeavyPlan);
  assert.ok(!approvedPlan.weeks.flatMap(w => w.sessions).flatMap(s => s.ex).some(ex => LIFTS.includes(ex[0]) && ex[2] === 1));
  assert.throws(() => coach.prepareNewProgramme({...raw,weeks:19}, {now:NOW}), /include the competition date/);
  assert.throws(() => coach.prepareNewProgramme({...raw,startDate:'2026-11-08'}, {now:NOW}), /include the competition date/);
  const sundayStart = review({...raw,startDate:'2026-11-08',weeks:21}, {conditional:true});
  assert.equal(sundayStart.programme.weeks[20].sessions.find(s=>s.eventType==='strength')?.eventDate,LONG_MEET);
});

test('short lead time can use actual practice opportunities and novice experience retains bounded technique', () => {
  const choice = {Bench: {mode: 'athlete', daysOut: 5}};
  const now = () => Date.parse('2026-11-23T12:00:00Z');
  const unverified = review(profile('bench', {liftProfiles: {}, finalHeavyPreferences: choice}), {conditional: true, now});
  assert.deepEqual(unverified.issues, []);
  assert.equal(unverified.programme.finalHeavyPlan.Bench.kind, 'conditional-single');
  assert.equal(unverified.programme.finalHeavyPlan.Bench.date, '2026-12-14');
  assert.ok(unverified.programme.finalHeavyPlan.Bench.practiceDates.length>=2);
  assert.equal(unverified.conditionalExposures[0][2], 2);
  assert.equal(unverified.conditionalExposures[0][4], 7);
  const experienced = review(profile('bench', {finalHeavyPreferences: choice}), {conditional: true, now});
  assert.equal(experienced.programme.finalHeavyPlan.Bench.kind, 'conditional-single');
  assert.equal(experienced.conditionalExposures[0][2], 2);
  const legacy={...experienced.config};
  delete legacy.competitionPracticePlanVersion;
  delete legacy.competitionPracticeDates;
  assert.equal(adapters.buildProgramme(legacy,{now}).finalHeavyPlan.Bench.kind,'single','An existing older competition policy retains its prescribed dose');
  assert.doesNotThrow(() => coach.approveProgrammeConfig(unverified.config, new Date(now()).toISOString()));
  const novice = review(longHybrid({longRunDay:'Tue', trainingAge:'beginner', finalHeavyPreferences:ownerPreferences}), {conditional:true});
  assert.deepEqual(novice.issues, []);
  assert.equal(novice.conditionalExposures.length, 0);
  assert.equal(novice.finalExposures.length, 0);
  for(const lift of LIFTS){
    assert.equal(novice.programme.finalHeavyPlan[lift].kind,'technique');
    const dose=novice.sessions.flatMap(s=>s.ex).find(ex=>ex[5]?.finalHeavyAlternative?.lift===lift);
    assert.equal(dose[5].finalHeavyAlternative.date,ownerDates[lift]);
    assert.ok(dose[2]>1&&dose[4]<=6);
  }
});

test('equivalent 27- and 28-day proposals use available rehearsal evidence, while a sparse plan keeps controlled reps', () => {
  const finalHeavyPreferences={Bench:{mode:'athlete',date:ownerDates.Bench}};
  const raw=longHybrid({event:'bench',squat:0,deadlift:0,runs:0,bench:1,liftProfiles:{},finalHeavyPreferences,
    visitConstraints:{strengthVisits:1,eventDays:{[LONG_MEET]:{confirmed:true}}}});
  const plans=['2027-02-22','2027-02-23'].map(asOf=>review(raw,{conditional:true,now:()=>Date.parse(asOf+'T12:00:00Z')}).programme.finalHeavyPlan.Bench);
  assert.deepEqual(plans.map(plan=>plan.kind),['conditional-single','conditional-single']);
  assert.ok(plans.every(plan=>plan.practiceDates.length>=2));
  const now=()=>Date.parse('2027-03-13T12:00:00Z');
  const sparse=review({...raw,availableDays:['Mon']},{conditional:true,now});
  const rehearsal=sparse.programme.finalHeavyPlan.Bench;
  assert.equal(rehearsal.kind,'rep-practice');
  assert.equal(rehearsal.reviewOnDay,true);
  assert.equal(rehearsal.date,ownerDates.Bench);
  assert.deepEqual(rehearsal.practiceDates,['2027-03-15']);
  assert.deepEqual(sparse.finalExposures[0].slice(1,3),[1,2]);
  const marker=sparse.finalExposures[0][5].conditionalFinalHeavy;
  const approved=coach.approveProgrammeConfig(sparse.config,new Date(now()).toISOString());
  assert.deepEqual(adapters.buildProgramme(approved,{now}).finalHeavyPlan.Bench,rehearsal);
  const reassess=data=>coach.reassessConditionalFinalHeavy(approved,marker,{data,date:marker.date,now:()=>Date.parse(marker.date+'T12:00:00Z')});
  assert.equal(reassess({}).eligible,false);
  const id=approved.sessionNamespace+'custom-mon::strength', meta=sparse.finalExposures[0][5];
  const dates=['2027-03-15','2027-03-18'];
  const data={
    completedWorkouts:dates.map(date=>({id,date,prescription:{ex:[['Bench',1,2,100,7,meta]]}})),
    sets:dates.map(date=>({date,sessionId:id,exercise:'Bench',reps:2,weight:100,rpe:7,role:meta.role,
      ...Object.fromEntries(['exerciseId','variantId','loadType','doseUnit'].map(key=>[key,meta[key]]))}))
  };
  assert.equal(reassess(data).eligible,true,'Later genuine practice can earn the same on-day review route');
  data.completedWorkouts[1].prescription.ex[0][5]={...meta,trainingRole:'speed'};
  assert.equal(reassess(data).eligible,false,'A speed exposure cannot complete the rehearsal evidence');
});

test('conditional rehearsal still blocks a true unavailable or unsafe date and cannot retain a false milestone', () => {
  const unavailable = review(longHybrid({longRunDay:'Sat', finalHeavyPreferences:ownerPreferences}), {conditional:true});
  assert.equal(unavailable.programme.finalHeavyPlan.Squat.kind,'none');
  assert.equal(unavailable.programme.finalHeavyPlan.Squat.date,null);
  assert.match(unavailable.programme.finalHeavyPlan.Squat.reason,/protected long run/);
  assert.equal(unavailable.programme.finalHeavyPlan.Bench.kind,'conditional-single');
  assert.equal(unavailable.programme.finalHeavyPlan.Deadlift.kind,'conditional-single');
  assert.throws(()=>coach.approveProgrammeConfig(unavailable.config,new Date(NOW()).toISOString()),/protected long run/);
  const pain = review(longHybrid({longRunDay:'Tue', finalHeavyPreferences:ownerPreferences,
    recoveryObservations:[{sport:'strength',task:'heavy',lift:'Squat',status:'pain',observedAt:'2026-11-08'}]}), {conditional:true});
  assert.equal(pain.programme.finalHeavyPlan.Squat.kind,'none');
  assert.match(pain.programme.finalHeavyPlan.Squat.reason,/recovery/);
});

test('runtime accepts only comparable controlled completed days for an explicit on-date recheck', () => {
  const draft = review(longHybrid({longRunDay:'Tue', liftProfiles:{}, finalHeavyPreferences:ownerPreferences}), {conditional:true});
  const config=coach.approveProgrammeConfig(draft.config,new Date(NOW()).toISOString());
  const weeks=adapters.buildProgramme(config,{now:NOW}).weeks;
  const marker=draft.conditionalExposures.find(ex=>ex[0]==='Squat')[5].conditionalFinalHeavy;
  const anchor=Date.parse('2026-11-09T12:00:00Z'), stamp=(w,day)=>new Date(anchor+((w-1)*7+DAYS.indexOf(day))*86400000).toISOString();
  const candidates=weeks.flatMap(w=>w.sessions.filter(s=>!s.eventDate).map(s=>({s,w:w.week,date:stamp(w.week,s.day)})))
    .map(x=>({...x,ex:x.s.ex.find(ex=>ex[0]==='Squat'&&ex[2]<=3&&ex[4]>=6&&ex[4]<=7&&ex[5]?.competition&&['top','straight'].includes(ex[5]?.role))}))
    .filter(x=>x.ex&&x.date.slice(0,10)>='2027-02-20'&&x.date.slice(0,10)<='2027-03-17').slice(-2);
  assert.equal(candidates.length,2);
  const completedWorkouts=candidates.map(({s,w,date})=>({id:s.id,week:w,date,prescription:{ex:s.ex}}));
  const sets=candidates.map(({s,ex,date},index)=>({date,sessionId:s.id,exercise:ex[0],reps:ex[2],rpe:7,weight:100+index*2.5,
    role:ex[5].role,...Object.fromEntries(['exerciseId','variantId','loadType','doseUnit'].map(key=>[key,ex[5][key]]))}));
  const date=marker.date, now=()=>Date.parse(date+'T12:00:00Z'), data={completedWorkouts,sets};
  const before=JSON.stringify({config,data});
  assert.deepEqual(coach.reassessConditionalFinalHeavy(config,marker,{data,date,now}),{
    eligible:true,reason:'Confirm competition technique on both practice dates and normal recovery and warm-ups before choosing one single.',
    ceiling:7.5,practiceDates:candidates.map(x=>x.date.slice(0,10)),loadKg:100
  });
  assert.equal(JSON.stringify({config,data}),before);
  for(const invalid of [
    {...data,completedWorkouts:[]},
    {...data,sets:[sets[0],{...sets[1],variantId:'other-gym'}]},
    {...data,sets:[sets[0],{...sets[1],techniqueFailed:true}]},
    {...data,sets:[sets[0],{...sets[1],rpe:8.5}]},
    {...data,sets:[...sets,{...sets[1],date:date+'T08:00:00Z',rpe:7.5}]},
    {...data,sessionFeedback:[{date:date+'T10:00:00Z',discomfort:'yes'}]}
  ])assert.equal(coach.reassessConditionalFinalHeavy(config,marker,{data:invalid,date,now}).eligible,false);
  assert.equal(coach.reassessConditionalFinalHeavy(config,marker,{data,date:'2027-03-19',now}).eligible,false);
  assert.equal(coach.reassessConditionalFinalHeavy(config,marker,{data,date,now:()=>Date.parse('2027-03-21T12:00:00Z')}).eligible,false);
  assert.equal(coach.reassessConditionalFinalHeavy({...config,competitionConditionalVersion:undefined},marker,{data,date,now}).eligible,false);
});
