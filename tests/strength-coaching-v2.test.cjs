const test=require('node:test'),assert=require('node:assert/strict');
const {createEngine}=require('../src/coach-engine');
const engine=createEngine({now:()=>Date.parse('2026-10-30T12:00:00Z')});
const base={coachingRulesVersion:2,coachingPolicy:'review-v2',startDate:'2026-11-02',weeks:4,strengthTargetDate:'2026-11-28',event:'powerlifting',priority:'Bench',hybridFocus:'strength',trainingAge:'advanced',bench:3,squat:2,deadlift:1};
const slot=(day,names)=>({day,items:names.map(name=>({type:'strength',name}))});
const plan={slots:[slot('Mon',['Squat','Bench']),slot('Wed',['Squat','Bench']),slot('Fri',['Deadlift','Bench'])]};
function exposure(c,w,lift,occurrence,day,options={}){
 const calendar=engine.generalStrengthCalendar(c,plan);
 return engine.generalStrengthExposure(c,w,lift,occurrence,day,lift==='Bench'?130:200,!!options.deload,options.phase||'Specificity',calendar,options.variation||null);
}
test('strength v2 peak rehearsals progress 8, 8.5, 8.5, 9 on actual available dates',()=>{
 const c={...base},singles=[1,2,3,4].map(w=>exposure(c,w,'Bench',0,'Mon'));
 assert.deepEqual(singles.map(s=>s.ex[0][4]),[8,8.5,8.5,9]);
 assert.ok(singles.every(s=>s.ex[0][2]===1&&s.ex[0][5].effortGovernsLoad));
 assert.equal(singles[3].finalHeavy,true);assert.equal(singles[3].reducedSupport,true);
 assert.equal(singles[3].ex[1][1],1);assert.equal(singles[3].ex[1][4],6);
 assert.ok(singles.every(s=>/RPE .*governs the load/.test(s.note)));
 assert.ok(singles.every(s=>/at least one RPE above target/.test(s.note)));
});
test('volume, speed and heavy work have distinct doses and speed never becomes another max day',()=>{
 const c={...base,weeks:20,strengthTargetDate:'2027-03-20'},calendar=engine.generalStrengthCalendar(c,plan);
 assert.deepEqual(calendar.lifts.Bench.roles,['heavy','volume','speed']);
 const heavy=exposure(c,1,'Bench',0,'Mon',{phase:'Development'}),volume=exposure(c,1,'Bench',1,'Wed',{phase:'Development'});
 const speed=[1,2,3].map(w=>exposure(c,w,'Bench',2,'Fri',{phase:'Development'}));
 assert.equal(heavy.ex[0][2],3);assert.equal(heavy.ex[0][4],8);
 assert.equal(volume.ex[0][2],5);assert.equal(volume.ex[0][4],8);
 assert.ok(speed.every(x=>x.ex.length===1&&x.ex[0][1]===5&&x.ex[0][2]===2&&x.ex[0][4]===5.5));
 assert.ok(speed[0].ex[0][3]<speed[1].ex[0][3]&&speed[1].ex[0][3]<speed[2].ex[0][3]);
 assert.ok(speed.every(x=>/speed or position deteriorates/.test(x.note)));
 const variation=exposure(c,1,'Bench',1,'Wed',{phase:'Development',variation:'Spoto press'});
 assert.equal(variation.ex[0][0],'Spoto press');assert.ok(/own history or warm-ups/.test(variation.note));
});
test('unresolved repeated lower-body fatigue reduces lower work while bench practice remains demanding',()=>{
 const c={...base,recoveryEvidence:{status:'accumulating-fatigue',affectedLifts:['Squat','Deadlift'],repeatCount:2,recentRpe:9,baselineRpe:7.5,observedAt:'2026-10-28',sleepHours:5.75,usualSleepHours:7.5}};
 for(const w of [1,2,3]){
  const lower=exposure(c,w,'Squat',0,'Mon'),normal=exposure(base,w,'Squat',0,'Mon');
  assert.equal(lower.recoveryReviewRequired,true);assert.equal(lower.reducedSupport,true);
  assert.ok(lower.ex.every(e=>e[4]<=6.5));
  if(w===1){assert.deepEqual(lower.ex.map(e=>[e[1],e[2],e[4]]),[[1,3,6.5],[1,3,6]]);assert.ok(lower.ex.reduce((n,e)=>n+e[1]*e[2],0)<normal.ex.reduce((n,e)=>n+e[1]*e[2],0));}
  if(normal.ex.every(e=>e[4]<=6))assert.deepEqual(lower.ex.map(e=>e.slice(0,5)),normal.ex.map(e=>e.slice(0,5)),'Fatigue cannot add stress above an already light taper');
 }
 assert.deepEqual(exposure(c,1,'Bench',0,'Mon'),exposure(base,1,'Bench',0,'Mon'));
 assert.deepEqual(exposure({...c,recoveryEvidence:{...c.recoveryEvidence,resolved:true}},1,'Squat',0,'Mon'),exposure(base,1,'Squat',0,'Mon'));
});
test('consolidation, event recovery and running-first practice remain bounded without forcing low-frequency speed visits',()=>{
 assert.ok(exposure(base,1,'Bench',0,'Mon',{deload:true}).ex.every(e=>e[4]<=5.5));
 const post={...base,weeks:5};assert.equal(exposure(post,5,'Bench',0,'Mon').ex.length,0);
 const running={...base,priority:'Running',hybridFocus:'running'};assert.equal(exposure(running,4,'Bench',0,'Mon').ex[0][4],8);
 const calendar=engine.generalStrengthCalendar(base,plan);
 assert.deepEqual(calendar.lifts.Deadlift.roles,['strength']);
 const deadlift=exposure({...base,weeks:20,strengthTargetDate:'2027-03-20'},1,'Deadlift',0,'Fri',{phase:'Development'});
 assert.equal(deadlift.ex[0][5].trainingRole,'strength');assert.equal(deadlift.ex[1][5].role,'backoff');
});
test('version-one saved strength prescriptions do not inherit version-two effort ceilings or role order',()=>{
 const c={...base,coachingRulesVersion:1},calendar=engine.generalStrengthCalendar(c,plan);
 assert.deepEqual(calendar.lifts.Bench.roles,['volume','heavy','speed']);
 const old=exposure(c,4,'Bench',0,'Mon');assert.equal(old.ex[0][4],8.5);assert.equal(old.ex[0][5].policy,'general-strength-v1');
});
test('fatigue suggestions use genuine recent reported capacity rather than the fresh healthy maximum',()=>{
 const historical={date:'2026-10-28T12:00:00Z',exercise:'Squat',weight:160,reps:5,rpe:9,role:'reported-work-set'};
 const local=createEngine({now:()=>Date.parse('2026-10-30T12:00:00Z'),data:{sets:[historical]}});
 const c={...base,recoveryEvidence:{status:'accumulating-fatigue',affectedLifts:['Squat'],repeatCount:2,baselineRpe:7.5,recentRpe:9}};
 const calendar=local.generalStrengthCalendar(c,plan),before=JSON.stringify(historical);
 const dose=local.generalStrengthExposure(c,1,'Squat',0,'Mon',200,false,'Specificity',calendar,null);
 assert.equal(dose.ex[0][3],155);assert.ok(dose.ex[0][3]<historical.weight);
 assert.equal(dose.ex[0][4],6.5);assert.equal(dose.ex[0][5].recoveryLoadAnchor.source,'dated-reported-set');
 assert.equal(dose.ex[0][5].recoveryLoadAnchor.weight,160);assert.equal(dose.ex[0][5].recoveryLoadAnchor.reps,5);
 assert.equal(JSON.stringify(historical),before,'Anchoring must not rewrite a recorded observation');
 const stale=createEngine({now:()=>Date.parse('2026-12-30T12:00:00Z'),data:{sets:[historical]}});
 const staleDose=stale.generalStrengthExposure(c,1,'Squat',0,'Mon',200,false,'Specificity',calendar,null);
 assert.equal(staleDose.ex[0][5].recoveryLoadAnchor,undefined,'A stale activity cannot silently become a current capacity test');
});
test('untimestamped structured recovery observations can anchor load without inventing a workout log or lifting a healthy cap',()=>{
 const c={...base,recoveryEvidence:{status:'accumulating-fatigue',affectedLifts:['Deadlift'],lifts:[{lift:'Deadlift',weight:190,reps:3,rpe:9}]}};
 const calendar=engine.generalStrengthCalendar(c,plan);
 const dose=engine.generalStrengthExposure(c,1,'Deadlift',0,'Fri',225,false,'Specificity',calendar,null);
 assert.ok(dose.ex[0][3]<190);assert.equal(dose.ex[0][5].recoveryLoadAnchor.source,'structured-recovery-observation');
 assert.equal(dose.ex[0][5].recoveryLoadAnchor.date,undefined);assert.ok(Math.abs(dose.ex[0][5].recoveryLoadAnchor.estimatedMax-209)<.001);
 const capped=engine.generalStrengthExposure(c,1,'Deadlift',0,'Fri',180,false,'Specificity',calendar,null);
 assert.equal(capped.ex[0][5].recoveryLoadAnchor.baseline,180);
});
