// Independent same-input comparison. No app storage, native installation or activation.
const fs=require('node:fs'),path=require('node:path'),os=require('node:os'),cp=require('node:child_process'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const {FIXED_NOW,BASELINE_COMMIT,makeRuntimeAthletes,clone}=require('../tests/fixtures/runtime-coaching-athletes.cjs');
const ROOT=path.resolve(__dirname,'..'),sum=xs=>xs.reduce((a,b)=>a+b,0),round=n=>Number(n.toFixed(3));
const OWNER_REVIEW_CLOCK='2026-11-08T00:00:00.000Z';
const hash=x=>crypto.createHash('sha256').update(x).digest('hex');
let oldModules;
function legacyEngine(){
 if(oldModules)return oldModules;
 const directory=fs.mkdtempSync(path.join(os.tmpdir(),'lhrf-production-comparison-'));
 const archive=cp.execFileSync('git',['archive',BASELINE_COMMIT,'src'],{cwd:ROOT,maxBuffer:32*1024*1024});
 cp.execFileSync('tar',['-xf','-','-C',directory],{input:archive});
 const sourceSha256=Object.fromEntries(fs.readdirSync(path.join(directory,'src')).filter(f=>f.endsWith('.js')).map(f=>['src/'+f,hash(fs.readFileSync(path.join(directory,'src',f)))]));
 oldModules={commit:BASELINE_COMMIT,root:directory,coach:require(path.join(directory,'src/coach-engine.js')),adapters:require(path.join(directory,'src/coach-adapters.js')),sourceSha256};
 return oldModules;
}
function currentEngine(){return {coach:require('../src/coach-engine.js'),adapters:require('../src/coach-adapters.js')}}
function summarizeProgramme(programme){
 const weeks=programme.weeks.map(w=>{
  const exercises=w.sessions.flatMap(s=>(s.ex||[]).map(e=>({sessionId:s.id,day:s.day,exercise:e[0],sets:e[1],reps:e[2],kg:e[3],rpe:e[4],metadata:e[5]||{}}))),main=exercises.filter(e=>e.metadata.category==='primary');
  const runs=w.sessions.flatMap(s=>(s.runs||[]).map(r=>({sessionId:s.id,day:s.day,...clone(r)}))),trainingRuns=runs.filter(r=>r.role!=='race'),work=trainingRuns.flatMap(r=>r.steps||[]).filter(s=>s.role==='work');
  return {week:w.week,phase:w.phase,deload:w.deload,feasible:w.feasible,reviewRequired:w.reviewRequired,warnings:clone(w.warnings||[]),blockingIssues:clone(w.blockingIssues||[]),unscheduled:clone(w.unscheduled||[]),allStrengthSets:sum(exercises.map(e=>e.sets)),mainStrengthSets:sum(main.map(e=>e.sets)),supportStrengthSets:sum(exercises.filter(e=>e.metadata.category!=='primary').map(e=>e.sets)),mainReps:sum(main.map(e=>e.sets*e.reps)),mainRpe7PlusSets:sum(main.filter(e=>e.rpe>=7).map(e=>e.sets)),mainSingles:sum(main.filter(e=>e.reps===1).map(e=>e.sets)),mainSpeedSets:sum(main.filter(e=>e.metadata.trainingRole==='speed').map(e=>e.sets)),main,trainingKm:round(sum(trainingRuns.map(r=>Number(r.distanceKm)||0))),raceKm:round(sum(runs.filter(r=>r.role==='race').map(r=>Number(r.distanceKm)||0))),workKm:round(sum(work.map(s=>Number(s.distanceKm)||0))),runDays:trainingRuns.length,runningSummary:clone(w.runningSummary||null),runs,events:w.sessions.filter(s=>s.eventDate).map(s=>({id:s.id,date:s.eventDate,type:s.eventType,day:s.day})),sessions:w.sessions.map(s=>({id:s.id,day:s.day,name:s.name,phase:s.phase,minutes:s.estimatedMinutes||s.durationRangeMinutes||null,recoveryReviewRequired:!!s.recoveryReviewRequired,notes:s.hybridNotes||s.coachNote||s.note||null,timeAdaptation:s.timeAdaptation||null}))};
 });
 return {schema:programme.schema,requiresAthleteApproval:programme.requiresAthleteApproval,config:clone(programme.config),framework:clone(programme.framework),limitations:clone(programme.limitations),weeks};
}
function generate(modules,athlete,clock=FIXED_NOW){
 const config=clone(athlete.config),data=clone(athlete.data),reviews=athlete.performanceReviews===undefined?undefined:clone(athlete.performanceReviews),before=JSON.stringify({config,data,reviews});
 const options={data,now:()=>Date.parse(clock),...(reviews===undefined?{}:{performanceReviews:reviews})};
 const programme=modules.adapters.buildNewProgramme(config,options);
 assert.equal(JSON.stringify({config,data,reviews}),before,'Generation changed raw athlete inputs: '+athlete.id);
 // Full equality is checked once per build, not with hand-selected field assertions.
 assert.deepEqual(modules.adapters.buildNewProgramme(config,options),programme,'Nondeterministic generation: '+athlete.id);
 return programme;
}
function compareAthlete(athlete,options={}){
 const input=clone(athlete),inputBytes=JSON.stringify(input),old=generate(options.old||legacyEngine(),input),revised=generate(options.current||currentEngine(),input);
 assert.equal(JSON.stringify(input),inputBytes,'Comparison changed its fixture');
 return {id:input.id,description:input.description,expectations:input.expectations,limitations:input.limitations,recoveryScenario:input.recoveryScenario||null,attributedBefore:input.attributedBefore||null,inputSha256:hash(inputBytes),identicalRawInputs:true,inputUnchanged:true,deterministic:true,oldOutputSha256:hash(JSON.stringify(old)),revisedOutputSha256:hash(JSON.stringify(revised)),old:summarizeProgramme(old),revised:summarizeProgramme(revised),...(options.full?{input,oldProgramme:old,revisedProgramme:revised}:{})};
}
function recoveryTemporalComparison({old=legacyEngine(),current=currentEngine()}={}){
 const source=makeRuntimeAthletes().find(row=>row.id==='marathon-general-uncertain'),rows=[];
 for(const [id,clock,positive,coarse]of [['same-evidence-day6',FIXED_NOW,false,false],['same-evidence-day22','2026-11-23T12:00:00Z',false,false],['completed-return-week','2026-11-23T12:00:00Z',true,false],['completed-return-week-current-normal','2026-11-23T12:00:00Z',true,true],['canonical-marathon-profile-only',FIXED_NOW,false,false],['canonical-marathon-profile-plus-date',FIXED_NOW,false,false]]){
  const input=clone(source);
  if(id.startsWith('canonical-marathon')){
   input.config.runProfile={...input.config.runProfile,distance:42.195,seconds:14760,resultDate:'2026-11-01',effort:'performance'};
   if(id.endsWith('profile-only'))delete input.config.runningHistory.recentMarathonDate;
  }
  if(positive){
   input.data.runs=[['2026-11-16',9,'easy-run',3],['2026-11-18T07:00:00Z',9,'quality-run',7],['2026-11-20',10,'long-run',3]].map(([date,km,type,rpe])=>({date,km,min:km*6,type,rpe,completed:true,sourceActivityId:'synthetic-temporal-'+date.slice(0,10)}));
   input.config.recoveryObservations=[['easy','2026-11-17','2026-11-16'],['quality','2026-11-19','2026-11-18'],['long','2026-11-21','2026-11-20']].map(([task,observedAt,referencePerformanceDate])=>({sport:'running',task,status:'normal',nextDayResponse:'normal',observedAt,referencePerformanceDate,eventDate:'2026-11-01'}));
  }
  if(coarse)input.config.recoveryContext={status:'normal',reportedAt:'2026-11-23'};
  const before=JSON.stringify(input),summarize=modules=>{
   const programme=modules.adapters.buildNewProgramme(clone(input.config),{data:clone(input.data),now:()=>Date.parse(clock)}),week=programme.weeks[2],runs=week.sessions.flatMap(s=>s.runs||[]);
   return {week:3,trainingKm:week.runningSummary.trainingKm,workKm:round(sum(runs.flatMap(r=>r.steps||[]).filter(s=>s.role==='work').map(s=>Number(s.distanceKm)||0))),observedPreviousWeekKm:programme.config.runningDoseEvidence?.latestCompletedCalendarWeek?.observedKm??null,runs:runs.map(r=>({role:r.role,km:r.distanceKm,workMinutes:r.workMinutes,status:r.coachingRationale?.recovery?.status||null,canProgress:r.coachingRationale?.recovery?.canProgress??null})),lower:week.sessions.flatMap(s=>s.ex||[]).filter(e=>/squat|deadlift/i.test(e[0])&&e[5]?.category==='primary').map(e=>({exercise:e[0],sets:e[1],reps:e[2],kg:e[3],rpe:e[4],status:e[5]?.recoveryState?.status||null,canProgress:e[5]?.recoveryState?.canProgress??null,restriction:e[5]?.recoveryState?.restriction||null})),warnings:week.warnings};
  };
  const entry={id,clock,baseCaseId:input.id,inputSha256:hash(before),...(id.startsWith('canonical-marathon')?{syntheticPerformanceProfile:input.config.runProfile,explicitMarathonDate:input.config.runningHistory.recentMarathonDate||null}:{}),additionalSyntheticCompletedRuns:positive?input.data.runs:[],additionalObservations:positive?input.config.recoveryObservations:[],coarseCurrentNormal:coarse,old:summarize(old),revised:summarize(current)};
  assert.equal(JSON.stringify(input),before);rows.push(entry);
 }
 return rows;
}
function runComparison(options={}){
 const fixtures=options.athletes||makeRuntimeAthletes(),old=legacyEngine();
 const sourceFiles=fs.readdirSync(path.join(ROOT,'src')).filter(f=>f.endsWith('.js')).map(f=>'src/'+f);
 const sourceSha256=Object.fromEntries(sourceFiles.map(f=>[f,hash(fs.readFileSync(path.join(ROOT,f)))]));
 const current=currentEngine();
 const cases=fixtures.map(athlete=>compareAthlete(athlete,{old,current,full:options.full}));
 const temporalChecks=recoveryTemporalComparison({old,current});
 assert.ok(cases.every(row=>Number(row.revised.config.coachingRuntimeVersion)===1),'The default new-proposal boundary has not selected runtime policy1; do not publish an inactive-policy comparison.');
 assert.deepEqual(Object.fromEntries(sourceFiles.map(f=>[f,hash(fs.readFileSync(path.join(ROOT,f)))])),sourceSha256,'Runtime source changed during the comparison; capture again after the source is frozen.');
 return {schema:'lhrf-runtime-coaching-comparison-1',clock:FIXED_NOW,productionBaseline:BASELINE_COMMIT,revisedCommit:cp.execFileSync('git',['rev-parse','HEAD'],{cwd:ROOT,encoding:'utf8'}).trim(),sourceHasUncommittedChanges:!!cp.execFileSync('git',['status','--porcelain','--','src'],{cwd:ROOT,encoding:'utf8'}).trim(),syntheticAndSanitizedComparisonOnly:true,ownerSnapshotAvailable:false,noActivation:true,sourceUnchangedDuringComparison:true,preOutputCriteria:JSON.parse(fs.readFileSync(path.join(ROOT,'docs/runtime-coaching-corrections/pre-output-criteria.json'),'utf8')),currentFixtureSha256:hash(fs.readFileSync(path.join(ROOT,'tests/fixtures/runtime-coaching-athletes.cjs'))),oldSourceSha256:old.sourceSha256,revisedSourceSha256:sourceSha256,entry:'Identical raw config/data/performanceReviews -> buildNewProgramme -> canonical generated sessions; no storage',temporalChecks,cases};
}
// Keep the reviewable repository artifact compact. Full native blocks remain an
// explicitly requested reproducible CI/local artifact, not duplicated snapshots.
function compactComparison(evidence){
 const strings=[],indices=new Map(),ref=value=>{if(value==null||value==='')return null;const text=String(value);if(!indices.has(text)){indices.set(text,strings.length);strings.push(text)}return indices.get(text)};
 const mainDoseTemplates=[],runningDoseTemplates=[],mainIndices=new Map(),runIndices=new Map();
 const template=(rows,table,index)=>{const key=JSON.stringify(rows);if(!index.has(key)){index.set(key,table.length);table.push(rows)}return index.get(key)};
 const programme=p=>{
  const mainDoseChanges=[],runningDoseChanges=[];let previousMain=null,previousRuns=null;
  for(const w of p.weeks){
   const main=w.main.map(e=>{const m=e.metadata,a=m.runtimePracticeAnchor||m.practiceAnchor||m.loadAnchor||m.coachingRationale?.practiceAnchor;return [ref(e.day),ref(e.exercise),e.sets,e.reps,e.kg,e.rpe,ref(m.role),ref(m.trainingRole||m.benchRole),ref(m.policy),a?.suggestedKg??a?.kg??a?.weight??null,ref(m.recoveryDecision?.restriction||m.coachingRationale?.recovery?.restriction),ref(m.coachingRationale?.reason||m.loadRationale||m.calibrationReason)]});
   const runs=w.runs.map(r=>[ref(r.day),ref(r.role),ref(r.name),r.distanceKm,r.minutes,ref(r.pace),round(sum((r.steps||[]).filter(s=>s.role==='work').map(s=>Number(s.distanceKm)||0)))]);
   if(JSON.stringify(main)!==previousMain){mainDoseChanges.push([w.week,template(main,mainDoseTemplates,mainIndices)]);previousMain=JSON.stringify(main)}
   if(JSON.stringify(runs)!==previousRuns){runningDoseChanges.push([w.week,template(runs,runningDoseTemplates,runIndices)]);previousRuns=JSON.stringify(runs)}
  }
  return {runtimeVersion:p.config.coachingRuntimeVersion||0,baselines:p.config.baselines||{},strengthCalibration:Object.fromEntries(Object.entries(p.config.strengthCalibration?.lifts||{}).map(([lift,x])=>[lift,{source:x.sourceBaseline,adopted:x.adoptedBaseline,level:x.trainingLevel||null,evidenceDays:[...new Set((x.evidence||[]).map(r=>r.date.slice(0,10)))],singlesSupported:x.singlesSupported??null,competitionTechniqueConfirmed:x.competitionTechniqueConfirmed??null}])),mainDoseChanges,runningDoseChanges,weeks:p.weeks.map(w=>[w.week,ref(w.phase),w.deload,w.feasible,w.allStrengthSets,w.mainStrengthSets,w.mainRpe7PlusSets,w.mainSingles,w.mainSpeedSets,w.trainingKm,w.workKm,w.raceKm,w.runDays,w.warnings.map(ref),w.blockingIssues.map(ref)]),events:p.weeks.flatMap(w=>w.events.map(e=>({week:w.week,...e})))};
 };
 const result={...evidence,schema:'lhrf-runtime-coaching-compact-comparison-1',legend:{stringReference:'Integer string references index strings[]; null means absent.',mainDoseRow:['dayRef','exerciseRef','sets','reps','kg (0 means uncalibrated)','RPE ceiling','setRoleRef','trainingPurposeRef','policyRef','anchorKg','recoveryRestrictionRef','rationaleRef'],runDoseRow:['dayRef','roleRef','nameRef','km','minutes','paceRef','workKm'],weekRow:['week','phaseRef','deload','feasible','allStrengthSets','mainSets','mainRpe7PlusSets','mainSingles','mainSpeedSets','trainingKm','workKm','raceKm','runDays','warningRefs','blockingRefs'],doseChanges:'[week, templateIndex] applies until the next recorded change; mainDoseTemplates/runningDoseTemplates contain rows. Every native block is reproducible with --full-out.'},strings,mainDoseTemplates,runningDoseTemplates,cases:evidence.cases.map(c=>({id:c.id,inputSha256:c.inputSha256,oldOutputSha256:c.oldOutputSha256,revisedOutputSha256:c.revisedOutputSha256,identicalRawInputs:c.identicalRawInputs,inputUnchanged:c.inputUnchanged,deterministic:c.deterministic,old:programme(c.old),revised:programme(c.revised)}))};
 return result;
}
function ownerRemainingDiagnostic(expectedSourceSha256){
 const sources=()=>Object.fromEntries(fs.readdirSync(path.join(ROOT,'src')).filter(f=>f.endsWith('.js')).map(f=>['src/'+f,hash(fs.readFileSync(path.join(ROOT,'src',f)))]));
 const sourceSha256=sources();if(expectedSourceSha256)assert.deepEqual(sourceSha256,expectedSourceSha256,'Source changed after the general comparison; do not create an owner diagnostic from a different revision.');
 const athlete=makeRuntimeAthletes().find(row=>row.id==='owner-limited-diagnostic');
 athlete.config.startDate='2026-11-08';athlete.config.weeks=4;
 const programme=generate(currentEngine(),athlete,OWNER_REVIEW_CLOCK),summary=summarizeProgramme(programme);
 assert.deepEqual(sources(),sourceSha256,'Source changed during owner diagnostic generation.');
 return {schema:'lhrf-owner-limited-native-diagnostic-1',status:'non-installable-review-artifact',clock:OWNER_REVIEW_CLOCK,source:'Limited sanitized #132 summary; surrounding config is explicitly diagnostic.',sourceSha256,inputSha256:hash(JSON.stringify(athlete)),sourceBackupAvailable:false,sourceProgrammeDigest:null,replacementReady:false,athleteApprovalRecorded:false,activated:false,input:athlete,nativeProposal:programme,nativeProposalSha256:hash(JSON.stringify(programme)),blockers:['Complete source-bound saved/native owner calendar and identity are missing.','Current recovery, exact setup/execution and recent heavy bench are not established.','Actual running volume/performance/recovery were not supplied; no training runs are invented.','Any zero-load/unconfirmed/blocked work remains unresolved; manual candidate kilograms are not automatic replacements.'],summary};
}
if(require.main===module){
 const argv=process.argv.slice(2),outAt=argv.indexOf('--out'),fullAt=argv.indexOf('--full-out'),ownerAt=argv.indexOf('--owner-out'),out=outAt>=0?path.resolve(argv[outAt+1]):path.join(ROOT,'docs/runtime-coaching-corrections/comparison.json');
 const evidence=runComparison({full:fullAt>=0});
 if(fullAt>=0){const target=path.resolve(argv[fullAt+1]);fs.mkdirSync(path.dirname(target),{recursive:true});fs.writeFileSync(target,JSON.stringify(evidence)+'\n');evidence.fullProgrammeSha256=hash(fs.readFileSync(target));}
 for(const entry of evidence.cases){delete entry.input;delete entry.oldProgramme;delete entry.revisedProgramme;}
 fs.mkdirSync(path.dirname(out),{recursive:true});fs.writeFileSync(out,JSON.stringify(compactComparison(evidence))+'\n');
 if(ownerAt>=0){const {summary,...diagnostic}=ownerRemainingDiagnostic(evidence.revisedSourceSha256),target=path.resolve(argv[ownerAt+1]);fs.mkdirSync(path.dirname(target),{recursive:true});fs.writeFileSync(target,JSON.stringify(diagnostic)+'\n');}
 console.log(JSON.stringify({cases:evidence.cases.length,output:out,productionBaseline:BASELINE_COMMIT,fixtureSha256:evidence.currentFixtureSha256,firstWeeks:evidence.cases.map(c=>({id:c.id,old:{mainSets:c.old.weeks[0].mainStrengthSets,mainReps:c.old.weeks[0].mainReps,km:c.old.weeks[0].trainingKm,workKm:c.old.weeks[0].workKm},revised:{mainSets:c.revised.weeks[0].mainStrengthSets,mainReps:c.revised.weeks[0].mainReps,km:c.revised.weeks[0].trainingKm,workKm:c.revised.weeks[0].workKm}}))},null,2));
}
module.exports={legacyEngine,currentEngine,generate,compareAthlete,summarizeProgramme,runComparison,compactComparison,ownerRemainingDiagnostic,recoveryTemporalComparison,OWNER_REVIEW_CLOCK};
