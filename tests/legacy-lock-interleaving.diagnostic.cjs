// Diagnostic: simulated function-level interleaving, not a browser test.
// PASS means that a newer client's lock DID NOT protect synthetic records.
const {test}=require('node:test');
const assert=require('node:assert/strict');
const vm=require('node:vm');
const fs=require('node:fs'),path=require('node:path');

test('old save can overwrite completed workout and Garmin record after reading absent lock',()=>{
 const html=fs.readFileSync(path.join(__dirname,'..','production-v1406','index.html'),'utf8');
 const source=html.match(/^function save\(candidate=data,\{notify=true\}=\{\}\)\{.*$/m)?.[0];
 assert.ok(source,'pinned production writer must be present');
 const old={completedWorkouts:[{id:'earlier'}],garminSync:{activities:[{id:'g-old'}]}};
 const newer={completedWorkouts:[...old.completedWorkouts,{id:'new-finished'}],garminSync:{activities:[...old.garminSync.activities,{id:'g-new'}]}};
 let main=JSON.stringify(old),lock=null,observedLock=false;
 const replacement={LOCK_KEY:'lock'};
 const tab={data:old,lhrfExternalStorageChanged:false,lhrfSaveError:'',LHRF_DATA_KEY:'main',LHRFProgrammeReplacement:replacement,window:{LHRFProgrammeReplacement:replacement},alert(){},LHRFStorage:{local:{
  getItem(key){assert.equal(key,'lock');const previouslyRead=lock;observedLock=true;
   // Model the old client's read returning null, followed by a suspended old
   // client while the new client sets a lock and commits its synthetic data.
   lock='new-client-lock';main=JSON.stringify(newer);return previouslyRead;},
  setItem(key,value){assert.equal(key,'main');main=value;}
 }}};
 vm.runInNewContext(source+';globalThis.productionSave=save;',tab);
 const candidate=structuredClone(old);candidate.completedWorkouts.push({id:'old-finished'});
 assert.equal(tab.productionSave(candidate),true);
 const result=JSON.parse(main);assert.ok(observedLock);assert.equal(lock,'new-client-lock');
 assert.ok(!result.completedWorkouts.some(x=>x.id==='new-finished'));
 assert.ok(!result.garminSync.activities.some(x=>x.id==='g-new'));
});
