'use strict';
const {test,after}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const os=require('node:os');
const path=require('node:path');
const {execFileSync}=require('node:child_process');
const qa=require('../scripts/recovery-migration-review.cjs');
const {MAIN,LIVE,sha}=qa;
// Historical positive rehearsal only. The supported review module now refuses all imports.
const adapter=require('./fixtures/beta-cutover-96c9c6a0.cjs');
const output=process.env.LHRF_RECOVERY_RECEIPTS_DIR;
const directory=output?path.resolve(output):fs.mkdtempSync(path.join(os.tmpdir(),'lhrf-migration-review-'));
fs.mkdirSync(directory,{recursive:true});
const reports=[];
const base=()=>({sets:[],runs:[],checkins:[{date:'2026-11-15',readiness:3}],completedWorkouts:[{id:'prior',week:0}],
 programme:{id:'fictional-approved-plan',prescription:'unchanged'},settings:{days:['Tuesday','Saturday']},unknownFuture:{preserve:'exactly'}});
const values=main=>({[MAIN]:main,...Object.fromEntries(qa.companions.map(k=>[k,null])),lhrf_treadmill_v1:'{"unit":"km"}',lhrf_fixture_settings:'{"keep":true}'});
const baseline=()=>values(JSON.stringify(base()));
const roster=writers=>({evidence:'synthetic-harness-complete',frozen:true,origin:'https://fictional-legacy.invalid',build:'fictional-legacy-v1.40.6',writers});
function storage(initial={}) {
 const data=new Map(Object.entries(initial).filter(([,v])=>v!==null));let queue=Promise.resolve();
 return {get length(){return data.size},key:i=>[...data.keys()][i],getItem:k=>data.get(k)??null,setItem:(k,v)=>data.set(k,String(v)),removeItem:k=>data.delete(k),entries:()=>Object.fromEntries(data),
 locks:{request:(_name,_options,action)=>{const next=queue.then(action);queue=next.catch(()=>{});return next;}}};
}
function historyEdit(id,week,sport,amount) {
 const d=base();d.completedWorkouts.push({id,week,date:'2026-11-16'});
 d[sport==='run'?'runs':'sets'].push(sport==='run'?{sessionId:id,week,km:amount,min:32,notes:'fictional outdoor'}:{sessionId:id,week,exercise:'Bench',weight:amount,reps:5,rpe:7,notes:'fictional set'});
 return d;
}
function capture(name,main,{durable=false,other={},error=null,latest=null}={}) {
 const local=values(JSON.stringify(main));Object.assign(local,other);
 const actual=Object.fromEntries(Object.entries(local).filter(([,v])=>v!==null));
 const top=latest||actual;
 const raw=JSON.stringify(durable?{format:'lhrf-durable-recovery-v1',local:actual,durable:{revision:3,snapshots:[{values:top,digest:sha(JSON.stringify(top))}],recoveries:[{local:{[MAIN]:JSON.stringify(base())},digest:sha(JSON.stringify({[MAIN]:JSON.stringify(base())}))}]},error}:{format:'lhrf-raw-capture-v1',values:local},null,2)+'\n';
 const file=path.join(directory,name+'.json');fs.writeFileSync(file,raw);
 const receipt=qa.receipt(raw,{writer:name,origin:'https://fictional-legacy.invalid',build:'fictional-legacy-v1.40.6',capturedAt:'2026-11-21T13:00:00.000Z',recoveryPackage:durable?'85d267c334e6ec7b5f6fac49747bd60316d7a0f9':null});
 fs.writeFileSync(path.join(directory,name+'.receipt.json'),JSON.stringify(receipt,null,2)+'\n');
 return {file,receipt};
}
function retained(entries) {for(const x of entries)assert.equal(sha(fs.readFileSync(x.file)),x.receipt.sha256);}
function report(name,entries,result) {retained(entries);reports.push({case:name,synthetic:true,captures:entries.map(x=>({file:path.basename(x.file),receipt:path.basename(x.file).replace(/\.json$/,'.receipt.json'),sha256:x.receipt.sha256})),...result});}
function merged(...edits) {const d=base();for(const edit of edits)for(const k of ['completedWorkouts','sets','runs'])d[k].push(...edit[k].slice(base()[k].length));return JSON.stringify(d);}

test('historical #204 fixture: mixed captures reconcile once and restore once',async()=>{
 const a=historyEdit('same-strength',1,'strength',100),b=historyEdit('same-strength',2,'strength',105),c=historyEdit('run',2,'run',5);
 const entries=[capture('writer-A',a,{durable:true}),capture('writer-B',b),capture('writer-C',a),capture('writer-D',c,{durable:true})];
 const reviewedRaw=merged(a,b,c),plan=qa.prepare({baseline:baseline(),captures:entries,roster:roster(entries.map(x=>x.receipt.writer)),reviewedRaw});
 const disk=storage(plan.frozenValues),before=disk.entries();
 assert.equal(await adapter.stage(disk,disk.locks),'staged');assert.equal(await adapter.commit(disk,disk.locks),'imported');
 const reloaded=storage(disk.entries());assert.equal(await adapter.commit(reloaded,reloaded.locks),'already-initialised');
 const archive=reloaded.getItem(adapter.STORE);assert.equal(archive,reviewedRaw);
 assert.equal(JSON.parse(archive).completedWorkouts.length,4);assert.deepEqual(JSON.parse(archive).programme,base().programme);assert.deepEqual(JSON.parse(archive).unknownFuture,base().unknownFuture);
 const clean=storage(),results=await Promise.allSettled([adapter.restoreArchive(clean,archive,sha(archive),clean.locks),adapter.restoreArchive(clean,archive,sha(archive),clean.locks)]);
 assert.equal(results.filter(x=>x.status==='fulfilled').length,1);assert.equal(clean.getItem(adapter.STORE),archive);assert.equal(clean.getItem(MAIN),null);
 // Simulated late legacy write: the QA destination has a disjoint key. This is not the hosted/new app's storage adapter.
 reloaded.setItem(MAIN,qa.readCapture(entries[1]).values[MAIN]);assert.equal(reloaded.getItem(adapter.STORE),archive);
 assert.throws(()=>qa.verifyFrozen(reloaded,plan),/changed after review/);
 await assert.rejects(qa.commit(reloaded,reloaded.locks,plan),/No import/);
 for(const [k,v] of Object.entries(before))assert.equal(disk.getItem(k),v);
 fs.writeFileSync(path.join(directory,'reconciled-history.json'),archive);
 report('mixed-capture-reconcile-import-reload-restore',entries,{result:'pass',historySha256:sha(archive),occurrences:plan.occurrences,counts:plan.counts,successfulMainHistoryRestores:1,ancillaryKeysRetainedInCaptureFiles:true,ancillaryProfileRestore:false,repeatedImport:'already-initialised',lateLegacyDestinationUnchanged:true});
});

test('unresolved local/durable conflict is retained and never becomes a migration plan',()=>{
 const local=historyEdit('disputed',1,'strength',105),durable=values(JSON.stringify(historyEdit('disputed',1,'strength',100)));
 const entry=capture('unresolved-sidecar',local,{durable:true,latest:Object.fromEntries(Object.entries(durable).filter(([,v])=>v!==null)),error:'Local variant differs'});
 assert.throws(()=>qa.prepare({baseline:baseline(),captures:[entry],roster:roster(['unresolved-sidecar']),reviewedRaw:JSON.stringify(local)}),/Unresolved local\/durable/);
 const raw=fs.readFileSync(entry.file,'utf8'),recovery=JSON.parse(raw);assert.notEqual(recovery.local[MAIN],recovery.durable.snapshots[0].values[MAIN]);
 fs.copyFileSync(entry.file,path.join(directory,'unresolved-sidecar-retained-copy.json'));assert.equal(fs.readFileSync(path.join(directory,'unresolved-sidecar-retained-copy.json'),'utf8'),raw);
 report('unresolved-sidecar-export', [entry],{result:'safe-refusal',bothVariantsRetained:true,destinationCreated:false});
});

test('unfinished companions and unrelated main/settings edits require review instead of silent migration',()=>{
 const entries=[];
 for(const k of qa.companions) {const e=capture('unfinished-'+entries.length,historyEdit('draft',1,'strength',100),{durable:true,other:{[k]:'{"unfinished":true}'}});entries.push(e);assert.throws(()=>qa.readCapture(e),/Unresolved offline/);}
 const d=historyEdit('setting-change',1,'run',5);d.settings.days=['Sunday'];const e=capture('settings-variant',d);entries.push(e);
 assert.throws(()=>qa.prepare({baseline:baseline(),captures:[e],roster:roster(['settings-variant']),reviewedRaw:JSON.stringify(d)}),/settings or check-in change/);
 report('unfinished-and-settings-variants',entries,{result:'safe-refusal',sourceUnchanged:true,destinationCreated:false});
});

test('identical completion rows with conflicting sets retain both captured variants',async()=>{
 const entries=[capture('conflict-100',historyEdit('shared',1,'strength',100)),capture('conflict-105',historyEdit('shared',1,'strength',105))];
 assert.throws(()=>qa.prepare({baseline:baseline(),captures:entries,roster:roster(entries.map(x=>x.receipt.writer)),reviewedRaw:JSON.stringify(historyEdit('shared',1,'strength',105))}),/Disputed occurrence/);
 const restored=[];
 for(const e of entries) {const c=qa.readCapture(e),disk=storage();await adapter.restoreArchive(disk,c.values[MAIN],sha(c.values[MAIN]),disk.locks);assert.equal(disk.getItem(adapter.STORE),c.values[MAIN]);restored.push(sha(disk.getItem(adapter.STORE)));}
 assert.notEqual(...restored);
 report('conflicting-capture-separate-restore',entries,{result:'safe-refusal',separateRestoreMainDigests:restored,combinedImport:false});
});

test('review diagnostics retain ancillary-change refusal and import remains closed',async()=>{
 const edit=historyEdit('freeze',1,'run',5),e=capture('freeze-writer',edit),raw=JSON.stringify(edit),plan=qa.prepare({baseline:baseline(),captures:[e],roster:roster(['freeze-writer']),reviewedRaw:raw});
 const old=storage(plan.frozenValues);await adapter.stage(old,old.locks);old.setItem('lhrf_fixture_settings','{"late":true}');assert.equal(await adapter.commit(old,old.locks),'imported');
 for(const mutation of [d=>d.setItem('lhrf_fixture_settings','{"late":true}'),d=>d.setItem('lhrf_new_legacy_setting','late'),d=>d.removeItem('lhrf_fixture_settings')]) {
  const disk=storage(plan.frozenValues);await adapter.stage(disk,disk.locks);mutation(disk);const before=disk.entries();assert.throws(()=>qa.verifyFrozen(disk,plan),/changed after review/);await assert.rejects(qa.commit(disk,disk.locks,plan),/No import/);assert.equal(disk.getItem(adapter.STORE),null);assert.deepEqual(disk.entries(),before);
 }
 const queued=storage(plan.frozenValues);let release;const locked={request:(_n,_o,action)=>new Promise((resolve,reject)=>{release=()=>{try{resolve(action())}catch(error){reject(error)}}})};
 const attempt=locked.request('beta-v1:cutover',{mode:'exclusive'},()=>qa.verifyFrozen(queued,plan));queued.setItem('lhrf_fixture_settings','{"queuedLate":true}');release();await assert.rejects(attempt,/changed after review/); // validate after acquiring the queued lock, before any write
 assert.equal(queued.getItem(adapter.STAGE),null);
 report('ancillary-freeze-gap', [e],{result:'pass',historicalAdapterPermittedAncillaryChange:true,reviewGateRefusedChangedAddedRemovedKeys:true,queuedChangeRefused:true,legacyWriterFenced:false});
});

test('durable checksum and receipt metadata corruption remain retained and block the dry run',()=>{
 const e=capture('checksum-sidecar',historyEdit('digest',1,'strength',100),{durable:true});
 const original=fs.readFileSync(e.file,'utf8');const parsed=JSON.parse(original);parsed.durable.snapshots[0].digest='0'.repeat(64);
 const corruptFile=path.join(directory,'corrupt-sidecar.json'),corrupt=JSON.stringify(parsed);fs.writeFileSync(corruptFile,corrupt);
 const corruptEntry={file:corruptFile,receipt:qa.receipt(corrupt,{...e.receipt,writer:'corrupt'})};assert.throws(()=>qa.readCapture(corruptEntry),/Durable snapshot checksum/);
 assert.throws(()=>qa.readCapture({file:e.file,receipt:{...e.receipt,counts:{sets:999}}}),/Receipt detail mismatch/);
 const plan=qa.prepare({baseline:baseline(),captures:[e],roster:roster(['checksum-sidecar']),reviewedRaw:JSON.stringify(historyEdit('digest',1,'strength',100))});
 fs.writeFileSync(e.file,original+' ');const disk=storage(plan.frozenValues);assert.throws(()=>qa.verifyFrozen(disk,plan),/Capture checksum mismatch/);assert.equal(disk.getItem(adapter.STAGE),null);fs.writeFileSync(e.file,original);
 report('sidecar-and-receipt-integrity',[e],{result:'safe-refusal',corruptArchiveRetained:true,postReviewCaptureChangeRefused:true,destinationCreated:false});
});

after(()=>{
 const implementation=['scripts/recovery-migration-review.cjs','tests/fixtures/beta-cutover-96c9c6a0.cjs','src/durable-checkpoint.js','tests/recovery-migration.test.cjs'];
 const packet={format:'lhrf-synthetic-recovery-migration-evidence-v1',syntheticOnly:true,nodeVersion:process.version,baseRevision:execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),
  approvedRecoveryPackage:'85d267c334e6ec7b5f6fac49747bd60316d7a0f9',approvedArtifact:14702265911,approvedZipSha256:'b651d4e29c96c37312bf36f10d0b2c8f98cf7394fc1312d31a02ad6b0adc9465',
  implementationSha256:Object.fromEntries(implementation.map(p=>[p,sha(fs.readFileSync(path.join(__dirname,'..',p)))])),reports,
  limits:['Node storage-model dry run, not browser or physical acceptance','QA-only #204 adapter is not wired into #209 or either hosted copy','Real legacy writer census/freeze is not enforceable from the new client','Unresolved edits and absent receipts remain migration/recruitment blockers','Qualified human coaching and new build/release approvals remain reserved']};
 if(output)fs.writeFileSync(path.join(directory,'evidence.json'),JSON.stringify(packet,null,2)+'\n');else fs.rmSync(directory,{recursive:true,force:true});
 console.log('RECOVERY MIGRATION EVIDENCE',JSON.stringify({cases:reports.length,implementationSha256:packet.implementationSha256,syntheticOnly:true}));
});
