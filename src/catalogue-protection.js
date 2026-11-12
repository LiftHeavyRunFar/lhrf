/* Read-only source resolution. Unknown event/taper status is always protected. */
(function(root){'use strict';
 const revision='phase-one-frequency-2026-11-10-v2';
 const supported=new Set(['lifting-foundation','general-strength','powerlifting-three-day','powerlifting-four-day','bench-specialisation','deadlift-specialisation','running-base','10k-two-run','10k-three-run','half-marathon','marathon-distance','marathon-timed']);
 const unknown=reason=>({classification:'unknown',taper:'unknown',protected:true,reason});
 // Only these complete, written programmes contain no competition or benchmark.
 // Structural checks describe the saved catalogue, not events outside the app.
 const hasEventMetadata=value=>Object.keys(value||{}).some(key=>/event|race|taper|benchmark|meet/i.test(key));
 function eventFreePlan(plan){
  const s=plan?.snapshot;
  if(!plan || typeof plan.id!=='string' || !plan.id || s?.revision!==revision || !Array.isArray(s.weeks))return false;
  if(hasEventMetadata(plan)||hasEventMetadata(s))return false;
  const strength=s.id==='lifting-foundation',running=s.id==='running-base';
  if(!strength&&!running)return false;
  if(s.discipline!==(strength?'strength':'running'))return false;
  if(!(strength?[6,9]:[8,14]).includes(s.durationWeeks)||s.weeks.length!==s.durationWeeks)return false;
  return s.weeks.every((week,index)=>{
   const ids=strength?(index<6?['A','B']:['A','B','C']):['easy-1','easy-2','long'];
   if(week?.week!==index+1||hasEventMetadata(week)||!Array.isArray(week.sessions)||week.sessions.length!==ids.length)return false;
   return ids.every(id=>{
    const found=week.sessions.filter(x=>x?.id===id);
    if(found.length!==1)return false;
    const session=found[0];
    if(hasEventMetadata(session))return false;
    if(!Number.isInteger(session.day)||session.day<0||session.day>6||session.kind!==(strength?'strength':'run'))return false;
    const titles=strength?{A:['Squat, press and row'],B:['Hinge, press and pulldown'],C:['Third-day practice']}:
     {'easy-1':['Easy run','Easy run with introductory threshold'],'easy-2':['Easy run'],long:['Easy long run']};
    if(!titles[id].includes(session.title))return false;
    if(strength)return Array.isArray(session.groups)&&session.groups.length>0;
    return Array.isArray(session.steps)&&session.steps.length>0&&session.steps.every(x=>x&&['warm-up','work','recovery','cool-down'].includes(x.role)&&x.effort!=='race');
   });
  });
 }
 function inspect(plans,occurrence,context){
  const key=occurrence?.catalogueOccurrenceId;
  if(!Array.isArray(plans)||typeof key!=='string'||!key)return unknown('missing source');
  const matches=[];
  for(const plan of plans){
   if(!plan||typeof plan.id!=='string'||!Array.isArray(plan.snapshot?.weeks))continue;
   for(const week of plan.snapshot.weeks){
    if(!Number.isInteger(week?.week)||!Array.isArray(week.sessions))continue;
    for(const session of week.sessions){
     if(typeof session?.id==='string'&&plan.id+'-w'+week.week+'-'+session.id===key)matches.push({plan,week,session});
    }
   }
  }
  if(matches.length!==1)return unknown('source is missing or ambiguous');
  const {plan,week,session}=matches[0],snapshot=plan.snapshot;
  if(snapshot.revision!==revision||!supported.has(snapshot.id))return unknown('unrecognised catalogue revision');
  let classification;
  if(session.kind==='event')classification='event';
  else if(session.kind==='run'){
   if(!Array.isArray(session.steps)||session.steps.length===0)return unknown('missing running steps');
   const race=session.steps.some(step=>step?.role==='race');
   if((session.id==='race')!==race)return unknown('inconsistent race indicators');
   classification=race?'race':'training';
  }else if(session.kind==='strength'){
   // This is the exact reviewed benchmark slot in the supported snapshot revision.
   const benchmark=snapshot.id==='general-strength'&&week.week===8&&session.id==='C'&&session.title==='Strength benchmark';
   if(session.title==='Strength benchmark'&&!benchmark)return unknown('inconsistent benchmark indicators');
   classification=benchmark?'benchmark':'training';
  }else return unknown('unsupported session kind');
  // Optional explicit athlete confirmation is scoped to the entire exact supplied plan set.
  // This is a prototype contract, never a default or an onboarding requirement.
  const attestation=context?.eventFreeAttestation;
  const asOf=context?.asOfDate;
  const confirmed=attestation?.confirmedOn;
  const validDay=value=>typeof value==='string' && /^\d{4}-\d{2}-\d{2}$/.test(value) &&
   Number.isFinite(Date.parse(value)) && new Date(value).toISOString().slice(0,10)===value;
  const elapsed=validDay(asOf)&&validDay(confirmed)?(Date.parse(asOf)-Date.parse(confirmed))/86400000:NaN;
  if(classification==='training' && plans.length>0 && plans.every(eventFreePlan) &&
     new Set(plans.map(p=>p.id)).size===plans.length &&
     attestation?.source==='athlete-confirmed' && attestation.noOtherEventOrTaper===true && context?.eventInformationUnchanged===true &&
     Number.isInteger(elapsed) && elapsed>=0 && elapsed<7 &&
     typeof attestation.boundPlans==='string' && attestation.boundPlans===JSON.stringify(plans)){
   return {classification,taper:'not-applicable',protected:false,reason:'complete event-free catalogue and explicit athlete confirmation'};
  }
  // The written snapshot does not encode taper dates. Even known non-events must fail closed.
  return {classification,taper:'unknown',protected:true,reason:'taper is not explicitly represented'};
 }
 const api={inspect};if(typeof module==='object'&&module.exports)module.exports=api;else root.LHRFCatalogueProtection=api;
})(typeof globalThis!=='undefined'?globalThis:this);
