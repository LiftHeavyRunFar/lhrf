const {normalizeProfile}=require('../src/coach-adapters.js');
const profiles=require('./athletes/profiles.cjs');
function reviewState(mode){
 const c=normalizeProfile({...profiles[0].config,topSetFirst:false}),sets=[];
 for(const date of ['2026-10-13T12:00:00Z','2026-10-20T12:00:00Z','2026-10-23T12:00:00Z'])for(let set=1;set<=3;set++)sets.push({date,exercise:'Bench',session:'Bench',set,role:set===1?'top':'backoff',reps:3,weight:120,rpe:mode==='strong'?6.5:mode==='fatigue'?9:8,target:8});
 return {customRoadmap:c,activeCustomWeek:3,sets,runs:[],decisions:[],overrides:{},checkins:mode==='fatigue'?['2026-10-21','2026-10-23'].map(date=>({date,sleep:2,energy:2,soreness:4,stress:4,symptoms:''})):[],sessionFeedback:[],completedWorkouts:[]};
}
module.exports={profiles,normalizeProfile,reviewState};
