'use strict';
const {test,after}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const qa=require('../scripts/recovery-migration-review.cjs');
const fixture=require('./fixtures/beta-cutover-96c9c6a0.cjs');
const dir=path.join(__dirname,'../docs/qa/recovery-migration-20261121');
const manifest=JSON.parse(fs.readFileSync(path.join(dir,'SHA256.json')));
const sourceDigests=()=>Object.fromEntries(Object.keys(manifest).map(n=>[n,qa.sha(fs.readFileSync(path.join(dir,n)))]));
const before=sourceDigests();const results=[];
function input() {
 const captures=['writer-A','writer-B','writer-C','writer-D'].map(n=>({file:path.join(dir,n+'.json'),receipt:JSON.parse(fs.readFileSync(path.join(dir,n+'.receipt.json')))}));
 const a=JSON.parse(fs.readFileSync(captures[0].file));
 const baseline={...Object.fromEntries(qa.companions.map(k=>[k,null])),...a.local,[qa.MAIN]:a.durable.recoveries[0].local[qa.MAIN]};
 return {baseline,captures,roster:{evidence:'synthetic-harness-complete',frozen:true,origin:'https://fictional-legacy.invalid',build:'fictional-legacy-v1.40.6',writers:captures.map(x=>x.receipt.writer)},reviewedRaw:fs.readFileSync(path.join(dir,'reconciled-history.json'),'utf8')};
}
function storage(plan) {const data=new Map(Object.entries(plan.frozenValues).filter(([,v])=>v!==null));return{get length(){return data.size},key:i=>[...data.keys()][i],getItem:k=>data.get(k)??null,setItem:(k,v)=>data.set(k,String(v)),removeItem:k=>data.delete(k),snapshot:()=>Object.fromEntries(data)};}
const locks={request:(_n,_o,action)=>Promise.resolve().then(action)};
async function refused(operation,disk,plan) {
 const prior=disk.snapshot();let failure;
 try{await qa[operation](disk,locks,plan)}catch(e){failure=e.message}
 assert.ok(failure,'No-import boundary must refuse '+operation);
 assert.deepEqual(disk.snapshot(),prior,'refusal preserves every source/stage/destination byte');
 assert.deepEqual(sourceDigests(),before,'all 34 retained source-copy digests unchanged');
 return failure;
}
test('post-review loss of writer/freeze/capture evidence cannot stage or commit',async()=>{
 for(const operation of ['stage','commit']) {
  const plan=structuredClone(qa.prepare(input())),disk=storage(plan);
  if(operation==='commit')await fixture.stage(disk,locks);
  plan.roster.frozen=false;plan.roster.writers=[];plan.captureEntries=[];
  const failure=await refused(operation,disk,plan);
  results.push({case:'altered-review-'+operation,result:'refused',reason:failure});
 }
});
test('complete review evidence still grants no import authority and no adapter bypass is exported',async()=>{
 assert.equal(qa.adapter,undefined,'raw historical writer must not be a review-module entrypoint');
 const plan=qa.prepare(input()),disk=storage(plan);
 assert.equal(plan.boundary,'no-import');assert.equal(plan.reviewOnly,true);
 for(const operation of ['stage','commit']){const failure=await refused(operation,disk,plan);assert.match(failure,/No import/);}
 assert.equal(disk.getItem(fixture.STAGE),null);assert.equal(disk.getItem(fixture.STORE),null);
 results.push({case:'valid-plan-no-authority',result:'refused',sourceUnchanged:true});
});
test('a serialised review or claimed complete freeze cannot enable import through the supported entrypoints',async()=>{
 const plan=qa.prepare(input());assert.ok(Object.isFrozen(plan)&&Object.isFrozen(plan.roster)&&Object.isFrozen(plan.captureEntries));
 assert.throws(()=>{plan.roster.frozen=false},TypeError);
 const forged=JSON.parse(JSON.stringify(plan));forged.boundary='import-approved';forged.reviewOnly=false;forged.roster.freezeProof='claim-only';
 const disk=storage(plan);for(const operation of ['stage','commit'])await refused(operation,disk,forged);
 results.push({case:'serialised-claimed-approval',result:'refused',sourceUnchanged:true});
});
after(()=>{assert.deepEqual(sourceDigests(),before);assert.deepEqual(before,manifest);console.log('NO_IMPORT_RESULTS',JSON.stringify({cases:results,allRetainedFiles:34,sourceCopiesUnchanged:true,scope:'local synthetic; not a deployed policy or legacy freeze'}));});
