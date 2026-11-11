/* Equipment policy v1. Pure, shared by generation, review and workout start.
 * Labels remain intact in historical records; IDs never depend on array position. */
(function(root){
'use strict';
const gym=typeof module==='object'&&module.exports?require('./gym-equipment.js'):(root.LHRFGymEquipment||{specialists:[],effective:inv=>({items:inv?.items||{},setups:inv?.setups||{}})});
/** @typedef {'reps'|'seconds'} DoseUnit */
/** @typedef {'external-kg'|'per-hand-kg'|'assistance-kg'|'bodyweight'} LoadType */
/** @typedef {{id:string,label:string,purpose:string,required:string[],doseUnit:DoseUnit,loadType:LoadType,setup:string,alternatives:string[]}} Exercise */
/** @type {Exercise[]} */
const exercises=[];
const idOf=s=>s.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
function add(labels,purpose,required,loadType='external-kg',doseUnit='reps',setup='fixed'){
 for(const label of labels.split('|'))exercises.push({id:idOf(label),label,purpose,required:required.split('|').filter(Boolean),loadType,doseUnit,setup,alternatives:[]});
}
const squat='straight-bar|plates|collars|rack|safeties|floor';
const bench=squat+'|flat-bench';
const pull='straight-bar|plates|collars|lifting-floor';
add('Squat','squat practice',squat);
add('Bench','bench practice',bench);
add('Deadlift','floor-pull practice',pull);
add('Goblet squat','squat practice','dumbbells|floor','external-kg','reps','dumbbell');
add('Dumbbell bench press','horizontal press','dumbbells|flat-bench|floor','per-hand-kg','reps','dumbbell');
add('Dumbbell Romanian deadlift','controlled hip hinge','dumbbells|floor','per-hand-kg','reps','dumbbell');
add('Dumbbell deadlift','floor-pull practice','dumbbells|floor','per-hand-kg','reps','dumbbell');
add('Dumbbell overhead press','vertical press','dumbbells|floor','per-hand-kg','reps','dumbbell');
add('Split squat','unilateral knee and hip work','dumbbells|floor','per-hand-kg','reps','dumbbell');
add('Overhead press','vertical press','straight-bar|plates|collars|floor');
add('Plank','anti-extension hold','floor','bodyweight','seconds');
add('Leg curl','knee flexion','lying-leg-curl');
add('Pin press','paused bench practice',bench);
add('Deadlift paused below the knee','paused floor-pull control',pull);
add('Low-block pull','floor-pull practice',pull+'|block-pull-blocks');
add('Safety-bar squat','upright squat support','safety-squat-bar|plates|collars|rack|safeties|floor');
add('Front squat','upright squat support',squat);
add('Paused squat','paused squat control',squat);
add('Tempo squat','eccentric squat control',squat);
add('Competition squat','competition squat practice',squat);
add('Close-grip bench','close-grip pressing',bench);
add('Spoto press','hover-pause pressing',bench);
add('Paused bench','paused bench practice',bench);
add('Tempo bench','eccentric bench control',bench);
add('Competition bench','competition bench practice',bench);
add('Paused deadlift','paused floor-pull control',pull);
add('Deficit deadlift','extended floor-pull range',pull+'|deficit-platform');
add('Competition deadlift','competition floor-pull practice',pull);
add('Romanian deadlift','controlled hip hinge',pull,'external-kg','reps','barbell');
add('Bulgarian split squat','unilateral leg support','dumbbells|rear-foot-support|floor','per-hand-kg','reps','dumbbell');
add('Reverse lunge','unilateral leg support','dumbbells|floor','per-hand-kg','reps','dumbbell');
add('Seated leg curl','knee flexion','seated-leg-curl');
add('Lying leg curl','knee flexion','lying-leg-curl');
add('Weighted plank','anti-extension hold','floor|supported-plank-load','external-kg','seconds');
add('Leg press','supported quad compound','leg-press');
add('Pallof press','anti-rotation','cable-station|single-handle|floor','external-kg','reps','cable');
add('Ab wheel','dynamic anti-extension','ab-wheel|floor','bodyweight');
add('Leg extension','knee extension isolation','leg-extension');
add('Cable crunch','trunk flexion','cable-station|rope|floor');
add('Back extension','supported hip-trunk extension','back-extension-support|plates');
add('Side plank','lateral trunk hold','floor','bodyweight','seconds');
add('Hip thrust','shortened hip extension','straight-bar|plates|collars|flat-bench|bar-pad|floor','external-kg','reps','barbell');
add('Chest-supported row','supported horizontal pull','dumbbells|incline-bench|floor','per-hand-kg','reps','dumbbell');
add('One-arm dumbbell row','supported horizontal pull','dumbbells|flat-bench|floor','per-hand-kg');
add('Incline dumbbell press|Low-incline dumbbell press','incline pressing','dumbbells|incline-bench|floor','per-hand-kg');
add('Dumbbell floor press','floor pressing','dumbbells|floor','per-hand-kg');
add('Triceps pushdown','elbow extension','cable-station|pushdown-bar');
add('Overhead triceps extension','overhead elbow extension','dumbbells|floor','external-kg','reps','dumbbell');
add('Seated cable row','supported horizontal pull','cable-row|row-handle');
add('Cable fly','chest adduction','dual-cable|single-handle-pair|floor');
add('Lat pulldown','vertical pulling','lat-pulldown|pulldown-bar');
add('Neutral-grip lat pulldown','vertical pulling','lat-pulldown|neutral-pulldown-handle');
add('Assisted pull-up','vertical pulling','assisted-pull-up','assistance-kg','reps','machine');
add('Single-arm cable pushdown','elbow extension','cable-station|single-handle');
add('Seated dumbbell shoulder press|Seated neutral-grip dumbbell press','seated overhead pressing','dumbbells|upright-bench|floor','per-hand-kg');
add('Machine shoulder press','seated overhead pressing','shoulder-press-machine');
add('Chest-supported cable row','supported horizontal pull','cable-station|row-handle|incline-bench|floor');
add('One-arm cable row','horizontal pull','cable-station|single-handle|floor');
add('Dumbbell lateral raise','shoulder abduction','dumbbells|floor','per-hand-kg');
add('Cable lateral raise','shoulder abduction','cable-station|single-handle|floor');
add('Machine lateral raise','shoulder abduction','lateral-raise-machine');
add('Reverse pec deck','rear shoulder isolation','reverse-pec-deck');
add('Rear-delt dumbbell fly','rear shoulder isolation','dumbbells|floor','per-hand-kg');
add('Cable rear-delt fly','rear shoulder isolation','dual-cable|single-handle-pair|floor');
add('Face pull','rear shoulder and external rotation','cable-station|rope|floor');
add('Cable biceps curl','supinated elbow flexion','cable-station|curl-bar|floor');
add('Hammer curl','neutral-grip elbow flexion','dumbbells|floor','per-hand-kg');
add('Preacher curl','supported elbow flexion','ez-bar|plates|collars|preacher-bench','external-kg','reps','ez-bar');
add('Incline dumbbell curl','incline elbow flexion','dumbbells|incline-bench|floor','per-hand-kg');
add('Rope triceps pushdown','elbow extension','cable-station|rope');
add('Overhead cable triceps extension','overhead elbow extension','cable-station|rope|floor');
add('Dumbbell triceps extension','overhead elbow extension','dumbbells|floor');
// Legacy labels have separate identities: execution equivalence is not assumed.
add('Bench press','legacy bench practice',bench);
add('Triceps cable extension','legacy elbow extension','cable-station|rope','external-kg','reps','execution-review');
const byId=new Map(exercises.map(e=>[e.id,e]));
const byLabel=new Map(exercises.map(e=>[e.label.toLowerCase(),e]));
function resolve(name){return byId.get(name)||byLabel.get(String(name).trim().toLowerCase())||null}
// Deliberately narrow graph. Preserve dose units and the training job; disclose
// changed setup and recalibrate kilograms. No curl-to-hinge or pulldown-to-row.
for(const e of exercises)e.alternatives=exercises.filter(x=>x.id!==e.id&&x.purpose===e.purpose&&x.doseUnit===e.doseUnit&&x.loadType!=='assistance-kg'&&e.loadType!=='assistance-kg').map(x=>x.id);
const equipment=[...new Set([...exercises.flatMap(e=>e.required),'bands','band-anchor','chains','chain-attachments','trap-bar','deadlift-bar',...gym.specialists.map(s=>s.key)])].sort();
function validInventory(inv){
 return !!inv&&inv.version===1&&typeof inv.venueId==='string'&&inv.venueId.length>0&&Number.isFinite(Date.parse(inv.confirmedAt))&&inv.items&&typeof inv.items==='object'&&!Array.isArray(inv.items);
}
function eligibility(name,inv){
 const e=resolve(name);if(!e)return {eligible:false,exerciseId:null,reasons:['Unregistered exercise: '+name]};
 const reasons=[],available=gym.effective(inv,exercises,equipment);
 for(const key of e.required)if(available.items[key]!=='available')reasons.push(key+': unavailable');
 // Ordinary named execution conventions are defaults; ambiguous legacy implementations still need review.
 if(e.setup!=='fixed'&&available.setups[e.id]!==e.setup)reasons.push('Confirm '+e.setup+' setup for '+e.label+'.');
 return {eligible:!reasons.length,exerciseId:e.id,reasons};
}
function identity(name,inv){const e=resolve(name);return e?{exerciseId:e.id,variantId:e.id+'@'+(inv?.venueId||'unknown')+':'+e.setup,loadType:e.loadType,doseUnit:e.doseUnit}:null}
function select(names,inv,prefs={},purpose){
 const allowed=names.filter(n=>{const e=resolve(n);return e&&(!purpose||e.purpose===purpose)&&!['avoid','unavailable'].includes(prefs[n])&&eligibility(n,inv).eligible});return allowed.find(n=>prefs[n]==='prefer')||allowed[0]||null;
}
function audit(sessions,inv){
 const issues=[];
 for(const s of sessions)for(const [index,e]of (s.ex||[]).entries()){
  const result=eligibility(e[0],inv);if(e[5]?.equipmentPolicyVersion===1&&e[5].variantId!==identity(e[0],inv)?.variantId){result.eligible=false;result.reasons.push('Venue or setup identity changed; review the future prescription.')}if(!result.eligible)issues.push({sessionId:s.id,index,label:e[0],...result});
 }
 return {eligible:!issues.length,issues,messages:issues.map(x=>x.label+': '+x.reasons.join('; '))};
}
function assertStart(session,inv){const limitations=(session.equipmentLimitations||[]).filter(x=>!x.optional);if(limitations.length)throw new Error('Required training stimulus is unavailable: '+limitations.map(x=>x.exercise+' ('+x.purpose+')').join(', '));const r=audit([session],inv);if(!r.eligible)throw new Error('Equipment review required. '+r.messages.join(' '));return true}
for(const e of exercises){Object.freeze(e.required);Object.freeze(e.alternatives);Object.freeze(e)}Object.freeze(exercises);Object.freeze(equipment);
const api={version:1,exercises,equipment,resolve,validInventory,eligibility,identity,select,audit,assertStart};
if(typeof module==='object'&&module.exports)module.exports=api;else root.LHRFExercises=api;
})(typeof globalThis!=='undefined'?globalThis:this);
