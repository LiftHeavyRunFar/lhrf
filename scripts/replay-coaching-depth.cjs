// Repeat the frozen coaching-depth round, retaining actual prescriptions and probes.
const fs=require('node:fs'),path=require('node:path'),cp=require('node:child_process');
const {run}=require('./test-five-scenarios.cjs'),{audit}=require('./audit-coaching-round-three.cjs');
const root=path.join(__dirname,'..'),fixturePath='tests/fixtures/five-scenario-round-three-inputs.json',fixture=require('../'+fixturePath);
const dir=path.resolve(root,process.argv[2]||'docs/qa/coaching-rounds-current/round-three');fs.mkdirSync(dir,{recursive:true});
const capture=run({fixture,fixturePath});for(const row of capture.cases)fs.writeFileSync(path.join(dir,row.id+'.json'),JSON.stringify({...row,provenance:capture.provenance},null,2)+'\n');
const metricsPath=path.join(dir,'prescription-metrics.json');
const probe=cp.spawnSync(process.execPath,[path.join(__dirname,'inspect-coaching-round-three.cjs'),metricsPath],{cwd:root,encoding:'utf8'});
if(probe.status!==0)throw Error(probe.stderr||probe.stdout||'Prescription inspection failed.');
const result=audit(capture.cases,JSON.parse(fs.readFileSync(metricsPath)));fs.writeFileSync(path.join(dir,'coaching-gates.json'),JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify({output:dir,coachingCodeGatesPassed:result.coachingCodeGatesPassed,criteria:result.gates.length,passed:result.gates.filter(g=>g.status==='pass').length,blocked:result.gates.filter(g=>g.status==='blocked'),athleteApproval:false},null,2));process.exitCode=result.coachingCodeGatesPassed?0:1;
