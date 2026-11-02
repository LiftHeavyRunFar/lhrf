// Deterministic synthetic before/after evidence for equipment policy v1.
const adapters=require('../src/coach-adapters'),registry=require('../src/exercise-registry');
const {fullInventory}=require('../tests/equipment-fixtures.cjs');
const base={...require('../tests/athletes/profiles.cjs')[0].config,weeks:20,strengthTargetDate:null,runningTargetDate:null,coachingPolicy:'review-v2',exerciseSelectionVersion:2};
const full=fullInventory(),home=fullInventory();for(const k of registry.equipment)home.items[k]=['straight-bar','plates','collars','rack','safeties','floor','lifting-floor','flat-bench','dumbbells','incline-bench','rear-foot-support'].includes(k)?'available':'unavailable';
const noSpecial=fullInventory();for(const k of ['safety-squat-bar','bands','chains','band-anchor','chain-attachments'])noSpecial.items[k]='unavailable';
const removed=fullInventory();removed.items['straight-bar']='unavailable';
const missingHandle=fullInventory();missingHandle.items['rope']='unknown';
const empty={...full,items:{},setups:{}};
const now=Date.parse('2026-11-01T12:00:00Z');
const raw=adapters.createProfileEngine(base,{now});
const before=raw.engine.generatedSessions(raw.config,1);
const describe=s=>({id:s.id,day:s.day,exercises:s.ex.map(e=>({label:e[0],sets:e[1],dose:e[2],kg:e[3],rpe:e[4],...(e[5]?.exerciseId?{exerciseId:e[5].exerciseId,variantId:e[5].variantId,doseUnit:e[5].doseUnit,loadType:e[5].loadType,calibrationRequired:e[5].calibrationRequired}:{})})),limitations:s.equipmentLimitations||[]});
const scenarios=[];
for(const [name,inventory]of [['commercial',full],['home',home],['no-specialist-bars-bands-chains',noSpecial],['straight-bar-removed',removed],['missing-rope',missingHandle],['unconfirmed',empty]]){
 const a=adapters.createProfileEngine({...base,equipmentPolicyVersion:1,equipmentInventory:inventory},{now});const weeks=[];
 for(let w=1;w<=20;w++){const sessions=a.engine.generatedSessions(a.config,w),audit=registry.audit(sessions,inventory);if(!audit.eligible)throw Error(name+': ineligible output');weeks.push({week:w,feasible:sessions.constraintResult.feasible,blockingIssues:sessions.constraintResult.blockingIssues,optionalWarnings:sessions.constraintResult.warnings.filter(x=>!sessions.constraintResult.blockingIssues.includes(x))});}
 const after=a.engine.generatedSessions(a.config,1);scenarios.push({name,wholeHorizonEligible:true,blockedWeeks:weeks.filter(w=>!w.feasible).map(w=>w.week),before:before.map(describe),after:after.map(describe),weeks});
}
const kitOnly=adapters.createProfileEngine({...base,squat:2,equipmentPolicyVersion:1,equipmentInventory:noSpecial,variations:{Squat:{choice:'Safety-bar squat',lock:true}}},{now});
console.log(JSON.stringify({schema:'lhrf-equipment-validation-v1',syntheticOnly:true,clock:'2026-11-01T12:00:00Z',registryNames:registry.exercises.length,generatorNames:62,legacyLabels:2,scenarios,variationExample:{before:'Safety-bar squat',after:kitOnly.engine.variationChoice(kitOnly.config,'Squat',1)}},null,2));
