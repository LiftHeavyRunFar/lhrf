/* Private, offline attribution only. Reads saved prescriptions; never generates,
 * installs, activates, clears recovery, or writes training/source records. */
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const assert = require('node:assert/strict');
const backup = require('../src/training-backup');
const replacement = require('../src/programme-replacement');
const performance = require('../src/performance-history');
const review = require('../src/training-review');
const coach = require('../src/coach-engine');
const clone = value => JSON.parse(JSON.stringify(value));
const sha = value => crypto.createHash('sha256').update(value).digest('hex');
const shift = (day, days) => new Date(Date.parse(day+'T12:00:00Z')+days*86400000).toISOString().slice(0,10);
function inspect(source, asOf, sourceBytes = Buffer.from(JSON.stringify(source))) {
  if (!/^\d{4}-\d{2}-\d{2}T.*(?:Z|[+-]\d{2}:\d{2})$/.test(asOf||'') || !Number.isFinite(Date.parse(asOf)) || !performance.day(asOf)) throw Error('Supply an explicit valid as-of timestamp with a timezone.');
  const original = JSON.stringify(source), data = backup.create(source, {now:asOf});
  const today = performance.day(asOf), tomorrow = shift(today,1);
  const monday = shift(today,-((new Date(today+'T12:00:00Z').getUTCDay()+6)%7));
  const priorStart = shift(monday,-7), priorEnd = shift(monday,-1), comparisonDate = shift(tomorrow,-7);
  const config = data.customRoadmap||{}, snapshot = data.reviewedProgramme;
  const matchingSnapshot = !!config.programmeId && snapshot?.config?.programmeId === config.programmeId && Array.isArray(snapshot?.weeks);
  const completeSnapshot = matchingSnapshot && Number.isInteger(config.weeks) && snapshot.weeks.length===config.weeks && snapshot.weeks.every((w,i)=>w.week===i+1 && Array.isArray(w.sessions));
  const rows = [], uncertainties = [];
  function add(session, week, c, origin) {
    let date = null;
    try { date = replacement.dateOf(c,week,session); } catch { uncertainties.push('A '+origin+' session has no trustworthy calendar date: '+(session.id||'unknown')); }
    const existing = rows.find(r=>r.date===date && r.session.id===session.id);
    if (existing) {
      if (JSON.stringify(existing.session)!==JSON.stringify(session)) uncertainties.push('Active and frozen prescriptions differ for '+session.id+' on '+date+'; activeSchedule is retained separately.');
      else { existing.alsoSavedIn.push(origin); return; }
    }
    rows.push({date,week,origin,alsoSavedIn:[],session:clone(session)});
  }
  if (matchingSnapshot) for (const w of snapshot.weeks) for (const s of w.sessions||[]) add(s,w.week,snapshot.config,'reviewedProgramme.weeks');
  for (const s of data.activeSchedule||[]) add(s,Number(data.activeCustomWeek)||1,config,'activeSchedule');
  if (!matchingSnapshot) uncertainties.push('No matching reviewed snapshot: only the saved active week is known; other weeks are not regenerated.');
  else if (!completeSnapshot) uncertainties.push('Matching reviewed snapshot is incomplete; absent weeks/sessions are unknown, not regenerated rest days.');
  if (snapshot && !matchingSnapshot) uncertainties.push('A reviewed snapshot belongs to a different/unknown programme; it is not treated as current.');
  const due = date => rows.filter(r=>r.date===date);
  const dated = row => {
    const d = performance.day(row.date);
    if (!d || d>today) return false;
    return row.date.length===10 || Date.parse(row.date)<=Date.parse(asOf);
  };
  const recorded = data.sets.filter(dated), runs = data.runs.filter(dated);
  const lifts = recorded.filter(s=>/bench|squat|deadlift/i.test(s.exercise||''));
  const inPrior = row => {const d=performance.day(row.date);return d>=priorStart && d<=priorEnd;};
  const contexts = [];
  const historical = review.history({...data,sets:recorded,runs});
  for (const r of due(tomorrow)) {
    const e = coach.createEngine({data, schedule:[r.session], now:()=>Date.parse(asOf)});
    // This applies already saved exercise overrides only, never progression/generation.
    const display = e.effectiveSession(r.session.id);
    contexts.push({id:r.session.id,origin:r.origin,basePrescription:clone(r.session),
      effectiveBaseIdPrescription:display,override:data.overrides?.[r.session.id]||null,
      componentOverride:data.overrides?.[r.session.id+'::strength']||null,
      comparableReferences:performance.references(data,{...r.session,started:tomorrow+'T00:00:00Z'},historical,new Date(asOf))});
  }
  if (!due(tomorrow).length) uncertainties.push('Tomorrow has no saved prescription in the available coverage; this does not establish a rest day.');
  if (contexts.some(x=>x.componentOverride)) uncertainties.push('Component override is preserved separately; inspect the actual live component before claiming its exact executable prescription.');
  const trace = rows.flatMap(r=>(r.session.ex||[]).filter(e=>/squat|deadlift/i.test(e[0])).map(e=>({
    date:r.date,origin:r.origin,id:r.session.id,exercise:e[0],dose:clone(e),
    mechanism:e[5]?.recentMarathonRecovery?'first-fortnight marathon clip':
      e[5]?.policy==='endurance-support-v1'?'endurance-support override':
      e[5]?.light?'saved light-lift execution':'inspect metadata; no unique attribution',
    immutableSnapshot:r.origin==='reviewedProgramme.weeks',
    caution:'Metadata identifies a saved mechanism, not whether its continued clinical/coaching rationale remains valid.'
  })));
  const result = {schema:'lhrf-november-attribution-v1',asOf,timeZone:'Europe/London',
    privateReport:true,sourceSha256:sha(sourceBytes),sourceBackupExportedAt:source._backup?.exportedAt||null,
    sourceStateSha256:sha(original),sourceUnchanged:true,generationPerformed:false,activated:false,
    programme:{config,coverage:completeSnapshot?'complete reviewed snapshot plus saved active week':matchingSnapshot?'partial reviewed snapshot plus saved active week':'saved active week only',
      sourceDigest:snapshot?.sourceDigest||null,approvalContext:snapshot?.approvalContext||[],
      originalNativeConfig:snapshot?.originalNative?.config||null,activation:data.programmeActivation||null},
    currentPrescriptions:rows,lowerBodyDecisionTrace:trace,
    tomorrow:{date:tomorrow,prescriptions:contexts,comparisonDate,
      previousSavedPrescriptions:due(comparisonDate),
      previousComparableDayRecordedSets:lifts.filter(s=>performance.day(s.date)===comparisonDate)},
    recordedEvidence:{lastWeek:{start:priorStart,end:priorEnd,sets:recorded.filter(inPrior),runs:runs.filter(inPrior)},
      lowerBody:lifts.filter(s=>/squat|deadlift/i.test(s.exercise)),
      eligibleCompletedLowerBody:lifts.filter(s=>/squat|deadlift/i.test(s.exercise)&&performance.suitable(s)),
      bench:lifts.filter(s=>/bench/i.test(s.exercise)),
      excludedUndatedOrFutureSetCount:data.sets.length-recorded.length,
      note:'Original rows/RPE/identities are retained. These are recorded observations, not verified maxima or recommendations.'},
    recovery:{context:config.recoveryContext||null,evidence:config.recoveryEvidence||null,
      runningHistory:config.runningHistory||null,checkins:data.checkins,sessionFeedback:data.sessionFeedback||[]},
    savedOverrides:data.overrides||{},savedDecisions:data.decisions||[],
    protectedDraftsPresent:!!(source._backup?.deviceState?.lhrf_fresh_beta_live_v1114 || source._backup?.deviceState?.lhrf_fresh_beta_live_v1114_pendingRun),
    preservation:{setsSha256:sha(JSON.stringify(source.sets)),runsSha256:sha(JSON.stringify(source.runs)),
      completedSha256:sha(JSON.stringify(source.completedWorkouts||[])),
      garminAssociationsUnchanged:true,originalRpeUnchanged:true},
    proposedCorrection:{status:'requires individual review; no replacement created',version:'november-review-v1',
      changedPrescriptions:[],replacementReady:false,
      reason:'Attribution does not establish a justified dose change. Use a separately reviewed native proposal and existing fingerprint/backup/consent route.'},
    uncertainties};
  assert.equal(JSON.stringify(source),original,'Inspector changed source data');
  return result;
}
function assertPrivateDestination(dir) {
  let p = path.resolve(dir);
  while (!fs.existsSync(p)) p=path.dirname(p);
  p=fs.realpathSync(p);
  for (;;) {
    const marker=path.join(p,'.git');
    const isCheckout=fs.existsSync(marker) && (fs.statSync(marker).isFile()
      ? /^gitdir:\s/m.test(fs.readFileSync(marker,'utf8')) : fs.existsSync(path.join(marker,'HEAD')));
    if (isCheckout) throw Error('Keep private attribution reports outside every Git checkout.');
    const parent=path.dirname(p);if(parent===p)break;p=parent;
  }
}
function main(input,asOf,destination) {
  if (!input||!asOf||!destination) throw Error('Usage: node scripts/inspect-november-programme.cjs BACKUP AS_OF_TIMESTAMP PRIVATE_OUTPUT_DIRECTORY');
  assertPrivateDestination(destination);
  const bytes=fs.readFileSync(input),report=inspect(JSON.parse(bytes),asOf,bytes);
  fs.mkdirSync(destination,{recursive:true,mode:0o700});
  const output=path.join(destination,'november-attribution.json');
  if (path.resolve(input)===path.resolve(output)) throw Error('Output must not replace the source backup.');
  fs.writeFileSync(output,JSON.stringify(report,null,2)+'\n',{flag:'wx',mode:0o600});
  assert.ok(fs.readFileSync(input).equals(bytes),'Source backup changed');
  return {reportWritten:true,sourceUnchanged:true,generated:false,activated:false};
}
if (require.main===module) {try {console.log(JSON.stringify(main(...process.argv.slice(2))));}catch(e){console.error(e.message);process.exitCode=1;}}
module.exports={inspect,main};
