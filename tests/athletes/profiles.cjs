// Synthetic test profiles. These are not athlete records or training recommendations.
const common={startDate:'2026-10-19',runGoal:'fitness',maxes:{squat:140,bench:100,deadlift:180},tenKTime:'55:00',runningBaselineMinutes:120};
const profile=(id,name,config,expectations)=>({id,name,config:{...common,...config},expectations});
module.exports=[
 profile('bench-dual-event','Bench-first adjacent events',{
  weeks:6,event:'bench',priority:'Bench',bench:3,squat:1,deadlift:1,runs:2,maxes:{bench:160},tenKTime:'1:05:00',
  strengthTargetDate:'2026-11-28',runningTargetDate:'2026-11-29',
  availableDays:['Tue','Thu','Fri','Sat','Sun'],
  fixedSessions:[{kind:'strength',lift:'bench',exposure:1,day:'Tue'},{kind:'run',runType:'quality',day:'Tue'},
   {kind:'strength',lift:'squat',day:'Thu'},{kind:'strength',lift:'deadlift',day:'Thu'},
   {kind:'strength',lift:'bench',exposure:2,day:'Fri'},{kind:'run',runType:'long',day:'Sat'},
   {kind:'strength',lift:'bench',exposure:3,day:'Sun'}],
  topSetFirst:true,lightLifts:['squat','deadlift']
 },['fixed split','bench top set first','light lower body','event precedence and taper']),
 profile('novice','Beginner with unknown strength baselines',{
  weeks:8,priority:'Balanced',bench:2,squat:1,deadlift:1,runs:2,maxes:{},trainingAge:'beginner',runningBaselineMinutes:60,tenKTime:null
 },['unknown loads remain unknown','experience-aware entry','no invented pace']),
 profile('powerlifter','Experienced strength-priority hybrid',{
  weeks:20,priority:'Squat',bench:2,squat:2,deadlift:1,runs:2,maxes:{squat:220,bench:150,deadlift:260},trainingAge:'advanced',purposefulVariations:true
 },['priority workload','purposeful variations','phase transition recovery']),
 profile('runner','10K race with maintenance lifting',{
  weeks:12,priority:'Running',hybridFocus:'running',bench:1,squat:1,deadlift:0,runs:4,runningBaselineMinutes:180,tenKTime:'45:00',runningTargetDate:'2027-01-10'
 },['running priority','maintenance lifting','structured runs after dated overlay']),
 profile('restricted','Restricted three-day schedule',{
  weeks:8,priority:'Balanced',bench:2,squat:1,deadlift:1,runs:3,availableDays:['Tue','Thu','Sat'],maxSessionsPerDay:2,
  fixedSessions:[{kind:'run',runType:'long',day:'Sat'}],doubleDays:['Tue','Thu']
 },['capacity conflicts must be explicit','fixed long-run day','schedule change']),
 profile('fatigue','Repeated overshoot with recovery signals',{
  weeks:12,priority:'Bench',bench:3,squat:1,deadlift:1,runs:3
 },['accessory-first proposal','suppress progression with fatigue','no automatic deload']),
 profile('fast','Consistently improving athlete',{
  weeks:12,priority:'Bench',bench:3,squat:1,deadlift:1,runs:3
 },['ambitious optional progression','no increase with pain or incomplete training'])
];
