// Repeat the agreed sequence. Review conditions never become athlete approval.
const fs=require('node:fs'),path=require('node:path');
const {run}=require('./test-five-scenarios.cjs'),{audit}=require('./audit-five-scenarios.cjs');
const root=path.join(__dirname,'..');
const stages=[['frozen-five','tests/fixtures/five-scenario-engine-inputs.json'],['fresh-five','tests/fixtures/five-scenario-round-two-inputs.json'],['original-three','tests/fixtures/original-three-engine-inputs.json']];
function replay(output='docs/qa/coaching-rounds-current'){
 const result={schema:'lhrf-coaching-iteration-v2',synthetic:true,athleteApproval:false,stages:[]};
 for(const [name,fixturePath]of stages){
  const fixture=JSON.parse(fs.readFileSync(path.join(root,fixturePath),'utf8')),capture=run({fixture,fixturePath}),review=audit(capture),dir=path.resolve(root,output,name);
  fs.mkdirSync(dir,{recursive:true});
  for(const row of capture.cases)fs.writeFileSync(path.join(dir,row.id+'.json'),JSON.stringify({...row,provenance:capture.provenance},null,2)+'\n');
  fs.writeFileSync(path.join(dir,'coaching-gates.json'),JSON.stringify(review,null,2)+'\n');
  result.stages.push({name,fixturePath,...review.summary,provenance:capture.provenance,athleteApproval:false});
  if(review.summary.blocked){result.stoppedAfter=name;break}
 }
 result.executionComplete=result.stages.length===stages.length;result.coachingCodeGatesPassed=result.executionComplete&&result.stages.every(s=>s.blocked===0);
 result.conditionalCases=result.stages.reduce((n,s)=>n+s.conditionalReview,0);
 result.note='Code-gate success is distinct from athlete readiness. Conditional event permission, recovery and unconfirmed historical assumptions remain visible. Do not activate any proposal automatically.';
 const dir=path.resolve(root,output);fs.mkdirSync(dir,{recursive:true});fs.writeFileSync(path.join(dir,'rounds-summary.json'),JSON.stringify(result,null,2)+'\n');return result;
}
if(require.main===module){const at=process.argv.indexOf('--output'),r=replay(at>=0?process.argv[at+1]:undefined);console.log(JSON.stringify({stages:r.stages.map(({provenance,...x})=>x),executionComplete:r.executionComplete,coachingCodeGatesPassed:r.coachingCodeGatesPassed,conditionalCases:r.conditionalCases},null,2));process.exitCode=r.coachingCodeGatesPassed?0:1}
module.exports={replay};
