// Reproducible baseline safeguards; these do not claim an intervention exists.
const {test}=require('node:test'),assert=require('node:assert/strict');
const catalogue=require('../src/programme-catalogue'),training=require('../src/catalogue-training');
const native=require('../src/native-catalogue'),registry=require('../src/exercise-registry'),gym=require('../src/gym-equipment');
const evidence=require('../src/fatigue-evidence'),garmin=require('../src/garmin-import'),backup=require('../src/training-backup'),intervals=require('../src/intervals-sync');
const activity={source:'garmin-personal',sourceActivityId:'675',date:'2026-11-10T10:00:00Z',name:'A run',km:6,min:40,avgHr:140,splits:[]};
function state(){
 const p=training.enrol(training.empty(),catalogue.previewProgramme('10k-two-run'),'2026-11-09','run').plans;
 const programme=native.buildProgramme(p,null,{training,registry,gym,inventory:{items:{}},now:'2026-11-09T09:00:00Z',equipment:[],protectedWeek:()=>false});
 return {customRoadmap:programme.config,reviewedProgramme:{id:programme.config.programmeId,config:programme.config,weeks:programme.weeks},activeCustomWeek:1,activeSchedule:programme.weeks[0].sessions,completedWorkouts:[],runs:[],sets:[],checkins:[]};
}
test('adding optional fatigue evidence does not alter generated native Garmin targets or imported records',()=>{
 const before=state(),target=garmin.plannedSessions(before,activity)[0];assert.ok(target);
 const input={discipline:'running',sessionId:target.id,recordedAt:'2026-11-10T11:00:00Z',interruptionReason:'fatigue'};
 const after=evidence.append(before,input);assert.deepEqual(garmin.plannedSessions(after,activity),garmin.plannedSessions(before,activity));
 const imported=garmin.mergeRuns(after,[{run:activity,action:'new',plannedKey:target.key}]).state;
 assert.equal(imported.runs.length,1);assert.equal(imported.runs[0].sourceActivityId,'675');assert.deepEqual(imported.completedWorkouts[0].prescription,target.prescription);
 assert.deepEqual(imported.customRoadmap,before.customRoadmap);assert.deepEqual(imported.reviewedProgramme,before.reviewedProgramme);assert.deepEqual(imported.activeSchedule,before.activeSchedule);
 assert.equal(imported.fatigueEvidence[0].interruptionReason,'fatigue');assert.deepEqual(before.runs,[]);
});
test('export retains evidence, unchanged snapshots and existing live draft without credentials',()=>{
 const before=state(),session=before.activeSchedule[0];const old=structuredClone(before);
 const withEvidence=evidence.append(before,{discipline:'running',sessionId:session.id,recordedAt:'2026-11-10T11:00:00Z',interruptionReason:'fatigue'});
 const draft={id:session.id,ex:[],runs:structuredClone(session.runs),entries:{},notes:'ongoing'};
 const storage={getItem:key=>key==='lhrf_fresh_beta_live_v1114'?JSON.stringify(draft):null};
 const exported=backup.create(withEvidence,{storage,now:'2026-11-10T12:00:00Z'});
 assert.deepEqual(exported.reviewedProgramme,before.reviewedProgramme);assert.deepEqual(exported.activeSchedule,before.activeSchedule);
 assert.deepEqual(exported._backup.deviceState.lhrf_fresh_beta_live_v1114,draft);assert.deepEqual(exported.fatigueEvidence,withEvidence.fatigueEvidence);
 assert.deepEqual(before,old);
});
test('optional evidence leaves the generated running export and stable external identity unchanged',()=>{
 const before=state(),session=before.activeSchedule.find(s=>s.runs?.length),run=session.runs[0];
 assert.ok(run.steps.length);const exportFor=s=>{
  const original=s.activeSchedule.find(x=>x.id===session.id).runs[0];
  return intervals.workoutEvent({name:original.name,steps:original.steps.map(step=>({name:step.label,role:step.role,distanceKm:step.distanceKm,pace:step.pace||''})),sessionId:session.id+':0',date:session.scheduledDate,scheduledDate:session.scheduledDate});
 };
 const originalEvent=exportFor(before);const after=evidence.append(before,{discipline:'running',sessionId:session.id,recordedAt:'2026-11-10T11:00:00Z',unusualFatigue:'yes'});
 assert.deepEqual(exportFor(after),originalEvent);assert.match(originalEvent.external_id,/^lhrf-run-v1:/);assert.ok(originalEvent.description);
});
