// Proposal evidence only. No proposed policy is evaluated or applied here.
const {makeAthletes,clone}=require('./independent-coaching-inputs.cjs');
const AS_OF='2026-11-07T12:00:00.000Z',EVENT_DATE='2026-11-01';
const observations={
 fast:{context:{status:'normal',reportedAt:'2026-11-06'},datedEvidence:[
  {at:'2026-11-03',activity:'daily-movement',finding:'Walking and stairs comfortable; soreness improving.'},
  {at:'2026-11-05',activity:'easy-running',finding:'Short conversational run comfortable; no next-day worsening reported on 6 November.'},
  {at:'2026-11-06',activity:'lower-lifting',finding:'Familiar low-load warm-ups comfortable; heavy lifting and prior full volume remain untested.'},
  {at:'2026-11-06',activity:'upper-lifting',finding:'Familiar bounded practice comfortable; no systemic or upper-body symptoms reported.'}
 ]},
 slow:{context:{status:'lower',reportedAt:'2026-11-06',note:'Persistent heavy legs; easy running and lower lifting not comfortable.'},datedEvidence:[
  {at:'2026-11-03',activity:'daily-movement',finding:'Stairs still difficult; diffuse leg soreness.'},
  {at:'2026-11-05',activity:'easy-running',finding:'Short easy attempt stopped because leg fatigue made normal running uncomfortable.'},
  {at:'2026-11-06',activity:'lower-lifting',finding:'Familiar warm-up still unusually effortful; no new focal pain.'},
  {at:'2026-11-06',activity:'upper-lifting',finding:'Upper-body and systemic readiness not confirmed; absence of a report is unknown.'}
 ]},
 uncertain:{datedEvidence:[
  {at:'2026-11-01',activity:'event',finding:'Fictional marathon completion known; no subsequent activity or readiness report available.'}
 ]},
 worsening:{context:{status:'lower',reportedAt:'2026-11-06',note:'New focal lower-leg pain; normal walking increasingly uncomfortable.'},datedEvidence:[
  {at:'2026-11-03',activity:'easy-running',finding:'Brief easy activity initially felt tolerable.'},
  {at:'2026-11-05',activity:'running-and-daily-movement',finding:'New focal lower-leg pain during running.'},
  {at:'2026-11-06',activity:'daily-movement',finding:'Pain now affects walking and is worsening; diagnosis unknown.'},
  {at:'2026-11-06',activity:'upper-lifting',finding:'Upper-body readiness not assessed; lower-body support/setup may provoke symptoms.'}
 ]},
 partial:{context:{status:'lower',reportedAt:'2026-11-06',note:'Easy running comfortable; familiar squat warm-up still uncomfortable.'},datedEvidence:[
  {at:'2026-11-05',activity:'easy-running',finding:'Short conversational run comfortable without next-day worsening.'},
  {at:'2026-11-06',activity:'lower-lifting',finding:'Familiar squat warm-up uncomfortable; no diagnosis established.'},
  {at:'2026-11-06',activity:'upper-lifting',finding:'Familiar bounded upper-body work comfortable without provoking legs.'}
 ]}
};
function cases(){
 const result=[];
 for(const athlete of makeAthletes())for(const [trajectory,observation]of Object.entries(observations)){
  const a=clone(athlete);a.config.runningHistory.recentMarathonDate=EVENT_DATE;
  delete a.config.recoveryContext;delete a.config.recoveryEvidence;
  if(observation.context)a.config.recoveryContext=clone(observation.context);
  result.push({id:a.id+'-'+trajectory,athlete:a.id,trajectory,route:'context-only',asOf:AS_OF,eventDate:EVENT_DATE,
   scope:'Counterfactual recovery stress test, not evidence that the pre-event base made a marathon advisable.',
   evidence:clone(observation.datedEvidence),input:a});
  if(['slow','worsening','partial'].includes(trajectory)){
   const paired=clone(result.at(-1));paired.id+='-paired';paired.route='paired-context-and-evidence';
   paired.input.config.recoveryEvidence={status:'accumulating-fatigue',affectedLifts:['Squat','Deadlift'],observedAt:'2026-11-06',lowerBodyFatigue:true};
   result.push(paired);
  }
 }
 return result;
}
module.exports={AS_OF,EVENT_DATE,cases};
