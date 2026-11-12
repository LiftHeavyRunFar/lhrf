/* Read-only source resolution. Unknown event/taper status is always protected. */
(function(root){'use strict';
 const revision='phase-one-frequency-2026-11-10-v2';
 const supported=new Set(['lifting-foundation','general-strength','powerlifting-three-day','powerlifting-four-day','bench-specialisation','deadlift-specialisation','running-base','10k-two-run','10k-three-run','half-marathon','marathon-distance','marathon-timed']);
 const unknown=reason=>({classification:'unknown',taper:'unknown',protected:true,reason});
 function inspect(plans,occurrence){
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
  // The written snapshot does not encode taper dates. Even known non-events must fail closed.
  return {classification,taper:'unknown',protected:true,reason:'taper is not explicitly represented'};
 }
 const api={inspect};if(typeof module==='object'&&module.exports)module.exports=api;else root.LHRFCatalogueProtection=api;
})(typeof globalThis!=='undefined'?globalThis:this);
