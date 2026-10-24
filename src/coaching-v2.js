/* LHRF coaching v2: pure, opt-in planning primitives. No access to browser storage. */
(function(root){
 'use strict';
 function clamp(x,a,b){return Math.max(a,Math.min(b,x))}
 function weekCount(v){return clamp(Math.round(Number(v)||12),4,52)}
 function selectFramework(input){
  const c=input||{},strengthEvent=Boolean(c.strengthTargetDate),runEvent=Boolean(c.runningTargetDate);
  const focus=c.hybridFocus||(c.priority==='Running'?'running':'strength');
  const strengthSessions=['squat','bench','deadlift'].reduce((n,k)=>n+(Number(c[k])||0),0);
  return {strength:strengthSessions===0?'none':strengthEvent?'competition-strength':focus==='running'?'strength-maintenance':'progressive-strength',
   running:Number(c.runs||0)===0?'none':runEvent?'race-specific':c.runGoal==='fitness'?'aerobic-maintenance':'progressive-running',
   coordination:strengthSessions>0&&Number(c.runs||0)>0?'hybrid':'single-sport',
   reason:strengthEvent?'Strength event date anchors specificity and taper.':runEvent?'Running event date anchors race preparation.':'Without a competition, build toward an optional assessment rather than an artificial competition taper.'};
 }
 function selectOutcome(c,framework){
  const event=Boolean(c.strengthTargetDate||c.runningTargetDate);
  if(event)return {kind:'event',optional:false,week:weekCount(c.weeks),description:'Perform at the scheduled event; coordinate taper around event dates.'};
  if(framework.strength==='none'&&framework.running==='none')return {kind:'review',optional:true,week:weekCount(c.weeks),description:'Review training goals and choose the next block.'};
  return {kind:'optional-assessment',optional:true,week:weekCount(c.weeks),
   strength:framework.strength==='none'?null:'RPE-capped rep benchmark or estimated 1RM comparison',
   running:framework.running==='none'?null:'Controlled running benchmark or pace-at-effort comparison',
   description:'Offer an athlete-approved assessment in the final week; declining does not block continued training.'};
 }
 function planPhases(c,framework){
  const n=weekCount(c.weeks),event=framework.strength==='competition-strength'||framework.running==='race-specific',weeks=[];
  const assess=!event&&selectOutcome(c,framework).kind==='optional-assessment';
  for(let w=1;w<=n;w++){
   const p=w/n;
   let phase=p<=.34?'foundation':p<=.70?'development':'intensification';
   if(event&&w===n)phase='event';
   else if(assess&&w===n)phase='assessment';
   else if(w===n-1&&(event||assess))phase='realisation';
   const deload=w>1&&w<n-1&&w%4===0;
   if(deload)phase='recovery';
   weeks.push({week:w,phase,deload,objective:phase==='assessment'?'Offer an optional, recovery-aware performance assessment':phase==='realisation'?'Reduce fatigue while preserving movement specificity':phase==='event'?'Perform at the scheduled event':phase==='recovery'?'Manage accumulated fatigue before renewed progression':'Build capacity toward the end-of-cycle outcome'});
  }
  return weeks;
 }
 function buildPlan(input){
  const c={...(input||{}),weeks:weekCount(input?.weeks)};
  const framework=selectFramework(c),outcome=selectOutcome(c,framework);
  return {schema:'lhrf-coaching-v2-preview',weeks:c.weeks,framework,outcome,phases:planPhases(c,framework),requiresAthleteApproval:outcome.optional};
 }
 const api={buildPlan,selectFramework,selectOutcome,planPhases};
 if(typeof module==='object'&&module.exports)module.exports=api;
 else root.LHRFCoachingV2=api;
})(typeof globalThis!=='undefined'?globalThis:this);
