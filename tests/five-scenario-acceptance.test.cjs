const test=require('node:test'),assert=require('node:assert/strict');
const {audit}=require('../scripts/audit-five-scenarios.cjs');
const clone=x=>JSON.parse(JSON.stringify(x));
const lift=day=>({day,ex:[['Bench',2,3,50,7,{category:'primary'}]],runs:[]});
const run=(day,quality=false)=>({day,ex:[],runs:[{role:quality?'quality-run':'long-run',distanceKm:quality?5:10,minutes:quality?35:75,...(quality?{paceBasis:{goalSupported:false}}:{})}]});
// Deliberately incomplete synthetic captures exercise the evaluator itself.
// They do not assert that the real engine must retain any known defect.
function malformedReport(){
 const expected={A:{runs:3,visits:2,actualRuns:1},B:{runs:3,visits:3,actualRuns:2},C:{runs:3,visits:4,actualRuns:1},D:{runs:2,visits:3,actualRuns:1},E:{runs:3,visits:3,actualRuns:2}};
 return {synthetic:true,provenance:{fixture:'deliberately-malformed-evaluator-unit-test'},cases:Object.entries(expected).map(([id,n])=>{
  const sessions=['Mon','Tue','Fri','Thu'].slice(0,n.visits).map(lift);
  if(n.actualRuns===2)sessions.push(run('Thu',id==='E'));
  sessions.push(run('Sun'));
  if(['C','D'].includes(id))sessions.push({day:'Saturday',eventDate:'2026-11-07',eventType:'strength',ex:[],runs:[]});
  const weeks=[{week:1,phase:'Foundation',feasible:false,unscheduled:[{name:'Run',reason:'Deliberate missing component'}],warnings:id==='E'?['Goal pace is faster than the current performance estimate.']:[],sessions}];
  if(id==='B')weeks.push({week:20,phase:'Event',feasible:false,unscheduled:[],warnings:[],sessions:[{day:'Sunday',eventDate:'2027-03-21',eventType:'running',ex:[],runs:[{role:'race',minutes:135,durationRangeMinutes:{max:135}}]}]});
  return {id,name:'Evaluator fixture '+id,source:{running:{current_runs_per_week:n.runs},availability:{visit_limits_minutes:{Mon:75,Tue:75,Wed:100,Thu:80,Fri:75,Sat:75,Sun:130}}},input:{startDate:'2026-11-02'},programme:{weeks},unsupported:['Whole-visit minute caps and strength duration are unsupported.'],review:{status:'observe'},diagnostic:{historyVersusNoHistoryFirstWeekIdentical:true,targetVersusNoTargetFirstWeekPrescriptionsIdentical:true}};
 })};
}
const gate=(result,id,name)=>result.cases.find(c=>c.id===id).gates.find(g=>g.id===name);
test('evaluator flags missing runs and wrong strength visits in deliberately incomplete calendars',()=>{
 const result=audit(malformedReport());
 assert.equal(result.summary.cases,5);assert.equal(result.summary.passed,0);
 for(const id of 'ABCDE')assert.equal(gate(result,id,'requested-run-frequency').status,'blocked',id);
 for(const id of ['B','C','E'])assert.equal(gate(result,id,'strength-visit-frequency').status,'blocked',id);
 assert.ok(result.cases.every(c=>c.gates.find(g=>g.id==='partial-output-blocked').status==='pass'),'Correct fail-closed behavior is credited separately');
});
test('unsupported minute contract, absent handover and unhandled fatigue are rejected on controlled evidence',()=>{
 const result=audit(malformedReport());
 for(const id of 'ABCDE')assert.equal(gate(result,id,'inclusive-visit-minute-contract').status,'blocked',id);
 assert.equal(gate(result,'C','dated-priority-handover').status,'blocked');
 assert.equal(gate(result,'D','fatigue-evidence-response').status,'blocked');
 assert.equal(gate(result,'B','event-time-window').status,'blocked');
 for(const id of ['C','D'])assert.equal(gate(result,id,'post-strength-event-recovery').status,'blocked');
});
test('pace guard credits prescription invariance and unsupported-goal warning, rather than metadata equality',()=>{
 const fixture=malformedReport(),e=fixture.cases.find(c=>c.id==='E');
 e.diagnostic.targetVersusNoTargetFirstWeekRunsIdentical=false; // legitimate goal metadata difference
 assert.equal(gate(audit(fixture),'E','current-fitness-pace-guard').status,'pass');
 e.diagnostic.targetVersusNoTargetFirstWeekPrescriptionsIdentical=false;
 assert.equal(gate(audit(fixture),'E','current-fitness-pace-guard').status,'blocked');
});
test('evaluator detects tampered feasibility labels while components are still unplaced',()=>{
 const modified=clone(malformedReport());
 for(const row of modified.cases)for(const w of row.programme.weeks)w.feasible=true;
 const findings=audit(modified);
 assert.ok(findings.cases.every(c=>c.gates.find(g=>g.id==='partial-output-blocked').status==='blocked'));
 assert.ok(findings.cases.every(c=>c.gates.find(g=>g.id==='complete-calendar').status==='blocked'));
});
test('positive evidence can clear individual gates without weakening acceptance criteria',()=>{
 const fixture=malformedReport(),c=fixture.cases.find(c=>c.id==='C'),d=fixture.cases.find(c=>c.id==='D');
 c.programme.weeks.push({week:8,phase:'Development',priority:'Squat',feasible:true,unscheduled:[],warnings:[],sessions:[run('Tue'),run('Sun')].map(s=>({...s,runs:s.runs.map(r=>({...r,role:'easy-run'}))}))});
 d.review.status='recovery-review';
 for(const row of fixture.cases){row.unsupported=[];for(const w of row.programme.weeks.slice(0,4))for(const s of w.sessions)if(!s.eventDate)s.timeBudget={includesWarmups:true,includesRest:true,includesTransitions:true,totalMinutes:40};}
 const result=audit(fixture);
 assert.equal(gate(result,'C','dated-priority-handover').status,'pass');
 assert.equal(gate(result,'D','fatigue-evidence-response').status,'pass');
 for(const id of 'ABCDE')assert.equal(gate(result,id,'inclusive-visit-minute-contract').status,'pass');
});
test('separated visits are checked individually and must retain the promised recovery gap',()=>{
 const fixture=malformedReport(),c=fixture.cases.find(c=>c.id==='C');c.unsupported=[];
 c.source.availability.separate_double_days=['Tue'];c.source.availability.separate_double_each_session_minutes=75;c.source.availability.separate_double_minimum_gap_hours=6;
 for(const session of c.programme.weeks[0].sessions)if(!session.eventDate)session.timeBudget={includesWarmups:true,includesRest:true,includesTransitions:true,totalMinutes:40};
 const t=c.programme.weeks[0].sessions.find(s=>s.day==='Tue');t.runs=[{role:'easy-run',minutes:70,distanceKm:8}];
 t.timeBudget={includesWarmups:true,includesRest:true,includesTransitions:true,totalMinutes:130,separate:true,minimumGapHours:6,visits:[{kind:'run',totalMinutes:70},{kind:'strength',totalMinutes:60}]};
 assert.equal(gate(audit(fixture),'C','inclusive-visit-minute-contract').status,'pass');
 t.timeBudget.minimumGapHours=2;
 assert.equal(gate(audit(fixture),'C','inclusive-visit-minute-contract').status,'blocked');
});
test('an unresolved event window is credited only when the native programme specifically blocks it',()=>{
 const fixture=malformedReport(),b=fixture.cases.find(c=>c.id==='B'),week=b.programme.weeks.at(-1),event=week.sessions[0];
 event.constraintIssues=[{kind:'event-time',date:event.eventDate,requiresAthleteInput:true,detail:'Confirm extension beyond the130-minute window.'}];
 let result=audit(fixture);assert.equal(gate(result,'B','event-time-window').status,'pass');assert.ok(result.cases.find(c=>c.id==='B').inputReviews.some(x=>x.kind==='event-time'));
 week.feasible=true;
 assert.equal(gate(audit(fixture),'B','event-time-window').status,'blocked');
});
test('event-only conditional review cannot hide an unrelated blocking coaching issue',()=>{
 const fixture=malformedReport(),b=fixture.cases.find(c=>c.id==='B');
 const first=b.programme.weeks[0];first.feasible=true;first.unscheduled=[];
 const eventWeek=b.programme.weeks.at(-1),event=eventWeek.sessions[0],detail='Confirm the race-time extension before approval.';
 event.constraintIssues=[{kind:'event-time',date:event.eventDate,requiresAthleteInput:true,detail}];
 eventWeek.blockingIssues=[detail,'Quality running exceeds the final scheduled weekly budget.'];
 assert.equal(gate(audit(fixture),'B','complete-calendar').status,'blocked');
 eventWeek.blockingIssues=[detail];
 assert.equal(gate(audit(fixture),'B','complete-calendar').status,'pass');
});
test('explicit uncapped event permission is distinct from a capped training visit',()=>{
 const fixture=malformedReport(),b=fixture.cases.find(c=>c.id==='B'),event=b.programme.weeks.at(-1).sessions[0];
 b.input.visitConstraints={eventDays:{[event.eventDate]:{confirmed:true,minutes:null}}};
 assert.equal(gate(audit(fixture),'B','event-time-window').status,'pass');
 b.input.visitConstraints.eventDays[event.eventDate]={confirmed:false,minutes:null};
 assert.equal(gate(audit(fixture),'B','event-time-window').status,'blocked');
 b.input.visitConstraints.eventDays[event.eventDate]={confirmed:false,minutes:130};
 assert.equal(gate(audit(fixture),'B','event-time-window').status,'blocked');
});
