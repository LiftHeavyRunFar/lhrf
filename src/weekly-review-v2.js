/* Read-only weekly coach review. Proposals are never applied here. */
(function(root){
'use strict';
function deps(){return typeof module==='object'&&module.exports?
 {trends:require('./strength-trends-v2.js'),feedback:require('./strength-feedback-v2.js')}:
 {trends:root.LHRFStrengthTrendsV2,feedback:root.LHRFStrengthFeedbackV2};}
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
 const unique=proposals.filter((p,i)=>proposals.findIndex(q=>q.kind===p.kind&&q.lift===p.lift)===i);
 return {schema:'lhrf-v2-weekly-review',signals,proposals:unique,
  approvalRequired:unique.length>0,appliedChanges:[],
  summary:unique.length?unique.length+' proposed coaching change(s) awaiting athlete approval.':
   'No changes proposed from available strength feedback.',
  limitations:['Strength top-set RPE only; running, sleep, soreness and readiness are not yet included.',
   'No programme edits or persistence.']};
}
const api={reviewWeek};if(typeof module==='object'&&module.exports)module.exports=api;else root.LHRFWeeklyReviewV2=api;
})(typeof globalThis!=='undefined'?globalThis:this);
