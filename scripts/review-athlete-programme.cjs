// Private read-only review. Never writes a backup, approved config, store or log.
// node scripts/review-athlete-programme.cjs BACKUP OPTIONS_JSON OUTPUT_DIRECTORY
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),crypto=require('node:crypto'),cp=require('node:child_process');
const adapters=require('../src/coach-adapters.js');
const copy=x=>JSON.parse(JSON.stringify(x)),hash=b=>crypto.createHash('sha256').update(b).digest('hex');
function review(backupPath,optionsPath,destination){
 const bytes=fs.readFileSync(backupPath),source=JSON.parse(bytes),options=JSON.parse(fs.readFileSync(optionsPath)),data=copy(source),dir=path.resolve(destination);
 assert.ok(source.customRoadmap&&Array.isArray(source.sets)&&Array.isArray(source.runs));
 const confirmations=[];
 for(const f of options.confirmedPerformances||[]){const row=data.sets.find(r=>r.exercise===f.exercise&&r.date.slice(0,10)===f.date&&r.weight===f.weight&&r.reps===f.reps);assert.ok(row,'Confirmation must match an existing observed performance');if(f.execution==='competition-paused'){row.execution=f.execution;row.competition=true;confirmations.push(f)}}
 const now=()=>Date.parse(options.asOf||source._backup?.exportedAt),snapshot=JSON.stringify(data),config={...copy(source.customRoadmap),coachingRulesVersion:2,runningGuidanceVersion:4,startDate:options.startDate,weeks:options.weeks,runningPersonalBestSeconds:options.personalBestSeconds};
 assert.ok(Number.isFinite(now()),'Supply a valid review asOf timestamp; no clock is invented');
 if(options.visitConstraints)config.visitConstraints=copy(options.visitConstraints);
 else if(!config.visitConstraints)config.visitConstraints={strengthVisits:new Set((config.fixedSessions||[]).filter(s=>s.kind==='strength').map(s=>s.day)).size,minutes:Object.fromEntries(config.availableDays.map(d=>[d,null])),combinedDays:copy(config.doubleDays||[]),eventDays:Object.fromEntries([config.strengthTargetDate,config.runningTargetDate].filter(Boolean).map(date=>[date,{confirmed:true}]))};
 const marathon=data.runs.filter(r=>r.km>=40&&Date.parse(r.date)<=now()).sort((a,b)=>a.date.localeCompare(b.date)).at(-1),long=data.runs.filter(r=>r.km>0&&r.km<40&&r.min>0&&Date.parse(r.date)<=now()).sort((a,b)=>a.date.localeCompare(b.date)).at(-1);
 config.runningHistory={...copy(config.runningHistory||{}),...(marathon?{recentMarathonDate:marathon.date.slice(0,10)}:{}),...(long?{longRun:{km:long.km,minutes:long.min}}:{})};
 const baseline=adapters.buildProgramme(copy(source.customRoadmap),{data:source,now}),programme=adapters.buildNewProgramme(config,{data,now});
 assert.equal(JSON.stringify(data),snapshot);assert.deepEqual(adapters.buildNewProgramme(config,{data,now}),programme);assert.ok(fs.readFileSync(backupPath).equals(bytes));
 fs.mkdirSync(dir,{recursive:true});for(const [file,value]of Object.entries({'native-programme-NOT-ACTIVATED.json':programme,'saved-policy-baseline.json':baseline,'input-and-confirmations.json':{config,confirmations}}))fs.writeFileSync(path.join(dir,file),JSON.stringify(value,null,2)+'\n');
 const sourceRoot=path.join(__dirname,'..'),provenance={baseCommit:cp.execFileSync('git',['rev-parse','HEAD'],{cwd:sourceRoot,encoding:'utf8'}).trim(),sourceSha256:Object.fromEntries(['src/coach-engine.js','src/running-preparation.js','scripts/review-athlete-programme.cjs'].map(f=>[f,hash(fs.readFileSync(path.join(sourceRoot,f)))])),backupSha256:hash(bytes),native:true,postGenerationPrescriptionEdits:false,sourceBackupUnchanged:true,generationInputUnchanged:true,deterministic:true,confirmationEnrichmentOnly:confirmations,readinessInvented:false,availabilityInvented:false,activated:false};
 fs.writeFileSync(path.join(dir,'provenance.json'),JSON.stringify(provenance,null,2)+'\n');return programme;
}
if(require.main===module){if(process.argv.length!==5)throw Error('Provide BACKUP OPTIONS_JSON OUTPUT_DIRECTORY (keep real data outside the repository).');const p=review(...process.argv.slice(2));console.log(JSON.stringify({weeks:p.weeks.length,calibration:p.config.strengthCalibration,runningReturn:p.config.runningReturnObservation,summary:p.weeks.map(w=>({week:w.week,feasible:w.feasible,blockingIssues:w.blockingIssues,sessions:w.sessions.map(s=>({day:s.day,ex:s.ex,runs:s.runs}))}))},null,2))}
module.exports={review};
