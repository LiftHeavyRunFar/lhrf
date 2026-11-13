// Independent adversarial checks for the unwired native adapter, not a UI test.
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('fs'),vm=require('vm'),path=require('path');
const file=path.join(__dirname,'fatigue-native-adapter.test.cjs'),source=fs.readFileSync(file,'utf8').split("test('applies scoped")[0];
const {fixture}=vm.runInNewContext(source+';({fixture})',{require:require('module').createRequire(file),structuredClone,console});
const adapter=require('../src/fatigue-native-adapter');
function resolve(f){const values={main:JSON.stringify(f.native),overlay:JSON.stringify(f.approvedOverlay)};const storage={getItem:k=>values[k]??null};return adapter.resolve({native:f.native,session:f.session,storage,mainKey:'main',overlayKey:'overlay',now:f.now,eventContext:f.eventContext});}
test('malformed or tampered consent and source sessions return the exact original',()=>{
 for(const modify of [f=>{f.approvedOverlay.approved=false},f=>{f.approvedOverlay.changes[0].adjusted.groups[0].sets=99},f=>{f.approvedOverlay.changes.push(structuredClone(f.approvedOverlay.changes[0]))},f=>{delete f.native.customRoadmap.cataloguePlans},f=>{f.native.reviewedProgramme.weeks[0].sessions.push(structuredClone(f.session))},f=>{f.eventContext.eventFreeAttestation.noOtherEventOrTaper=false}]){
  const f=fixture();modify(f);const before=structuredClone(f.session);const out=resolve(f);assert.equal(out.adjusted,false);assert.deepEqual(out.session,before);
 }
});
test('native adapter returns a detached adjusted session and audit without mutating records',()=>{
 const f=fixture(),before=JSON.stringify(f),out=resolve(f);assert.equal(out.adjusted,true);out.session.ex[0][1]=999;out.audit.original.ex[0][1]=777;assert.equal(JSON.stringify(f),before);
});
