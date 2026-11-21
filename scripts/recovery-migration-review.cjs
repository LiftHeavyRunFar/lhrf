/* Synthetic offline QA operator gate. Not loaded by the app, not a real-data importer.
 * Reuses the frozen #204 adapter only in disposable storage supplied by a test.
 */
'use strict';
const fs = require('node:fs');
const {createHash} = require('node:crypto');
const {isDeepStrictEqual: equal} = require('node:util');
const path = require('node:path');
const adapterPath = path.join(__dirname, '../tests/fixtures/beta-cutover-96c9c6a0.cjs');
const sha = value => createHash('sha256').update(value).digest('hex');
if (sha(fs.readFileSync(adapterPath)) !== '07444bce5e60fc2e5c2034d6bead57a4a2da819d392134490d50323d376b30d3') throw Error('Frozen #204 adapter identity mismatch');
const adapter = require(adapterPath);
const {MAIN,LIVE} = adapter;
const companions = [LIVE,LIVE+'_pendingRun','lhrf_programme_replacement_lock_v1','lhrf_programme_replacement_transaction_v1'];
const fields = ['completedWorkouts','sets','runs'];
function freezeReview(value) {
 if(value&&typeof value==='object') {for(const child of Object.values(value))freezeReview(child);Object.freeze(value);}
 return value;
}
const occurrence = row => JSON.stringify([row.id ?? row.sessionId,row.week]);
function history(raw) {
 const data=JSON.parse(raw);
 if (!data || [...fields,'checkins'].some(k=>!Array.isArray(data[k]))) throw Error('Invalid history');
 if (data.completedWorkouts.some(x=>!x || typeof x.id!=='string' || !x.id || !Number.isInteger(x.week))) throw Error('Occurrence needs an explicit id and week');
 return data;
}
function valuesValid(values) {
 if (!values || typeof values!=='object' || Array.isArray(values) || Object.entries(values).some(([k,v])=>!/^lhrf|^competition:lhrf/i.test(k) || (typeof v!=='string' && v!==null))) throw Error('Invalid raw capture values');
 for (const k of [MAIN,...companions]) if (!Object.hasOwn(values,k)) throw Error('Capture inventory incomplete: '+k);
 history(values[MAIN]);
}
function inventories(values) {
 return Object.fromEntries(Object.keys(values).sort().map(k=>[k,values[k]===null?null:sha(values[k])]));
}
function captureValues(capture) {
 if(capture.format!=='lhrf-durable-recovery-v1') return capture.values;
 return {...Object.fromEntries(companions.map(k=>[k,null])),...capture.local};
}
function receipt(raw,meta) {
 const capture=JSON.parse(raw); const values=captureValues(capture);
 valuesValid(values);
 const data=history(values[MAIN]);
 return {format:'lhrf-capture-receipt-v1',synthetic:true,...meta,sha256:sha(raw),keyDigests:inventories(values),
  occurrences:data.completedWorkouts.map(occurrence),counts:Object.fromEntries([...fields,'checkins'].map(k=>[k,data[k].length]))};
}
function readCapture(entry) {
 const r=entry.receipt;
 if (!r || r.format!=='lhrf-capture-receipt-v1' || r.synthetic!==true || !r.writer || !r.build || !r.origin || !Number.isFinite(Date.parse(r.capturedAt)) || !/^[a-f0-9]{64}$/.test(r.sha256||'')) throw Error('Missing or invalid capture receipt');
 const raw=fs.readFileSync(entry.file,'utf8');
 if (sha(raw)!==r.sha256) throw Error('Capture checksum mismatch: '+r.writer);
 const capture=JSON.parse(raw);
 if (!['lhrf-raw-capture-v1','lhrf-durable-recovery-v1'].includes(capture.format)) throw Error('Unsupported capture format');
 const values=captureValues(capture);
 valuesValid(values);
 const derived=receipt(raw,r);
 for(const k of ['keyDigests','occurrences','counts']) if(!equal(derived[k],r[k])) throw Error('Receipt detail mismatch: '+k);
 if (capture.format==='lhrf-durable-recovery-v1') {
  const envelope=capture.durable;
  if(!envelope || !Number.isInteger(envelope.revision) || !Array.isArray(envelope.snapshots) || !envelope.snapshots.length) throw Error('Incomplete durable recovery export');
  for(const s of envelope.snapshots) {
   if(sha(JSON.stringify(s.values))!==s.digest) throw Error('Durable snapshot checksum mismatch');
  }
  for(const s of envelope.recoveries||[]) if(sha(JSON.stringify(s.local))!==s.digest) throw Error('Recovery observation checksum mismatch');
  // A null absent key and an omitted key are the same only for the explicit inventory.
  const latest=Object.fromEntries(Object.keys(values).map(k=>[k,envelope.snapshots[0].values[k]??null]));
  if(capture.error || !equal(values,latest) || Object.keys(envelope.snapshots[0].values).some(k=>!Object.hasOwn(values,k))) throw Error('Unresolved local/durable recovery variants; retain both copies');
 }
 if(companions.some(k=>values[k]!==null)) throw Error('Unresolved offline workout, pending run or programme transaction');
 return {raw,values,receipt:r};
}
function prepare({baseline,captures,roster,reviewedRaw}) {
 valuesValid(baseline);
 if(!roster || roster.evidence!=='synthetic-harness-complete' || roster.frozen!==true || !Array.isArray(roster.writers) || !roster.writers.length || roster.writers.some(w=>typeof w!=='string'||!w) || new Set(roster.writers).size!==roster.writers.length) throw Error('No complete frozen synthetic writer roster');
 const verified=captures.map(readCapture);
 if(!equal([...roster.writers].sort(),verified.map(x=>x.receipt.writer).sort())) throw Error('A writer capture/receipt is missing or duplicated');
 const base=history(baseline[MAIN]), expected=structuredClone(base),edits=new Map();
 for(const c of verified) {
  if(c.receipt.origin!==roster.origin || c.receipt.build!==roster.build) throw Error('Writer origin/build mismatch');
  if(!equal(Object.keys(c.values).sort(),Object.keys(baseline).sort())) throw Error('Capture inventory differs; manual review required');
  for(const k of Object.keys(baseline)) if(k!==MAIN && c.values[k]!==baseline[k]) throw Error('Ancillary settings/draft change needs manual review: '+k);
  const current=history(c.values[MAIN]), additions={};
  for(const k of fields) {
   if(!equal(current[k].slice(0,base[k].length),base[k])) throw Error('Historical rows changed; manual reconciliation required');
   additions[k]=current[k].slice(base[k].length); current[k]=current[k].slice(0,base[k].length);
  }
  if(!equal(current,base)) throw Error('Non-append history, settings or check-in change needs manual review');
  const groups=new Map();
  for(const done of additions.completedWorkouts) {
   const id=occurrence(done);
   if(groups.has(id) || base.completedWorkouts.some(x=>occurrence(x)===id)) throw Error('Duplicate existing occurrence needs manual review');
   groups.set(id,{completedWorkouts:[done],sets:[],runs:[]});
  }
  for(const k of ['sets','runs']) for(const row of additions[k]) {
   const group=groups.get(occurrence(row));
   if(!group) throw Error('Unfinished or unassociated history row needs review');
   group[k].push(row);
  }
  for(const [id,rows] of groups) {
   if(edits.has(id) && !equal(edits.get(id),rows)) throw Error('Disputed occurrence retained for review: '+id);
   if(!edits.has(id)) {edits.set(id,rows);for(const k of fields)expected[k].push(...rows[k]);}
  }
 }
 if(!equal(history(reviewedRaw),expected)) throw Error('Reviewed history omits or changes captured edits');
 return freezeReview({format:'lhrf-synthetic-migration-plan-v1',synthetic:true,reviewOnly:true,boundary:'no-import',reviewedRaw,reviewedSha256:sha(reviewedRaw),
  frozenValues:{...baseline,[MAIN]:reviewedRaw},roster:structuredClone(roster),captureEntries:captures.map(x=>({file:x.file,receipt:structuredClone(x.receipt)})),
  counts:Object.fromEntries([...fields,'checkins'].map(k=>[k,expected[k].length])),occurrences:expected.completedWorkouts.map(occurrence)});
}
function verifyFrozen(storage,plan) {
 for(const entry of plan.captureEntries) readCapture(entry);
 // Import adapter's STAGE/STORE are QA-only outputs, not captured legacy keys.
 const actual={};
 for(let i=0;i<storage.length;i++) {const k=storage.key(i);if(/^lhrf|^competition:lhrf/i.test(k))actual[k]=storage.getItem(k);}
 const expected=Object.fromEntries(Object.entries(plan.frozenValues).filter(([,v])=>v!==null));
 if(!equal(actual,expected)) throw Error('Captured legacy values changed after review; retain a fresh capture and stop');
 if(plan.synthetic!==true || plan.format!=='lhrf-synthetic-migration-plan-v1' || sha(plan.reviewedRaw)!==plan.reviewedSha256) throw Error('Invalid reviewed plan');
}
// A reviewed snapshot and a synthetic roster are evidence, never import authority.
// Keep all supported write entrypoints closed, including for a valid review or
// a serialised/altered plan. Reopening this requires a separately reviewed change.
async function stage() { throw Error('No import: this draft is review-only. Legacy-writer accounting, verified receipts, resolved edits and an enforceable freeze require explicit review; no source is written.'); }
async function commit() { return stage(); }
module.exports={MAIN,LIVE,companions,sha,receipt,readCapture,prepare,stage,commit,verifyFrozen};
