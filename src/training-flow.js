/* Draft-only execution aids. No coaching rules or completed-record format changes. */
(function(root){'use strict';
const role=ex=>String(ex?.[5]?.role||'').toLowerCase();
const complete=(live,i)=>!!live.ex?.[i]&&Array.from({length:live.ex[i][1]},(_,j)=>live.entries?.[i+'_'+j]?.done===true).every(Boolean);
function order(live){return (live.ex||[]).map((ex,i)=>({ex,i})).sort((a,b)=>Number(!!a.ex[5]?.optional)-Number(!!b.ex[5]?.optional)).map(x=>x.i)}
function firstIncomplete(live,indices=order(live)){return indices.find(i=>!complete(live,i))??null}
function signature(ex){return JSON.stringify([ex[0],ex[2],ex[3],role(ex),ex[5]?.exerciseId??null,ex[5]?.variantId??null,ex[5]?.equipmentId??null,ex[5]?.venueId??null,ex[5]?.loadType??null,ex[5]?.doseUnit??'reps'])}
function uniformWorking(ex){
 if(!ex||!Number.isInteger(ex[1])||ex[1]<2||!Number.isFinite(ex[2])||!Number.isFinite(ex[3]))return false;
 const meta=ex[5]||{};
 if(meta.warmup||meta.warmUp||['warmup','warm-up'].includes(String(meta.category||'').toLowerCase())||['top','warmup','warm-up','speed','calibration'].includes(role(ex)))return false;
 if(role(ex)&&!['straight','work','working','backoff','back-off','accessory','optional'].includes(role(ex)))return false;
 // The current tuple format prescribes one common load. Explicit/unknown per-set
 // loading plans fail closed rather than being flattened into a common weight.
 if(Object.keys(meta).some(k=>/^(perSet|perSetLoads|setPrescriptions|setWeights|weights|loads|loading|loadProgression|loadingPattern|plannedLoads|setTargets|sets|ramp|ramping)$/i.test(k)&&meta[k]!=null&&meta[k]!==false))return false;
 return true;
}
function samePhase(entry,ex){
 const meta=ex[5]||{};
 if(entry.warmup||entry.warmUp||[entry.role,entry.category].some(value=>['warmup','warm-up'].includes(String(value||'').toLowerCase())))return false;
 if(entry.role!=null&&String(entry.role).toLowerCase()!==role(ex))return false;
 for(const key of ['exerciseId','variantId','equipmentId','venueId','loadType','doseUnit'])if(entry[key]!=null&&entry[key]!==meta[key])return false;
 for(const key of ['prescribedWeight','plannedWeight','targetWeight'])if(entry[key]!=null&&entry[key]!==ex[3])return false;
 return true;
}
function canSuggest(entry,ex){
 if(!entry)return true;if(entry.done||entry.correcting||entry.weightEdited===true)return false;
 if(!samePhase(entry,ex))return false;
 if(entry.weightHint?.kind==='carry-forward')return entry.weightHint.signature===signature(ex);
 // Untagged nonempty legacy values may have been entered manually; preserve them.
 return entry.weightEdited===false||entry.weight==null||entry.weight==='';
}
function carry(live,i,j,{correcting=false}={}){
 const ex=live.ex?.[i],actual=live.entries?.[i+'_'+j];
 if(!actual?.done||!uniformWorking(ex)||!samePhase(actual,ex)||!Number.isFinite(actual.weight)||actual.weight<0)return [];
 if(actual.weight===0&&!['bodyweight','assistance-kg'].includes(ex[5]?.loadType))return [];
 // Correcting/recording out of sequence must not replace evidence from later sets.
 if(Array.from({length:ex[1]},(_,k)=>k>j&&live.entries[i+'_'+k]?.done).some(Boolean))return [];
 const changed=[];
 for(let k=j+1;k<ex[1];k++){
  const key=i+'_'+k,old=live.entries[key];if(!canSuggest(old,ex))continue;
  live.entries[key]={...(old||{reps:ex[2],rpe:'',done:false}),weight:actual.weight,weightEdited:false,weightHint:{kind:'carry-forward',fromSet:j+1,signature:signature(ex)}};changed.push(key);
 }
 return changed;
}
function nextExercise(before,after,i,{correcting=false,indices=order(after)}={}){
 if(correcting||complete(before,i)||!complete(after,i)||firstIncomplete(before,indices)!==i)return null;
 return firstIncomplete(after,indices);
}
function revision(live){return JSON.stringify(Object.entries(live.entries||{}).filter(([,s])=>s.done).map(([k,s])=>[k,s.weight,s.reps,s.rpe]))}
function resumeIndex(live,saved){
 const indices=order(live),valid=i=>Number.isInteger(i)&&indices.includes(i);
 const current=revision(live);
 if(saved?.key===live.id+'|'+live.started&&saved.revision===current&&valid(saved.index))return saved.index;
 if(live.trainingView?.revision===current&&(valid(live.trainingView.exerciseIndex)||live.trainingView.exerciseIndex===-1))return live.trainingView.exerciseIndex===-1?null:live.trainingView.exerciseIndex;
 const correcting=Object.entries(live.entries||{}).find(([,s])=>s.correcting&&!s.done);
 if(correcting)return Number(correcting[0].split('_')[0]);
 if(valid(live.trainingView?.exerciseIndex))return live.trainingView.exerciseIndex;
 if(saved?.key===live.id+'|'+live.started&&valid(saved?.index)&&!complete(live,saved.index))return saved.index;
 return firstIncomplete(live);
}
function originalWeight(live,i){return live.trainingPrescription?.ex?.[i]?.[3]??live.ex?.[i]?.[3]}
const api={complete,order,firstIncomplete,signature,uniformWorking,samePhase,canSuggest,carry,nextExercise,revision,resumeIndex,originalWeight};
if(typeof module==='object'&&module.exports)module.exports=api;else root.LHRFTrainingFlow=api;
})(typeof globalThis!=='undefined'?globalThis:this);
