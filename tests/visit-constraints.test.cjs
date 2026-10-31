const test=require('node:test'),assert=require('node:assert/strict');
const {allocate,fitSessions}=require('../src/coach-constraints.js');
const activities=(counts,runs=3)=>Object.entries(counts).flatMap(([name,n])=>Array.from({length:n},()=>({type:'strength',name,detail:'Exposure'}))).concat(Array.from({length:runs},(_,i)=>({type:'run',name:'Run',detail:i===1?'Long run':'Easy aerobic'})));
const c=(days,visits,combined=[])=>({availableDays:days,days:days.length,longRunDay:'Sun',visitConstraints:{strengthVisits:visits,minutes:Object.fromEntries(days.map(d=>[d,75])),combinedDays:combined}});
test('three-day calendar groups lifts into two visits and preserves all three runs',()=>{
 const config=c(['Tue','Thu','Sun'],2,['Tue','Thu']),input=activities({Squat:1,Bench:2,Deadlift:1}),before=JSON.stringify({config,input});
 const plan=allocate(config,[],input);assert.equal(plan.feasible,true);assert.equal(plan.unscheduled.length,0);
 assert.deepEqual(plan.slots.filter(s=>s.items.some(x=>x.type==='run')).map(s=>s.day),['Tue','Thu','Sun']);
 assert.deepEqual(plan.slots.filter(s=>s.items.some(x=>x.type==='strength')).map(s=>s.day),['Tue','Thu']);
 assert.equal(plan.slots.find(s=>s.day==='Sun').items.length,1);assert.equal(JSON.stringify({config,input}),before);
});
test('two strength visits stay distinct from four lift exposures and protect Sunday',()=>{
 const config=c(['Tue','Thu','Sat','Sun'],2,['Thu']),plan=allocate(config,[],activities({Squat:1,Bench:2,Deadlift:1}));
 assert.equal(plan.feasible,true);assert.deepEqual(plan.slots.filter(s=>s.items.some(x=>x.type==='strength')).map(s=>s.day),['Thu','Sat']);
 assert.equal(plan.slots.find(s=>s.day==='Sat').items.some(x=>x.name==='Squat'||x.name==='Deadlift'),false);
 const impossible=allocate({...config,visitConstraints:{...config.visitConstraints,strengthVisits:1}},[],activities({Squat:1,Bench:2,Deadlift:1}));assert.equal(impossible.feasible,false);assert.ok(impossible.unscheduled.length);
});
test('inclusive estimates trim optional then support and preserve designated main work',()=>{
 const config=c(['Tue'],1,['Tue']);config.visitConstraints.minutes.Tue=50;
 const original=[{day:'Tue',ex:[['Bench',1,1,100,9,{role:'top',category:'primary'}],['Bench',2,3,80,7,{role:'backoff',category:'primary'}],['Row',3,10,0,7],['Curl',3,12,0,7,{optional:true}]],runs:[{minutes:25,durationRangeMinutes:{min:20,max:25}}]}];
 const fit=fitSessions(config,original),s=fit.sessions[0];assert.equal(fit.feasible,true);assert.equal(s.ex[0][1],1);assert.equal(s.ex.find(e=>e[5]?.role==='backoff')[1],2);assert.equal(s.ex.some(e=>e[0]==='Curl'),false);assert.ok(s.timeBudget.totalMinutes<=50);assert.equal(original[0].ex.length,4);assert.ok(s.timeBudget.includesRest&&s.timeBudget.includesWarmups&&s.timeBudget.includesTransitions);
});
test('separate doubles prove two budgets and a minimum gap rather than an aggregate cap',()=>{
 const config=c(['Tue'],1);config.visitConstraints={...config.visitConstraints,separateDays:['Tue'],minimumGapHours:6,separateMinutes:{Tue:75}};
 const session={day:'Tue',ex:[['Deadlift',1,3,150,8,{role:'top',category:'primary'}]],runs:[{minutes:70}]};
 const fit=fitSessions(config,[session]),budget=fit.sessions[0].timeBudget;assert.equal(fit.feasible,true);assert.equal(budget.visits.length,2);assert.ok(budget.totalMinutes>75);assert.ok(budget.visits.every(v=>v.totalMinutes<=75));assert.equal(budget.minimumGapHours,6);
 assert.equal(fitSessions({...config,visitConstraints:{...config.visitConstraints,minimumGapHours:2}},[session]).feasible,false);
});
test('events need explicit permission outside ordinary windows, without inventing a strength-meet duration',()=>{
 const config=c(['Sun'],0);config.visitConstraints.minutes.Sun=130;
 const race={day:'Sunday',eventDate:'2027-03-21',eventType:'running',ex:[],runs:[{minutes:135}]};
 const blocked=fitSessions(config,[race]);assert.equal(blocked.feasible,false);assert.equal(blocked.sessions[0].constraintIssues[0].kind,'event-time');
 const meet={day:'Saturday',eventDate:'2026-11-28',eventType:'strength',ex:[],runs:[]};assert.equal(fitSessions(config,[meet]).feasible,false);
 const accepted=fitSessions({...config,visitConstraints:{...config.visitConstraints,eventDays:{'2026-11-28':{confirmed:true}}}},[meet]);assert.equal(accepted.feasible,true);assert.equal(accepted.sessions[0].timeBudget.totalMinutes,null);
});
test('unknown duration and immovable main work remain blocked instead of being rushed',()=>{
 const config=c(['Tue'],1,['Tue']);config.visitConstraints.minutes.Tue=15;
 const fit=fitSessions(config,[{day:'Tue',ex:[['Squat',1,1,190,9,{role:'top',category:'primary'}]],runs:[{minutes:10}]}]);assert.equal(fit.feasible,false);assert.equal(fit.sessions[0].ex[0][1],1);
 assert.equal(fitSessions(config,[{day:'Tue',ex:[],runs:[{minutes:null}]}]).feasible,false);
});
test('trimming support preserves back-off links to the same top exercise after indices move',()=>{
 const config=c(['Tue'],1);config.visitConstraints.minutes.Tue=27;
 const result=fitSessions(config,[{day:'Tue',runs:[],ex:[['Squat',1,3,120,8,{role:'top',category:'primary'}],['Squat',1,3,100,7,{role:'backoff',category:'primary',topIndex:0}],['Row',9,10,0,7],['Bench',1,3,80,8,{role:'top',category:'primary'}],['Bench',1,3,70,7,{role:'backoff',category:'primary',topIndex:3}]]}]);
 const ex=result.sessions[0].ex,b=ex.find(e=>e[0]==='Bench'&&e[5]?.role==='backoff');assert.equal(ex[b[5].topIndex][0],'Bench');assert.equal(ex[b[5].topIndex][5].role,'top');assert.equal(result.feasible,true);
});
test('small easy-run excess is fitted by shortening actual steps after preserving maintenance work',()=>{
 const config=c(['Thu'],1,['Thu']);
 const run={role:'easy-run',distanceKm:7.45,minutes:53,durationRangeMinutes:{min:45,max:53},steps:[{label:'Easy run',role:'easy',distanceKm:7.45,pace:'5:58/km to 7:04/km'}]};
 const ex=[['Deadlift',2,3,120,7.5,{role:'straight',category:'primary'}],['Bench',2,3,70,7.5,{role:'straight',category:'primary'}]];
 const result=fitSessions(config,[{day:'Thu',ex,runs:[run]}]),s=result.sessions[0];
 assert.equal(result.feasible,true);assert.deepEqual(s.ex.map(e=>e[1]),[2,2]);assert.ok(s.runs[0].distanceKm<7.45);assert.ok(s.timeBudget.totalMinutes<=75);assert.equal(s.runs[0].distanceKm,Number(s.runs[0].steps.reduce((n,x)=>n+x.distanceKm,0).toFixed(3)));assert.ok(s.runningAdjustments.trimmedKm>0);assert.equal(run.distanceKm,7.45);
});
test('quality fitting retains every work and recovery step, or honestly blocks the visit',()=>{
 const config=c(['Tue'],1,['Tue']);config.visitConstraints.minutes.Tue=70;
 const work=[{label:'Rep 1',role:'work',distanceKm:1,pace:'5:00/km'},{label:'Recovery',role:'recovery',distanceKm:.2,pace:'7:00/km'},{label:'Rep 2',role:'work',distanceKm:1,pace:'5:00/km'},{label:'Recovery',role:'recovery',distanceKm:.2,pace:'7:00/km'},{label:'Rep 3',role:'work',distanceKm:1,pace:'5:00/km'}];
 const run={role:'quality-run',distanceKm:7.4,minutes:47,steps:[{label:'Warm-up',role:'easy',distanceKm:2,pace:'7:00/km'},...work,{label:'Cool-down',role:'easy',distanceKm:2,pace:'7:00/km'}]};
 const session={day:'Tue',ex:[['Squat',2,3,100,7.5,{category:'primary',role:'straight'}],['Bench',2,3,70,7.5,{category:'primary',role:'straight'}]],runs:[run]};
 const fit=fitSessions(config,[session]);assert.equal(fit.feasible,true);assert.deepEqual(fit.sessions[0].runs[0].steps.filter(x=>['work','recovery'].includes(x.role)),work);
 config.visitConstraints.minutes.Tue=45;const blocked=fitSessions(config,[session]);assert.equal(blocked.feasible,false);assert.deepEqual(blocked.sessions[0].runs[0],run);
});
test('material time-limited mileage reduction remains an explicit endurance review gate',()=>{
 const config=c(['Tue'],0);config.visitConstraints.minutes.Tue=40;
 const fit=fitSessions(config,[{day:'Tue',ex:[],runs:[{role:'easy-run',distanceKm:10,minutes:80,steps:[{label:'Easy run',role:'easy',distanceKm:10,pace:'8:00/km'}]}]}]);
 assert.equal(fit.feasible,true);assert.equal(fit.reviewRequired,true);assert.equal(fit.runningAdjustments.afterKm,5);assert.equal(fit.runningAdjustments.trimmedKm,5);assert.ok(fit.warnings.some(x=>/Review endurance adequacy/.test(x)));
});
test('running priority can reduce beginner straight-set volume while retaining two sets per lift and quality work',()=>{
 const config=c(['Tue'],1,['Tue']);config.priority='Running';config.visitConstraints.minutes.Tue=60;
 const work=[{label:'Rep 1',role:'work',distanceKm:.5,paceSeconds:330,pace:'5:30/km'},{label:'Recovery',role:'recovery',distanceKm:.2,pace:'7:00/km'},{label:'Rep 2',role:'work',distanceKm:.5,paceSeconds:330,pace:'5:30/km'}];
 const run={role:'quality-run',distanceKm:4.2,minutes:30,steps:[{label:'Warm-up',role:'easy',distanceKm:2,pace:'7:00/km'},...work,{label:'Cool-down',role:'easy',distanceKm:1,pace:'7:00/km'}]};
 const ex=['Squat','Bench'].map(n=>[n,3,6,50,7,{role:'straight',category:'primary'}]);
 const result=fitSessions(config,[{day:'Tue',ex,runs:[run]}]);const s=result.sessions[0];assert.equal(result.feasible,true);assert.ok(s.ex.every(e=>e[1]>=2));assert.ok(s.ex.some(e=>e[1]===2));assert.deepEqual(s.runs[0].steps.filter(x=>x.role==='work'),work.filter(x=>x.role==='work'));assert.ok(s.timeBudget.adjustments.some(x=>/straight-set volume/.test(x)));assert.equal(ex[0][1],3);
});
test('explicit unconfirmed event attendance remains blocked even inside an ordinary training window',()=>{
 const config=c(['Sun'],0);config.visitConstraints.minutes.Sun=120;config.visitConstraints.eventDays={'2027-01-10':{confirmed:false,minutes:90}};
 const event={day:'Sunday',eventDate:'2027-01-10',eventType:'running',ex:[],runs:[{distanceKm:10,minutes:60,durationRangeMinutes:{min:55,max:60}}]};
 const held=fitSessions(config,[event]);assert.equal(held.feasible,false);assert.equal(held.sessions[0].eventPermission.confirmed,false);
 config.visitConstraints.eventDays[event.eventDate].confirmed=true;assert.equal(fitSessions(config,[event]).feasible,true);
});
