/* Investigation only. Replays repository policy with EMPTY synthetic history.
 * Does not call install, refresh, approval, storage, or new-programme APIs.
 * stdout is evidence, never an installable programme. */
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '../..');
const coach = require(path.join(root, 'src/coach-engine.js'));
const base = require(path.join(root, 'programmes/november-2026.json'));
const hash = file => crypto.createHash('sha256').update(fs.readFileSync(path.join(root, file))).digest('hex');
const now = () => Date.parse('2026-11-07T12:00:00Z');
const sourceBefore = JSON.stringify(base);
// These markers are explicit hypotheses from programme-install.js:60-66,89-91,120-124.
// This does NOT establish whether any device received the corresponding revisions.
const markers = {
  runningWorkoutVersion: 1, runningPaceVersion: 2, runningGoalSeconds: 3600,
  approvedRunningRevision: '2026-10-27-running-v3',
  runProfile: {...base.runProfile, distance: 5, seconds: 1700, time: '28:20',
    recency: 'recent', resultDate: null, effort: 'performance', environment: 'outdoor'},
  benchExposureVersion: 1, benchAccessoryVersion: 1, benchPeakVersion: 2,
  finalHeavyBenchDaysOut: 6,
};
const calendarDate = (week, day) => {
  const d = new Date('2026-10-26T12:00:00Z');
  d.setUTCDate(d.getUTCDate() + (week - 1) * 7 + ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].indexOf(day.slice(0,3)));
  return d.toISOString().slice(0,10);
};
function replay(config) {
  const data = {sets:[], runs:[], checkins:[], sessionFeedback:[], decisions:[], overrides:{}, customRoadmap:config};
  const before = JSON.stringify(data);
  const engine = coach.createEngine({data, now});
  const weeks = Array.from({length: config.weeks}, (_, i) => {
    const week = i + 1, sessions = engine.generatedSessions(config, week);
    const bench = sessions.flatMap(s => s.ex).filter(e => e[0] === 'Bench');
    return {week, benchWorkingSets: bench.reduce((n,e) => n+e[1],0),
      benchRepetitions: bench.reduce((n,e) => n+e[1]*e[2],0),
      trainingKm: Number(sessions.flatMap(s=>s.runs||[]).filter(r=>r.role!=='race').reduce((n,r)=>n+(r.distanceKm||0),0).toFixed(3)),
      sessions: sessions.map(s => ({date:calendarDate(week,s.day),day:s.day,id:s.id,
        eventDate:s.eventDate||null,eventType:s.eventType||null,
        ex:s.ex.map(e=>({exercise:e[0],sets:e[1],reps:e[2],kg:e[3],rpe:e[4],
          category:e[5]?.category,role:e[5]?.role,benchRole:e[5]?.benchRole,light:e[5]?.light||false})),
        runs:(s.runs||[]).map(r=>({name:r.name,role:r.role,distanceKm:r.distanceKm,minutes:r.minutes,
          rpe:r.rpe,pace:r.pace,workMinutes:r.workMinutes,steps:r.steps,paceBasis:r.paceBasis})),
        notes:s.variationNotes||[]}))};
  });
  assert.equal(JSON.stringify(data), before);
  return {paceEstimates:engine.runningPaces(config),weeks};
}
const documented = {...structuredClone(base),...structuredClone(markers)};
const output = {
  warning:'SYNTHETIC REPOSITORY POLICY REPLAY, NOT AN OWNER DEVICE SNAPSHOT. No live records accessed or changed.',
  asOf:'2026-11-07T12:00:00Z',history:'empty synthetic sets/runs/feedback/decisions',
  sourceSha256:Object.fromEntries(['programmes/november-2026.json','src/coach-engine.js','src/programme-install.js','src/running-workouts.js'].map(f=>[f,hash(f)])),
  markersHypothesis:markers,
  checkedInConfiguration:replay(structuredClone(base)),
  documentedRevisionHypothesis:replay(documented),
  lightFlagCausalityProbe:replay({...structuredClone(documented),lightLifts:[]}).weeks.map(w=>({
    week:w.week,lowerBody:w.sessions.flatMap(s=>s.ex).filter(e=>/squat|deadlift/i.test(e.exercise))})),
};
assert.equal(JSON.stringify(base),sourceBefore);
process.stdout.write(JSON.stringify(output,null,2)+'\n');
