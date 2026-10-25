/* Read-only weekly coach review. Proposals are never applied here. */
(function(root){
'use strict';
function deps(){return typeof module==='object'&&module.exports?
 {trends:require('./strength-trends-v2.js'),feedback:require('./strength-feedback-v2.js'),running:require('./running-recovery-v2.js'),runningTrend:require('./running-feedback-v2.js')}:
 {trends:root.LHRFStrengthTrendsV2,feedback:root.LHRFStrengthFeedbackV2,running:root.LHRFRunningRecoveryV2,runningTrend:root.LHRFRunningFeedbackV2};}
function reviewWeek(input){
 const c=input||{},d=deps(),logs=Array.isArray(c.strengthLogs)?c.strengthLogs:[];
 const lifts=['squat','bench','deadlift'],signals=[],proposals=[];
 for(const lift of lifts){
  const trend=d.trends.reviewStrengthTrend(logs,lift);
  signals.push(trend);
  if(trend.proposal)proposals.push({...trend.proposal,source:'multi-exposure-trend'});
 }
 const last=c.lastStrengthSession;
 if(last&&last.prescription&&last.feedback){
  const single=d.feedback.proposeStrengthAdjustment(last.prescription,last.feedback);
  if(single.proposal){
   const lift=single.proposal.lift;
   const repeated=signals.find(s=>s.lift===lift)?.signal==='repeated-overshoot';
   // Do not suggest increasing the next load during a persistent fatigue signal.
   if(!(repeated&&single.proposal.direction==='increase'))
    proposals.push({...single.proposal,source:'latest-session-feedback'});
  }
 }
 const running=d.running.reviewRunningRecovery(c);
 const runningTrend=d.runningTrend.reviewRunning((Array.isArray(c.runLogs)?c.runLogs:[]).map(x=>({...x,sessionRPE:x.actualRPE})));
 if(runningTrend.proposal?.kind==='review-running-progression')proposals.push({...runningTrend.proposal,source:'multi-run-trend'});
 for(const proposal of running.proposals)proposals.push({...proposal,source:'running-recovery-feedback'});
 // Combined-load guard: avoid contradictory progression advice while recovery
 // signals call for caution. Preserve strength-specific load reductions.
 const fatigue=Number(c.readiness?.fatigue),soreness=Number(c.readiness?.legSoreness);
 const systemic=Number.isFinite(fatigue)&&fatigue>=4&&fatigue<=5;
 const lowerBody=Number.isFinite(soreness)&&soreness>=4&&soreness<=5;
 const runningStrain=running.signal==='repeated-running-overshoot';
 const phase=String(c.phase||'').toLowerCase();
 const phaseReview=['recovery','realisation','assessment','event'].includes(phase);
 const pain=c.readiness?.pain===true||c.readiness?.unusualDiscomfort===true;
 const incomplete=last?.feedback?.completed===false;
 const guarded=proposals.filter(p=>{
  const progression=p.kind==='review-progression'||p.kind==='review-running-progression'||p.kind==='next-exposure-top-load'&&p.direction==='increase';
  if(!progression)return true;
  if(systemic||pain||phaseReview)return false;
  if(incomplete&&p.lift===last.prescription?.lift)return false;
  if((runningStrain||lowerBody)&&(['squat','deadlift'].includes(p.lift)||p.kind==='review-running-progression'))return false;
  return true;
 });
 const suppressed=proposals.length-guarded.length;
 const unique=guarded.filter((p,i)=>guarded.findIndex(q=>q.kind===p.kind&&q.lift===p.lift)===i);
 return {schema:'lhrf-v2-weekly-review',signals,running,suppressedProgressionProposals:suppressed,proposals:unique,
  approvalRequired:unique.length>0,appliedChanges:[],
  summary:unique.length?unique.length+' proposed coaching change(s) awaiting athlete approval.':
   'No changes proposed from available training feedback.',
  limitations:['Running uses reported RPE and optional fatigue/leg soreness only; sleep and pace trends are not yet included.',
   'No programme edits or persistence.']};
}
const api={reviewWeek};if(typeof module==='object'&&module.exports)module.exports=api;else root.LHRFWeeklyReviewV2=api;
})(typeof globalThis!=='undefined'?globalThis:this);
